define(['controllers/appCtrl',
        'controllers/loginCtrl',
        'controllers/onboardingCtrl',
        'controllers/accountCtrl',
        'controllers/chatCtrl',
        'controllers/addonCtrl',
        'controllers/actionCtrl',
        'controllers/actionBuilderCtrl',
        'controllers/teamCtrl',
        'controllers/contactCtrl',
        // 'controllers/team_memberCtrl',
        // 'controllers/settingCtrl',
        // 'controllers/bankCtrl',
        // 'controllers/shiftCtrl',
        // 'controllers/postCtrl',
        // 'controllers/languageCtrl'
      ],function(appCtrl,loginCtrl,onboardingCtrl,accountCtrl,chatCtrl,addonCtrl,actionCtrl,actionBuilderCtrl,teamCtrl,contactCtrl
        // ,team_memberCtrl,settingCtrl,bankCtrl,shiftCtrl,postCtrl,languageCtrl
      ) {

    var module = {
        module: function(name) {
            var controller;

            switch (name) {
                case 'appCtrl':
                    controller = appCtrl;
                    break;
                case 'loginCtrl':
                    controller = loginCtrl;
                    break;
                case 'onboardingCtrl':
                    controller = onboardingCtrl;
                    break;
                case 'accountCtrl':
                    controller = accountCtrl;
                    break;
                case 'chatCtrl':
                    controller = chatCtrl;
                    break;
                case 'addonCtrl':
                    controller = addonCtrl;
                    break;
                case 'actionCtrl':
                    controller = actionCtrl;
                    break;
                case 'actionBuilderCtrl':
                    controller = actionBuilderCtrl;
                    break;
                case 'teamCtrl':
                    controller = teamCtrl;
                    break;
                case 'contactCtrl':
                    controller = contactCtrl;
                    break;

                // case 'team_memberCtrl':
                //     controller = team_memberCtrl;
                //     break;
                // case 'bankCtrl':
                //     controller = bankCtrl;
                //     break;
                // case 'shiftCtrl':
                //     controller = shiftCtrl;
                //     break;
                // case 'postCtrl':
                //     controller = postCtrl;
                //     break;
                // case 'settingCtrl':
                //     controller = settingCtrl;
                //     break;
                // case 'languageCtrl':
                //     controller = languageCtrl;
                //     break;
            }

            return controller;
        }
    };

    return module;
});
