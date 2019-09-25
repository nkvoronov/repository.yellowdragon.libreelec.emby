define(["jQuery","dom","datetime","loading","appRouter","globalize","listViewStyle","paper-icon-button-light","emby-linkbutton","emby-checkbox","emby-button","emby-select"],function($,dom,datetime,loading,appRouter,globalize){"use strict";function loadUser(page,user,allParentalRatings){page.querySelector(".username").innerHTML=user.Name,appRouter.setTitle(user.Name),function(page,user){var items=[{name:globalize.translate("OptionBlockBooks"),value:"Book"},{name:globalize.translate("OptionBlockGames"),value:"Game"},{name:globalize.translate("OptionBlockChannelContent"),value:"ChannelContent"},{name:globalize.translate("OptionBlockLiveTvChannels"),value:"LiveTvChannel"},{name:globalize.translate("OptionBlockMovies"),value:"Movie"},{name:globalize.translate("OptionBlockMusic"),value:"Music"},{name:globalize.translate("OptionBlockTrailers"),value:"Trailer"},{name:globalize.translate("OptionBlockTvShows"),value:"Series"}],html="";html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderBlockItemsWithNoRating")+"</h3>",html+='<div class="checkboxList paperList checkboxList-paperList">';for(var i=0,length=items.length;i<length;i++){var item=items[i],checkedAttribute=-1!==user.Policy.BlockUnratedItems.indexOf(item.value)?' checked="checked"':"";html+='<label><input type="checkbox" is="emby-checkbox" class="chkUnratedItem" data-itemtype="'+item.value+'" type="checkbox"'+checkedAttribute+"><span>"+item.name+"</span></label>"}html+="</div>",page.querySelector(".blockUnratedItems").innerHTML=html}(page,user),loadBlockedTags(page,user.Policy.BlockedTags),function(allParentalRatings,page){var html="";html+="<option value=''></option>";var i,length,rating,ratings=[];for(i=0,length=allParentalRatings.length;i<length;i++){if(rating=allParentalRatings[i],ratings.length){var lastRating=ratings[ratings.length-1];if(lastRating.Value===rating.Value){lastRating.Name+="/"+rating.Name;continue}}ratings.push({Name:rating.Name,Value:rating.Value})}for(i=0,length=ratings.length;i<length;i++)html+="<option value='"+(rating=ratings[i]).Value+"'>"+rating.Name+"</option>";page.querySelector("#selectMaxParentalRating").innerHTML=html}(allParentalRatings,page);var ratingValue="";if(user.Policy.MaxParentalRating)for(var i=0,length=allParentalRatings.length;i<length;i++){var rating=allParentalRatings[i];user.Policy.MaxParentalRating>=rating.Value&&(ratingValue=rating.Value)}page.querySelector("#selectMaxParentalRating").value=ratingValue,page.querySelector("#selectTagMode").value=user.Policy.IsTagBlockingModeInclusive?"include":"",user.Policy.IsAdministrator?page.querySelector(".accessScheduleSection").classList.add("hide"):page.querySelector(".accessScheduleSection").classList.remove("hide"),renderAccessSchedule(page,user.Policy.AccessSchedules||[]),loading.hide()}function loadBlockedTags(page,tags){var html=tags.map(function(h){var li='<div class="listItem">';return li+='<div class="listItemBody">',li+='<h3 class="listItemBodyText">',li+=h,li+="</h3>",li+="</div>",li+='<button type="button" is="paper-icon-button-light" class="blockedTag btnDeleteTag listItemButton" data-tag="'+h+'"><i class="md-icon">delete</i></button>',li+="</div>"}).join("");html=html&&'<div class="paperList">'+html+"</div>";var elem=$(".blockedTags",page).html(html).trigger("create");$(".btnDeleteTag",elem).on("click",function(){var tag=this.getAttribute("data-tag"),newTags=tags.filter(function(t){return t!==tag});loadBlockedTags(page,newTags)})}function renderAccessSchedule(page,schedules){var html="",index=0;html+=schedules.map(function(a){var itemHtml="";return itemHtml+='<div class="liSchedule listItem" data-day="'+a.DayOfWeek+'" data-start="'+a.StartHour+'" data-end="'+a.EndHour+'">',itemHtml+='<div class="listItemBody two-line">',itemHtml+='<h3 class="listItemBodyText">',itemHtml+=globalize.translate("Option"+a.DayOfWeek),itemHtml+="</h3>",itemHtml+='<div class="listItemBodyText secondary">'+getDisplayTime(a.StartHour)+" - "+getDisplayTime(a.EndHour)+"</div>",itemHtml+="</div>",itemHtml+='<button type="button" is="paper-icon-button-light" class="btnDelete listItemButton" data-index="'+index+'"><i class="md-icon">delete</i></button>',index++,itemHtml+="</div>"}).join("");var accessScheduleList=page.querySelector(".accessScheduleList");accessScheduleList.innerHTML=html,$(".btnDelete",accessScheduleList).on("click",function(){!function(page,schedules,index){schedules.splice(index,1),renderAccessSchedule(page,schedules)}(page,schedules,parseInt(this.getAttribute("data-index")))})}function saveUser(user,page){user.Policy.MaxParentalRating=$("#selectMaxParentalRating",page).val()||null,user.Policy.IsTagBlockingModeInclusive="include"===page.querySelector("#selectTagMode").value,user.Policy.BlockUnratedItems=$(".chkUnratedItem",page).get().filter(function(i){return i.checked}).map(function(i){return i.getAttribute("data-itemtype")}),user.Policy.AccessSchedules=getSchedulesFromPage(page),user.Policy.BlockedTags=getBlockedTagsFromPage(page),ApiClient.updateUserPolicy(user.Id,user.Policy).then(function(){loading.hide(),require(["toast"],function(toast){toast(globalize.translate("SettingsSaved"))})})}function onSubmit(){var page=dom.parentWithClass(this,"page");loading.show();var userId=getParameterByName("userId");return ApiClient.getUser(userId).then(function(result){saveUser(result,page)}),!1}function getDisplayTime(hours){var minutes=0,pct=hours%1;return pct&&(minutes=parseInt(60*pct)),datetime.getDisplayTime(new Date(2e3,1,1,hours,minutes,0,0))}function getSchedulesFromPage(page){return $(".liSchedule",page).map(function(){return{DayOfWeek:this.getAttribute("data-day"),StartHour:this.getAttribute("data-start"),EndHour:this.getAttribute("data-end")}}).get()}function getBlockedTagsFromPage(page){return $(".blockedTag",page).map(function(){return this.getAttribute("data-tag")}).get()}return function(view,params){var page=view;$(".btnAddSchedule",page).on("click",function(){!function(page,schedule,index){schedule=schedule||{},require(["components/accessschedule/accessschedule"],function(accessschedule){accessschedule.show({schedule:schedule}).then(function(updatedSchedule){var schedules=getSchedulesFromPage(page);-1===index&&(index=schedules.length),schedules[index]=updatedSchedule,renderAccessSchedule(page,schedules)})})}(page,{},-1)}),$(".btnAddBlockedTag",page).on("click",function(){!function(page){require(["prompt"],function(prompt){prompt({label:globalize.translate("LabelTag")}).then(function(value){var tags=getBlockedTagsFromPage(page);-1===tags.indexOf(value)&&(tags.push(value),loadBlockedTags(page,tags))})})}(page)}),$(".userParentalControlForm").off("submit",onSubmit).on("submit",onSubmit);for(var btns=page.querySelectorAll(".userEditTabButton"),i=0,length=btns.length;i<length;i++)btns[i].href=btns[i].getAttribute("data-href")+"?userId="+params.userId;var tagModeHtml='<option value="" selected>'+globalize.translate("BlockItemsWithTheseTags")+"</option>";ApiClient.isMinServerVersion("4.2")&&(tagModeHtml+='<option value="include">'+globalize.translate("AllowItemsWithTheseTags")+"</option>"),page.querySelector("#selectTagMode").innerHTML=tagModeHtml,view.addEventListener("viewshow",function(){var page=this;loading.show();var promise1=ApiClient.getUser(params.userId),promise2=ApiClient.getParentalRatings();Promise.all([promise1,promise2]).then(function(responses){loadUser(page,responses[0],responses[1])})})}});