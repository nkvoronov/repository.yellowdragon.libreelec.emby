"use strict";define([],(function(){if("cordova"===window.appMode||"android"===window.appMode)return{load:function load(){return window.chrome=window.chrome||{},Promise.resolve()}};var ccLoaded=!1;return{load:function load(){return ccLoaded?Promise.resolve():new Promise((function(resolve,reject){var fileref=document.createElement("script");fileref.setAttribute("type","text/javascript"),fileref.onload=function(){ccLoaded=!0,resolve()},fileref.setAttribute("src","https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"),document.querySelector("head").appendChild(fileref)}))}}}));