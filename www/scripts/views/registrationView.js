define(['util','app'/*,'i18n!nls/lang'*/,'tplManager'],function(util,app/*,i18n*/,TM) {

    var registrationView = {

        init: function(params) {
            // app.hideToolbar();
            util.bindEvents(params.bindings);
        },

        i18next: function(content) {
            var output = TM.compile(content);
            return output;
        },

        // Render country list
        renderCountryList: function(page) {
            TM.renderInline('countryListTemplate', null, page.container);
        },

        // renderAddress: function(params) {
        //     var output = TM.renderTarget('emprRegAddressTemplate',params);
        //     $$('#address-container').html(output);
        //
        //     window.tommy.app.hideIndicator();
        // },
        //
        // renderContact: function(params) {
        //     var output = TM.renderTarget('emprRegContactTemplate',params);
        //     $$('#contact-container').html(output);
        //
        //     window.tommy.app.hideIndicator();
        // }
    };

    return registrationView;
});
