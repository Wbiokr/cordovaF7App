define(['util','xhr','tplManager','config'], function(util,xhr,TM,config) {

    var accountView = {
        init: function(params, bindings) {
            TM.renderTarget('profileHeaderTemplate', params, '#profile-header');

            util.bindEvents(bindings);
        },

        renderTeamProfile: function(params, bindings) {
            TM.renderTarget('editTeamProfileTemplate', params, '#team-profile');

            util.bindEvents(bindings);
        },

        renderTeamMemberProfile: function(params, bindings) {
            TM.renderTarget('editTeamMemberProfileTemplate', params, '#team-member-profile');

            util.bindEvents(bindings);
        },

        renderUserProfile: function(params, bindings) {
            TM.renderTarget('editUserProfileTemplate', params, '#user-profile');

            util.bindEvents(bindings);
        },

        // renderAccountList: function(params, bindings) {
        //     console.log('accountView', 'renderAccountList', params);
        //     setTimeout(function() {
        //         var output = TM.renderTarget('accountListTemplate', params);
        //         $$('#top-account-list').html( output);
        //         util.bindEvents(bindings);
        //         app.hideLoader();
        //     }, 200);
        // },

        // renderUserProfile: function(params, bindings) {
        // },

        i18next: function(content) {
            var output = TM.compile(content);
            return output;
        }
    };

    return accountView;
});
