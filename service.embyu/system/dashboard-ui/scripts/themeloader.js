define(["userSettings","skinManager","connectionManager","events"],function(userSettings,skinManager,connectionManager,events){"use strict";var currentViewType;document.addEventListener("viewbeforeshow",function(e){var theme,context,classList=e.target.classList,viewType=classList.contains("type-interior")||classList.contains("wizardPage")?"a":"b";viewType!==currentViewType&&("a"==(currentViewType=viewType)?(theme=userSettings.dashboardTheme(),context="serverdashboard"):theme=userSettings.theme(),skinManager.setTheme(theme,context))}),events.on(connectionManager,"localusersignedin",function(e){currentViewType=null})});