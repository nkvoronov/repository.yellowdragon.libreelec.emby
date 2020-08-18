"use strict";define(["browser","dom","css!./emby-checkbox","webcomponents"],(function(browser,dom){var EmbyCheckboxPrototype=Object.create(HTMLInputElement.prototype);function onKeyDown(e){if(13===e.keyCode||32===e.keyCode&&browser.tizen)return e.preventDefault(),this.checked=!this.checked,this.dispatchEvent(new CustomEvent("change",{bubbles:!0})),!1}var enableRefreshHack=!!(browser.tizen||browser.orsay||browser.operaTv||browser.web0s);function forceRefresh(loading){var elem=this.parentNode;elem.style.webkitAnimationName="repaintChrome",elem.style.webkitAnimationDelay=!0===loading?"500ms":"",elem.style.webkitAnimationDuration="10ms",elem.style.webkitAnimationIterationCount="1",setTimeout((function(){elem.style.webkitAnimationName=""}),!0===loading?520:20)}EmbyCheckboxPrototype.attachedCallback=function(){if("true"!==this.getAttribute("data-embycheckbox")){this.setAttribute("data-embycheckbox","true"),this.classList.add("emby-checkbox");var labelElement=this.parentNode;labelElement.classList.add("emby-checkbox-label");var labelTextElement=labelElement.querySelector("span"),outlineClass="checkboxOutline",customClass=this.getAttribute("data-outlineclass");customClass&&(outlineClass+=" "+customClass);var checkHtml='<span class="material-icons checkboxIcon checkboxIcon-checked '+(this.getAttribute("data-checkedicon")||"check")+'"></span>',uncheckedHtml='<span class="material-icons checkboxIcon checkboxIcon-unchecked '+(this.getAttribute("data-uncheckedicon")||"")+'"></span>';labelElement.insertAdjacentHTML("beforeend",'<span class="'+outlineClass+'">'+checkHtml+uncheckedHtml+"</span>"),labelTextElement.classList.add("checkboxLabel"),this.addEventListener("keydown",onKeyDown),enableRefreshHack&&(forceRefresh.call(this,!0),dom.addEventListener(this,"click",forceRefresh,{passive:!0}),dom.addEventListener(this,"blur",forceRefresh,{passive:!0}),dom.addEventListener(this,"focus",forceRefresh,{passive:!0}),dom.addEventListener(this,"change",forceRefresh,{passive:!0}))}},EmbyCheckboxPrototype.detachedCallback=function(){this.removeEventListener("keydown",onKeyDown),dom.removeEventListener(this,"click",forceRefresh,{passive:!0}),dom.removeEventListener(this,"blur",forceRefresh,{passive:!0}),dom.removeEventListener(this,"focus",forceRefresh,{passive:!0}),dom.removeEventListener(this,"change",forceRefresh,{passive:!0})},document.registerElement("emby-checkbox",{prototype:EmbyCheckboxPrototype,extends:"input"})}));