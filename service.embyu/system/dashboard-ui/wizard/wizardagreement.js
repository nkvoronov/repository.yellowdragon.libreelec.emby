define(["dom","globalize","emby-linkbutton","emby-checkbox","css!./wizard"],function(dom,globalize){"use strict";function onSubmit(e){return dom.parentWithClass(this,"page").querySelector(".chkAccept").checked?Dashboard.navigate("wizard/wizardfinish.html"):Dashboard.alert({message:globalize.translate("MessagePleaseAcceptTermsOfServiceBeforeContinuing"),title:""}),e.preventDefault(),!1}return function(view,params){view.querySelector(".wizardAgreementForm").addEventListener("submit",onSubmit)}});