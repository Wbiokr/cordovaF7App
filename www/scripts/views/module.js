define(['views/appView',
        'views/registrationView',
        'views/accountView',
        'views/teamView',
        'views/loginView',
        // 'views/team_memberView',
        // 'views/messageView',
        // 'views/settingView',
        // 'views/addBankView',
        // 'views/banksView',
        // 'views/shiftView',
        // 'views/languageView',
        // 'views/defaultView'
      ],function(appView,registrationView,accountView,teamView,loginView
        // ,team_memberView,messageView,settingView,addBankView,banksView,shiftView,languageView,defaultView
      ) {

    var module = {

        module: function(name) {
            var view;

            switch (name) {
                case 'appView':
                    view = appView;
                    break;
                case 'loginView':
                    view = loginView;
                    break;
                case 'registrationView':
                    view = registrationView;
                    break;
                case 'accountView':
                    view = accountView;
                    break;
                // case 'teamView':
                //     view = teamView;
                //     break;
                // case 'team_memberView':
                //     view = team_memberView;
                //     break;
                // case 'messageView':
                //     view = messageView;
                //     break;
                // case 'addBankView':
                //     view = messageView;
                //     break;
                // case 'banksView':
                //     view = banksView;
                //     break;
                // case 'shiftView':
                //     view = shiftView;
                //     break;
                // case 'settingView':
                //     view = settingView;
                //     break;
                // case 'languageView':
                //     view = languageView;
                //     break;
                // case 'defaultView':
                //     view = defaultView;
                //     break;
            }

            return view;
        }
    };

    return module;
});
