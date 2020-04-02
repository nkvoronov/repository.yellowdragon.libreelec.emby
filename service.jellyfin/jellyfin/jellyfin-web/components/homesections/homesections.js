"use strict";define(["connectionManager","cardBuilder","appSettings","dom","apphost","layoutManager","imageLoader","globalize","itemShortcuts","itemHelper","appRouter","scripts/imagehelper","paper-icon-button-light","emby-itemscontainer","emby-scroller","emby-button","css!./homesections"],(function(connectionManager,cardBuilder,appSettings,dom,appHost,layoutManager,imageLoader,globalize,itemShortcuts,itemHelper,appRouter,imageHelper){function getDefaultSection(index){switch(index){case 0:return"smalllibrarytiles";case 1:return"resume";case 2:return"resumeaudio";case 3:return"livetv";case 4:return"nextup";case 5:return"latestmedia";case 6:return"none";default:return""}}function resume(elem,options){var i,length,elems=elem.querySelectorAll(".itemsContainer"),promises=[];for(i=0,length=elems.length;i<length;i++)promises.push(elems[i].resume(options));var promise=Promise.all(promises);if(!options||!1!==options.returnPromise)return promise}function loadSection(page,apiClient,user,userSettings,userViews,allSections,index){var section=allSections[index],elem=(user.Id,page.querySelector(".section"+index));if("latestmedia"===section)!function loadRecentlyAdded(elem,apiClient,user,userViews){elem.classList.remove("verticalSection");for(var excludeViewTypes=["playlists","livetv","boxsets","channels"],i=0,length=userViews.length;i<length;i++){var item=userViews[i];if(-1===user.Configuration.LatestItemsExcludes.indexOf(item.Id)&&-1===excludeViewTypes.indexOf(item.CollectionType||[])){var frag=document.createElement("div");frag.classList.add("verticalSection"),frag.classList.add("hide"),elem.appendChild(frag),renderLatestSection(frag,apiClient,user,item)}}}(elem,apiClient,user,userViews);else if("librarytiles"===section||"smalllibrarytiles"===section||"smalllibrarytiles-automobile"===section||"librarytiles-automobile"===section)loadLibraryTiles(elem,apiClient,user,userSettings,"smallBackdrop",userViews,allSections);else if("librarybuttons"===section)!function loadlibraryButtons(elem,apiClient,user,userSettings,userViews){elem.classList.remove("verticalSection");var html=function getLibraryButtonsHtml(items){var html="";html+='<div class="verticalSection verticalSection-extrabottompadding">',html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+globalize.translate("HeaderMyMedia")+"</h2>",html+='<div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x" data-multiselect="false">';for(var i=0,length=items.length;i<length;i++){var item=items[i],icon=imageHelper.getLibraryIcon(item.CollectionType);html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl(item)+'" class="raised homeLibraryButton"><i class="material-icons homeLibraryIcon '+icon+'"></i><span class="homeLibraryText">'+item.Name+"</span></a>"}return html+="</div>",html+="</div>"}(userViews);elem.innerHTML=html,imageLoader.lazyChildren(elem)}(elem,0,0,0,userViews);else if("resume"===section)!function loadResumeVideo(elem,apiClient,userId){var html="";html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+globalize.translate("HeaderContinueWatching")+"</h2>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x" data-monitor="videoplayback,markplayed">';html+="</div>";html+="</div>",elem.classList.add("hide"),elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.fetchData=function getContinueWatchingFetchFn(serverId){return function(){var apiClient=connectionManager.getApiClient(serverId),options=(dom.getWindowSize().innerWidth,{Limit:12,Recursive:!0,Fields:"PrimaryImageAspectRatio,BasicSyncInfo",ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",EnableTotalRecordCount:!1,MediaTypes:"Video"});return apiClient.getResumableItems(apiClient.getCurrentUserId(),options)}}(apiClient.serverId()),itemsContainer.getItemsHtml=getContinueWatchingItemsHtml,itemsContainer.parentContainer=elem}(elem,apiClient);else if("resumeaudio"===section)!function loadResumeAudio(elem,apiClient,userId){var html="";html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+globalize.translate("HeaderContinueWatching")+"</h2>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x" data-monitor="audioplayback,markplayed">';html+="</div>";html+="</div>",elem.classList.add("hide"),elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.fetchData=function getContinueListeningFetchFn(serverId){return function(){var apiClient=connectionManager.getApiClient(serverId),options=(dom.getWindowSize().innerWidth,{Limit:12,Recursive:!0,Fields:"PrimaryImageAspectRatio,BasicSyncInfo",ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",EnableTotalRecordCount:!1,MediaTypes:"Audio"});return apiClient.getResumableItems(apiClient.getCurrentUserId(),options)}}(apiClient.serverId()),itemsContainer.getItemsHtml=getContinueListeningItemsHtml,itemsContainer.parentContainer=elem}(elem,apiClient);else if("activerecordings"===section)!function loadLatestLiveTvRecordings(elem,activeRecordingsOnly,apiClient,userId){var title=activeRecordingsOnly?globalize.translate("HeaderActiveRecordings"):globalize.translate("HeaderLatestRecordings"),html="";html+='<div class="sectionTitleContainer sectionTitleContainer-cards">',html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+title+"</h2>",html+="</div>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">';html+="</div>";html+="</div>",elem.classList.add("hide"),elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.fetchData=function getLatestRecordingsFetchFn(serverId,activeRecordingsOnly){return function(){var apiClient=connectionManager.getApiClient(serverId);return apiClient.getLiveTvRecordings({userId:apiClient.getCurrentUserId(),Limit:12,Fields:"PrimaryImageAspectRatio,BasicSyncInfo",EnableTotalRecordCount:!1,IsLibraryItem:!!activeRecordingsOnly&&null,IsInProgress:!!activeRecordingsOnly||null})}}(apiClient.serverId(),activeRecordingsOnly),itemsContainer.getItemsHtml=function getLatestRecordingItemsHtml(activeRecordingsOnly){return function(items){return cardBuilder.getCardsHtml({items:items,shape:"autooverflow",showTitle:!0,showParentTitle:!0,coverImage:!0,lazy:!0,showDetailsMenu:!0,centerText:!0,overlayText:!1,showYear:!0,lines:2,overlayPlayButton:!activeRecordingsOnly,allowBottomPadding:!1,preferThumb:!0,cardLayout:!1,overlayMoreButton:activeRecordingsOnly,action:activeRecordingsOnly?"none":null,centerPlayButton:activeRecordingsOnly})}}(activeRecordingsOnly),itemsContainer.parentContainer=elem}(elem,!0,apiClient);else{if("nextup"!==section)return"onnow"===section||"livetv"===section?function loadOnNow(elem,apiClient,user){if(!user.Policy.EnableLiveTvAccess)return Promise.resolve();user.Id;return apiClient.getLiveTvRecommendedPrograms({userId:apiClient.getCurrentUserId(),IsAiring:!0,limit:1,ImageTypeLimit:1,EnableImageTypes:"Primary,Thumb,Backdrop",EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio"}).then((function(result){var html="";if(result.Items.length){elem.classList.remove("padded-left"),elem.classList.remove("padded-right"),elem.classList.remove("padded-bottom"),elem.classList.remove("verticalSection"),html+='<div class="verticalSection">',html+='<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">',html+='<h2 class="sectionTitle sectionTitle-cards">'+globalize.translate("LiveTV")+"</h2>",html+="</div>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true" data-scrollbuttons="false">',html+='<div class="padded-top padded-bottom scrollSlider focuscontainer-x">',html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("livetv",{serverId:apiClient.serverId(),section:"programs"})+'" class="raised"><span>'+globalize.translate("Programs")+"</span></a>",html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("livetv",{serverId:apiClient.serverId(),section:"guide"})+'" class="raised"><span>'+globalize.translate("Guide")+"</span></a>",html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("recordedtv",{serverId:apiClient.serverId()})+'" class="raised"><span>'+globalize.translate("Recordings")+"</span></a>",html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("livetv",{serverId:apiClient.serverId(),section:"dvrschedule"})+'" class="raised"><span>'+globalize.translate("Schedule")+"</span></a>",html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("livetv",{serverId:apiClient.serverId(),section:"seriesrecording"})+'" class="raised"><span>'+globalize.translate("Series")+"</span></a>",html+="</div>",html+="</div>",html+="</div>",html+="</div>",html+='<div class="verticalSection">',html+='<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">',layoutManager.tv?html+='<h2 class="sectionTitle sectionTitle-cards">'+globalize.translate("HeaderOnNow")+"</h2>":(html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("livetv",{serverId:apiClient.serverId(),section:"onnow"})+'" class="more button-flat button-flat-mini sectionTitleTextButton">',html+='<h2 class="sectionTitle sectionTitle-cards">',html+=globalize.translate("HeaderOnNow"),html+="</h2>",html+='<i class="material-icons chevron_right"></i>',html+="</a>"),html+="</div>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">',html+="</div>",html+="</div>",html+="</div>",elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.parentContainer=elem,itemsContainer.fetchData=function getOnNowFetchFn(serverId){return function(){var apiClient=connectionManager.getApiClient(serverId);return apiClient.getLiveTvRecommendedPrograms({userId:apiClient.getCurrentUserId(),IsAiring:!0,limit:24,ImageTypeLimit:1,EnableImageTypes:"Primary,Thumb,Backdrop",EnableTotalRecordCount:!1,Fields:"ChannelInfo,PrimaryImageAspectRatio"})}}(apiClient.serverId()),itemsContainer.getItemsHtml=getOnNowItemsHtml}}))}(elem,apiClient,user):(elem.innerHTML="",Promise.resolve());!function loadNextUp(elem,apiClient,userId){var html="";html+='<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">',layoutManager.tv?html+='<h2 class="sectionTitle sectionTitle-cards">'+globalize.translate("HeaderNextUp")+"</h2>":(html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl("nextup",{serverId:apiClient.serverId()})+'" class="button-flat button-flat-mini sectionTitleTextButton">',html+='<h2 class="sectionTitle sectionTitle-cards">',html+=globalize.translate("HeaderNextUp"),html+="</h2>",html+='<i class="material-icons chevron_right"></i>',html+="</a>");html+="</div>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x" data-monitor="videoplayback,markplayed">';html+="</div>";html+="</div>",elem.classList.add("hide"),elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.fetchData=function getNextUpFetchFn(serverId){return function(){var apiClient=connectionManager.getApiClient(serverId);return apiClient.getNextUpEpisodes({Limit:24,Fields:"PrimaryImageAspectRatio,SeriesInfo,DateCreated,BasicSyncInfo",UserId:apiClient.getCurrentUserId(),ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Banner,Thumb",EnableTotalRecordCount:!1})}}(apiClient.serverId()),itemsContainer.getItemsHtml=getNextUpItemsHtml,itemsContainer.parentContainer=elem}(elem,apiClient)}return Promise.resolve()}function renderLatestSection(elem,apiClient,user,parent){var html="";html+='<div class="sectionTitleContainer sectionTitleContainer-cards padded-left">',layoutManager.tv?html+='<h2 class="sectionTitle sectionTitle-cards">'+globalize.translate("LatestFromLibrary",parent.Name)+"</h2>":(html+='<a is="emby-linkbutton" href="'+appRouter.getRouteUrl(parent,{section:"latest"})+'" class="more button-flat button-flat-mini sectionTitleTextButton">',html+='<h2 class="sectionTitle sectionTitle-cards">',html+=globalize.translate("LatestFromLibrary",parent.Name),html+="</h2>",html+='<i class="material-icons chevron_right"></i>',html+="</a>"),html+="</div>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">',html+="</div>",html+="</div>",elem.innerHTML=html;var itemsContainer=elem.querySelector(".itemsContainer");itemsContainer.fetchData=function getFetchLatestItemsFn(serverId,parentId,collectionType){return function(){var apiClient=connectionManager.getApiClient(serverId),limit=16;"music"===collectionType&&(limit=30);var options={Limit:limit,Fields:"PrimaryImageAspectRatio,BasicSyncInfo",ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",ParentId:parentId};return apiClient.getLatestItems(options)}}(apiClient.serverId(),parent.Id,parent.CollectionType),itemsContainer.getItemsHtml=function getLatestItemsHtmlFn(itemType,viewType){return function(items){var shape;return shape="Channel"===itemType||"movies"===viewType||"books"===viewType?"autooverflow":"music"===viewType?"overflowSquare":"overflowBackdrop",cardBuilder.getCardsHtml({items:items,shape:shape,preferThumb:"movies"!==viewType&&"Channel"!==itemType&&"music"!==viewType?"auto":null,showUnplayedIndicator:!1,showChildCountIndicator:!0,context:"home",overlayText:!1,centerText:!0,overlayPlayButton:"photos"!==viewType,allowBottomPadding:!1,cardLayout:!1,showTitle:"photos"!==viewType,showYear:"movies"===viewType||"tvshows"===viewType||!viewType,showParentTitle:"music"===viewType||"tvshows"===viewType||!viewType||!1,lines:2})}}(parent.Type,parent.CollectionType),itemsContainer.parentContainer=elem}function loadLibraryTiles(elem,apiClient,user,userSettings,shape,userViews,allSections){var html="";userViews.length&&(html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+globalize.translate("HeaderMyMedia")+"</h2>",html+='<div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">',html+='<div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">',html+=cardBuilder.getCardsHtml({items:userViews,shape:"overflowBackdrop",showTitle:!0,centerText:!0,overlayText:!1,lazy:!0,transition:!1,allowBottomPadding:!1}),html+="</div>",html+="</div>"),elem.innerHTML=html,imageLoader.lazyChildren(elem)}function getContinueWatchingItemsHtml(items){return cardBuilder.getCardsHtml({items:items,preferThumb:!0,shape:"overflowBackdrop",overlayText:!1,showTitle:!0,showParentTitle:!0,lazy:!0,showDetailsMenu:!0,overlayPlayButton:!0,context:"home",centerText:!0,allowBottomPadding:!1,cardLayout:!1,showYear:!0,lines:2})}function getContinueListeningItemsHtml(items){return cardBuilder.getCardsHtml({items:items,preferThumb:!0,shape:"overflowBackdrop",overlayText:!1,showTitle:!0,showParentTitle:!0,lazy:!0,showDetailsMenu:!0,overlayPlayButton:!0,context:"home",centerText:!0,allowBottomPadding:!1,cardLayout:!1,showYear:!0,lines:2})}function getOnNowItemsHtml(items){return cardBuilder.getCardsHtml({items:items,preferThumb:"auto",inheritThumb:!1,shape:"autooverflow",showParentTitleOrTitle:!0,showTitle:!0,centerText:!0,coverImage:!0,overlayText:!1,allowBottomPadding:!1,showAirTime:!0,showChannelName:!1,showAirDateTime:!1,showAirEndTime:!0,defaultShape:"overflowBackdrop",lines:3,overlayPlayButton:!0})}function getNextUpItemsHtml(items){return cardBuilder.getCardsHtml({items:items,preferThumb:!0,shape:"overflowBackdrop",overlayText:!1,showTitle:!0,showParentTitle:!0,lazy:!0,overlayPlayButton:!0,context:"home",centerText:!0,allowBottomPadding:!1,cardLayout:!1})}return{loadLibraryTiles:loadLibraryTiles,getDefaultSection:getDefaultSection,loadSections:function loadSections(elem,apiClient,user,userSettings){return function getUserViews(apiClient,userId){return apiClient.getUserViews({},userId||apiClient.getCurrentUserId()).then((function(result){return result.Items}))}(apiClient,user.Id).then((function(userViews){var noLibDescription,html="";if(userViews.length){for(var i=0;i<7;i++)html+='<div class="verticalSection section'+i+'"></div>';elem.innerHTML=html,elem.classList.add("homeSectionsContainer");var promises=[],sections=function getAllSectionsToShow(userSettings,sectionCount){for(var sections=[],i=0,length=sectionCount;i<length;i++){var section=userSettings.get("homesection"+i)||getDefaultSection(i);"folders"===section&&(section=getDefaultSection(0)),sections.push(section)}return sections}(userSettings,7);for(i=0;i<sections.length;i++)promises.push(loadSection(elem,apiClient,user,userSettings,userViews,sections,i));return Promise.all(promises).then((function(){return resume(elem,{refresh:!0,returnPromise:!1})}))}noLibDescription=user.Policy&&user.Policy.IsAdministrator?Globalize.translate("NoCreatedLibraries",'<a id="button-createLibrary" class="button-link">',"</a>"):Globalize.translate("AskAdminToCreateLibrary"),html+='<div class="centerMessage padded-left padded-right">',html+="<h2>"+Globalize.translate("MessageNothingHere")+"</h2>",html+="<p>"+noLibDescription+"</p>",html+="</div>",elem.innerHTML=html;var createNowLink=elem.querySelector("#button-createLibrary");createNowLink&&createNowLink.addEventListener("click",(function(){Dashboard.navigate("library.html")}))}))},destroySections:function destroySections(elem){for(var elems=elem.querySelectorAll(".itemsContainer"),i=0;i<elems.length;i++)elems[i].fetchData=null,elems[i].parentContainer=null,elems[i].getItemsHtml=null;elem.innerHTML=""},pause:function pause(elem){for(var elems=elem.querySelectorAll(".itemsContainer"),i=0;i<elems.length;i++)elems[i].pause()},resume:resume}}));