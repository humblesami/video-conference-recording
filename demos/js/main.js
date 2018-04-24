// ......................................................
// .......................UI Code........................
// ......................................................

var inited=0;
var isScreenShared = false;

var connection = new RTCMultiConnection();
connection.enableLogs = false;



// connection.onmessage = function(event) {
//     console.log(event);
// };


document.getElementById('share-screen').onclick = function () {
    if (isScreenShared)
    {
        if(isScreenShared == connection.userid)
            return;

        return;
    }
    this.disabled = true;

    connection.addStream({
        screen: true,
        oneway: true
    });
}

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




// Using getScreenId.js to capture screen from any domain
// You do NOT need to deploy Chrome Extension YOUR-Self!!

connection.getScreenConstraints = function(callback) {
    getScreenConstraints(function(error, screen_constraints) {
        if (!error) {
            screen_constraints = connection.modifyScreenConstraints(screen_constraints);
            console.log(screen_constraints);
            callback(error, screen_constraints);
            return;
        }
        $('#share-screen').prop("disabled", false);
        throw error;
    });
};

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

connection.socketMessageEvent = 'audio-video-screen-demo';

connection.session = {
    audio: true,
    video: true,
    data:true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};


connection.videosContainer = document.getElementById('videos-container');



var cont = false;
$('#remove').click(function () {

});

//chat


// connection.onopen = function(e) { /* e.userid */ };
// connection.onmessage = function(message, userid) {};
//
// // share data with all connected users
// connection.send(file || data || 'text message');
//
// // share data between two unique users (i.e. direct messages)
// connection.channels['user-id'].send(file || data || 'text-message');

// custom signaling gateway
// connection.openSignalingChannel = function(callback) {
//     return io.connect().on('message', callback);
// };

// check existing connections
// connection.check('room-name');

// document.getElementById('setup-new-connection').onclick = function() {
//     connection.setup('room-name');
// };

var roomMates = [];
function isInArray(ar, attr, tofind)
{
    for(i in ar)
    {
        if(ar[i][attr] == tofind[attr])
        {
            return true;
        }
    }
    return false;
}

var mySocket = undefined;
connection.onstream = function(event) {
    if(event.type == "local")
    {
        if(!mySocket)
        {
            mySocket = connection.socket;
            mySocket.on('to client message', function (data) {
                console.log(data);
            });
            mySocket.emit('to server message', {thisperson:'fdfdf', message:"me kuch or send kia tha"});
        }
    }

    // connection.getAllParticipants().forEach(function (participantId) {
    //     var peer = connection.peers[participantId];
    //     if(!peer.onmessage)
    //     {
    //         peer.onmessage = function (data) {
    //             console.log(data);
    //         }
    //     }
    //
    //     if(peer.userid != event.userid)
    //     {
    //         var peerExists = isInArray(roomMates, 'userid', peer);
    //         if(!peerExists)
    //         {
    //             roomMates.push(peer);
    //             console.log(roomMates);
    //         }
    //         //roomMates[0].send(peer.userid +" is there");
    //     }
    //
    //
    //
    //  //   var datas = JSON.stringify(peer.channels);
    //    // console.log(datas);
    // });


    cont = event.roomid;
    if(document.getElementById(event.streamid)) {
        var existing = document.getElementById(event.streamid);
        existing.parentNode.removeChild(existing);
    }
    if(event.stream.isScreen) {
        isScreenShared = event.userid;
        console.log(isScreenShared);
        //$('#share-screen').prop("disabled", true);
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
    if(event.stream.isScreen) {
        isScreenShared = false;
        //$('#share-screen').prop("disabled", false);
    }
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
function checkScreenStatus() {
    connection.getAllParticipants().forEach(function (participantId) {
        var peer = connection.peers[participantId];
        var stream = JSON.parse(JSON.stringify(peer.streams));
        screenStatus = stream[0].isScreen;
        if (screenStatus){
            return participantId;
        }
    });
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
    if (inited != 1) {
        setTimeout(recordit, 3000);
        inited = 1;
    }
}

