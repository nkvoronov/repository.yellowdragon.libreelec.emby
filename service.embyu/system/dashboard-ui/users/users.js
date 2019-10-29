define(["../list/list","cardBuilder","layoutManager","loading","dom","globalize","humanedate","paper-icon-button-light","cardStyle","emby-linkbutton","emby-button","indicators","flexStyles"],function(ListPage,cardBuilder,layoutManager,loading,dom,globalize,humanedate){"use strict";function showNewUserDialog(e){Dashboard.navigate("usernew.html")}function setUserProperies(user){user.ServerId=ApiClient.serverId()}function UsersPage(view,params){params.serverId=ApiClient.serverId(),ListPage.call(this,view,params),view.querySelector(".btnAddUser").addEventListener("click",showNewUserDialog)}return Object.assign(UsersPage.prototype,ListPage.prototype),UsersPage.prototype.getItems=function(sortBy,startIndex,limit){return ApiClient.getUsers().then(function(result){return result.forEach(setUserProperies),result})},UsersPage.prototype.setTitle=function(){},UsersPage.prototype.getItemsHtml=function(items){return cardBuilder.getCardsHtml({items:items,shape:"auto",showTitle:!0,showUserLastSeen:!0,centerText:!0,overlayText:!1,multiSelect:!1,cardLayout:!0})},UsersPage});