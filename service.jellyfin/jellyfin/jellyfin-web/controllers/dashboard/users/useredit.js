"use strict";define(["jQuery","loading","libraryMenu","globalize"],(function($,loading,libraryMenu,globalize){function loadUser(page,user){user,ApiClient.getJSON(ApiClient.getUrl("Auth/Providers")).then((function(providers){!function loadAuthProviders(page,user,providers){providers.length>1?page.querySelector(".fldSelectLoginProvider").classList.remove("hide"):page.querySelector(".fldSelectLoginProvider").classList.add("hide");var currentProviderId=user.Policy.AuthenticationProviderId;page.querySelector(".selectLoginProvider").innerHTML=providers.map((function(provider){var selected=provider.Id===currentProviderId||providers.length<2?" selected":"";return'<option value="'+provider.Id+'"'+selected+">"+provider.Name+"</option>"}))}(page,user,providers)})),ApiClient.getJSON(ApiClient.getUrl("Auth/PasswordResetProviders")).then((function(providers){!function loadPasswordResetProviders(page,user,providers){providers.length>1?page.querySelector(".fldSelectPasswordResetProvider").classList.remove("hide"):page.querySelector(".fldSelectPasswordResetProvider").classList.add("hide");var currentProviderId=user.Policy.PasswordResetProviderId;page.querySelector(".selectPasswordResetProvider").innerHTML=providers.map((function(provider){var selected=provider.Id===currentProviderId||providers.length<2?" selected":"";return'<option value="'+provider.Id+'"'+selected+">"+provider.Name+"</option>"}))}(page,user,providers)})),ApiClient.getJSON(ApiClient.getUrl("Library/MediaFolders",{IsHidden:!1})).then((function(folders){!function loadDeleteFolders(page,user,mediaFolders){ApiClient.getJSON(ApiClient.getUrl("Channels",{SupportsMediaDeletion:!0})).then((function(channelsResult){var i,length,folder,checkedAttribute,html="";for(i=0,length=mediaFolders.length;i<length;i++)folder=mediaFolders[i],checkedAttribute=user.Policy.EnableContentDeletion||-1!=user.Policy.EnableContentDeletionFromFolders.indexOf(folder.Id)?' checked="checked"':"",html+='<label><input type="checkbox" is="emby-checkbox" class="chkFolder" data-id="'+folder.Id+'" '+checkedAttribute+"><span>"+folder.Name+"</span></label>";for(i=0,length=channelsResult.Items.length;i<length;i++)folder=channelsResult.Items[i],checkedAttribute=user.Policy.EnableContentDeletion||-1!=user.Policy.EnableContentDeletionFromFolders.indexOf(folder.Id)?' checked="checked"':"",html+='<label><input type="checkbox" is="emby-checkbox" class="chkFolder" data-id="'+folder.Id+'" '+checkedAttribute+"><span>"+folder.Name+"</span></label>";$(".deleteAccess",page).html(html).trigger("create"),$("#chkEnableDeleteAllFolders",page).prop("checked",user.Policy.EnableContentDeletion)}))}(page,user,folders.Items)})),user.Policy.IsDisabled?$(".disabledUserBanner",page).show():$(".disabledUserBanner",page).hide(),$("#txtUserName",page).prop("disabled","").removeAttr("disabled"),$("#fldConnectInfo",page).show(),$(".lnkEditUserPreferences",page).attr("href","mypreferencesmenu.html?userId="+user.Id),libraryMenu.setTitle(user.Name),page.querySelector(".username").innerHTML=user.Name,$("#txtUserName",page).val(user.Name),$("#chkIsAdmin",page).prop("checked",user.Policy.IsAdministrator),$("#chkDisabled",page).prop("checked",user.Policy.IsDisabled),$("#chkIsHidden",page).prop("checked",user.Policy.IsHidden),$("#chkRemoteControlSharedDevices",page).prop("checked",user.Policy.EnableSharedDeviceControl),$("#chkEnableRemoteControlOtherUsers",page).prop("checked",user.Policy.EnableRemoteControlOfOtherUsers),$("#chkEnableDownloading",page).prop("checked",user.Policy.EnableContentDownloading),$("#chkManageLiveTv",page).prop("checked",user.Policy.EnableLiveTvManagement),$("#chkEnableLiveTvAccess",page).prop("checked",user.Policy.EnableLiveTvAccess),$("#chkEnableMediaPlayback",page).prop("checked",user.Policy.EnableMediaPlayback),$("#chkEnableAudioPlaybackTranscoding",page).prop("checked",user.Policy.EnableAudioPlaybackTranscoding),$("#chkEnableVideoPlaybackTranscoding",page).prop("checked",user.Policy.EnableVideoPlaybackTranscoding),$("#chkEnableVideoPlaybackRemuxing",page).prop("checked",user.Policy.EnablePlaybackRemuxing),$("#chkForceRemoteSourceTranscoding",page).prop("checked",user.Policy.ForceRemoteSourceTranscoding),$("#chkRemoteAccess",page).prop("checked",null==user.Policy.EnableRemoteAccess||user.Policy.EnableRemoteAccess),$("#chkEnableSyncTranscoding",page).prop("checked",user.Policy.EnableSyncTranscoding),$("#chkEnableConversion",page).prop("checked",user.Policy.EnableMediaConversion||!1),$("#chkEnableSharing",page).prop("checked",user.Policy.EnablePublicSharing),$("#txtRemoteClientBitrateLimit",page).val(user.Policy.RemoteClientBitrateLimit/1e6||""),$("#txtLoginAttemptsBeforeLockout",page).val(user.Policy.LoginAttemptsBeforeLockout||"0"),$("#selectSyncPlayAccess").val(user.Policy.SyncPlayAccess),loading.hide()}function saveUser(user,page){user.Name=$("#txtUserName",page).val(),user.Policy.IsAdministrator=$("#chkIsAdmin",page).is(":checked"),user.Policy.IsHidden=$("#chkIsHidden",page).is(":checked"),user.Policy.IsDisabled=$("#chkDisabled",page).is(":checked"),user.Policy.EnableRemoteControlOfOtherUsers=$("#chkEnableRemoteControlOtherUsers",page).is(":checked"),user.Policy.EnableLiveTvManagement=$("#chkManageLiveTv",page).is(":checked"),user.Policy.EnableLiveTvAccess=$("#chkEnableLiveTvAccess",page).is(":checked"),user.Policy.EnableSharedDeviceControl=$("#chkRemoteControlSharedDevices",page).is(":checked"),user.Policy.EnableMediaPlayback=$("#chkEnableMediaPlayback",page).is(":checked"),user.Policy.EnableAudioPlaybackTranscoding=$("#chkEnableAudioPlaybackTranscoding",page).is(":checked"),user.Policy.EnableVideoPlaybackTranscoding=$("#chkEnableVideoPlaybackTranscoding",page).is(":checked"),user.Policy.EnablePlaybackRemuxing=$("#chkEnableVideoPlaybackRemuxing",page).is(":checked"),user.Policy.ForceRemoteSourceTranscoding=$("#chkForceRemoteSourceTranscoding",page).is(":checked"),user.Policy.EnableContentDownloading=$("#chkEnableDownloading",page).is(":checked"),user.Policy.EnableSyncTranscoding=$("#chkEnableSyncTranscoding",page).is(":checked"),user.Policy.EnableMediaConversion=$("#chkEnableConversion",page).is(":checked"),user.Policy.EnablePublicSharing=$("#chkEnableSharing",page).is(":checked"),user.Policy.EnableRemoteAccess=$("#chkRemoteAccess",page).is(":checked"),user.Policy.RemoteClientBitrateLimit=parseInt(1e6*parseFloat($("#txtRemoteClientBitrateLimit",page).val()||"0")),user.Policy.LoginAttemptsBeforeLockout=parseInt($("#txtLoginAttemptsBeforeLockout",page).val()||"0"),user.Policy.AuthenticationProviderId=page.querySelector(".selectLoginProvider").value,user.Policy.PasswordResetProviderId=page.querySelector(".selectPasswordResetProvider").value,user.Policy.EnableContentDeletion=$("#chkEnableDeleteAllFolders",page).is(":checked"),user.Policy.EnableContentDeletionFromFolders=user.Policy.EnableContentDeletion?[]:$(".chkFolder",page).get().filter((function(c){return c.checked})).map((function(c){return c.getAttribute("data-id")})),user.Policy.SyncPlayAccess=page.querySelector("#selectSyncPlayAccess").value,ApiClient.updateUser(user).then((function(){ApiClient.updateUserPolicy(user.Id,user.Policy).then((function(){!function onSaveComplete(page,user){Dashboard.navigate("userprofiles.html"),loading.hide(),require(["toast"],(function(toast){toast(globalize.translate("SettingsSaved"))}))}()}))}))}function onSubmit(){var page=$(this).parents(".page")[0];return loading.show(),getUser().then((function(result){saveUser(result,page)})),!1}function getUser(){var userId=getParameterByName("userId");return ApiClient.getUser(userId)}$(document).on("pageinit","#editUserPage",(function(){$(".editUserProfileForm").off("submit",onSubmit).on("submit",onSubmit),this.querySelector(".sharingHelp").innerHTML=globalize.translate("OptionAllowLinkSharingHelp",30);var page=this;$("#chkEnableDeleteAllFolders",this).on("change",(function(){this.checked?$(".deleteAccess",page).hide():$(".deleteAccess",page).show()})),ApiClient.getServerConfiguration().then((function(config){config.EnableRemoteAccess?page.querySelector(".fldRemoteAccess").classList.remove("hide"):page.querySelector(".fldRemoteAccess").classList.add("hide")}))})).on("pagebeforeshow","#editUserPage",(function(){!function loadData(page){loading.show(),getUser().then((function(user){loadUser(page,user)}))}(this)}))}));