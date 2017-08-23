define(['app','util','views/module','config','api','tplManager'],
function(app,util,VM,config,api,TM) {

    var contactCtrl = {
        init: function(page) {
            console.log('contactCtrl', 'init', page);
            var $page = $$(page.container);
            app.f7.closeModal();

            api.getContactRequests().then(function(response) {
                console.log('contactCtrl', 'getInvitations', response);
                var $list = TM.renderInline('contactRequestsListTemplate', response, $page);

                // Loop through invitations and handle each that was generated
                // as an approve link.
                for (var i = 0; i < response.length; i++) {
                      var invitation = response[i]
                      var $link = $list.find('a[data-invitation-token="' + invitation.token + '"]');
                      if ($link.length) {
                        $link.on('click', function(e) {
                            contactCtrl.showApproveModal(invitation);
                            return false;
                        });
                    }
                }
            });
        },

        initSettings: function(page) {
            console.log('contactCtrl', 'initSettings', page);
            var $page = $$(page.container);

            $page.find('input[type="checkbox"]').on('change', function(e) {
                console.log('contactCtrl', 'initSettings', 'change', e);
                // var form = e.currentTarget, data = new FormData(form);
                // api.updateContact(user_id, data).then(function(response) {
                //     console.log('chatCtrl', 'initContactDetails', 'updateContact', response);
                // });
            });
        },

        showApproveModal: function(invitation) {
            var modal = app.f7.modal({
              text: TM.render('modalContactsApproveTemplate', invitation),
              buttons: [
                {
                  text: 'DELETE',
                  onClick: function () {
                    api.rejectContactRequest(invitation.user_id)
                  }
                },
                {
                  text: 'ADD',
                  bold: true,
                  onClick: function () {
                    var team_ids = []
                    api.acceptContactRequest(invitation.user_id, team_ids)
                  }
                },
              ]
            });
        },

        // onUpdateTeam: function(event) {
        //     var data = new FormData(event.currentTarget);
        //     api.updateCurrentTeam(data, { configKey: 'team' }).then(function(response) {
        //         console.log('contactCtrl', 'init', 'updateCurrentTeam', response);
        //     });
        // },
        //
        // onUpdateTeamMember: function(event) {
        //     var data = new FormData(event.currentTarget);
        //     api.updateCurrentTeamMember(config.getCurrentUserId(), data).then(function(response) {
        //         console.log('contactCtrl', 'init', 'updateCurrentTeamMember', response);
        //     });
        // },
        //
        // onUpdateUser: function(event) {
        //     var data = app.f7.formToJSON(event.currentTarget); //window.tommy. new FormData(event.currentTarget);
        //     api.updateCurrentUser(data, { configKey: 'user' }).then(function(response) {
        //         console.log('contactCtrl', 'init', 'updateCurrentUser', response);
        //     });
        // },
        //
        // changePicture: function() {
        //     photoChanger.init({
        //         url: util.getCurrentAccountUpdateURI()//,
        //         // success: function(response) {
        //         //     console.log('contactCtrl', 'changePicture', response);
        //         //     appCtrl.initCurrentAccount();
        //         // }
        //     });
        //     photoChanger.openMenu();
        // },
        //
        // logOut: function() {
        //     window.tommy.app.modal({
        //         text: i18n.setting.confirm_logout,
        //         buttons: [{
        //             text: 'NO',
        //             class: 'big'
        //         }, {
        //             text: 'YES',
        //             class: 'small',
        //             onClick: function() {
        //                 config.destorySession();
        //                 chatClient.disconnect();
        //                 window.tommy.view.router.loadPage('views/login.html');
        //                 // window.tommy.app.showTab('#dashboard');
        //             }
        //         }]
        //     });
        // }
    };

    return contactCtrl;
});
