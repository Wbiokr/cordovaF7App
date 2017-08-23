define(['app','util','xhr','views/module','config','api'/*,'i18n!nls/lang'*/,'tplManager','tagSelect'],//,'jquery','overscroll'
function(app,util,xhr,VM,config,api/*,i18n*/,TM,tagSelect) {
    var currentTab = 'actions-recent';

    var actionCtrl = {
        OPERATORS: [ 'equals',
                     'not_equal_to',
                     'less_than',
                     'less_than_or_equal_to',
                     'greater_than',
                     'greater_than_or_equal_to',
                     'contains',
                     'does_not_contain',
                     'starts_with',
                     'does_not_start_with',
                     'ends_with',
                     'does_not_end_with' ],
        data: {},

        init: function(page) {
            console.log('actionCtrl: init');
            app.renderCurrentAvatar();
            actionCtrl.bind(page);
            actionCtrl.invalidate();
        },

        bind: function(page) {
            var $page = $$(page.container),
                $navbar = $$(page.navbarInnerContainer);

            $page.find('[ref="' + currentTab + '"]').click();

            $page.find('.tabs > .tab').on('show', function() {
                console.log('Show Contacts');
                $navbar.find('.center').html(this.title);
                currentTab = this.id;
                actionCtrl.invalidate();
            });

            // $$('#actions-recent').on('show', function() {
            //     $$('#action-title').html('Recent');
            //     currentTab = 'actions-recent';
            //     actionCtrl.invalidate();
            //     // $$('#select-actions-discover').html('<span class="lnr lnr-pencil5"></span>');
            // });

            // $$('#actions-installed').on('show', function() {
            //     $$('#action-title').html('Actions');
            //     currentTab = 'actions-installed';
            //     actionCtrl.invalidate();
            // });

            // $$('#actions-discover').on('show', function() {
            //     $$('#action-title').html('Discover');
            //     currentTab = 'actions-discover';
            //     actionCtrl.invalidate();
            // });

            // $$('#actions-settings').on('show', function() {
            //     $$('#action-title').html('Settings');
            //     currentTab = 'actions-settings';
            //     actionCtrl.invalidate();
            // });
        },

        initActionsSettings: function() {
            TM.renderTarget('actionsSettingsTemplate', {}, '#actions-settings-wrap');
        },

        initActionsDiscover: function() {
            // TM.renderTarget('actionsExploreTemplate', {}, '#actions-discover-wrap');
            actionCtrl.loadDiscoverList();
        },

        invalidate: function() {
            console.log('actionCtrl: invalidate');
            switch (currentTab) {
                case 'actions-recent':
                    actionCtrl.loadRecentList();
                    break;
                case 'actions-installed':
                    actionCtrl.loadActionsList();
                    break;
                case 'actions-discover':
                    actionCtrl.initActionsDiscover();
                    break;
                case 'actions-settings':
                    actionCtrl.initActionsSettings();
                    break;
            }
        },

        initActionDetails: function(page, action_id) {
            var action_id = page.query.action_id;
            api.getAction(action_id).then(function(response) {
                console.log('actionCtrl: initActionDetails:', action_id, response);
                actionCtrl.renderActionDetails(page, response);
            });
        },

        renderActionDetails: function(page, action) {
            console.log('actionCtrl: renderActionDetails:', page, action);
            var $page = $$(page.container),
                $navbar = $$(page.navbarInnerContainer);
            TM.renderTarget('actionDetailsTemplate', action, $page);

            function installAddon() {
                api.installAction(action.id, true).then(function(response) {
                    action.installed = true; // update installed flag
                    actionCtrl.renderActionDetails(page, action); // render initial action
                    actionCtrl.invalidate();

                    window.tommy.app.addNotification({
                        title: action.name,
                        message: 'Action installed successfully',
                        hold: 4000
                    });
                });
            }

            function uninstallAddon() {
                api.uninstallAction(action.id).then(function(response) {
                    action.installed = false; // update installed flag
                    actionCtrl.renderActionDetails(page, action); // render initial action
                    actionCtrl.invalidate();

                    window.tommy.app.addNotification({
                        title: action.name,
                        message: 'Action uninstalled successfully',
                        hold: 4000
                    });
                })
            }

            function deleteCustomAction() {
                api.deleteCustomAction(action.id).then(function(response) {
                    action.installed = false; // update installed flag
                    actionCtrl.renderActionDetails(page, action); // render initial action
                    actionCtrl.invalidate();

                    window.tommy.view.router.back();
                    window.tommy.app.addNotification({
                        title: action.name,
                        message: 'Action deleted successfully',
                        hold: 4000
                    });
                })
            }

            // TODO: Hide buttons for uninstalled action
            if (action.installed) {
                $navbar.find('a.do-action-install').addClass('hide');
            }
            else {
                $navbar.find('a.do-action-install').removeClass('hide').off('click').click(function() {
                    installAddon();
                    return false;
                });
            }

            $page.find('a#action-install').off('click').click(installAddon);
            $page.find('a#action-uninstall').off('click').click(uninstallAddon);
            $page.find('a#action-delete').off('click').click(deleteCustomAction);
            $page.find('a#action-test').off('click').click(function() {
                api.runInstalledAction(action.id).then(function(response) {
                    window.tommy.app.addNotification({
                        title: action.name,
                        message: 'Action ran successfully',
                        hold: 4000
                    });
                });
            });
        },

        initActionHistory: function(action_id) {
            api.getInstalledActionHistory(action_id).then(function(response) {
                console.log('actionCtrl: initActionHistory:', action_id, response);
                TM.renderTarget('actionHistoryTemplate', response, '#action-history');
            });
        },

        initActionSettings: function(page) {
            api.getInstalledAction(page.query.action_id).then(function(actionInstall) {
                $page = TM.renderInline('actionSettingsTemplate', actionInstall, page.container);
                if (config.isCurrentTeam()) {
                    // api.getCurrentTeamTags().then(function(tagItems) {
                        actionCtrl.initActionSettingsFiltersForm($page, actionInstall); //, tagItems);
                        actionCtrl.initActionSettingsPermissionsForm($page, actionInstall); //, tagItems);
                    // });
                }
                actionCtrl.initActionSettingsTaskOptionsForm($page, actionInstall);
                actionCtrl.initActionSettingsConditionsOptionsForm($page, actionInstall);
                actionCtrl.initActionSettingsParameterMappingForm($page, actionInstall);
                actionCtrl.initActionSettingsScheduleForm($page, actionInstall);
            });
        },

        initActionSettingsScheduleFormPage: function($page, $description, actionInstall) {
            var $form = $page.find('form'),
                $typeSelect = $form.find('select[name="type"]'),
                $intervalSelect = $form.find('select[name="interval"]'),
                $timeInput = $form.find('input[name="time"]'),
                $domSelect = $form.find('select[name="day_of_month"]'),
                $dowSelect = $form.find('select[name="day_of_week"]'),
                schedule = actionInstall.timer,
                lastCron = schedule.cron,
                cron = schedule.cron.split(' '),
                type;

            function updateSingleSelection(event) {
                var $select = $$(this),
                    $single = $select.find('option[data-single]'),
                    $selectPage = $$('[data-select-name="' + $select.attr('name') + '"]'),
                    $selectPageCheckboxes = $selectPage.find('input[type="checkbox"]'),
                    $selectPageSelectedCheckboxes = $selectPageCheckboxes.filter(function(index, el) { return $$(this).is(':checked'); });
                if ($selectPageSelectedCheckboxes.length > 1 &&
                    $selectPageCheckboxes.eq(0).is(':checked')) {
                    if (!$single.hasClass('wasChecked')) {
                        $selectPageCheckboxes.prop('checked', false);
                        $selectPageCheckboxes.eq(0).prop('checked', true);
                        $select.find('option').prop('selected', false);
                        $single.prop('selected', true);
                        $single.addClass('wasChecked');
                    }
                    else {
                        $selectPageCheckboxes.eq(0).prop('checked', false);
                        $single.prop('selected', false);
                        $single.removeClass('wasChecked');
                    }
                    // if (!$single.hasClass('wasChecked')) {
                    //     $select.find('option').prop('selected', false);
                    //     // $select.prop('selected', false);
                    //
                    //     $single.prop('selected', true);
                    //     $single.addClass('wasChecked');
                    //
                    //     $selectPageCheckboxes.prop('checked', false);
                    //     $selectPageCheckboxes.eq(0).prop('checked', true);
                    // }
                    // else {
                    //     $selectPageCheckboxes.eq(0).prop('checked', false);
                    //     $single.prop('selected', false);
                    //     $single.removeClass('wasChecked');
                    // }

                    // Trigger change again to overcode smart select oddities
                    // regarding setting after text
                    setTimeout(function() {
                        $selectPageCheckboxes.eq(0).trigger('change');
                    });
                }
            }

            $domSelect.on('change', updateSingleSelection);
            $dowSelect.on('change', updateSingleSelection);

            $typeSelect.on('change', function() {
                type = $typeSelect.val();
                // console.log('Schedule type changed', type)

                $form.find('[data-schedule-item]').hide();
                $form.find('[data-schedule-item="' + type + '"]').show();
            });

            // Cron syntax explaination
            // +---------------- minute (0 - 59)
            // |  +------------- hour (0 - 23)
            // |  |  +---------- day of month (1 - 31)
            // |  |  |  +------- month (1 - 12)
            // |  |  |  |  +---- day of week (0 - 7) (Sunday=0 or 7)
            // |  |  |  |  |
            // *  *  *  *  *  command to be executed

            // Set schedule form
            if (cron && cron.length) {

                // Check if interval or time type and set hours and minutes
                if (cron[1].indexOf('*') !== -1) {
                    console.log('Set interval schedule')
                    type = 'interval';
                    $typeSelect.find('option[value="interval"]').prop('selected', true);
                    $form.find('option[data-minute="' + cron[0] + '"][data-hour="' + cron[1] + '"]').prop('selected', true);
                }
                else {
                    var minute = parseInt(cron[0]),
                        hour = parseInt(cron[1])
                        suffix = hour > 12 ? 'pm' : 'am';

                    // pad minutes
                    minute = minute < 10 ? ('0' + minute) : minute;

                    // only -12 from hours if it is greater than 12 (if not back at mid night)
                    hour = (hour > 12) ? hour -12 : hour;

                    // if 00 then it is 12 am
                    hour = (hour == 0) ? 12 : hour;

                    $typeSelect.find('option[value="time"]').prop('selected', true);
                    $form.find('input[name="time"]').val(hour + ':' + minute + ' ' + suffix);
                }

                // Set day of month
                var dom = cron[2].split(',');
                if (dom.length) {
                    $domSelect.find('option[data-day-of-month="*"]').prop('selected', false);
                    for (var date in dom) {
                        $domSelect.find('option[data-day-of-month="' + dom[date] + '"]').prop('selected', true);
                        if (dom[date] == '*')
                            $domSelect.find('option[data-day-of-month="*"]').addClass('wasChecked');
                    }
                }

                // Set day of week
                var dow = cron[4].split(',');
                if (dow.length) {
                    $dowSelect.find('option[data-day-of-week="*"]').prop('selected', false);
                    for (var day in dow) {
                        $dowSelect.find('option[data-day-of-week="' + dow[day] + '"]').prop('selected', true);
                        if (dow[day] == '*')
                            $dowSelect.find('option[data-day-of-week="*"]').addClass('wasChecked');
                    }
                }

                window.tommy.app.initSmartSelects($page);
            }

            $typeSelect.trigger('change');

            function buildCron() {
                var minute = '',
                    hour = '',
                    dow = '',
                    month = '*',
                    dom = '';

                if (type == 'interval') {
                    minute = $intervalSelect.find('option:checked').data('minute');
                    hour = $intervalSelect.find('option:checked').data('hour');
                }
                else {
                    var timeParts = $timeInput.val().split(':');
                    if (timeParts.length < 2) {
                        return false;
                    }
                    hour = parseInt(timeParts[0]);
                    minute = parseInt(timeParts[1]);

                    var suffix = timeParts[1].split(' ');
                    if (suffix.length < 2) {
                        return false;
                    }
                    suffix = suffix[1].toLowerCase();
                    if (suffix !== 'am' && suffix !== 'pm') {
                        return false;
                    }
                    if (suffix === 'pm') {
                        hour += 12;
                    }
                }

                $dowSelect.find('option:checked').each(function(i) {
                    if (i > 0)
                        dow += ',';
                    dow += $$(this).data('day-of-week');
                });

                $domSelect.find('option:checked').each(function(i) {
                    if (i > 0)
                        dom += ',';
                    dom += $$(this).data('day-of-month');
                });

                return [minute, hour, dom, month, dow].join(' ');
            }

            $form.on('change', function() {
                var cron = buildCron();

                // Don't save unless cron has actually changed
                if (lastCron == cron)
                    return;
                lastCron = cron;

                console.log('Schedule changed', cron);

                api.updateInstalledAction(actionInstall.action_id, {
                    timer_attributes: {
                        cron: cron
                    }
                }, function(response) {
                    if ($description) {
                      $description.text(response.schedule.description);
                      console.log('Action schedule updated', response, response.schedule.description, $description.text());
                    }
                });
            });
        },

        // Setup the action filters (team only)
        initActionSettingsScheduleForm: function($page, actionInstall) {
            if (!actionInstall.timer || !actionInstall.timer.cron)
                return;

            var $scope = TM.renderInline('actionSettingsScheduleTemplate', actionInstall.timer);
            $scope.find('a.item-link.action-schedule').click(function(event) {
                var $description = $$(this).find('.item-after');
                var pageCallback = window.tommy.app.onPageInit('action-settings-schedule', function(page) {
                    actionCtrl.initActionSettingsScheduleFormPage(
                        $$(page.container), $description, actionInstall);
                    pageCallback.remove();
                });
            });
        },

        // Setup the action filters (team only)
        initActionSettingsFiltersForm: function($page, actionInstall) { //, tagItems
            api.getInstalledActionSetting(actionInstall.action_id, 'filters').then(function(response) {
                var savedTags = response ? response.data : [];
                var $tagSelect = $page.find('form#action-settings-filter-form .tag-select');
                tagSelect.initWidget($tagSelect, savedTags, function(data) {
                    actionCtrl.updateActionSettings(actionInstall.action_id, 'filters', data);
                });
            });

            // // Get saved filters and update the form
            // api.getInstalledActionSetting(actionInstall.action_id, 'filters').then(function(response) {
            //     var savedTags = response ? response.value : {};
            //
            //     for (var scope in tagItems) {
            //         var items = tagItems[scope];
            //         for (var x = 0; x < items.length; x++) {
            //             var item = items[x],
            //                 selected = actionCtrl.isTagSelected(savedTags, scope, item);
            //             window.tommy.app.smartSelectAddOption(
            //                 '#action-settings-filter-form [data-scope="' + scope + '"] select',
            //                 '<option data-scope="' + scope + '" value="' + item[0] + '" ' + (selected ? 'selected' : '') + '>' + item[1] + '</option>');
            //         }
            //     }
            // });
            //
            // // Update filter settings on change
            // $page.find('form#action-settings-filter-form').on('change', function(event) {
            //     var data = { users: [], roles: [], locations: [], tags: [] };
            //     $$(this).find('option:checked').each(function() {
            //         var $option = $$(this);
            //         data[$option.data('scope')].push([parseInt($option.val()), $option.text()]);
            //     });
            //
            //     actionCtrl.updateActionSettings(actionInstall.action_id, 'filters', data);
            // });
        },

        // Setup the action permissions (team only)
        initActionSettingsPermissionsForm: function($page, actionInstall, tagItems) {
            api.getInstalledActionSetting(actionInstall.action_id, 'permissions').then(function(response) {
                var savedTags = response ? response.data : [];
                var $tagSelect = $page.find('form#action-settings-permissions-form .tag-select');
                tagSelect.initWidget($tagSelect, savedTags, function(data) {
                    actionCtrl.updateActionSettings(actionInstall.action_id, 'permissions', data);
                });
            });

            // // Get saved filters and update the form
            // api.getInstalledActionSetting(actionInstall.action_id, 'permissions').then(function(response) {
            //     var savedTags = response ? response.data : {};
            //
            //     // for (var scope in tagItems) {
            //         var scope = 'users';
            //         var items = tagItems[scope];
            //         for (var x = 0; x < items.length; x++) {
            //             var item = items[x],
            //                 selected = actionCtrl.isTagSelected(savedTags, scope, item);
            //             window.tommy.app.smartSelectAddOption(
            //                 '#action-settings-permissions-form [data-scope="' + scope + '"] select',
            //                 '<option data-scope="' + scope + '" value="' + item[0] + '" ' + (selected ? 'selected' : '') + '>' + item[1] + '</option>');
            //         }
            //     // }
            // });
            //
            // // Update filter settings on change
            // $page.find('form#action-settings-permissions-form').on('change', function(event) {
            //     var data = { users: [], roles: [], locations: [], tags: [] };
            //     $$(this).find('option:checked').each(function() {
            //         var $option = $$(this);
            //         data[$option.data('scope')].push([parseInt($option.val()), $option.text()]);
            //     });
            //
            //     actionCtrl.updateActionSettings(actionInstall.action_id, 'permissions', data);
            // });
        },

        // Setup task options form
        initActionSettingsTaskOptionsForm: function($page, actionInstall) {
            var $form = $page.find('form#action-settings-task-options-form'),
                taskOptions = actionInstall.settings['task.options'] || {},
                templateData = [ actionInstall.trigger ];

            // templateData[0] = actionInstall.trigger;
            templateData[0].options = actionCtrl.formatOptionsForTemplate(actionInstall.trigger.path, taskOptions);
            if (!templateData[0].options) {
                return false;
            }

            // $page.find('#action-settings-options-title').show();
            TM.renderTarget('actionOptionsFormFieldsTemplate', templateData, $form);

            function updateSettings() {
                var values = window.tommy.app.formToJSON($form);
                for (var key in values) {
                    taskOptions[key].data = values[key];
                }
                actionCtrl.updateActionSettings(actionInstall.action_id, 'task.options', taskOptions);
            }

            $form.on('blur change', updateSettings);

            actionCtrl.bindSettingsConditionLink($form, updateSettings, function(path, param) {
                return taskOptions;
            });
        },

        // Setup conditions options form
        initActionSettingsConditionsOptionsForm: function($page, actionInstall) {
            var $form = $page.find('form#action-settings-conditions-options-form'),
                conditions = actionInstall.conditions,
                conditionsOptions = actionInstall.settings['conditions.options'] || {},
                templateData = [];

            for (var i = 0; i < conditions.length; i++) {
                var condition = conditions[i];
                var options = conditionsOptions[condition.path];
                if (options) {
                    condition.options = actionCtrl.formatOptionsForTemplate(condition.path, options);
                    if (condition.options)
                        templateData.push(condition);
                }
            }
            if (!templateData.length) {
                return;
            }

            // $page.find('#action-settings-options-title').show();
            TM.renderTarget('actionOptionsFormFieldsTemplate', templateData, $form);

            function updateSettings(event) {
                var values = window.tommy.app.formToJSON($form);
                for (var path in values) {
                    var parts = path.match(/(.*?)\[(.*?)\]\[(.*?)\]/),
                        path = parts[1],
                        param = parts[2],
                        key = parts[3],
                        value = values[path];

                    conditionsOptions[path][param][key] = value;
                }

                actionCtrl.updateActionSettings(actionInstall.action_id, 'conditions.options', conditionsOptions);
            }

            $form.on('blur change', updateSettings);

            actionCtrl.bindSettingsConditionLink($form, function(path, param) {
                return conditionsOptions[path][param];
            });
        },

        bindSettingsConditionLink: function($scope, getOption) {
            $scope.find('a.item-link.action-condition').click(function(event) {
                var $link = $$(this),
                    path = $link.data('path'),
                    param = $link.data('param'),
                    context = getOption(path, param);

                context.operators = actionCtrl.OPERATORS;

                var pageCallback = window.tommy.app.onPageInit('action-settings-condition', function(page) {
                    var $form = $$(page.container).find('form');

                    $form.on('change', function() {
                        var $section = $scope.find('[data-path="' + path + '"][data-param="' + param + '"]'),
                            operatorText = $form.find('[name="operator"] option:checked').text(),
                            operator = $form.find('[name="operator"]').val(),
                            value = $form.find('[name="value"]').val();

                        // Update option description on main form
                        $link.find('.item-after').text(operatorText + ' ' + value);

                        // Update hidden inputs on main form
                        $section.find('input[data-key="operator"]').val(operator);
                        $section.find('input[data-key="value"]').val(value);

                        // Trigger form change event to save
                        $scope.trigger('change');
                    });
                    pageCallback.remove();
                });

                window.tommy.view.router.load({
                    url: this.href,
                    context: context
                });
                return false;
            });
        },

        // Setup parameter mapping options
        initActionSettingsParameterMappingForm: function($page, actionInstall) {
            var mappings = actionInstall.settings['mappings'] || {},
                $scope = TM.renderInline('actionSettingsParameterMappingFormTemplate',
                    { title: actionInstall.activity.name + ' Parameters', mappings: mappings}),
                $form = $scope.find('form');

            // Populate and bind parameter selects
            api.getActionVariableList(actionInstall.action_id).then(function(response) {
                var variableItems = response;
                var $optgroups = {
                    trigger: $form.find('select optgroup.mappings-trigger'),
                    user: $form.find('select optgroup.mappings-user'),
                    owner: $form.find('select optgroup.mappings-owner'),
                    account: $form.find('select optgroup.mappings-account')
                }
                for (var scope in variableItems) {
                    var items = variableItems[scope];
                    for (var x = 0; x < items.length; x++) {
                        var item = items[x], selected = false;
                        window.tommy.app.smartSelectAddOption($optgroups[scope],
                          '<option data-scope="' + scope + '" data-source="variable" data-type="' + item[2] + '" value="' + scope + '.' + item[1] + '">' + item[0] + '</option>');
                    }
                }

                // Set selected states
                for (var param in mappings) {
                    var mapping = mappings[param],
                        $item = $form.find('[data-param=' + param + ']'); // option
                    if (mapping.source == 'custom') {
                        $item.find('option[data-source="custom"]').prop('selected', true);
                    }
                    else {
                        $item.find('option[value="' + mapping.value + '"]').prop('selected', true);
                    }
                    $item.find('select').trigger('change');
                }
            });

            // Update filter settings on change
            $form.find('select').on('change', function(event) {
                var $selected = $$(this).find('option:checked'),
                    $parent = $selected.closest('li'),
                    value = $selected.val(),
                    source = $selected.data('source');

                // Show or hide main textbox depending on if type is text or variable
                $parent.find('.textarea')[source == 'custom' ? 'show' : 'hide']();
                $parent.find('.item-after').text($selected.text());
            });

            // Serialize form data and save the setting
            function updateSettings() {
                $$(this).find('option:checked').each(function() {
                    var $option = $$(this),
                        param = $option.closest('li').data('param'),
                        source = $option.data('source'),
                        value = $option.val();
                    if (source == 'custom')
                        value = $option.closest('li').find('textarea').val();

                    mappings[param].source = source;
                    mappings[param].value = value;
                });

                actionCtrl.updateActionSettings(actionInstall.action_id, 'mappings', mappings);
            }

            $form.on('change blur', updateSettings);
        },

        formatOptionsForTemplate: function(path, options) {
            var formatted = false;
            if (options) {
                for (var param in options) {
                    formatted = formatted || {}
                    var item = options[param];

                    // build condition option
                    if (item.operator || (item.default && item.default.operator)) {
                        item.path = path;
                        item.param = param;
                        item.operators = actionCtrl.OPERATORS;
                        if (!item.operator && item.default)
                            item.operator = item.default.operator;
                    }

                    // set default values
                    if (!item.value && item.default)
                        item.value = item.default.value;
                    formatted[param] = item;
                }
            }
            return formatted;
        },

        updateActionSettings: function(action_id, name, data, callback) {
            api.updateInstalledActionSetting(action_id, name, {
                data: JSON.stringify(data)
            }, function(response) {
                console.log('actionCtrl: updateActionSettings', response);
                if (callback)
                    callback(response);
            });
        },

        loadRecentList: function() {
            api.getRecentActions({cache: true}).then(function(response) {
                console.log('actionCtrl: loadRecentList:', response);
                TM.renderTarget('actionListTemplate', response, '#actions-recent-wrap');
            });
        },

        loadActionsList: function() {
            api.getInstalledActions({cache: true}).then(function(response) {
                console.log('actionCtrl: loadActionsList:', response);
                TM.renderTarget('actionListTemplate', response, '#actions-installed-wrap');
            });
        },

        loadDiscoverList: function() {
            api.getActions({cache: true}).then(function(response) {
                console.log('actionCtrl: loadDiscoverList:', response);
                TM.renderTarget('actionListTemplate', response, '#actions-discover-wrap');
            });
        },

        isTagSelected: function(savedTags, scope, item) {
            if (savedTags[scope]) {
                for (var x = 0; x < savedTags[scope].length; x++) {
                    if (savedTags &&
                        savedTags[scope] &&
                        savedTags[scope][x] &&
                        savedTags[scope][x][0] == item[0] &&
                        savedTags[scope][x][1] == item[1])
                        return true;
                }
            }
            return false;
        }
    };

    return actionCtrl;
});
