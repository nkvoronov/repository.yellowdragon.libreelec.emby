function _typeof(obj){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(obj){return typeof obj}:function _typeof(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj})(obj)}define(["exports","displaySettings","userSettings","autoFocuser"],(function(_exports,_displaySettings,userSettings,_autoFocuser){"use strict";function _getRequireWildcardCache(){if("function"!=typeof WeakMap)return null;var cache=new WeakMap;return _getRequireWildcardCache=function _getRequireWildcardCache(){return cache},cache}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=function _default(view,params){function onBeforeUnload(e){hasChanges&&(e.returnValue="You currently have unsaved changes. Are you sure you wish to leave?")}var settingsInstance,hasChanges,userId=params.userId||ApiClient.getCurrentUserId(),currentSettings=userId===ApiClient.getCurrentUserId()?userSettings:new UserSettings;view.addEventListener("viewshow",(function(){window.addEventListener("beforeunload",onBeforeUnload),settingsInstance?settingsInstance.loadData():settingsInstance=new _displaySettings.default({serverId:ApiClient.serverId(),userId:userId,element:view.querySelector(".settingsContainer"),userSettings:currentSettings,enableSaveButton:!0,enableSaveConfirmation:!0,autoFocus:_autoFocuser.default.isEnabled()})})),view.addEventListener("change",(function(){hasChanges=!0})),view.addEventListener("viewdestroy",(function(){settingsInstance&&(settingsInstance.destroy(),settingsInstance=null)}))},_displaySettings=_interopRequireDefault(_displaySettings),userSettings=function _interopRequireWildcard(obj){if(obj&&obj.__esModule)return obj;if(null===obj||"object"!==_typeof(obj)&&"function"!=typeof obj)return{default:obj};var cache=_getRequireWildcardCache();if(cache&&cache.has(obj))return cache.get(obj);var newObj={},hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj)if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;desc&&(desc.get||desc.set)?Object.defineProperty(newObj,key,desc):newObj[key]=obj[key]}newObj.default=obj,cache&&cache.set(obj,newObj);return newObj}(userSettings),_autoFocuser=_interopRequireDefault(_autoFocuser);var UserSettings=userSettings.UserSettings}));