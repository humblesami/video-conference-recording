// ......................................................
// .......................UI Code........................
// ......................................................

var inited=0;
var isScreenShared = false;
var mySocket = undefined;
var roomMates = {};

var connection = new RTCMultiConnection();
mySocket = connection.socket;
connection.enableLogs = false;


// connection.socket.emit("get rooms");
// connection.socket.on("get all rooms", function (data) {
//    alert("we goot");
// });

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

var RoomID = '';
var roomsArray = {};

document.getElementById('open-room').onclick = function() {
     
    $('#chatParent').css('display', 'block');
    disableInputButtons();
    connection.open(document.getElementById('room-id').value, function() {
       
        var roomName = document.getElementById('room-id').value;
        $('#av-room').val(connection.sessionid);
        
        mySocket.emit('broadcast to everyone', roomName);
        // mySocket.emit('join-room', {
        //     roomId: RoomID
        // });
        showRoomURL(connection.sessionid);
    });
};

document.getElementById('join-room').onclick = function() {
    
    // disableInputButtons();
    // connection.socket.emit('join-room', {
    //     roomId: RoomID
    // });
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

document.getElementById('share-file').onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
};

// document.getElementById('input-text-chat').onkeyup = function(e) {
//     if (e.keyCode != 13) return;
//     // removing trailing/leading whitespace
//     this.value = this.value.replace(/^\s+|\s+$/g, '');
//     if (!this.value.length) return;
//     connection.send(this.value);
//     appendDIV(this.value);
//     this.value = '';kljjklhgjhggh
// };

//copy
document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    
    mySocket.emit('room-chat',{
        message : this.value,
        roomId: $('#room-id').val()
    });

    this.value = '';
};

var chatContainer = document.querySelector('.chat-output');
var x =1;
function appendDIV(event) {
    x= x+ 1;
    document.getElementById('LinkDisplay').style.display ="block";
    var div = document.createElement('div');
    // div.style.border = "groove";
    // div.style.borderColor ="skyblue";
    div.style.marginBottom ="30px";
    div.style.borderRadius ="15px 50px 30px";
    if(x%2==0){
        div.style.color ="#616061";
        div.style.width ="600px";
        div.style.cssFloat ="left"
        div.style.backgroundColor="#ddd";
        div.style.padding ="10px 100px 10px 25px";

    }
    if(x%2!=0){
        div.style.width ="500px";
        div.style.marginLeft ="990px";
        div.style.cssFloat ="right";
        div.style.color ="white";
        div.style.padding ="10px 100px 10px 30px";
        div.style.backgroundColor ="#8a8585";
    }

    div.innerHTML = event.data || event;
    chatContainer.insertBefore(div, chatContainer.firstChild);
    div.tabIndex = 0;
    div.focus();
    document.getElementById('input-text-chat').focus();

}

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
            return;console.log(data);
        }
        $('#share-screen').prop("disabled", false);
        throw error;
    });
};

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';

connection.socketMessageEvent = 'audio-video-screen-demo';

connection.enableFileSharing = true;

