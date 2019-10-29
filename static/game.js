var socket = io();
const FPS = 60;
let speed = 7;
socket.on('message', function (data) {
    console.log(data);
});

var movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    tickCount: 0
}
var player = {
    x: 300,
    y: 300,
    tickCount: 0
}
var playerHistory = { 0: { x: player.x, y: player.y } };
var players = {};
var action = {};
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            action['leftM'] = true;
            break;
        case 87: // W
            movement.up = true;
            action['upM'] = true;
            break;
        case 68: // D
            movement.right = true;
            action['rightM'] = true;
            break;
        case 83: // S
            movement.down = true;
            action['downM'] = true;
            break;
    }
    // checkMovement();
    // console.log('Send Move:', movement.tickCount)
});
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            delete action['leftM'];
            break;
        case 87: // W
            movement.up = false;
            delete action['upM'];
            break;
        case 68: // D
            movement.right = false;
            delete action['rightM'];
            break;
        case 83: // S
            movement.down = false;
            delete action['downM'];
            break;
    }
});
setInterval(function () {
    // console.log(action, isEmpty(action))
    if(!isEmpty(action))
        checkMovement();
    tickMovement();
    renderMovement();
    // active = false
}, 1000 / FPS);

const checkMovement = function () {

    if (movement.left) {
        player.x -= speed;
    }
    if (movement.up) {
        player.y -= speed;
    }
    if (movement.right) {
        player.x += speed;
    }
    if (movement.down) {
        player.y += speed;
    }

    movement.tickCount++;
    playerHistory[movement.tickCount] = { x: player.x, y: player.y };

    socket.emit('movement', movement);
}

const tickMovement = function () {
    var now = Date.now(); //29824340000155 29824340000160 5/1000
    var MSHB = (now - lastUpdate)/SHB;
    // lastUpdate = now;
    // console.log(SHB)

    for (var id in players) {
        if (id !== socket.id) {
            // players[id].x = players[id].ox;
            // players[id].y = players[id].oy;

            // let lerpS = 0.05;
            players[id].x = herp(players[id].x, players[id].ox, players[id].nx, speed);
            players[id].y = herp(players[id].y, players[id].oy, players[id].ny, speed);
            // players[id].xx = derp(players[id].x, players[id].ox, players[id].nx, SHB);
            // players[id].yy = derp(players[id].y, players[id].oy, players[id].ny, SHB);
            players[id].xxx = lerp(players[id].ox, players[id].nx, MSHB);
            players[id].yyy = lerp(players[id].oy, players[id].ny, MSHB);
            // console.log('x:', players[id].x, 'nx:', players[id].nx, 'lerpx:', lerp(players[id].ox, players[id].nx, MSHB), 'derpx:', derp(players[id].x, players[id].ox, players[id].nx, SHB));
        }
    }
}

const clamp = function (value, minN, maxN) {
    min = Math.min(minN, maxN);
    max = Math.max(minN, maxN);

    if (value < min) {
        return min;
    }
    else if (value > max) {
        return max;
    }

    return value;
}

const herp = function(num, oNum, nNum, speed) {
    let dist = nNum - oNum;
    dir = dist > 0? 1 : dist < 0? -1: 0;
    num += speed* dir;
    num = clamp(num, oNum, nNum);
    return num;
}

const derp = function(num, oNum, nNum, time) {
    let dist = nNum - oNum;
    let speed = dist/((time/1000)*FPS);
    num += speed;
    num = clamp(num, oNum, nNum);
    return num;
}

const renderMovement = function () {

    context.clearRect(0, 0, 800, 600);
    for (var id in players) {
        var playerss = players[id];
        if (id === socket.id) {
            let history = playerss.tickCount;
            if (playerHistory[history].x !== playerss.x && playerHistory[history].y !== playerss.y) {
                player = playerss;
            }
        } else {
            // context.fillStyle = 'green';
            // context.beginPath();
            // context.arc(playerss.x, playerss.y, 10, 0, 2 * Math.PI);
            // context.fill();
            // context.fillStyle = 'blue';
            // context.beginPath();
            // context.arc(playerss.xx, playerss.yy, 10, 0, 2 * Math.PI);
            // context.fill();
            context.fillStyle = 'purple';
            context.beginPath();
            context.arc(playerss.xxx, playerss.yyy, 10, 0, 2 * Math.PI);
            context.fill();
        }
    }
    context.fillStyle = 'green';
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
}

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
let SHB = 1000/60; //server heartbeat
socket.on('state', function (playerList, theSpeed) {
    if(speed !== theSpeed) speed = theSpeed
    //set time since lastUpdate
    
    var now = Date.now();
    SHB = now - lastUpdate;
    lastUpdate = now;

    //set all waiting
    //send new ones
    //if not sent, delete
    // console.log('fromserver:', playerList)
    for (var id in playerList) {
        if (id !== socket.id) {
            if (!players[id]) {
                players[id] = entity(playerList[id].x, playerList[id].y);
            } else {
                //looking at it's position in the past
                players[id].ox = players[id].nx;
                players[id].oy = players[id].ny;

                players[id].nx = playerList[id].x;
                players[id].ny = playerList[id].y;

                //setting it to the fiture
                // players[id].ox = playerList[id].x;
                // players[id].oy = playerList[id].y;

            }
        } else {
            // console.log(playerHistory[playerList[id].tickCount].x, playerList[id].x);
            let history = playerList[id].tickCount;
            if (playerHistory[history].x !== playerList[id].x || playerHistory[history].y !== playerList[id].y) {
                player = playerList[id];
                // console.log('adjusting player', playerss)
            }
            // console.log(playerList[id])
            // players[id] = playerList[id];
        }
    }


    //no interpolation:
    // players = playerList;
});

const entity = function (x, y) {
    return { x: x || 0, y: y || 0, ox: x || 0, oy: y || 0, nx: x || 0, ny: y || 0 }
}

/*
when server sends state:
each entity oldMan = each entity newMan
each entity newMan = each entity sentMan (sent from server)

forever (if each entity nowMan !== each entity oldMan ) lerp
*/
var lastUpdate = 0;
socket.on('connect', () => {
    if(beenDisconnected) location.reload();
    else {
    lastUpdate = Date.now();
    console.log('has connected to server')
    socket.emit('new player', player);
    }
});

let beenDisconnected = false;
socket.on('disconnect', function (ID) {
    beenDisconnected = true;
    console.log('someone has disconnected:', ID);
    delete players[ID]
})

// Get the linear interpolation between two value
const lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    var value = value1 + (value2 - value1) * amount;
    var val = (value2 - value > -1 && value2 - value < 1) ? value2 : value; //just make value if dont want 
    return val;
    //return value1 + (value2 - value1) * amount;Math.min(Math.max(value, min), max)
}
const lerptest = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    var value = value1 + (value2 - value1) * amount;
    var val = (value2 - value > -1 && value2 - value < 1) ? value2 : value; //just make value if dont want precision lock
    return [val, ((1 - amount) * value1 + amount * value2)];
    //return value1 + (value2 - value1) * amount;Math.min(Math.max(value, min), max)
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}