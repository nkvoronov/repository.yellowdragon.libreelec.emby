define(["appSettings","loading","browser","globalize","connectionManager","emby-linkbutton"],function(appSettings,loading,browser,globalize,connectionManager){"use strict";function handleConnectionResult(page,result){switch(loading.hide(),result.State){case"SignedIn":var apiClient=result.ApiClient;Dashboard.onServerChanged(apiClient.getCurrentUserId(),apiClient.accessToken(),apiClient),Dashboard.navigate("home.html");break;case"ServerSignIn":Dashboard.navigate("login.html?serverid="+result.Servers[0].Id,!1,"none");break;case"ServerSelection":Dashboard.navigate("selectserver.html",!1,"none");break;case"ConnectSignIn":loadMode(page,"welcome");break;case"ServerUpdateNeeded":Dashboard.alert({message:globalize.translate("ServerUpdateNeeded",'<a href="https://emby.media">https://emby.media</a>')});break;case"Unavailable":Dashboard.alert({message:globalize.translate("MessageUnableToConnectToServer"),title:globalize.translate("HeaderConnectionFailure")})}}function loadPage(page,params){var mode=params.mode||"auto";if("auto"===mode){if(AppInfo.isNativeApp)return void function(page){loading.show(),connectionManager.connect({enableAutoLogin:appSettings.enableAutoLogin()}).then(function(result){handleConnectionResult(page,result)})}(page);mode="connect"}loadMode(page,mode)}function loadMode(page,mode){"welcome"===mode?(page.querySelector(".connectLoginForm").classList.add("hide"),page.querySelector(".welcomeContainer").classList.remove("hide"),page.querySelector(".manualServerForm").classList.add("hide"),page.querySelector(".signupForm").classList.add("hide")):"connect"===mode?(page.querySelector(".connectLoginForm").classList.remove("hide"),page.querySelector(".welcomeContainer").classList.add("hide"),page.querySelector(".manualServerForm").classList.add("hide"),page.querySelector(".signupForm").classList.add("hide")):"manualserver"===mode?(page.querySelector(".manualServerForm").classList.remove("hide"),page.querySelector(".connectLoginForm").classList.add("hide"),page.querySelector(".welcomeContainer").classList.add("hide"),page.querySelector(".signupForm").classList.add("hide")):"signup"===mode&&(page.querySelector(".manualServerForm").classList.add("hide"),page.querySelector(".connectLoginForm").classList.add("hide"),page.querySelector(".welcomeContainer").classList.add("hide"),page.querySelector(".signupForm").classList.remove("hide"),function(page){if(!supportInAppSignup())return;if(AppInfo.isNativeApp||0!==window.location.href.toLowerCase().indexOf("https"))return;require(["https://www.google.com/recaptcha/api.js?render=explicit"],function(){setTimeout(function(){var recaptchaContainer=page.querySelector(".recaptchaContainer");greWidgetId=grecaptcha.render(recaptchaContainer,{sitekey:"6Le2LAgTAAAAAK06Wvttt_yUnbISTy6q3Azqp9po",theme:"dark"})},100)})}(page))}function skip(){Dashboard.navigate("selectserver.html")}function supportInAppSignup(){return AppInfo.isNativeApp||0===window.location.href.toLowerCase().indexOf("https")}var greWidgetId;function submit(page){var user=page.querySelector("#txtManualName").value,password=page.querySelector("#txtManualPassword").value;!function(page,username,password){loading.show(),appSettings.enableAutoLogin(!0),connectionManager.loginToConnect(username,password).then(function(){loading.hide(),Dashboard.navigate("selectserver.html")},function(){loading.hide(),Dashboard.alert({message:globalize.translate("MessageInvalidUser"),title:globalize.translate("HeaderLoginFailure")}),page.querySelector("#txtManualPassword").value=""})}(page,user,password)}return function(view,params){function goBack(){require(["appRouter"],function(appRouter){appRouter.back()})}view.querySelector(".btnSkipConnect").addEventListener("click",skip),view.querySelector(".connectLoginForm").addEventListener("submit",function(e){return submit(view),e.preventDefault(),!1}),view.querySelector(".manualServerForm").addEventListener("submit",function(e){return function(page){var host=page.querySelector("#txtServerHost").value,port=page.querySelector("#txtServerPort").value;port&&(host=function(string,charToRemove){for(;string.charAt(string.length-1)===charToRemove;)string=string.substring(0,string.length-1);return string}(host,"/"),host+=":"+port),loading.show(),connectionManager.connectToAddress(host,{enableAutoLogin:appSettings.enableAutoLogin()}).then(function(result){handleConnectionResult(page,result)},function(){handleConnectionResult(page,{State:"Unavailable"})})}(view),e.preventDefault(),!1}),view.querySelector(".signupForm").addEventListener("submit",function(e){if(!supportInAppSignup())return e.preventDefault(),!1;var page=view,greResponse=greWidgetId?grecaptcha.getResponse(greWidgetId):null;return connectionManager.signupForConnect({email:page.querySelector("#txtSignupEmail",page).value,username:page.querySelector("#txtSignupUsername",page).value,password:page.querySelector("#txtSignupPassword",page).value,passwordConfirm:page.querySelector("#txtSignupPasswordConfirm",page).value,grecaptcha:greResponse}).then(function(result){var msg=result.Validated?globalize.translate("MessageThankYouForConnectSignUpNoValidation"):globalize.translate("MessageThankYouForConnectSignUp");Dashboard.alert({message:msg,callback:function(){Dashboard.navigate("connectlogin.html?mode=welcome")}})},function(result){"passwordmatch"===result.errorCode?Dashboard.alert({message:globalize.translate("ErrorMessagePasswordNotMatchConfirm")}):"USERNAME_IN_USE"===result.errorCode?Dashboard.alert({message:globalize.translate("ErrorMessageUsernameInUse")}):"EMAIL_IN_USE"===result.errorCode?Dashboard.alert({message:globalize.translate("ErrorMessageEmailInUse")}):Dashboard.alert({message:globalize.translate("DefaultErrorMessage")})}),e.preventDefault(),!1}),view.querySelector(".btnSignupForConnect").addEventListener("click",function(e){if(supportInAppSignup())return e.preventDefault(),e.stopPropagation(),Dashboard.navigate("connectlogin.html?mode=signup"),!1}),view.querySelector(".btnCancelSignup").addEventListener("click",goBack),view.querySelector(".btnCancelManualServer").addEventListener("click",goBack),view.querySelector(".btnWelcomeNext").addEventListener("click",function(){Dashboard.navigate("connectlogin.html?mode=connect")});var terms=view.querySelector(".terms");terms.innerHTML=globalize.translate("LoginDisclaimer")+"<div style='margin-top:5px;'><a is='emby-linkbutton' class='button-link' href='https://emby.media/terms' target='_blank'>"+globalize.translate("TermsOfUse")+"</a></div>",AppInfo.isNativeApp?(terms.classList.add("hide"),view.querySelector(".tvAppInfo").classList.add("hide")):(terms.classList.remove("hide"),view.querySelector(".tvAppInfo").classList.remove("hide")),view.addEventListener("viewbeforeshow",function(){if(this.querySelector("#txtSignupEmail").value="",this.querySelector("#txtSignupUsername").value="",this.querySelector("#txtSignupPassword").value="",this.querySelector("#txtSignupPasswordConfirm").value="",browser.safari&&AppInfo.isNativeApp)this.querySelector(".embyIntroDownloadMessage").innerHTML=globalize.translate("ServerDownloadMessageWithoutLink");else{this.querySelector(".embyIntroDownloadMessage").innerHTML=globalize.translate("ServerDownloadMessage",'<a is="emby-linkbutton" class="button-link" href="https://emby.media" target="_blank">https://emby.media</a>')}}),view.addEventListener("viewshow",function(){loadPage(view,params)})}});