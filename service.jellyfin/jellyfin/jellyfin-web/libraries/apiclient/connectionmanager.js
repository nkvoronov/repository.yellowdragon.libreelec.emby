"use strict";define(["events","apiclient","appStorage"],(function(events,apiClientFactory,appStorage){function getServerAddress(server,mode){switch(mode){case ConnectionMode.Local:return server.LocalAddress;case ConnectionMode.Manual:return server.ManualAddress;case ConnectionMode.Remote:return server.RemoteAddress;default:return server.ManualAddress||server.LocalAddress||server.RemoteAddress}}function resolveFailure(instance,resolve){resolve({State:"Unavailable"})}function updateServerInfo(server,systemInfo){server.Name=systemInfo.ServerName,systemInfo.Id&&(server.Id=systemInfo.Id),systemInfo.LocalAddress&&(server.LocalAddress=systemInfo.LocalAddress)}function getEmbyServerUrl(baseUrl,handler){return baseUrl+"/"+handler}function getFetchPromise(request){var headers=request.headers||{};"json"===request.dataType&&(headers.accept="application/json");var fetchRequest={headers:headers,method:request.type,credentials:"same-origin"},contentType=request.contentType;return request.data&&("string"==typeof request.data?fetchRequest.body=request.data:(fetchRequest.body=function paramsToString(params){var values=[];for(var key in params){var value=params[key];null!=value&&""!==value&&values.push(encodeURIComponent(key)+"="+encodeURIComponent(value))}return values.join("&")}(request.data),contentType=contentType||"application/x-www-form-urlencoded; charset=UTF-8")),contentType&&(headers["Content-Type"]=contentType),request.timeout?function fetchWithTimeout(url,options,timeoutMs){return console.debug("fetchWithTimeout: timeoutMs: "+timeoutMs+", url: "+url),new Promise((function(resolve,reject){var timeout=setTimeout(reject,timeoutMs);(options=options||{}).credentials="same-origin",fetch(url,options).then((function(response){clearTimeout(timeout),console.debug("fetchWithTimeout: succeeded connecting to url: "+url),resolve(response)}),(function(error){clearTimeout(timeout),console.error("fetchWithTimeout: timed out connecting to url: "+url),reject()}))}))}(request.url,fetchRequest,request.timeout):fetch(request.url,fetchRequest)}function ajax(request){if(!request)throw new Error("Request cannot be null");return request.headers=request.headers||{},console.debug("ConnectionManager requesting url: "+request.url),getFetchPromise(request).then((function(response){return console.debug("ConnectionManager response status: "+response.status+", url: "+request.url),response.status<400?"json"===request.dataType||"application/json"===request.headers.accept?response.json():response:Promise.reject(response)}),(function(err){throw console.error("ConnectionManager request failed to url: "+request.url),err}))}function replaceAll(originalString,strReplace,strWith){var reg=new RegExp(strReplace,"ig");return originalString.replace(reg,strWith)}function normalizeAddress(address){return 0!==(address=address.trim()).toLowerCase().indexOf("http")&&(address="http://"+address),address=replaceAll(address,"Http:","http:"),address=replaceAll(address,"Https:","https:")}function stringEqualsIgnoreCase(str1,str2){return(str1||"").toLowerCase()===(str2||"").toLowerCase()}var ConnectionMode={Local:0,Remote:1,Manual:2},ConnectionManager=function ConnectionManager(credentialProvider,appName,appVersion,deviceName,deviceId,capabilities){function onAuthenticated(apiClient,result,options,saveCredentials){var credentials=credentialProvider.credentials(),servers=credentials.Servers.filter((function(s){return s.Id===result.ServerId})),server=servers.length?servers[0]:apiClient.serverInfo();return!1!==options.updateDateLastAccessed&&(server.DateLastAccessed=(new Date).getTime()),server.Id=result.ServerId,saveCredentials?(server.UserId=result.User.Id,server.AccessToken=result.AccessToken):(server.UserId=null,server.AccessToken=null),credentialProvider.addOrUpdateServer(credentials.Servers,server),credentialProvider.credentials(credentials),apiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,apiClient.serverInfo(server),afterConnected(apiClient,options),onLocalUserSignIn(server,apiClient.serverAddress(),result.User)}function afterConnected(apiClient,options){!1!==(options=options||{}).reportCapabilities&&apiClient.reportCapabilities(capabilities),apiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,!1!==options.enableWebSocket&&(console.debug("calling apiClient.ensureWebSocket"),apiClient.ensureWebSocket())}function onLocalUserSignIn(server,serverUrl,user){return self._getOrAddApiClient(server,serverUrl),(self.onLocalUserSignedIn?self.onLocalUserSignedIn.call(self,user):Promise.resolve()).then((function(){events.trigger(self,"localusersignedin",[user])}))}function logoutOfServer(apiClient){var logoutInfo={serverId:(apiClient.serverInfo()||{}).Id};return apiClient.logout().then((function(){events.trigger(self,"localusersignedout",[logoutInfo])}),(function(){events.trigger(self,"localusersignedout",[logoutInfo])}))}function convertEndpointAddressToManualAddress(info){if(info.Address&&info.EndpointAddress){var address=info.EndpointAddress.split(":")[0],parts=info.Address.split(":");if(parts.length>1){var portString=parts[parts.length-1];isNaN(parseInt(portString))||(address+=":"+portString)}return normalizeAddress(address)}return null}function tryReconnect(serverInfo){var addresses=[],addressesStrings=[];return!serverInfo.manualAddressOnly&&serverInfo.LocalAddress&&-1===addressesStrings.indexOf(serverInfo.LocalAddress)&&(addresses.push({url:serverInfo.LocalAddress,mode:ConnectionMode.Local,timeout:0}),addressesStrings.push(addresses[addresses.length-1].url)),serverInfo.ManualAddress&&-1===addressesStrings.indexOf(serverInfo.ManualAddress)&&(addresses.push({url:serverInfo.ManualAddress,mode:ConnectionMode.Manual,timeout:100}),addressesStrings.push(addresses[addresses.length-1].url)),!serverInfo.manualAddressOnly&&serverInfo.RemoteAddress&&-1===addressesStrings.indexOf(serverInfo.RemoteAddress)&&(addresses.push({url:serverInfo.RemoteAddress,mode:ConnectionMode.Remote,timeout:200}),addressesStrings.push(addresses[addresses.length-1].url)),console.debug("tryReconnect: "+addressesStrings.join("|")),new Promise((function(resolve,reject){var state={};state.numAddresses=addresses.length,state.rejects=0,addresses.map((function(url){setTimeout((function(){state.resolved||function getTryConnectPromise(url,connectionMode,state,resolve,reject){console.debug("getTryConnectPromise "+url),ajax({url:getEmbyServerUrl(url,"system/info/public"),timeout:2e4,type:"GET",dataType:"json"}).then((function(result){state.resolved||(state.resolved=!0,console.debug("Reconnect succeeded to "+url),resolve({url:url,connectionMode:connectionMode,data:result}))}),(function(){state.resolved||(console.error("Reconnect failed to "+url),++state.rejects>=state.numAddresses&&reject())}))}(url.url,url.mode,state,resolve,reject)}),url.timeout)}))}))}function onSuccessfulConnection(server,systemInfo,connectionMode,serverUrl,options,resolve){(function afterConnectValidated(server,credentials,systemInfo,connectionMode,serverUrl,verifyLocalAuthentication,options,resolve){if(!1===(options=options||{}).enableAutoLogin)server.UserId=null,server.AccessToken=null;else if(verifyLocalAuthentication&&server.AccessToken&&!1!==options.enableAutoLogin)return void function validateAuthentication(server,serverUrl){return ajax({type:"GET",url:getEmbyServerUrl(serverUrl,"System/Info"),dataType:"json",headers:{"X-MediaBrowser-Token":server.AccessToken}}).then((function(systemInfo){return updateServerInfo(server,systemInfo),Promise.resolve()}),(function(){return server.UserId=null,server.AccessToken=null,Promise.resolve()}))}(server,serverUrl).then((function(){afterConnectValidated(server,credentials,systemInfo,connectionMode,serverUrl,!1,options,resolve)}));updateServerInfo(server,systemInfo),server.LastConnectionMode=connectionMode,!1!==options.updateDateLastAccessed&&(server.DateLastAccessed=(new Date).getTime());credentialProvider.addOrUpdateServer(credentials.Servers,server),credentialProvider.credentials(credentials);var result={Servers:[]};result.ApiClient=self._getOrAddApiClient(server,serverUrl),result.ApiClient.setSystemInfo(systemInfo),result.State=server.AccessToken&&!1!==options.enableAutoLogin?"SignedIn":"ServerSignIn",result.Servers.push(server),result.ApiClient.enableAutomaticBitrateDetection=options.enableAutomaticBitrateDetection,result.ApiClient.updateServerInfo(server,serverUrl);var resolveActions=function resolveActions(){resolve(result),events.trigger(self,"connected",[result])};"SignedIn"===result.State?(afterConnected(result.ApiClient,options),result.ApiClient.getCurrentUser().then((function(user){onLocalUserSignIn(server,serverUrl,user).then(resolveActions,resolveActions)}),resolveActions)):resolveActions()})(server,credentialProvider.credentials(),systemInfo,connectionMode,serverUrl,!0,options=options||{},resolve)}console.debug("Begin ConnectionManager constructor");var self=this;this._apiClients=[],self._minServerVersion="3.2.33",self.appVersion=function(){return appVersion},self.appName=function(){return appName},self.capabilities=function(){return capabilities},self.deviceId=function(){return deviceId},self.credentialProvider=function(){return credentialProvider},self.getServerInfo=function(id){return credentialProvider.credentials().Servers.filter((function(s){return s.Id===id}))[0]},self.getLastUsedServer=function(){var servers=credentialProvider.credentials().Servers;return servers.sort((function(a,b){return(b.DateLastAccessed||0)-(a.DateLastAccessed||0)})),servers.length?servers[0]:null},self.addApiClient=function(apiClient){self._apiClients.push(apiClient);var existingServers=credentialProvider.credentials().Servers.filter((function(s){return stringEqualsIgnoreCase(s.ManualAddress,apiClient.serverAddress())||stringEqualsIgnoreCase(s.LocalAddress,apiClient.serverAddress())||stringEqualsIgnoreCase(s.RemoteAddress,apiClient.serverAddress())})),existingServer=existingServers.length?existingServers[0]:apiClient.serverInfo();if(existingServer.DateLastAccessed=(new Date).getTime(),existingServer.LastConnectionMode=ConnectionMode.Manual,existingServer.ManualAddress=apiClient.serverAddress(),apiClient.manualAddressOnly&&(existingServer.manualAddressOnly=!0),apiClient.serverInfo(existingServer),apiClient.onAuthenticated=function(instance,result){return onAuthenticated(instance,result,{},!0)},!existingServers.length){var credentials=credentialProvider.credentials();credentials.Servers=[existingServer],credentialProvider.credentials(credentials)}events.trigger(self,"apiclientcreated",[apiClient])},self.clearData=function(){console.debug("connection manager clearing data");var credentials=credentialProvider.credentials();credentials.Servers=[],credentialProvider.credentials(credentials)},self._getOrAddApiClient=function(server,serverUrl){var apiClient=self.getApiClient(server.Id);return apiClient||(apiClient=new apiClientFactory(serverUrl,appName,appVersion,deviceName,deviceId),self._apiClients.push(apiClient),apiClient.serverInfo(server),apiClient.onAuthenticated=function(instance,result){return onAuthenticated(instance,result,{},!0)},events.trigger(self,"apiclientcreated",[apiClient])),console.debug("returning instance from getOrAddApiClient"),apiClient},self.getOrCreateApiClient=function(serverId){var servers=credentialProvider.credentials().Servers.filter((function(s){return stringEqualsIgnoreCase(s.Id,serverId)}));if(!servers.length)throw new Error("Server not found: "+serverId);var server=servers[0];return self._getOrAddApiClient(server,getServerAddress(server,server.LastConnectionMode))},self.user=function(apiClient){return new Promise((function(resolve,reject){var localUser;apiClient&&apiClient.getCurrentUserId()&&function onLocalUserDone(e){apiClient&&apiClient.getCurrentUserId()&&apiClient.getCurrentUser().then((function(u){var image=function getImageUrl(localUser){return localUser&&localUser.PrimaryImageTag?{url:self.getApiClient(localUser).getUserImageUrl(localUser.Id,{tag:localUser.PrimaryImageTag,type:"Primary"}),supportsParams:!0}:{url:null,supportsParams:!1}}(localUser=u);resolve({localUser:localUser,name:localUser?localUser.Name:null,imageUrl:image.url,supportsImageParams:image.supportsParams})}),onLocalUserDone)}()}))},self.logout=function(){console.debug("begin connectionManager loguot");for(var promises=[],i=0,length=self._apiClients.length;i<length;i++){var apiClient=self._apiClients[i];apiClient.accessToken()&&promises.push(logoutOfServer(apiClient))}return Promise.all(promises).then((function(){for(var servers=credentialProvider.credentials().Servers.filter((function(u){return"Guest"!==u.UserLinkType})),j=0,numServers=servers.length;j<numServers;j++){var server=servers[j];server.UserId=null,server.AccessToken=null,server.ExchangeToken=null}}))},self.getSavedServers=function(){var servers=credentialProvider.credentials().Servers.slice(0);return servers.sort((function(a,b){return(b.DateLastAccessed||0)-(a.DateLastAccessed||0)})),servers},self.getAvailableServers=function(){console.debug("begin getAvailableServers");var credentials=credentialProvider.credentials();return Promise.all([new Promise((function(resolve,reject){var onFinish=function onFinish(foundServers){var servers=foundServers.map((function(foundServer){var info={Id:foundServer.Id,LocalAddress:convertEndpointAddressToManualAddress(foundServer)||foundServer.Address,Name:foundServer.Name};return info.LastConnectionMode=info.ManualAddress?ConnectionMode.Manual:ConnectionMode.Local,info}));resolve(servers)};window.NativeShell&&"function"==typeof window.NativeShell.findServers?window.NativeShell.findServers(1e3).then(onFinish,(function(){onFinish([])})):resolve([])}))]).then((function(responses){var foundServers=responses[0],servers=credentials.Servers.slice(0);return function mergeServers(credentialProvider,list1,list2){for(var i=0,length=list2.length;i<length;i++)credentialProvider.addOrUpdateServer(list1,list2[i]);return list1}(credentialProvider,servers,foundServers),servers.sort((function(a,b){return(b.DateLastAccessed||0)-(a.DateLastAccessed||0)})),credentials.Servers=servers,credentialProvider.credentials(credentials),servers}))},self.connectToServers=function(servers,options){console.debug("begin connectToServers, with "+servers.length+" servers");var firstServer=servers.length?servers[0]:null;return firstServer?self.connectToServer(firstServer,options).then((function(result){return"Unavailable"===result.State&&(result.State="ServerSelection"),console.debug("resolving connectToServers with result.State: "+result.State),result})):Promise.resolve({Servers:servers,State:"ServerSelection"})},self.connectToServer=function(server,options){return console.debug("begin connectToServer"),new Promise((function(resolve,reject){options=options||{},tryReconnect(server).then((function(result){var serverUrl=result.url,connectionMode=result.connectionMode;result=result.data,1===function compareVersions(a,b){a=a.split("."),b=b.split(".");for(var i=0,length=Math.max(a.length,b.length);i<length;i++){var aVal=parseInt(a[i]||"0"),bVal=parseInt(b[i]||"0");if(aVal<bVal)return-1;if(aVal>bVal)return 1}return 0}(self.minServerVersion(),result.Version)?(console.debug("minServerVersion requirement not met. Server version: "+result.Version),resolve({State:"ServerUpdateNeeded",Servers:[server]})):server.Id&&result.Id!==server.Id?(console.debug("http request succeeded, but found a different server Id than what was expected"),resolveFailure(0,resolve)):onSuccessfulConnection(server,result,connectionMode,serverUrl,options,resolve)}),(function(){resolveFailure(0,resolve)}))}))},self.connectToAddress=function(address,options){if(!address)return Promise.reject();var server={ManualAddress:address=normalizeAddress(address),LastConnectionMode:ConnectionMode.Manual};return self.connectToServer(server,options).catch((function onFail(){return console.error("connectToAddress "+address+" failed"),Promise.resolve({State:"Unavailable"})}))},self.deleteServer=function(serverId){if(!serverId)throw new Error("null serverId");var server=credentialProvider.credentials().Servers.filter((function(s){return s.Id===serverId}));return server=server.length?server[0]:null,new Promise((function(resolve,reject){server.ConnectServerId||function onDone(){var credentials=credentialProvider.credentials();credentials.Servers=credentials.Servers.filter((function(s){return s.Id!==serverId})),credentialProvider.credentials(credentials),resolve()}()}))}};return ConnectionManager.prototype.connect=function(options){console.debug("begin connect");var instance=this;return instance.getAvailableServers().then((function(servers){return instance.connectToServers(servers,options)}))},ConnectionManager.prototype.getApiClients=function(){for(var servers=this.getSavedServers(),i=0,length=servers.length;i<length;i++){var server=servers[i];server.Id&&this._getOrAddApiClient(server,getServerAddress(server,server.LastConnectionMode))}return this._apiClients},ConnectionManager.prototype.getApiClient=function(item){if(!item)throw new Error("item or serverId cannot be null");return item.ServerId&&(item=item.ServerId),this._apiClients.filter((function(a){var serverInfo=a.serverInfo();return!serverInfo||serverInfo.Id===item}))[0]},ConnectionManager.prototype.minServerVersion=function(val){return val&&(this._minServerVersion=val),this._minServerVersion},ConnectionManager.prototype.handleMessageReceived=function(msg){var serverId=msg.ServerId;if(serverId){var apiClient=this.getApiClient(serverId);if(apiClient){if("string"==typeof msg.Data)try{msg.Data=JSON.parse(msg.Data)}catch(err){}apiClient.handleMessageReceived(msg)}}},ConnectionManager}));