'use strict'

var express = require('express');
var app = express();

var http  = require('http').createServer(app);
var io = require('socket.io')(http);

app.use('/css',express.static('css'));
app.use('/js',express.static('js'));
app.use('/img',express.static('img'));

app.get('/',function(request,response){
    response.sendFile(__dirname +'/index.html');
});

app.get('/alice',function(request,response){
    response.sendFile(__dirname+"/alice.html")
});

app.get('/bob',function(request,response){
    response.sendFile(__dirname+"/bob.html")
});

console.log(__dirname)

io.on('connection',function(socket){
    console.log('有用户加入进来');
    socket.on('signal',function(message){
        socket.to('room').emit('signal',message);
    });

    socket.on('ice',function(message){
        socket.to('room').emit('ice',message);
    });

    socket.on('create or join',function(room){
        var clientsInRoom = io.sockets.adapter.rooms[room];
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
        console.log(numClients);
        if(numClients===0){
            socket.join(room);
            socket.emit('create', room, socket.id);
            console.log('caller joined');
        }else if(numClients===1){
            socket.join(room);
            socket.to('room').emit('call');
            console.log('callee joined');
        }
    });
});

var server = http.listen(8080,function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(server.address())
    console.log('??', host, port)
    console.log(`listening on:http://${host}:${port}`);
});