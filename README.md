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
+ Http Live Streaming (HLS) streaming.  Some browsers offer [native](https://caniuse.com/?search=hls) HLS out of the box, and otherwise this node will support it via the [Hls.js](https://github.com/video-dev/hls.js/blob/master/README.md) library.  This includes the playback of fragmented mp4 files (fmp4) via m3u8 playlists.

The following example flow demonstrates how to play mp4 and hls, and how to control the widget via input messages:

![image](https://github.com/user-attachments/assets/6cbb8999-06da-432f-a0ae-319a2084e15d)
```
[{"id":"ebbc2b277dfa801c","type":"inject","z":"4aad778b57d4f47b","name":"Show controls","props":[{"p":"ui_update","v":"{\"controls\":\"show\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":210,"y":4040,"wires":[["2ab14e1f48b2e406"]]},{"id":"b5998ba67a8121b2","type":"inject","z":"4aad778b57d4f47b","name":"Hide controls","props":[{"p":"ui_update","v":"{\"controls\":\"hide\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":210,"y":4080,"wires":[["2ab14e1f48b2e406"]]},{"id":"039360df7b167f73","type":"ui-button","z":"4aad778b57d4f47b","group":"1e2acdd1dfa22bf9","name":"Play button","label":"","order":6,"width":"1","height":"1","emulateClick":false,"tooltip":"","color":"","bgcolor":"","className":"","icon":"play-outline","iconPosition":"left","payload":"load","payloadType":"str","topic":"topic","topicType":"msg","buttonColor":"","textColor":"","iconColor":"","x":210,"y":3880,"wires":[["2ab14e1f48b2e406"]]},{"id":"083b782f42df2228","type":"ui-button","z":"4aad778b57d4f47b","group":"1e2acdd1dfa22bf9","name":"Pause button","label":"","order":5,"width":"1","height":"1","emulateClick":false,"tooltip":"","color":"","bgcolor":"","className":"","icon":"pause","iconPosition":"left","payload":"unload","payloadType":"str","topic":"topic","topicType":"msg","buttonColor":"","textColor":"","iconColor":"","x":210,"y":3920,"wires":[["2ab14e1f48b2e406"]]},{"id":"5baab1ce143d70bb","type":"debug","z":"4aad778b57d4f47b","name":"Player output","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","statusVal":"","statusType":"auto","x":610,"y":3880,"wires":[]},{"id":"2ab14e1f48b2e406","type":"ui-video","z":"4aad778b57d4f47b","name":"","group":"1e2acdd1dfa22bf9","width":0,"height":0,"order":7,"url":"","autoplay":"off","controls":"show","sound":"off","unloadHiddenVideo":"on","intersectionThreshold":"50","readyPoster":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB2aWV3Qm94PSIwIDAgODAwMCA2MDAwIj48dGV4dCBmaWxsPSIjMGYwIiBzdHJva2Utd2lkdGg9IjAiIGR4PSIwIiBkeT0iMCIgZm9udC1mYW1pbHk9IiZxdW90O2UyY3B1d3p4YldsMTo6OlJvYm90byZxdW90OyIgZm9udC1zaXplPSI2MDAiIGZvbnQtd2VpZ2h0PSI3MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKCAxMDExLjI0IDMyMDQuODgpIj48dHNwYW4geT0iMCIgc3Ryb2tlLXdpZHRoPSIwIiBmb250LXdlaWdodD0iNzAwIj48IVtDREFUQVsKVmlkZW8gUGxheWJhY2sgUmVhZHkKXV0+PC90c3Bhbj48L3RleHQ+PC9zdmc+Cg==","errorPoster":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB2aWV3Qm94PSIwIDAgODAwMCA2MDAwIj48dGV4dCBmaWxsPSJyZWQiIHN0cm9rZS13aWR0aD0iMCIgZHg9IjAiIGR5PSIwIiBmb250LWZhbWlseT0iJnF1b3Q7ZW42OXdhSUtnN0MxOjo6Um9ib3RvJnF1b3Q7IiBmb250LXNpemU9IjYwMCIgZm9udC13ZWlnaHQ9IjcwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoIDExODMuOTYgMzIwNC44OCkiPjx0c3BhbiB5PSIwIiBzdHJva2Utd2lkdGg9IjAiIGZvbnQtd2VpZ2h0PSI3MDAiPjwhW0NEQVRBWwpWaWRlbyBQbGF5YmFjayBFcnJvcgpdXT48L3RzcGFuPjwvdGV4dD48L3N2Zz4K","videoConfig":"{\"liveDurationInfinity\":true,\"liveBackBufferLength\":5,\"maxBufferLength\":10,\"manifestLoadingTimeOut\":1000,\"manifestLoadingMaxRetry\":10,\"manifestLoadingRetryDelay\":500}","x":430,"y":3880,"wires":[["5baab1ce143d70bb"]]},{"id":"1643aaec4b02dd64","type":"inject","z":"4aad778b57d4f47b","name":"Sound on","props":[{"p":"ui_update","v":"{\"sound\":\"on\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":220,"y":4120,"wires":[["2ab14e1f48b2e406"]]},{"id":"3fe0163291560743","type":"inject","z":"4aad778b57d4f47b","name":"Sound off","props":[{"p":"ui_update","v":"{\"sound\":\"off\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":220,"y":4160,"wires":[["2ab14e1f48b2e406"]]},{"id":"c326416b965bdf78","type":"inject","z":"4aad778b57d4f47b","name":"Autoplay on","props":[{"p":"ui_update","v":"{\"autoplay\":\"on\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":210,"y":4200,"wires":[["2ab14e1f48b2e406"]]},{"id":"59d80ca5e1d50e6a","type":"inject","z":"4aad778b57d4f47b","name":"Autoplay off","props":[{"p":"ui_update","v":"{\"autoplay\":\"off\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":210,"y":4240,"wires":[["2ab14e1f48b2e406"]]},{"id":"dccbfc95cfbbdc9d","type":"inject","z":"4aad778b57d4f47b","name":"Start mp4 video","props":[{"p":"ui_update","v":"{\"url\":\"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":200,"y":3960,"wires":[["2ab14e1f48b2e406"]]},{"id":"8950d2c01ec29022","type":"inject","z":"4aad778b57d4f47b","name":"Start m3u8 playlist","props":[{"p":"ui_update","v":"{\"url\": \"https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8\"}","vt":"json"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":190,"y":4000,"wires":[["2ab14e1f48b2e406"]]},{"id":"1e2acdd1dfa22bf9","type":"ui-group","name":"Experiments","page":"e06eacf47a88bb87","width":"6","height":"1","order":1,"showTitle":true,"className":"","visible":"true","disabled":"false"},{"id":"e06eacf47a88bb87","type":"ui-page","name":"Alarm","ui":"be29745a6e568f30","path":"/page9","icon":"lock","layout":"grid","theme":"a965ccfef139317a","order":3,"className":"","visible":true,"disabled":false},{"id":"be29745a6e568f30","type":"ui-base","name":"UI Name","path":"/dashboard","includeClientData":true,"acceptsClientConfig":["ui-notification","ui-control","ui-chart","ui-text-input","ui-dropdown"],"showPathInSidebar":false,"titleBarStyle":"default"},{"id":"a965ccfef139317a","type":"ui-theme","name":"Default","colors":{"surface":"#404040","primary":"#109fbc","bgPage":"#e8e8e8","groupBg":"#d6d6d6","groupOutline":"#6fbc10"},"sizes":{"pagePadding":"12px","groupGap":"12px","groupBorderRadius":"4px","widgetGap":"12px"}}]
```

## Node properties

### Url
Link to a video resource (e.g. an mp4 or m3u8 file) which needs to be played.

### Autoplay
When active, the video will automatically start playing when an url has been specified.

Note that e.g. the Chrome browser does not autoplay when the sound is on, because that can be very annoying for users.

### Controls
When active, the controls will be displayed at the bottom of the video:

![image](https://github.com/user-attachments/assets/a0844ddc-58d2-4d78-944c-4e92e66f8ef5)

### Sound
When active, the video will not be muted while playing.

### Hidden
When this option is active, the video data won't be loaded when the video is not visible.  For example when we switch to another dashboard tabsheet.

### Intersection threshold
Specify the percentage of the video that needs to be visible (in the browser viewport), otherwise the video player will stop loading data:

![image](https://github.com/user-attachments/assets/85bfc61c-df78-4154-9206-851a50571708)

Because when the video becomes (partly) hidden by scrolling, it is in most use cases useless to keep streaming video data.

### Ready poster
Image that will be shown inside the video player when the player has been initialized.  If no poster has been specified, the first frame of the video will be displayed.

### Error poster
Image that will be shown inside the video player after a fatal error.  If no poster has been specified, the first frame of the video will be displayed.

### Config
TODO
