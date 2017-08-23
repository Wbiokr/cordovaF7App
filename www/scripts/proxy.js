(function() {

    // Override console logs and append to variable if required
    if (window.location.pathname.indexOf('capturelogs')) {

        function stringifyObject(object) {
            var simpleObject = {};
            for (var prop in object ){
                if (!object.hasOwnProperty(prop)){
                    continue;
                }
                if (typeof(object[prop]) == 'object'){
                    continue;
                }
                if (typeof(object[prop]) == 'function'){
                    continue;
                }
                simpleObject[prop] = object[prop];
            }
            return JSON.stringify(simpleObject); // returns cleaned up JSON
        };

        var _console = console.log;
        console.log = function() {
            var args = Array.prototype.slice.call(arguments);
            var message = '';
            for (var i = 0; i < args.length; i++) {
                if (typeof(args[i]) == 'string')
                    message += args[i];
                else
                    message += stringifyObject(args[i]);
                message += ' ';
            }
            if (!window.tommy)
                window.tommy = {};
            if (!window.tommy.logs)
                window.tommy.logs = [];
            window.tommy.logs.push(message);
            _console.apply(console, arguments);
        };
    }

    // Initialize require.js
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
            text: '/lib/vendors/require/text',
            // i18n: '/lib/vendors/require/i18n',
            config: '/lib/config',
            app: '/lib/app',
            api: '/lib/api',
            addons: '/lib/addons',
            cache: '/lib/cache',
            util: '/lib/util',
            xhr: '/lib/xhr',
            tplHelpers: '/lib/templates/tplHelpers',
            tplManager: '/lib/templates/tplManager',
            photoChanger: '/lib/components/photoChanger',
            tagSelect: '/lib/components/tagSelect',
            moment: '/lib/vendors/moment.min',
            Framework7: '/lib/vendors/framework7/framework7',
            // socketio: '/vendors/symple/socket.io',
            symple: '/vendors/symple/symple',
            sympleClient: '/vendors/symple/symple.client',
            GTPL: '/views/global.tpl.html',
            CTPL: '/views/chat.tpl.html',
            TTPL: '/views/team.tpl.html',
            ATPL: '/views/actions.tpl.html',
            ADTPL: '/views/addons.tpl.html',
            CNTPL: '/views/contacts.tpl.html',
            i18next: '../lib/vendors/i18next.min',
            i18n: '../lib/i18n'
        },
        shim: {
            sympleClient: {
                deps: [ 'symple' ]
            },
            // 'socketio': {exports: 'io'},
            Framework7: {exports: 'Framework7'},
        }
    });

    require(['app','router','session','addons','util','config','i18n'/*,'i18n!nls/lang'*/,'controllers/module','tplHelpers','text!GTPL','text!CTPL','text!ATPL','text!TTPL','text!ADTPL','text!CNTPL'], //'md5','Framework73D',,'utils/chatClient','emoticons'
    function(app,router,session,addons,util,config,i18n,CM,TH,GTPL,CTPL,ATPL,TTPL,ADTPL,CNTPL) {

        var proxy = {
            init: function() {
                window.$$ = Dom7;

                // localStorage.setItem('environment', 'development');
                // localStorage.setItem('onboarding_complete', true);
                // localStorage.setItem('environment', 'production');
                // localStorage.removeItem('onboarding_complete');

                if (!config.isAuthenticated()) {
                    console.log('Proxy mode is disabled without a valid session');
                    return;
                }

                i18n.init({
                    lng: 'en-US', // 'zh-CN'
                    load: 'currentOnly',
                }, function(err, t) {
                    console.log('Loaded translations', err)

                    app.init({
                        pushState: true,
                        // pushStateOnLoad: true,
                        popupCloseByOutside: false,
                        animateNavBackIcon: false,
                        cache: true,
                        template7Pages: true,
                        modalTitle: i18n.i18next.t('modal_title', { defaultValue: 'Tommy'}),
                        modalButtonOk: i18n.i18next.t('label.ok', { defaultValue: 'OK'}),
                        modalButtonCancel: i18n.i18next.t('label.cancel', { defaultValue: 'Cancel'}),
                        // preroute: router.preroute, //proxy
                        preprocess: router.preprocess,
                        preloadPreviousPage: false,
                        tapHold: true,
                        swipePanel: 'left',
                        swipeBackPage: false,
                        smartSelectBackTemplate: '<div class="left sliding"><a href="#" class="back link icon-only"><i class="material-icons md-36">keyboard_arrow_left</i></a></div>'
                    });

                    // Set the global proxy flag
                    // window.tommy.native = true;

                    $$('body').append(GTPL).append(CTPL).append(ATPL).append(TTPL).append(ADTPL).append(CNTPL);

                    // app.bindDynamicSubmitButtons();

                    TH.init();
                    router.init();
                    addons.init();

                    proxy.exposeAPI();
                });
                // Use like so:
                // Load page: /proxy.html?page=views/actions.html
                // Load addon: /proxy.html?addon=calendar

                // Handle addon loading
                // var params = $$.parseUrlQuery(window.location.href);
                // if (params.page) {
                //     app.f7view.router.load({
                //         url: params.page,
                //         animatePages: false
                //     });
                // }
                // else if (params.addon) {
                //     var loaded = false;
                //     addons.onViewLoaded = function (addon, view) {
                //         if (loaded || (params.view && view.id != params.view))
                //             return;
                //         loaded = true;
                //         app.f7view.router.load({
                //             url: view.url,
                //             context: addon
                //         });
                //     }
                //     addons.loadAddon(params.addon, '*', function (response) {
                //         console.log('Proxy addon loaded', response);
                //     });
                // }
            },

            // Expose methods for native iOS app integration
            exposeAPI: function() {

                function setupNativeBackButtonCallback() {
                    var callback = window.tommy.app.onPageBeforeAnimation('*', function(page) {
                        if (window.tommy.params.hideBackButton) {
                            $$('.navbar .open-panel, .navbar .back').css('visibility: hidden');
                        }
                        else {
                            // set the rootBackPage so the back button is always
                            // replaced when the page is reloaded
                            window.tommy.rootBackPage = page.name;
                            app.replaceNativeBackButton(page);
                        }
                        callback.remove();
                    });
                    return callback;
                }

                window.tommy.loadAddon = function(package, viewId) {
                    var callback = setupNativeBackButtonCallback();
                    var result = CM.module('addonCtrl').viewAddon(package, viewId);
                    if (result === false) {
                        callback.remove();
                    }
                    return result;
                };

                // CM.module('addonCtrl').viewAddon; //package, viewId
                window.tommy.loadPage = function(url) {
                    addons.resetCurrentAddonContext(); // clear the current addon context
                    var callback = setupNativeBackButtonCallback();
                    var result = app.f7view.router.load({
                        url: url,
                        animatePages: false
                    });
                    if (result === false) {
                        callback.remove();
                        return false;
                    }
                    // return result;
                    return true;
                };

                window.tommy.onPageBack = null;
                window.tommy.onPageReady = null;

                //var params = $$.parseUrlQuery(window.location.href);
                window.tommy.params = $$.parseUrlQuery(window.location.href);
                if (window.tommy.params.page) {
                    window.tommy.loadPage(window.tommy.params.page);
                }

                // console.log(window.tommy.loadAddon);
            }
        }

        proxy.init();
    });
})();
