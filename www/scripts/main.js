(function() {
    var lang = localStorage.getItem('lang') || 'en-us';
    require.config({
        config: {
            moment: {
                noGlobal: true
            }
        },
        locale: lang,
        waitSeconds: 200,
        paths: {
            text: '../lib/vendors/require/text',
            //i18n: '../lib/vendors/require/i18n',
            config: '../lib/config',
            app: '../lib/app',
            api: '../lib/api',
            addons: '../lib/addons',
            cache: '../lib/cache',
            util: '../lib/util',
            xhr: '../lib/xhr',
            tplHelpers: '../lib/templates/tplHelpers',
            tplManager: '../lib/templates/tplManager',
            photoChanger: '../lib/components/photoChanger',
            tagSelect: '../lib/components/tagSelect',
            moment: '../lib/vendors/moment.min',
            // socketio: '/vendors/symple/socket.io',
            symple: '/vendors/symple/symple',
            sympleClient: '/vendors/symple/symple.client',
            Framework7: '../lib/vendors/framework7/framework7',
            // Framework73D: '../lib/vendors/framework7/framework73d',
            GTPL: '../views/global.tpl.html',
            CTPL: '../views/chat.tpl.html',
            TTPL: '../views/team.tpl.html',
            ATPL: '../views/actions.tpl.html',
            ADTPL: '../views/addons.tpl.html',
            CNTPL: '../views/contacts.tpl.html',
            // networkStatus: '../lib/components/networkStatus',
            // jquery: '../vendors/jquery/jquery',
            // PF: 'utils/pageFunc',
            // md5: 'utils/md5',
            // emoticons: 'utils/emoticons',
            // fullcalendar: '../vendors/fullcalendar/fullcalendar',
            // overscroll: '../vendors/overscroll',
            // underscore: '../vendors/underscore',
            // socketio: '../vendors/symple/socket.io',
            // symple: '../vendors/symple/symple',
            // sympleClient: '../vendors/symple/symple.client',
            i18next: '../lib/vendors/i18next.min',
            i18n: '../lib/i18n'
        },
        shim: {
            sympleClient: {
                deps: [ 'symple' ]
            },
            Framework7: {exports: 'Framework7'},
            // 'timer':{deps: 'jquery'},
            // 'socketio': {exports: 'io' },
            // 'sympleClient': {
            //     deps: [ 'socketio' ],
            //     exports: 'Symple.Client'
            // }
            // 'emoticons': {
            //     deps: [ 'jquery' ],
            //     exports: 'emoticons'
            // }
        }
    });

    require(['controllers/module','Framework7','app','router','session','i18n'/*,'i18n!nls/lang'*/,'text!GTPL','text!CTPL','text!ATPL','text!TTPL','text!ADTPL','text!CNTPL','util','config','tplManager','tplHelpers'], //'md5','Framework73D',,'utils/chatClient','emoticons'
    function(CM,Framework7,app,router,session,i18n,/*,i18n*/GTPL,CTPL,ATPL,TTPL,ADTPL,CNTPL,util,config,TM,TH) { //md5,,chatClient,Framework73D

        var main = {
            init: function() {
                window.$$ = Dom7;

                // Override
                // localStorage.setItem('environment', 'development');
                // localStorage.setItem('onboarding_complete', true);
                // localStorage.setItem('environment', 'production');
                // localStorage.removeItem('onboarding_complete');

                if (util.isPhonegap()) {
                    document.addEventListener('deviceready', this.onDeviceAppReady, false);
                    document.addEventListener('resume', this.onDeviceActive, false);
                    document.addEventListener('pause', this.onDevicePause, false);

                //     // cordova.plugins.Keyboard.disableScroll(true);
                //     window.addEventListener('native.keyboardshow', keyboardShowHandler);
                //     window.addEventListener('native.keyboardhide', keyboardHideHandler);
                //
                //     window.animateKeyboard = true;
                //     function keyboardShowHandler(e) {
                //         $$('.page-content').css('margin-bottom',(e.keyboardHeight+65)+'px');
                //         // if(window.animateKeyboard)
                //         // {
                //         //     // console.log(mes_height);
                //         //     setTimeout(function() {
                //         //         $('.messages-content').animate( { bottom: e.keyboardHeight }, 200);
                //         //         $('.messagebar').animate( { marginBottom: e.keyboardHeight }, 200);
                //         //     }, 0);
                //
                //         // }
                //         // else
                //         // {
                //             // $('.messages-content').css('bottom', e.keyboardHeight+'px');
                //             // $('.messagebar').css('margin-bottom', e.keyboardHeight+'px');
                //         // }
                //         // window.animateKeyboard = true;
                //
                //         // console.log('Keyboard height is: ' + e.keyboardHeight);
                //         // console.log($$('.navbar').css('display'));
                //         // console.log($$('.navbar').css('position','fixed'));
                //         //
                //
                //         //latest fixed for disappearing navbar
                //
                //         // $$('.navbar').css('top',(e.keyboardHeight-20)+'px');
                //         // $$('.navbar').css('height','60px !important');
                //         // $$('.navbar-inner').css('margin-top','10px');
                //         // $$('.navbar').css('position','fixed');
                //
                //         // document.body.scrollTop = 0;
                //         // $$('.messagebar').css('margin-bottom',e.keyboardHeight+'px');
                //     }
                //
                //     function keyboardHideHandler(e) {
                //         $$('.page-content').css('margin-bottom','65px');
                //         // $$('.navbar').css('height','60px');
                //         // $$('.navbar-inner').css('margin-top','0');
                //         // $$('.navbar').css('top','0');
                //         // $$('.navbar').css('position','absolute');
                //     }
                }
                else {
                    window.onload = main.onDeviceReady();
                }

                // window.onNotificationAPN = function(e) {
                //     console.log('onNotificationAPN', e);
                // }
            },

            onDeviceAppReady: function() {
                Keyboard.shrinkView(true);
                Keyboard.disableScrollingInShrinkView(true);
                Keyboard.hideFormAccessoryBar(true);

                main.onDeviceReady();

                //receivedEvent('deviceready');
                // main.setupPushNotifications();
            },

            onDeviceReady: function() {
                main.initFramework();
                CM.module('appCtrl').init();
            },

            onDeviceActive: function() {
                console.log('Device resume');
                CM.module('chatCtrl').invalidate();

                // TODO: invalidate active controller?
            },

            onDevicePause: function() {
                console.log('Device pause');
            },

            //
            // Application Initialization
            //

            initFramework: function() {
                i18n.init({
                    lng: 'en-US', // 'zh-CN'
                    load: 'currentOnly',
                }, function(err, t) {
                    console.log('Loaded translations', err)
                    $$('body').append(GTPL).append(CTPL).append(ATPL).append(TTPL).append(ADTPL).append(CNTPL);

                    app.init({
                        pushState: config.environment == 'development', //false, // breaks controller initialization
                        popupCloseByOutside: false,
                        animateNavBackIcon: true,
                        cache: true, //config.environment == 'production', //true, //
                        template7Pages: true,
                        modalTitle: i18n.i18next.t('modal_title', { defaultValue: 'Tommy'}),
                        modalButtonOk: i18n.i18next.t('label.ok', { defaultValue: 'OK'}),
                        modalButtonCancel: i18n.i18next.t('label.cancel', { defaultValue: 'Cancel'}),
                        preprocess: router.preprocess,
                        tapHold: true,
                        swipePanel: 'left',
                        swipeBackPage: false,
                        smartSelectBackTemplate: '<div class="left sliding"><a href="#" class="back link icon-only"><i class="material-icons md-36">keyboard_arrow_left</i></a></div>'
                    });

                    TH.init();
                    router.init();
                    session.init();
                });
            },

            // setupPushNotifications: function() {
            //
            //     // var push = PushNotification.init({
            //     //     "android": {"senderID": "134887466231", "icon": "phonegap", "iconColor": "blue"},
            //     //     "ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );
            //     var push = PushNotification.init({
            //         android: {
            //             senderID: "326899794619"
            //         },
            //         browser: {
            //             pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            //         },
            //         ios: {
            //             alert: "true",
            //             badge: "true",
            //             sound: "true"
            //         },
            //         windows: {}
            //     });
            //
            //     // push.unregister(function() {
            //     //     console.log('success');
            //     // }, function() {
            //     //     console.log('error');
            //     // });
            //
            //     push.on('registration', function(data) {
            //         console.log('PushNotification: Register: ' + data.registrationId);
            //
            //         api.registerDevice(device.platform.toLowerCase(), 'production', null, data.registrationId).then(function(response) {
            //             console.log('registerDevice', response);
            //         });
            //     });
            //
            //     push.on('notification', function(data) {
            //         // data.message,
            //         // data.title,
            //         // data.count,
            //         // data.sound,
            //         // data.image,
            //         // data.additionalData
            //         // console.log('data: '+data);
            //         console.log('PushNotification: Receive: ' + data);
            //         CM.module('chatCtrl').invalidate();
            //     });
            //
            //     push.on('error', function(e) {
            //         console.log('PushNotification: Error: ' + e.message);
            //     });
            // }
        }

        main.init();
    });
})();
