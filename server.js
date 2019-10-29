// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io'); var app = express();
var server = http.Server(app);
var io = socketIO(server); app.set('port', process.env.PORT || 5000);
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

// Add the WebSocket handlers
var players = {};
const speed = 2;
const FPS = 1000/60;
io.on('connection', function (socket) {
    socket.on('new player', function (data) {
        players[socket.id] = data;
        console.log(data)
        //{
        //     x: 300,
        //     y: 300
        // };
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= speed;
        }
        if (data.up) {
            player.y -= speed;
        }
        if (data.right) {
            player.x += speed;
        }
        if (data.down) {
            player.y += speed;
        }
        player.tickCount = data.tickCount;
    });
    socket.on('disconnect', function () {
        // io.x
        // remove disconnected player
        delete players[socket.id]
    });
});
setInterval(function () {
    io.emit('state', players, speed);
    // console.log('fromserver:', players);s
}, FPS);//1000 / 60

