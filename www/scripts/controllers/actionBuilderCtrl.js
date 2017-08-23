define(['util','xhr','views/module','config','api'/*,'i18n!nls/lang'*/,'tplManager','controllers/appCtrl','controllers/actionCtrl'],//,'jquery','overscroll'
function(util,xhr,VM,config,api/*,i18n*/,TM,appCtrl,actionCtrl) {

    var actionBuilderCtrl = {
        cache: {
            action: null // the current action being built
        },

        init: function() {
            actionBuilderCtrl.cache = {}; // reset cache

            $$('#action-builder-form').submit(function(event) {
                event.preventDefault();

                var $form = $$(this),
                    user = config.getCurrentUser(),
                    data = window.tommy.app.formToJSON($form);

                if (data.title.length < 3) {
                    window.tommy.app.alert('Action name must be three characters or longer.');
                    return false;
                }

                data.name = data.title.toLowerCase();
                // if (!data.summary)
                //     data.summary = 'Custom action by ' + user.first_name + ' ' + user.last_name;
                api.createCustomAction(data).then(function(response) {
                    console.log('actionBuilderCtrl: init:', response);
                    window.tommy.view.router.loadPage('views/action-builder-task.html?action_id=' + response.id);
                });
                // window.tommy.view.router.loadPage('views/action-builder-trigger.html?action_id=9');
                // event.preventDefault();
            });
        },

        initTask: function(page) {
            var $page = $$(page.container),
                action_id = page.query.action_id;
            console.log('actionBuilderCtrl: initTask:', action_id, page);

            actionBuilderCtrl.getCurrentAction(action_id, function(action) {
                api.getActionTasks().then(function(tasks) {
                    console.log('actionBuilderCtrl: initTask: tasks', tasks);

                    var templateData = actionBuilderCtrl.formatTemplateData(tasks, 'tasks', action);
                    console.log('actionBuilderCtrl: initTask: templateData', templateData);
                    TM.renderTarget('actionBuilderTaskFormTemplate', templateData, '#action-builder-task-wrap');

                    var $form = $page.find('form'),
                        task_id = actionBuilderCtrl.getSelectedID($form, false);
                    actionBuilderCtrl.updateContinueButtonText($page, !!task_id ? 'CONTINUE' : 'SKIP');
                    //actionBuilderCtrl.updateContinueButtonVisibility($page, !!task_id);
                    window.tommy.app.initSmartSelects($page);

                    $form.on('change', function(event) {
                        actionBuilderCtrl.resetAdjacentSmartSelects($form, event.target);
                        task_id = actionBuilderCtrl.getSelectedID($form, false);
                        actionBuilderCtrl.updateContinueButtonText($page, !!task_id ? 'CONTINUE' : 'SKIP');
                        //actionBuilderCtrl.updateContinueButtonVisibility($page, !!task_id);
                        console.log('actionBuilderCtrl: initTask: change', task_id, event);

                        var taskName = $$(event.target).find('option:checked').text();
                        window.tommy.app.addNotification({
                            title: 'Task Updated',
                            message: taskName + ' task selected',
                            hold: 2000
                        });
                    });

                    $page.find('a.fixed-button').on('click', function(event) {
                        var nextUrl = this.href;
                        actionBuilderCtrl.updateCurrentAction(action_id, { task_id: task_id }, this, function(action) {

                            // If Task was set redirect straight to Conditions, 
                            // otherwise redirect to Triggers
                            if (task_id) {
                                window.tommy.view.router.loadPage('views/action-builder-conditions.html?action_id=' + action_id);
                            }
                            else {
                                window.tommy.view.router.loadPage(nextUrl);
                            }
                        });
                        event.stopImmediatePropagation(); // required or link is followed
                        event.preventDefault();
                        return false;
                    });
                });
            });
        },

        initTrigger: function(page) {
            var $page = $$(page.container),
                action_id = page.query.action_id;
            console.log('actionBuilderCtrl: initTrigger:', action_id, page);

            actionBuilderCtrl.getCurrentAction(action_id, function(action) {
                api.getActionTriggers().then(function(triggers) {
                    console.log('actionBuilderCtrl: initTrigger: triggers', triggers);

                    var templateData = actionBuilderCtrl.formatTemplateData(triggers, 'triggers', action);
                    console.log('actionBuilderCtrl: initTrigger: templateData', templateData);
                    TM.renderTarget('actionBuilderTriggerFormTemplate', templateData, '#action-builder-trigger-wrap');

                    var $form = $page.find('form'),
                        trigger_id = actionBuilderCtrl.getSelectedID($form, false);
                    actionBuilderCtrl.updateContinueButtonVisibility($page, !!trigger_id);
                    window.tommy.app.initSmartSelects($page);

                    $form.on('change', function(event) {
                        actionBuilderCtrl.resetAdjacentSmartSelects($form, event.target);
                        trigger_id = actionBuilderCtrl.getSelectedID($form, false);
                        actionBuilderCtrl.updateContinueButtonVisibility($page, !!trigger_id);
                        console.log('actionBuilderCtrl: initTrigger: change', trigger_id, event);

                        var triggerName = $$(event.target).find('option:checked').text();
                        window.tommy.app.addNotification({
                            title: 'Trigger Updated',
                            message: triggerName + ' trigger selected',
                            hold: 2000
                        });
                    });

                    $page.find('a.fixed-button').on('click', function(event) {
                        // var nextUrl = this.href;
                        actionBuilderCtrl.updateCurrentAction(action_id, { trigger_id: trigger_id }, this);
                        event.stopImmediatePropagation(); // required or link is followed
                        event.preventDefault();
                        return false;
                    });
                });
            });
        },

        initConditions: function(page) {
            var $page = $$(page.container),
                action_id = page.query.action_id;
            console.log('actionBuilderCtrl: initConditions:', action_id, page);

            actionBuilderCtrl.getCurrentAction(action_id, function(action) {
                api.getActionConditions().then(function(conditions) {
                    var templateData = actionBuilderCtrl.formatTemplateData(conditions, 'conditions');
                    TM.renderTarget('actionBuilderConditionsFormTemplate', templateData, '#action-builder-conditions-wrap');

                    var $form = $page.find('form'),
                        condition_ids = actionBuilderCtrl.getSelectedIDs($form, true);
                    actionBuilderCtrl.updateContinueButtonText($page, condition_ids.length ? 'CONTINUE' : 'SKIP');
                    window.tommy.app.initSmartSelects($page);

                    $form.on('change', function(event) {
                        condition_ids = actionBuilderCtrl.getSelectedIDs($form, true);
                        actionBuilderCtrl.updateContinueButtonText($page, condition_ids.length ? 'CONTINUE' : 'SKIP');
                        console.log('actionBuilderCtrl: initTrigger: change', condition_ids, event);
                    });

                    $page.find('a.fixed-button').on('click', function(event) {
                        if (condition_ids.length) {
                            // var nextUrl = this.href;
                            actionBuilderCtrl.updateCurrentAction(action_id, { condition_ids: condition_ids }, this);
                            event.stopImmediatePropagation(); // required or link is followed
                            event.preventDefault();
                            return false;
                        }
                    });
                });
            });
        },

        initActivity: function(page) {
            var $page = $$(page.container),
                action_id = page.query.action_id;
            console.log('actionBuilderCtrl: initActivity:', action_id, page);

            actionBuilderCtrl.getCurrentAction(action_id, function(action) {
                api.getActionActivities().then(function(activities) {
                    var templateData = actionBuilderCtrl.formatTemplateData(activities, 'activities', action);
                    TM.renderTarget('actionBuilderActivityFormTemplate', templateData, '#action-builder-activity-wrap');

                    var $form = $page.find('form'),
                        activity_id = actionBuilderCtrl.getSelectedID($form, false);
                    actionBuilderCtrl.updateContinueButtonVisibility($page, !!activity_id);
                    window.tommy.app.initSmartSelects($page);

                    $form.on('change', function(event) {
                        actionBuilderCtrl.resetAdjacentSmartSelects($form, event.target);
                        activity_id = actionBuilderCtrl.getSelectedID($form, false);
                        actionBuilderCtrl.updateContinueButtonVisibility($page, !!activity_id);
                        var activityName = $form.find('option:checked').text();
                        window.tommy.app.addNotification({
                            title: 'Activity Updated',
                            message: activityName + ' activity selected',
                            hold: 2000
                        });
                        console.log('actionBuilderCtrl: initTrigger: change', activity_id, event);
                    });

                    $page.find('a.fixed-button').click(function(event) {
                        var nextUrl = this.href;
                        actionBuilderCtrl.updateCurrentAction(action_id, { activity_id: activity_id }, this, function(action) {
                            actionBuilderCtrl.installActionAndRedirect(action_id, nextUrl);
                        });
                        event.stopImmediatePropagation(); // required or link is followed
                        event.preventDefault();
                        return false;
                    });

                    // var activities = response,
                    //     templateData = actionBuilderCtrl.formatTemplateData(activities, 'activities');
                    //
                    // TM.renderTarget('actionBuilderActivityFormTemplate', templateData, '#action-builder-activity-wrap');
                    // console.log('actionBuilderCtrl: initActivity: activities', activities);
                    //
                    // $$('#action-builder-activity-form').change(function(event) {
                    //     // var $form = $$(this),
                    //     //     data = window.tommy.app.formToJSON($form),
                    //     //     activity_id = data[0];
                    //     var activity_id = actionBuilderCtrl.getSelectedIDs(this, true);
                    //
                    //     console.log('actionBuilderCtrl: initActivity: change', activity_id);
                    //
                    //     api.updateCustomAction(action_id, { activity_id: activity_id }).then(function(response) {
                    //         console.log('actionBuilderCtrl: initActivity: saved', response);
                    //         actionBuilderCtrl.cache.activity_id = activity_id;
                    //         actionBuilderCtrl.installActionAndRedirect(action_id);
                    //     });
                    //     // event.preventDefault();
                    // });
                });
            });
        },

        initSettings: function(page) {
            // Reuse `initActionSettings` from the Action controller
            actionCtrl.initActionSettings(page);

            // api.getInstalledAction(page.query.action_id).then(function(actionInstall) {
            //     $page = TM.renderInline('actionSettingsTemplate', actionInstall, page.container);
            //     if (config.getCurrentTeamId()) {
            //         actionCtrl.initActionSettingsFiltersForm($page, actionInstall);
            //     }
            //     actionCtrl.initActionSettingsTaskOptionsForm($page, actionInstall);
            //     actionCtrl.initActionSettingsConditionsOptionsForm($page, actionInstall);
            //     actionCtrl.initActionSettingsParameterMappingForm($page, actionInstall);
            // });
        },

        installActionAndRedirect: function(action_id, nextUrl) {
            api.installAction(action_id, true).then(function(response) {
                window.tommy.view.router.loadPage(nextUrl);
            });
        },

        formatTemplateData: function(data, param) {
            var templateData = {
                action: actionBuilderCtrl.cache.action,
                addons: {}
            };
            for (var i = 0; i < data.length; i++) {
                var package = data[i].addon_version.package;
                if (!templateData.addons[package]) {
                    templateData.addons[package] = data[i].addon_version;
                    templateData.addons[package][param] = [];
                }
                templateData.addons[package][param].push(data[i]);
            }

            return templateData;
        },

        getCurrentAction: function(action_id, callback) {
            if (actionBuilderCtrl.cache.action) {
                callback(actionBuilderCtrl.cache.action);
                return;
            }
            api.getCustomAction(action_id).then(function(action) {
                actionBuilderCtrl.cache.action = action;
                callback(action);
            });
        },

        updateCurrentAction: function(action_id, data, button, callback) {
            var $button = $$(button),
                nextUrl = button.href;
            $button.addClass('disabled');
            api.updateCustomAction(action_id, data).then(function(action) {
                console.log('actionBuilderCtrl: updateCurrentAction:', action);

                actionBuilderCtrl.cache.action = action;
                $button.removeClass('disabled');
                if (callback)
                    callback(action);
                else
                    window.tommy.view.router.loadPage(nextUrl);
            });
        },

        updateContinueButtonVisibility: function($page, condition) {
            $page.find('.toolbar')[condition ? 'removeClass' : 'addClass']('toolbar-hidden');
        },

        updateContinueButtonText: function($page, text) {
            $page.find('.toolbar a.button').text(text);
        },

        resetAdjacentSmartSelects: function(form, currenctSelect) {
            var $form = $$(form),
                otherSelects = $form.find('select').filter(function(index, el) {
                  return this !== currenctSelect;
            });
            otherSelects.each(function(index, el) {
                $$(this).find('option')
                        .removeAttr('selected')
                        .eq(0)
                        .attr('selected', 'selected');
            });
            window.tommy.app.initSmartSelects($form);
        },

        getSelectedID: function(form) { //, firstOnly
            var data = window.tommy.app.formToJSON(form);
            for (var param in data) {
                var value = parseInt(data[param]);
                if (value > 0) {
                    return value;
                }
            }
            return null;
        },

        getSelectedIDs: function(form) { //, firstOnly
            var data = window.tommy.app.formToJSON(form),
                values = [];
            for (var param in data) {
                for (var i = 0; i < data[param].length; i++) {
                    var value = parseInt(data[param][i]);
                    if (value > 0) {
                        values.push(value);
                    }
                }
            }
            return values;
        }

        // Deprecated: Used to capture smart select clicks when checked
        // onSmartSelectChecked: function(form, multiple, callback) {
        //     var $form = $$(form),
        //         smartSelectCallback = window.tommy.app.onPageAfterAnimation('*', function(smartSelectPage) {
        //         if (smartSelectPage.name.indexOf('smart-select') >= 0) {
        //             $$(smartSelectPage.container).find('input').on('click', function() {
        //                 // if (this.checked && !multiple) {
        //                 //     var this
        //                 //     var otherOptions = $form.find('option:selected').filter(function(index, el) {
        //                 //         return $$(this).hasClass('red');
        //                 //     });
        //                 // }
        //                 callback(actionBuilderCtrl.getSelectedIDs($form, multiple));
        //             });
        //             smartSelectCallback.remove();
        //         }
        //     });
        // }
    };

    return actionBuilderCtrl;
});
