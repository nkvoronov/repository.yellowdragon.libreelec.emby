define(["events","dom"],function(events,dom){"use strict";function fullscreenManager(){}fullscreenManager.prototype.requestFullscreen=function(element){(element=element||document.documentElement).requestFullscreen?element.requestFullscreen({navigationUI:"hide"}):element.mozRequestFullScreen?element.mozRequestFullScreen():element.webkitRequestFullscreen?element.webkitRequestFullscreen():element.msRequestFullscreen?element.msRequestFullscreen():("VIDEO"!==element.tagName&&(element=document.querySelector("video")||element),element.webkitEnterFullscreen&&element.webkitEnterFullscreen())},fullscreenManager.prototype.exitFullscreen=function(){document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.webkitCancelFullscreen?document.webkitCancelFullscreen():document.msExitFullscreen&&document.msExitFullscreen()},fullscreenManager.prototype.isFullScreen=function(){return!!(document.fullscreen||document.mozFullScreen||document.webkitIsFullScreen||document.msFullscreenElement)};var manager=new fullscreenManager;function onFullScreenChange(){events.trigger(manager,"fullscreenchange")}return dom.addEventListener(document,"fullscreenchange",onFullScreenChange,{passive:!0}),dom.addEventListener(document,"webkitfullscreenchange",onFullScreenChange,{passive:!0}),dom.addEventListener(document,"mozfullscreenchange",onFullScreenChange,{passive:!0}),manager});