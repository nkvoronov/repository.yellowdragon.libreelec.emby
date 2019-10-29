define(["layoutManager","dom","css!./emby-scrollbuttons","paper-icon-button-light"],function(layoutManager,dom){"use strict";function getScrollButtonContainerHtml(direction){var html="";return html+='<div class="scrollbuttoncontainer scrollbuttoncontainer-'+direction+("left"===direction?" hide":"")+'">',html+='<button type="button" is="paper-icon-button-light" data-ripple="false" data-direction="'+direction+'" class="emby-scrollbuttons-scrollbutton">',html+='<i class="md-icon">'+("left"===direction?"&#xE5CB;":"&#xE5CC;")+"</i>",html+="</button>",html+="</div>"}function getScrollPosition(parent){return parent.getScrollPosition?parent.getScrollPosition():0}function getStyleValue(style,name){var value=style.getPropertyValue(name);return(value=value&&value.replace("px",""))?(value=parseInt(value),isNaN(value)?0:value):0}function onScrollButtonClick(e){var newPos,parent=dom.parentWithAttribute(this,"is","emby-scroller"),direction=this.getAttribute("data-direction"),scrollSize=function(elem){var scrollSize=elem.offsetWidth,style=window.getComputedStyle(elem,null),paddingLeft=getStyleValue(style,"padding-left");paddingLeft&&(scrollSize-=paddingLeft);var paddingRight=getStyleValue(style,"padding-right");paddingRight&&(scrollSize-=paddingRight);var slider=elem.getScrollSlider();return(paddingLeft=getStyleValue(style=window.getComputedStyle(slider,null),"padding-left"))&&(scrollSize-=paddingLeft),(paddingRight=getStyleValue(style,"padding-right"))&&(scrollSize-=paddingRight),scrollSize}(parent),pos=getScrollPosition(parent);newPos="left"===direction?Math.max(0,pos-scrollSize):pos+scrollSize,parent.scrollToPosition(newPos,!1)}function onInit(){if(this.parentNode){if(!this.hasInit){this.hasInit=!0;var parent=dom.parentWithAttribute(this,"is","emby-scroller");(this.scroller=parent).classList.add("emby-scrollbuttons-scroller"),this.innerHTML=getScrollButtonContainerHtml("left")+getScrollButtonContainerHtml("right");var scrollHandler=function(e){var scroller=this.scroller;!function(scrollButtons,pos,scrollWidth){0<pos?scrollButtons.scrollButtonsLeft.classList.remove("hide"):scrollButtons.scrollButtonsLeft.classList.add("hide"),0<scrollWidth&&(scrollWidth<=(pos+=scrollButtons.offsetWidth)?scrollButtons.scrollButtonsRight.classList.add("hide"):scrollButtons.scrollButtonsRight.classList.remove("hide"))}(this,getScrollPosition(scroller),function(parent){return parent.getScrollSize?parent.getScrollSize():0}(scroller))}.bind(this);this.scrollHandler=scrollHandler;var buttons=this.querySelectorAll(".emby-scrollbuttons-scrollbutton");buttons[0].addEventListener("click",onScrollButtonClick),buttons[1].addEventListener("click",onScrollButtonClick),buttons=this.querySelectorAll(".scrollbuttoncontainer"),this.scrollButtonsLeft=buttons[0],this.scrollButtonsRight=buttons[1],parent.addScrollEventListener(scrollHandler,{capture:!1,passive:!0})}}}function _connectedCallback(){}function _disconnectedCallback(){var parent=this.scroller;this.scroller=null;var scrollHandler=this.scrollHandler;parent&&scrollHandler&&parent.removeScrollEventListener(scrollHandler,{capture:!1,passive:!0}),this.scrollHandler=null,this.scrollButtonsLeft=null,this.scrollButtonsRight=null}if(window.customElements){var EmbyScrollButtons=function(_HTMLDivElement){function EmbyScrollButtons(){var _this;babelHelpers.classCallCheck(this,EmbyScrollButtons);var self=_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(EmbyScrollButtons).call(this));return onInit.call(self),babelHelpers.possibleConstructorReturn(_this,self)}return babelHelpers.inherits(EmbyScrollButtons,_HTMLDivElement),babelHelpers.createClass(EmbyScrollButtons,[{key:"connectedCallback",value:function(){onInit.call(this),_connectedCallback.call(this)}},{key:"disconnectedCallback",value:function(){_disconnectedCallback.call(this)}}]),EmbyScrollButtons}(babelHelpers.wrapNativeSuper(HTMLDivElement));customElements.define("emby-scrollbuttons",EmbyScrollButtons,{extends:"div"})}else if(document.registerElement){var EmbyScrollButtonsPrototype=Object.create(HTMLDivElement.prototype);EmbyScrollButtonsPrototype.createdCallback=onInit,EmbyScrollButtonsPrototype.attachedCallback=_connectedCallback,EmbyScrollButtonsPrototype.detachedCallback=_disconnectedCallback,document.registerElement("emby-scrollbuttons",{prototype:EmbyScrollButtonsPrototype,extends:"div"})}});