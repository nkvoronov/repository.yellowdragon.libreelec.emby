define(["dom","loading","mainTabsManager","globalize","listViewStyle","emby-checkbox","emby-button","emby-input","emby-select"],function(dom,loading,mainTabsManager,globalize){"use strict";function loadPage(page){var promises=[ApiClient.getServerConfiguration(),function(select){return ApiClient.getCultures().then(function(languages){var html="";html+="<option value=''></option>";for(var i=0,length=languages.length;i<length;i++){var culture=languages[i];html+="<option value='"+culture.TwoLetterISOLanguageName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html})}(page.querySelector("#selectLanguage")),function(select){return ApiClient.getCountries().then(function(allCountries){var html="";html+="<option value=''></option>";for(var i=0,length=allCountries.length;i<length;i++){var culture=allCountries[i];html+="<option value='"+culture.TwoLetterISORegionName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html})}(page.querySelector("#selectCountry"))];Promise.all(promises).then(function(responses){var config=responses[0];page.querySelector("#selectLanguage").value=config.PreferredMetadataLanguage||"",page.querySelector("#selectCountry").value=config.MetadataCountryCode||"",loading.hide()})}function onSubmit(e){var form=this;return loading.show(),ApiClient.getServerConfiguration().then(function(config){config.PreferredMetadataLanguage=form.querySelector("#selectLanguage").value,config.MetadataCountryCode=form.querySelector("#selectCountry").value,ApiClient.updateServerConfiguration(config).then(Dashboard.processServerConfigurationUpdateResult)}),e.preventDefault(),e.stopPropagation(),!1}function getTabs(){return[{href:"library.html",name:globalize.translate("HeaderLibraries")},{href:"metadataimages.html",name:globalize.translate("TabMetadata")},{href:"librarysettings.html",name:globalize.translate("TabAdvanced")}]}return function(view,params){view.querySelector("form").addEventListener("submit",onSubmit),view.addEventListener("viewshow",function(){mainTabsManager.setTabs(this,1,getTabs),loading.show();loadPage(this)})}});