define(["require","exports","connectionManager"],(function(_require,_exports,_connectionManager){"use strict";function _typeof(obj){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(obj){return typeof obj}:function _typeof(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj})(obj)}function _getRequireWildcardCache(){if("function"!=typeof WeakMap)return null;var cache=new WeakMap;return _getRequireWildcardCache=function _getRequireWildcardCache(){return cache},cache}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_connectionManager=function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}(_connectionManager);var PhotoPlayer=function(){function PhotoPlayer(){!function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}(this,PhotoPlayer),this.name="Photo Player",this.type="mediaplayer",this.id="photoplayer",this.priority=1}return function _createClass(Constructor,protoProps,staticProps){return protoProps&&_defineProperties(Constructor.prototype,protoProps),staticProps&&_defineProperties(Constructor,staticProps),Constructor}(PhotoPlayer,[{key:"play",value:function play(options){return new Promise((function(resolve,reject){new Promise((function(_resolve,_reject){return _require(["slideshow"],(function(imported){return _resolve(function _interopRequireWildcard(obj){if(obj&&obj.__esModule)return obj;if(null===obj||"object"!==_typeof(obj)&&"function"!=typeof obj)return{default:obj};var cache=_getRequireWildcardCache();if(cache&&cache.has(obj))return cache.get(obj);var newObj={},hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj)if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;desc&&(desc.get||desc.set)?Object.defineProperty(newObj,key,desc):newObj[key]=obj[key]}return newObj.default=obj,cache&&cache.set(obj,newObj),newObj}(imported))}),_reject)})).then((function(_ref){var slideshow=_ref.default,index=options.startIndex||0;_connectionManager.default.currentApiClient().getCurrentUser().then((function(result){new slideshow({showTitle:!1,cover:!1,items:options.items,startIndex:index,interval:11e3,interactive:!0,user:result}).show(),resolve()}))}))}))}},{key:"canPlayMediaType",value:function canPlayMediaType(mediaType){return"photo"===(mediaType||"").toLowerCase()}}]),PhotoPlayer}();_exports.default=PhotoPlayer}));