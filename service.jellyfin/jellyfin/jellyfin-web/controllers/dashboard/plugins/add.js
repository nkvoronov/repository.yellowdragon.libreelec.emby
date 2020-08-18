"use strict";define(["jQuery","loading","libraryMenu","globalize","connectionManager","emby-button"],(function($,loading,libraryMenu,globalize,connectionManager){function renderPackage(pkg,installedPlugins,page){var installedPlugin=installedPlugins.filter((function(ip){return ip.Name==pkg.name}))[0];if(function populateVersions(packageInfo,page,installedPlugin){for(var html="",i=0;i<packageInfo.versions.length;i++){var version=packageInfo.versions[i];html+='<option value="'+version.version+'">'+version.version+"</option>"}var selectmenu=$("#selectVersion",page).html(html);installedPlugin||$("#pCurrentVersion",page).hide().html("");var packageVersion=packageInfo.versions[0];packageVersion&&selectmenu.val(packageVersion.version)}(pkg,page,installedPlugin),function populateHistory(packageInfo,page){for(var html="",length=Math.min(packageInfo.versions.length,10),i=0;i<length;i++){var version=packageInfo.versions[i];html+='<h2 style="margin:.5em 0;">'+version.version+"</h2>",html+='<div style="margin-bottom:1.5em;">'+version.changelog+"</div>"}$("#revisionHistory",page).html(html)}(pkg,page),$(".pluginName",page).html(pkg.name),$("#btnInstallDiv",page).removeClass("hide"),$("#pSelectVersion",page).removeClass("hide"),pkg.overview?$("#overview",page).show().html(pkg.overview):$("#overview",page).hide(),$("#description",page).html(pkg.description),$("#developer",page).html(pkg.owner),installedPlugin){var currentVersionText=globalize.translate("MessageYouHaveVersionInstalled","<strong>"+installedPlugin.Version+"</strong>");$("#pCurrentVersion",page).show().html(currentVersionText)}else $("#pCurrentVersion",page).hide().html("");loading.hide()}function performInstallation(page,name,guid,version){var developer=$("#developer",page).html().toLowerCase(),alertCallback=function alertCallback(){loading.show(),page.querySelector("#btnInstall").disabled=!0,ApiClient.installPlugin(name,guid,version).then((function(){loading.hide(),function alertText(options){require(["alert"],(function(_ref){(0,_ref.default)(options)}))}(globalize.translate("PluginInstalledMessage"))}))};if("jellyfin"!==developer){loading.hide();var msg=globalize.translate("MessagePluginInstallDisclaimer");msg+="<br/>",msg+="<br/>",msg+=globalize.translate("PleaseConfirmPluginInstallation"),require(["confirm"],(function(confirm){confirm(msg,globalize.translate("HeaderConfirmPluginInstallation")).then((function(){alertCallback()}),(function(){console.debug("plugin not installed")}))}))}else alertCallback()}return function(view,params){$(".addPluginForm",view).on("submit",(function(){loading.show();var page=$(this).parents("#addPluginPage")[0],name=params.name,guid=params.guid;return ApiClient.getInstalledPlugins().then((function(plugins){var installedPlugin=plugins.filter((function(plugin){return plugin.Name==name}))[0],version=$("#selectVersion",page).val();installedPlugin&&installedPlugin.Version===version?(loading.hide(),Dashboard.alert({message:globalize.translate("MessageAlreadyInstalled"),title:globalize.translate("HeaderPluginInstallation")})):performInstallation(page,name,guid,version)})),!1})),view.addEventListener("viewshow",(function(){var page=this;loading.show();var name=params.name,guid=params.guid,promise1=ApiClient.getPackageInfo(name,guid),promise2=ApiClient.getInstalledPlugins();Promise.all([promise1,promise2]).then((function(responses){renderPackage(responses[0],responses[1],page)}))}))}}));