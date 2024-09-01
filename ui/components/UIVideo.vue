<template>
    <div className="ui-video-wrapper">
        <video
            src=""
            loop="false"
            width="100%"
            height="100%"
            :poster="poster"
            playsinline="true"
            ref="video"
            :controls="controls"
            :muted="muted"
            :style="{ objectFit: objectFit }"
        />
    </div>
</template>

<script>

import { mapState } from 'vuex'
import Hls from 'hls.js'

export default {
    name: 'UIVideo',
    inject: ['$socket', '$dataTracker'],
    props: {
        /* do not remove entries from this - Dashboard's Layout Manager's will pass this data to your component */
        id: { type: String, required: true },
        props: { type: Object, default: () => ({}) },
        state: { type: Object, default: () => ({}) }
    },
    data () {
        return {
            pictureInPictureElementProperty: null,
            fullScreenElementProperty: null,
            isFullScreenProperty: null,
            fullScreenChangeEvent: null,
            presentationModeProperty: null,
            displayingFullscreenProperty: null,
            nativeHlsSupported: false,
            hlsPlayer: null,
            // Status can be 'started', 'stopped', 'paused', 
            playerStatus: 'stopped',
            videoPlaybackProblem: false,
            intersectionObserver: null,
            isVideoIntersecting: false,
            fullScreenChangeEventHandler: null,
            videoElement: null
        }
    },
    computed: {
        // ======================================================================================
        // Don't use computed fields 'url' and autoplay to setup the video element automatically
        // via VueJs binding, because those need to be set programmatically via Hls.js.
        // ======================================================================================
        //TODO is this required?  ...mapState('data', ['messages', 'properties']),
        controls () {
            // When the 'controls' property has value 'hide', the 'controls' attribute should be removed
            // from the video element.  In Vue 3 that can be accomplished by binding the attribute to null.
            // See https://stackoverflow.com/a/64598898 (about conditional attribute rendering).
            if (this.getProperty('controls') == 'show') {
               return true
            }
            else {
               return null
            }
        },
        muted () {
            if (this.getProperty('sound') == 'on') {
               return false
            }
            else {
               return true
            }
        },
        poster () {
            if (this.videoPlaybackProblem === true) {
                return this.getProperty('errorPoster')
            }
            else {
                return this.getProperty('readyPoster')
            }
        },
        objectFit () {
            const resizing = this.getProperty('resizing')

            // Resize the video by setting the CSS object-fit attribute.
            // See image example at https://tympanus.net/codrops/css_reference/object-fit/
            switch (resizing) {
                case 'fit_longest':
                    return 'contain'
                case 'fit_shortest':
                    return 'cover'
                case 'fit_both':
                    return 'fill'
                case 'none':
                    return 'none'
            }
        }
    },
    created () {
        this.$dataTracker(this.id, this.onInput, null, this.onDynamicProperties)
        // let Node-RED know that this widget has loaded
        this.$socket.emit('widget-load', this.id)
    },
    mounted () {
        // TODO is it required to store client-side input messages for this node.  Perhaps only if they have a payload?
        this.$socket.on('widget-load:' + this.id, (msg) => {
            // load the latest message from the Node-RED datastore when this widget is loaded
            // storing it in our vuex store so that we have it saved as we navigate around
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
        })

        // When no url has been specified at startup, then no video playback is possible
        if (!this.getProperty('url')) {
            this.videoPlaybackProblem = true
        }

        // ===========================================================
        // SETUP THE VIDEO ELEMENT
        // ===========================================================

        this.videoElement = this.$refs.video

        this.videoElement.onloadedmetadata = async event => {
            try {
                if (this.getProperty('autoplay') !== false) {
// TODO hls.js has already (below) its own metadata load handler, so only do this here when not playing hls
                    await this.videoElement.play();
                }
            }
            catch (err) {
                this.log('error', `videoElement.play() - ${err.name} - ${err.message}`);
            }
        }

        this.videoElement.onplaying = (event) => {
            this.log('info', 'The video started playing')
            this.playerStatus = 'started'
        }

        this.videoElement.onpause = (event) => {
            this.log('info', 'The video has been paused')
            this.playerStatus = 'paused'
        }

        this.videoElement.onended = (event) => {
            this.log('info', 'The video has been stopped')
            this.playerStatus = 'stopped'
        }

        // Handle video element errors (invalid URL, failed network request, unsupported format, ...)
        this.videoElement.onerror = (event) => {
            // TODO Should we do the same error handling as like in the case of Hls.ErrorTypes.OTHER_ERROR below?
            this.log('error', `Video element error (code ${this.videoElement.error.code}): ${this.videoElement.error.message}`)
        }

        // ===========================================================
        // SOLVE VARIATIONS BETWEEN DIFFERENT BROWSERS
        // ===========================================================

        for (let pictureInPictureElementProperty of ['webkitPictureInPictureElement', 'pictureInPictureElement', 'mozPictureInPictureElement', 'msPictureInPictureElement']) {
            if (pictureInPictureElementProperty in document) {
                this.pictureInPictureElementProperty = pictureInPictureElementProperty
                break
            }
        }

        for (let fullScreenElementProperty of ['webkitCurrentFullScreenElement', 'fullscreenElement', 'mozFullScreenElement', 'msFullscreenElement']) {
            if (fullScreenElementProperty in document) {
                this.fullScreenElementProperty = fullScreenElementProperty
                break
            }
        }
        
        for (let isFullScreenProperty of ['webkitIsFullScreen', 'fullscreen', 'mozFullScreen', 'msFullscreen']) {
            if (isFullScreenProperty in document) {
                this.isFullScreenProperty = isFullScreenProperty
                break
            }
        }

        for (let fullScreenChangeEvent of ['onwebkitfullscreenchange', 'onfullscreenchange', 'onmozfullscreenchange', 'onmsfullscreenchange']) {
            if (fullScreenChangeEvent in document) {
                this.fullScreenChangeEvent = fullScreenChangeEvent
                break
            }
        }
        
        for (let presentationModeProperty of ['webkitPresentationMode', 'presentationMode', 'mozPresentationMode', 'msPresentationMode']) {
            // TODO can we check if the property is inside VideoElement
            if (presentationModeProperty in HTMLVideoElement.prototype) {
                this.presentationModeProperty = presentationModeProperty
                break
            }
        }

        for (let displayingFullscreenProperty of ['webkitDisplayingFullscreen', 'displayingFullscreen', 'mozDisplayingFullscreen', 'msDisplayingFullscreen']) {
            // TODO can we check if the property is inside VideoElement
            if (displayingFullscreenProperty in HTMLVideoElement.prototype) {
                this.displayingFullscreenProperty = displayingFullscreenProperty
                break
            }
        }

        // ===========================================================
        // SETUP HLS
        // ===========================================================

        // When the browser has built-in HLS support, it can play an HLS manifest (i.e. .m3u8 URL) directly
        this.nativeHlsSupported = this.videoElement.canPlayType('application/vnd.apple.mpegurl')

        // It is only needed to setup the Hls.js player, if no native Hls is supported.
        // Or when the user has specified that Hls.js is preferred above native Hls.
        if (!this.nativeHlsSupported || this.getProperty('hlsLibrary') === 'hlsjs') {
            // Hls.js is only supported on platforms that have Media Source Extensions (MSE) enabled
            if (Hls.isSupported()) {
                let hlsConfig = JSON.parse(this.getProperty('hlsConfig') || '{}')
                this.hlsPlayer = new Hls(hlsConfig)

                this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                    let errorType = data.type;
                    let errorDetails = data.details;
                    let errorFatal = data.fatal;

                    switch (errorType) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hlsJsPlayer.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hlsJsPlayer.recoverMediaError()
                            break
                        case Hls.ErrorTypes.OTHER_ERROR:
                        default:
                            this.log('error', 'Hls player error: ' + data.error.message)
                            this.stopLoadingVideo()
                            this.videoPlaybackProblem = true
                    }
                })

                // After hls.loadSource() has been called, following event will be triggered
                this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    this.log('error', 'Manifest loaded, found ' + data.levels.length + ' quality level')

                    if (this.getProperty('autoplay')) {
                        // When autoplay is required, we try to start the video.
                        // But e.g. Chrome doesn't like autoplay when the video is not muted.
                        try {
                            this.videoElement.play()
                        }
                        catch (err) {
                            this.log('error', 'Cannot autoplay via hls.js: ' + err)
                        }
                    }
                })
            }
            else {
                this.log('error', 'Browser does not support HLS')
            }
        }

        // ===========================================================
        // CONTROL STREAMING BASED ON FRONTEND INTERACTIONS
        // ===========================================================

        // Register all the listeners, and determine inside the listeners whether they should do something.  
        // That way it is easier to enable/disable them dynamically via input messages.

        const handleIntersectionChange = data => {
            if (this.getProperty('unloadHiddenVideo')) {
                this.isVideoIntersecting = data[0].length === 1 ? data[0].isIntersecting : data[data.length - 1].isIntersecting
                this.toggleVideoLoading()
            }
        }
        this.intersectionObserver = new IntersectionObserver(handleIntersectionChange, {
            root: null, // A null root means intersections with the browser viewport.  TODO any improvement possible?
            rootMargin: '0px',
            // The threshold is a value between 0 and 1 (while the value on the config screen is a percentage)
            threshold: this.getProperty('intersectionThreshold') / 100
        })
        this.intersectionObserver.observe(this.videoElement)

        this.visibilityChangeEventHandler = () => {
            if (this.getProperty('unloadHiddenVideo')) {
                this.toggleVideoLoading()
            }
        }
        document.addEventListener('visibilitychange', this.visibilityChangeEventHandler)

        const handleFullscreenChange = () => {
            this.toggleVideoLoading()
        }
        if (this.fullScreenChangeEvent) {
            this.fullScreenChangeEventHandler = () => {
                this.toggleVideoLoading()
            }
            document.addEventListener(this.fullScreenChangeEvent, this.fullScreenChangeEventHandler)
        }

        // ===========================================================
        // AUTOPLAY SPECIFIED VIDEO
        // ===========================================================

        // When a video url has been specified in the config screen, it might need to be (auto)played
        this.startLoadingVideo()
    },
    unmounted () {
        // TODO is this still required?
        this.$socket?.off('widget-load:' + this.id)
        this.$socket?.off('msg-input:' + this.id)

        this.hlsPlayer.destroy()

        if (this.fullScreenChangeEvent) {
            document.removeEventListener(this.fullScreenChangeEvent, this.fullScreenChangeEventHandler)
        }

        document.removeEventListener('visibilitychange', this.visibilityChangeEventHandler)
        this.intersectionObserver.unobserve(this.videoElement)

        // This might not be needed...
        this.videoElement.onloadedmetadata = undefined
        this.videoElement.onplaying = undefined
        this.videoElement.onpause = undefined
        this.videoElement.onended = undefined

        this.stopLoadingVideo()

        this.videoPlaybackProblem = false
    },
    methods: {
        onDynamicProperties (msg) {
            const updates = msg.ui_update
            if (!updates) {
                return
            }

            this.updateDynamicProperty('url', updates.url)
            this.updateDynamicProperty('autoplay', updates.autoplay)
            this.updateDynamicProperty('controls', updates.controls)
            this.updateDynamicProperty('sound', updates.sound)
            this.updateDynamicProperty('readyPoster', updates.readyPoster)
            this.updateDynamicProperty('errorPoster', updates.errorPoster)
            this.updateDynamicProperty('unloadHiddenVideo', updates.unloadHiddenVideo)
            this.updateDynamicProperty('intersectionThreshold', updates.intersectionThreshold)
            this.updateDynamicProperty('hlsLibrary', updates.hlsLibrary)
            this.updateDynamicProperty('logType', updates.logType)
            this.updateDynamicProperty('resizing', updates.resizing)
            this.updateDynamicProperty('hlsConfig', updates.hlsConfig)
        },
        send (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        onInput (msg) {
            if (msg.payload === 'unload') {
                this.stopLoadingVideo()
                this.videoPlaybackProblem = false
            } else {
                // The video might need to be (auto)played when a new url has been specified,
                // or when a load request has been specified
                if (msg.ui_update?.url || msg.payload === 'load') {
                    this.stopLoadingVideo()
                    this.videoPlaybackProblem = false
                    try {
                        if (this.getProperty('unloadHiddenVideo')) {
                            // Via (observer and listener) events this node will automatically (un)load
                            // the video when required.  However we need to check the same conditions here,
                            // to deteremine whether the new stream should be loaded or not.
                            this.toggleVideoLoading()
                        } else {
                            this.startLoadingVideo()
                        }
                    } catch (err) {
                        this.log('error', 'Error loading video: ' + err)
                        this.stopLoadingVideo()
                        this.videoPlaybackProblem = true
                    }
                }
            }
        },
        // Load or unload the video based on the current context
        toggleVideoLoading () {
            if (this.shouldstartLoadingVideo() === true) {
                this.startLoadingVideo()
            } else {
                this.stopLoadingVideo()
                this.videoPlaybackProblem = false
            }
        },
        startLoadingVideo () {
            const url = this.getProperty('url')

            // A video can only loaded when an url has been specified (in config screen or dynamically injected)
            if (!url) {
                return
            }

            // Determine on the url how the video should be played
            if (url.endsWith('.m3u8')) {
                // TODO currently we assume that all m3u8 playlist files are only used by HLS
                if (this.nativeHlsSupported && this.getProperty('hlsLibrary') === 'native') {
                    // When the browser supports native HLS, the url can simply be passed to the video element
                    this.videoElement.src = url
                }
                else {
                    // Attach hls.js to the video element
                    this.hlsPlayer.attachMedia(this.videoElement)

                    // When no native HLS is available, pass the url to hls.js
                    // Note: no need to stop the previous stream
                    this.hlsPlayer.loadSource(url)
                }
            }
            else {
                // Seems that a plain video (mp4, webm, ogg, ...)  needs to be displayed
                this.videoElement.src = url
            }

            this.log('error', 'Video loading has been started')

            // The this.videoElement.play() is NOT executed here, but instead in the onMetaDataLoaded event above
        },
        stopLoadingVideo () {
            // Check whether HLS.js is currently attached to the video element (in that case hls.media refers to the video element)
            // TODO what in case of native HLS streaming?
            if (this.hlsPlayer.media) {
                // Ask hls.js to stop streaming
                this.hlsPlayer.stopLoad()

                // Detach hls.js from the video element
                this.hlsPlayer.detachMedia()

                // TODO the original ui-mp4frag node did extra cleanup
                //this.hlsPlayer.destroy()
                //this.hlsPlayer = undefined
            }

            this.videoElement.pause()
            this.videoElement.removeAttribute('src')
            this.videoElement.load()

            this.log('error', 'Video loading has been stopped')
        },
        shouldstartLoadingVideo () {
            const isDocumentVisible = (document.visibilityState === 'visible')

            let isDocumentFullscreen = false
            let isVideoFullscreen = false

            if (typeof this.fullScreenElementProperty !== 'undefined' && typeof this.isFullScreenProperty !== 'undefined') {
                isDocumentFullscreen = (document[this.isFullScreenProperty] === true)
                isVideoFullscreen = (document[this.fullScreenElementProperty] === this.videoElement)
            } else if (typeof this.displayingFullscreenProperty !== 'undefined') {
                isDocumentFullscreen = (this.videoElement[this.displayingFullscreenProperty] === true)
                isVideoFullscreen = (this.videoElement[this.displayingFullscreenProperty] === true)
            }

            const videoPictureInPicture = (typeof this.pictureInPictureElementProperty !== 'undefined' && document[this.pictureInPictureElementProperty] === this.videoElement) ||
                                          (typeof this.presentationModeProperty !== 'undefined' && this.videoElement[this.presentationModeProperty] === 'picture-in-picture')

            return videoPictureInPicture === true || (isDocumentVisible === true && ((isDocumentFullscreen === false && this.isVideoIntersecting === true) || (isDocumentFullscreen === true && isVideoFullscreen === true)))
        },
        log (topic, text) {
            let logType = this.getProperty('logType')
            switch(logType) {
                case 'console':
                    console.log(text)
                    break
                case 'msg':
                    this.send({ payload: text, topic: topic })
                    break
                case 'none':
                    // Do nothing
            }
        }
    }
}
</script>

<style scoped>
/* CSS is auto scoped, but using named classes is still recommended */
.ui-video-wrapper {
    width: 100%;
    height: 100%;
    padding: 10px;
    margin: 10px;
    border: 1px solid black;
}
</style>