connection.session = {
    audio: true,
    video: true,
    data:true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.onmessage = appendDIV;
connection.filesContainer = document.getElementById('file-container');
connection.videosContainer = document.getElementById('videos-container');

var cont = false;

function isInArray(ar, attr, tofind)
{
    console.log(ar,attr,tofind);
    for(i in ar)
    {
        if(ar[i][attr] == tofind[attr])
        {
            return true;
        }
    }
    return false;
}

var roomatesdiv = undefined;
var additional = 0;
connection.onstream = function(event) {

  
    if(!mySocket && event.type == "local")
    {
      
        mySocket = connection.socket;

        console.log("onstream socket id", mySocket.id);
      
        mySocket.on('chak oye', function(data){
            console.log(data);
        });

        mySocket.on("server room created", function(data){
          
            var mast = JSON.parse(JSON.stringify(data));
            var html = '';
            $('#allroom').html('<p>Click to join room</p>');
            for (var key in mast) {
                html += "<button class='joining-room'>" + key + "</button><p>Click to join room</p><br>";
            }
            $('#allroom').html(html);

        });

        mySocket.on('room exist', function(data){
            if(data.message){
                document.getElementById("room-exists").style.display = "block";
            }
            var mast = JSON.parse(JSON.stringify(data.data));
            var html = '';
            $('#allroom').html('<p>Click to join room</p>');
            for (var key in mast) {
                html += "<button style='margin-left: 5px' class='joining-room'>"+key+"</button><br>";
            }
            $('#allroom').html(html);
        });


        mySocket.on('to client message', function (data) {
            //console.log(data);
        });

        mySocket.on('mate id received', function (data) {


        });

        mySocket.on('receive-room-message', function(data) {
        
                $('#chat-display').html(data);
            // document.getElementById('chat-display').innerHTML =data;
        });

        mySocket.on('mate id left', function (data) {
            //remove from room mates
        });
        mySocket.on('Respond Client request', function (data) {
            //console.log("we got everything required");
        });
        mySocket.on('receive the message', function (data) {
            console.log(data)
        });
        mySocket.emit('share my id', {
            socketId : mySocket.id,
            roomId: connection.sessionid
        });
        mySocket.emit('client request',  {
            userId: event.userid,
            mySocketId: mySocket.id
        });
        
        mySocket.on('roommessage', function (data) {
            alert(data);
        });
        mySocket.emit('send message to connected users', {
            socketId : mySocket.id,
            roomId: connection.sessionid
        });

        mySocket.emit('to server message', {thisperson:'fdfdf', message:"me kuch or send kia tha"});

        mySocket.on('send to everyone', function (data) {
            console.log(data.myId);
        });
    }

    if(!roomMates[event.userid])
    {
        // if(event.userid)
        // {
        //     roomMates[kevent.userid] = 3;
        //     var newDiv =  document.createElement('div');

        //     btnAdd =document.createElement("button");
        //     var name = document.getElementById('name');
        //     btnAdd.innerHTML = event.userid;
        //     btnAdd.setAttribute("class", "socketClass");
        //     newDiv.appendChild(btnAdd);

        //     var inputText = document.createElement("INPUT");
        //     newDiv.appendChild(inputText);
        //     roomatesdiv.appendChild(newDiv);
        // }
    }




    // connection.getAllParticipants().forEach(function (participantId) {
    //
    //     var peer = connection.peers[participantId];
    //     if(peer.userid != event.userid)
    //     {
    //         var peerExists = isInArray( , 'userid', peer);
    //         if(!peerExists)
    //         {
    //             roomMates.push(peer.userid);
    //
    //         }
    //         //roomMates[0].send(peer.userid +" is there");
    //     }
    //
    // });

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
    // document.getElementById('join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('share-screen').disabled = false;
    document.getElementById('record-screen').disabled = false;
    if (inited != 1) {
        setTimeout(recordit, 3000);
        inited = 1;
    }
}

$(function(){

    $("body").on("click", ".joining-room", function() {
        alert(connection.sessionid);
        $('#room-id').val($(this).text());
        mySocket.emit("joinRoom", {
           "leave":connection.sessionid,
           "join": $(this).text(),
           "socket":connection.socket.id
        });
        connection.join($(this).text());

        

        $('#av-room').val(connection.sessionid);
        
    });
    RoomID = $('#room-id').val();
    $("body").on( "click", ".socketClass", function() {
        var sockId = $(this).text();
        var message =  $(this).next().val();
        if(!message)
        {
            $(this).next().focus();
            return;
        }
        var datatosend= {
            userid : sockId,
            message:message
        };
        mySocket.emit('send kar oye', datatosend);
        $(this).next().val('');
    });

    var body = document.getElementsByTagName("body")[0];
    roomatesdiv = document.createElement('div');
    roomatesdiv.setAttribute("class", "roommates");
    body.appendChild(roomatesdiv);

});

