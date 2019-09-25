define(["cardBuilder","imageLoader","loading","connectionManager","apphost","layoutManager","scrollHelper","focusManager","datetime","globalize","emby-itemscontainer"],function(cardBuilder,imageLoader,loading,connectionManager,appHost,layoutManager,scrollHelper,focusManager,datetime,globalize){"use strict";function UpcomingTab(view,params){this.view=view,this.params=params,this.apiClient=connectionManager.getApiClient(params.serverId)}function enableScrollX(){return layoutManager.mobile}return UpcomingTab.prototype.onResume=function(options){var apiClient=this.apiClient;if(options.refresh){var promises=[],parentId=this.params.parentId;promises.push(apiClient.getUpcomingEpisodes({Limit:60,UserId:apiClient.getCurrentUserId(),ImageTypeLimit:1,EnableImageTypes:"Primary,Backdrop,Thumb",EnableTotalRecordCount:!1,parentId:parentId}));var view=this.view;promises[0].then(function(result){return function(view,items){var i,length,groups=[],currentGroupName="",currentGroup=[];for(i=0,length=items.length;i<length;i++){var item=items[i],dateText="";if(item.PremiereDate)try{var premiereDate=datetime.parseISO8601Date(item.PremiereDate,!0);dateText=datetime.isRelativeDay(premiereDate,-1)?globalize.translate("Yesterday"):datetime.toLocaleDateString(premiereDate,{weekday:"long",month:"short",day:"numeric"})}catch(err){dateText=item.PremiereDate}dateText!==currentGroupName?(currentGroup.length&&groups.push({name:currentGroupName,items:currentGroup}),currentGroupName=dateText,currentGroup=[item]):currentGroup.push(item)}var html="";for(i=0,length=groups.length;i<length;i++){var group=groups[i];html+='<div class="verticalSection">',html+='<h2 class="sectionTitle sectionTitle-cards padded-left">'+group.name+"</h2>";var allowBottomPadding=!0;enableScrollX()?(allowBottomPadding=!1,html+='<div is="emby-itemscontainer" class="itemsContainer scrollX hiddenScrollX focuscontainer-x padded-left padded-right">'):html+='<div is="emby-itemscontainer" class="itemsContainer vertical-wrap focuscontainer-x padded-left padded-right">';appHost.supports("imageanalysis");html+=cardBuilder.getCardsHtml({items:group.items,showLocationTypeIndicator:!1,shape:enableScrollX()?"overflowBackdrop":"backdrop",preferThumb:!0,lazy:!0,showDetailsMenu:!0,overlayText:!1,allowBottomPadding:allowBottomPadding,showParentTitle:!0,showTitle:!0,centerText:!0,missingIndicator:!1}),html+="</div>",html+="</div>"}var upcomingContainer=view.classList.contains("upcomingContainer")?view:view.querySelector(".upcomingContainer");upcomingContainer.innerHTML=html,imageLoader.lazyChildren(upcomingContainer)}(view,result.Items),Promise.resolve()}),Promise.all(promises).then(function(){options.autoFocus&&focusManager.autoFocus(view)})}},UpcomingTab.prototype.onPause=function(){},UpcomingTab.prototype.destroy=function(){this.view=null,this.params=null,this.apiClient=null},UpcomingTab});