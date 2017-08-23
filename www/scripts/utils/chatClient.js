define(['config','symple','sympleClient'], function(config) { //'socketio',

    var chatClient = {
        client: null,

        connect: function() {
            if (chatClient.client) {
                alert('Chat client already initialized');
                return;
            }

            var currentUser = config.getCurrentUser();
            if (!currentUser) {
                alert('Chat client required an active user');
                return;
            }

            chatClient.client = new Symple.Client({
                url: config.getChatServerUrl(),
                token: config.getSessionToken(),
                peer: {
                    user: currentUser.id + '',
                    name: currentUser.first_name + ' ' + currentUser.last_name
                }
            });

            console.log('chatClient: peer:', chatClient.client.options.peer)

            chatClient.client.on('message', function(m) {
                console.log('chatClient: message:', m)
            });

            chatClient.client.on('announce', function(peer) {
                console.log('chatClient: announce:', peer)

                // The user has successfully authenticated
                // Join the current team room (if any)
                var currentTeamId = config.getCurrentTeamId();
                if (currentTeamId)
                    chatClient.client.join('team-' + currentTeamId);
            });

            chatClient.client.on('presence', function(p) {
                console.log('chatClient: presence:', p)

                // Captures a presence message broadcast by a peer
            });

            chatClient.client.on('command', function(c) {
                console.log('chatClient: command:', c)

                // Captures a command send from a remote peer
            });

            chatClient.client.on('event', function(e) {
                console.log('chatClient: event:', e)

                // Captures an event broadcast from a remote peer
            });

            chatClient.client.on('error', function(error, message) {
                console.log('chatClient: error:', error, message)

                // Connection or authentication failed
                if (error == 'connect') {
                    // Authentication faichatClient: led
                } else if (error == 'connect') {
                    // Connection failed
                }
            });

            chatClient.client.on('disconnect', function() {
                console.log('chatClient: disconnected')

                // Disconnected from the server
            });

            chatClient.client.on('addPeer', function(peer) {
                console.log('chatClient: add peer:', peer)

                // A peer connected
            });

            chatClient.client.on('removePeer', function(peer) {
                console.log('chatClient: remove peer:', peer)

                // A peer disconnected
            });

            chatClient.client.connect();
        },

        disconnect: function() {
            if (chatClient.client) {
                chatClient.client.disconnect();
                chatClient.client = null;
            }
        }
    };

    return chatClient;
});
