"use strict";define(["inputManager","focusManager","browser","layoutManager","events","dom"],(function(inputManager,focusManager,browser,layoutManager,events,dom){var isMouseIdle,lastPointerMoveData,mouseInterval,self={},lastMouseInputTime=(new Date).getTime();function removeIdleClasses(){var classList=document.body.classList;classList.remove("mouseIdle"),classList.remove("mouseIdle-tv")}function onPointerMove(e){var eventX=e.screenX,eventY=e.screenY;if(void 0!==eventX||void 0!==eventY){var obj=lastPointerMoveData;obj?Math.abs(eventX-obj.x)<10&&Math.abs(eventY-obj.y)<10||(obj.x=eventX,obj.y=eventY,lastMouseInputTime=(new Date).getTime(),function notifyApp(){inputManager.notifyMouseMove()}(),isMouseIdle&&(isMouseIdle=!1,removeIdleClasses(),events.trigger(self,"mouseactive"))):lastPointerMoveData={x:eventX,y:eventY}}}function onPointerEnter(e){if("mouse"===(e.pointerType||(layoutManager.mobile?"touch":"mouse"))&&!isMouseIdle){var parent=focusManager.focusableParent(e.target);parent&&focusManager.focus(parent)}}function onMouseInterval(){!isMouseIdle&&function mouseIdleTime(){return(new Date).getTime()-lastMouseInputTime}()>=5e3&&(isMouseIdle=!0,function addIdleClasses(){var classList=document.body.classList;classList.add("mouseIdle"),layoutManager.tv&&classList.add("mouseIdle-tv")}(),events.trigger(self,"mouseidle"))}function initMouse(){!function stopMouseInterval(){mouseInterval&&(clearInterval(mouseInterval),mouseInterval=null),removeIdleClasses()}(),dom.removeEventListener(document,window.PointerEvent?"pointermove":"mousemove",onPointerMove,{passive:!0}),layoutManager.mobile||(!function startMouseInterval(){mouseInterval||(mouseInterval=setInterval(onMouseInterval,5e3))}(),dom.addEventListener(document,window.PointerEvent?"pointermove":"mousemove",onPointerMove,{passive:!0})),dom.removeEventListener(document,window.PointerEvent?"pointerenter":"mouseenter",onPointerEnter,{capture:!0,passive:!0}),function enableFocusWithMouse(){return!!layoutManager.tv&&(!browser.web0s&&!!browser.tv)}()&&dom.addEventListener(document,window.PointerEvent?"pointerenter":"mouseenter",onPointerEnter,{capture:!0,passive:!0})}return initMouse(),events.on(layoutManager,"modechange",initMouse),self}));