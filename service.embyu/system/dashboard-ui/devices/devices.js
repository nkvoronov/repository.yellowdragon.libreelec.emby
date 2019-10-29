define(["../list/list","loading","layoutManager","imageLoader","dom","libraryMenu","globalize","humanedate","cardBuilder","emby-linkbutton","emby-itemscontainer","cardStyle"],function(ListPage,loading,layoutManager,imageLoader,dom,libraryMenu,globalize,humanedate,cardBuilder){"use strict";function setDeviceProperies(device){device.Type="Device",device.ServerId=ApiClient.serverId();var iconUrl=device.IconUrl;iconUrl&&-1===iconUrl.indexOf("://")&&(iconUrl=ApiClient.getUrl(iconUrl)),device.ImageUrl=iconUrl}function DevicesPage(view,params){params.serverId=ApiClient.serverId(),ListPage.call(this,view,params)}return Object.assign(DevicesPage.prototype,ListPage.prototype),DevicesPage.prototype.getItems=function(sortBy,startIndex,limit){return ApiClient.getJSON(ApiClient.getUrl("Devices")).then(function(result){return result.Items.forEach(setDeviceProperies),result})},DevicesPage.prototype.setTitle=function(){},DevicesPage.prototype.getItemsHtml=function(items){return cardBuilder.getCardsHtml({items:items,shape:"backdrop",showTitle:!0,centerText:!0,overlayMoreButton:!0,overlayText:!1,multiSelect:!1,showDeviceAppInfo:!0,showDeviceUserInfo:!0,paddedImage:!0,cardLayout:!0})},DevicesPage});