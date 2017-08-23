define(['util', 'i18n!nls/lang', 'tplManager', 'xhr'], function(util, i18n, TM, xhr) {

    var defaultView = {

        init: function(params) {
            // app.hideToolbar();
            util.bindEvents(params.bindings);
        },

        i18next: function(content) {
            var renderData = {
                appName: i18n.app.name,
            };

            var output = TM.compile(content, renderData);
            return output;
        }

    };

    return defaultView;
});
