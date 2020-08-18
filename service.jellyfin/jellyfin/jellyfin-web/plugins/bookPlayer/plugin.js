define(["exports","connectionManager","loading","keyboardnavigation","dialogHelper","dom","events","css!./style","material-icons","paper-icon-button-light","./tableOfContents"],(function(_exports,_connectionManager,_loading,_keyboardnavigation,_dialogHelper,_dom,_events,_style,_materialIcons,_paperIconButtonLight,_tableOfContents){"use strict";function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function asyncGeneratorStep(gen,resolve,reject,_next,_throw,key,arg){try{var info=gen[key](arg),value=info.value}catch(error){return void reject(error)}info.done?resolve(value):Promise.resolve(value).then(_next,_throw)}function _asyncToGenerator(fn){return function(){var self=this,args=arguments;return new Promise((function(resolve,reject){var gen=fn.apply(self,args);function _next(value){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"next",value)}function _throw(err){asyncGeneratorStep(gen,resolve,reject,_next,_throw,"throw",err)}_next(void 0)}))}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=_exports.BookPlayer=void 0,_connectionManager=_interopRequireDefault(_connectionManager),_loading=_interopRequireDefault(_loading),_keyboardnavigation=_interopRequireDefault(_keyboardnavigation),_dialogHelper=_interopRequireDefault(_dialogHelper),_dom=_interopRequireDefault(_dom),_events=_interopRequireDefault(_events),_tableOfContents=_interopRequireDefault(_tableOfContents);var BookPlayer=function(){function BookPlayer(){!function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}(this,BookPlayer),this.name="Book Player",this.type="mediaplayer",this.id="bookplayer",this.priority=1,this.onDialogClosed=this.onDialogClosed.bind(this),this.openTableOfContents=this.openTableOfContents.bind(this),this.onWindowKeyUp=this.onWindowKeyUp.bind(this)}return function _createClass(Constructor,protoProps,staticProps){return protoProps&&_defineProperties(Constructor.prototype,protoProps),staticProps&&_defineProperties(Constructor,staticProps),Constructor}(BookPlayer,[{key:"play",value:function play(options){this._progress=0,this._loaded=!1,_loading.default.show();var elem=this.createMediaElement();return this.setCurrentSrc(elem,options)}},{key:"stop",value:function stop(){this.unbindEvents();var elem=this._mediaElement,tocElement=this._tocElement,rendition=this._rendition;elem&&(_dialogHelper.default.close(elem),this._mediaElement=null),tocElement&&(tocElement.destroy(),this._tocElement=null),rendition&&rendition.destroy(),_loading.default.hide(),this._cancellationToken.shouldCancel=!0}},{key:"currentItem",value:function currentItem(){return this._currentItem}},{key:"currentTime",value:function currentTime(){return 1e3*this._progress}},{key:"duration",value:function duration(){return 1e3}},{key:"getBufferedRanges",value:function getBufferedRanges(){return[{start:0,end:1e7}]}},{key:"volume",value:function volume(){return 100}},{key:"isMuted",value:function isMuted(){return!1}},{key:"paused",value:function paused(){return!1}},{key:"seekable",value:function seekable(){return!0}},{key:"onWindowKeyUp",value:function onWindowKeyUp(e){var key=_keyboardnavigation.default.getKeyName(e),rendition=this._rendition||this,book=rendition.book;if(!1!==this._loaded)switch(key){case"l":case"ArrowRight":case"Right":"rtl"===book.package.metadata.direction?rendition.prev():rendition.next();break;case"j":case"ArrowLeft":case"Left":"rtl"===book.package.metadata.direction?rendition.next():rendition.prev();break;case"Escape":this._tocElement?this._tocElement.destroy():this.stop()}}},{key:"onTouchStart",value:function onTouchStart(e){var rendition=this._rendition||this,book=rendition.book;book&&!1!==this._loaded&&(e.touches&&0!==e.touches.length&&(e.touches[0].clientX%_dom.default.getWindowSize().innerWidth<_dom.default.getWindowSize().innerWidth/2?"rtl"===book.package.metadata.direction?rendition.next():rendition.prev():"rtl"===book.package.metadata.direction?rendition.prev():rendition.next()))}},{key:"onDialogClosed",value:function onDialogClosed(){this.stop()}},{key:"bindMediaElementEvents",value:function bindMediaElementEvents(){var elem=this._mediaElement;elem.addEventListener("close",this.onDialogClosed,{once:!0}),elem.querySelector(".btnBookplayerExit").addEventListener("click",this.onDialogClosed,{once:!0}),elem.querySelector(".btnBookplayerToc").addEventListener("click",this.openTableOfContents)}},{key:"bindEvents",value:function bindEvents(){this.bindMediaElementEvents(),document.addEventListener("keyup",this.onWindowKeyUp),document.addEventListener("touchstart",this.onTouchStart),this._rendition.on("keyup",this.onWindowKeyUp),this._rendition.on("touchstart",this.onTouchStart)}},{key:"unbindMediaElementEvents",value:function unbindMediaElementEvents(){var elem=this._mediaElement;elem.removeEventListener("close",this.onDialogClosed),elem.querySelector(".btnBookplayerExit").removeEventListener("click",this.onDialogClosed),elem.querySelector(".btnBookplayerToc").removeEventListener("click",this.openTableOfContents)}},{key:"unbindEvents",value:function unbindEvents(){this._mediaElement&&this.unbindMediaElementEvents(),document.removeEventListener("keyup",this.onWindowKeyUp),document.removeEventListener("touchstart",this.onTouchStart),this._rendition&&(this._rendition.off("keyup",this.onWindowKeyUp),this._rendition.off("touchstart",this.onTouchStart))}},{key:"openTableOfContents",value:function openTableOfContents(){this._loaded&&(this._tocElement=new _tableOfContents.default(this))}},{key:"createMediaElement",value:function createMediaElement(){var elem=this._mediaElement;if(elem)return elem;if(!(elem=document.getElementById("bookPlayer"))){(elem=_dialogHelper.default.createDialog({exitAnimationDuration:400,size:"fullscreen",autoFocus:!1,scrollY:!1,exitAnimation:"fadeout",removeOnClose:!0})).id="bookPlayer";'<div class="topRightActionButtons">','<button is="paper-icon-button-light" class="autoSize bookplayerButton btnBookplayerExit hide-mouse-idle-tv" tabindex="-1"><i class="material-icons bookplayerButtonIcon close"></i></button>',"</div>",'<div class="topLeftActionButtons">','<button is="paper-icon-button-light" class="autoSize bookplayerButton btnBookplayerToc hide-mouse-idle-tv" tabindex="-1"><i class="material-icons bookplayerButtonIcon toc"></i></button>',"</div>",elem.innerHTML='<div class="topRightActionButtons"><button is="paper-icon-button-light" class="autoSize bookplayerButton btnBookplayerExit hide-mouse-idle-tv" tabindex="-1"><i class="material-icons bookplayerButtonIcon close"></i></button></div><div class="topLeftActionButtons"><button is="paper-icon-button-light" class="autoSize bookplayerButton btnBookplayerToc hide-mouse-idle-tv" tabindex="-1"><i class="material-icons bookplayerButtonIcon toc"></i></button></div>',_dialogHelper.default.open(elem)}return this._mediaElement=elem,elem}},{key:"setCurrentSrc",value:function setCurrentSrc(elem,options){var _this=this,item=options.items[0];this._currentItem=item,this.streamInfo={started:!0,ended:!1,mediaSource:{Id:item.Id}};var serverId=item.ServerId,apiClient=_connectionManager.default.getApiClient(serverId);return new Promise((function(resolve,reject){require(["epubjs"],(function(epubjs){var downloadHref=apiClient.getItemDownloadUrl(item.Id),book=epubjs.default(downloadHref,{openAs:"epub"}),rendition=book.renderTo(elem,{width:"100%",height:"97%"});_this._currentSrc=downloadHref,_this._rendition=rendition;var cancellationToken={shouldCancel:!1};return _this._cancellationToken=cancellationToken,rendition.display().then((function(){var epubElem=document.querySelector(".epub-container");return epubElem.style.display="none",_this.bindEvents(),_this._rendition.book.locations.generate(1024).then(_asyncToGenerator(regeneratorRuntime.mark((function _callee(){var percentageTicks,resumeLocation;return regeneratorRuntime.wrap((function _callee$(_context){for(;;)switch(_context.prev=_context.next){case 0:if(!cancellationToken.shouldCancel){_context.next=2;break}return _context.abrupt("return",reject());case 2:if(0===(percentageTicks=options.startPositionTicks/1e7)){_context.next=7;break}return resumeLocation=book.locations.cfiFromPercentage(percentageTicks),_context.next=7,rendition.display(resumeLocation);case 7:return _this._loaded=!0,epubElem.style.display="block",rendition.on("relocated",(function(locations){_this._progress=book.locations.percentageFromCfi(locations.start.cfi),_events.default.trigger(_this,"timeupdate")})),_loading.default.hide(),_context.abrupt("return",resolve());case 12:case"end":return _context.stop()}}),_callee)}))))}),(function(){return console.error("failed to display epub"),reject()}))}))}))}},{key:"canPlayMediaType",value:function canPlayMediaType(mediaType){return"book"===(mediaType||"").toLowerCase()}},{key:"canPlayItem",value:function canPlayItem(item){return!(!item.Path||!item.Path.endsWith("epub"))}}]),BookPlayer}();_exports.BookPlayer=BookPlayer;var _default=BookPlayer;_exports.default=_default}));