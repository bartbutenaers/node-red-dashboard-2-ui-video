# node-red-contrib-2-ui-video
A Node-RED node for playing video in Node-RED VueJs dashboard D2.

This ui node is a successor of the [node-red-ui-mp4frag](https://github.com/kevinGodell/node-red-ui-mp4frag), which [Kevin Godell](https://github.com/kevinGodell) had developed for the original AngularJs Node-RED dashboard.  Some code snippets for this new node have been copied shameless from Kevin's node :yum:.  So lots of credits go to Kevin...

## Install
CAUTION: Currently this node is ***EXPERIMENTAL***.  It is not published on NPM yet, so it need to be installed directly from this Github repo.

Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install bartbutenaers/node-red-dashboard-2-ui-video
```

## Node Usage
This node allows to play:
+ The common video and audio [formats](https://videojs.com/html5-video-support/), like e.g. H264 which is supported by all major browsers.
+ Http Live Streaming (HLS) streaming.  Some browsers offer [native](https://caniuse.com/?search=hls) HLS out of the box, and otherwise this node will support it via the [Hls.js](https://github.com/video-dev/hls.js/blob/master/README.md) library.  This includes the playback of fragmented mp4 files (fmp4) via m3u8 playlists.  See [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/HLS-introduction) wiki page for more information.

See the [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki) for a series of tutorials about this node.

### Example flow - dynamic properties
The following example [flow](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/blob/main/examples/dynamic%20properties.json) demonstrates how to play mp4 and hls, and how to control the widget properties dynamically via input messages:

![image](https://github.com/user-attachments/assets/84309b8a-953b-429c-a079-a4832dac7c93)

### Example flow - control via dashboard buttons
And another example [flow](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/blob/main/examples/control%20via%20dashboard%20buttons.json) demonstrates how to control the video via dashboard buttons:

![image](https://github.com/user-attachments/assets/35304c12-afa0-4425-b450-d47c88dc1b96)

## Node properties

### Class
CSS class name(s) that should be applied to this widget, in order to style the video element.
This property can be overwritten dynamically via `msg.ui_update.class`: see example in [wiki][(https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Styling-the-video-widget).

### Url
Link to a video resource (e.g. an mp4 or m3u8 file) which needs to be played.
This property can be overwritten dynamically via `msg.ui_update.url`.

### Autoplay
When active, the video will automatically start playing when an url has been specified.
This property can be overwritten dynamically via `msg.ui_update.autoplay` (with possible values *'on'* and *'off'*): see example [flow](#example-flow---dynamic-properties).

Note that e.g. the Chrome browser does not autoplay when the sound is on, because that can be very annoying for users.

### Controls
When active, the controls will be displayed at the bottom of the video:
This property can be overwritten dynamically via `msg.ui_update.controls` (with possible values *'show'* and *'hide'*): see example [flow](#example-flow---dynamic-properties).

![image](https://github.com/user-attachments/assets/a0844ddc-58d2-4d78-944c-4e92e66f8ef5)

### Sound
When active, the video will not be muted while playing.
This property can be overwritten dynamically via `msg.ui_update.sound` (with possible values *'on'* and *'off'*): see example [flow](#example-flow---dynamic-properties).

### Hidden
When this option is active, the video data won't be loaded when the video is not visible.  For example when we switch to another dashboard tabsheet.
This property can be overwritten dynamically via `msg.ui_update.unloadHiddenVideo` (with possible values *'on'* and *'off'*): see example [flow](#example-flow---dynamic-properties).

This is explained further in [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Unload-hidden-video) wiki page.

### Intersection threshold
Specify the percentage of the video that needs to be visible (in the browser viewport), otherwise the video player will stop loading data:
This property can be overwritten dynamically via `msg.ui_update.intersectionThreshold` (with possible values numbers between 0 and 100 percent): see example [flow](#example-flow---dynamic-properties).

![image](https://github.com/user-attachments/assets/85bfc61c-df78-4154-9206-851a50571708)

Because when the video becomes (partly) hidden by scrolling, it is in most use cases useless to keep streaming video data.

### Hls library
Specify which Hls library should be used to play m3u8 playlists:
+ *Use native Hls*: use native Hls when offered by the browser.  Note that not much browser support this.
+ *Always use Hls.js*: always use the Hls.js library, even when native Hls is supported.

This property can be overwritten dynamically via `msg.ui_update.hlsLibrary` (with possible values *'native'* and *'hlsjs'*): see example [flow](#example-flow---dynamic-properties).

### Log type
Specify how the ui node should log his information for troubleshooting:
+ *No logging*: no log entries will be written.
+ *Browser console log*: all log entries will be written to the browser console log, where the dashboard is running.
+ *Output messages*: all log entries will be send as messages to the output of this node.  That can be used for troubleshooting e.g. on mobile phones, where the browser console log is difficult to access.

This property can be overwritten dynamically via `msg.ui_update.logType` (with possible values *'none'*, *'console'* and *'msg'*): see example [flow](#example-flow---dynamic-properties).

### Ready poster
Image that will be shown inside the video player when the player has been initialized.  If no poster has been specified, the first frame of the video will be displayed.  See the [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Introduction-to-posters) for more information.
This property can be overwritten dynamically via `msg.ui_update.readyPoster`: see example [flow](#example-flow---dynamic-properties).

See this [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Create-posters-at-runtime) page explains how to create (ready and error) posters at runtime.

### Error poster
Image that will be shown inside the video player after a fatal error.  If no poster has been specified, the first frame of the video will be displayed.  See the [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Introduction-to-posters) for more information.
This property can be overwritten dynamically via `msg.ui_update.errorPoster`: see example [flow](#example-flow---dynamic-properties).

### Resize
Specify how the video will be displayed within the available area.  Because the size of the video will not exactly match the available space.
This property can be overwritten dynamically via `msg.ui_update.resizing` (with possible values *'none'*, *'fit_longest'*, *'fit_shortest'* and *'fit_both'*): see example [flow](#example-flow---dynamic-properties).

See [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Adjustable-resizing) wiki page for more information.

### Hls Config
When the Hls.js library is being used, a lot of [parameters](https://github.com/video-dev/hls.js/blob/master/docs/API.md) can be configured.  The following are the default parameters provided by this node:
+ *liveDurationInfinity*: This setting is set to `true`, to handle live streams with an infinite duration.  Meaning the player won’t stop playing after a certain time.
+ *liveBackBufferLength*: This setting is set to `5` to keep the last 5 seconds of the live stream in the back buffer, allowing for quick rewinds.
+ *maxBufferLength*: This setting is set to `10` to buffer up to 10 seconds of video content ahead of the current playback position.
+ *manifestLoadingTimeOut*: This setting is set to `1000` to have a timeout of 1 second (or 1000 milliseconds) for loading the manifest file.
+ *manifestLoadingMaxRetry*: This setting is set to `10` which is the maximum number of retry attempts for loading the manifest file, if the initial attempt fails
+ *manifestLoadingRetryDelay*: This setting is set to `500`to have a delay of 0.5 seconds (or 500 milliseconds) between retry attempts for loading the manifest file.
