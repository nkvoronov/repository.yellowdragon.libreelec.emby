define(["browser","require","events","apphost","loading","dom","playbackManager","appRouter","appSettings","connectionManager","htmlMediaHelper"],function(browser,require,events,appHost,loading,dom,playbackManager,appRouter,appSettings,connectionManager,htmlMediaHelper){"use strict";var mediaManager,supportedFeatures;function getMediaStreamSubtitleTracks(mediaSource){return mediaSource.MediaStreams.filter(function(s){return"Subtitle"===s.Type})}function normalizeTrackEventText(text){return text.replace(/\\N/gi,"\n")}function setTracks(elem,tracksHtml){elem.innerHTML=tracksHtml}function getTextTrackUrl(track,item,mediaSource,format){if(window.Windows&&mediaSource.IsLocal&&track.Path)return Windows.Storage.StorageFile.getFileFromPathAsync(track.Path).then(function(file){var trackUrl=URL.createObjectURL(file,{oneTimeOnly:!0});return Promise.resolve(trackUrl)});if(mediaSource.IsLocal&&track.Path)return Promise.resolve(track.Path);var url=playbackManager.getSubtitleUrl(track,item.ServerId);return format&&(url=url.replace(".vtt",format)),Promise.resolve(url)}function HtmlVideoPlayer(){var videoDialog,subtitleTrackIndexToSetOnPlaying,audioTrackIndexToSetOnPlaying,currentClock,currentSubtitlesOctopus,currentAssRenderer;browser.edgeUwp?this.name="Windows Video Player":this.name="Html Video Player",this.type="mediaplayer",this.id="htmlvideoplayer";var videoSubtitlesElem,currentTrackEvents,customTrackIndex=-(this.priority=1),self=this;function setSrcWithHlsJs(instance,elem,options,url){return new Promise(function(resolve,reject){!function(callback){require(["hlsjs"],function(hls){window.Hls=hls,callback()})}(function(){var hls=new Hls({manifestLoadingTimeOut:2e4});hls.loadSource(url),hls.attachMedia(elem),htmlMediaHelper.bindEventsToHlsPlayer(self,hls,elem,onError,resolve,reject),self._hlsPlayer=hls,self._currentSrc=url})})}function onShakaError(event){var error=event.detail;console.error("Error code",error.code,"object",error)}function onEnded(){destroyCustomTrack(this),htmlMediaHelper.onEndedInternal(self,this,onError)}function onTimeUpdate(e){var time=this.currentTime;time&&!self._timeUpdated&&(self._timeUpdated=!0,function(elem){if(elem!==self._mediaElement)return;if(0===elem.videoWidth&&0===elem.videoHeight){var mediaSource=(self._currentPlayOptions||{}).mediaSource;if(!mediaSource||mediaSource.RunTimeTicks)htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")}}(this)),self._currentTime=time;var currentPlayOptions=self._currentPlayOptions;if(currentPlayOptions){var timeMs=1e3*time;(function(timeMs){var clock=currentClock;if(clock){try{clock.seek(timeMs/1e3)}catch(err){console.log("Error in libjass: "+err)}return}var trackEvents=currentTrackEvents,subtitleTextElement=videoSubtitlesElem;if(trackEvents&&subtitleTextElement){for(var selectedTrackEvent,ticks=1e4*timeMs,i=0;i<trackEvents.length;i++){var currentTrackEvent=trackEvents[i];if(currentTrackEvent.StartPositionTicks<=ticks&&currentTrackEvent.EndPositionTicks>=ticks){selectedTrackEvent=currentTrackEvent;break}}selectedTrackEvent&&selectedTrackEvent.Text?(subtitleTextElement.innerHTML=normalizeTrackEventText(selectedTrackEvent.Text),subtitleTextElement.classList.remove("hide")):subtitleTextElement.classList.add("hide")}})(timeMs+=(currentPlayOptions.transcodingOffsetTicks||0)/1e4)}events.trigger(self,"timeupdate")}function onVolumeChange(){htmlMediaHelper.saveVolume(this.volume),events.trigger(self,"volumechange")}function onNavigatedToOsd(){var dlg=videoDialog;dlg&&(dlg.classList.remove("videoPlayerContainer-withBackdrop"),dlg.classList.remove("videoPlayerContainer-onTop"),onStartedAndNavigatedToOsd())}function onStartedAndNavigatedToOsd(){subtitleTrackIndexToSetOnPlaying&&setTimeout(function(){setCurrentTrackElement(subtitleTrackIndexToSetOnPlaying)},300),null!=audioTrackIndexToSetOnPlaying&&self.canSetAudioStreamIndex()&&self.setAudioStreamIndex(audioTrackIndexToSetOnPlaying)}function onPlaying(e){self._started||(self._started=!0,this.removeAttribute("controls"),loading.hide(),htmlMediaHelper.seekOnPlaybackStart(self,e.target,self._currentPlayOptions.playerStartPositionTicks),self._currentPlayOptions.fullscreen?appRouter.showVideoOsd().then(onNavigatedToOsd):(appRouter.setTransparency("backdrop"),videoDialog.classList.remove("videoPlayerContainer-withBackdrop"),videoDialog.classList.remove("videoPlayerContainer-onTop"),onStartedAndNavigatedToOsd())),events.trigger(self,"playing")}function onPlay(e){events.trigger(self,"unpause")}function onClick(){events.trigger(self,"click")}function onDblClick(){events.trigger(self,"dblclick")}function onPause(){events.trigger(self,"pause")}function onError(){var type,errorCode=this.error&&this.error.code||0,errorMessage=this.error&&this.error.message||"";switch(console.log("Media element error: "+errorCode.toString()+" "+errorMessage),errorCode){case 1:return;case 2:type="network";break;case 3:if(self._hlsPlayer)return void htmlMediaHelper.handleHlsJsMediaError(self);type="mediadecodeerror";break;case 4:type="medianotsupported";break;default:return}htmlMediaHelper.onErrorInternal(self,type)}function destroyCustomTrack(videoElement){if(self._resizeObserver&&(self._resizeObserver.disconnect(),self._resizeObserver=null),videoSubtitlesElem){var subtitlesContainer=videoSubtitlesElem.parentNode;subtitlesContainer&&function(elem){var parentNode=elem.parentNode;if(parentNode)try{parentNode.removeChild(elem)}catch(err){console.log("Error removing dialog element: "+err)}}(subtitlesContainer),videoSubtitlesElem=null}if(currentTrackEvents=null,videoElement)for(var allTracks=videoElement.textTracks||[],i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];-1!==currentTrack.label.indexOf("manualTrack")&&(currentTrack.mode="disabled")}customTrackIndex=-1,currentClock=null,self._currentAspectRatio=null;currentSubtitlesOctopus&&currentSubtitlesOctopus.dispose(),currentSubtitlesOctopus=null;currentAssRenderer&&currentAssRenderer.setEnabled(!1),currentAssRenderer=null}function fetchSubtitles(track,item){return new Promise(function(resolve,reject){var xhr=new XMLHttpRequest;getTextTrackUrl(track,item,".js").then(function(url){xhr.open("GET",url,!0),xhr.onload=function(e){resolve(JSON.parse(this.response))},xhr.onerror=reject,xhr.send()})})}function setTrackForCustomDisplay(videoElement,track){if(track){if(customTrackIndex!==track.Index){var currentPlayOptions=self._currentPlayOptions,item=currentPlayOptions.item,mediaSource=currentPlayOptions.mediaSource;destroyCustomTrack(videoElement),customTrackIndex=track.Index,function(videoElement,track,item,mediaSource){if(!mediaSource.IsLocal||track.IsExternal){var format=(track.Codec||"").toLowerCase();if("ssa"===format||"ass"===format)return function(videoElement,track,item,mediaSource){if(window.Worker&&function(){var elem=document.createElement("canvas");return!(!elem.getContext||!elem.getContext("2d"))}()&&11<=(browser.iOSVersion||11)&&!browser.edgeUwp){if(!requiresExternalFontDownload(track)||browser.edgeUwp)return renderWithSubtitlesOctopus(videoElement,track,item,mediaSource);if((connectionManager.getApiClient(item.ServerId).getSavedEndpointInfo()||{}).IsInNetwork&&!browser.mobile&&!browser.tv)return renderWithSubtitlesOctopus(videoElement,track,item,mediaSource)}!function(videoElement,track,item,mediaSource){var rendererSettings={enableSvg:!1};require(["libjass"],function(libjass){getTextTrackUrl(track,item,mediaSource).then(function(textTrackUrl){libjass.ASS.fromUrl(textTrackUrl).then(function(ass){var clock=new libjass.renderers.ManualClock;currentClock=clock;var renderer=new libjass.renderers.WebRenderer(ass,clock,videoElement.parentNode,rendererSettings);(currentAssRenderer=renderer).addEventListener("ready",function(){try{renderer.resize(videoElement.offsetWidth,videoElement.offsetHeight,0,0),self._resizeObserver||(self._resizeObserver=new ResizeObserver(onVideoResize,{}),self._resizeObserver.observe(videoElement))}catch(ex){}})},function(){htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")})})})}(videoElement,track,item,mediaSource)}(videoElement,track,item,mediaSource)}if(function(){if(browser.ps4)return!0;if(browser.firefox)return!0;if(browser.web0s&&browser.sdkVersion&&browser.sdkVersion<3)return!0;if(browser.iOS){var userAgent=navigator.userAgent.toLowerCase();if((-1!==userAgent.indexOf("os 9")||-1!==userAgent.indexOf("os 8"))&&-1===userAgent.indexOf("safari"))return!0}return!1}())return function(videoElement,track,item){fetchSubtitles(track,item).then(function(data){if(!videoSubtitlesElem){var subtitlesContainer=document.createElement("div");subtitlesContainer.classList.add("videoSubtitles"),subtitlesContainer.innerHTML='<div class="videoSubtitlesInner"></div>',videoSubtitlesElem=subtitlesContainer.querySelector(".videoSubtitlesInner"),function(elem,innerElem){require(["userSettings","subtitleAppearanceHelper"],function(userSettings,subtitleAppearanceHelper){subtitleAppearanceHelper.applyStyles({text:innerElem,window:elem},userSettings.getSubtitleAppearanceSettings())})}(subtitlesContainer,videoSubtitlesElem),videoElement.parentNode.appendChild(subtitlesContainer),currentTrackEvents=data.TrackEvents}})}(videoElement,track,item);for(var trackElement=null,expectedId="manualTrack"+track.Index,allTracks=videoElement.textTracks,i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];if(currentTrack.label===expectedId){trackElement=currentTrack;break}currentTrack.mode="disabled"}trackElement?trackElement.mode="showing":(trackElement=videoElement.addTextTrack("subtitles","manualTrack"+track.Index,track.Language||"und"),fetchSubtitles(track,item).then(function(data){console.log("downloaded "+data.TrackEvents.length+" track events"),data.TrackEvents.forEach(function(trackEvent){var cue=new(window.VTTCue||window.TextTrackCue)(trackEvent.StartPositionTicks/1e7,trackEvent.EndPositionTicks/1e7,normalizeTrackEventText(trackEvent.Text));trackElement.addCue(cue)}),trackElement.mode="showing"}))}(videoElement,track,item,mediaSource)}}else destroyCustomTrack(videoElement)}function renderWithSubtitlesOctopus(videoElement,track,item,mediaSource){require(["SubtitlesOctopus"],function(){getTextTrackUrl(track,item,mediaSource).then(function(textTrackUrl){currentSubtitlesOctopus=new SubtitlesOctopus({video:videoElement,subUrl:textTrackUrl,workerUrl:appRouter.baseUrl()+"/bower_components/javascriptsubtitlesoctopus/dist/subtitles-octopus-worker.js",fonts:requiresExternalFontDownload(track)?[appRouter.baseUrl()+"/bower_components/javascriptsubtitlesoctopus/dist/subfont.ttf"]:[],onError:function(){htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")}})})})}function onVideoResize(){browser.iOS?setTimeout(resetVideoRendererSize,500):resetVideoRendererSize()}function resetVideoRendererSize(){var renderer=currentAssRenderer;if(renderer){var videoElement=self._mediaElement,width=videoElement.offsetWidth,height=videoElement.offsetHeight;console.log("videoElement resized: "+width+"x"+height),renderer.resize(width,height,0,0)}}function requiresExternalFontDownload(track){var language=(track.Language||"").toLowerCase();return-1===["dut","eng","fin","fre","ger","heb","hun","ita","nor","pol","por","rus","spa","swe"].indexOf(language)}function setCurrentTrackElement(streamIndex){var currentPlayOptions=self._currentPlayOptions,mediaSource=currentPlayOptions.mediaSource;if(browser.web0s&&browser.sdkVersion&&browser.sdkVersion<3){var playMethod=currentPlayOptions.playMethod;"DirectStream"!==playMethod&&"DirectPlay"!==playMethod||"mkv"===mediaSource.Container&&(streamIndex=-1)}console.log("Setting new text track index to: "+streamIndex);var mediaStreamTextTracks=getMediaStreamSubtitleTracks(mediaSource),track=-1===streamIndex?null:mediaStreamTextTracks.filter(function(t){return t.Index===streamIndex})[0];!function(currentSrc,track){if(track){if("Embed"===track.DeliveryMethod)return!0;if("Hls"===track.DeliveryMethod)return!0}if(browser.firefox&&-1!==(currentSrc||"").toLowerCase().indexOf(".m3u8"))return!1;if(browser.chromecast&&-1!==(currentSrc||"").toLowerCase().indexOf(".m3u8"))return!1;if(browser.ps4)return!1;if(browser.web0s&&browser.sdkVersion&&browser.sdkVersion<3)return!1;if(browser.iOS&&(browser.iOSVersion||10)<10)return!1;if(track){var format=(track.Codec||"").toLowerCase();if("ssa"===format||"ass"===format)return!1}return!0}(self._currentSrc,track)?(setTrackForCustomDisplay(self._mediaElement,track),streamIndex=-1,track=null):(setTrackForCustomDisplay(self._mediaElement,null),-1!==streamIndex&&require(["userSettings","subtitleAppearanceHelper"],function(userSettings,subtitleAppearanceHelper){var elementId=self.id+"-cuestyle",styleElem=document.querySelector("#"+elementId);styleElem||((styleElem=document.createElement("style")).id=elementId,styleElem.type="text/css",document.getElementsByTagName("head")[0].appendChild(styleElem)),styleElem.innerHTML=function(appearance,selector){var html=selector+"::cue {";return html+=appearance.text.map(function(s){return s.name+":"+s.value+" !important;"}).join(""),html+="}"}(subtitleAppearanceHelper.getStyles(userSettings.getSubtitleAppearanceSettings(),!0),".htmlvideoplayer")}));for(var targetIndex=-1,expectedId="textTrack"+streamIndex,elemTextTracks=self._mediaElement.textTracks,i=0;i<elemTextTracks.length;i++){var tt=elemTextTracks[i];tt.id===expectedId&&(targetIndex=i),tt.mode="disabled"}targetIndex<0&&(mediaStreamTextTracks=mediaStreamTextTracks.filter(function(s){return s.IsTextSubtitleStream&&"ass"!==s.Codec&&"ssa"!==s.Codec}),track&&"Hls"===track.DeliveryMethod?targetIndex=mediaStreamTextTracks.indexOf(track):(browser.msie||browser.edge)&&(targetIndex=-1!==streamIndex&&track?mediaStreamTextTracks.indexOf(track):-1)),0<=targetIndex&&targetIndex<elemTextTracks.length&&(elemTextTracks[targetIndex].mode="showing")}self.currentSrc=function(){return self._currentSrc},self.play=function(options){return browser.msie&&"Transcode"===options.playMethod&&!window.MediaSource?(window.alert("Playback of this content is not supported in Internet Explorer. For a better experience, try a modern browser such as Microsoft Edge, Google Chrome, Firefox or Opera."),Promise.reject()):(self._started=!1,self._timeUpdated=!1,self._currentTime=null,function(options){(browser.tv||browser.iOS||browser.mobile)&&(options.backdropUrl=null);return new Promise(function(resolve,reject){var dlg=document.querySelector(".videoPlayerContainer");dlg?(options.backdropUrl&&(dlg.classList.add("videoPlayerContainer-withBackdrop"),dlg.style.backgroundImage="url('"+options.backdropUrl+"')"),resolve(dlg.querySelector("video"))):require(["css!./style"],function(){loading.show(),(dlg=document.createElement("div")).classList.add("videoPlayerContainer"),options.backdropUrl&&(dlg.classList.add("videoPlayerContainer-withBackdrop"),dlg.style.backgroundImage="url('"+options.backdropUrl+"')"),options.fullscreen&&dlg.classList.add("videoPlayerContainer-onTop");var html="",cssClass="htmlvideoplayer";(browser.edge||browser.msie)&&(cssClass+=" htmlvideoplayer-edge"),appHost.supports("htmlvideoautoplay")?html+='<video class="'+cssClass+'" preload="metadata" autoplay="autoplay" webkit-playsinline playsinline>':html+='<video class="'+cssClass+'" preload="metadata" autoplay="autoplay" controls="controls" webkit-playsinline playsinline>',html+="</video>",dlg.innerHTML=html;var videoElement=dlg.querySelector("video");videoElement.volume=htmlMediaHelper.getSavedVolume(),videoElement.addEventListener("timeupdate",onTimeUpdate),videoElement.addEventListener("ended",onEnded),videoElement.addEventListener("volumechange",onVolumeChange),videoElement.addEventListener("pause",onPause),videoElement.addEventListener("playing",onPlaying),videoElement.addEventListener("play",onPlay),videoElement.addEventListener("click",onClick),videoElement.addEventListener("dblclick",onDblClick),document.body.insertBefore(dlg,document.body.firstChild),videoDialog=dlg,self._mediaElement=videoElement,mediaManager&&(mediaManager.embyInit||(mediaManager.defaultOnLoad=mediaManager.onLoad.bind(mediaManager),mediaManager.onLoad=function(event){var data=event.data,media=data.media,val=media.contentId,options=media.customData.options,hasHlsTextTracks=media.customData.hasHlsTextTracks,tracksHtml=media.customData.tracksHtml,elem=self._mediaElement;if(-1!==val.indexOf(".m3u8")){if(options.mediaSource.RunTimeTicks){setTracks(elem,tracksHtml),self._castPlayer&&self._castPlayer.unload(),self._castPlayer=null;var protocol,contentType=media.contentType.toLowerCase(),host=new cast.player.api.Host({url:val,mediaElement:elem});return protocol=cast.player.api.CreateHlsStreamingProtocol(host),console.log("loading playback url: "+val),console.log("contentType: "+contentType),host.onError=function(errorCode){console.log("Fatal Error - "+errorCode)},elem.autoplay=!1,self._castPlayer=new cast.player.api.Player(host),self._castPlayer.load(protocol,data.currentTime||0),void self._castPlayer.playWhenHaveEnoughData()}if(htmlMediaHelper.enableHlsJsPlayer(options.mediaSource.RunTimeTicks,"Video",hasHlsTextTracks)&&-1!==val.indexOf(".m3u8"))return hasHlsTextTracks||setTracks(elem,tracksHtml),setSrcWithHlsJs(self,elem,options,val)}return elem.autoplay=!0,htmlMediaHelper.applySrc(elem,val,options).then(function(){return setTracks(elem,tracksHtml),self._currentSrc=val,htmlMediaHelper.playWithPromise(elem,onError)})}.bind(self),mediaManager.onError=function(event){console.log("media manager onError: "+event),setTimeout(function(){htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")},1e3)}.bind(self),mediaManager.defaultOnStop=mediaManager.onStop.bind(mediaManager),mediaManager.onStop=function(event){playbackManager.stop(),mediaManager.defaultOnStop(event)},mediaManager.embyInit=!0),mediaManager.setMediaElement(videoElement)),options.fullscreen&&browser.supportsCssAnimation()&&!browser.slow?function(elem){return new Promise(function(resolve,reject){elem.style.animation="htmlvideoplayer-zoomin 240ms ease-in normal",dom.addEventListener(elem,dom.whichAnimationEvent(),resolve,{once:!0})})}(dlg).then(function(){resolve(videoElement)}):resolve(videoElement)})})}(options).then(function(elem){return function(streamInfo){var isHls=-1!==streamInfo.url.toLowerCase().indexOf(".m3u8"),mediaSource=streamInfo.mediaSource,item=streamInfo.item;if(mediaSource&&item&&!mediaSource.RunTimeTicks&&isHls&&"Transcode"===streamInfo.playMethod&&(browser.iOS||browser.osx)){var hlsPlaylistUrl=streamInfo.url.replace("master.m3u8","live.m3u8");return loading.show(),console.log("prefetching hls playlist: "+hlsPlaylistUrl),connectionManager.getApiClient(item.ServerId).ajax({type:"GET",url:hlsPlaylistUrl}).then(function(){return console.log("completed prefetching hls playlist: "+hlsPlaylistUrl),loading.hide(),streamInfo.url=hlsPlaylistUrl,Promise.resolve()},function(){return console.log("error prefetching hls playlist: "+hlsPlaylistUrl),loading.hide(),Promise.resolve()})}return Promise.resolve()}(options,options.mediaSource).then(function(){return function(elem,options){elem.removeEventListener("error",onError);var val=options.url;console.log("playing url: "+val);var seconds=(options.playerStartPositionTicks||0)/1e7;seconds&&(val+="#t="+seconds);htmlMediaHelper.destroyHlsPlayer(self),htmlMediaHelper.destroyFlvPlayer(self),htmlMediaHelper.destroyCastPlayer(self);var tracks=getMediaStreamSubtitleTracks(options.mediaSource);if(null!=(subtitleTrackIndexToSetOnPlaying=null==options.mediaSource.DefaultSubtitleStreamIndex?-1:options.mediaSource.DefaultSubtitleStreamIndex)&&0<=subtitleTrackIndexToSetOnPlaying){var initialSubtitleStream=options.mediaSource.MediaStreams[subtitleTrackIndexToSetOnPlaying];initialSubtitleStream&&"Encode"!==initialSubtitleStream.DeliveryMethod||(subtitleTrackIndexToSetOnPlaying=-1)}audioTrackIndexToSetOnPlaying="Transcode"===options.playMethod?null:options.mediaSource.DefaultAudioStreamIndex,self._currentPlayOptions=options;var crossOrigin=htmlMediaHelper.getCrossOriginValue(options.mediaSource,options.playMethod);crossOrigin&&(elem.crossOrigin=crossOrigin);var hasHlsTextTracks=function(tracks){return 0<tracks.filter(function(t){return"Hls"===t.DeliveryMethod}).length}(tracks=tracks.filter(function(s){return s.IsTextSubtitleStream&&"ass"!==s.Codec&&"ssa"!==s.Codec}));return function(tracks,item,mediaSource){var trackPromises=tracks.map(function(t){return"External"!==t.DeliveryMethod?Promise.resolve(""):getTextTrackUrl(t,item,mediaSource).then(function(textTrackUrl){var defaultAttribute=mediaSource.DefaultSubtitleStreamIndex===t.Index?" default":"",language=t.Language||"und",label=t.Language||"und";return'<track id="textTrack'+t.Index+'" label="'+label+'" kind="subtitles" src="'+textTrackUrl+'" srclang="'+language+'"'+defaultAttribute+" />\n"})});return Promise.all(trackPromises).then(function(trackTags){return trackTags.join("")})}(tracks,options.item,options.mediaSource).then(function(tracksHtml){return htmlMediaHelper.enableHlsShakaPlayer(options.mediaSource.RunTimeTicks,"Video")&&-1!==val.indexOf(".m3u8")?(setTracks(elem,tracksHtml),function(instance,elem,options,url){return new Promise(function(resolve,reject){require(["shaka"],function(){var player=new shaka.Player(elem);player.addEventListener("error",onShakaError),player.load(url).then(resolve,reject),self._shakaPlayer=player,self._currentSrc=url})})}(0,elem,0,val)):browser.chromecast?function(instance,elem,options,url,hasHlsTextTracks,tracksHtml){elem.autoplay=!0;var lrd=new cast.receiver.MediaManager.LoadRequestData;lrd.currentTime=(options.playerStartPositionTicks||0)/1e7,lrd.autoplay=!0,lrd.media=new cast.receiver.media.MediaInformation,lrd.media.contentId=url,lrd.media.contentType=options.mimeType,lrd.media.streamType=cast.receiver.media.StreamType.OTHER,lrd.media.customData={options:options,hasHlsTextTracks:hasHlsTextTracks,tracksHtml:tracksHtml},console.log("loading media url into mediaManager");try{return mediaManager.load(lrd),self._currentSrc=url,Promise.resolve()}catch(err){return console.log("mediaManager error: "+err),Promise.reject()}}(0,elem,options,val,hasHlsTextTracks,tracksHtml):htmlMediaHelper.enableHlsJsPlayer(options.mediaSource.RunTimeTicks,"Video",hasHlsTextTracks)&&-1!==val.indexOf(".m3u8")?(hasHlsTextTracks||setTracks(elem,tracksHtml),setSrcWithHlsJs(self,elem,options,val)):"Transcode"!==options.playMethod&&"flv"===options.mediaSource.Container?(setTracks(elem,tracksHtml),function(instance,elem,options,url){return new Promise(function(resolve,reject){require(["flvjs"],function(flvjs){var flvPlayer=flvjs.createPlayer({type:"flv",url:url},{seekType:"range"});flvPlayer.attachMediaElement(elem),flvPlayer.load(),flvPlayer.play().then(resolve,reject),instance._flvPlayer=flvPlayer,self._currentSrc=url})})}(self,elem,0,val)):(elem.autoplay=!0,htmlMediaHelper.applySrc(elem,val,options).then(function(){return setTracks(elem,tracksHtml),self._currentSrc=val,htmlMediaHelper.playWithPromise(elem,onError)}))})}(elem,options)})}))},self.setSubtitleStreamIndex=function(index){setCurrentTrackElement(index)},self.setAudioStreamIndex=function(index){var streams=function(){var profile=self._lastProfile,mediaSource=self._currentPlayOptions.mediaSource;return function(mediaSource){return mediaSource.MediaStreams.filter(function(s){return"Audio"===s.Type})}(mediaSource).filter(function(stream){return playbackManager.isAudioStreamSupported(stream,mediaSource,profile)})}();if(!(streams.length<2)){var i,length,audioIndex=-1;for(i=0,length=streams.length;i<length&&(audioIndex++,streams[i].Index!==index);i++);if(-1!==audioIndex){var elem=self._mediaElement;if(elem){var elemAudioTracks=elem.audioTracks||[];if(!(elemAudioTracks.length<2)){for(console.log("found "+elemAudioTracks.length+" audio tracks"),i=0,length=elemAudioTracks.length;i<length;i++)audioIndex===i?(console.log("setting audio track "+i+" to enabled"),elemAudioTracks[i].enabled=!0):(console.log("setting audio track "+i+" to disabled"),elemAudioTracks[i].enabled=!1);setTimeout(function(){elem.currentTime=elem.currentTime},100)}}}}},self.stop=function(destroyPlayer){var elem=self._mediaElement,src=self._currentSrc;return elem&&(src&&elem.pause(),htmlMediaHelper.onEndedInternal(self,elem,onError),destroyPlayer&&self.destroy()),destroyCustomTrack(elem),Promise.resolve()},self.destroy=function(){htmlMediaHelper.destroyHlsPlayer(self),htmlMediaHelper.destroyFlvPlayer(self),appRouter.setTransparency("none");var videoElement=self._mediaElement;videoElement&&(self._mediaElement=null,destroyCustomTrack(videoElement),videoElement.removeEventListener("timeupdate",onTimeUpdate),videoElement.removeEventListener("ended",onEnded),videoElement.removeEventListener("volumechange",onVolumeChange),videoElement.removeEventListener("pause",onPause),videoElement.removeEventListener("playing",onPlaying),videoElement.removeEventListener("play",onPlay),videoElement.removeEventListener("click",onClick),videoElement.removeEventListener("dblclick",onDblClick),videoElement.parentNode.removeChild(videoElement));var dlg=videoDialog;dlg&&(videoDialog=null,dlg.parentNode.removeChild(dlg))},self.destroyCustomTrack=destroyCustomTrack}function onPictureInPictureError(err){console.log("Picture in picture error: "+err.toString())}return HtmlVideoPlayer.prototype.canPlayMediaType=function(mediaType){return"video"===(mediaType||"").toLowerCase()},HtmlVideoPlayer.prototype.supportsPlayMethod=function(playMethod,item){return!appHost.supportsPlayMethod||appHost.supportsPlayMethod(playMethod,item)},HtmlVideoPlayer.prototype.getDeviceProfile=function(item,options){return htmlMediaHelper.getDeviceProfile(this,appHost,item,options)},HtmlVideoPlayer.prototype.supports=function(feature){return-1!==(supportedFeatures=supportedFeatures||function(){var list=[],video=document.createElement("video");return video.webkitSupportsPresentationMode&&"function"==typeof video.webkitSetPresentationMode&&(browser.ipad&&-1!==navigator.userAgent.toLowerCase().indexOf("os 9")||list.push("PictureInPicture")),document.pictureInPictureEnabled?list.push("PictureInPicture"):window.Windows&&Windows.UI.ViewManagement.ApplicationView.getForCurrentView().isViewModeSupported(Windows.UI.ViewManagement.ApplicationViewMode.compactOverlay)&&list.push("PictureInPicture"),list.push("SetBrightness"),list}()).indexOf(feature)},HtmlVideoPlayer.prototype.currentTime=function(val){var mediaElement=this._mediaElement;if(mediaElement){if(null!=val)return void(mediaElement.currentTime=val/1e3);var currentTime=this._currentTime;return currentTime?1e3*currentTime:1e3*(mediaElement.currentTime||0)}},HtmlVideoPlayer.prototype.duration=function(val){var mediaElement=this._mediaElement;if(mediaElement){var duration=mediaElement.duration;if(htmlMediaHelper.isValidDuration(duration))return 1e3*duration}return null},HtmlVideoPlayer.prototype.canSetAudioStreamIndex=function(index){if(browser.tizen||browser.orsay)return!0;var video=this._mediaElement;return!(!video||!video.audioTracks)},HtmlVideoPlayer.prototype.setPictureInPictureEnabled=function(isEnabled){var video=this._mediaElement;document.pictureInPictureEnabled?video&&(isEnabled?video.requestPictureInPicture().catch(onPictureInPictureError):document.exitPictureInPicture().catch(onPictureInPictureError)):window.Windows?(this.isPip=isEnabled)?Windows.UI.ViewManagement.ApplicationView.getForCurrentView().tryEnterViewModeAsync(Windows.UI.ViewManagement.ApplicationViewMode.compactOverlay):Windows.UI.ViewManagement.ApplicationView.getForCurrentView().tryEnterViewModeAsync(Windows.UI.ViewManagement.ApplicationViewMode.default):video&&video.webkitSupportsPresentationMode&&"function"==typeof video.webkitSetPresentationMode&&video.webkitSetPresentationMode(isEnabled?"picture-in-picture":"inline")},HtmlVideoPlayer.prototype.isPictureInPictureEnabled=function(){if(document.pictureInPictureEnabled)return!!document.pictureInPictureElement;if(window.Windows)return this.isPip||!1;var video=this._mediaElement;return!!video&&"picture-in-picture"===video.webkitPresentationMode},HtmlVideoPlayer.prototype.setBrightness=function(val){var elem=this._mediaElement;if(elem){val=Math.max(0,val);var rawValue=val=Math.min(100,val),cssValue=100<=(rawValue=Math.max(20,rawValue))?"none":rawValue/100;elem.style["-webkit-filter"]="brightness("+cssValue+");",elem.style.filter="brightness("+cssValue+")",elem.brightnessValue=val,events.trigger(this,"brightnesschange")}},HtmlVideoPlayer.prototype.getBrightness=function(){var elem=this._mediaElement;if(elem){var val=elem.brightnessValue;return null==val?100:val}},HtmlVideoPlayer.prototype.seekable=function(){var mediaElement=this._mediaElement;if(mediaElement){var seekable=mediaElement.seekable;if(seekable&&seekable.length){var start=seekable.start(0),end=seekable.end(0);return htmlMediaHelper.isValidDuration(start)||(start=0),htmlMediaHelper.isValidDuration(end)||(end=0),0<end-start}return!1}},HtmlVideoPlayer.prototype.pause=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.pause()},HtmlVideoPlayer.prototype.resume=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.play()},HtmlVideoPlayer.prototype.unpause=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.play()},HtmlVideoPlayer.prototype.paused=function(){var mediaElement=this._mediaElement;return!!mediaElement&&mediaElement.paused},HtmlVideoPlayer.prototype.setVolume=function(val){var mediaElement=this._mediaElement;mediaElement&&(mediaElement.volume=val/100)},HtmlVideoPlayer.prototype.getVolume=function(){var mediaElement=this._mediaElement;if(mediaElement)return Math.min(Math.round(100*mediaElement.volume),100)},HtmlVideoPlayer.prototype.volumeUp=function(){this.setVolume(Math.min(this.getVolume()+2,100))},HtmlVideoPlayer.prototype.volumeDown=function(){this.setVolume(Math.max(this.getVolume()-2,0))},HtmlVideoPlayer.prototype.setMute=function(mute){var mediaElement=this._mediaElement;mediaElement&&(mediaElement.muted=mute)},HtmlVideoPlayer.prototype.isMuted=function(){var mediaElement=this._mediaElement;return!!mediaElement&&mediaElement.muted},HtmlVideoPlayer.prototype.setAspectRatio=function(val){},HtmlVideoPlayer.prototype.getAspectRatio=function(){return this._currentAspectRatio},HtmlVideoPlayer.prototype.getSupportedAspectRatios=function(){return[]},HtmlVideoPlayer.prototype.togglePictureInPicture=function(){return this.setPictureInPictureEnabled(!this.isPictureInPictureEnabled())},HtmlVideoPlayer.prototype.getBufferedRanges=function(){var mediaElement=this._mediaElement;return mediaElement?htmlMediaHelper.getBufferedRanges(this,mediaElement):[]},HtmlVideoPlayer.prototype.getStats=function(){var mediaElement=this._mediaElement,playOptions=this._currentPlayOptions||[],categories=[];if(!mediaElement)return Promise.resolve({categories:categories});var mediaCategory={stats:[],type:"media"};if(categories.push(mediaCategory),playOptions.url){var link=document.createElement("a");link.setAttribute("href",playOptions.url);var protocol=(link.protocol||"").replace(":","");protocol&&mediaCategory.stats.push({label:"Protocol:",value:protocol}),link=null}this._hlsPlayer||this._shakaPlayer?mediaCategory.stats.push({label:"Stream type:",value:"HLS"}):mediaCategory.stats.push({label:"Stream type:",value:"Video"});var videoCategory={stats:[],type:"video"};categories.push(videoCategory);var height=mediaElement.videoHeight,width=mediaElement.videoWidth;if(width&&height&&videoCategory.stats.push({label:"Video resolution:",value:width+"x"+height}),mediaElement.getVideoPlaybackQuality){var playbackQuality=mediaElement.getVideoPlaybackQuality(),droppedVideoFrames=playbackQuality.droppedVideoFrames||0;videoCategory.stats.push({label:"Dropped frames:",value:droppedVideoFrames});var corruptedVideoFrames=playbackQuality.corruptedVideoFrames||0;videoCategory.stats.push({label:"Corrupted frames:",value:corruptedVideoFrames})}return Promise.resolve({categories:categories})},browser.chromecast&&(mediaManager=new cast.receiver.MediaManager(document.createElement("video"))),HtmlVideoPlayer});