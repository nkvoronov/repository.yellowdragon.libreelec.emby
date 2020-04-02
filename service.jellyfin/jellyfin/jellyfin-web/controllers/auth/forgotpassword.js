"use strict";define([],(function(){function processForgotPasswordResult(result){if("ContactAdmin"!=result.Action)if("InNetworkRequired"!=result.Action){if("PinCode"==result.Action){var msg=Globalize.translate("MessageForgotPasswordFileCreated");return msg+="<br/>",msg+="<br/>",msg+="Enter PIN here to finish Password Reset<br/>",msg+="<br/>",msg+=result.PinFile,msg+="<br/>",void Dashboard.alert({message:msg,title:Globalize.translate("HeaderForgotPassword"),callback:function callback(){Dashboard.navigate("forgotpasswordpin.html")}})}}else Dashboard.alert({message:Globalize.translate("MessageForgotPasswordInNetworkRequired"),title:Globalize.translate("HeaderForgotPassword")});else Dashboard.alert({message:Globalize.translate("MessageContactAdminToResetPassword"),title:Globalize.translate("HeaderForgotPassword")})}return function(view,params){view.querySelector("form").addEventListener("submit",(function onSubmit(e){return ApiClient.ajax({type:"POST",url:ApiClient.getUrl("Users/ForgotPassword"),dataType:"json",data:{EnteredUsername:view.querySelector("#txtName").value}}).then(processForgotPasswordResult),e.preventDefault(),!1}))}}));