define(['config','util','app'/*,'i18n!nls/lang'*/,'tplManager','xhr'],
function(config,util,app/*,i18n*/,TM,xhr) {
    var id = {};
    var teamView = {

        initRegistration: function(params) {
            app.hideToolbar();
            util.bindEvents(params.bindings);
            // app.showLoader();
        },

        // initViewOnly: function(params) {
        //     app.hideToolbar();
        //     util.bindEvents(params.bindings);
        //     app.showLoader();
        //     var id = params.query.id;
        //
        //     // TM.renderRemote
        //
        //     xhr.call({
        //         url: config.getApiUrl(),
        //         func:'teams/'+id
        //     }, function(response) {
        //         var teamData = response;
        //         var output = TM.renderTarget('viewTeamProfileTemplate',teamData);
        //         $$('#account-team-profile').html(output);
        //         app.hideLoader();
        //     });
        // },

        i18next: function(content) {
            var output = TM.compile(content);
            return output;
        }

    };

    return teamView;
});
