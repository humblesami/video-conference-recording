// ......................................................
            // .......................UI Code........................
            // ......................................................


            var inited=0;
            
            document.getElementById('share-screen').onclick = function() {
                this.disabled = true;
                connection.addStream({
                    screen: true,
                    oneway: true
                });
            };

            document.getElementById('open-room').onclick = function() {
                disableInputButtons();
                connection.open(document.getElementById('room-id').value, function() {
                    showRoomURL(connection.sessionid);
                });
            };

            document.getElementById('join-room').onclick = function() {
                disableInputButtons();
                connection.join(document.getElementById('room-id').value);
            };

            document.getElementById('open-or-join-room').onclick = function() {
                disableInputButtons();
                connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExists, roomid) {
                    if(!isRoomExists) {
                        showRoomURL(roomid);
                    }
                });
            };

            // ......................................................
            // ..................RTCMultiConnection Code.............
            // ......................................................

            var connection = new RTCMultiConnection();
            
            // Using getScreenId.js to capture screen from any domain
            // You do NOT need to deploy Chrome Extension YOUR-Self!!
            connection.getScreenConstraints = function(callback) {
                getScreenConstraints(function(error, screen_constraints) {
                    if (!error) {
                        screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                        callback(error, screen_constraints);
                        return;
                    }
                    throw error;
                });
            };

            // by default, socket.io server is assumed to be deployed on your own URL
            connection.socketURL = '/';

            connection.socketMessageEvent = 'audio-video-screen-demo';

            connection.session = {
                audio: true,
                video: true
            };

            connection.sdpConstraints.mandatory = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true
            };

            connection.videosContainer = document.getElementById('videos-container');
            connection.onstream = function(event) {
                if(document.getElementById(event.streamid)) {
                    var existing = document.getElementById(event.streamid);
                    existing.parentNode.removeChild(existing);
                }
                
                var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;
                
                if(event.stream.isScreen === true) {
                    width = connection.videosContainer.clientWidth - 20;
                }
                
                var mediaElement = getMediaElement(event.mediaElement, {
                    title: event.userid,
                    buttons: ['full-screen'],
                    width: width,
                    showOnMouseEnter: false
                });
                    
                console.log(event);
                if(!event.stream.isScreen || event.type == "remote")
                {
                    connection.videosContainer.appendChild(mediaElement);
                }

                setTimeout(function() {
                    mediaElement.media.play();
                }, 5000);

                mediaElement.id = event.streamid;
            };

            connection.onstreamended = function(event) {
                $('#share-screen').prop("disabled", false);
                var mediaElement = document.getElementById(event.streamid);
                if(mediaElement) {
                    mediaElement.parentNode.removeChild(mediaElement);
                }
            };

            

            // ......................................................
            // ......................Handling Room-ID................
            // ......................................................

            function showRoomURL(roomid) {
                var roomHashURL = '#' + roomid;
                var roomQueryStringURL = '?roomid=' + roomid;

                var html = '<h2>Unique URL for your room:</h2><br>';

                html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
                html += '<br>';
                html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';

                var roomURLsDiv = document.getElementById('room-urls');
                roomURLsDiv.innerHTML = html;

                roomURLsDiv.style.display = 'block';
            }

            (function() {
                var params = {},
                    r = /([^&=]+)=?([^&]*)/g;

                function d(s) {
                    return decodeURIComponent(s.replace(/\+/g, ' '));
                }
                var match, search = window.location.search;
                while (match = r.exec(search.substring(1)))
                    params[d(match[1])] = d(match[2]);
                window.params = params;
            })();

            var roomid = '';
            if (localStorage.getItem(connection.socketMessageEvent)) {
                roomid = localStorage.getItem(connection.socketMessageEvent);
            } else {
                roomid = connection.token();
            }
            document.getElementById('room-id').value = roomid;
            document.getElementById('room-id').onkeyup = function() {
                localStorage.setItem(connection.socketMessageEvent, this.value);
            };

            var hashString = location.hash.replace('#', '');
            if(hashString.length && hashString.indexOf('comment-') == 0) {
              hashString = '';
            }

            var roomid = params.roomid;
            if(!roomid && hashString.length) {
                roomid = hashString;
            }

            if(roomid && roomid.length) {
                document.getElementById('room-id').value = roomid;
                localStorage.setItem(connection.socketMessageEvent, roomid);

                // auto-join-room
                (function reCheckRoomPresence() {
                    connection.checkPresence(roomid, function(isRoomExists) {
                        if(isRoomExists) {
                            connection.join(roomid);
                            return;
                        }

                        setTimeout(reCheckRoomPresence, 5000);
                    });
                })();

                disableInputButtons();
            }

            function disableInputButtons() {
                document.getElementById('open-or-join-room').disabled = true;
                document.getElementById('open-room').disabled = true;
                document.getElementById('join-room').disabled = true;
                document.getElementById('room-id').disabled = true;
                document.getElementById('share-screen').disabled = false;
                document.getElementById('record-screen').disabled = false;
                if(inited!=1)
                {
                    setTimeout(recordit, 3000);
                    inited = 1;
                }
            }
