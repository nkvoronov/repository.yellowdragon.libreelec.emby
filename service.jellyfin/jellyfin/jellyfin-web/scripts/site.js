"use strict";function getWindowLocationSearch(win){var search=(win||window).location.search;if(!search){var index=window.location.href.indexOf("?");-1!=index&&(search=window.location.href.substring(index))}return search||""}function getParameterByName(name,url){name=name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var results=new RegExp("[\\?&]"+name+"=([^&#]*)","i").exec(url||getWindowLocationSearch());return null==results?"":decodeURIComponent(results[1].replace(/\+/g," "))}function pageClassOn(eventName,className,fn){document.addEventListener(eventName,(function(event){var target=event.target;target.classList.contains(className)&&fn.call(target,event)}))}function pageIdOn(eventName,id,fn){document.addEventListener(eventName,(function(event){var target=event.target;target.id===id&&fn.call(target,event)}))}var Dashboard={getCurrentUser:function getCurrentUser(){return window.ApiClient.getCurrentUser(!1)},serverAddress:function serverAddress(){if(AppInfo.isNativeApp){var apiClient=window.ApiClient;return apiClient?apiClient.serverAddress():null}var urlLower=window.location.href.toLowerCase(),index=urlLower.lastIndexOf("/web");if(-1!=index)return urlLower.substring(0,index);var loc=window.location,address=loc.protocol+"//"+loc.hostname;return loc.port&&(address+=":"+loc.port),address},getCurrentUserId:function getCurrentUserId(){var apiClient=window.ApiClient;return apiClient?apiClient.getCurrentUserId():null},onServerChanged:function onServerChanged(userId,accessToken,apiClient){apiClient=apiClient||window.ApiClient,window.ApiClient=apiClient},logout:function logout(){ConnectionManager.logout().then((function(){var loginPage;AppInfo.isNativeApp?(loginPage="selectserver.html",window.ApiClient=null):loginPage="login.html",Dashboard.navigate(loginPage)}))},getConfigurationPageUrl:function getConfigurationPageUrl(name){return"configurationpage?name="+encodeURIComponent(name)},getConfigurationResourceUrl:function getConfigurationResourceUrl(name){return AppInfo.isNativeApp?ApiClient.getUrl("web/ConfigurationPage",{name:name}):Dashboard.getConfigurationPageUrl(name)},navigate:function navigate(url,preserveQueryString){if(!url)throw new Error("url cannot be null or empty");var queryString=getWindowLocationSearch();return preserveQueryString&&queryString&&(url+=queryString),new Promise((function(resolve,reject){require(["appRouter"],(function(appRouter){return appRouter.show(url).then(resolve,reject)}))}))},navigate_direct:function navigate_direct(path){return new Promise((function(resolve,reject){require(["appRouter"],(function(appRouter){return appRouter.showDirect(path).then(resolve,reject)}))}))},processPluginConfigurationUpdateResult:function processPluginConfigurationUpdateResult(){require(["loading","toast"],(function(loading,toast){loading.hide(),toast(Globalize.translate("MessageSettingsSaved"))}))},processServerConfigurationUpdateResult:function processServerConfigurationUpdateResult(result){require(["loading","toast"],(function(loading,toast){loading.hide(),toast(Globalize.translate("MessageSettingsSaved"))}))},processErrorResponse:function processErrorResponse(response){require(["loading"],(function(loading){loading.hide()}));var status=""+response.status;response.statusText&&(status=response.statusText),Dashboard.alert({title:status,message:response.headers?response.headers.get("X-Application-Error-Code"):null})},alert:function alert(options){"string"!=typeof options?require(["alert"],(function(alert){alert({title:options.title||Globalize.translate("HeaderAlert"),text:options.message}).then(options.callback||function(){})})):require(["toast"],(function(toast){toast({text:options})}))},capabilities:function capabilities(appHost){var capabilities={PlayableMediaTypes:["Audio","Video"],SupportedCommands:["MoveUp","MoveDown","MoveLeft","MoveRight","PageUp","PageDown","PreviousLetter","NextLetter","ToggleOsd","ToggleContextMenu","Select","Back","SendKey","SendString","GoHome","GoToSettings","VolumeUp","VolumeDown","Mute","Unmute","ToggleMute","SetVolume","SetAudioStreamIndex","SetSubtitleStreamIndex","DisplayContent","GoToSearch","DisplayMessage","SetRepeatMode","SetShuffleQueue","ChannelUp","ChannelDown","PlayMediaSource","PlayTrailers"],SupportsPersistentIdentifier:"cordova"===self.appMode||"android"===self.appMode,SupportsMediaControl:!0};return appHost.getPushTokenInfo(),Object.assign(capabilities,appHost.getPushTokenInfo())},selectServer:function selectServer(){window.NativeShell&&"function"==typeof window.NativeShell.selectServer?window.NativeShell.selectServer():Dashboard.navigate("selectserver.html")},hideLoadingMsg:function hideLoadingMsg(){require(["loading"],(function(loading){loading.hide()}))},showLoadingMsg:function showLoadingMsg(){require(["loading"],(function(loading){loading.show()}))},confirm:function confirm(message,title,callback){require(["confirm"],(function(confirm){confirm(message,title).then((function(){callback(!0)})).catch((function(){callback(!1)}))}))}},AppInfo={};!function(){function createConnectionManager(){return require(["connectionManagerFactory","apphost","credentialprovider","events","userSettings"],(function(ConnectionManager,apphost,credentialProvider,events,userSettings){var credentialProviderInstance=new credentialProvider,promises=[apphost.getSyncProfile(),apphost.init()];return Promise.all(promises).then((function(responses){var deviceProfile=responses[0],capabilities=Dashboard.capabilities(apphost);capabilities.DeviceProfile=deviceProfile;var connectionManager=new ConnectionManager(credentialProviderInstance,apphost.appName(),apphost.appVersion(),apphost.deviceName(),apphost.deviceId(),capabilities);return function defineConnectionManager(connectionManager){window.ConnectionManager=connectionManager,define("connectionManager",[],(function(){return connectionManager}))}(connectionManager),function bindConnectionManagerEvents(connectionManager,events,userSettings){window.Events=events,connectionManager.currentApiClient=function(){if(!localApiClient){var server=connectionManager.getLastUsedServer();server&&(localApiClient=connectionManager.getApiClient(server.Id))}return localApiClient},connectionManager.onLocalUserSignedIn=function(user){return localApiClient=connectionManager.getApiClient(user.ServerId),window.ApiClient=localApiClient,userSettings.setUserInfo(user.Id,localApiClient)},events.on(connectionManager,"localusersignedout",(function(){userSettings.setUserInfo(null,null)}))}(connectionManager,events,userSettings),AppInfo.isNativeApp?Promise.resolve():(console.debug("loading ApiClient singleton"),require(["apiclient"],(function(apiClientFactory){console.debug("creating ApiClient singleton");var apiClient=new apiClientFactory(Dashboard.serverAddress(),apphost.appName(),apphost.appVersion(),apphost.deviceName(),apphost.deviceId());apiClient.enableAutomaticNetworking=!1,apiClient.manualAddressOnly=!0,connectionManager.addApiClient(apiClient),window.ApiClient=apiClient,localApiClient=apiClient,console.debug("loaded ApiClient singleton")})))}))}))}function returnFirstDependency(obj){return obj}function returnDefault(obj){if(null===obj.default)throw new Error("Object has no default!");return obj.default}function getPlaybackManager(playbackManager){return window.addEventListener("beforeunload",(function(){try{playbackManager.onAppClose()}catch(err){console.error("error in onAppClose: "+err)}})),playbackManager}function getLayoutManager(layoutManager,appHost){return appHost.getDefaultLayout&&(layoutManager.defaultLayout=appHost.getDefaultLayout()),layoutManager.init(),layoutManager}function createSharedAppFooter(appFooter){return new appFooter({})}function onRequireJsError(requireType,requireModules){console.error("RequireJS error: "+(requireType||"unknown")+". Failed modules: "+(requireModules||[]).join(","))}function initRequireWithBrowser(){define("filesystem",["scripts/filesystem"],returnFirstDependency),define("lazyLoader",["components/lazyLoader/lazyLoaderIntersectionObserver"],returnFirstDependency),define("shell",["scripts/shell"],returnFirstDependency),define("alert",["components/alert"],returnFirstDependency),function defineResizeObserver(){self.ResizeObserver?define("ResizeObserver",[],(function(){return self.ResizeObserver})):define("ResizeObserver",["resize-observer-polyfill"],returnFirstDependency)}(),define("dialog",["components/dialog/dialog"],returnFirstDependency),define("confirm",["components/confirm/confirm"],returnFirstDependency),define("prompt",["components/prompt/prompt"],returnFirstDependency),define("loading",["components/loading/loading"],returnFirstDependency),define("multi-download",["scripts/multiDownload"],returnFirstDependency),define("fileDownloader",["scripts/fileDownloader"],returnFirstDependency),define("castSenderApiLoader",["components/castSenderApi"],returnFirstDependency)}function init(){define("livetvcss",["css!assets/css/livetv.css"],returnFirstDependency),define("detailtablecss",["css!assets/css/detailtable.css"],returnFirstDependency);var promises=[];window.fetch||promises.push(require(["fetch"])),Promise.all(promises).then((function(){createConnectionManager().then((function(){console.debug("initAfterDependencies promises resolved"),require(["globalize","browser"],(function(globalize,browser){window.Globalize=globalize,function loadCoreDictionary(globalize){var translations=["ar","be-by","bg-bg","ca","cs","da","de","el","en-gb","en-us","es","es-ar","es-mx","fa","fi","fr","fr-ca","gsw","he","hi-in","hr","hu","id","it","kk","ko","lt-lt","ms","nb","nl","pl","pt-br","pt-pt","ro","ru","sk","sl-si","sv","tr","uk","vi","zh-cn","zh-hk","zh-tw"].map((function(language){return{lang:language,path:"strings/"+language+".json"}}));return globalize.defaultModule("core"),globalize.loadStrings({name:"core",translations:translations})}(globalize).then((function(){!function onGlobalizeInit(browser){if("android"===self.appMode&&-1!==self.location.href.toString().toLowerCase().indexOf("start=backgroundsync"))return onAppReady(browser);document.title=Globalize.translateDocument(document.title,"core"),browser.tv&&!browser.android?(console.debug("using system fonts with explicit sizes"),require(["systemFontsSizedCss"])):(console.debug("using default fonts"),require(["systemFontsCss"]));require(["apphost","css!assets/css/librarybrowser"],(function(appHost){(function loadPlugins(appHost,browser,shell){console.debug("loading installed plugins");var list=["plugins/playAccessValidation/plugin","plugins/experimentalWarnings/plugin","plugins/htmlAudioPlayer/plugin","plugins/htmlVideoPlayer/plugin","plugins/photoPlayer/plugin","plugins/bookPlayer/plugin","plugins/youtubePlayer/plugin","plugins/backdropScreensaver/plugin","plugins/logoScreensaver/plugin"];appHost.supports("remotecontrol")&&(list.push("plugins/sessionPlayer/plugin"),(browser.chrome||browser.edgeChromium||browser.opera)&&list.push("plugins/chromecastPlayer/plugin"));window.NativeShell&&(list=list.concat(window.NativeShell.getPlugins()));return new Promise((function(resolve,reject){Promise.all(list.map(loadPlugin)).then((function(){require(["packageManager"],(function(packageManager){packageManager.init().then(resolve,reject)}))}),reject)}))})(appHost,browser).then((function(){onAppReady(browser)}))}))}(browser)}))})),require(["keyboardnavigation"],(function(keyboardnavigation){keyboardnavigation.enable()})),require(["mouseManager"]),require(["focusPreventScroll"]),require(["autoFocuser"],(function(autoFocuser){autoFocuser.enable()})),require(["globalize","connectionManager","events"],(function(globalize,connectionManager,events){events.on(connectionManager,"localusersignedin",globalize.updateCurrentCulture)}))}))}))}function loadPlugin(url){return new Promise((function(resolve,reject){require(["pluginManager"],(function(pluginManager){pluginManager.loadPlugin(url).then(resolve,reject)}))}))}function onAppReady(browser){console.debug("begin onAppReady"),require(["apphost","appRouter"],(function(appHost,appRouter){window.Emby={},console.debug("onAppReady: loading dependencies"),browser.iOS&&require(["css!assets/css/ios.css"]),window.Emby.Page=appRouter,require(["emby-button","scripts/themeLoader","libraryMenu","scripts/routes"],(function(){Emby.Page.start({click:!1,hashbang:!0}),require(["components/themeMediaPlayer","scripts/autoBackdrops"]),browser.tv||browser.xboxOne||browser.ps4||require(["components/nowPlayingBar/nowPlayingBar"]),appHost.supports("remotecontrol")&&require(["playerSelectionMenu","components/playback/remotecontrolautoplay"]),require(["libraries/screensavermanager"]),appHost.supports("physicalvolumecontrol")&&!browser.touch||require(["components/playback/volumeosd"]),(navigator.mediaSession||window.NativeShell)&&require(["mediaSession"]),require(["serverNotifications"]),require(["date-fns","date-fns/locale"]),browser.tv||browser.xboxOne||(require(["components/playback/playbackorientation"]),function registerServiceWorker(){if(navigator.serviceWorker&&"cordova"!==self.appMode&&"android"!==self.appMode)try{navigator.serviceWorker.register("serviceworker.js")}catch(err){console.error("error registering serviceWorker: "+err)}else console.warn("serviceWorker unsupported")}(),window.Notification&&require(["components/notifications/notifications"])),require(["playerSelectionMenu"]);var apiClient=window.ConnectionManager&&window.ConnectionManager.currentApiClient();apiClient&&fetch(apiClient.getUrl("Branding/Css")).then((function(response){if(!response.ok)throw new Error(response.status+" "+response.statusText);return response.text()})).then((function(css){var style=document.createElement("style");style.appendChild(document.createTextNode(css)),document.body.appendChild(style)})).catch((function(err){console.warn("Error applying custom css",err)}))}))}))}var localApiClient,promise,urlArgs,paths;urlArgs="v="+(window.dashboardVersion||(new Date).getDate()),paths={browserdeviceprofile:"scripts/browserDeviceProfile",browser:"scripts/browser",libraryBrowser:"scripts/libraryBrowser",inputManager:"scripts/inputManager",datetime:"scripts/datetime",globalize:"scripts/globalize",dfnshelper:"scripts/dfnshelper",libraryMenu:"scripts/libraryMenu",playlisteditor:"components/playlisteditor/playlisteditor",medialibrarycreator:"components/mediaLibraryCreator/mediaLibraryCreator",medialibraryeditor:"components/mediaLibraryEditor/mediaLibraryEditor",imageoptionseditor:"components/imageOptionsEditor/imageOptionsEditor",apphost:"components/apphost",visibleinviewport:"libraries/visibleinviewport",qualityoptions:"components/qualityOptions",focusManager:"components/focusManager",itemHelper:"components/itemHelper",itemShortcuts:"components/shortcuts",playQueueManager:"components/playback/playqueuemanager",nowPlayingHelper:"components/playback/nowplayinghelper",pluginManager:"components/pluginManager",packageManager:"components/packageManager",screensaverManager:"components/screensavermanager",chromecastHelper:"plugins/chromecastPlayer/chromecastHelpers"},requirejs.onError=onRequireJsError,requirejs.config({waitSeconds:0,map:{"*":{css:"components/require/requirecss",text:"components/require/requiretext"}},bundles:{bundle:["fetch","flvjs","jstree","epubjs","jQuery","hlsjs","howler","native-promise-only","resize-observer-polyfill","shaka","swiper","queryString","sortable","webcomponents","material-icons","jellyfin-noto","date-fns","page","polyfill","fast-text-encoding","intersection-observer","classlist-polyfill","screenfull","headroom","apiclient","events","credentialprovider","connectionManagerFactory","appStorage"]},urlArgs:urlArgs,paths:paths,onError:onRequireJsError}),promise=require(["fetch"]).then((function(){return require(["jQuery","polyfill","fast-text-encoding","intersection-observer","classlist-polyfill","css!assets/css/site","jellyfin-noto"],(function(jQuery){window.$=jQuery,window.jQuery=jQuery}))})),define("systemFontsCss",["css!assets/css/fonts"],returnFirstDependency),define("systemFontsSizedCss",["css!assets/css/fonts.sized"],returnFirstDependency),define("scrollStyles",["css!assets/css/scrollstyles"],returnFirstDependency),define("dashboardcss",["css!assets/css/dashboard"],returnFirstDependency),define("programStyles",["css!components/guide/programs"],returnFirstDependency),define("listViewStyle",["css!components/listview/listview"],returnFirstDependency),define("formDialogStyle",["css!components/formdialog"],returnFirstDependency),define("clearButtonStyle",["css!assets/css/clearbutton"],returnFirstDependency),define("cardStyle",["css!components/cardbuilder/card"],returnFirstDependency),define("flexStyles",["css!assets/css/flexstyles"],returnFirstDependency),define("fnchecked",["legacy/fnchecked"],returnFirstDependency),define("legacySelectMenu",["legacy/selectmenu"],returnFirstDependency),define("appFooter",["components/appFooter/appFooter"],returnFirstDependency),define("appFooter-shared",["appFooter"],createSharedAppFooter),define("scroller",["libraries/scroller"],returnFirstDependency),define("navdrawer",["libraries/navdrawer/navdrawer"],returnFirstDependency),define("emby-button",["elements/emby-button/emby-button"],returnFirstDependency),define("paper-icon-button-light",["elements/emby-button/paper-icon-button-light"],returnFirstDependency),define("emby-checkbox",["elements/emby-checkbox/emby-checkbox"],returnFirstDependency),define("emby-collapse",["elements/emby-collapse/emby-collapse"],returnFirstDependency),define("emby-input",["elements/emby-input/emby-input"],returnFirstDependency),define("emby-progressring",["elements/emby-progressring/emby-progressring"],returnFirstDependency),define("emby-radio",["elements/emby-radio/emby-radio"],returnFirstDependency),define("emby-select",["elements/emby-select/emby-select"],returnFirstDependency),define("emby-slider",["elements/emby-slider/emby-slider"],returnFirstDependency),define("emby-textarea",["elements/emby-textarea/emby-textarea"],returnFirstDependency),define("emby-toggle",["elements/emby-toggle/emby-toggle"],returnFirstDependency),define("emby-scroller",["elements/emby-scroller/emby-scroller"],returnFirstDependency),define("emby-tabs",["elements/emby-tabs/emby-tabs"],returnFirstDependency),define("emby-scrollbuttons",["elements/emby-scrollbuttons/emby-scrollbuttons"],returnFirstDependency),define("emby-itemrefreshindicator",["elements/emby-itemrefreshindicator/emby-itemrefreshindicator"],returnFirstDependency),define("emby-itemscontainer",["elements/emby-itemscontainer/emby-itemscontainer"],returnFirstDependency),define("emby-playstatebutton",["elements/emby-playstatebutton/emby-playstatebutton"],returnFirstDependency),define("emby-ratingbutton",["elements/emby-ratingbutton/emby-ratingbutton"],returnFirstDependency),define("emby-progressbar",["elements/emby-progressbar/emby-progressbar"],returnFirstDependency),define("emby-programcell",["elements/emby-programcell/emby-programcell"],returnFirstDependency),define("webSettings",["scripts/settings/webSettings"],returnFirstDependency),define("appSettings",["scripts/settings/appSettings"],returnFirstDependency),define("userSettings",["scripts/settings/userSettings"],returnFirstDependency),define("mediaSession",["components/playback/mediasession"],returnFirstDependency),define("actionsheet",["components/actionSheet/actionSheet"],returnFirstDependency),define("tunerPicker",["components/tunerPicker"],returnFirstDependency),define("mainTabsManager",["components/maintabsmanager"],returnFirstDependency),define("imageLoader",["components/images/imageLoader"],returnFirstDependency),define("directorybrowser",["components/directorybrowser/directorybrowser"],returnFirstDependency),define("metadataEditor",["components/metadataEditor/metadataEditor"],returnFirstDependency),define("personEditor",["components/metadataEditor/personEditor"],returnFirstDependency),define("playerSelectionMenu",["components/playback/playerSelectionMenu"],returnFirstDependency),define("playerSettingsMenu",["components/playback/playersettingsmenu"],returnFirstDependency),define("playMethodHelper",["components/playback/playmethodhelper"],returnFirstDependency),define("brightnessOsd",["components/playback/brightnessosd"],returnFirstDependency),define("alphaNumericShortcuts",["scripts/alphanumericshortcuts"],returnFirstDependency),define("multiSelect",["components/multiSelect/multiSelect"],returnFirstDependency),define("alphaPicker",["components/alphaPicker/alphaPicker"],returnFirstDependency),define("tabbedView",["components/tabbedview/tabbedview"],returnFirstDependency),define("itemsTab",["components/tabbedview/itemstab"],returnFirstDependency),define("collectionEditor",["components/collectionEditor/collectionEditor"],returnFirstDependency),define("playlistEditor",["components/playlisteditor/playlisteditor"],returnFirstDependency),define("recordingCreator",["components/recordingcreator/recordingcreator"],returnFirstDependency),define("recordingEditor",["components/recordingcreator/recordingeditor"],returnFirstDependency),define("seriesRecordingEditor",["components/recordingcreator/seriesrecordingeditor"],returnFirstDependency),define("recordingFields",["components/recordingcreator/recordingfields"],returnFirstDependency),define("recordingButton",["components/recordingcreator/recordingbutton"],returnFirstDependency),define("recordingHelper",["components/recordingcreator/recordinghelper"],returnFirstDependency),define("subtitleEditor",["components/subtitleeditor/subtitleeditor"],returnFirstDependency),define("subtitleSync",["components/subtitlesync/subtitlesync"],returnFirstDependency),define("itemIdentifier",["components/itemidentifier/itemidentifier"],returnFirstDependency),define("itemMediaInfo",["components/itemMediaInfo/itemMediaInfo"],returnFirstDependency),define("mediaInfo",["components/mediainfo/mediainfo"],returnFirstDependency),define("itemContextMenu",["components/itemContextMenu"],returnFirstDependency),define("imageEditor",["components/imageeditor/imageeditor"],returnFirstDependency),define("imageDownloader",["components/imageDownloader/imageDownloader"],returnFirstDependency),define("dom",["scripts/dom"],returnFirstDependency),define("playerStats",["components/playerstats/playerstats"],returnFirstDependency),define("searchFields",["components/search/searchfields"],returnFirstDependency),define("searchResults",["components/search/searchresults"],returnFirstDependency),define("upNextDialog",["components/upnextdialog/upnextdialog"],returnFirstDependency),define("subtitleAppearanceHelper",["components/subtitlesettings/subtitleappearancehelper"],returnFirstDependency),define("subtitleSettings",["components/subtitlesettings/subtitlesettings"],returnFirstDependency),define("displaySettings",["components/displaySettings/displaySettings"],returnFirstDependency),define("playbackSettings",["components/playbackSettings/playbackSettings"],returnFirstDependency),define("homescreenSettings",["components/homeScreenSettings/homeScreenSettings"],returnFirstDependency),define("playbackManager",["components/playback/playbackmanager"],getPlaybackManager),define("timeSyncManager",["components/syncPlay/timeSyncManager"],returnDefault),define("groupSelectionMenu",["components/syncPlay/groupSelectionMenu"],returnFirstDependency),define("syncPlayManager",["components/syncPlay/syncPlayManager"],returnDefault),define("playbackPermissionManager",["components/syncPlay/playbackPermissionManager"],returnDefault),define("layoutManager",["components/layoutManager","apphost"],getLayoutManager),define("homeSections",["components/homesections/homesections"],returnFirstDependency),define("playMenu",["components/playmenu"],returnFirstDependency),define("refreshDialog",["components/refreshdialog/refreshdialog"],returnFirstDependency),define("backdrop",["components/backdrop/backdrop"],returnFirstDependency),define("fetchHelper",["components/fetchhelper"],returnFirstDependency),define("cardBuilder",["components/cardbuilder/cardBuilder"],returnFirstDependency),define("peoplecardbuilder",["components/cardbuilder/peoplecardbuilder"],returnFirstDependency),define("chaptercardbuilder",["components/cardbuilder/chaptercardbuilder"],returnFirstDependency),define("deleteHelper",["scripts/deleteHelper"],returnFirstDependency),define("tvguide",["components/guide/guide"],returnFirstDependency),define("guide-settings-dialog",["components/guide/guide-settings"],returnFirstDependency),define("viewManager",["components/viewManager/viewManager"],(function(viewManager){return window.ViewManager=viewManager,viewManager.dispatchPageEvents(!0),viewManager})),define("slideshow",["components/slideshow/slideshow"],returnFirstDependency),define("focusPreventScroll",["legacy/focusPreventScroll"],returnFirstDependency),define("userdataButtons",["components/userdatabuttons/userdatabuttons"],returnFirstDependency),define("listView",["components/listview/listview"],returnFirstDependency),define("indicators",["components/indicators/indicators"],returnFirstDependency),define("viewSettings",["components/viewSettings/viewSettings"],returnFirstDependency),define("filterMenu",["components/filtermenu/filtermenu"],returnFirstDependency),define("sortMenu",["components/sortmenu/sortmenu"],returnFirstDependency),define("sanitizefilename",["components/sanitizeFilename"],returnFirstDependency),define("toast",["components/toast/toast"],returnFirstDependency),define("scrollHelper",["scripts/scrollHelper"],returnFirstDependency),define("touchHelper",["scripts/touchHelper"],returnFirstDependency),define("imageUploader",["components/imageUploader/imageUploader"],returnFirstDependency),define("htmlMediaHelper",["components/htmlMediaHelper"],returnFirstDependency),define("viewContainer",["components/viewContainer"],returnFirstDependency),define("dialogHelper",["components/dialogHelper/dialogHelper"],returnFirstDependency),define("serverNotifications",["scripts/serverNotifications"],returnFirstDependency),define("skinManager",["components/skinManager"],returnFirstDependency),define("keyboardnavigation",["scripts/keyboardNavigation"],returnFirstDependency),define("mouseManager",["scripts/mouseManager"],returnFirstDependency),define("scrollManager",["components/scrollManager"],returnFirstDependency),define("autoFocuser",["components/autoFocuser"],returnFirstDependency),define("connectionManager",[],(function(){return ConnectionManager})),define("apiClientResolver",[],(function(){return function(){return window.ApiClient}})),define("appRouter",["components/appRouter","itemHelper"],(function(appRouter,itemHelper){return appRouter.showLocalLogin=function(serverId,manualLogin){Dashboard.navigate("login.html?serverid="+serverId)},appRouter.showVideoOsd=function(){return Dashboard.navigate("videoosd.html")},appRouter.showSelectServer=function(){Dashboard.navigate(AppInfo.isNativeApp?"selectserver.html":"login.html")},appRouter.showWelcome=function(){Dashboard.navigate(AppInfo.isNativeApp?"selectserver.html":"login.html")},appRouter.showSettings=function(){Dashboard.navigate("mypreferencesmenu.html")},appRouter.showGuide=function(){Dashboard.navigate("livetv.html?tab=1")},appRouter.goHome=function(){Dashboard.navigate("home.html")},appRouter.showSearch=function(){Dashboard.navigate("search.html")},appRouter.showLiveTV=function(){Dashboard.navigate("livetv.html")},appRouter.showRecordedTV=function(){Dashboard.navigate("livetv.html?tab=3")},appRouter.showFavorites=function(){Dashboard.navigate("home.html?tab=1")},appRouter.showSettings=function(){Dashboard.navigate("mypreferencesmenu.html")},appRouter.setTitle=function(title){LibraryMenu.setTitle(title)},appRouter.getRouteUrl=function(item,options){if(!item)throw new Error("item cannot be null");if(item.url)return item.url;var context=options?options.context:null,id=item.Id||item.ItemId;options||(options={});var itemType=item.Type||(options?options.itemType:null),serverId=item.ServerId||options.serverId;if("settings"===item)return"mypreferencesmenu.html";if("wizard"===item)return"wizardstart.html";if("manageserver"===item)return"dashboard.html";if("recordedtv"===item)return"livetv.html?tab=3&serverId="+options.serverId;if("nextup"===item)return"list.html?type=nextup&serverId="+options.serverId;if("list"===item){var url="list.html?serverId="+options.serverId+"&type="+options.itemTypes;return options.isFavorite&&(url+="&IsFavorite=true"),url}if("livetv"===item)return"programs"===options.section?"livetv.html?tab=0&serverId="+options.serverId:"guide"===options.section?"livetv.html?tab=1&serverId="+options.serverId:"movies"===options.section?"list.html?type=Programs&IsMovie=true&serverId="+options.serverId:"shows"===options.section?"list.html?type=Programs&IsSeries=true&IsMovie=false&IsNews=false&serverId="+options.serverId:"sports"===options.section?"list.html?type=Programs&IsSports=true&serverId="+options.serverId:"kids"===options.section?"list.html?type=Programs&IsKids=true&serverId="+options.serverId:"news"===options.section?"list.html?type=Programs&IsNews=true&serverId="+options.serverId:"onnow"===options.section?"list.html?type=Programs&IsAiring=true&serverId="+options.serverId:"dvrschedule"===options.section?"livetv.html?tab=4&serverId="+options.serverId:"seriesrecording"===options.section?"livetv.html?tab=5&serverId="+options.serverId:"livetv.html?serverId="+options.serverId;if("SeriesTimer"==itemType)return"details?seriesTimerId="+id+"&serverId="+serverId;if("livetv"==item.CollectionType)return"livetv.html";if("Genre"===item.Type)return url="list.html?genreId="+item.Id+"&serverId="+serverId,"livetv"===context&&(url+="&type=Programs"),options.parentId&&(url+="&parentId="+options.parentId),url;if("MusicGenre"===item.Type)return url="list.html?musicGenreId="+item.Id+"&serverId="+serverId,options.parentId&&(url+="&parentId="+options.parentId),url;if("Studio"===item.Type)return url="list.html?studioId="+item.Id+"&serverId="+serverId,options.parentId&&(url+="&parentId="+options.parentId),url;if("folders"!==context&&!itemHelper.isLocalItem(item)){if("movies"==item.CollectionType)return url="movies.html?topParentId="+item.Id,options&&"latest"===options.section&&(url+="&tab=1"),url;if("tvshows"==item.CollectionType)return url="tv.html?topParentId="+item.Id,options&&"latest"===options.section&&(url+="&tab=2"),url;if("music"==item.CollectionType)return"music.html?topParentId="+item.Id}return["Playlist","TvChannel","Program","BoxSet","MusicAlbum","MusicGenre","Person","Recording","MusicArtist"].indexOf(itemType)>=0?"details?id="+id+"&serverId="+serverId:"Series"==itemType||"Season"==itemType||"Episode"==itemType?"details?id="+id+(context?"&context="+context:"")+"&serverId="+serverId:item.IsFolder?id?"list.html?parentId="+id+"&serverId="+serverId:"#":"details?id="+id+"&serverId="+serverId},appRouter.showItem=function showItem(item,serverId,options){"string"==typeof item?require(["connectionManager"],(function(connectionManager){var apiClient=connectionManager.currentApiClient();apiClient.getItem(apiClient.getCurrentUserId(),item).then((function(item){appRouter.showItem(item,options)}))})):(2==arguments.length&&(options=arguments[1]),appRouter.show("/"+appRouter.getRouteUrl(item,options),{item:item}))},appRouter})),promise.then((function onWebComponentsReady(){initRequireWithBrowser(),"cordova"!==self.appMode&&"android"!==self.appMode&&"standalone"!==self.appMode||(AppInfo.isNativeApp=!0),init()}))}(),pageClassOn("viewshow","standalonePage",(function(){document.querySelector(".skinHeader").classList.add("noHeaderRight")})),pageClassOn("viewhide","standalonePage",(function(){document.querySelector(".skinHeader").classList.remove("noHeaderRight")}));