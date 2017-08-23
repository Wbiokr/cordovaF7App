define(['app','util','xhr','views/module','config','api','addons'/*,'i18n!nls/lang'*/,'tplManager','tagSelect'],//,'jquery','overscroll'
function(app,util,xhr,VM,config,api,addons/*,i18n*/,TM,tagSelect) {
    var t7 = Template7;

    var addonCtrl = {
        init: function(page) {
            api.getAddons().then(function(response) {
                console.log('addonCtrl: loadAddonsList:', response);
                TM.renderInline('addonListTemplate', response, page.container);
            });
        },

        // Load and view an addon.
        viewAddon: function(package, viewId) {
            if (t7.global.currentAddon &&
                t7.global.currentAddon.package === package) {
                console.log('addon already active', package);
                return false;
            }

            addons.loadAddon(package, '*').then(function (addon) {
                console.log('viewable addon loaded', addon);

                // If no view ID was passed attempt to get the default view
                if (!viewId) {
                    var view = addons.getDefaultAddonView(addon.package, addon.version);
                    if (view) viewId = view.id;
                }

                addons.showAddonView(package, '*', viewId);

                // if (view) {
                //     console.log('Loading addon view', view);
                //     app.f7view.router.load({
                //         url: view.url,
                //         context: addon
                //     });
                // }
                // else {
                //     alert("Couldn't view addon: " + package)
                // }
            });

            return true;
        },

        initAddonDetails: function(page) {
            var package = page.query.package;
            api.getAddon(package).then(function(addon) {
                var $page = $$(page.container);
                addonCtrl.renderAddonDetails($page, addon);

                // Permissions tag select
                if (addon.installed && config.isCurrentTeam()) {
                    // addon.installed && config.isCurrentTeam()

                    api.getInstalledAddonPermissions(package).then(function(permissions) {
                        // var savedTags = response; // ? response.value : [];
                        var $permissions = TM.renderInline('addonPermissionsTemplate', permissions, page.container);

                        $permissions.find('.tag-select').each(function() {
                            var $tagSelect = $$(this); //$page.find('#addon-permissions-form .tag-select');
                            console.log('addonCtrl: initAddonDetails: initWidget', package, permissions);
                            tagSelect.initWidget($tagSelect, permissions, function(data) {
                                console.log('addonCtrl: initAddonDetails: saveWidget', package, data, $tagSelect.dataset());

                                api.updateInstalledAddonPermission(package, $tagSelect.data('permission-id'), {
                                    filters: JSON.stringify(data)
                                });
                            });
                        });
                    });

                    // api.getInstalledAddonSetting(package, 'permissions').then(function(response) {
                    //     var savedTags = response ? response.value : [];
                    //     var $tagSelect = $page.find('#addon-permissions-form .tag-select');
                    //     console.log('addonCtrl: initAddonDetails: initWidget', package, addon);
                    //     tagSelect.initWidget($tagSelect, savedTags, function(data) {
                    //         api.updateInstalledAddonSetting(package, 'permissions', {
                    //             value: JSON.stringify(data)
                    //         });
                    //     });
                    // });
                }
            });
        },

        renderAddonDetails: function($page, addon) {
            console.log('addonCtrl: renderAddonDetails:', addon);
            TM.renderTarget('addonDetailsTemplate', addon, $page);

            // TODO: Hide buttons for uninstalled addon
            // if (addon.installed) {
            //     $$('a.do-addon-settings').removeClass('hide').attr('href', 'views/addon-settings.html?addon_id=' + addon.id);
            //     $$('a.do-addon-install').addClass('hide');
            // }
            // else {
            //     $$('a.do-addon-settings').addClass('hide');
            //     $$('a.do-addon-install').removeClass('hide').off('click').click(function() {
            //         $$('#addon-install').trigger('click');
            //     });
            // }
            //
            // $page.find('#addon-test').off('click').click(function() {
            //     api.runInstalledAddon(addon.id).then(function(response) {
            //         window.tommy.app.addNotification({
            //             title: addon.name,
            //             message: 'Addon ran successfully',
            //             hold: 4000
            //         });
            //     });
            // });

            $page.find('#addon-install').off('click').click(function() {
                api.installAddon(addon.package, {}).then(function(response) {
                    addon.installed = true; // update installed flag
                    addonCtrl.renderAddonDetails($page, addon); // render initial addon
                    // addonCtrl.invalidate();

                    // Load the full addon object via the manager
                    addons.loadAddon(addon.package, '*');

                    window.tommy.app.addNotification({
                        title: addon.name,
                        message: 'Addon installed successfully',
                        hold: 4000
                    });
                });
            });

            $page.find('#addon-uninstall').off('click').click(function() {
                api.uninstallAddon(addon.package).then(function(response) {
                    addon.installed = false; // update installed flag
                    addonCtrl.renderAddonDetails($page, addon); // render initial addon
                    // addonCtrl.invalidate();

                    // Remove from manager
                    addons.removeAddon(addon.package);

                    window.tommy.app.addNotification({
                        title: addon.name,
                        message: 'Addon uninstalled successfully',
                        hold: 4000
                    });
                })
            });
        }
    };

    return addonCtrl;
});
