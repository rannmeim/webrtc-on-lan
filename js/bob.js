'use strict'

var remoteVideo = document.getElementById('remote_video');

var socket = io.connect();

var config = {
    'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
    }]
};

var pc;

socket.emit('create or join', 'room');

socket.on('join', function (room, id) {
    console.log('bob加入房间');
});

socket.on('signal', function (message) {
    pc = new RTCPeerConnection(config);
    pc.setRemoteDescription(new RTCSessionDescription(message));
    pc.createAnswer().then(function (answer) {
        console.log('bob offer', offer)
        pc.setLocalDescription(answer);
        socket.emit('signal', answer);
    });

    pc.addEventListener('icecandidate', function (event) {
        console.log('bob icecandidate', event.candidate)
        var iceCandidate = event.candidate;
        if (iceCandidate) {
            socket.emit('ice', iceCandidate);
        }
    });

    pc.addEventListener('addstream', function (event) {
        console.log('bob addstream', event)
        remoteVideo.srcObject = event.stream;
    });
});

socket.on('ice', function (message) {
    pc.addIceCandidate(new RTCIceCandidate(message));
});