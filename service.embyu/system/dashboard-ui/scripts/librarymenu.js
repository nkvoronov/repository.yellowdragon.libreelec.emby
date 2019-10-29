define(["serverNotifications","dom","layoutManager","inputManager","connectionManager","events","viewManager","appRouter","apphost","playbackManager","browser","globalize","appHeader","paper-icon-button-light","material-icons","scrollStyles","flexStyles"],function(serverNotifications,dom,layoutManager,inputManager,connectionManager,events,viewManager,appRouter,appHost,playbackManager,browser,globalize,appHeader){"use strict";var navDrawerElement,navDrawerInstance,currentDrawerType,currentServerId;function closeMainDrawer(){navDrawerInstance.close()}function onMainDrawerSelect(e){navDrawerInstance.isVisible?layoutManager.mobile&&document.body.classList.add("bodyWithPopupOpen"):document.body.classList.remove("bodyWithPopupOpen")}function refreshDashboardInfoInDrawer(apiClient){currentDrawerType="admin",loadNavDrawer(),navDrawerElement.querySelector(".adminDrawerLogo")?updateDashboardMenuSelectedItem():function(apiClient){(function(apiClient){return getToolsMenuLinks(apiClient).then(function(items){var i,length,item,menuHtml="";for(i=0,length=items.length;i<length;i++)(item=items[i]).href?menuHtml+=getToolsLinkHtml(item):item.name&&(menuHtml+='<h3 class="sidebarHeader">',menuHtml+=item.name,menuHtml+="</h3>");return menuHtml})})(apiClient).then(function(toolsMenuHtml){var html="";html+='<a class="adminDrawerLogo clearLink" is="emby-linkbutton" href="home.html" style="text-align:left;">',html+='<img src="bower_components/emby-webcomponents/themes/logodark.png" />',html+="</a>",html+=toolsMenuHtml,navDrawerElement.innerHTML=html,updateDashboardMenuSelectedItem()})}(apiClient)}function isUrlInCurrentView(url){return-1!==window.location.href.toString().toLowerCase().indexOf(url.toLowerCase())}var currentPageType,LibraryMenu={onHardwareMenuButtonClick:function(){navDrawerInstance.isVisible?closeMainDrawer():navDrawerInstance.open()},getToolsMenuLinks:getToolsMenuLinks};function updateDashboardMenuSelectedItem(){for(var links=navDrawerElement.querySelectorAll(".navMenuOption"),currentViewId=viewManager.currentView().id,i=0,length=links.length;i<length;i++){var link=links[i],selected=!1,pageIds=link.getAttribute("data-pageids");pageIds&&(selected=-1!==(pageIds=pageIds.split("|")).indexOf(currentViewId));var pageUrls=link.getAttribute("data-pageurls");if(pageUrls&&(selected=0<(pageUrls=pageUrls.split("|")).filter(isUrlInCurrentView).length),selected){link.classList.add("navMenuOption-selected");var title="";title+=((link=link.querySelector("span")||link).innerText||link.textContent).trim(),appHeader.setTitle(title)}else link.classList.remove("navMenuOption-selected")}}function createToolsMenuList(pluginItems){var links=[{name:globalize.translate("TabServer")},{name:globalize.translate("TabDashboard"),href:"dashboard.html",pageIds:["dashboardPage","serverActivityPage"],icon:"dashboard"},{name:globalize.translate("TabSettings"),href:"dashboardgeneral.html",pageIds:["dashboardGeneralPage"],icon:"settings"},{name:globalize.translate("TabUsers"),href:"users/users.html",pageIds:["userProfilesPage","newUserPage","editUserPage","userLibraryAccessPage","userParentalControlPage","userPasswordPage"],icon:"people"},{name:"Emby Premiere",href:"supporterkey.html",pageIds:["supporterKeyPage"],icon:"star"},{name:globalize.translate("TabLibrary"),href:"library.html",pageIds:["mediaLibraryPage","librarySettingsPage","metadataImagesConfigurationPage"],icon:"folder",color:"#38c"},{name:globalize.translate("TabTranscoding"),icon:"transform",href:"encodingsettings.html",pageIds:["encodingSettingsPage"]}];return addPluginPagesToMainMenu(links,pluginItems,"server"),links.push({divider:!0,name:globalize.translate("TabDevices")}),links.push({name:globalize.translate("TabDevices"),href:"devices/devices.html",pageIds:["devicesPage","devicePage"],icon:"devices"}),links.push({name:globalize.translate("HeaderDownloadSync"),icon:"file_download",href:"syncactivity.html",pageIds:["syncActivityPage","syncJobPage","syncSettingsPage"],color:"#009688"}),links.push({name:globalize.translate("TabCameraUpload"),href:"devicesupload.html",pageIds:["devicesUploadPage"],icon:"photo_camera"}),addPluginPagesToMainMenu(links,pluginItems,"devices"),links.push({divider:!0,name:globalize.translate("TabLiveTV")}),links.push({name:globalize.translate("TabLiveTV"),href:"livetvsetup/livetvstatus.html",pageIds:["liveTvStatusPage","liveTvTunerPage"],icon:"&#xE639;"}),links.push({name:globalize.translate("DVR"),href:"livetvsetup/livetvsettings.html",pageIds:["liveTvSettingsPage"],icon:"dvr"}),links.push({divider:!0,name:globalize.translate("TabExpert")}),links.push({name:globalize.translate("TabAdvanced"),icon:"settings",href:"dashboardhosting.html",color:"#F16834",pageIds:["dashboardHostingPage","serverSecurityPage"]}),links.push({name:globalize.translate("TabLogs"),href:"log.html",pageIds:["logPage"],icon:"folder_open"}),links.push({name:globalize.translate("TabNotifications"),icon:"notifications",color:"brown",href:"notificationsettings.html",pageIds:["notificationSettingsPage","notificationSettingPage"]}),links.push({name:globalize.translate("TabPlugins"),icon:"add_shopping_cart",color:"#9D22B1",href:"plugins/plugins.html",pageIds:["pluginsPage","pluginCatalogPage"]}),links.push({name:globalize.translate("TabScheduledTasks"),href:"scheduledtasks/scheduledtasks.html",pageIds:["scheduledTasksPage","scheduledTaskPage"],icon:"schedule"}),links.push({name:globalize.translate("MetadataManager"),href:"edititemmetadata.html",pageIds:[],icon:"mode_edit"}),addPluginPagesToMainMenu(links,pluginItems),links}function addPluginPagesToMainMenu(links,pluginItems,section){for(var i=0,length=pluginItems.length;i<length;i++){var pluginItem=pluginItems[i];Dashboard.allowPluginPages(pluginItem.PluginId)&&pluginItem.EnableInMainMenu&&pluginItem.MenuSection===section&&links.push({name:pluginItem.DisplayName,icon:pluginItem.MenuIcon||"folder",href:Dashboard.getConfigurationPageUrl(pluginItem.Name),pageUrls:[Dashboard.getConfigurationPageUrl(pluginItem.Name)]})}}function getToolsMenuLinks(apiClient){return apiClient.getJSON(apiClient.getUrl("web/configurationpages")+"?pageType=PluginConfiguration&EnableInMainMenu=true").then(createToolsMenuList,function(err){return createToolsMenuList([])})}function getToolsLinkHtml(item){var menuHtml="",pageIds=item.pageIds?item.pageIds.join("|"):"";pageIds=pageIds?' data-pageids="'+pageIds+'"':"";var pageUrls=item.pageUrls?item.pageUrls.join("|"):"";return pageUrls=pageUrls?' data-pageurls="'+pageUrls+'"':"",menuHtml+='<a is="emby-linkbutton" class="navMenuOption" href="'+item.href+'"'+pageIds+pageUrls+">",item.icon&&(menuHtml+='<i class="md-icon navMenuOptionIcon">'+item.icon+"</i>"),menuHtml+='<span class="navMenuOptionText">',menuHtml+=item.name,menuHtml+="</span>",menuHtml+="</a>"}function showBySelector(selector,show){var elem=document.querySelector(selector);elem&&(show?elem.classList.remove("hide"):elem.classList.add("hide"))}function updateLibraryMenu(user){if(!user)return showBySelector(".libraryMenuDownloads",!1),showBySelector(".lnkSyncToOtherDevices",!1),void showBySelector(".userMenuOptions",!1);user.Policy.EnableContentDownloading?showBySelector(".lnkSyncToOtherDevices",!0):showBySelector(".lnkSyncToOtherDevices",!1),user.Policy.EnableContentDownloading&&appHost.supports("sync")?showBySelector(".libraryMenuDownloads",!0):showBySelector(".libraryMenuDownloads",!1);var apiClient=connectionManager.getApiClient(user.ServerId),userId=user.Id,libraryMenuOptions=document.querySelector(".libraryMenuOptions");libraryMenuOptions&&function(apiClient,userId){return apiClient.getUserViews({},userId).then(function(result){for(var items=result.Items,list=[],i=0,length=items.length;i<length;i++){var view=items[i];if(list.push(view),"livetv"===view.CollectionType){var guideView=Object.assign({},view);guideView.Name=globalize.translate("ButtonGuide"),guideView.ImageTags={},guideView.icon="dvr",guideView.url=appRouter.getRouteUrl("livetv",{section:"guide",serverId:apiClient.serverId()}),list.push(guideView)}}return list})}(apiClient,userId).then(function(result){var items=result,html="";html+='<h3 class="sidebarHeader">',html+=globalize.translate("HeaderMedia"),html+="</h3>",html+=items.map(function(i){var icon="folder",itemId=i.Id;"channels"===i.CollectionType?itemId="channels":"livetv"===i.CollectionType&&(itemId="livetv"),"photos"===i.CollectionType?icon="photo_library":"music"===i.CollectionType||"musicvideos"===i.CollectionType?icon="library_music":"books"===i.CollectionType?icon="library_books":"playlists"===i.CollectionType?icon="view_list":"games"===i.CollectionType?icon="games":"movies"===i.CollectionType?icon="video_library":"channels"===i.CollectionType||"Channel"===i.Type?icon="videocam":"tvshows"===i.CollectionType?icon="tv":"livetv"===i.CollectionType&&(icon="live_tv"),icon=i.icon||icon;i.onclick&&i.onclick;return'<a is="emby-linkbutton" data-itemid="'+itemId+'" class="lnkMediaFolder navMenuOption" href="'+function(item,context){return appRouter.getRouteUrl(item,{context:context})}(i,i.CollectionType)+'"><i class="md-icon navMenuOptionIcon">'+icon+'</i><span class="sectionName navMenuOptionText">'+i.Name+"</span></a>"}).join(""),libraryMenuOptions.innerHTML=html})}function onMainDrawerClick(e){dom.parentWithTag(e.target,"A")&&setTimeout(closeMainDrawer,30)}function onLogoutClick(){Dashboard.logout()}function refreshLibraryDrawer(user){loadNavDrawer(),currentDrawerType="library",function(user){var html="";html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder" href="home.html"><i class="md-icon navMenuOptionIcon">&#xE88A;</i><span class="navMenuOptionText">'+globalize.translate("ButtonHome")+"</span></a>",html+='<div class="libraryMenuDownloads">',html+='<h3 class="sidebarHeader">',html+=globalize.translate("HeaderMyDownloads"),html+="</h3>",html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder" data-itemid="manageoffline" href="offline/offline.html"><i class="md-icon navMenuOptionIcon">&#xE2C7;</i><span class="navMenuOptionText">'+globalize.translate("Browse")+"</span></a>",html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder" data-itemid="manageoffline" href="managedownloads.html"><i class="md-icon navMenuOptionIcon">&#xE254;</i><span class="navMenuOptionText">'+globalize.translate("Manage")+"</span></a>",html+="</div>",html+='<div class="libraryMenuOptions">',html+="</div>";var localUser=user;localUser&&localUser.Policy.IsAdministrator&&(html+='<div class="adminMenuOptions">',html+='<h3 class="sidebarHeader">',html+=globalize.translate("HeaderAdmin"),html+="</h3>",html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder lnkManageServer" data-itemid="dashboard" href="dashboard.html"><i class="md-icon navMenuOptionIcon">&#xE8B8;</i><span class="navMenuOptionText">'+globalize.translate("ButtonManageServer")+"</span></a>",html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder editorViewMenu" data-itemid="editor" href="edititemmetadata.html"><i class="md-icon navMenuOptionIcon">&#xE2C7;</i><span class="navMenuOptionText">'+globalize.translate("MetadataManager")+"</span></a>",html+="</div>"),html+='<div class="userMenuOptions">',localUser&&(html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder lnkMySettings" href="'+appRouter.getRouteUrl("settings")+'"><i class="md-icon navMenuOptionIcon">&#xE8B8;</i><span class="navMenuOptionText">'+globalize.translate("ButtonSettings")+"</span></a>"),html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder lnkSyncToOtherDevices" data-itemid="syncotherdevices" href="mysync.html"><i class="md-icon navMenuOptionIcon">&#xE627;</i><span class="navMenuOptionText">'+globalize.translate("Sync")+"</span></a>",Dashboard.isConnectMode()&&(html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder" data-itemid="selectserver" href="selectserver.html?showuser=1"><i class="md-icon navMenuOptionIcon">&#xE308;</i><span class="navMenuOptionText">'+globalize.translate("HeaderSelectServer")+"</span></a>"),(localUser&&!localUser.EnableAutoLogin||connectionManager.isLoggedIntoConnect())&&(html+='<a is="emby-linkbutton" class="navMenuOption lnkMediaFolder btnLogout" data-itemid="logout" href="#"><i class="md-icon navMenuOptionIcon">&#xE879;</i><span class="navMenuOptionText">'+globalize.translate("HeaderSignOut")+"</span></a>"),html+="</div>",navDrawerElement.innerHTML=html;var btnLogout=navDrawerElement.querySelector(".btnLogout");btnLogout&&btnLogout.addEventListener("click",onLogoutClick)}(user),updateLibraryMenu(user)}function loadNavDrawer(){return navDrawerInstance?Promise.resolve(navDrawerInstance):((navDrawerElement=document.querySelector(".mainDrawer")).addEventListener("click",onMainDrawerClick),new Promise(function(resolve,reject){require(["navdrawer"],function(navdrawer){navDrawerInstance=new navdrawer(function(){var drawerWidth=screen.availWidth-50;return drawerWidth=Math.max(drawerWidth,240),drawerWidth=Math.min(drawerWidth,320),{target:navDrawerElement,onChange:onMainDrawerSelect,width:drawerWidth}}()),navDrawerElement.classList.remove("hide"),resolve(navDrawerInstance)})}))}return document.addEventListener("viewshow",function(e){var page=e.target,isDashboardPage=page.classList.contains("type-interior"),isLibraryPage=!isDashboardPage&&page.classList.contains("libraryPage"),apiClient=currentServerId?connectionManager.getApiClient(currentServerId):connectionManager.currentApiClient();isDashboardPage?refreshDashboardInfoInDrawer(apiClient):"library"!==currentDrawerType&&apiClient&&apiClient.getCurrentUser().then(refreshLibraryDrawer),function(isDashboardPage,isLibraryPage){var newPageType=isDashboardPage?2:isLibraryPage?1:3;if(currentPageType!==newPageType){currentPageType=newPageType;var bodyClassList=document.body.classList;isLibraryPage?(bodyClassList.remove("dashboardDocument"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!0)):isDashboardPage?(bodyClassList.add("dashboardDocument"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!0)):(bodyClassList.remove("dashboardDocument"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!1))}}(isDashboardPage,isLibraryPage),e.detail.isRestored||window.scrollTo(0,0),function(page){var i,length,isLiveTvPage=page.classList.contains("liveTvPage"),isChannelsPage=page.classList.contains("channelsPage"),isEditorPage=page.classList.contains("metadataEditorPage"),isMySyncPage=page.classList.contains("mySyncPage"),id=isLiveTvPage||isChannelsPage||isEditorPage||isMySyncPage||page.classList.contains("allLibraryPage")?"":getParameterByName("parentId")||"",elems=document.getElementsByClassName("lnkMediaFolder");for(i=0,length=elems.length;i<length;i++){var lnkMediaFolder=elems[i],itemId=lnkMediaFolder.getAttribute("data-itemid");isChannelsPage&&"channels"===itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isLiveTvPage&&"livetv"===itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isEditorPage&&"editor"===itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isMySyncPage&&"manageoffline"===itemId&&-1!==window.location.href.toString().indexOf("mode=download")?lnkMediaFolder.classList.add("navMenuOption-selected"):isMySyncPage&&"syncotherdevices"===itemId&&-1===window.location.href.toString().indexOf("mode=download")?lnkMediaFolder.classList.add("navMenuOption-selected"):id&&itemId===id?lnkMediaFolder.classList.add("navMenuOption-selected"):lnkMediaFolder.classList.remove("navMenuOption-selected")}}(page)}),events.on(connectionManager,"localusersignedin",function(e,serverId){currentDrawerType=null,currentServerId=serverId,loadNavDrawer(),connectionManager.getApiClient(serverId).getCurrentUser().then(function(user){loadNavDrawer()})}),loadNavDrawer(),LibraryMenu});