define(['app', 'util','views/module','config','api','utils/chatClient'/*,'i18n!nls/lang'*/,'tplManager','controllers/appCtrl','photoChanger'],//,'jquery','overscroll'
function(app,util,VM,config,api,chatClient/*,i18n*/,TM,appCtrl,photoChanger) {
    // var registrationFormChanged = false;

    var teamCtrl = {
        init: function() {
            teamCtrl.loadTeamMembers();

            // var bindings = [{
            //     element: '#team-registration-form',
            //     event: 'submit',
            //     handler: teamCtrl.onRegistrationSubmit
            // }];
            //
            // VM.module('registrationView').init({
            //     bindings:bindings
            // });
        },

        initTeamMember: function(page) {
            if (!page.query.user_id) alert('User ID required')
            api.getCurrentTeamMember(page.query.user_id).then(function(response) {
                console.log('teamCtrl: initTeamMember: ', response);
                TM.renderInline('teamMemberProfileTemplate', response, page.container);
                TM.renderInline('profileHeaderTemplate', response, page.container);
                // TM.renderInline('teamMemberProfileLinksTemplate', response, page.container);
            });

            // teamCtrl.loadTeamMembers();
            // var bindings = [{
            //     element: '#team-registration-form',
            //     event: 'submit',
            //     handler: teamCtrl.onRegistrationSubmit
            // }];
            //
            // VM.module('registrationView').init({
            //     bindings:bindings
            // });
        },

        initTeamMemberEdit: function(page) {
            var userId = page.query.user_id;
            api.getCurrentTeamMember(userId).then(function(response) {
                console.log('teamCtrl: initTeamMember: ', response);
                var $form = TM.renderInline('teamMemberProfileEditFormTemplate', response, page.container);
                $form.submit(function(event) {
                    api.updateCurrentTeamMember(userId, window.tommy.app.formToJSON($form)).then(function() {
                        window.tommy.view.router.back();
                    })
                });

                // TM.renderTarget('profileHeaderTemplate', response, '#team-member-profile-header');
            });

            // teamCtrl.loadTeamMembers();
            // var bindings = [{
            //     element: '#team-registration-form',
            //     event: 'submit',
            //     handler: teamCtrl.onRegistrationSubmit
            // }];
            //
            // VM.module('registrationView').init({
            //     bindings:bindings
            // });
        },

        initTeamMemberInvite: function(page) {
            var $page = $$(page.container);

            $page.find('form').submit(function(event) {
                event.preventDefault();
                var data = app.f7.formToJSON(event.currentTarget);
                api.inviteTeamMember(data).then(function(response) {
                    console.log('teamCtrl: initTeamMemberInvite: ', response);
                    window.tommy.app.addNotification({
                        title: 'Team Member Invited',
                        message: data.first_name + ' has been invited. Please ask them to check their notifications...',
                        hold: 4000
                    });

                    app.f7view.router.back();
                });
            });
        },

        loadTeamMembers: function() {
            api.getCurrentTeamMembers().then(function(response) {
                console.log('teamCtrl: loadTeamMembers: ', response);
                TM.renderInline('teamMemberListTemplate', response);
            });
        },

        //
        // Team Registration
        //

        initRegistration: function() {
            var bindings = [{
                element: '#team-registration-form',
                event: 'submit',
                handler: teamCtrl.onRegistrationSubmit
            }];

            VM.module('registrationView').init({
                bindings: bindings
            });
        },

        onRegistrationSubmit: function(event) {
            var $form = $$(event.currentTarget),
                data = {
                    name: $form.find('input.name').val(),
                    email: $form.find('input.email').val(),
                    phone: $form.find('input.phone').val()
                };

            if (data.name === '' ||
                data.email === '' ||
                data.phone === '')
                window.tommy.app.alert(i18n.t('label.invalid_input', { defaultValue: 'Invalid input'}), 'Tommy'); //i18n.registration.err_empty_input
            else if(!util.isEmail(data.email))
                window.tommy.app.alert(i18n.t('label.invalid_email', { defaultValue: 'Invalid email'})); //i18n.registration.err_illegal_email
            else {
                api.createTeam(data).then(function(response) {
                    window.tommy.app.addNotification({
                        title: 'Team Created',
                        message: 'Your team account has been created!',
                        hold: 4000
                    });
                    // registrationFormChanged = true;
                    appCtrl.loadUserAccounts(); // reload user accounts
                    window.tommy.view.router.back();
                });
            }

            event.preventDefault();
        }
    };

    return teamCtrl;
});
