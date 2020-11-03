'use strict'

var localVideo = document.getElementById('local_video');

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');

var pc;
var localStream;
var socket = io.connect();

var config = {
    'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
    }]
};

const offerOptions = {
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1
};

callButton.disabled = true;
hangupButton.disabled = true;

startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

function startAction() {
    console.log(navigator.mediaDevices)
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (mediastream) {
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true }).then(function (mediastream) {
        localStream = mediastream;
        localVideo.srcObject = mediastream;
        startButton.disabled = true;
    }).catch(function (e) {
        console.log(JSON.stringify(e));
    });
}

socket.on('create', function (room, id) {
    console.log('alice创建聊天房间');
    console.log(room + id);
});

socket.on('call', function () {
    callButton.disabled = false;
});

socket.on('signal', function (message) {
    if (pc !== 'undefined') {
        pc.setRemoteDescription(new RTCSessionDescription(message));
        console.log('remote answer');
    }
});

socket.on('ice', function (message) {
    if (pc !== 'undefined') {
        pc.addIceCandidate(new RTCIceCandidate(message));
        console.log('become candidate');
    }
});

socket.emit('create or join', 'room');

function callAction() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    pc = new RTCPeerConnection(config);
    // pc = new RTCPeerConnection();
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    pc.createOffer(offerOptions).then(function (offer) {
        pc.setLocalDescription(offer);
        socket.emit('signal', offer);
    });
    pc.addEventListener('icecandidate', function (event) {
        var iceCandidate = event.candidate;
        if (iceCandidate) {
            socket.emit('ice', iceCandidate);
        }
    });
}

function hangupAction() {

    localStream.getTracks().forEach(track => track.stop());
    pc.close();
    pc = null;
    hangupButton.disabled = true;
    callButton.disabled = true;
    startButton.disabled = false;

}