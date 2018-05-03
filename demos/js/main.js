// ......................................................
// .......................UI Code........................
// ......................................................

var inited=0;
var isScreenShared = false;
var mySocket = undefined;
var roomMates = {};

var connection = new RTCMultiConnection();
connection.enableLogs = false;



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
    $('#chatParent').css('display', 'block');
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

document.getElementById('share-file').onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
};

document.getElementById('input-text-chat').onkeyup = function(e) {
    if (e.keyCode != 13) return;
    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;
    connection.send(this.value);
    appendDIV(this.value);
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
            return;
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
            
            mySocket.on('chak oye', function(data){                
                console.log(data);
            });
           
            mySocket.on('to client message', function (data) {
                //console.log(data);
            });
            
            mySocket.on('mate id received', function (data) {
               // roomMates.push(data)
            alert("this is also working");
            });
            
            mySocket.on('receive-room-message', function(data) {
                console.log(data);
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
            
            mySocket.emit('send message to connected users', {
                socketId : mySocket.id,
                roomId: connection.sessionid
             });
             
             mySocket.emit('room-message',{
                roomId: connection.sessionid,
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
            //     roomMates[event.userid] = 3;                
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
    document.getElementById('join-room').disabled = true;
    document.getElementById('room-id').disabled = true;
    document.getElementById('share-screen').disabled = false;
    document.getElementById('record-screen').disabled = false;
    if (inited != 1) {
        setTimeout(recordit, 3000);
        inited = 1;
    }
}

$(function(){
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

