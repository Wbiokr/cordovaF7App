define(['app', 'util', 'views/module', 'config', 'api', 'utils/chatClient', 'i18n' /*ext'i18n!nls/lang'*/, 'tplManager', 'controllers/appCtrl'],//,'jquery','overscroll'
    function (app, util, VM, config, api, chatClient, i18n, TM, appCtrl) {
        // var avatar = false, lastDate, messagesLoaded, usersLoaded;
        var currentTab = 'chats-recent';

        var chatCtrl = {
            data: {
                initialized: false,
                f7Messages: '',
                f7Messagebar: '',
                conversationStarted: false,
                currentChat: null
                // noActivity: 0,
                // lastID: 0,
                // chatPageNumber: 0,
            },

            init: function (page) {
                console.log('chatCtrl: init');
                // if (chatCtrl.data.initialized)
                //     return;
                // chatCtrl.data.initialized = true;

                // if (!chatClient.client && config.environment === 'production') {
                //     alert('Chat client not initialized');
                //     return;
                // }

                // if (chatClient.client) {
                //     chatClient.client.on('message', chatCtrl.onSympleMessage);
                // }

                app.enableSwipeMenu();
                app.renderCurrentAvatar();
                chatCtrl.loadContactsList();
                chatCtrl.bind(page);
                chatCtrl.invalidate();
            },

            bind: function (page) {
                var $page = $$(page.container),
                    $navbar = $$(page.navbarInnerContainer);

                $page.find('[ref="' + currentTab + '"]').click();

                // if (!chatClient.client && !config.disableChat) {
                //     chatClient.connect();
                // }

                if (chatClient.client) {
                    chatClient.client.on('message', chatCtrl.onSympleMessage);
                    chatClient.client.on('event', chatCtrl.onSympleEvent);
                    chatClient.client.on('addPeer', function (peer) {
                        var user_id = parseInt(peer.user);
                        app.setUserOnlineStatus(user_id, true);
                    });
                    chatClient.client.on('removePeer', function (peer) {
                        var user_id = parseInt(peer.user);
                        app.setUserOnlineStatus(user_id, false);
                    });
                }

                $page.find('.tabs > .tab').on('show', function () {
                    console.log('Show Contacts');
                    $navbar.find('.center').html(this.title);
                    currentTab = this.id;
                    chatCtrl.invalidate();
                });

                app.actionListeners['new-chat'] = function () {
                    // if (currentTab === 'contacts' || currentTab === 'recent') {
                    chatCtrl.showSelectChatContactsPopup();
                    // }
                    // else if (currentTab === 'favorites') {
                    //     chatCtrl.showSelectFavoriteContactsPopup();
                    // }
                }

                app.actionListeners['scan-qr'] = function () {
                    if (window.QRScanner) {
                        // window.QRScanner.scan(function(err, contents){
                        //     err && console.err(err);
                        //     window.alert(contents);
                        // });
                        // window.QRScanner.show();
                        cordova.plugins.barcodeScanner.scan(
                            function (result) {
                                alert("We got a barcode\n" +
                                    "Result: " + result.text + "\n" +
                                    "Format: " + result.format + "\n" +
                                    "Cancelled: " + result.cancelled);
                            },
                            function (error) {
                                alert("Scanning failed: " + error);
                            }
                        );
                    
                } 
                
                else {
                alert('The QR scanner is not available on this device')
                }
              }
           },

loadRecentList: function () {
    api.getRecentChatMessages().then(function (response) {
        console.log('chatCtrl: loadRecentList', response);
        TM.renderTarget('chatListTemplate', response, '#recent-wrap');
        chatCtrl.resetUnreadMessages();
    });
},

loadFavoritesList: function () {
    api.getFavoriteChatMessages().then(function (response) {
        var $scope = $$('#favorites-wrap');
        TM.renderTarget('chatListTemplate', response, $scope);

        $scope.find('.remove-btn').on('click', function () {
            var userId = $$(this).attr('data-id');
            app.f7.modal({
                text: 'Remove from Favourites?',
                buttons: [{
                    text: 'NO',
                    class: 'small'
                }, {
                    text: 'YES',
                    class: 'big',
                    onClick: function () {
                        api.updateContact(userId, { favorite: false });
                    }
                }]
            });
        });
    });
},

loadContactsList: function () {
    api.getContacts({ cache: true }).then(function (response) {
        console.log('chatCtrl: loadContactsList: ', response);
        var $scope = $$('#contact-wrap');
        var sortedContacts = response.length ?
            chatCtrl.sortContactsListByAlphabeticIndex(response) : {};
        TM.renderTarget('contactListTemplate', sortedContacts, $scope);

        var mySearchbar = app.f7.searchbar('.searchbar', {
            searchList: '.contacts-list',
            searchIn: '.item-title'
        });

        $scope.find('.search-box').on('focus', function () {
            $scope.find('.searchbar-cancel').text('Cancel');
        });
    });
},

// Init a chat window with a `chat_id` or an array of `user_ids`
initChatWindow: function (page) {
    var query = page.query;
    console.log('chatCtrl: init', query);

    if (query.chat_id) {
        console.log('chatCtrl: init: getChat', query);
        api.getChat(query.chat_id).then(function (response) {
            chatCtrl.renderChatWindow(page, response);
        });
    }
    else if (query.user_ids) {
        if (query.create) {
            console.log('chatCtrl: init: createChat', query);
            api.createChat(query.user_ids).then(function (response) {
                chatCtrl.renderChatWindow(page, response);
            });
        }
        else {
            console.log('chatCtrl: init: initiateChat', query);
            api.initiateChat(query.user_ids).then(function (response) {
                chatCtrl.renderChatWindow(page, response);
            });
        }
    } else {
        alert('Invalid query');
    }
},

// Init chat details page
initChatDetails: function (page) {
    var chat_id = page.query.chat_id,
        $page = $$(page.container),
        $navbar = $$(page.navbarInnerContainer),
        chatUserIds = [];

    // if (chatCtrl.data.currentChat.group) {
    //     // Update the chat details template
    //     updateChatUsers();
    // }

    // else {
    //     alert('Cannot update chat users');
    // }

    function toggleChatUser() {
        var changed = false;
        chatCtrl.getAndShowSelectContactsPopup(chatUserIds, function (e) {
            var user_id = $$(this).val(),
                selected = $$(this).is(':checked');

            // If already a group chat we add/remove users as normal
            if (chatCtrl.data.currentChat.group) {
                var method = selected ? 'createChatUser' : 'deleteChatUser'
                api[method](chat_id, user_id).then(function (response) {
                    console.log('chatCtrl', method, chat_id, user_id, response);
                });
            }
            changed = true;
        }, function (userIds) {
            chatUserIds = userIds; // Update selected IDs on popup close
            if (changed) {

                // Upgrade to group chat if not a group chat already,
                // and more than two users are selected (including self).
                if (!chatCtrl.data.currentChat.group && userIds.length > 1) {
                    console.log('chatCtrl: create group chat', userIds);
                    window.invalidateBackPage = true;
                    window.tommy.view.router.back({
                        url: 'views/chat-view.html',
                        force: true,
                        reload: true,
                        query: {
                            user_ids: userIds
                        }
                    });
                }

                else {
                    // Update the chat details template
                    updateChatUsers();

                    // Update the chat window if the back button is pressed
                    window.invalidateBackPage = true;
                }
            }
        }); //, true
        return false;
    }

    function updateChatUsers() {
        api.getChatUsers(chat_id).then(function (response) {
            response = chatCtrl.flagOnlineContactsInList(response);

            console.log('chatCtrl: initChatDetails', chat_id, response);
            TM.renderInline('chatDetailsTemplate', response, $page);

            // Collect all current user IDs
            chatUserIds = [];
            for (var i = 0; i < response.length; i++) {
                chatUserIds.push(response[i].id);
            }

            $navbar.find('a.do-add-user').off('click', toggleChatUser).click(toggleChatUser);
        });
    }

    updateChatUsers();
},

initContactDetails: function (page) {
    var user_id = page.query.user_id;
    api.getContact(user_id).then(function (response) {
        console.log('chatCtrl: initContactDetails', user_id, response);

        var $page = $$(page.container);
        TM.renderInline('contactDetailsTemplate', response, $page);
        TM.renderInline('profileHeaderTemplate', response, $page);

        $page.find('#contact-form').on('submit change', function (e) {
            var form = e.currentTarget, data = new FormData(form);
            api.updateContact(user_id, data).then(function (response) {
                console.log('chatCtrl', 'initContactDetails', 'updateContact', response);
            });
        });

        // $page.find('#chat_notification_mutes').on('change', function(e) {
        //     if ($$(this).is(":checked"))
        //         chatCtrl.updateMuteNotification(user_id, 1);
        //     else
        //         chatCtrl.updateMuteNotification(user_id, 0);
        // });
        //
        // $page.find('#add_favorite').on('change', function(e) {
        //     if ($$(this).is(":checked"))
        //         chatCtrl.updateFavorite(user_id, 1);
        //     else
        //         chatCtrl.updateFavorite(user_id, 0);
        // });
    });

    // app.showLoader();
    //
    // xhr.call({
    //     func: 'chat-details/' + query.id,
    //     method: 'GET'
    // }, function(response) {
    //     console.log('chatCtrl: chatUserDetails', query, response);
    //     if (response.status === 0) {
    //         var info = response.data;
    //         var output = TM.renderTarget('contactDetailsTemplate', info);
    //         $$('#contact-details').html(output);
    //
    //         $$('#chat_notification_mutes').on('change', function(e) {
    //             if ($$(this).is(":checked"))
    //                 chatCtrl.updateMuteNotification(query.id, 1);
    //             else
    //                 chatCtrl.updateMuteNotification(query.id, 0);
    //         });
    //
    //         $$('#add_favorite').on('change', function(e) {
    //             if ($$(this).is(":checked"))
    //                 chatCtrl.updateFavorite(query.id, 1);
    //             else
    //                 chatCtrl.updateFavorite(query.id, 0);
    //         });
    //
    //         app.hideLoader();
    //     }
    // });

},

renderChatWindow: function (page, chat) {
    console.log('chatCtrl', 'renderChatWindow', chat);

    var $page = $$(page.container),
        $navbar = $$(page.navbarInnerContainer),
        currentUser = config.getCurrentUser(),
        userIds = [],
        titleUserNames = [];

    chatCtrl.data.currentChat = chat; //.id;
    chatCtrl.data.currentChatToSMS = false;

    // Collect user IDs and names
    for (var i = 0; i < chat.users.length; i++) {
        userIds.push(chat.users[i].id);
        if (currentUser.id != chat.users[i].user_id)
            titleUserNames.push(chat.users[i].first_name + ' ' + chat.users[i].last_name);

        // Set SMS to chat if user is not a member
        if (!chat.users[i].member) {
            $page.find('.sms-only').show();
            chatCtrl.data.currentChatToSMS = true;
        }
    }

    // Set the chat title if not set
    if (!chat.title) {
        chat.title = util.formatTags(titleUserNames);
    }

    // $.map(chat.users, function(val, i) {
    //     userIds.push(val.id);
    // });

    // Init f7 Messages UI
    if (chatCtrl.data.f7Messages) {
        chatCtrl.data.f7Messages.clean();
        chatCtrl.data.f7Messages.destroy();
    }
    chatCtrl.data.f7Messages = app.f7.messages($page.find('.messages'), {
        autoLayout: true
    });

    // Init f7 Messagebar UI
    if (chatCtrl.data.f7Messagebar) {
        // chatCtrl.data.f7Messagebar.clear();
        chatCtrl.data.f7Messagebar.destroy();
    }
    chatCtrl.data.f7Messagebar = app.f7.messagebar($page.find('.messagebar'));

    $navbar.find('#message-title').html(chat.title);
    $navbar.find('#message-icon').attr('src', chat.icon_url);

    chatCtrl.loadChatMessages(chat.id);
    chatCtrl.bindChatWindow(chat.id);

    $navbar.find('#open-chat-details').on('click', function () {
        window.tommy.view.router.loadPage('views/chat-details.html?chat_id=' + chat.id);
    });
},

onSympleEvent: function (m) {
    var currentUser = config.getCurrentUser(),
        chatId = m.data.chat_id,
        // fromUserId = parseInt(m.from.user),
        isCurrentChat = chatCtrl.data.currentChat &&
            chatCtrl.data.currentChat.id == chatId;

    // TODO: handle events
    if (m.name == 'chat.chat_created') {
    }
    else if (m.name == 'chat.chat_deleted') {
        $$('#chats-recent ul [data-chat-id="' + chatId + '"]').remove();

        // Close chat window if is current chat
        if (isCurrentChat) {
            window.tommy.view.router.back();
        }
    }
    else if (m.name == 'chat.user_joined') {
    }
    else if (m.name == 'chat.user_left') {
    }
},

onSympleMessage: function (m) {
    console.log('chatCtrl: recv message', m);

    var currentUser = config.getCurrentUser(),
        fromUserId = parseInt(m.from.user),
        isCurrentChat = chatCtrl.data.currentChat &&
            chatCtrl.data.currentChat.id == m.chat_id;

    // Handle own messages
    if (currentUser.id == fromUserId) {
        // TODO: Update sent status
        console.log('chatCtrl: dropping own message', m)
        return;
    }

    // Handle messages from current chat
    if (isCurrentChat) {
        console.log('chatCtrl: current chat message', m)
        chatCtrl.data.f7Messages.addMessage({
            text: m.data,
            type: 'received',
            // Avatar and name:
            // avatar: config.getCurrentAvatar(),
            avatar: m.from.icon_url,
            name: m.from.name,
            // Day
            day: !chatCtrl.data.conversationStarted ? 'Today' : false,
            time: !chatCtrl.data.conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
        }, 'append', false);
    }

    // Handle team from inactive chats
    else {
        console.log('chatCtrl: inactive chat message', m)
        app.f7.addNotification({
            // title: 'Tommy',
            title: 'New message from ' + m.from.name,
            message: m.data,
            media: m.from.icon_url ? ('<img class="white-border" src="' + m.from.icon_url + '">') : null,
            hold: 3000
        });

        if (currentTab == 'chats-recent') {
            // TODO: set sender data
            m.message = m.data;
            var output = TM.render('chatListItemTemplate', m);
            var $recent = $$('#chats-recent ul');
            var $current = $recent.find('[data-chat-id="' + m.chat_id + '"]');
            if ($current.length)
                $current.remove();
            $recent.prepend(output);
        }
        else {
            chatCtrl.incrementUnreadMessages();
        }
    }
},

incrementUnreadMessages: function () {
    var $unreadCounter = $$('.unread-messages');
    var numUnread = parseInt($unreadCounter.text());
    $unreadCounter.text(numUnread + 1);
    $unreadCounter.show();
},

resetUnreadMessages: function () {
    var $unreadCounter = $$('.unread-messages');
    $unreadCounter.text(0);
    $unreadCounter.hide();
},

loadChatMessages: function (chat_id) {
    api.getChatMessages(chat_id).then(function (response) {
        console.log('chatCtrl: loadChatMessages', response);
        chatCtrl.addMessagesToUI(response, 'append');
    });
},

toF7Message: function (apiMessage) {
    var date = new Date(apiMessage.created_at);
    var message = {
        text: apiMessage.message,
        name: apiMessage.sender_first_name,
        avatar: apiMessage.sender_icon_url,
        type: apiMessage.sender_id == config.getCurrentUser().id ? 'sent' : 'received',
        day: util.getShortWeekDay(date),
        time: util.getTimeOfDay(date)
    };

    // console.log('chatCtrl: toF7Message', apiMessage, message);

    return message;
},

toF7Messages: function (apiMessages) {
    var transformed = [];
    for (var i = 0; i < apiMessages.length; i++) {
        var framework7mess = chatCtrl.toF7Message(apiMessages[i]);
        transformed.push(framework7mess);
    }
    return transformed;
},

addMessagesToUI: function (messages, method) {
    var f7Messages = this.toF7Messages(messages);
    chatCtrl.data.f7Messages.addMessages(f7Messages, method, false);

    // chatCtrl.data.f7Messages.scrollMessages();
    // $$('.messages-content').scrollTop(0);
    $$('.message-text').on('taphold', function () {
        var clickedLink = this;

        var popoverHTML = '<div class="popover delete-onhold" style="width:180px;">' +
            '<div class="popover-inner">' +
            '<p class="buttons-row"><a href="#" class="button button-round cancel-remove-message">Cancel</a><a href="#" class="button button-round remove-message" data-id="' + $$(clickedLink).attr("data-id") + '">Delete</a></p>' +
            '</div>' +
            '</div>';

        app.f7.popover(popoverHTML, clickedLink);

        $$('.remove-message').on('click', function () {
            var messageId = $$(this).attr("data-id");
            $$('#chat-' + messageId).addClass('removed-message');
            setTimeout(function () {
                $$('#chat-' + messageId).remove();
            }, 1000);
            chatCtrl.removeChat(messageId);
            app.f7.closeModal();
        });

        $$('.cancel-remove-message').on('click', function () {
            app.f7.closeModal();
        });
    });

    $$('.message-text').on('click', function () {
        // var messageId = $$(this).attr("data-id");
        // var $names = $$('#chat-' + messageId + ' .message-name');
        // var $dates = $$('#chat-' + messageId + ' .messages-date');
        // alert($names)
        var $names = $$(this).parents('.messages').find('.message-name');
        var $dates = $$(this).parents('.messages').find('.messages-date');

        if ($names.hasClass('show')) {
            $names.removeClass('show');
            $names.addClass('hide');
        } else {
            $names.removeClass('hide');
            $names.addClass('show');
        }

        if ($dates.hasClass('show')) {
            $dates.removeClass('show');
            $dates.addClass('hide');
        } else {
            $dates.removeClass('hide');
            $dates.addClass('show');
        }
    });

    $$('.modal-overlay-visible').on('click', function () {
        $$(this).hide();
    });
},

// loadPreviousMessage: function(id) {
//     alert('loadPreviousMessage')
//     xhr.call({
//         func: 'chat/' + id + '/' + chatCtrl.data.chatPageNumber,
//         method: 'GET'
//     }, function(response) {
//         console.log('chatCtrl', 'loadPreviousMessage', id, response);
//         if (response.status === 0) {
//             var messages = response.data;
//             chatCtrl.addMessagesToUI(messages, 'prepend');
//             chatCtrl.data.chatPageNumber += 1;
//         }
//     });
// },

// Send welcome messages to new teams
// welcomeBusinessMessage: function() {
//     var messageText = "Thank You! You're now registered as an Team on the Starter plan. I've sent you an email which will help you get started.";
//     var messageType = 'received';
//     var avatar = $$('#message-icon').attr('src');
//
//     setTimeout(function() {
//         chatCtrl.addLocalMessageToUI(messageText, messageType, avatar, false);
//     }, 1000);
//
//     setTimeout(function() {
//         var messageText = "Feel free to send me a message if you have any questions.";
//         var messageType = 'received';
//         chatCtrl.addLocalMessageToUI(messageText, messageType, avatar, false);
//     }, 6500);
//
//     setTimeout(function() {
//         messageText = "To review some FAQ's click here to visit the Tommy Help section.";
//         messageType = 'received';
//         chatCtrl.addLocalMessageToUI(messageText, messageType, avatar, false);
//     }, 10000);
//
//     $("#message-box").focus();
//     chatCtrl.data.conversationStarted = true;
// },

// user for registration
addLocalMessageToUI: function (text, type, avatar, name) {
    // Add message
    chatCtrl.data.f7Messages.addMessage({
        // Message text
        text: text,
        // Random message type
        type: type,
        // Avatar and name:
        // avatar: config.getCurrentAvatar(),
        avatar: avatar,
        name: name,
        // Day
        day: !chatCtrl.data.conversationStarted ? 'Today' : false,
        time: !chatCtrl.data.conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
    }, 'append', false)
},

// bindAddMessage: function(id) {
//
//     // Handle message
//     $$('.messagebar .link').on('click', function() {
//
//         // Message text
//         var messageText = chatCtrl.data.f7Messagebar.value().trim();
//
//         window.client.sendMessage({
//             direct: id,
//             data: messageText
//         });
//
//
//         // Exit if empy message
//         if (messageText.length === 0) return;
//
//         // Empty messagebar
//         chatCtrl.data.f7Messagebar.clear()
//
//         // Random message type
//         var messageType = 'sent';
//
//         // Avatar and name for received message
//         var user = config.getCurrentUser();
//
//         // Add message
//         chatCtrl.data.f7Messages.addMessage({
//             // Message text
//             text: messageText,
//             // Random message type
//             type: messageType,
//             // Avatar and name:
//             // avatar: config.getCurrentAvatar(),
//             avatar: config.getCurrentAvatar(),
//             name: false,
//             // Day
//             day: !chatCtrl.data.conversationStarted ? 'Today' : false,
//             time: !chatCtrl.data.conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
//         }, 'append', false)
//
//         chatCtrl.sendMessage(id, messageText);
//         $("#message-box").focus();
//         window.animateKeyboard = false;
//         // Update conversation flag
//         chatCtrl.data.conversationStarted = true;
//     });
// },

bindChatWindow: function (chat_id) { //, userIds

    // Handle sending messages
    $$('.messagebar .link').on('click', function () {
        var message = chatCtrl.data.f7Messagebar.value().trim();
        if (message.length === 0) return;

        chatCtrl.data.f7Messages.addMessage({
            text: message,
            type: 'sent',
            avatar: config.getCurrentAvatar(),
            name: false,
            day: !chatCtrl.data.conversationStarted ? 'Today' : false,
            time: !chatCtrl.data.conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
        });

        api.sendMessage(chat_id, message, null, chatCtrl.data.currentChatToSMS ? ['sms', 'email'] : null);

        $$("#message-box").focus();

        chatCtrl.data.conversationStarted = true;
        chatCtrl.data.f7Messagebar.clear();
        chatCtrl.data.noActivity = 0;

        // TODO: remove me?
        window.messageUpdated = true;
        window.animateKeyboard = false;
    });
},

// getChats: function(callback) {
//     console.log('chatCtrl: getChats');
//     alert('getChats')
//     xhr.call({
//         func: 'recent-chat/' + chatCtrl.data.lastID,
//         method: 'GET'
//     }, function(response) {
//         var messages = response.data;
//
//         if (messages.length) {
//             chatCtrl.data.noActivity = 0;
//             chatCtrl.addMessagesToUI(messages, 'append');
//         } else {
//             // If no chats were received, increment
//             // the noActivity counter.
//             chatCtrl.data.noActivity++;
//         }
//
//         // Setting a timeout for the next request,
//         // depending on the chat activity:
//         var nextRequest = 1000;
//
//         // 2 seconds
//         if (chatCtrl.data.noActivity > 10) {
//             nextRequest = 2000;
//         }
//
//         // 2 seconds
//         if (chatCtrl.data.noActivity > 15) {
//             nextRequest = 3000;
//         }
//
//         if (chatCtrl.data.noActivity > 20) {
//             nextRequest = 5000;
//         }
//
//         if (chatCtrl.data.noActivity > 25) {
//             nextRequest = 7000;
//         }
//
//         if (chatCtrl.data.noActivity > 30) {
//             nextRequest = 10000;
//         }
//
//         // 15 seconds
//         if (chatCtrl.data.noActivity > 35) {
//             nextRequest = 15000;
//         }
//
//         if (window.tommy.view.activePage.name === 'chat-view')
//             setTimeout(callback, nextRequest);
//         else {
//             chatCtrl.data.noActivity = 0;
//         }
//
//     });
// },

// initNotifications: function() {
//     (function getChatsTimeoutFunction() {
//         chatCtrl.getNotifications(getChatsTimeoutFunction);
//     })();
// },
//
// getNotifications: function(callback) {
//     console.log('chatCtrl: getNotifications');
//     xhr.call({
//         func: 'count-new-chats',
//         method: 'GET'
//     }, function(response) {
//         if (response.status === 0) {
//             var count = response.count;
//             $$("#chat-notification-count").text(count);
//             var nextRequest = 3000;
//             if (window.tommy.view.activePage.name === 'dashboard')
//                 setTimeout(callback, nextRequest);
//         }
//     });
// },

// initNotifications: function() {
//     /* TO DO : end point for number of unread messages
//        - kris - 24/03/16 */
// },

// addFavorite: function(ids) {
//     app.showLoader('Loading', true);
//     console.log('show loader');
//     xhr.call({
//         func: 'chat-add-favorite',
//         method: 'POST',
//         data: {
//             'user_contact_id[]': ids
//         }
//     }, function(response) {
//         if (response.status === 0) {
//             app.hideLoader();
//             util.showSuccessAndReload(true);
//             console.log('hide loader and refresh');
//         } else {
//             app.hideLoader();
//             app.f7.alert(response.message);
//         }
//     });
// },
//
// removeFavorite: function(id) {
//     app.showLoader('Loading', true);
//     xhr.call({
//         func: 'chat-remove-favorite',
//         method: 'POST',
//         data: {
//             'user_contact_id': id
//         }
//     }, function(response) {
//         if (response.status === 0) {
//             app.hideLoader();
//             util.showSuccessAndReload(true);
//
//         } else {
//             app.hideLoader();
//             app.f7.alert(response.message);
//         }
//     });
// },

// DEPRECATED
removeRecentMessage: function (id) {
    app.showLoader('Loading', true);
    xhr.call({
        func: 'chat-remove-recent-message',
        method: 'POST',
        data: {
            'user_contact_id': id
        }
    }, function (response) {
        console.log('chatCtrl: removeRecentMessage', id, response);
        if (response.status === 0) {
            app.hideLoader();
            util.showSuccessAndReload(true);
        }
        else {
            app.hideLoader();
            app.f7.alert(response.message);
        }
    });
},

removeChat: function (id) {
    xhr.call({
        url: config.getApiUrl(),
        func: 'chats/' + id,
        method: 'DELETE'
    }, function (response) {
        console.log('chatCtrl: removeChat', id, response);
        if (response.error) {
            app.f7.alert(response.message);
        }
    });
},

flagOnlineContactsInList: function (contacts) {
    var session, roster = chatClient.client.roster;
    for (i = 0; i < contacts.length; i++) {
        session = roster.findOne({ user_id: contacts[i].user_id });
        contacts[i].online = session && session.online;
        if (contacts[i].online)
            console.log('Contact is online', session)
    }

    return contacts;
},

sortContactsListByAlphabeticIndex: function (contacts) {
    var sorted = {}, keys = [], i;
    contacts = chatCtrl.flagOnlineContactsInList(contacts);
    for (i = 0; i < contacts.length; i++) {
        if (contacts[i].last_name) {
            var firstLetter = contacts[i].last_name.charAt(0).toUpperCase();
            keys.push(firstLetter);
        }
    }
    keys.sort();
    for (i = 0; i < keys.length; i++) {
        sorted[keys[i]] = []
    }
    for (i = 0; i < contacts.length; i++) {
        if (contacts[i].last_name) {
            var firstLetter = contacts[i].last_name.charAt(0).toUpperCase();

            // var firstLetter = contacts[i]
            sorted[firstLetter].push(contacts[i]);
        }
    }
    return sorted;
},

showSelectChatContactsPopup: function () {
    chatCtrl.getAndShowSelectContactsPopup(null, null, function (userIds) {
        api.initiateChat(userIds).then(function (response) {
            window.tommy.view.router.loadPage('views/chat-view.html?chat_id=' + response.id + '&chat_title=' + response.title);
        });
    });
},

showSelectFavoriteContactsPopup: function () {
    api.getContacts({ cache: true }).then(function (response) {
        console.log('chatCtrl', 'showSelectFavoriteContactsPopup', response);
        if (response.length) {

            var selectedIds = [];
            for (var i = 0; i < response.length; i++) {
                if (response[i].favorite)
                    selectedIds.push(response[i].user_id);
            }

            var $popup = chatCtrl.showSelectContactsPopup(response, selectedIds, function (e) {
                var user_id = $$(this).val();
                var favorite = $$(this).is(':checked');
                api.updateContact(user_id, { favorite: favorite }).then(function (response) {
                    console.log('chatCtrl: init: #select-contacts: add favourite contact: ', response);
                });
            }, null, true);

            // var $popup = $$('.popup');
            // for (var i = 0; i < response.length; i++) {
            //     $popup.find('.check-contact[data-id="' + response[i].user_id + '"]').prop('checked', response[i].favorite)
            // }
            // $popup.find('.check-contact').on('change', function(e) {
            //     var user_id = $$(this).val();
            //     var favorite = $$(this).is(":checked");
            //     api.updateContact(user_id, { favorite: favorite }).then(function(response) {
            //         console.log('chatCtrl: init: #select-contacts: add favourite contact: ', response);
            //     });
            // });
            $popup.find('.navbar .center').text('Favorite Contacts');
        } else {
            app.f7.alert('You don\'t have any contacts to favorite.');
        }
    });
},

getAndShowSelectContactsPopup: function (selectedIds, onChange, onClose) {
    api.getContacts({ cache: true }).then(function (response) {
        console.log('chatCtrl', 'showSelectChatContactsPopup', response);
        if (response.length) {
            chatCtrl.showSelectContactsPopup(response, selectedIds, onChange, onClose);
        } else {
            app.f7.alert('You don\'t have any contacts to chat with.');
        }
    });
},

showSelectContactsPopup: function (contacts, selectedIds, onChange, onClose, allowEmpty) {
    var sortedContacts = this.sortContactsListByAlphabeticIndex(contacts);
    console.log('chatCtrl: showSelectContactsPopup', sortedContacts, selectedIds);
    var popupHTML = TM.render('popupChatContactsTemplate', sortedContacts);
    $$('.popup').remove();
    app.f7.popup(popupHTML);
    app.f7.searchbar('.contacts-searchbar', {
        searchList: '.contacts-list',
        searchIn: '.contacts-item-title'
    });

    var $popup = $$('.popup');
    var numSelected = 0;
    var searchBoxPadding = 28;
    var userIds = [];
    // var names = [];

    // if (onChange) {
    //     $popup.find('.check-contact').on('change', onChange);
    // }

    $popup.find('.check-contact').on('change', function (e) {
        // var imgId = $$(this).attr('data-id');
        var $element = $$(this),
            contactId = $element.val(),
            contactName = $element.attr('data-name');
        if ($element.is(':checked')) {
            $element
                .closest('li')
                .addClass('selected-contact');

            $popup.find('.search-avatars').append('<img src="' + $$(this).attr('data-icon') + '" class="circle-pic" id="icon_' + contactId + '">');
            numSelected++;
            searchBoxPadding = searchBoxPadding + 24;
            $popup.find('.search-contact-pop-box').css('padding-left', searchBoxPadding + 'px');
            userIds.push(contactId);
            // names.push(contactName.substr(0, contactName.indexOf(' ')));
        } else {
            $element
                .closest('li')
                .removeClass('selected-contact');

            $popup.find('#icon_' + contactId).remove();
            numSelected--;
            searchBoxPadding = searchBoxPadding - 24;
            $popup.find('.search-contact-pop-box').css('padding-left', searchBoxPadding + 'px');
            userIds.splice(userIds.indexOf(contactId), 1);
            // userIds = $.grep(userIds, function(value) {
            //     return value != contactId;
            // });
            // names = $.grep(names, function(value) {
            //     return value != contactName.substr(0, contactName.indexOf(' '));
            // });
        }

        if (onChange)
            onChange.call(this, e); //();
    });

    $popup.find('.done-select-contact').on('click', function (e) {
        if (allowEmpty === true || userIds.length) {
            if (onClose)
                onClose(userIds)
            app.f7.closeModal();
        } else {
            app.f7.alert('No contacts selected.', 'Tommy');
        }
    });

    if (selectedIds) {
        for (var i = 0; i < selectedIds.length; i++) {
            $popup.find('.check-contact[data-id="' + selectedIds[i] + '"]').prop('checked', true).trigger('change');
        }
    }

    return $popup;
},

            // initFavorites: function() {
            //     app.showLoader();

            //     xhr.call({
            //         func: 'chat-list',
            //         method: 'GET'
            //     }, function(response) {
            //             if (response.status === 0) {
            //                 var chats = response.data;
            //                 var output = TM.renderTarget('chatListTemplate',chats);
            //                 $$('#favorates-cont').html(output);

            //                 $$('.remove-fav-btn').on('click', function() {
            //                     var user_contact_id = $$(this).attr('data-id');
            //                     var li = $$(this).closest('li');
            //                         app.f7.modal({
            //                             text: 'Remove from Favourites?',
            //                             buttons: [{
            //                                 text: 'NO',
            //                                 class: 'small'
            //                             }, {
            //                                 text: 'YES',
            //                                 class: 'big',
            //                                 onClick: function() {
            //                                     chatCtrl.updateFavorite(user_contact_id,0);
            //                                     li.remove();
            //                                 }
            //                             }, ]
            //                         })
            //                 });

            //                 app.hideLoader();
            //             }
            //     });

            // },


            // initList: function() {
            //     // app.showLoader();
            //     this.loadRecentChatMessages(/*'chatListTemplate', */'#message-list-cont');
            //     // xhr.call({
            //     //     func: 'chat-list',
            //     //     method: 'GET'
            //     // }, function(response) {
            //     //     if (response.status === 0) {
            //     //         var chats = response.data;
            //     //         if (chats.length)
            //     //             var output = TM.renderTarget('chatListTemplate', chats);
            //     //         else
            //     //             var ouput = '<img src="nomessage.png" />';
            //     //         $$('#message-list-cont').html(output);
            //     //         app.hideLoader();
            //     //     }
            //     // });
            // },

            // refreshRecent: function() {
            //     if (window.current_page !== 'chat' || window.current_page !== 'index')
            //         return;
            //     this.loadRecentChatMessages('#recent-wrap');
            //     // xhr.call({
            //     //     func: 'chat-list',
            //     //     method: 'GET'
            //     // }, function(response) {
            //     //     if (response.status === 0) {
            //     //         var chats = response.data;
            //     //         if (chats.length)
            //     //             var output = TM.renderTarget('recentChatListTemplate', chats);
            //     //         else
            //     //             var ouput = '<img src="nomessage.png" />';
            //     //         $$().html(output);
            //     //         app.hideLoader();
            //     //     }
            //     // });
            // },

            // updateMuteNotification: function(id, status) {
            //     xhr.call({
            //         func: 'chat-update-notification',
            //         method: 'POST',
            //         data: {
            //             user_contact_id: id,
            //             status: status
            //         }
            //     }, function(response) {
            //         console.log('chatCtrl: updateMuteNotification', id, status);
            //         if (response.status === 0) {
            //             console.log('status updated');
            //         }
            //     });
            // },
            //
            // updateFavorite: function(id, status) {
            //     xhr.call({
            //         func: 'chat-update-favorite',
            //         method: 'POST',
            //         data: {
            //             user_contact_id: id,
            //             status: status
            //         }
            //     }, function(response) {
            //         console.log('chatCtrl: updateFavorite', id, status);
            //         if (response.status === 0) {
            //             console.log('status updated');
            //         }
            //     });
            // },

            // // Initial load
            // stripMessage: function(messageText) {
            //     messageText = $.emoticons.replace(messageText);
            //     if (!(messageText.indexOf('<img') === 0 && messageText.split('<').length === 2 || messageText.indexOf('<span class="emoticon') >= 0)) {
            //         messageText = messageText.replace(/>/g, '&gt;').replace(/</g, '&lt;');
            //     }
            //     messageText.replace(/script/g, 'scr\bipt');
            //     return messageText;
            // },

            // // Format date
            // formatDay: function(d) {
            //     var date = new Date(d);
            //     var weekDay = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')[date.getDay()];
            //     var day = date.getDate();
            //     var month = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')[date.getMonth()];
            //     return weekDay + ', ' + month + ' ' + day;
            // },
            //
            // formatTime: function(d) {
            //     var date = new Date(d);
            //     var hours = date.getHours();
            //     if (hours < 10) hours = '0' + hours;
            //     var mins = date.getMinutes();
            //     if (mins < 10) mins = '0' + mins;
            //     return hours + ':' + mins;
            // },
            //
            // formatDate: function(d) {
            //     return chatCtrl.formatDay(d) + ', <span>' + chatCtrl.formatTime(d) + '</span>';
            // }
        };

return chatCtrl;
    });
