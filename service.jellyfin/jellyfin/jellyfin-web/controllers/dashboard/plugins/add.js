"use strict";define(["jQuery","loading","libraryMenu","globalize","connectionManager","emby-button"],(function($,loading,libraryMenu,globalize,connectionManager){function renderPackage(pkg,installedPlugins,page){var installedPlugin=installedPlugins.filter((function(ip){return ip.Name==pkg.name}))[0];if(function populateVersions(packageInfo,page,installedPlugin){for(var html="",i=0;i<packageInfo.versions.length;i++){var version=packageInfo.versions[i];html+='<option value="'+version.versionStr+"|"+version.classification+'">'+version.versionStr+" ("+version.classification+")</option>"}var selectmenu=$("#selectVersion",page).html(html);installedPlugin||$("#pCurrentVersion",page).hide().html("");var packageVersion=packageInfo.versions.filter((function(current){return"Release"==current.classification}))[0];if(packageVersion=packageVersion||packageInfo.versions.filter((function(current){return"Beta"==current.classification}))[0]){var val=packageVersion.versionStr+"|"+packageVersion.classification;selectmenu.val(val)}}(pkg,page,installedPlugin),function populateHistory(packageInfo,page){for(var html="",length=Math.min(packageInfo.versions.length,10),i=0;i<length;i++){var version=packageInfo.versions[i];html+='<h2 style="margin:.5em 0;">'+version.versionStr+" ("+version.classification+")</h2>",html+='<div style="margin-bottom:1.5em;">'+version.description+"</div>"}$("#revisionHistory",page).html(html)}(pkg,page),$(".pluginName",page).html(pkg.name),"Server"==pkg.targetSystem)$("#btnInstallDiv",page).removeClass("hide"),$("#nonServerMsg",page).hide(),$("#pSelectVersion",page).removeClass("hide");else{$("#btnInstallDiv",page).addClass("hide"),$("#pSelectVersion",page).addClass("hide");var msg=globalize.translate("MessageInstallPluginFromApp");$("#nonServerMsg",page).html(msg).show()}if(pkg.shortDescription?$("#tagline",page).show().html(pkg.shortDescription):$("#tagline",page).hide(),$("#overview",page).html(pkg.overview||""),$("#developer",page).html(pkg.owner),pkg.richDescUrl?($("#pViewWebsite",page).show(),$("#pViewWebsite a",page).attr("href",pkg.richDescUrl)):$("#pViewWebsite",page).hide(),pkg.previewImage||pkg.thumbImage){var img=pkg.previewImage?pkg.previewImage:pkg.thumbImage;$("#pPreviewImage",page).show().html("<img class='pluginPreviewImg' src='"+img+"' style='max-width: 100%;' />")}else $("#pPreviewImage",page).hide().html("");if(installedPlugin){var currentVersionText=globalize.translate("MessageYouHaveVersionInstalled").replace("{0}","<strong>"+installedPlugin.Version+"</strong>");$("#pCurrentVersion",page).show().html(currentVersionText)}else $("#pCurrentVersion",page).hide().html("");loading.hide()}function performInstallation(page,packageName,guid,updateClass,version){var developer=$("#developer",page).html().toLowerCase(),alertCallback=function alertCallback(){loading.show(),page.querySelector("#btnInstall").disabled=!0,ApiClient.installPlugin(packageName,guid,updateClass,version).then((function(){loading.hide(),function alertText(options){require(["alert"],(function(alert){alert(options)}))}(globalize.translate("PluginInstalledMessage"))}))};if("jellyfin"!==developer){loading.hide();var msg=globalize.translate("MessagePluginInstallDisclaimer");msg+="<br/>",msg+="<br/>",msg+=globalize.translate("PleaseConfirmPluginInstallation"),require(["confirm"],(function(confirm){confirm(msg,globalize.translate("HeaderConfirmPluginInstallation")).then((function(){alertCallback()}),(function(){console.debug("plugin not installed")}))}))}else alertCallback()}return function(view,params){$(".addPluginForm",view).on("submit",(function(){loading.show();var page=$(this).parents("#addPluginPage")[0],name=params.name,guid=params.guid;return ApiClient.getInstalledPlugins().then((function(plugins){var installedPlugin=plugins.filter((function(plugin){return plugin.Name==name}))[0],vals=$("#selectVersion",page).val().split("|"),version=vals[0];installedPlugin?installedPlugin.Version===version&&(loading.hide(),Dashboard.alert({message:globalize.translate("MessageAlreadyInstalled"),title:globalize.translate("HeaderPluginInstallation")})):performInstallation(page,name,guid,vals[1],version)})),!1})),view.addEventListener("viewshow",(function(){var page=this;loading.show();var name=params.name,guid=params.guid,promise1=ApiClient.getPackageInfo(name,guid),promise2=ApiClient.getInstalledPlugins();Promise.all([promise1,promise2]).then((function(responses){renderPackage(responses[0],responses[1],page)}))}))}}));