define(["jQuery","loading","appRouter","dom","globalize","fnchecked"],function($,loading,appRouter,dom,globalize){"use strict";function getSubFoldersHtml(user,folder,subFolders,folderEnabled){for(var html="",i=0,length=subFolders.length;i<length;i++){var subFolder=subFolders[i],idValue=folder.Id+"_"+subFolder.Id,checkedAttribute=user.Policy.EnableAllFolders||folderEnabled&&-1===(user.Policy.ExcludedSubFolders||[]).indexOf(idValue)?' checked="checked"':"";html+='<label style="margin: 0 0 0 2.5em;"><input type="checkbox" is="emby-checkbox" class="chkSubFolder" data-folderid="'+folder.Id+'" data-id="'+idValue+'" '+checkedAttribute+"><span>"+subFolder.Path+"</span></label>"}return html}function renderMediaFolders(page,user,mediaFolders){var html="";html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderLibraries")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">';for(var i=0,length=mediaFolders.length;i<length;i++){var folder=mediaFolders[i],isChecked=user.Policy.EnableAllFolders||-1!==user.Policy.EnabledFolders.indexOf(folder.Id),checkedAttribute=isChecked?' checked="checked"':"";html+='<div style="margin:0 0 2em;">',html+='<label style="margin:0;"><input type="checkbox" is="emby-checkbox" class="chkFolder" data-id="'+folder.Id+'" '+checkedAttribute+'><span><h3 style="margin:0;">'+folder.Name+"</h3></span></label>",html+=getSubFoldersHtml(user,folder,folder.SubFolders||[],isChecked),html+="</div>"}html+="</div>",page.querySelector(".folderAccess").innerHTML=html;var chkEnableAllFolders=page.querySelector("#chkEnableAllFolders");chkEnableAllFolders.checked=user.Policy.EnableAllFolders,function(select){var evt=document.createEvent("HTMLEvents");evt.initEvent("change",!1,!0),select.dispatchEvent(evt)}(chkEnableAllFolders)}function saveUser(user,page){user.Policy.EnableAllFolders=$("#chkEnableAllFolders",page).checked(),user.Policy.EnabledFolders=user.Policy.EnableAllFolders?[]:$(".chkFolder",page).get().filter(function(c){return c.checked}).map(function(c){return c.getAttribute("data-id")}),user.Policy.ExcludedSubFolders=user.Policy.EnableAllFolders?[]:$(".chkSubFolder",page).get().filter(function(c){return!c.checked}).map(function(c){return c.getAttribute("data-id")}),user.Policy.EnableAllChannels=$("#chkEnableAllChannels",page).checked(),user.Policy.EnabledChannels=user.Policy.EnableAllChannels?[]:$(".chkChannel",page).get().filter(function(c){return c.checked}).map(function(c){return c.getAttribute("data-id")}),user.Policy.EnableAllDevices=$("#chkEnableAllDevices",page).checked(),user.Policy.EnabledDevices=user.Policy.EnableAllDevices?[]:$(".chkDevice",page).get().filter(function(c){return c.checked}).map(function(c){return c.getAttribute("data-id")}),user.Policy.BlockedChannels=null,user.Policy.BlockedMediaFolders=null,ApiClient.updateUserPolicy(user.Id,user.Policy).then(function(){loading.hide(),require(["toast"],function(toast){toast(globalize.translate("SettingsSaved"))})})}function onSubmit(){var page=$(this).parents(".page");loading.show();var userId=getParameterByName("userId");return ApiClient.getUser(userId).then(function(result){saveUser(result,page)}),!1}function onFolderChange(e){var target=e.target,page=dom.parentWithClass(target,"page");target.classList.contains("chkFolder")?function(page,folderId,checked){for(var elems=page.querySelectorAll('.chkSubFolder[data-folderid="'+folderId+'"]'),i=0,length=elems.length;i<length;i++)elems[i].checked=checked}(page,target.getAttribute("data-id"),target.checked):target.classList.contains("chkSubFolder")&&function(page,folderId){var elem=page.querySelector('.chkFolder[data-id="'+folderId+'"]');if(elem){var elems=page.querySelectorAll('.chkSubFolder[data-folderid="'+folderId+'"]');if(elems.length){for(var numChecked=0,numUnchecked=0,i=0,length=elems.length;i<length;i++)elems[i].checked?numChecked++:numUnchecked++;numChecked||numChecked===elems.length?elem.checked=!0:numUnchecked===elems.length&&(elem.checked=!1)}}}(page,target.getAttribute("data-folderid"))}$(document).on("pageinit","#userLibraryAccessPage",function(){var page=this;$("#chkEnableAllDevices",page).on("change",function(){this.checked?$(".deviceAccessListContainer",page).hide():$(".deviceAccessListContainer",page).show()}),$("#chkEnableAllChannels",page).on("change",function(){this.checked?$(".channelAccessListContainer",page).hide():$(".channelAccessListContainer",page).show()}),page.querySelector(".folderAccess").addEventListener("change",onFolderChange),page.querySelector("#chkEnableAllFolders").addEventListener("change",function(){this.checked?page.querySelector(".folderAccessListContainer").classList.add("hide"):page.querySelector(".folderAccessListContainer").classList.remove("hide")}),$(".userLibraryAccessForm").off("submit",onSubmit).on("submit",onSubmit);for(var userId=getParameterByName("userId"),btns=page.querySelectorAll(".userEditTabButton"),i=0,length=btns.length;i<length;i++)btns[i].href=btns[i].getAttribute("data-href")+"?userId="+userId}).on("pageshow","#userLibraryAccessPage",function(){var page=this;loading.show();var promise1,userId=getParameterByName("userId");if(userId)promise1=ApiClient.getUser(userId);else{var deferred=$.Deferred();deferred.resolveWith(null,[{Configuration:{}}]),promise1=deferred.promise()}var promise5=ApiClient.getJSON(ApiClient.getUrl("Channels")),promise6=ApiClient.getJSON(ApiClient.getUrl("Devices"));Promise.all([promise1,promise5,promise6]).then(function(responses){var user=responses[0];page.querySelector(".username").innerHTML=user.Name,appRouter.setTitle(user.Name),function(page,user,channels){var html="";html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderChannels")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">';for(var i=0,length=channels.length;i<length;i++){var folder=channels[i],checkedAttribute=user.Policy.EnableAllChannels||-1!==user.Policy.EnabledChannels.indexOf(folder.Id)?' checked="checked"':"";html+='<label><input type="checkbox" is="emby-checkbox" class="chkChannel" data-id="'+folder.Id+'" '+checkedAttribute+"><span>"+folder.Name+"</span></label>"}html+="</div>",$(".channelAccess",page).show().html(html),channels.length?$(".channelAccessContainer",page).show():$(".channelAccessContainer",page).hide(),$("#chkEnableAllChannels",page).checked(user.Policy.EnableAllChannels).trigger("change")}(page,user,responses[1].Items),function(page,user,devices){var html="";html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderDevices")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">';for(var i=0,length=devices.length;i<length;i++){var device=devices[i],checkedAttribute=user.Policy.EnableAllDevices||-1!==user.Policy.EnabledDevices.indexOf(device.Id)?' checked="checked"':"";html+='<label><input type="checkbox" is="emby-checkbox" class="chkDevice" data-id="'+device.Id+'" '+checkedAttribute+"><span>"+device.Name+" - "+device.AppName+"</span></label>"}html+="</div>",$(".deviceAccess",page).show().html(html),$("#chkEnableAllDevices",page).checked(user.Policy.EnableAllDevices).trigger("change"),user.Policy.IsAdministrator?page.querySelector(".deviceAccessContainer").classList.add("hide"):page.querySelector(".deviceAccessContainer").classList.remove("hide")}(page,user,responses[2].Items),function(page,user){ApiClient.getJSON(ApiClient.getUrl("Library/SelectableMediaFolders")).then(function(mediaFolders){renderMediaFolders(page,user,mediaFolders)},function(){ApiClient.getJSON(ApiClient.getUrl("Library/MediaFolders",{IsHidden:!1})).then(function(result){renderMediaFolders(page,user,result.Items)})})}(page,user),loading.hide()})})});