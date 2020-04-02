"use strict";define(["browser","require","events","apphost","loading","dom","playbackManager","appRouter","appSettings","connectionManager","htmlMediaHelper","itemHelper","fullscreenManager","globalize"],(function(browser,require,events,appHost,loading,dom,playbackManager,appRouter,appSettings,connectionManager,htmlMediaHelper,itemHelper,fullscreenManager,globalize){var mediaManager,supportedFeatures;function getMediaStreamTextTracks(mediaSource){return mediaSource.MediaStreams.filter((function(s){return"Subtitle"===s.Type}))}function normalizeTrackEventText(text){return text.replace(/\\N/gi,"\n")}function getTextTrackUrl(track,item,format){if(itemHelper.isLocalItem(item)&&track.Path)return track.Path;var url=playbackManager.getSubtitleUrl(track,item.ServerId);return format&&(url=url.replace(".vtt",format)),url}function HtmlVideoPlayer(){var videoDialog,subtitleTrackIndexToSetOnPlaying,audioTrackIndexToSetOnPlaying;browser.edgeUwp?this.name="Windows Video Player":this.name="Html Video Player",this.type="mediaplayer",this.id="htmlvideoplayer",this.priority=1;var currentClock,currentSubtitlesOctopus,currentAssRenderer,showTrackOffset,currentTrackOffset,videoSubtitlesElem,currentTrackEvents,customTrackIndex=-1,self=this;function decrementFetchQueue(){self._fetchQueue--,self._fetchQueue<=0&&(self.isFetching=!1,events.trigger(self,"endFetch"))}function onMediaManagerLoadMedia(event){self._castPlayer&&self._castPlayer.unload(),self._castPlayer=null;var protocol,data=event.data,media=event.data.media||{},url=media.contentId,contentType=media.contentType.toLowerCase(),mediaElement=(media.customData,self._mediaElement),host=new cast.player.api.Host({url:url,mediaElement:mediaElement});protocol=cast.player.api.CreateHlsStreamingProtocol(host),console.debug("loading playback url: "+url),console.debug("content type: "+contentType),host.onError=function(errorCode){console.error("fatal Error - "+errorCode)},mediaElement.autoplay=!1,self._castPlayer=new cast.player.api.Player(host),self._castPlayer.load(protocol,data.currentTime||0),self._castPlayer.playWhenHaveEnoughData()}function updateCurrentTrackOffset(offsetValue){var relativeOffset=offsetValue;return currentTrackOffset&&(relativeOffset-=currentTrackOffset),currentTrackOffset=offsetValue,relativeOffset}function onEnded(){destroyCustomTrack(this),htmlMediaHelper.onEndedInternal(self,this,onError)}function onTimeUpdate(e){var time=this.currentTime;time&&!self._timeUpdated&&(self._timeUpdated=!0,function ensureValidVideo(elem){if(elem!==self._mediaElement)return;if(0===elem.videoWidth&&0===elem.videoHeight){var mediaSource=(self._currentPlayOptions||{}).mediaSource;if(!mediaSource||mediaSource.RunTimeTicks)return void htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")}}(this)),self._currentTime=time;var currentPlayOptions=self._currentPlayOptions;if(currentPlayOptions){var timeMs=1e3*time;(function updateSubtitleText(timeMs){currentTrackOffset&&(timeMs+=1e3*currentTrackOffset);var clock=currentClock;if(clock){try{clock.seek(timeMs/1e3)}catch(err){console.error("error in libjass: "+err)}return}var trackEvents=currentTrackEvents,subtitleTextElement=videoSubtitlesElem;if(trackEvents&&subtitleTextElement){for(var selectedTrackEvent,ticks=1e4*timeMs,i=0;i<trackEvents.length;i++){var currentTrackEvent=trackEvents[i];if(currentTrackEvent.StartPositionTicks<=ticks&&currentTrackEvent.EndPositionTicks>=ticks){selectedTrackEvent=currentTrackEvent;break}}selectedTrackEvent&&selectedTrackEvent.Text?(subtitleTextElement.innerHTML=normalizeTrackEventText(selectedTrackEvent.Text),subtitleTextElement.classList.remove("hide")):subtitleTextElement.classList.add("hide")}})(timeMs+=(currentPlayOptions.transcodingOffsetTicks||0)/1e4)}events.trigger(self,"timeupdate")}function onVolumeChange(){htmlMediaHelper.saveVolume(this.volume),events.trigger(self,"volumechange")}function onNavigatedToOsd(){var dlg=videoDialog;dlg&&(dlg.classList.remove("videoPlayerContainer-withBackdrop"),dlg.classList.remove("videoPlayerContainer-onTop"),onStartedAndNavigatedToOsd())}function onStartedAndNavigatedToOsd(){setCurrentTrackElement(subtitleTrackIndexToSetOnPlaying),null!=audioTrackIndexToSetOnPlaying&&self.canSetAudioStreamIndex()&&self.setAudioStreamIndex(audioTrackIndexToSetOnPlaying)}function onPlaying(e){self._started||(self._started=!0,this.removeAttribute("controls"),loading.hide(),htmlMediaHelper.seekOnPlaybackStart(self,e.target,self._currentPlayOptions.playerStartPositionTicks),self._currentPlayOptions.fullscreen?appRouter.showVideoOsd().then(onNavigatedToOsd):(appRouter.setTransparency("backdrop"),videoDialog.classList.remove("videoPlayerContainer-withBackdrop"),videoDialog.classList.remove("videoPlayerContainer-onTop"),onStartedAndNavigatedToOsd())),events.trigger(self,"playing")}function onPlay(e){events.trigger(self,"unpause")}function onClick(){events.trigger(self,"click")}function onDblClick(){events.trigger(self,"dblclick")}function onPause(){events.trigger(self,"pause")}function onError(){var type,errorCode=this.error&&this.error.code||0,errorMessage=this.error&&this.error.message||"";switch(console.error("media element error: "+errorCode.toString()+" "+errorMessage),errorCode){case 1:return;case 2:type="network";break;case 3:if(self._hlsPlayer)return void htmlMediaHelper.handleHlsJsMediaError(self);type="mediadecodeerror";break;case 4:type="medianotsupported";break;default:return}htmlMediaHelper.onErrorInternal(self,type)}function destroyCustomTrack(videoElement){if(self._resizeObserver&&(self._resizeObserver.disconnect(),self._resizeObserver=null),videoSubtitlesElem){var subtitlesContainer=videoSubtitlesElem.parentNode;subtitlesContainer&&function tryRemoveElement(elem){var parentNode=elem.parentNode;if(parentNode)try{parentNode.removeChild(elem)}catch(err){console.error("error removing dialog element: "+err)}}(subtitlesContainer),videoSubtitlesElem=null}if(currentTrackEvents=null,videoElement)for(var allTracks=videoElement.textTracks||[],i=0;i<allTracks.length;i++){var currentTrack=allTracks[i];-1!==currentTrack.label.indexOf("manualTrack")&&(currentTrack.mode="disabled")}customTrackIndex=-1,currentClock=null,self._currentAspectRatio=null;currentSubtitlesOctopus&&currentSubtitlesOctopus.dispose(),currentSubtitlesOctopus=null;currentAssRenderer&&currentAssRenderer.setEnabled(!1),currentAssRenderer=null}function fetchSubtitles(track,item){return window.Windows&&itemHelper.isLocalItem(item)?function fetchSubtitlesUwp(track,item){return Windows.Storage.StorageFile.getFileFromPathAsync(track.Path).then((function(storageFile){return Windows.Storage.FileIO.readTextAsync(storageFile).then((function(text){return JSON.parse(text)}))}))}(track):(function incrementFetchQueue(){self._fetchQueue<=0&&(self.isFetching=!0,events.trigger(self,"beginFetch")),self._fetchQueue++}(),new Promise((function(resolve,reject){var xhr=new XMLHttpRequest,url=getTextTrackUrl(track,item,".js");xhr.open("GET",url,!0),xhr.onload=function(e){resolve(JSON.parse(this.response)),decrementFetchQueue()},xhr.onerror=function(e){reject(e),decrementFetchQueue()},xhr.send()})))}function setTrackForDisplay(videoElement,track){if(track){if(customTrackIndex!==track.Index){self.resetSubtitleOffset();var item=self._currentPlayOptions.item;destroyCustomTrack(videoElement),customTrackIndex=track.Index,function renderTracksEvents(videoElement,track,item){if(!itemHelper.isLocalItem(item)||track.IsExternal){var format=(track.Codec||"").toLowerCase();if("ssa"===format||"ass"===format)return void function renderSsaAss(videoElement,track,item){(function supportsCanvas(){return!!document.createElement("canvas").getContext})()&&function supportsWebWorkers(){return!!window.Worker}()?(console.debug("rendering subtitles with SubtitlesOctopus"),function renderWithSubtitlesOctopus(videoElement,track,item){var attachments=self._currentPlayOptions.mediaSource.MediaAttachments||[],options={video:videoElement,subUrl:getTextTrackUrl(track,item),fonts:attachments.map((function(i){return i.DeliveryUrl})),workerUrl:appRouter.baseUrl()+"/libraries/subtitles-octopus-worker.js",legacyWorkerUrl:appRouter.baseUrl()+"/libraries/subtitles-octopus-worker-legacy.js",onError:function onError(){htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")}};require(["JavascriptSubtitlesOctopus"],(function(SubtitlesOctopus){currentSubtitlesOctopus=new SubtitlesOctopus(options)}))}(videoElement,track,item)):(console.debug("rendering subtitles with libjass"),function renderWithLibjass(videoElement,track,item){var rendererSettings={};(browser.ps4||browser.edge||browser.msie)&&(rendererSettings.enableSvg=!1);rendererSettings.enableSvg=!1,require(["libjass","ResizeObserver"],(function(libjass,ResizeObserver){libjass.ASS.fromUrl(getTextTrackUrl(track,item)).then((function(ass){var clock=new libjass.renderers.ManualClock;currentClock=clock;var renderer=new libjass.renderers.WebRenderer(ass,clock,videoElement.parentNode,rendererSettings);currentAssRenderer=renderer,renderer.addEventListener("ready",(function(){try{renderer.resize(videoElement.offsetWidth,videoElement.offsetHeight,0,0),self._resizeObserver||(self._resizeObserver=new ResizeObserver(onVideoResize,{}),self._resizeObserver.observe(videoElement))}catch(ex){}}))}),(function(){htmlMediaHelper.onErrorInternal(self,"mediadecodeerror")}))}))}(videoElement,track,item))}(videoElement,track,item);if(function requiresCustomSubtitlesElement(){if(browser.ps4)return!0;if(browser.firefox||browser.web0s)return!0;if(browser.edge)return!0;if(browser.iOS){var userAgent=navigator.userAgent.toLowerCase();if((-1!==userAgent.indexOf("os 9")||-1!==userAgent.indexOf("os 8"))&&-1===userAgent.indexOf("safari"))return!0}return!1}())return void function renderSubtitlesWithCustomElement(videoElement,track,item){fetchSubtitles(track,item).then((function(data){if(!videoSubtitlesElem){var subtitlesContainer=document.createElement("div");subtitlesContainer.classList.add("videoSubtitles"),subtitlesContainer.innerHTML='<div class="videoSubtitlesInner"></div>',videoSubtitlesElem=subtitlesContainer.querySelector(".videoSubtitlesInner"),function setSubtitleAppearance(elem,innerElem){require(["userSettings","subtitleAppearanceHelper"],(function(userSettings,subtitleAppearanceHelper){subtitleAppearanceHelper.applyStyles({text:innerElem,window:elem},userSettings.getSubtitleAppearanceSettings())}))}(subtitlesContainer,videoSubtitlesElem),videoElement.parentNode.appendChild(subtitlesContainer),currentTrackEvents=data.TrackEvents}}))}(videoElement,track,item)}var trackElement=null;if(videoElement.textTracks&&videoElement.textTracks.length>0){trackElement=videoElement.textTracks[0];try{for(trackElement.mode="showing";trackElement.cues.length;)trackElement.removeCue(trackElement.cues[0])}catch(e){console.error("error removing cue from textTrack")}trackElement.mode="disabled"}else trackElement=videoElement.addTextTrack("subtitles","manualTrack","und");fetchSubtitles(track,item).then((function(data){console.debug("downloaded "+data.TrackEvents.length+" track events"),data.TrackEvents.forEach((function(trackEvent){var cue=new(window.VTTCue||window.TextTrackCue)(trackEvent.StartPositionTicks/1e7,trackEvent.EndPositionTicks/1e7,normalizeTrackEventText(trackEvent.Text));trackElement.addCue(cue)})),trackElement.mode="showing"}))}(videoElement,track,item),0}}else destroyCustomTrack(videoElement)}function onVideoResize(){browser.iOS?setTimeout(resetVideoRendererSize,500):resetVideoRendererSize()}function resetVideoRendererSize(){var renderer=currentAssRenderer;if(renderer){var videoElement=self._mediaElement,width=videoElement.offsetWidth,height=videoElement.offsetHeight;console.debug("videoElement resized: "+width+"x"+height),renderer.resize(width,height,0,0)}}function setCurrentTrackElement(streamIndex){console.debug("setting new text track index to: "+streamIndex);var mediaStreamTextTracks=getMediaStreamTextTracks(self._currentPlayOptions.mediaSource),track=-1===streamIndex?null:mediaStreamTextTracks.filter((function(t){return t.Index===streamIndex}))[0];setTrackForDisplay(self._mediaElement,track),!function enableNativeTrackSupport(currentSrc,track){if(track&&"Embed"===track.DeliveryMethod)return!0;if(browser.firefox&&-1!==(currentSrc||"").toLowerCase().indexOf(".m3u8"))return!1;if(browser.chromecast&&-1!==(currentSrc||"").toLowerCase().indexOf(".m3u8"))return!1;if(browser.ps4)return!1;if(browser.web0s)return!1;if(browser.edge)return!1;if(browser.iOS&&(browser.iosVersion||10)<10)return!1;if(track){var format=(track.Codec||"").toLowerCase();if("ssa"===format||"ass"===format)return!1}return!0}(self._currentSrc,track)?(streamIndex=-1,track=null):-1!==streamIndex&&function setCueAppearance(){require(["userSettings","subtitleAppearanceHelper"],(function(userSettings,subtitleAppearanceHelper){var elementId=self.id+"-cuestyle",styleElem=document.querySelector("#"+elementId);styleElem||((styleElem=document.createElement("style")).id=elementId,styleElem.type="text/css",document.getElementsByTagName("head")[0].appendChild(styleElem)),styleElem.innerHTML=function getCueCss(appearance,selector){var html=selector+"::cue {";return html+=appearance.text.map((function(s){return s.name+":"+s.value+"!important;"})).join(""),html+="}"}(subtitleAppearanceHelper.getStyles(userSettings.getSubtitleAppearanceSettings(),!0),".htmlvideoplayer")}))}()}self.currentSrc=function(){return self._currentSrc},self._fetchQueue=0,self.isFetching=!1,self.play=function(options){return browser.msie&&"Transcode"===options.playMethod&&!window.MediaSource?(alert("Playback of this content is not supported in Internet Explorer. For a better experience, try a modern browser such as Microsoft Edge, Google Chrome, Firefox or Opera."),Promise.reject()):(self._started=!1,self._timeUpdated=!1,self._currentTime=null,self.resetSubtitleOffset(),function createMediaElement(options){(browser.tv||browser.iOS||browser.mobile)&&(options.backdropUrl=null);return new Promise((function(resolve,reject){var dlg=document.querySelector(".videoPlayerContainer");dlg?(options.backdropUrl&&(dlg.classList.add("videoPlayerContainer-withBackdrop"),dlg.style.backgroundImage="url('"+options.backdropUrl+"')"),resolve(dlg.querySelector("video"))):require(["css!./style"],(function(){loading.show();var dlg=document.createElement("div");dlg.classList.add("videoPlayerContainer"),options.backdropUrl&&(dlg.classList.add("videoPlayerContainer-withBackdrop"),dlg.style.backgroundImage="url('"+options.backdropUrl+"')"),options.fullscreen&&dlg.classList.add("videoPlayerContainer-onTop");var html="",cssClass="htmlvideoplayer";browser.chromecast||(cssClass+=" htmlvideoplayer-moveupsubtitles"),appHost.supports("htmlvideoautoplay")?html+='<video class="'+cssClass+'" preload="metadata" autoplay="autoplay" webkit-playsinline playsinline>':html+='<video class="'+cssClass+'" preload="metadata" autoplay="autoplay" controls="controls" webkit-playsinline playsinline>',html+="</video>",dlg.innerHTML=html;var videoElement=dlg.querySelector("video");videoElement.volume=htmlMediaHelper.getSavedVolume(),videoElement.addEventListener("timeupdate",onTimeUpdate),videoElement.addEventListener("ended",onEnded),videoElement.addEventListener("volumechange",onVolumeChange),videoElement.addEventListener("pause",onPause),videoElement.addEventListener("playing",onPlaying),videoElement.addEventListener("play",onPlay),videoElement.addEventListener("click",onClick),videoElement.addEventListener("dblclick",onDblClick),document.body.insertBefore(dlg,document.body.firstChild),videoDialog=dlg,self._mediaElement=videoElement,mediaManager&&(mediaManager.embyInit||(!function initMediaManager(){mediaManager.defaultOnLoad=mediaManager.onLoad.bind(mediaManager),mediaManager.onLoad=onMediaManagerLoadMedia.bind(self),mediaManager.defaultOnStop=mediaManager.onStop.bind(mediaManager),mediaManager.onStop=function(event){playbackManager.stop(),mediaManager.defaultOnStop(event)}}(),mediaManager.embyInit=!0),mediaManager.setMediaElement(videoElement)),options.fullscreen&&browser.supportsCssAnimation()&&!browser.slow?function zoomIn(elem){return new Promise((function(resolve,reject){elem.style.animation="htmlvideoplayer-zoomin 240ms ease-in normal",dom.addEventListener(elem,dom.whichAnimationEvent(),resolve,{once:!0})}))}(dlg).then((function(){resolve(videoElement)})):resolve(videoElement)}))}))}(options).then((function(elem){return function updateVideoUrl(streamInfo){var isHls=-1!==streamInfo.url.toLowerCase().indexOf(".m3u8"),mediaSource=streamInfo.mediaSource,item=streamInfo.item;if(mediaSource&&item&&!mediaSource.RunTimeTicks&&isHls&&"Transcode"===streamInfo.playMethod&&(browser.iOS||browser.osx)){var hlsPlaylistUrl=streamInfo.url.replace("master.m3u8","live.m3u8");return loading.show(),console.debug("prefetching hls playlist: "+hlsPlaylistUrl),connectionManager.getApiClient(item.ServerId).ajax({type:"GET",url:hlsPlaylistUrl}).then((function(){return console.debug("completed prefetching hls playlist: "+hlsPlaylistUrl),loading.hide(),streamInfo.url=hlsPlaylistUrl,Promise.resolve()}),(function(){return console.error("error prefetching hls playlist: "+hlsPlaylistUrl),loading.hide(),Promise.resolve()}))}return Promise.resolve()}(options,options.mediaSource).then((function(){return function setCurrentSrc(elem,options){elem.removeEventListener("error",onError);var val=options.url;console.debug("playing url: "+val);var seconds=(options.playerStartPositionTicks||0)/1e7;seconds&&(val+="#t="+seconds);htmlMediaHelper.destroyHlsPlayer(self),htmlMediaHelper.destroyFlvPlayer(self),htmlMediaHelper.destroyCastPlayer(self);getMediaStreamTextTracks(options.mediaSource);if(null!=(subtitleTrackIndexToSetOnPlaying=null==options.mediaSource.DefaultSubtitleStreamIndex?-1:options.mediaSource.DefaultSubtitleStreamIndex)&&subtitleTrackIndexToSetOnPlaying>=0){var initialSubtitleStream=options.mediaSource.MediaStreams[subtitleTrackIndexToSetOnPlaying];initialSubtitleStream&&"Encode"!==initialSubtitleStream.DeliveryMethod||(subtitleTrackIndexToSetOnPlaying=-1)}audioTrackIndexToSetOnPlaying="Transcode"===options.playMethod?null:options.mediaSource.DefaultAudioStreamIndex,self._currentPlayOptions=options;var crossOrigin=htmlMediaHelper.getCrossOriginValue(options.mediaSource);crossOrigin&&(elem.crossOrigin=crossOrigin);return browser.chromecast&&-1!==val.indexOf(".m3u8")&&options.mediaSource.RunTimeTicks?function setCurrentSrcChromecast(instance,elem,options,url){elem.autoplay=!0;var lrd=new cast.receiver.MediaManager.LoadRequestData;lrd.currentTime=(options.playerStartPositionTicks||0)/1e7,lrd.autoplay=!0,lrd.media=new cast.receiver.media.MediaInformation,lrd.media.contentId=url,lrd.media.contentType=options.mimeType,lrd.media.streamType=cast.receiver.media.StreamType.OTHER,lrd.media.customData=options,console.debug("loading media url into media manager");try{return mediaManager.load(lrd),self._currentSrc=url,Promise.resolve()}catch(err){return console.debug("media manager error: "+err),Promise.reject()}}(0,elem,options,val):htmlMediaHelper.enableHlsJsPlayer(options.mediaSource.RunTimeTicks,"Video")&&-1!==val.indexOf(".m3u8")?function setSrcWithHlsJs(instance,elem,options,url){return new Promise((function(resolve,reject){!function requireHlsPlayer(callback){require(["hlsjs"],(function(hls){window.Hls=hls,callback()}))}((function(){var hls=new Hls({manifestLoadingTimeOut:2e4});hls.loadSource(url),hls.attachMedia(elem),htmlMediaHelper.bindEventsToHlsPlayer(self,hls,elem,onError,resolve,reject),self._hlsPlayer=hls,self._currentSrc=url}))}))}(0,elem,0,val):"Transcode"!==options.playMethod&&"flv"===options.mediaSource.Container?function setSrcWithFlvJs(instance,elem,options,url){return new Promise((function(resolve,reject){require(["flvjs"],(function(flvjs){var flvPlayer=flvjs.createPlayer({type:"flv",url:url},{seekType:"range",lazyLoad:!1});flvPlayer.attachMediaElement(elem),flvPlayer.load(),flvPlayer.play().then(resolve,reject),instance._flvPlayer=flvPlayer,self._currentSrc=url}))}))}(self,elem,0,val):(elem.autoplay=!0,htmlMediaHelper.applySrc(elem,val,options).then((function(){return self._currentSrc=val,htmlMediaHelper.playWithPromise(elem,onError)})))}(elem,options)}))})))},self.setSubtitleStreamIndex=function(index){setCurrentTrackElement(index)},self.resetSubtitleOffset=function(){currentTrackOffset=0,showTrackOffset=!1},self.enableShowingSubtitleOffset=function(){showTrackOffset=!0},self.disableShowingSubtitleOffset=function(){showTrackOffset=!1},self.isShowingSubtitleOffsetEnabled=function(){return showTrackOffset},self.setSubtitleOffset=function(offset){var offsetValue=parseFloat(offset);if(currentAssRenderer)updateCurrentTrackOffset(offsetValue);else{var trackElement=function getTextTrack(){var videoElement=self._mediaElement;return videoElement?Array.from(videoElement.textTracks).find((function(trackElement){return"showing"===trackElement.mode})):null}();trackElement?function setTextTrackSubtitleOffset(currentTrack,offsetValue){currentTrack.cues&&(offsetValue=updateCurrentTrackOffset(offsetValue),Array.from(currentTrack.cues).forEach((function(cue){cue.startTime-=offsetValue,cue.endTime-=offsetValue})))}(trackElement,offsetValue):currentTrackEvents?function setTrackEventsSubtitleOffset(trackEvents,offsetValue){Array.isArray(trackEvents)&&(offsetValue=updateCurrentTrackOffset(offsetValue),trackEvents.forEach((function(trackEvent){trackEvent.StartPositionTicks-=offsetValue,trackEvent.EndPositionTicks-=offsetValue})))}(currentTrackEvents,offsetValue):console.debug("No available track, cannot apply offset: ",offsetValue)}},self.getSubtitleOffset=function(){return currentTrackOffset},self.setAudioStreamIndex=function(index){var streams=function getSupportedAudioStreams(){var profile=self._lastProfile;return function getMediaStreamAudioTracks(mediaSource){return mediaSource.MediaStreams.filter((function(s){return"Audio"===s.Type}))}(self._currentPlayOptions.mediaSource).filter((function(stream){return function isAudioStreamSupported(stream,deviceProfile){var codec=(stream.Codec||"").toLowerCase();return!codec||(!deviceProfile||(deviceProfile.DirectPlayProfiles||[]).filter((function(p){return"Video"===p.Type&&(!p.AudioCodec||-1!==p.AudioCodec.toLowerCase().indexOf(codec))})).length>0)}(stream,profile)}))}();if(!(streams.length<2)){var i,length,audioIndex=-1;for(i=0,length=streams.length;i<length&&(audioIndex++,streams[i].Index!==index);i++);if(-1!==audioIndex){var elem=self._mediaElement;if(elem){var elemAudioTracks=elem.audioTracks||[];for(console.debug("found "+elemAudioTracks.length+" audio tracks"),i=0,length=elemAudioTracks.length;i<length;i++)audioIndex===i?(console.debug("setting audio track "+i+" to enabled"),elemAudioTracks[i].enabled=!0):(console.debug("setting audio track "+i+" to disabled"),elemAudioTracks[i].enabled=!1)}}}},self.stop=function(destroyPlayer){var elem=self._mediaElement,src=self._currentSrc;return elem&&(src&&elem.pause(),htmlMediaHelper.onEndedInternal(self,elem,onError),destroyPlayer&&self.destroy()),destroyCustomTrack(elem),Promise.resolve()},self.destroy=function(){htmlMediaHelper.destroyHlsPlayer(self),htmlMediaHelper.destroyFlvPlayer(self),appRouter.setTransparency("none");var videoElement=self._mediaElement;videoElement&&(self._mediaElement=null,destroyCustomTrack(videoElement),videoElement.removeEventListener("timeupdate",onTimeUpdate),videoElement.removeEventListener("ended",onEnded),videoElement.removeEventListener("volumechange",onVolumeChange),videoElement.removeEventListener("pause",onPause),videoElement.removeEventListener("playing",onPlaying),videoElement.removeEventListener("play",onPlay),videoElement.removeEventListener("click",onClick),videoElement.removeEventListener("dblclick",onDblClick),videoElement.parentNode.removeChild(videoElement));var dlg=videoDialog;dlg&&(videoDialog=null,dlg.parentNode.removeChild(dlg)),fullscreenManager.exitFullscreen()},self.destroyCustomTrack=destroyCustomTrack}function onPictureInPictureError(err){console.error("Picture in picture error: "+err.toString())}return HtmlVideoPlayer.prototype.canPlayMediaType=function(mediaType){return"video"===(mediaType||"").toLowerCase()},HtmlVideoPlayer.prototype.supportsPlayMethod=function(playMethod,item){return!appHost.supportsPlayMethod||appHost.supportsPlayMethod(playMethod,item)},HtmlVideoPlayer.prototype.getDeviceProfile=function(item,options){var instance=this;return function getDeviceProfileInternal(item,options){if(appHost.getDeviceProfile)return appHost.getDeviceProfile(item,options);return function getDefaultProfile(){return new Promise((function(resolve,reject){require(["browserdeviceprofile"],(function(profileBuilder){resolve(profileBuilder({}))}))}))}()}(item,options).then((function(profile){return instance._lastProfile=profile,profile}))},HtmlVideoPlayer.prototype.supports=function(feature){return supportedFeatures||(supportedFeatures=function getSupportedFeatures(){var list=[],video=document.createElement("video");return video.webkitSupportsPresentationMode&&"function"==typeof video.webkitSetPresentationMode||document.pictureInPictureEnabled?list.push("PictureInPicture"):browser.ipad?-1===navigator.userAgent.toLowerCase().indexOf("os 9")&&video.webkitSupportsPresentationMode&&video.webkitSupportsPresentationMode&&"function"==typeof video.webkitSetPresentationMode&&list.push("PictureInPicture"):window.Windows&&Windows.UI.ViewManagement.ApplicationView.getForCurrentView().isViewModeSupported(Windows.UI.ViewManagement.ApplicationViewMode.compactOverlay)&&list.push("PictureInPicture"),(browser.safari||browser.iOS||browser.iPad)&&list.push("AirPlay"),list.push("SetBrightness"),list.push("SetAspectRatio"),list}()),-1!==supportedFeatures.indexOf(feature)},HtmlVideoPlayer.prototype.currentTime=function(val){var mediaElement=this._mediaElement;if(mediaElement){if(null!=val)return void(mediaElement.currentTime=val/1e3);var currentTime=this._currentTime;return currentTime?1e3*currentTime:1e3*(mediaElement.currentTime||0)}},HtmlVideoPlayer.prototype.duration=function(val){var mediaElement=this._mediaElement;if(mediaElement){var duration=mediaElement.duration;if(htmlMediaHelper.isValidDuration(duration))return 1e3*duration}return null},HtmlVideoPlayer.prototype.canSetAudioStreamIndex=function(index){if(browser.tizen||browser.orsay)return!0;var video=this._mediaElement;return!(!video||!video.audioTracks)},HtmlVideoPlayer.prototype.setPictureInPictureEnabled=function(isEnabled){var video=this._mediaElement;document.pictureInPictureEnabled?video&&(isEnabled?video.requestPictureInPicture().catch(onPictureInPictureError):document.exitPictureInPicture().catch(onPictureInPictureError)):window.Windows?(this.isPip=isEnabled,isEnabled?Windows.UI.ViewManagement.ApplicationView.getForCurrentView().tryEnterViewModeAsync(Windows.UI.ViewManagement.ApplicationViewMode.compactOverlay):Windows.UI.ViewManagement.ApplicationView.getForCurrentView().tryEnterViewModeAsync(Windows.UI.ViewManagement.ApplicationViewMode.default)):video&&video.webkitSupportsPresentationMode&&"function"==typeof video.webkitSetPresentationMode&&video.webkitSetPresentationMode(isEnabled?"picture-in-picture":"inline")},HtmlVideoPlayer.prototype.isPictureInPictureEnabled=function(){if(document.pictureInPictureEnabled)return!!document.pictureInPictureElement;if(window.Windows)return this.isPip||!1;var video=this._mediaElement;return!!video&&"picture-in-picture"===video.webkitPresentationMode},HtmlVideoPlayer.prototype.isAirPlayEnabled=function(){return!!document.AirPlayEnabled&&!!document.AirplayElement},HtmlVideoPlayer.prototype.setAirPlayEnabled=function(isEnabled){var video=this._mediaElement;document.AirPlayEnabled?video&&(isEnabled?video.requestAirPlay().catch((function(err){console.error("Error requesting AirPlay",err)})):document.exitAirPLay().catch((function(err){console.error("Error exiting AirPlay",err)}))):video.webkitShowPlaybackTargetPicker()},HtmlVideoPlayer.prototype.setBrightness=function(val){var elem=this._mediaElement;if(elem){val=Math.max(0,val);var rawValue=val=Math.min(100,val),cssValue=(rawValue=Math.max(20,rawValue))>=100?"none":rawValue/100;elem.style["-webkit-filter"]="brightness("+cssValue+");",elem.style.filter="brightness("+cssValue+")",elem.brightnessValue=val,events.trigger(this,"brightnesschange")}},HtmlVideoPlayer.prototype.getBrightness=function(){var elem=this._mediaElement;if(elem){var val=elem.brightnessValue;return null==val?100:val}},HtmlVideoPlayer.prototype.seekable=function(){var mediaElement=this._mediaElement;if(mediaElement){var seekable=mediaElement.seekable;if(seekable&&seekable.length){var start=seekable.start(0),end=seekable.end(0);return htmlMediaHelper.isValidDuration(start)||(start=0),htmlMediaHelper.isValidDuration(end)||(end=0),end-start>0}return!1}},HtmlVideoPlayer.prototype.pause=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.pause()},HtmlVideoPlayer.prototype.resume=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.play()},HtmlVideoPlayer.prototype.unpause=function(){var mediaElement=this._mediaElement;mediaElement&&mediaElement.play()},HtmlVideoPlayer.prototype.paused=function(){var mediaElement=this._mediaElement;return!!mediaElement&&mediaElement.paused},HtmlVideoPlayer.prototype.setVolume=function(val){var mediaElement=this._mediaElement;mediaElement&&(mediaElement.volume=val/100)},HtmlVideoPlayer.prototype.getVolume=function(){var mediaElement=this._mediaElement;if(mediaElement)return Math.min(Math.round(100*mediaElement.volume),100)},HtmlVideoPlayer.prototype.volumeUp=function(){this.setVolume(Math.min(this.getVolume()+2,100))},HtmlVideoPlayer.prototype.volumeDown=function(){this.setVolume(Math.max(this.getVolume()-2,0))},HtmlVideoPlayer.prototype.setMute=function(mute){var mediaElement=this._mediaElement;mediaElement&&(mediaElement.muted=mute)},HtmlVideoPlayer.prototype.isMuted=function(){var mediaElement=this._mediaElement;return!!mediaElement&&mediaElement.muted},HtmlVideoPlayer.prototype.setAspectRatio=function(val){var mediaElement=this._mediaElement;mediaElement&&("auto"===val?mediaElement.style.removeProperty("object-fit"):mediaElement.style["object-fit"]=val),this._currentAspectRatio=val},HtmlVideoPlayer.prototype.getAspectRatio=function(){return this._currentAspectRatio||"auto"},HtmlVideoPlayer.prototype.getSupportedAspectRatios=function(){return[{name:"Auto",id:"auto"},{name:"Cover",id:"cover"},{name:"Fill",id:"fill"}]},HtmlVideoPlayer.prototype.togglePictureInPicture=function(){return this.setPictureInPictureEnabled(!this.isPictureInPictureEnabled())},HtmlVideoPlayer.prototype.toggleAirPlay=function(){return this.setAirPlayEnabled(!this.isAirPlayEnabled())},HtmlVideoPlayer.prototype.getBufferedRanges=function(){var mediaElement=this._mediaElement;return mediaElement?htmlMediaHelper.getBufferedRanges(this,mediaElement):[]},HtmlVideoPlayer.prototype.getStats=function(){var mediaElement=this._mediaElement,playOptions=this._currentPlayOptions||[],categories=[];if(!mediaElement)return Promise.resolve({categories:categories});var mediaCategory={stats:[],type:"media"};if(categories.push(mediaCategory),playOptions.url){var link=document.createElement("a");link.setAttribute("href",playOptions.url);var protocol=(link.protocol||"").replace(":","");protocol&&mediaCategory.stats.push({label:globalize.translate("LabelProtocol"),value:protocol}),link=null}this._hlsPlayer||this._shakaPlayer?mediaCategory.stats.push({label:globalize.translate("LabelStreamType"),value:"HLS"}):mediaCategory.stats.push({label:globalize.translate("LabelStreamType"),value:"Video"});var videoCategory={stats:[],type:"video"};categories.push(videoCategory);var rect=mediaElement.getBoundingClientRect?mediaElement.getBoundingClientRect():{},height=parseInt(rect.height),width=parseInt(rect.width);if(width&&height&&!browser.tv&&videoCategory.stats.push({label:globalize.translate("LabelPlayerDimensions"),value:width+"x"+height}),height=mediaElement.videoHeight,(width=mediaElement.videoWidth)&&height&&videoCategory.stats.push({label:globalize.translate("LabelVideoResolution"),value:width+"x"+height}),mediaElement.getVideoPlaybackQuality){var playbackQuality=mediaElement.getVideoPlaybackQuality(),droppedVideoFrames=playbackQuality.droppedVideoFrames||0;videoCategory.stats.push({label:globalize.translate("LabelDroppedFrames"),value:droppedVideoFrames});var corruptedVideoFrames=playbackQuality.corruptedVideoFrames||0;videoCategory.stats.push({label:globalize.translate("LabelCorruptedFrames"),value:corruptedVideoFrames})}var audioCategory={stats:[],type:"audio"};categories.push(audioCategory);var sinkId=mediaElement.sinkId;return sinkId&&audioCategory.stats.push({label:"Sink Id:",value:sinkId}),Promise.resolve({categories:categories})},browser.chromecast&&(mediaManager=new cast.receiver.MediaManager(document.createElement("video"))),HtmlVideoPlayer}));