define(['util','config'/*,'i18n!nls/lang'*/,'tplManager'],function(util,config/*,i18n*/,TM) {

    var appView = {

        init: function(params) {
            util.bindEvents(params.bindings);
        },

        // Render the sidebar header an menu
        renderAccountHeader: function() {
            var account = config.getCurrentAccount();

            TM.initGlobalVariables(); // update account related global variables
            TM.renderInline('mainMenuAccount', account);
        },

        // Render the sidebar menu
        renderMainMenu: function() {
            // var account = config.getCurrentAccount();

            TM.initGlobalVariables(); // update account related global variables
            TM.renderInline('mainMenu'); //, account
        },

        i18next: function(content) {
            var renderData = {
                i : i18n.app.name
            };

            var output = TM.compile(content,renderData);

            $$('.views .i18n').each(function() {
                var value;
                var i18nKey = $$(this).data('i18n');
                var handle = i18nKey.split(']');
                if (handle.length > 1) {
                    var attr = handle[0].replace('[','');
                    value = appView.i18nValue(handle[1]);
                    $$(this).attr(attr,value);
                } else {
                    value = appView.i18nValue(i18nKey);
                    $$(this).html(value);
                }
            });

            return output;
        },

        i18nValue: function(key) {
            var keys = key.split('.');
            var value;
            for (var idx = 0, size = keys.length; idx < size; idx++) {
                if (value != null) {
                    value = value[keys[idx]];
                } else {
                    value = i18n[keys[idx]];
                }

            }
            return value;
        },

        // showToolbar: function() {
        //     app.showToolbar();
        // },
        //
        // hideToolbar: function() {
        //     app.hideToolbar();
        // },

        photoBrowser: function() {
            var url = $$(this).attr('src');

            var myPhotoBrowser = window.tommy.app.photoBrowser({
                photos: [url],
                toolbar: false,
                navBackText: i18n.global.close
            });

            myPhotoBrowser.open();
        }
    };

    return appView;
});
