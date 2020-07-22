"use strict";define(["globalize","loading","libraryMenu","emby-checkbox","emby-button","emby-button"],(function(globalize,loading,libraryMenu){function getTabs(){return[{href:"library.html",name:globalize.translate("HeaderLibraries")},{href:"librarydisplay.html",name:globalize.translate("TabDisplay")},{href:"metadataimages.html",name:globalize.translate("TabMetadata")},{href:"metadatanfo.html",name:globalize.translate("TabNfoSettings")}]}return function(view,params){view.querySelector("form").addEventListener("submit",(function(e){loading.show();var form=this;return ApiClient.getServerConfiguration().then((function(config){config.EnableFolderView=form.querySelector(".chkFolderView").checked,config.EnableGroupingIntoCollections=form.querySelector(".chkGroupMoviesIntoCollections").checked,config.DisplaySpecialsWithinSeasons=form.querySelector(".chkDisplaySpecialsWithinSeasons").checked,config.EnableExternalContentInSuggestions=form.querySelector(".chkExternalContentInSuggestions").checked,config.SaveMetadataHidden=form.querySelector("#chkSaveMetadataHidden").checked,ApiClient.updateServerConfiguration(config).then(Dashboard.processServerConfigurationUpdateResult)})),ApiClient.getNamedConfiguration("metadata").then((function(config){config.UseFileCreationTimeForDateAdded="1"===$("#selectDateAdded",form).val(),ApiClient.updateNamedConfiguration("metadata",config)})),e.preventDefault(),loading.hide(),!1})),view.addEventListener("viewshow",(function(){libraryMenu.setTabs("librarysetup",1,getTabs),function loadData(){ApiClient.getServerConfiguration().then((function(config){view.querySelector(".chkFolderView").checked=config.EnableFolderView,view.querySelector(".chkGroupMoviesIntoCollections").checked=config.EnableGroupingIntoCollections,view.querySelector(".chkDisplaySpecialsWithinSeasons").checked=config.DisplaySpecialsWithinSeasons,view.querySelector(".chkExternalContentInSuggestions").checked=config.EnableExternalContentInSuggestions,view.querySelector("#chkSaveMetadataHidden").checked=config.SaveMetadataHidden})),ApiClient.getNamedConfiguration("metadata").then((function(metadata){view.querySelector("#selectDateAdded").selectedIndex=metadata.UseFileCreationTimeForDateAdded?1:0}))}(),ApiClient.getSystemInfo().then((function(info){"Windows"===info.OperatingSystem?view.querySelector(".fldSaveMetadataHidden").classList.remove("hide"):view.querySelector(".fldSaveMetadataHidden").classList.add("hide")}))}))}}));