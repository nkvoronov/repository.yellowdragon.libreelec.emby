Dashboard.confirm=function(message,title,callback){"use strict";require(["confirm"],function(confirm){confirm(message,title).then(function(){callback(!0)},function(){callback(!1)})})},Dashboard.showLoadingMsg=function(){"use strict";require(["loading"],function(loading){loading.show()})},Dashboard.hideLoadingMsg=function(){"use strict";require(["loading"],function(loading){loading.hide()})},Dashboard.getCurrentUser=function(){"use strict";return ApiClient.getCurrentUser()},Dashboard.getCurrentUserId=function(){"use strict";return ApiClient.getCurrentUserId()};