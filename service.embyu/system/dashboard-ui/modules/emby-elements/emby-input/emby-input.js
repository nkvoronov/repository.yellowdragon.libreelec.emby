define(["layoutManager","browser","dom","css!./emby-input"],function(layoutManager,browser,dom){"use strict";var inputId=0;function onInit(){var parentNode=this.parentNode;if(parentNode){if(!this.hasInit&&(this.hasInit=!0,this.id||(this.id="embyinput"+inputId,inputId++),!this.classList.contains("emby-input"))){this.classList.add("emby-input");var document=this.ownerDocument,label=document.createElement("label");label.innerHTML=this.getAttribute("label")||"",label.classList.add("inputLabel"),label.classList.add("inputLabelUnfocused"),label.htmlFor=this.id,parentNode.insertBefore(label,this),this.labelElement=label,dom.addEventListener(this,"focus",function(){document.attachIME&&document.attachIME(this),label.classList.add("inputLabelFocused"),label.classList.remove("inputLabelUnfocused")},{passive:!0}),dom.addEventListener(this,"blur",function(){label.classList.remove("inputLabelFocused"),label.classList.add("inputLabelUnfocused")},{passive:!0}),browser.orsay&&this===document.activeElement&&document.attachIME&&document.attachIME(this)}}}function _connectedCallback(){this.labelElement.htmlFor=this.id}function _label(text){this.labelElement.innerHTML=text}if(window.customElements){var EmbyInput=function(_HTMLInputElement){function EmbyInput(){var _this;babelHelpers.classCallCheck(this,EmbyInput);var self=_this=babelHelpers.possibleConstructorReturn(this,babelHelpers.getPrototypeOf(EmbyInput).call(this));return onInit.call(self),babelHelpers.possibleConstructorReturn(_this,self)}return babelHelpers.inherits(EmbyInput,_HTMLInputElement),babelHelpers.createClass(EmbyInput,[{key:"connectedCallback",value:function(){onInit.call(this),_connectedCallback.call(this)}},{key:"label",value:function(text){_label.call(this,text)}}]),EmbyInput}(babelHelpers.wrapNativeSuper(HTMLInputElement));customElements.define("emby-input",EmbyInput,{extends:"input"})}else if(document.registerElement){var EmbyInputPrototype=Object.create(HTMLInputElement.prototype);EmbyInputPrototype.createdCallback=onInit,EmbyInputPrototype.attachedCallback=_connectedCallback,EmbyInputPrototype.label=_label,document.registerElement("emby-input",{prototype:EmbyInputPrototype,extends:"input"})}});