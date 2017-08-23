define(['app','config','api','utils/chatClient','util','addons'], //, 'xhr' , 'underscore'
function(app,config,api,chatClient,util,addons) {

    var session = {
        init: function() {
            if (config.isAuthenticated()) {
                session.start();
            }
            else {
                session.destroy();
            }
        },

        start: function() {

            // Always reload on initialization
            api.getCurrentAccount().then(function(account) {
                console.log('Session initializing: ' + JSON.stringify(account));
                if (!config.disableChat) {
                    if (!chatClient.client) {
                        chatClient.connect();
                    }
                }

                config.setOnboardingComplete(); // always set after login or register
                window.tommy.view.router.loadPage('views/chat.html');

                session.setupPushNotification();
                session.onCurrentAccountChanged(account);
            }).catch(function(error) {
                console.log('Session initialization error: ' + error);
                session.destroy();
            });
        },

        destroy: function() {
            config.destorySession();
            chatClient.disconnect();

            // Disable onboarding
            // if (config.onboardingComplete()) {
                window.tommy.view.router.loadPage('views/login.html');
            // } else {
            //     window.tommy.view.router.loadPage('views/enable-notifications.html');
            // }
        },

        changeCurrentAccount: function(accountID, accountType, locationId) {
            api.updateCurrentAccount(accountID, accountType, locationId, { configKey: 'account' }).then(function(response) {
                session.onCurrentAccountChanged(response);

                // Reset all API request cache after switching accounts
                api.resetCache();

                // Reload the current page
                console.log('session', 'changeCurrentAccount', window.tommy.view.activePage);
                window.tommy.view.router.reloadPage(window.tommy.view.activePage.url);
            });
        },

        onCurrentAccountChanged: function(account) {

            // Store the current account
            config.setCurrentAccount(account);
            config.setCurrentAvatar(account.icon_url);

            // Rerender avatar and hide badges
            app.renderCurrentAvatar();

            session.initAddons();

            $$(document).trigger('account:change', account);
        },

        initAddons: function() {
            addons.init(); // only affects once
            addons.reloadAllRemote();
        },

        setupPushNotification: function() {
            if (typeof(PushNotification) === 'undefined') {
                if (util.isPhonegap())
                    alert('Push notification plugin not installed');
                return;
            }

            var push = PushNotification.init({
                android: {
                    senderID: "326899794619"
                },
                browser: {
                    pushServiceURL: 'http://push.api.phonegap.com/v1/push'
                },
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                },
                windows: {}
            });

            push.on('registration', function(data) {
                console.log('PushNotification: Register: ' + data.registrationId);

                PushNotification.hasPermission(function(result){
                    if (result.isEnabled) {
                        session.registerDevice(data.registrationId);
                    }
                });
            });

            push.on('notification', function(data) {
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
                // console.log('data: '+data);
                console.log('PushNotification: Receive: ' + data);
                // CM.module('chatCtrl').invalidate();
            });

            push.on('error', function(e) {
                console.log('PushNotification: Error: ' + e.message);
            });

            // // var onboardingComplete = localStorage.getItem('onboarding_complete');
            // // if (typeof onbor_complete !== 'undefined' && onbor_complete !== null && onbor_complete !== false) {
            // //   //
            // // } else {
            // //     window.tommy.view.router.loadPage('views/splash.html');
            // // }
            //
            // PushNotification.hasPermission(function(result){
            //     if (result.isEnabled) {
            //         // session.registerDevice();
            //     }
            // });
            //
            // push.on('registration', function(data){
            //     localStorage.setItem('registrationId', data.registrationId);
            //
            //     console.log('PushNotification: Register: ' + data.registrationId);
            //     console.log(data);
            //     console.log(localStorage.getItem('onboarding_complete'));
            //     session.registrationId = data.registrationId;
            //
            //     if (typeof onbor_complete !== 'undefined' && onbor_complete !== null && onbor_complete !== false) {
            //         // window.tommy.view.router.loadPage('views/splash.html');
            //     } else {
            //         PushNotification.hasPermission(function(result){
            //             if (result.isEnabled) {
            //                 session.registerDevice();
            //             }
            //         });
            //     }
            // });
        },

        registerDevice: function(token) {
            api.registerDevice(device.platform.toLowerCase(), 'production', null, token).then(function(response) {
                console.log('Register device:' + JSON.stringify(response));
            }).catch(function(error) {
                console.log('Register device error: ', error);
            });
        }
    }

    // session.init();
    return session;
});
