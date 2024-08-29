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
            errorOccured: false,
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
        //TODO???  ...mapState('data', ['messages', 'properties']),
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
            if (this.errorOccured === true) {
                return this.getProperty('errorPoster')
            }
            else {
                return this.getProperty('readyPoster')
            }
        }
    },
    created () {
        this.$dataTracker(this.id, this.onInput, null, this.onDynamicProperties)
        // let Node-RED know that this widget has loaded
        this.$socket.emit('widget-load', this.id)
    },
    mounted () {
        // TODO geen messages opslaan
        this.$socket.on('widget-load:' + this.id, (msg) => {
            // load the latest message from the Node-RED datastore when this widget is loaded
            // storing it in our vuex store so that we have it saved as we navigate around
            this.$store.commit('data/bind', {
                widgetId: this.id,
                msg
            })
        })

        // ===========================================================
        // SETUP THE VIDEO ELEMENT
        // ===========================================================

        this.videoElement = this.$refs.video

        this.videoElement.onloadedmetadata = async event => {
            try {
                if (this.getProperty('autoplay') !== false) {
// TODO dit enkel doen indien geen hls.js
                    await this.videoElement.play();
                }
            }
            catch (err) {
                console.log(`videoElement.play() - ${err.name} - ${err.message}`);
            }
        }

        this.videoElement.onplaying = (event) => {
            console.log('The video started playing')
            this.playerStatus = 'started'
        }

        this.videoElement.onpause = (event) => {
            console.log('The video has been paused')
            this.playerStatus = 'paused'
        }

        this.videoElement.onended = (event) => {
            console.log('The video has been stopped')
            this.playerStatus = 'stopped'
        }

        // Handle video element errors (invalid URL, failed network request, unsupported format, ...)
        this.videoElement.onerror = (event) => {
            // TODO Should we do the same error handling as like in the case of Hls.ErrorTypes.OTHER_ERROR below?
            console.log(`Video element error (code ${this.videoElement.error.code}): ${this.videoElement.error.message}`)
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
            // TODO kunnen we videoElement gebruiken?
            if (presentationModeProperty in HTMLVideoElement.prototype) {
                this.presentationModeProperty = presentationModeProperty
                break
            }
        }

        for (let displayingFullscreenProperty of ['webkitDisplayingFullscreen', 'displayingFullscreen', 'mozDisplayingFullscreen', 'msDisplayingFullscreen']) {
            // TODO kunnen we videoElement gebruiken?
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

        // TODO add option to config screen to allow hls.js to override native hls
        // It is only needed to setup the Hls.js player, if no native Hls is supported
        if (!this.nativeHlsSupported) {
            // Hls.js is only supported on platforms that have Media Source Extensions (MSE) enabled
            if (Hls.isSupported()) {
                let hlsConfig = {}
                // TODO use getProperty()
                if (this.props.hlsConfig && this.props.hlsConfig !== '') {
                    hlsConfig = JSON.parse(this.props.hlsConfig)
                }

                this.hlsPlayer = new Hls(hlsConfig)

                this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                    let errorType = data.type;
                    let errorDetails = data.details;
                    let errorFatal = data.fatal;

                    // TODO dit deed Kevin niet, dus misschien overkill?
                    this.send({
                        payload: {
                            errorType: data.type,
                            errorDetails: data.details,
                            errorFatal: data.fatal,
                            errorMessage: data.error.message
                        },
                        topic: 'hls_error'
                    })

                    switch (errorType) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hlsJsPlayer.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hlsJsPlayer.recoverMediaError()
                            break
                        case Hls.ErrorTypes.OTHER_ERROR:
                        default:
                            console.log('Hls player error: ' + data.error.message)
                            this.stopLoadingVideo()
                            this.errorOccured = true
                    }
                })

                // After hls.loadSource() has been called, following event will be triggered
                this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    console.log("Manifest loaded, found " + data.levels.length + " quality level")

                    if (this.getProperty('autoplay')) {
                        // When autoplay is required, we try to start the video.
                        // But e.g. Chrome doesn't like autoplay when the video is not muted.
                        try {
                            this.videoElement.play()
                        }
                        catch (err) {
                            // TODO send error output msg
                            console.log('Cannot autoplay via hls.js: ' + err)
                        }
                    }
                })
            }
            else {
                // TODO send error output msg
                console.log('Browser does not support HLS')
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
        // TODO nog nodig????
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

        this.errorOccured = false
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
        },
        send (msg) {
            this.$socket.emit('widget-action', this.id, msg)
        },
        onInput (msg) {
            if (msg.payload === 'unload') {
                this.stopLoadingVideo()
                this.errorOccured = false
            } else {
                // The video might need to be (auto)played when a new url has been specified,
                // or when a load request has been specified
                if (msg.ui_update?.url || msg.payload === 'load') {
                    this.stopLoadingVideo()
                    this.errorOccured = false
                    try {
                        // TODO moeten we deze if niet moven naar de shouldstartLoadingVideo?
                        if (this.getProperty('unloadHiddenVideo')) {
                            // Via (observer and listener) events this node will automatically (un)load
                            // the video when required.  However we need to check the same conditions here,
                            // to deteremine whether the new stream should be loaded or not.
                            this.toggleVideoLoading()
                        } else {
                            this.startLoadingVideo()
                        }
                    } catch (err) {
                        console.log('Error loading video: ', err)
                        this.stopLoadingVideo()
                        this.errorOccured = true
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
                //TODO setVideoPoster(false)
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
                if (this.nativeHlsSupported) {
                    // When the browser supports native HLS, the url can simply be passed to the video element
                    this.videoElement.src = url
                }
                else {
                // TODO of moeten we dit triggeren vanuit de videoElement.onloadedmetadata (bovenaan)
                    // Attach hls.js to the video element
                    this.hlsPlayer.attachMedia(this.videoElement)

                    // When no native HLS is available, pass the url to hls.js
                    // Note: no need to stop the previous stream
                    this.hlsPlayer.loadSource(url)
                }
            }
            else {
                // Seems that a plain video (mp4, ...)  needs to be displayed
                this.videoElement.src = url
            }

            console.log('Video loading has been started')

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

            console.log('Video loading has been stopped')
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
