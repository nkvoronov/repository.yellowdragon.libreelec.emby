"use strict";
/*!
 * headroom.js v0.7.0 - Give your page some headroom. Hide your header until you need it
 * Copyright (c) 2014 Nick Williams - http://wicky.nillia.ms/headroom.js
 * License: MIT
 */define(["dom","layoutManager","browser","css!./headroom"],(function(dom,layoutManager,browser){var requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame;function Debouncer(callback){this.callback=callback,this.ticking=!1}function onHeadroomClearedExternally(){this.state=null}function Headroom(elems,options){if(options=Object.assign(Headroom.options,options||{}),this.lastKnownScrollY=0,this.elems=elems,this.scroller=options.scroller,this.debouncer=onScroll.bind(this),this.offset=options.offset,this.initialised=!1,this.initialClass=options.initialClass,this.unPinnedClass=options.unPinnedClass,this.pinnedClass=options.pinnedClass,this.state="clear",this.options={offset:0,scroller:window,initialClass:"headroom",unPinnedClass:"headroom--unpinned",pinnedClass:"headroom--pinned"},this.add=function(elem){browser.supportsCssAnimation()&&(elem.classList.add(this.initialClass),elem.addEventListener("clearheadroom",onHeadroomClearedExternally.bind(this)),this.elems.push(elem))},this.remove=function(elem){elem.classList.remove(this.unPinnedClass),elem.classList.remove(this.initialClass),elem.classList.remove(this.pinnedClass);var i=this.elems.indexOf(elem);-1!==i&&this.elems.splice(i,1)},this.pause=function(){this.paused=!0},this.resume=function(){this.paused=!1},this.destroy=function(){this.initialised=!1;for(var i=0,length=this.elems.length;i<length;i++){var classList=this.elems[i].classList;classList.remove(this.unPinnedClass),classList.remove(this.initialClass),classList.remove(this.pinnedClass)}var scrollEventName=this.scroller.getScrollEventName?this.scroller.getScrollEventName():"scroll";dom.removeEventListener(this.scroller,scrollEventName,this.debouncer,{capture:!1,passive:!0})},this.attachEvent=function(){if(!this.initialised){this.lastKnownScrollY=this.getScrollY(),this.initialised=!0;var scrollEventName=this.scroller.getScrollEventName?this.scroller.getScrollEventName():"scroll";dom.addEventListener(this.scroller,scrollEventName,this.debouncer,{capture:!1,passive:!0}),this.update()}},this.clear=function(){if("clear"!==this.state){this.state="clear";for(var unpinnedClass=this.unPinnedClass,i=(this.pinnedClass,0),length=this.elems.length;i<length;i++){this.elems[i].classList.remove(unpinnedClass)}}},this.pin=function(){if("pin"!==this.state){this.state="pin";for(var unpinnedClass=this.unPinnedClass,pinnedClass=this.pinnedClass,i=0,length=this.elems.length;i<length;i++){var classList=this.elems[i].classList;classList.remove(unpinnedClass),classList.add(pinnedClass)}}},this.unpin=function(){if("unpin"!==this.state){this.state="unpin";for(var unpinnedClass=this.unPinnedClass,i=(this.pinnedClass,0),length=this.elems.length;i<length;i++){this.elems[i].classList.add(unpinnedClass)}}},this.getScrollY=function(){var scroller=this.scroller;if(scroller.getScrollPosition)return scroller.getScrollPosition();var pageYOffset=scroller.pageYOffset;if(void 0!==pageYOffset)return pageYOffset;var scrollTop=scroller.scrollTop;return void 0!==scrollTop?scrollTop:(document.documentElement||document.body).scrollTop},this.shouldUnpin=function(currentScrollY){var scrollingDown=currentScrollY>this.lastKnownScrollY,pastOffset=currentScrollY>=this.offset;return scrollingDown&&pastOffset},this.shouldPin=function(currentScrollY){var scrollingUp=currentScrollY<this.lastKnownScrollY,pastOffset=currentScrollY<=this.offset;return scrollingUp||pastOffset},this.update=function(){if(!this.paused){var currentScrollY=this.getScrollY(),lastKnownScrollY=this.lastKnownScrollY,isTv=layoutManager.tv;if(currentScrollY<=(isTv?120:10))this.clear();else if(this.shouldUnpin(currentScrollY))this.unpin();else if(this.shouldPin(currentScrollY)){var toleranceExceeded=Math.abs(currentScrollY-lastKnownScrollY)>=14;currentScrollY&&isTv?this.unpin():toleranceExceeded&&this.clear()}this.lastKnownScrollY=currentScrollY}},browser.supportsCssAnimation()){for(var i=0,length=this.elems.length;i<length;i++)this.elems[i].classList.add(this.initialClass),this.elems[i].addEventListener("clearheadroom",onHeadroomClearedExternally.bind(this));this.attachEvent()}}function onScroll(){this.paused||requestAnimationFrame(this.rafCallback||(this.rafCallback=this.update.bind(this)))}return Debouncer.prototype={constructor:Debouncer,update:function update(){this.callback&&this.callback(),this.ticking=!1},handleEvent:function handleEvent(){this.ticking||(requestAnimationFrame(this.rafCallback||(this.rafCallback=this.update.bind(this))),this.ticking=!0)}},Headroom.options={offset:0,scroller:window,initialClass:"headroom",unPinnedClass:"headroom--unpinned",pinnedClass:"headroom--pinned"},Headroom}));