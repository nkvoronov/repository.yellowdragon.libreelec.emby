"use strict";define(["dialogHelper","loading","connectionManager","globalize","actionsheet","emby-input","paper-icon-button-light","emby-button","listViewStyle","material-icons","formDialogStyle"],(function(dialogHelper,loading,connectionManager,globalize,actionsheet){return function(options){function parentWithClass(elem,className){for(;!elem.classList||!elem.classList.contains(className);)if(!(elem=elem.parentNode))return null;return elem}function onChannelsElementClick(e){var btnMap=parentWithClass(e.target,"btnMap");if(btnMap){var channelId=btnMap.getAttribute("data-id"),providerChannelId=btnMap.getAttribute("data-providerid"),menuItems=currentMappingOptions.ProviderChannels.map((function(m){return{name:m.Name,id:m.Id,selected:m.Id.toLowerCase()===providerChannelId.toLowerCase()}})).sort((function(a,b){return a.name.localeCompare(b.name)}));actionsheet.show({positionTo:btnMap,items:menuItems}).then((function(newChannelId){!function mapChannel(button,channelId,providerChannelId){loading.show();var providerId=options.providerId;connectionManager.getApiClient(options.serverId).ajax({type:"POST",url:ApiClient.getUrl("LiveTv/ChannelMappings"),data:{providerId:providerId,tunerChannelId:channelId,providerChannelId:providerChannelId},dataType:"json"}).then((function(mapping){var listItem=parentWithClass(button,"listItem");button.setAttribute("data-providerid",mapping.ProviderChannelId),listItem.querySelector(".secondary").innerHTML=getMappingSecondaryName(mapping,currentMappingOptions.ProviderName),loading.hide()}))}(btnMap,channelId,newChannelId)}))}}function getMappingSecondaryName(mapping,providerName){return(mapping.ProviderChannelName||"")+" - "+providerName}function initEditor(dlg,options){(function getChannelMappingOptions(serverId,providerId){var apiClient=connectionManager.getApiClient(serverId);return apiClient.getJSON(apiClient.getUrl("LiveTv/ChannelMappingOptions",{providerId:providerId}))})(options.serverId,options.providerId).then((function(result){currentMappingOptions=result;var channelsElement=dlg.querySelector(".channels");channelsElement.innerHTML=result.TunerChannels.map((function(channel){return function getTunerChannelHtml(channel,providerName){var html="";return html+='<div class="listItem">',html+='<i class="material-icons listItemIcon">dvr</i>',html+='<div class="listItemBody two-line">',html+='<h3 class="listItemBodyText">',html+=channel.Name,html+="</h3>",html+='<div class="secondary listItemBodyText">',channel.ProviderChannelName&&(html+=getMappingSecondaryName(channel,providerName)),html+="</div>",html+="</div>",(html+='<button class="btnMap autoSize" is="paper-icon-button-light" type="button" data-id="'+channel.Id+'" data-providerid="'+channel.ProviderChannelId+'"><i class="material-icons mode_edit"></i></button>')+"</div>"}(channel,result.ProviderName)})).join(""),channelsElement.addEventListener("click",onChannelsElementClick)}))}var currentMappingOptions;this.show=function(){var dialogOptions={removeOnClose:!0,size:"small"},dlg=dialogHelper.createDialog(dialogOptions);dlg.classList.add("formDialog"),dlg.classList.add("ui-body-a"),dlg.classList.add("background-theme-a");var html="";return html+='<div class="formDialogHeader">',html+='<button is="paper-icon-button-light" class="btnCancel autoSize" tabindex="-1"><i class="material-icons arrow_back"></i></button>',html+='<h3 class="formDialogHeaderTitle">',html+=globalize.translate("MapChannels"),html+="</h3>",html+="</div>",html+=function getEditorHtml(){var html="";return html+='<div class="formDialogContent">',html+='<div class="dialogContentInner dialog-content-centered">',html+='<form style="margin:auto;">',html+="<h1>"+globalize.translate("HeaderChannels")+"</h1>",html+='<div class="channels paperList">',html+="</div>",html+="</form>",(html+="</div>")+"</div>"}(),dlg.innerHTML=html,initEditor(dlg,options),dlg.querySelector(".btnCancel").addEventListener("click",(function(){dialogHelper.close(dlg)})),new Promise((function(resolve,reject){dlg.addEventListener("close",resolve),dialogHelper.open(dlg)}))}}}));