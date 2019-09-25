define(["browser","css!./emby-collapse","emby-button"],function(browser){"use strict";function onButtonClick(e){var collapseContent=this.parentNode.querySelector(".collapseContent");collapseContent.expanded?(collapseContent.expanded=!1,function(button,elem){elem.style.height=elem.offsetHeight+"px",elem.offsetHeight,elem.classList.remove("expanded"),elem.style.height="0",setTimeout(function(){elem.classList.contains("expanded")?elem.classList.remove("hide"):elem.classList.add("hide")},300),button.querySelector("i").classList.remove("emby-collapse-expandIconExpanded")}(this,collapseContent)):(collapseContent.expanded=!0,function(button,elem){elem.classList.remove("hide"),elem.classList.add("expanded"),elem.style.height="auto";var height=elem.offsetHeight+"px";elem.style.height="0",elem.offsetHeight,elem.style.height=height,setTimeout(function(){elem.classList.contains("expanded")?elem.classList.remove("hide"):elem.classList.add("hide"),elem.style.height="auto"},300),button.querySelector("i").classList.add("emby-collapse-expandIconExpanded")}(this,collapseContent))}function onInit(){this.hasInit||(this.hasInit=!0)}function _connectedCallback(){if(!this.classList.contains("emby-collapse")){this.classList.add("emby-collapse");var collapseContent=this.querySelector(".collapseContent");collapseContent&&collapseContent.classList.add("hide");var title=this.getAttribute("title"),html='<button is="emby-button" type="button" on-click="toggleExpand" id="expandButton" class="emby-collapsible-button iconRight"><h3 class="emby-collapsible-title" title="'+title+'">'+title+'</h3><i class="md-icon emby-collapse-expandIcon">expand_more</i></button>';this.insertAdjacentHTML("afterbegin",html);var button=this.querySelector(".emby-collapsible-button");button.addEventListener("click",onButtonClick),"true"===this.getAttribute("data-expanded")&&onButtonClick.call(button)}}if(window.customElements){var EmbyCollapse=function(_HTMLDivElement){function EmbyCollapse(){var _this;babelHelpers.classCallCheck(this,EmbyCollapse);var self=_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(EmbyCollapse).call(this));return onInit.call(self),babelHelpers.possibleConstructorReturn(_this,self)}return babelHelpers.inherits(EmbyCollapse,_HTMLDivElement),babelHelpers.createClass(EmbyCollapse,[{key:"connectedCallback",value:function(){onInit.call(this),_connectedCallback.call(this)}}]),EmbyCollapse}(babelHelpers.wrapNativeSuper(HTMLDivElement));customElements.define("emby-collapse",EmbyCollapse,{extends:"div"})}else if(document.registerElement){var EmbyCollapsePrototype=Object.create(HTMLDivElement.prototype);EmbyCollapsePrototype.createdCallback=onInit,EmbyCollapsePrototype.attachedCallback=_connectedCallback,document.registerElement("emby-collapse",{prototype:EmbyCollapsePrototype,extends:"div"})}});