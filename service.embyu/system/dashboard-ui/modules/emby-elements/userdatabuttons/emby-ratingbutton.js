define(["browser","connectionManager","serverNotifications","events","globalize","emby-button"],function(browser,connectionManager,serverNotifications,events,globalize,EmbyButton){"use strict";function onClick(e){var button=this,id=button.getAttribute("data-id"),serverId=button.getAttribute("data-serverid"),apiClient=connectionManager.getApiClient(serverId),likes=this.getAttribute("data-likes");likes="true"===likes||"false"!==likes&&null,function(button,apiClient,itemId,likes,isFavorite){return apiClient.updateFavoriteStatus(apiClient.getCurrentUserId(),itemId,!isFavorite)}(0,apiClient,id,0,"true"===this.getAttribute("data-isfavorite")).then(function(userData){setState(button,userData.Likes,userData.IsFavorite)})}function onUserDataChanged(e,apiClient,userData){userData.ItemId===this.getAttribute("data-id")&&setState(this,userData.Likes,userData.IsFavorite)}function setState(button,likes,isFavorite,updateAttribute){var icon=button.querySelector("i");isFavorite?(icon&&(icon.innerHTML="&#xE87D;",icon.classList.add("ratingbutton-icon-withrating")),button.classList.add("ratingbutton-withrating")):(icon&&(icon.innerHTML="&#xE87D;",icon.classList.remove("ratingbutton-icon-withrating")),button.classList.remove("ratingbutton-withrating")),!1!==updateAttribute&&(button.setAttribute("data-isfavorite",isFavorite),button.setAttribute("data-likes",null===likes?"":likes))}function clearEvents(button){button.removeEventListener("click",onClick),function(instance,name){var handler=instance[name];handler&&(events.off(serverNotifications,name,handler),instance[name]=null)}(button,"UserDataChanged")}function bindEvents(button){clearEvents(button),button.addEventListener("click",onClick),function(instance,name,handler){var localHandler=handler.bind(instance);events.on(serverNotifications,name,localHandler),instance[name]=localHandler}(button,"UserDataChanged",onUserDataChanged)}function _connectedCallback(){var itemId=this.getAttribute("data-id"),serverId=this.getAttribute("data-serverid");if(itemId&&serverId){var likes=this.getAttribute("data-likes"),isFavorite="true"===this.getAttribute("data-isfavorite");setState(this,likes="true"===likes||"false"!==likes&&null,isFavorite,!1),bindEvents(this)}!function(button){button.title=globalize.translate("Favorite");var text=button.querySelector(".button-text");text&&(text.innerHTML=button.title)}(this)}function _disconnectedCallback(){clearEvents(this)}function _setItem(item){if(item){this.setAttribute("data-id",item.Id),this.setAttribute("data-serverid",item.ServerId);var userData=item.UserData||{};setState(this,userData.Likes,userData.IsFavorite),bindEvents(this)}else this.removeAttribute("data-id"),this.removeAttribute("data-serverid"),this.removeAttribute("data-likes"),this.removeAttribute("data-isfavorite"),clearEvents(this)}if(window.customElements){var EmbyRatingButton=function(_EmbyButton){function EmbyRatingButton(){var _this;babelHelpers.classCallCheck(this,EmbyRatingButton);var self=_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(EmbyRatingButton).call(this));return babelHelpers.possibleConstructorReturn(_this,self)}return babelHelpers.inherits(EmbyRatingButton,_EmbyButton),babelHelpers.createClass(EmbyRatingButton,[{key:"connectedCallback",value:function(){browser.customBuiltInElements||EmbyButton.prototype.connectedCallback.call(this),_connectedCallback.call(this)}},{key:"disconnectedCallback",value:function(){browser.customBuiltInElements||EmbyButton.prototype.disconnectedCallback.call(this),_disconnectedCallback.call(this)}},{key:"setItem",value:function(item){_setItem.call(this,item)}}]),EmbyRatingButton}(EmbyButton);customElements.define("emby-ratingbutton",EmbyRatingButton,{extends:"button"})}else if(document.registerElement){var EmbyRatingButtonPrototype=Object.create(EmbyButton);EmbyRatingButtonPrototype.createdCallback=function(){EmbyButton.createdCallback&&EmbyButton.createdCallback.call(this)},EmbyRatingButtonPrototype.attachedCallback=function(){EmbyButton.attachedCallback&&EmbyButton.attachedCallback.call(this),_connectedCallback.call(this)},EmbyRatingButtonPrototype.detachedCallback=function(){EmbyButton.detachedCallback&&EmbyButton.detachedCallback.call(this),_disconnectedCallback.call(this)},EmbyRatingButtonPrototype.setItem=_setItem,document.registerElement("emby-ratingbutton",{prototype:EmbyRatingButtonPrototype,extends:"button"})}});