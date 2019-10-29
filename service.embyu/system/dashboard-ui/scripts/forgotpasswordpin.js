define(["globalize"],function(globalize){"use strict";function onBackClick(){history.back()}function processForgotPasswordResult(result){if(result.Success){var msg=globalize.translate("MessagePasswordResetForUsers");return msg+="<br/>",msg+="<br/>",msg+=result.UsersReset.join("<br/>"),void Dashboard.alert({message:msg,title:globalize.translate("HeaderPasswordReset"),callback:function(){window.location.href="index.html"}})}Dashboard.alert({message:globalize.translate("MessageInvalidForgotPasswordPin"),title:globalize.translate("HeaderPasswordReset")})}return function(view,params){view.querySelector(".btnCancel").addEventListener("click",onBackClick),view.querySelector("form").addEventListener("submit",function(e){return ApiClient.ajax({type:"POST",url:ApiClient.getUrl("Users/ForgotPassword/Pin"),dataType:"json",data:{Pin:view.querySelector("#txtPin").value}}).then(processForgotPasswordResult),e.preventDefault(),!1})}});