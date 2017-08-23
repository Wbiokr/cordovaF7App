define(['config','api','util','app','controllers/module','views/module'/*,'i18n!nls/lang'*/,'session','controllers/onboardingCtrl'],//,'tplManager','controllers/accountCtrl','controllers/chatCtrl''xhr',,'underscore'
function(config,api,util,app,CM,VM/*,i18n*/,session,onboardingCtrl) { //xhr, , _, TM, accountCtrl, chatCtrl

    var loginCtrl = {
        init: function(page) {
            app.disableSwipeMenu();
            var $page = $$(page.container),
                $form = $page.find('form#login-form');

            var bindings = [{
                element: $form,
                event: 'submit',
                handler: loginCtrl.loginSubmit
            }];

            VM.module('loginView').init({
                bindings: bindings
            });
        },

        loginSubmit: function(event) {
            event.preventDefault();
            var $form = $$(event.currentTarget);
            var emailOrPhone = $form.find('input.login').val();
            var password = $form.find('input.password').val();
            if (emailOrPhone === '' || password === '') {
                window.tommy.app.alert(i18n.t('label.invalid_input', { defaultValue: 'Invalid input'}));
            // } else if (!util.isEmail(email)) {
            //     window.tommy.app.alert(i18n.login.err_illegal_email);
            }
            else {
                api.login(emailOrPhone, password).then(function(response) {
                    console.log('loginCtrl', 'loginSubmit', response);
                    config.setCurrentUser(response, response.token);
                    session.start();
                });
            }
        },
        initResetPassword: function(page) {
            VM.module('loginView').renderCountryList(page);

            var $page = $$(page.container),
                $form = $page.find('form#reset-password-form');

            var bindings = [
              {
                  element: $form,
                  event: 'submit',
                  handler: loginCtrl.sendResetPassword
              },
              {
                  element: $form.find("input.phone"),
                  event: 'keyup',
                  handler: onboardingCtrl.checkEmailOrPhone
              },
              {
                  element: $form.find("input.phone"),
                  event: 'keyup',
                  handler: onboardingCtrl.updateCountryCodeSelect
              },
              {
                  element: $form.find(".country-select"),
                  event: 'change',
                  handler: onboardingCtrl.updateCountryCode
              }
            ];

            VM.module('loginView').init({
                bindings: bindings
            });

        },

        sendResetPassword: function(event) {
            event.preventDefault();

            var $form = $$(event.currentTarget);
            var login = $form.find('input.username').val();
            // var phone = $form.find('input.phone').val();
            // console.log(login);
            // .isEmailorPhone(login) === "phone"

            // var login;

            // if (email !== "") {
            //   login = email;
            // } else if(phone !== "") {
            //   login = phone;
            // }

            if (!login) {
                window.tommy.app.alert(i18n.t('label.invalid_input', { defaultValue: 'Invalid input'}), 'Tommy');
            }
            else {
                app.showLoader();
                api.resetPassword(login).then(function(response) {
                    window.tommy.view.router.reloadPage('views/login.html');
                    app.hideLoader();

                    window.tommy.app.addNotification({
                        title: 'Password reset',
                        message: 'Please check your email or phone to get your temporary password.',
                        hold: 10000
                    });
                }).catch(function(response) {
                    window.tommy.app.alert('Sorry, there was a problem in sending the email. Please try again.');
                    app.hideLoader();
                });
            }

        },
    };

    return loginCtrl;
});
