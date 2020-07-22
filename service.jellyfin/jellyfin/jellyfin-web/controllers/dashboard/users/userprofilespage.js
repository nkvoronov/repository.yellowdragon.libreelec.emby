"use strict";define(["loading","dom","globalize","date-fns","dfnshelper","paper-icon-button-light","cardStyle","emby-button","indicators","flexStyles"],(function(loading,dom,globalize,datefns,dfnshelper){function showUserMenu(elem){var card=dom.parentWithClass(elem,"card"),page=dom.parentWithClass(card,"page"),userId=card.getAttribute("data-userid"),menuItems=[];menuItems.push({name:globalize.translate("ButtonOpen"),id:"open",icon:"mode_edit"}),menuItems.push({name:globalize.translate("ButtonLibraryAccess"),id:"access",icon:"lock"}),menuItems.push({name:globalize.translate("ButtonParentalControl"),id:"parentalcontrol",icon:"person"}),menuItems.push({name:globalize.translate("ButtonDelete"),id:"delete",icon:"delete"}),require(["actionsheet"],(function(actionsheet){actionsheet.show({items:menuItems,positionTo:card,callback:function callback(id){switch(id){case"open":Dashboard.navigate("useredit.html?userId="+userId);break;case"access":Dashboard.navigate("userlibraryaccess.html?userId="+userId);break;case"parentalcontrol":Dashboard.navigate("userparentalcontrol.html?userId="+userId);break;case"delete":!function deleteUser(page,id){var msg=globalize.translate("DeleteUserConfirmation");require(["confirm"],(function(confirm){confirm({title:globalize.translate("DeleteUser"),text:msg,confirmText:globalize.translate("ButtonDelete"),primary:"delete"}).then((function(){loading.show(),ApiClient.deleteUser(id).then((function(){loadData(page)}))}))}))}(page,userId)}}})}))}function getUserHtml(user,addConnectIndicator){var imgUrl,html="",cssClass="card squareCard scalableCard squareCard-scalable";user.Policy.IsDisabled&&(cssClass+=" grayscale"),html+="<div data-userid='"+user.Id+"' class='"+cssClass+"'>",html+='<div class="cardBox visualCardBox">',html+='<div class="cardScalable visualCardBox-cardScalable">',html+='<div class="cardPadder cardPadder-square"></div>',html+='<a is="emby-linkbutton" class="cardContent" href="useredit.html?userId='+user.Id+'">',user.PrimaryImageTag&&(imgUrl=ApiClient.getUserImageUrl(user.Id,{width:300,tag:user.PrimaryImageTag,type:"Primary"}));var imageClass="cardImage";user.Policy.IsDisabled&&(imageClass+=" disabledUser"),imgUrl?html+='<div class="'+imageClass+'" style="background-image:url(\''+imgUrl+"');\">":(html+='<div class="'+imageClass+' flex align-items-center justify-content-center">',html+='<span class="material-icons cardImageIcon person"></span>'),html+="</div>",html+="</a>",html+="</div>",html+='<div class="cardFooter visualCardBox-cardFooter">',html+='<div class="cardText flex align-items-center">',html+='<div class="flex-grow" style="overflow:hidden;text-overflow:ellipsis;">',html+=user.Name,html+="</div>",html+='<button type="button" is="paper-icon-button-light" class="btnUserMenu flex-shrink-zero"><span class="material-icons more_vert"></span></button>',html+="</div>",html+='<div class="cardText cardText-secondary">';var lastSeen=function getLastSeenText(lastActivityDate){if(lastActivityDate)return globalize.translate("LastSeen",datefns.formatDistanceToNow(Date.parse(lastActivityDate),dfnshelper.localeWithSuffix));return""}(user.LastActivityDate);return html+=""!=lastSeen?lastSeen:"&nbsp;",html+="</div>",html+="</div>",(html+="</div>")+"</div>"}function renderUsers(page,users){page.querySelector(".localUsers").innerHTML=function getUserSectionHtml(users,addConnectIndicator){return users.map((function(u__q){return getUserHtml(u__q)})).join("")}(users)}function showPendingUserMenu(elem){var menuItems=[];menuItems.push({name:globalize.translate("ButtonCancel"),id:"delete",icon:"delete"}),require(["actionsheet"],(function(actionsheet){var card=dom.parentWithClass(elem,"card"),page=dom.parentWithClass(card,"page"),id=card.getAttribute("data-id");actionsheet.show({items:menuItems,positionTo:card,callback:function callback(menuItemId){switch(menuItemId){case"delete":!function cancelAuthorization(page,id){loading.show(),ApiClient.ajax({type:"DELETE",url:ApiClient.getUrl("Connect/Pending",{Id:id})}).then((function(){loadData(page)}))}(page,id)}}})}))}function getPendingUserHtml(user){var html="";return html+="<div data-id='"+user.Id+"' class='card squareCard scalableCard squareCard-scalable'>",html+='<div class="cardBox cardBox-bottompadded visualCardBox">',html+='<div class="cardScalable visualCardBox-cardScalable">',html+='<div class="cardPadder cardPadder-square"></div>',html+='<a class="cardContent cardImageContainer" is="emby-linkbutton" href="#">',user.ImageUrl?(html+='<div class="cardImage" style="background-image:url(\''+user.ImageUrl+"');\">",html+="</div>"):html+='<span class="cardImageIcon material-icons person"></span>',html+="</a>",html+="</div>",html+='<div class="cardFooter visualCardBox-cardFooter">',html+='<div class="cardText" style="text-align:right; float:right;padding:0;">',html+='<button type="button" is="paper-icon-button-light" class="btnUserMenu"><span class="material-icons more_vert"></span></button>',html+="</div>",html+='<div class="cardText" style="padding-top:10px;padding-bottom:10px;">',html+=user.UserName,html+="</div>",html+="</div>",(html+="</div>")+"</div>"}function loadData(page){loading.show(),ApiClient.getUsers().then((function(users){renderUsers(page,users),loading.hide()})),function renderPendingGuests(page,users){users.length?page.querySelector(".sectionPendingGuests").classList.remove("hide"):page.querySelector(".sectionPendingGuests").classList.add("hide"),page.querySelector(".pending").innerHTML=users.map(getPendingUserHtml).join("")}(page,[])}pageIdOn("pageinit","userProfilesPage",(function(){this.querySelector(".btnAddUser").addEventListener("click",(function(){Dashboard.navigate("usernew.html")})),this.querySelector(".localUsers").addEventListener("click",(function(e__e){var btnUserMenu=dom.parentWithClass(e__e.target,"btnUserMenu");btnUserMenu&&showUserMenu(btnUserMenu)})),this.querySelector(".pending").addEventListener("click",(function(e__r){var btnUserMenu=dom.parentWithClass(e__r.target,"btnUserMenu");btnUserMenu&&showPendingUserMenu(btnUserMenu)}))})),pageIdOn("pagebeforeshow","userProfilesPage",(function(){loadData(this)}))}));