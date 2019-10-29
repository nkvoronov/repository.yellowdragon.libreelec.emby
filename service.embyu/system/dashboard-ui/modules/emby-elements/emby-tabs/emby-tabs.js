define(["dom","scroller","browser","layoutManager","focusManager","css!./emby-tabs","scrollStyles"],function(dom,scroller,browser,layoutManager,focusManager){"use strict";var buttonClass="emby-tab-button",activeButtonClass=buttonClass+"-active";function setActiveTabButton(tabs,newButton){newButton.classList.add(activeButtonClass)}function onFocus(e){layoutManager.tv&&(this.focusTimeout&&clearTimeout(this.focusTimeout),this.focusTimeout=setTimeout(function(tabs,e){return function(){onClick.call(tabs,e)}}(this,e),700))}function triggerBeforeTabChangeInternal(tabs,index,previousIndex){tabs.dispatchEvent(new CustomEvent("beforetabchange",{detail:{selectedTabIndex:index,previousIndex:previousIndex}})),null!=previousIndex&&previousIndex!==index&&function(){var tabPanel=null;tabPanel&&tabPanel.classList.remove("is-active")}();var newPanel=null;newPanel&&(newPanel.animate&&function(elem){var keyframes=[{opacity:"0",transform:"translate3d("+(browser.mobile?"4%":"0.5%")+", 0, 0)",offset:0},{opacity:"1",transform:"none",offset:1}];elem.animate(keyframes,{duration:160,iterations:1,easing:"ease-out"})}(newPanel),newPanel.classList.add("is-active"))}function onClick(e){this.focusTimeout&&clearTimeout(this.focusTimeout);var current=this.querySelector("."+activeButtonClass),tabButton=dom.parentWithClass(e.target,buttonClass);if(tabButton&&tabButton!==current){current&&current.classList.remove(activeButtonClass);var previousIndex=current?parseInt(current.getAttribute("data-index")):null;setActiveTabButton(0,tabButton);var index=parseInt(tabButton.getAttribute("data-index"));triggerBeforeTabChangeInternal(this,index,previousIndex),this.selectedTabIndex=index,this.dispatchEvent(new CustomEvent("tabchange",{detail:{selectedTabIndex:index,previousIndex:previousIndex}})),this.scroller&&this.scroller.toCenter(tabButton,!1)}}function _focus(){var selected=this.querySelector("."+activeButtonClass);selected?focusManager.focus(selected):focusManager.autoFocus(this)}function _refresh(){this.scroller&&this.scroller.reload()}function getSelectedTabButton(elem){return elem.querySelector("."+activeButtonClass)}function _selectedIndex(selected,triggerEvent){if(null==selected)return this.selectedTabIndex||0;var current=this.selectedIndex();this.selectedTabIndex=selected;var tabButtons=this.querySelectorAll("."+buttonClass);if(current===selected||!1===triggerEvent){triggerBeforeTabChangeInternal(this,selected,current),this.dispatchEvent(new CustomEvent("tabchange",{detail:{selectedTabIndex:selected}}));var currentTabButton=tabButtons[current];setActiveTabButton(0,tabButtons[selected]),current!==selected&&currentTabButton&&currentTabButton.classList.remove(activeButtonClass)}else onClick.call(this,{target:tabButtons[selected]})}function getSibling(elem,method){for(var sibling=elem[method];sibling;){if(sibling.classList.contains(buttonClass)&&!sibling.classList.contains("hide"))return sibling;sibling=sibling[method]}return null}function _selectNext(){var sibling=getSibling(getSelectedTabButton(this),"nextSibling");sibling&&onClick.call(this,{target:sibling})}function _selectPrevious(){var sibling=getSibling(getSelectedTabButton(this),"previousSibling");sibling&&onClick.call(this,{target:sibling})}function _triggerBeforeTabChange(selected){triggerBeforeTabChangeInternal(this,this.selectedIndex())}function _triggerTabChange(selected){this.dispatchEvent(new CustomEvent("tabchange",{detail:{selectedTabIndex:this.selectedIndex()}}))}function _setTabEnabled(index,enabled){var btn=this.querySelector('.emby-tab-button[data-index="'+index+'"]');enabled?btn.classList.remove("hide"):btn.classList.remove("add")}function onInit(){this.hasInit||(this.hasInit=!0,this.classList.contains("emby-tabs")||(this.classList.add("emby-tabs"),this.classList.add("focusable"),dom.addEventListener(this,"click",onClick,{passive:!0}),dom.addEventListener(this,"focus",onFocus,{passive:!0,capture:!0})))}function _connectedCallback(){!function(tabs){if(!tabs.scroller){var contentScrollSlider=tabs.querySelector(".emby-tabs-slider");contentScrollSlider?(tabs.scroller=new scroller(tabs,{horizontal:1,itemNav:0,mouseDragging:1,touchDragging:1,slidee:contentScrollSlider,smart:!0,releaseSwing:!0,scrollBy:200,speed:120,elasticBounds:1,dragHandle:1,dynamicHandle:1,clickBar:1,hiddenScroll:!0,requireAnimation:!browser.safari,allowNativeSmoothScroll:!0}),tabs.scroller.init()):(tabs.classList.add("scrollX"),tabs.classList.add("hiddenScrollX"),tabs.classList.add("smoothScrollX"))}}(this);var current=this.querySelector("."+activeButtonClass),currentIndex=current?parseInt(current.getAttribute("data-index")):parseInt(this.getAttribute("data-index")||"0");if(-1!==currentIndex){this.selectedTabIndex=currentIndex;var newTabButton=this.querySelectorAll("."+buttonClass)[currentIndex];newTabButton&&setActiveTabButton(0,newTabButton)}this.readyFired||(this.readyFired=!0,this.dispatchEvent(new CustomEvent("ready",{})))}function disconnectedCallback(){this.scroller&&(this.scroller.destroy(),this.scroller=null),dom.removeEventListener(this,"click",onClick,{passive:!0}),dom.removeEventListener(this,"focus",onFocus,{passive:!0,capture:!0})}if(window.customElements){var EmbyTabs=function(_HTMLDivElement){function EmbyTabs(){var _this;babelHelpers.classCallCheck(this,EmbyTabs);var self=_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(EmbyTabs).call(this));return onInit.call(self),babelHelpers.possibleConstructorReturn(_this,self)}return babelHelpers.inherits(EmbyTabs,_HTMLDivElement),babelHelpers.createClass(EmbyTabs,[{key:"connectedCallback",value:function(){onInit.call(this),_connectedCallback.call(this)}},{key:"detachedCallback",value:function(){disconnectedCallback.call(this)}},{key:"focus",value:function(){_focus.call(this)}},{key:"refresh",value:function(){_refresh.call(this)}},{key:"selectNext",value:function(){_selectNext.call(this)}},{key:"selectPrevious",value:function(){_selectPrevious.call(this)}},{key:"selectedIndex",value:function(){return _selectedIndex.apply(this,arguments)}},{key:"triggerBeforeTabChange",value:function(){_triggerBeforeTabChange.apply(this,arguments)}},{key:"triggerTabChange",value:function(){_triggerTabChange.apply(this,arguments)}},{key:"setTabEnabled",value:function(){_setTabEnabled.apply(this,arguments)}}]),EmbyTabs}(babelHelpers.wrapNativeSuper(HTMLDivElement));customElements.define("emby-tabs",EmbyTabs,{extends:"div"})}else if(document.registerElement){var EmbyTabsPrototype=Object.create(HTMLDivElement.prototype);EmbyTabsPrototype.createdCallback=onInit,EmbyTabsPrototype.attachedCallback=_connectedCallback,EmbyTabsPrototype.detachedCallback=disconnectedCallback,EmbyTabsPrototype.focus=_focus,EmbyTabsPrototype.refresh=_refresh,EmbyTabsPrototype.selectNext=_selectNext,EmbyTabsPrototype.selectPrevious=_selectPrevious,EmbyTabsPrototype.selectedIndex=_selectedIndex,EmbyTabsPrototype.triggerBeforeTabChange=_triggerBeforeTabChange,EmbyTabsPrototype.triggerTabChange=_triggerTabChange,EmbyTabsPrototype.setTabEnabled=_setTabEnabled,document.registerElement("emby-tabs",{prototype:EmbyTabsPrototype,extends:"div"})}});