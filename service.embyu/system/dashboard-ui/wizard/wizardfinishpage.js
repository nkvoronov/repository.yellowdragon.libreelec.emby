define(["loading","css!./wizard"],function(loading){"use strict";function onFinish(){loading.show(),ApiClient.ajax({url:ApiClient.getUrl("Startup/Complete"),type:"POST"}).then(function(){loading.hide(),Dashboard.logout(!1,!0)})}return function(view,params){view.querySelector(".btnWizardNext").addEventListener("click",onFinish)}});