# node-red-contrib-2-ui-video
A Node-RED node for playing video in Node-RED VueJs dashboard D2.

This ui node is a successor of the [node-red-ui-mp4frag](https://github.com/kevinGodell/node-red-ui-mp4frag), which [Kevin Godell](https://github.com/kevinGodell) had developed for the original AngularJs Node-RED dashboard.  Some code snippets for this new node have been copied shameless from Kevin's node :yum:.  So lots of credits go to Kevin...

## Install
CAUTION: Currently this node is ***EXPERIMENTAL***.  It is not published on NPM yet, so it need to be installed directly from this Github repo.

Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install bartbutenaers/node-red-contrib-2-ui-video
```

## Node Usage
This node allows to play:
+ The common video and audio [formats](https://videojs.com/html5-video-support/), like e.g. H264 which is supported by all major browsers.
+ Http Live Streaming (HLS) streaming.  Some browsers offer [native](https://caniuse.com/?search=hls) HLS out of the box, and otherwise this node will support it via the [Hls.js](https://github.com/video-dev/hls.js/blob/master/README.md) library.  This includes the playback of fragmented mp4 files (fmp4) via m3u8 playlists.  See [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/HLS-introduction) wiki page for more information.

The following example flow demonstrates how to play mp4 and hls, and how to control the widget via input messages:

![image](https://github.com/user-attachments/assets/d013aea5-d6f8-4f3e-8edb-bf62c96c5500)
```
[{"id":"c74eba74a4fcfd57","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Show controls","props":[{"p":"ui_update","v":"{\"controls\":\"show\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":370,"y":2220,"wires":[["eb3e68d36ade68b0"]]},{"id":"e31fb80f7ab893f1","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Hide controls","props":[{"p":"ui_update","v":"{\"controls\":\"hide\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":370,"y":2260,"wires":[["eb3e68d36ade68b0"]]},{"id":"eacfb7b79b7ca90f","type":"ui-button","z":"4aad778b57d4f47b","g":"f19d54095282b84c","group":"1e2acdd1dfa22bf9","name":"Play button","label":"","order":5,"width":"1","height":"1","emulateClick":false,"tooltip":"","color":"","bgcolor":"","className":"","icon":"play-outline","iconPosition":"left","payload":"load","payloadType":"str","topic":"topic","topicType":"msg","buttonColor":"","textColor":"","iconColor":"","x":370,"y":2020,"wires":[["eb3e68d36ade68b0"]]},{"id":"e436dc5b8006714d","type":"ui-button","z":"4aad778b57d4f47b","g":"f19d54095282b84c","group":"1e2acdd1dfa22bf9","name":"Pause button","label":"","order":4,"width":"1","height":"1","emulateClick":false,"tooltip":"","color":"","bgcolor":"","className":"","icon":"pause","iconPosition":"left","payload":"unload","payloadType":"str","topic":"topic","topicType":"msg","buttonColor":"","textColor":"","iconColor":"","x":370,"y":2060,"wires":[["eb3e68d36ade68b0"]]},{"id":"5d6defc6ef07bd6b","type":"debug","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Player output","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":770,"y":2020,"wires":[]},{"id":"eb3e68d36ade68b0","type":"ui-video","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"","group":"1e2acdd1dfa22bf9","width":0,"height":0,"order":6,"url":"","autoplay":"off","controls":"show","sound":"off","unloadHiddenVideo":"on","intersectionThreshold":"20","readyPoster":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB2aWV3Qm94PSIwIDAgODAwMCA2MDAwIj48dGV4dCBmaWxsPSIjMGYwIiBzdHJva2Utd2lkdGg9IjAiIGR4PSIwIiBkeT0iMCIgZm9udC1mYW1pbHk9IiZxdW90O2UyY3B1d3p4YldsMTo6OlJvYm90byZxdW90OyIgZm9udC1zaXplPSI2MDAiIGZvbnQtd2VpZ2h0PSI3MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKCAxMDExLjI0IDMyMDQuODgpIj48dHNwYW4geT0iMCIgc3Ryb2tlLXdpZHRoPSIwIiBmb250LXdlaWdodD0iNzAwIj48IVtDREFUQVsKVmlkZW8gUGxheWJhY2sgUmVhZHkKXV0+PC90c3Bhbj48L3RleHQ+PC9zdmc+Cg==","errorPoster":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB2aWV3Qm94PSIwIDAgODAwMCA2MDAwIj48dGV4dCBmaWxsPSJyZWQiIHN0cm9rZS13aWR0aD0iMCIgZHg9IjAiIGR5PSIwIiBmb250LWZhbWlseT0iJnF1b3Q7ZW42OXdhSUtnN0MxOjo6Um9ib3RvJnF1b3Q7IiBmb250LXNpemU9IjYwMCIgZm9udC13ZWlnaHQ9IjcwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoIDExODMuOTYgMzIwNC44OCkiPjx0c3BhbiB5PSIwIiBzdHJva2Utd2lkdGg9IjAiIGZvbnQtd2VpZ2h0PSI3MDAiPjwhW0NEQVRBWwpWaWRlbyBQbGF5YmFjayBFcnJvcgpdXT48L3RzcGFuPjwvdGV4dD48L3N2Zz4K","logType":"msg","hlsLibrary":"native","resizing":"stretch","hlsConfig":"{\r\n    \"liveDurationInfinity\": true,\r\n    \"liveBackBufferLength\": 5,\r\n    \"maxBufferLength\": 10,\r\n    \"manifestLoadingTimeOut\": 1000,\r\n    \"manifestLoadingMaxRetry\": 10,\r\n    \"manifestLoadingRetryDelay\": 500\r\n}","x":590,"y":2020,"wires":[["5d6defc6ef07bd6b"]]},{"id":"d82731f9060fc8fc","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Sound on","props":[{"p":"ui_update","v":"{\"sound\":\"on\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":380,"y":2320,"wires":[["eb3e68d36ade68b0"]]},{"id":"1c16ae262564b558","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Sound off","props":[{"p":"ui_update","v":"{\"sound\":\"off\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":380,"y":2360,"wires":[["eb3e68d36ade68b0"]]},{"id":"3546ba58b40d6b76","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Autoplay on","props":[{"p":"ui_update","v":"{\"autoplay\":\"on\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":370,"y":2420,"wires":[["eb3e68d36ade68b0"]]},{"id":"b6828a5ffd045c5b","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Autoplay off","props":[{"p":"ui_update","v":"{\"autoplay\":\"off\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":370,"y":2460,"wires":[["eb3e68d36ade68b0"]]},{"id":"8f52c1ab90ac340d","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Start mp4 video","props":[{"p":"ui_update","v":"{\"url\":\"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":360,"y":2120,"wires":[["eb3e68d36ade68b0"]]},{"id":"0c2921ba5842179e","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Start m3u8 playlist","props":[{"p":"ui_update","v":"{\"url\": \"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":350,"y":2160,"wires":[["eb3e68d36ade68b0"]]},{"id":"8f01fdedba1664c0","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Intersection threshold 50%","props":[{"p":"ui_update","v":"{\"intersectionThreshold\": 50}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":330,"y":2660,"wires":[["eb3e68d36ade68b0"]]},{"id":"aefe686f97742ea1","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Intersection threshold 10%","props":[{"p":"ui_update","v":"{\"intersectionThreshold\": 10}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":330,"y":2620,"wires":[["eb3e68d36ade68b0"]]},{"id":"98d7069ed5795376","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Unload hidden video on","props":[{"p":"ui_update","v":"{\"unloadHiddenVideo\": \"on\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":340,"y":2520,"wires":[["eb3e68d36ade68b0"]]},{"id":"84d5788f2c3128c3","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Unload hidden video off","props":[{"p":"ui_update","v":"{\"unloadHiddenVideo\": \"off\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":340,"y":2560,"wires":[["eb3e68d36ade68b0"]]},{"id":"5a5fb76f427d1b5d","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Hls native","props":[{"p":"ui_update","v":"{\"hlsLibrary\": \"native\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":380,"y":2720,"wires":[["eb3e68d36ade68b0"]]},{"id":"ab8acc5b3ac0d360","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Hls.js","props":[{"p":"ui_update","v":"{\"hlsLibrary\": \"hlsjs\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":390,"y":2760,"wires":[["eb3e68d36ade68b0"]]},{"id":"06534bf2e89afbbb","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"No log","props":[{"p":"ui_update","v":"{\"logType\": \"none\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":390,"y":2820,"wires":[["eb3e68d36ade68b0"]]},{"id":"57dc21e74974d453","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Log to console","props":[{"p":"ui_update","v":"{\"logType\": \"console\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":360,"y":2860,"wires":[["eb3e68d36ade68b0"]]},{"id":"12ebf70c2cc717de","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Log to output messages","props":[{"p":"ui_update","v":"{\"logType\": \"msg\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":340,"y":2900,"wires":[["eb3e68d36ade68b0"]]},{"id":"73377ffc173f779a","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Fit longest dimension","props":[{"p":"ui_update","v":"{\"resizing\":\"fit_longest\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":340,"y":3000,"wires":[["eb3e68d36ade68b0"]]},{"id":"6320ad7954311719","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Fit shortest dimension","props":[{"p":"ui_update","v":"{\"resizing\":\"fit_shortest\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":340,"y":3040,"wires":[["eb3e68d36ade68b0"]]},{"id":"9f9d36275ad8c0e6","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Fit both dimensions","props":[{"p":"ui_update","v":"{\"resizing\":\"fit_both\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":350,"y":3080,"wires":[["eb3e68d36ade68b0"]]},{"id":"281611a22d080e75","type":"inject","z":"4aad778b57d4f47b","g":"f19d54095282b84c","name":"Don't resize","props":[{"p":"ui_update","v":"{\"resizing\":\"none\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":370,"y":2960,"wires":[["eb3e68d36ade68b0"]]},{"id":"1e2acdd1dfa22bf9","type":"ui-group","name":"Experiments","page":"e06eacf47a88bb87","width":"6","height":"1","order":1,"showTitle":true,"className":"","visible":"true","disabled":"false"},{"id":"e06eacf47a88bb87","type":"ui-page","name":"Alarm","ui":"be29745a6e568f30","path":"/page9","icon":"lock","layout":"grid","theme":"a965ccfef139317a","order":3,"className":"","visible":true,"disabled":false},{"id":"be29745a6e568f30","type":"ui-base","name":"UI Name","path":"/dashboard","includeClientData":true,"acceptsClientConfig":["ui-notification","ui-control","ui-chart","ui-text-input","ui-dropdown"],"showPathInSidebar":false,"titleBarStyle":"default"},{"id":"a965ccfef139317a","type":"ui-theme","name":"Default","colors":{"surface":"#404040","primary":"#109fbc","bgPage":"#e8e8e8","groupBg":"#d6d6d6","groupOutline":"#6fbc10"},"sizes":{"pagePadding":"12px","groupGap":"12px","groupBorderRadius":"4px","widgetGap":"12px"}}]
```

## Node properties

### Url
Link to a video resource (e.g. an mp4 or m3u8 file) which needs to be played.
This property can be overwritten dynamically via `msg.ui_update.url`.

### Autoplay
When active, the video will automatically start playing when an url has been specified.
This property can be overwritten dynamically via `msg.ui_update.autoplay` (with possible values *'on'* and *'off'*).

Note that e.g. the Chrome browser does not autoplay when the sound is on, because that can be very annoying for users.

### Controls
When active, the controls will be displayed at the bottom of the video:
This property can be overwritten dynamically via `msg.ui_update.controls` (with possible values *'show'* and *'hide'*).

![image](https://github.com/user-attachments/assets/a0844ddc-58d2-4d78-944c-4e92e66f8ef5)

### Sound
When active, the video will not be muted while playing.
This property can be overwritten dynamically via `msg.ui_update.sound` (with possible values *'on'* and *'off'*).

### Hidden
When this option is active, the video data won't be loaded when the video is not visible.  For example when we switch to another dashboard tabsheet.
This property can be overwritten dynamically via `msg.ui_update.unloadHiddenVideo` (with possible values *'on'* and *'off'*).

This is explained further in [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Unload-hidden-video) wiki page.

### Intersection threshold
Specify the percentage of the video that needs to be visible (in the browser viewport), otherwise the video player will stop loading data:
This property can be overwritten dynamically via `msg.ui_update.intersectionThreshold` (with possible values numbers between 0 and 100 percent).

![image](https://github.com/user-attachments/assets/85bfc61c-df78-4154-9206-851a50571708)

Because when the video becomes (partly) hidden by scrolling, it is in most use cases useless to keep streaming video data.

### Hls library
Specify which Hls library should be used to play m3u8 playlists:
+ *Use native Hls*: use native Hls when offered by the browser.  Note that not much browser support this.
+ *Always use Hls.js*: always use the Hls.js library, even when native Hls is supported.

This property can be overwritten dynamically via `msg.ui_update.hlsLibrary` (with possible values *'native'* and *'hlsjs'*).

### Log type
Specify how the ui node should log his information for troubleshooting:
+ *No logging*: no log entries will be written.
+ *Browser console log*: all log entries will be written to the browser console log, where the dashboard is running.
+ *Output messages*: all log entries will be send as messages to the output of this node.  That can be used for troubleshooting e.g. on mobile phones, where the browser console log is difficult to access.

This property can be overwritten dynamically via `msg.ui_update.logType` (with possible values *'none'*, *'console'* and *'msg'*).

### Ready poster
Image that will be shown inside the video player when the player has been initialized.  If no poster has been specified, the first frame of the video will be displayed.  See the [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Introduction-to-posters) for more information.

This property can be overwritten dynamically via `msg.ui_update.readyPoster`.

### Error poster
Image that will be shown inside the video player after a fatal error.  If no poster has been specified, the first frame of the video will be displayed.  See the [wiki](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Introduction-to-posters) for more information.

This property can be overwritten dynamically via `msg.ui_update.errorPoster`.

### Resize
Specify how the video will be displayed within the available area.  Because the size of the video will not exactly match the available space.
This property can be overwritten dynamically via `msg.ui_update.resizing` (with possible values *'none'*, *'fit_longest'*, *'fit_shortest'* and *'fit_both'*). 

See [this](https://github.com/bartbutenaers/node-red-dashboard-2-ui-video/wiki/Adjustable-resizing) wiki page for more information.

### Config
TODO
