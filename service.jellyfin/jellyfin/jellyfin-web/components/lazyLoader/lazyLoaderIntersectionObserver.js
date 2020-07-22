define(["exports"],(function(_exports){"use strict";function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.lazyChildren=lazyChildren,_exports.default=_exports.LazyLoader=void 0;var LazyLoader=function(){function LazyLoader(options){!function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}(this,LazyLoader),this.options=options}return function _createClass(Constructor,protoProps,staticProps){return protoProps&&_defineProperties(Constructor.prototype,protoProps),staticProps&&_defineProperties(Constructor,staticProps),Constructor}(LazyLoader,[{key:"createObserver",value:function createObserver(){var callback=this.options.callback,observer=new IntersectionObserver((function(entries){entries.forEach((function(entry){callback(entry)}))}),{rootMargin:"25%"});this.observer=observer}},{key:"addElements",value:function addElements(elements){var observer=this.observer;observer||(this.createObserver(),observer=this.observer),Array.from(elements).forEach((function(element){observer.observe(element)}))}},{key:"destroyObserver",value:function destroyObserver(){var observer=this.observer;observer&&(observer.disconnect(),this.observer=null)}},{key:"destroy",value:function destroy(){this.destroyObserver(),this.options=null}}]),LazyLoader}();function lazyChildren(elem,callback){!function unveilElements(elements,root,callback){elements.length&&new LazyLoader({callback:callback}).addElements(elements)}(elem.getElementsByClassName("lazy"),0,callback)}_exports.LazyLoader=LazyLoader;var _default={LazyLoader:LazyLoader,lazyChildren:lazyChildren};_exports.default=_default}));