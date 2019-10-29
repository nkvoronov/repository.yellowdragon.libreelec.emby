define([],function(){"use strict";function performSync(connectionManager,server,options){console.log("ServerSync.performSync to server: "+server.Id);var cameraUploadServers=(options=options||{}).cameraUploadServers||[];console.log("ServerSync cameraUploadServers: "+JSON.stringify(cameraUploadServers));var uploadPhotos=-1!==cameraUploadServers.indexOf(server.Id);return console.log("ServerSync uploadPhotos: "+uploadPhotos),(uploadPhotos?function(connectionManager,server){return new Promise(function(resolve,reject){require(["contentuploader"],function(ContentUploader){(new ContentUploader).uploadImages(connectionManager,server).then(resolve,reject)})})}(connectionManager,server):Promise.resolve()).then(function(){return function(connectionManager,server,options){return new Promise(function(resolve,reject){require(["mediasync"],function(MediaSync){var apiClient=connectionManager.getApiClient(server.Id);(new MediaSync).sync(apiClient,server,options).then(resolve,reject)})})}(connectionManager,server,options)})}function ServerSync(){}return ServerSync.prototype.sync=function(connectionManager,server,options){if(!server.AccessToken&&!server.ExchangeToken)return console.log("Skipping sync to server "+server.Id+" because there is no saved authentication information."),Promise.resolve();return connectionManager.connectToServer(server,{updateDateLastAccessed:!1,enableWebSocket:!1,reportCapabilities:!1,enableAutomaticBitrateDetection:!1}).then(function(result){return"SignedIn"===result.State?performSync(connectionManager,server,options):(console.log("Unable to connect to server id: "+server.Id),Promise.reject())},function(err){throw console.log("Unable to connect to server id: "+server.Id),err})},ServerSync});