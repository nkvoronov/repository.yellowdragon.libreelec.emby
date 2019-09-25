define(["globalize"],function(globalize){"use strict";function onBackClick(){history.back()}function processForgotPasswordResult(result){if("ContactAdmin"!==result.Action)if("InNetworkRequired"!==result.Action){if("PinCode"===result.Action){var msg=globalize.translate("MessageForgotPasswordFileCreated");return msg+="<br/>",msg+="<br/>",msg+=result.PinFile,msg+="<br/>",void Dashboard.alert({message:msg,title:globalize.translate("HeaderForgotPassword")})}}else Dashboard.alert({message:globalize.translate("MessageForgotPasswordInNetworkRequired"),title:globalize.translate("HeaderForgotPassword")});else Dashboard.alert({message:globalize.translate("MessageContactAdminToResetPassword"),title:globalize.translate("HeaderForgotPassword")})}return function(view,params){view.querySelector(".btnCancel").addEventListener("click",onBackClick),view.querySelector("form").addEventListener("submit",function(e){return ApiClient.ajax({type:"POST",url:ApiClient.getUrl("Users/ForgotPassword"),dataType:"json",data:{EnteredUsername:view.querySelector("#txtName").value}}).then(processForgotPasswordResult),e.preventDefault(),!1})}});