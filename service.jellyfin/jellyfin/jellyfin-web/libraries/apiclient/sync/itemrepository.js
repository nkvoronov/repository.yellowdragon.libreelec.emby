"use strict";define([],(function(){function ServerDatabase(dbName,readyCallback){var request=indexedDB.open(dbName,dbVersion);request.onerror=function(event){},request.onupgradeneeded=function(event){var db=event.target.result;db.createObjectStore(dbName).transaction.oncomplete=function(event){readyCallback(db)}},request.onsuccess=function(event){var db=event.target.result;readyCallback(db)}}function getDbName(serverId){return"items_"+serverId}function getDb(serverId,callback){var dbName=getDbName(serverId),db=databases[dbName];db?callback(db):new ServerDatabase(dbName,(function(db){databases[dbName]=db,callback(db)}))}function getAll(serverId,userId){return new Promise((function(resolve,reject){getDb(serverId,(function(db){var request,storeName=getDbName(serverId),objectStore=db.transaction([storeName],"readonly").objectStore(storeName);if("getAll"in objectStore)(request=objectStore.getAll(null,1e4)).onsuccess=function(event){resolve(event.target.result)};else{var results=[];(request=objectStore.openCursor()).onsuccess=function(event){var cursor=event.target.result;cursor?(results.push(cursor.value),cursor.continue()):resolve(results)}}request.onerror=reject}))}))}function filterDistinct(value,index,self){return self.indexOf(value)===index}var indexedDB=self.indexedDB||self.mozIndexedDB||self.webkitIndexedDB||self.msIndexedDB,dbVersion=(self.IDBTransaction||self.webkitIDBTransaction||self.msIDBTransaction,self.IDBKeyRange||self.webkitIDBKeyRange||self.msIDBKeyRange,1),databases={};return{get:function get(serverId,key){return new Promise((function(resolve,reject){getDb(serverId,(function(db){var storeName=getDbName(serverId),request=db.transaction([storeName],"readonly").objectStore(storeName).get(key);request.onerror=reject,request.onsuccess=function(event){resolve(request.result)}}))}))},set:function set(serverId,key,val){return new Promise((function(resolve,reject){getDb(serverId,(function(db){var storeName=getDbName(serverId),request=db.transaction([storeName],"readwrite").objectStore(storeName).put(val,key);request.onerror=reject,request.onsuccess=resolve}))}))},remove:function remove(serverId,key){return new Promise((function(resolve,reject){getDb(serverId,(function(db){var storeName=getDbName(serverId),request=db.transaction([storeName],"readwrite").objectStore(storeName).delete(key);request.onerror=reject,request.onsuccess=resolve}))}))},clear:function clear(serverId){return new Promise((function(resolve,reject){getDb(serverId,(function(db){var storeName=getDbName(serverId),request=db.transaction([storeName],"readwrite").objectStore(storeName).clear();request.onerror=reject,request.onsuccess=resolve}))}))},getAll:getAll,getServerItemTypes:function getServerItemTypes(serverId,userId){return getAll(serverId,userId).then((function(all){return all.map((function(item2){return item2.Item.Type||""})).filter(filterDistinct)}))}}}));