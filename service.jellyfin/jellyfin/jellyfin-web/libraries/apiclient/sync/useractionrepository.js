"use strict";define([],(function(){function getDb(callback){var request=indexedDB.open(dbName,dbVersion);request.onerror=function(event){},request.onupgradeneeded=function(event){var db=event.target.result;db.createObjectStore(dbName).transaction.oncomplete=function(event){callback(db)}},request.onsuccess=function(event){var db=event.target.result;callback(db)}}function getAll(){return new Promise((function(resolve,reject){getDb((function(db){var request,storeName=dbName,objectStore=db.transaction([storeName],"readonly").objectStore(storeName);if("getAll"in objectStore)(request=objectStore.getAll(null,1e4)).onsuccess=function(event){resolve(event.target.result)};else{var results=[];(request=objectStore.openCursor()).onsuccess=function(event){var cursor=event.target.result;cursor?(results.push(cursor.value),cursor.continue()):resolve(results)}}request.onerror=reject}))}))}var indexedDB=self.indexedDB||self.mozIndexedDB||self.webkitIndexedDB||self.msIndexedDB,dbName=(self.IDBTransaction||self.webkitIDBTransaction||self.msIDBTransaction,self.IDBKeyRange||self.webkitIDBKeyRange||self.msIDBKeyRange,"useractions"),dbVersion=1;return{get:function get(key){return new Promise((function(resolve,reject){getDb((function(db){var storeName=dbName,request=db.transaction([storeName],"readonly").objectStore(storeName).get(key);request.onerror=reject,request.onsuccess=function(event){resolve(request.result)}}))}))},set:function set(key,val){return new Promise((function(resolve,reject){getDb((function(db){var storeName=dbName,request=db.transaction([storeName],"readwrite").objectStore(storeName).put(val,key);request.onerror=reject,request.onsuccess=resolve}))}))},remove:function remove(key){return new Promise((function(resolve,reject){getDb((function(db){var storeName=dbName,request=db.transaction([storeName],"readwrite").objectStore(storeName).delete(key);request.onerror=reject,request.onsuccess=resolve}))}))},clear:function clear(){return new Promise((function(resolve,reject){getDb((function(db){var storeName=dbName,request=db.transaction([storeName],"readwrite").objectStore(storeName).clear();request.onerror=reject,request.onsuccess=resolve}))}))},getAll:getAll,getByServerId:function getByServerId(serverId){return getAll().then((function(items){return items.filter((function(item){return item.ServerId===serverId}))}))}}}));