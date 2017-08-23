define(['app','util','views/module','config','api'/*,'i18n!nls/lang'*/,'utils/chatClient','tplManager','photoChanger','controllers/appCtrl'],
function(app,util,VM,config,api/*,i18n*/,chatClient,TM,photoChanger,appCtrl) {
    // var formChanged = false;,

    var appCtrl = require('controllers/appCtrl');

    var accountCtrl = {
        init: function(page) {
            console.log('accountCtrl', 'init', page);
            var $page = $$(page.container),
                account = config.getCurrentAccount(),
                user = config.getCurrentUser();

            var bindings = [{
                element: '#account-page #change-profile-picture',
                event: 'click',
                handler: accountCtrl.changePicture
            },{
                element: '#account-page #open-apple-review',
                event: 'click',
                handler: window.tommy.app.closeModal
            },{
                element: '#account-page .logout-button',
                event: 'click',
                handler: accountCtrl.logOut
            }];

            VM.module('accountView').init(account, bindings);

            // Render the team profile
            if (util.isTeamOwnerOrManager(account)) {
                api.getCurrentTeam({ cache: true, configKey: 'team' }).then(function(currentTeam) {
                    VM.module('accountView').renderTeamProfile(currentTeam, [{
                        element: '#account-page #team-form',
                        event: 'submit change',
                        handler: accountCtrl.onUpdateTeam
                    }]);
                });
            }

            // Render the team profile
            if (account.type == 'TeamMember') {
                api.getCurrentTeamMember(account.user_id, { cache: true }).then(function(currentTeamMember) {
                    VM.module('accountView').renderTeamMemberProfile(currentTeamMember, [{
                        element: '#account-page #team-member-form',
                        event: 'submit change',
                        handler: accountCtrl.onUpdateTeamMember
                    }]);
                });
            }

            // Render the user profile
            console.log('accountCtrl', 'init user', user);
            VM.module('accountView').renderUserProfile(user, [{
                element: '#account-page #user-form',
                event: 'submit change',
                handler: accountCtrl.onUpdateUser
            }]);

            // api.getAccounts().then(function(response) {
            //     var renderData = {
            //         appName: i18n.app.name,
            //         accounts: response
            //     };
            //
            //     VM.module('accountView').renderAccountList(renderData);
            // });

            // var parentId = 0;
            // xhr.call({
            //     func: 'list/about/'+parentId
            // }, function(response) {
            //         if (response.status === 0) {
            //             var data = response.data;
            //             var output = TM.renderTarget('helpListTemplate',data);
            //
            //             $$('#account-more-info-list').append(output);
            //         } else {
            //             window.tommy.app.alert(response.message);
            //         }
            // });
        },

        onUpdateTeam: function(event) {
            var data = new FormData(event.currentTarget);
            api.updateCurrentTeam(data, { configKey: 'team' }).then(function(response) {
                console.log('accountCtrl', 'init', 'updateCurrentTeam', response);
            });
        },

        onUpdateTeamMember: function(event) {
            var data = new FormData(event.currentTarget);
            api.updateCurrentTeamMember(config.getCurrentUserId(), data).then(function(response) {
                console.log('accountCtrl', 'init', 'updateCurrentTeamMember', response);
            });
        },

        onUpdateUser: function(event) {
            var data = app.f7.formToJSON(event.currentTarget); //window.tommy. new FormData(event.currentTarget);
            console.log('accountCtrl', 'before updateCurrentUser', data);
            api.updateCurrentUser(data, { configKey: 'user' }).then(function(response) {
                console.log('accountCtrl', 'init', 'updateCurrentUser', response);
            });
        },

        changePicture: function() {
            photoChanger.init({
                url: util.getCurrentAccountUpdateURI()//,
                // success: function(response) {
                //     console.log('accountCtrl', 'changePicture', response);
                //     appCtrl.initCurrentAccount();
                // }
            });
            photoChanger.openMenu();
        },

        logOut: function() {
            window.tommy.app.modal({
                text: 'Are you sure you want to log out?',
                buttons: [{
                    text: 'NO',
                    class: 'big'
                }, {
                    text: 'YES',
                    class: 'small',
                    onClick: function() {
                        config.destorySession();
                        chatClient.disconnect();
                        window.tommy.view.router.loadPage('views/login.html');
                    }
                }]
            });
        }
    };

    return accountCtrl;
});
