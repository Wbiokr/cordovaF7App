define(['app','config','controllers/module','views/module','tplManager','util','addons'], //, 'xhr' , 'underscore'
function(app,config,CM,VM,TM,util,addons) {
    // var $$ = Dom7;
    // var t7 = Template7;

    var router = {

        init: function() {
            console.log('router:init 1');

            window.tommy.app.onPageInit('*', router.pageInit);
            window.tommy.app.onPageBeforeAnimation('*', router.pageBeforeAnimation);
            window.tommy.app.onPageAfterAnimation('*', router.pageAfterAnimation);
            window.tommy.app.onPageBack('*', router.pageBack);
            window.tommy.app.onPageAfterBack('*', router.pageAfterBack);
        },

        pageInit: function(page) {
            // if (window.current_page === page.name)
            //     window.show_loader = false;
            // else
            //     window.show_loader = true;
            //
            // window.current_page = page.name;
            //
            // // unset chat user id
            // window.current_chat_user_id = false;
            // var name = page.name;
            // var query = page.query;
            // var from = page.from;
            // window.from = from;

            console.log('router:pageInit', page);

            // Show the navbar for non login pages
            // if (page.name != 'login') {
            //     $$('div.view-main > .navbar').show();
            // }

            switch (page.name) {
                case 'index':
                    break;
                case 'login':
                    // if (page.from === 'left') return;
                    CM.module('loginCtrl').init(page);
                    break;
                case 'password-reset':
                    CM.module('loginCtrl').initResetPassword(page);
                    break;
                case 'chat':
                    //if (page.from === 'left') return;
                    CM.module('chatCtrl').init(page);
                    break;
                // case 'chat-view':
                //     // if (router.initOrDirty(page))
                //     CM.module('chatCtrl').initChatWindow(page);
                //     break;
                case 'chat-details':
                    CM.module('chatCtrl').initChatDetails(page);
                    break;
                case 'contact-details': // DEPRECATED?
                    CM.module('chatCtrl').initContactDetails(page);
                    break;
                case 'account':
                    CM.module('accountCtrl').init(page);
                    break;

                //
                // Contacts
                case 'add-contacts':
                    CM.module('contactCtrl').init(page);
                    break;
                case 'add-contacts-settings':
                    CM.module('contactCtrl').initSettings(page);
                    break;
                case 'add-contacts-search':
                    CM.module('contactCtrl').initSearch(page);
                    break;
                case 'add-contacts-search-results':
                    CM.module('contactCtrl').initSearchResults(page);
                    break;

                //
                // Addons
                case 'addons':
                    // via onPageBeforeAnimation
                    break;
                case 'addon-details':
                    CM.module('addonCtrl').initAddonDetails(page);
                    break;

                //
                // Actions
                case 'actions':
                    // if (page.from === 'left') return;
                    CM.module('actionCtrl').init(page);
                    break;
                case 'action-details':
                    // if (page.from === 'left') return;
                    CM.module('actionCtrl').initActionDetails(page);
                    break;
                case 'action-history':
                    if (page.from === 'left') return;
                    CM.module('actionCtrl').initActionHistory(page.query.action_id);
                    break;
                case 'action-settings':
                    if (page.from === 'left') return;
                    CM.module('actionCtrl').initActionSettings(page);
                    break;

                //
                // Action Builder
                case 'action-builder':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').init(page);
                    break;
                case 'action-builder-task':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').initTask(page);
                    break;
                case 'action-builder-trigger':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').initTrigger(page);
                    break;
                case 'action-builder-conditions':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').initConditions(page);
                    break;
                case 'action-builder-activity':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').initActivity(page);
                    break;
                case 'action-builder-settings':
                    if (page.from === 'left') return;
                    CM.module('actionBuilderCtrl').initSettings(page);
                    break;

                //
                // Team
                case 'team':
                    // pageBeforeAnimation
                    break;
                case 'team-member':
                    // pageBeforeAnimation
                    break;
                case 'team-member-edit':
                    CM.module('teamCtrl').initTeamMemberEdit(page);
                    break;
                case 'team-member-invite':
                    CM.module('teamCtrl').initTeamMemberInvite(page);
                    break;
                case 'team-registration':
                    if (page.from === 'left') return;
                    window.tommy.app.closePanel('left');
                    CM.module('teamCtrl').initRegistration();
                    break;

                //
                // Onboarding
                case 'splash':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initSplash(page);
                    break;
                case 'enable-contacts':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initEnableContacts(page);
                    break;
                case 'enable-notifications':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initNotifications(page);
                    break;

                case 'registration':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').init(page);
                    break;
                case 'registration-details':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initDetails(page);
                    break;
                case 'registration-photo':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initPhoto(page); //page.query.user_id
                    break;
                case 'registration-confirm':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initConfirm(page);
                    break;
                case 'registration-confirm-code':
                    if (page.from === 'left') return;
                    CM.module('onboardingCtrl').initConfirmCode(); //page.query.user_id
                    break;

                default:
                    console.log('Unhandled page: ' + page.name);
            }
        },

        pageBack: function(page) {
            console.log('router:pageBack', page.name);
        },

        pageAfterBack: function(page) {
            console.log('router:pageAfterBack', page.name);
        },

        initOrDirty: function(page) {

            // If page from == left then the back button was pressed
            return page.from !== 'left' || window.invalidateBackPage;
        },

        // Pages initialized on pageBeforeAnimation will be initialized after
        // creation and every back button click. This method is handy for
        // invalidating stale views.
        pageBeforeAnimation: function(page) {
            console.log('router:pageBeforeAnimation', page.name);

            // Notify the iOS app that the back button has been pressed
            if (page.fromPage && page.from === 'left') {
                console.log('page back: ' + page.fromPage.name);
                if (window.tommy.onPageBack)
                    window.tommy.onPageBack(page);
            }

            if (window.tommy.rootBackPage == page.name)
                app.replaceNativeBackButton(page);

            switch (page.name) {

                //
                // Chat
                case 'chat-view':
                    if (router.initOrDirty(page))
                        CM.module('chatCtrl').initChatWindow(page);
                    break;

                //
                // Addons
                case 'addons':
                    CM.module('addonCtrl').init(page);
                    break;

                //
                // Team
                case 'team':
                    CM.module('teamCtrl').init(page); //page.query.action_id
                    break;
                case 'team-member':
                    CM.module('teamCtrl').initTeamMember(page); //page.query.action_id .query.user_id
                    break;
            }

            // var name = page.name;
            // var from = page.from;
            // var swipeBack = page.swipeBack;
            // switch (name) {
            //     // case 'e-registration-address':
            //     //     CM.module('onboardingCtrl').afterEmployAddress();
            //     //     break;
            //     // case 'e-registration-contact':
            //     //     CM.module('onboardingCtrl').afterEmployContact();
            //     //     break;
            //     // case 'post':
            //     //     app.showLoader();
            //     //     $$('//post-content').html('');
            //     //     break;
            //
            // }
        },

        pageAfterAnimation: function(page) {
            console.log('router:pageAfterAnimation', page.name);

            // Notify the native app that the page has loaded
            if (window.tommy.onPageReady) {
                console.log('router:onPageReady', page.name);
                window.tommy.onPageReady(page);
            }

            // Reset the back page invalidation state
            window.invalidateBackPage = false;
        },

        pageAfterBack: function(page) {
            console.log('router:pageAfterBack', page.name);

            // window.backHomePage = true;
            // var fullUrl = page.view.url;
            //
            // url = fullUrl.split('?')[0] ;
            // query = fullUrl.split('?')[1] ;
            //
            // if (query) {
            //     var q = query ? JSON.parse('{"' + query.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
            //         function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
            // }

            // console.log('router:pageAfterBack', page, url, q);

            // switch (url) {
                // case 'views/account-profile.html':
                //     if (window.accountChanged)
                //         CM.module('accountCtrl').initUserProfile();
                //     break;
                // case 'views/account-team-profile-home.html':
                //     if (window.accountChanged)
                //         CM.module('teamCtrl').init(q);
                //     break;
                // case 'views/account-team-member-profile-home.html':
                //     if (window.accountChanged)
                //         CM.module('team_memberCtrl').init(q);
                //     break;
                // case 'views/account.html':
                //     if (window.accountChanged)
                //         CM.module('accountCtrl').init();
                //     break;
                // case 'views/account-e-roles.html':
                //     CM.module('teamCtrl').initRole(q);
                //     break;
                // case 'views/account-e-locations.html':
                //     CM.module('teamCtrl').initLocation(q);
                //     break;
                // case 'views/account-e-profile-roles.html':
                //     CM.module('team_memberCtrl').initRole(q);
                //     break;
                // case 'views/account-e-profile-locations.html':
                //     CM.module('team_memberCtrl').initLocation(q);
                //     break;
                // case 'views/roster.html':
                //     if (window.accountChanged)
                //         CM.module('shiftCtrl').initRoster();
                //     break;
                // case 'views/e-roster-shift.html':
                //     if (window.accountChanged)
                //         CM.module('shiftCtrl').initRosterShift(q);
                //     break;
                // case 'views/post.html':
                //     console.log('initBack');
                //     CM.module('postCtrl').initBack(q);
                //     break;
                // case 'views/chat.html':
                //     // if (window.messageUpdated)
                //     CM.module('chatCtrl').init();
                //     break;
            // }
        },

        // lastPageHref: false,  // prevent infinite loop
        // forceLoadAddon: function (view, options) {
        // }
        //
        // preroute: function (view, options) {
        //     if (proxy.lastPageHref != window.location.href) {
        //         // alert('Changing page: last: ' + proxy.lastPageHref + ', new ' + window.location.href);
        //         proxy.lastPageHref = window.location.href;
        //         var needle = '/addon=',
        //             pos = window.location.hash.indexOf(needle);
        //         if (pos != -1) {
        //             var package = window.location.hash.substring(pos + needle.length);
        //             CM.module('addonCtrl').viewAddon(package);
        //             return false;
        //         }
        //     }
        // },

        preprocess: function(content, url, next) {
            if (!url) return content;
            url = url.split('?')[0];
            console.log('router:preprocess', url);

            // throw 'a'

            window.tommy.lastError = null;

            content = addons.preprocess(content, url)

            var viewName;
            switch (url) {
                case 'index.html':
                    viewName = 'appView';
                    break;
                case 'views/dashboard.html':
                    viewName = 'defaultView';
                    break;
                // case 'views/login.html':
                //     viewName = 'loginView';
                //     break;
                // case 'views/account.html':
                //     viewName = 'accountView';
                //     break;
                // case 'views/registration-details.html':
                //     viewName = 'registrationView';
                //     break;
                // case 'views/messages-home.html':
                //     viewName = 'messageView';
                //     break;
                // case 'views/feedback.html':
                //     viewName = 'feedbackView';
                //     break;
                // case 'views/item.html':
                //     viewName = 'itemView';
                //     break;
                // case 'views/add-banks.html':
                //     viewName = 'addBankView';
                //     break;
                // case 'views/banks.html':
                //     viewName = 'banksView';
                //     break;
                // case 'views/shifts.html':
                //     viewName = 'shiftView';
                //     break;
                // case 'views/s-shift.html':
                //     viewName = 'shiftView';
                //     break;
                // case 'views/e-team-member-profile-availability-edit.html':
                //     viewName = 'shiftView';
                //     break;
                // case 'views/e-team-member-profile-availability-new.html':
                //     viewName = 'shiftView';
                //     break;
                // case 'views/message.html':
                //     viewName = 'messageView';
                //     break;
                // case 'views/language.html':
                //     viewName = 'languageView';
                //     break;
                default:
                    return content;
            }

            var output = router.i18next(viewName, content);
            return output;
        },

        i18next: function(viewName, content) {
            var output = VM.module(viewName).i18next(content);
            return output;
        },

        i18nextQuery: function(viewName, content, query) {
            var output = VM.module(viewName).i18nextQuery(content, query);
            return output;
        }
    };

    return router;
});
