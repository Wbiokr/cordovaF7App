define(['app','util','views/module','config','api'/*,'i18n!nls/lang'*/,'tplManager','session','photoChanger'],
function(app,util,VM,config,api/*,i18n*/,TM,session,photoChanger) {

    var onboardingCtrl = {
        init: function(page) {
            var $page = $$(page.container),
                $form = $page.find("#check-account");

            app.disableSwipeMenu();
            VM.module('registrationView').renderCountryList(page);

            var bindings = [
                {
                  element: $form.find("input"),
                  event: 'keyup',
                  handler: onboardingCtrl.checkEmailOrPhone
                },
                {
                  element: $form.find("input"),
                  event: 'keyup',
                  handler: onboardingCtrl.updateCountryCodeSelect
                },
                {
                  element: $form,
                  event: 'submit',
                  handler: onboardingCtrl.createOrCheckAccountExists
                },
                {
                  element: $form.find(".country-select"),
                  event: 'change',
                  handler: onboardingCtrl.updateCountryCode
                }
            ];

            VM.module('registrationView').init({
                bindings: bindings
            });
        },

        initDetails: function(page) {
            app.disableSwipeMenu();

            var loginEmail = page.query.email;
            var loginPhone = page.query.mobile;

            var $form = $$('#registration-details-form');

            if(loginEmail) {
                $form.find('input.email').val(loginEmail);
            } else if (loginPhone) {
                $form.find('input.phone').val(loginPhone);
            }

            var bindings = [
                {
                  element: $form, //'#registration-details-form',
                  event: 'submit',
                  handler: onboardingCtrl.onRegistrationSubmit
                }
            ];

            VM.module('registrationView').init({
                bindings: bindings
            });

        },

        initSplash: function(page) {
            var $page = $$(page.container);

            var mySwiper = window.tommy.app.swiper('.swiper-container', {
                speed: 400,
                spaceBetween: 200,
                paginationClickable: true,
                pagination:'.swiper-pagination'
            });

            // this.goNextSlide = function(){
            //     mySwiper.slideNext();
            // }

            $page.on('click', '.arrow-next', mySwiper.slideNext);
            $page.find('.slider-2').on('click', 'a', mySwiper.slideNext);
        },

        initNotifications: function(page) {
            app.disableSwipeMenu();
            var $page = $$(page.container),
                $enableButton = $page.find('.enable-notification');

            var bindings = [
              {
                element: $enableButton,
                event: 'click',
                handler: onboardingCtrl.enableNotification
              }
            ];

            util.bindEvents(bindings);

            if(typeof PushNotification !== 'undefined'){
                PushNotification.hasPermission(function(data) {
                    if (data.isEnabled) {
                        window.tommy.view.router.loadPage('views/splash.html');
                    }
                });
            }
        },

        enableNotification: function() {
            if(typeof PushNotification !== 'undefined'){
                session.setupPushNotification();
            } else {
                window.tommy.view.router.loadPage('views/splash.html');
            }
        },

        initPhoto: function(page) {
            var $page = $$(page.container);

            var bindings = [{
                element: $page.find("a.do-upload-photo"),
                event: 'click',
                handler: onboardingCtrl.onPhotoChange
            },
            {
                element: $page.find("a.do-skip-step"),
                event: 'click',
                handler: onboardingCtrl.onRegistrationComplete // complete
            },
            {
                element: $page.find("button"),
                event: 'click',
                handler: onboardingCtrl.goToConfirm
            }];

            util.bindEvents(bindings);
        },

        initConfirm: function(page) {
            var $form = $$(page.container).find("form");
            VM.module('registrationView').renderCountryList(page);

            var bindings = [
                {
                  element: $form,
                  event: 'submit',
                  handler: onboardingCtrl.onVerificationSubmit
                },
                {
                  element: $form.find("input"),
                  event: 'keyup',
                  handler: onboardingCtrl.updateCountryCodeSelect
                },
                {
                  element: $form.find(".country-select"),
                  event: 'change',
                  handler: onboardingCtrl.updateCountryCode
                }
            ];

            util.bindEvents(bindings);

            var $inputEmail = $form.find('input[name=email]');
            var $inputPhone = $form.find('input[name=mobile]');
            var $countryCode = $form.find('select').val();
            var currentUser = config.getCurrentUser();

            if(page.query.type) {
                $inputPhone.val(currentUser ? currentUser.mobile : "");

                if($inputPhone.val() && $inputPhone.val()[0] !== "+"){
                    $inputPhone.val("+"+$countryCode+$inputPhone.val());
                }
            } else {
                $form.find('input[name=email]').val(currentUser.email);
            }

        },

        initConfirmCode: function() {

            var bindings = [
                {
                  element: '#confirm-code-form',
                  event: 'submit',
                  handler: onboardingCtrl.onConfirmationSubmit
                }
            ];

            util.bindEvents(bindings);
        },

        initEnableContacts: function(page) {
            var $page = $$(page.container);

            var bindings = [
                {
                    element: $page.find(".enable-contacts"),
                    event: 'click',
                    handler: onboardingCtrl.enableContacts
                },
            ];

            util.bindEvents(bindings);
        },

        createOrCheckAccountExists: function(event) {

            event.preventDefault();
            var $form = $$(event.currentTarget).closest("form");
            var login = $form.find('input.username').val();
            var data = {};

            if (onboardingCtrl.isEmailorPhone(login) === "phone") {
                registrationParam = "mobile"
                data.mobile = login;
            } else {
                registrationParam = "email"
                data.email = login;
            }

            if (login === "") {
                window.tommy.app.alert(i18n.t('label.invalid_input', { defaultValue: 'Invalid input'}), 'Tommy');
            } else {
                console.log('onboarding:createUser: ' + JSON.stringify(data))
                api.createUser(data, { showErrorMessages: false }).then(function(response) {
                    config.setCurrentUser(response, response.token);

                    // Set the current user object (but don't authenticate)
                    // session.onCurrentAccountChanged(response);

                    window.tommy.view.router.loadPage('views/registration-details.html?'+registrationParam+'='+login);
                }).catch(function(response) {
                    window.tommy.view.router.loadPage('views/login.html?login='+login);
                    window.tommy.app.addNotification({
                        title: 'Account Exists',
                        message: 'Your already have a Tommy account. Please sign in or recover your password to continue.',
                        hold: 4000
                    });
                });
            }
        },

        onRegistrationSubmit: function(event) {
            event.preventDefault();

            var $form = $$(event.currentTarget),
                data = {
                    first_name: $form.find('input.first_name').val(),
                    last_name: $form.find('input.last_name').val(),
                    email: $form.find('input.email').val(),
                    password: $form.find('input.password').val(),
                    mobile: $form.find('input.mobile').val()
                };

            if (!data.first_name || !data.password && (!data.email || !data.mobile)) {
                window.tommy.app.alert(i18n.t('label.invalid_input', { defaultValue: 'Invalid input'}), 'Tommy');
            }
            else if(!util.isEmail(data.email) && !data.mobile) {
                window.tommy.app.alert(i18n.t('label.invalid_email', { defaultValue: 'Invalid email'}));
            }
            else {
                api.updateCurrentUser(data).then(function(response) {

                    config.setCurrentUser(response, response.token);

                    // Set the current user object (but don't authenticate)
                    session.onCurrentAccountChanged(response);

                    // Load the next page in the onboarding process
                    window.tommy.view.router.loadPage('views/registration-photo.html'); //?user_id='+response.id
                });
            }
        },

        isEmailorPhone: function(val) {

            var firstChar = val.charAt(0);

            if ((firstChar <= '9' && firstChar >= '0') || firstChar == "+") {
                return "phone";
            } else {
                return "email";
            }
        },

        updateCountryCode: function(event) {

            var $form = $$(event.currentTarget).closest("form");

            var mobileInput = $form.find('input.phone');
            var optionSelected = $$(event.currentTarget).find('option:checked').val();

            // Clear previous country code
            if (mobileInput.val()[0] === "+") {
                mobileInput.val(mobileInput.val().slice(3));
            }

            mobileInput.val("+" + optionSelected +""+ mobileInput.val());
        },

        updateCountryCodeSelect: function(event) {

            var $form = $$(event.currentTarget).closest("form");

            $val = $$(this).val();
            $countrySelect = $form.find("select").find('option');

            var firstChar = $val.charAt(0);

            if (firstChar === "+") {
                $val = $val.substring(1,3);

                $form.find("select[name='country_code']").val($val);
                $optionList = $form.find("option");

                for (var i = 0; i < $optionList.length; i++) {
                    optionField = $form.find("option[value='"+$optionList[i].value+"']");
                    optionField.removeAttr('selected');

                    if ($form.find("option")[i].value === $val){
                        $form.find(".country-code div").text(optionField.text());
                        optionField.attr('selected', true);
                    }
                }
            }
        },

        checkEmailOrPhone: function(event) {
            var $form = $$(event.currentTarget).closest("form");
            var firstChar = $$(event.currentTarget).val().charAt(0)

            if(firstChar === "") {
                $form.find(".icons i").removeClass("enable");
                $form.find(".country-code").hide();
            } else if (onboardingCtrl.isEmailorPhone(firstChar) === "phone") {
                $form.find(".icons i").removeClass("enable");
                $form.find(".icon-phone").addClass("enable");
                $form.find(".country-code").show();
            } else {
                $form.find(".icons i").removeClass("enable");
                $form.find(".icon-email").addClass("enable");
                $form.find(".country-code").hide();
            }
        },

        onPhotoChange: function(event) {
            console.log('onboardingCtrl', 'onPhotoChange');
            photoChanger.init({
                url: 'user',

                // NOTE: Angelo: you would redirect to next onboarding step here
                // rather than completing registration.
                success: function(response){
                    onboardingCtrl.goToConfirm();
                }
            });
            photoChanger.openMenu();

            event.preventDefault();

            // var form = event.currentTarget, data = new FormData(form);
            // api.updateCurrentUser(data).then(function(response) {
            //     onboardingCtrl.onRegistrationComplete();
            // });
        },

        goToConfirm: function() {

            var email = config.getCurrentUser().email;
            if (email) {
                window.tommy.view.router.loadPage('views/registration-confirm.html?type=phone');
            } else {
                window.tommy.view.router.loadPage('views/registration-confirm.html');
            }

        },

        onVerificationSubmit: function(event) {
            event.preventDefault();

            var $form = $$(event.currentTarget);
            var $email = $form.find('input[name=email]').val();
            var $mobile = $form.find('input[name=mobile]').val();

            var data = {}
            if ($email) data.email = $email
            if ($mobile) data.mobile = $mobile

            if ($email === "") {
                window.tommy.app.alert(i18n.t('label.invalid_email', { defaultValue: 'Invalid email'}), 'Tommy');
            } else if($mobile === "") {
                window.tommy.app.alert(i18n.t('label.invalid_mobile', { defaultValue: 'Invalid mobile'}), 'Tommy');
            } else {
                // Update the user with additional data
                api.updateCurrentUser(data).then(function(response) {
                    if ($email && $email !== "") {
                        api.sendConfirmationEmail(response.id).then(function(response) {
                            window.tommy.view.router.loadPage('views/registration-confirm-code.html');
                        });
                    } else if ($mobile && $mobile !== "") {
                        api.sendConfirmationSms(response.id).then(function(response) {
                            window.tommy.view.router.loadPage('views/registration-confirm-code.html');
                        });
                    }

                }).catch(function(response){
                    window.tommy.app.alert(response);
                });
            }

        },

        onConfirmationSubmit: function(event) {

            event.preventDefault();

            var $code = $$(event.currentTarget).find('input[name=code]');

            // TODO Check if email or phone
            api.checkConfirmationCode($code.val()).then(function(response) {
                window.tommy.view.router.loadPage('views/enable-contacts.html');
            });
        },

        enableContacts: function() {

            if (!util.isPhonegap()) {
                onboardingCtrl.onRegistrationComplete();
            } else {
                var contactList = [];
                window.tommy.app.showPreloader('Searching contacts');

                function onSuccess(contacts) {
                    contacts.forEach(function(contact, index){
                        singleContact = {
                            first_name: (contact.displayName || contact.name.givenName),
                            last_name: (contact.name.familyName || ""),
                            email: (contact.emails ? contact.emails[0].value : ""),
                            mobile: (contact.phoneNumbers ? contact.phoneNumbers[0].value : ""),
                        }

                        if ((contact.displayName || contact.name.givenName) && (contact.emails || contact.phoneNumbers)) {
                            contactList.push(singleContact);
                        }

                    });

                    window.tommy.app.hidePreloader();

                    if (contactList.length === 0) {
                        onboardingCtrl.onRegistrationComplete();
                    } else {
                        window.tommy.app.confirm('Found '+ contactList.length +' contacts. Would you like to import them?',
                            function () {
                                window.tommy.app.showPreloader("Importing "+ contactList.length +" contacts");

                                api.importContacts(JSON.stringify(contactList)).then(function(response) {
                                    console.log(response);
                                    window.tommy.app.hidePreloader();
                                    onboardingCtrl.onRegistrationComplete();

                                }).catch(function(response) {
                                    console.log(response);
                                });
                            },
                            function () {
                                window.tommy.app.hidePreloader();
                                onboardingCtrl.onRegistrationComplete();
                            }
                        );
                    }

                };

                function onError(contactError) {
                    window.tommy.app.alert("Unable to import your contacts.");
                };

                var fields = [
                    navigator.contacts.fieldType.displayName,
                    navigator.contacts.fieldType.name,
                    navigator.contacts.fieldType.emails,
                    navigator.contacts.fieldType.phoneNumbers,
                ];

                var options = new ContactFindOptions();
                options.hasPhoneNumber = true;

                navigator.contacts.find(fields, onSuccess, onError, options);
            }

        },

        onRegistrationComplete: function() {

            // Set the onboarding complete flag so next time the use logs out
            // they will be sent to the signin page.
            config.setOnboardingComplete();

            var loginCallback = window.tommy.app.onPageInit('login', function(page) {
                var email = config.getCurrentUser().email;
                $$('#login-form input.username').val(email);
                window.tommy.app.addNotification({
                    title: 'Account Created',
                    message: 'Your account has been created and an email has been sent to ' + email,
                    hold: 4000
                });
                loginCallback.remove();
            });

            session.start();
        }
    };

    return onboardingCtrl;
});
