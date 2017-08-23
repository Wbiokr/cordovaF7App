define(['util'/*,'i18n!nls/lang'*/,'tplManager'],function(util/*,i18n*/,TM) {

    var loginView = {

        init: function(params) {
            // app.hideToolbar();
            util.bindEvents(params.bindings);
            // console.log('love')
        },

        // Render country list
        renderCountryList: function(page) {
            TM.renderInline('countryListTemplate', null, page.container);
        },

        // i18next: function(content) {
        //     var renderData = {
        //         appName: i18n.app.name,
        //         loginnamePlaceholder: i18n.login.loginname_placeholder,
        //         passwordPlaceholder: i18n.login.password_placeholder,
        //         loginBtn: i18n.login.login_btn,
        //         signUp: i18n.login.sign_up,
        //         forgotPwd: i18n.login.forgot_pwd,
        //         language: i18n.global.language,
        //         learnMore: i18n.login.learn_more
        //     };
        //
        //     var output = TM.compile(content, renderData);
        //     return output;
        // }

    };

    return loginView;
});
