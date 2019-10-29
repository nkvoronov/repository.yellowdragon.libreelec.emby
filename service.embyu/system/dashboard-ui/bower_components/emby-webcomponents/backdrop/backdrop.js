define(["browser","connectionManager","playbackManager","dom","css!./style"],function(browser,connectionManager,playbackManager,dom){"use strict";function Backdrop(){}var backdropContainer,hasExternalBackdrop,currentLoadingBackdrop,backgroundContainer,hasInternalBackdrop;function getBackdropContainer(){return(backdropContainer=backdropContainer||document.querySelector(".backdropContainer"))||((backdropContainer=document.createElement("div")).classList.add("backdropContainer"),document.body.insertBefore(backdropContainer,document.body.firstChild)),backdropContainer}function clearBackdrop(clearAll){clearRotation(),currentLoadingBackdrop&&(currentLoadingBackdrop.destroy(),currentLoadingBackdrop=null),getBackdropContainer().innerHTML="",clearAll&&(hasExternalBackdrop=!1),internalBackdrop(!1)}function getBackgroundContainer(){return backgroundContainer=backgroundContainer||document.querySelector(".backgroundContainer")}function setBackgroundContainerBackgroundEnabled(){hasInternalBackdrop||hasExternalBackdrop?getBackgroundContainer().classList.add("withBackdrop"):getBackgroundContainer().classList.remove("withBackdrop")}function internalBackdrop(enabled){hasInternalBackdrop=enabled,setBackgroundContainerBackgroundEnabled()}function setBackdropImage(url){currentLoadingBackdrop&&(currentLoadingBackdrop.destroy(),currentLoadingBackdrop=null);var elem=getBackdropContainer(),existingBackdropImage=elem.querySelector(".displayingBackdropImage");if(existingBackdropImage&&existingBackdropImage.getAttribute("data-url")===url){if(existingBackdropImage.getAttribute("data-url")===url)return;existingBackdropImage.classList.remove("displayingBackdropImage")}var instance=new Backdrop;instance.load(url,elem,existingBackdropImage),currentLoadingBackdrop=instance}Backdrop.prototype.load=function(url,parent,existingBackdropImage){var img=new Image,self=this;img.onload=function(){if(!self.isDestroyed){var backdropImage=document.createElement("div");if(backdropImage.classList.add("backdropImage"),backdropImage.classList.add("displayingBackdropImage"),backdropImage.style.backgroundImage="url('"+url+"')",backdropImage.setAttribute("data-url",url),backdropImage.classList.add("backdropImageFadeIn"),parent.appendChild(backdropImage),browser.slow)return existingBackdropImage&&existingBackdropImage.parentNode&&existingBackdropImage.parentNode.removeChild(existingBackdropImage),void internalBackdrop(!0);var onAnimationComplete=function(){dom.removeEventListener(backdropImage,dom.whichAnimationEvent(),onAnimationComplete,{once:!0}),backdropImage===self.currentAnimatingElement&&(self.currentAnimatingElement=null),existingBackdropImage&&existingBackdropImage.parentNode&&existingBackdropImage.parentNode.removeChild(existingBackdropImage)};dom.addEventListener(backdropImage,dom.whichAnimationEvent(),onAnimationComplete,{once:!0}),internalBackdrop(!0)}},img.src=url},Backdrop.prototype.cancelAnimation=function(){var elem=this.currentAnimatingElement;elem&&(elem.classList.remove("backdropImageFadeIn"),this.currentAnimatingElement=null)},Backdrop.prototype.destroy=function(){this.isDestroyed=!0,this.cancelAnimation()};var rotationInterval,standardWidths=[480,720,1280,1440,1920];function getBackdropMaxWidth(){var width=dom.getWindowSize().innerWidth;if(-1!==standardWidths.indexOf(width))return width;return width=100*Math.floor(width/100),Math.min(width,1920)}function getItemImageUrls(item,imageOptions){imageOptions=imageOptions||{};var apiClient=connectionManager.getApiClient(item.ServerId);return item.BackdropImageTags&&0<item.BackdropImageTags.length?item.BackdropImageTags.map(function(imgTag,index){return apiClient.getScaledImageUrl(item.BackdropItemId||item.Id,Object.assign(imageOptions,{type:"Backdrop",tag:imgTag,maxWidth:getBackdropMaxWidth(),index:index}))}):item.ParentBackdropItemId&&item.ParentBackdropImageTags&&item.ParentBackdropImageTags.length?item.ParentBackdropImageTags.map(function(imgTag,index){return apiClient.getScaledImageUrl(item.ParentBackdropItemId,Object.assign(imageOptions,{type:"Backdrop",tag:imgTag,maxWidth:getBackdropMaxWidth(),index:index}))}):[]}function getImageUrls(items,imageOptions){for(var list=[],onImg=function(img){list.push(img)},i=0,length=items.length;i<length;i++){getItemImageUrls(items[i],imageOptions).forEach(onImg)}return list}var currentRotatingImages=[],currentRotationIndex=-1;function onRotationInterval(){if(!playbackManager.isPlayingLocally(["Video","Game","Book","Photo"])){var newIndex=currentRotationIndex+1;newIndex>=currentRotatingImages.length&&(newIndex=0),setBackdropImage(currentRotatingImages[currentRotationIndex=newIndex])}}function clearRotation(){rotationInterval&&clearInterval(rotationInterval),rotationInterval=null,currentRotatingImages=[],currentRotationIndex=-1}return{setBackdrops:function(items,imageOptions,enableImageRotation){var images=getImageUrls(items,imageOptions);images.length?function(images,enableImageRotation){if(function(a,b){if(a===b)return!0;if(null==a||null==b)return!1;if(a.length!==b.length)return!1;for(var i=0;i<a.length;++i)if(a[i]!==b[i])return!1;return!0}(images,currentRotatingImages))return;clearRotation(),currentRotationIndex=-1,1<(currentRotatingImages=images).length&&!1!==enableImageRotation&&function(){return!browser.tv&&!browser.firefox}()&&(rotationInterval=setInterval(onRotationInterval,24e3));onRotationInterval()}(images,enableImageRotation):clearBackdrop()},setBackdrop:function(url,imageOptions){url&&"string"!=typeof url&&(url=getImageUrls([url],imageOptions)[0]),url?(clearRotation(),setBackdropImage(url)):clearBackdrop()},clear:clearBackdrop,externalBackdrop:function(enabled){hasExternalBackdrop=enabled,setBackgroundContainerBackgroundEnabled()}}});