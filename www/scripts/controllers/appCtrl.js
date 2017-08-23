define(['config','api','util','cache','views/module','tplManager','tplHelpers','addons','session'], //,'utils/chatClient'
function(config,api,util,cache,VM,TM,TH,addons,session) { //,chatClient

    var appCtrl = {
        init: function(page) {

            // Bind the panel slideout toggle button
            $$('#main-menu-drag-handle').on('click', function (e) {
               var open = $$(this).parent('.panel').hasClass('active');
               window.tommy.app[open ? 'closePanel' : 'openPanel']('left');
             });

            // Bind the top menu
            var $accountMenu = $$('#main-menu-account');
            $accountMenu.off('click').on('click', function(event) {
                $accountMenu.next('#main-menu-account-list').toggleClass('active');
                event.stopPropagation();
            });

            // Render main menu when addons are loaded
            addons.onViewLoaded = function (manifest, view) {
                // console.log('adding addon view to interface', view)
                VM.module('appView').renderMainMenu();
            }
            addons.onViewRemoved = function (manifest, view) {
                // console.log('removing addon view from interface', view)
                VM.module('appView').renderMainMenu();
            }

            // Regenerate the sidebar menus when the current account changes
            $$(document).on('account:change', function(event) {
                appCtrl.reload();
                appCtrl.invalidate();
            });
        },

        // Reload user data after switching account
        reload: function() {
            var account = config.getCurrentAccount();
            console.log('appCtrl', 'reload', account);

            // Populate the account menu
            appCtrl.loadUserAccounts();
            appCtrl.loadRecommendedAddons();

            // Get the current team object if required
            if (account.team_id && account.team_id != config.getCurrentTeamId()) {
                api.getCurrentTeam({ configKey: 'team' }).then(function(team) {
                    appCtrl.invalidate();
                });
            }

            // Handle developer account switching
            if (account.developer)
                appCtrl.enableDeveloperMode();
        },

        invalidate: function() {
            var account = config.getCurrentAccount();
            console.log('appCtrl', 'invalidate', account);

            VM.module('appView').renderAccountHeader();
            VM.module('appView').renderMainMenu();

            // Set the current avatar
            // app.renderCurrentAvatar();

            // Reload all addons
            // appCtrl.initAddons();

            // // If the user is oeprating as a developer we need to refresh to
            // if (response.type === 'Developer') {
            //
            // }

            // FIXME: location_id currently unset
            // window.defaultLocation = currentAccount.location_id;

            // if (response.type === 'User' ||
            //     response.type === 'TeamMember') { // || data.type === 'Manage'
            //     $$('.employ').on('click', function () {
            //         window.employ_link_on = true;
            //         $(".animer").animate({top: "-" + $('.acc-slide').height() + "px"}, 250);
            //     });
            // }

            // window.tommy.view.router.reloadPage('views/dashboard.html');
            // window.tommy.view.router.loadPage('views/chat.html');
            // $$('#dashboard-avatar').css('background-color','red');

            // showloader means current page is main pages,
            // also mean we need to refresh current page
            // TODO: needs to have another paramater such as reload current page.
            // if (showLoader) {
            //     console.log('appCtrl: initCurrentAccount: load chat chat');
            //     window.tommy.view.router.reloadPage('views/chat.html');
            // }
        },

        loadRecommendedAddons: function() {
            api.getRecommendedAddons().then(function(response) {
                TM.renderInline('mainMenuRecommendedAddons', response);
            });
        },

        loadUserAccounts: function() {
            api.getAccounts().then(function(response) {
                // var $accountMenu = $$('#top-menu');

                if (response.length > 1) {

                    // Render the account list
                    // $accountMenu.find('#top-account-list')[response.length > 1 ? 'show' : 'hide']();
                    var $accountList = $$('#main-menu-account-list');
                    TM.renderTarget('mainMenuAccountList', response, $accountList);

                    $accountList.find('a.change-account').on('click', function(event) {
                        var accountID = $$(this).attr('data-account-id');
                        var accountType = $$(this).attr('data-account-type');
                        var locationId = $$(this).attr('data-location-id');

                        session.changeCurrentAccount(accountID, accountType, locationId);

                        $accountList.removeClass('active');
                    });

                    // Allow switching to previous account in developer mode
                    $accountList.find('.cancel-developer-mode').on('click', function(event) {
                        appCtrl.cancelDeveloperMode();
                        event.stopPropagation();
                    });
                }
                else {
                    // $accountMenu.off('click');
                    // $$('#main-menu-drag-handle').hide();
                }

                // var pageHeight = $$(window).height();
                // $accountMenu.find('#top-account-menu-dropdown').css('max-height', (pageHeight-100)+'px');
                // $accountMenu.find('#top-account-menu-dropdown').css('height',(pageHeight-100)+'px');
                // $accountMenu.find('#top-account-menu-dropdown').css('overflow','scroll');
                // $accountMenu.find('#top-account-menu-dropdown').css('-webkit-overflow-scrolling ','touch');
            });
        },

        enableDeveloperMode: function() { //account
            if (config.isDeveloperMode()) {
                alert('Already in developer mode');
                return false;
            }

            // if (!account.developer) {
            //     alert('Current account is not a developer account');
            //     return false;
            // }

            config.setDeveloperMode(true, config.getCurrentAccount());
        },

        cancelDeveloperMode: function() {
            config.setDeveloperMode(false);

            var previousAccount = config.getPreviousAccount();
            if (previousAccount) {
                // session.onCurrentAccountChanged(previousAccount);
                session.changeCurrentAccount(previousAccount.id, previousAccount.type, null);
            }
            else {
                window.tommy.app.alert('No previous account stored. Please logout and login again.');
            }
        }

        // bindEvents: function() {
        //     var bindings = [{
        //         element: document,
        //         selector: 'div.item-image > img',
        //         event: 'click',
        //         handler: VM.module('appView').photoBrowser
        //     }];
        //
        //     util.bindEvents(bindings);
        // }
        // ,
        //
        // showToolbar: function() {
        //     app.showToolbar();
        // }
    };

    // appCtrl.bindEvents();

    return appCtrl;
});
