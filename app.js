var express = require('express');
var app = express();
var serv = require('http').Server(app);
var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
var doISTOPNOW = false;
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");
 
var SOCKET_LIST = {};
var PLAYER_LIST = {};
 

var maxSpeed = 10;
var Player = function(id){
    var self = {
        //creating a random x and y;
        x:(Math.floor(180 * Math.random()) * 10) + 100,
        y:(Math.floor(80 * Math.random()) * 10) + 100,
        id:id,
        number:"" + Math.floor(10 * Math.random()),
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10,
        xCords:[],
        yCords:[],
        colors:CSS_COLOR_NAMES[Math.floor(Math.random()*CSS_COLOR_NAMES.length)],
    }
    self.updatePosition = function(){

        if(self.pressingRight || self.pressingLeft || self.pressingUp || self.pressingDown){
            self.xCords.push(self.x);
            self.yCords.push(self.y);
            //console.log("New Entry At: " + self.x + " " + self.y);
        }

        if(self.pressingRight)
            self.x += self.maxSpd; 
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
        for(var i in PLAYER_LIST){
            for(var j = 0; j < PLAYER_LIST[i].xCords.length; j++){
                if(PLAYER_LIST[i].xCords[j] == self.x && PLAYER_LIST[i].yCords[j] == self.y){
                    doISTOPNOW = true;
                }
            }
        }
        if(doISTOPNOW){
            console.log(self.id);

            delete SOCKET_LIST[self.id];
            delete PLAYER_LIST[self.id];
            doISTOPNOW = false;
        }


    }
    return self;
}
 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    console.log("New Player Connected");
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
 
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    console.log(player.colors);
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
    socket.on('destoryPlayer', function(data){
        //console.log("Loading method");
        console.log(data.inputId);
        if(data.inputId === 'player'){
        //console.log("Before Scan");

           for(var i in PLAYER_LIST){
            //console.log("Player scanning");
            //console.log(player.id + " " + data.state);
                if(player.id === data.state){
                    console.log("Player removed");
                    delete SOCKET_LIST[socket.id];
                    delete PLAYER_LIST[socket.id];
                }
            }
        }
        
        
    });
    socket.on('keyPress',function(data){
        if(data.inputId === 'left'){
            player.pressingLeft = data.state;
            player.pressingRight = false;
            player.pressingUp = false;
            player.pressingDown = false;}
            

        if(data.inputId === 'right'){
            player.pressingRight = data.state;
            player.pressingLeft = false;
            player.pressingUp = false;
            player.pressingDown = false;
        }
        if(data.inputId === 'up'){
            player.pressingUp = data.state;
            player.pressingLeft = false;
            player.pressingRight = false;
            player.pressingDown = false;
        }
        if(data.inputId === 'down'){
            player.pressingDown = data.state;
            player.pressingLeft = false;
            player.pressingRight = false;
            player.pressingUp = false;
        }


    });
   //NOTE NOW ADD TGAT PRESSING DOWN IS FLAESIE ON ALL OTHER CASES>
   
});
 
setInterval(function(){
    var pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition(); //change cords based on position;
        pack.push({
            id:player.id,
            x:player.x,
            y:player.y,
            number:player.number,
            loopAmount:player.xCords.length,
            xCords:player.xCords,
            yCords:player.yCords,
            color:player.colors,
        }); 
        
    }
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
//    if(doISTOPNOW){
        //console.log("YOU MESSED UP");

//  }
   
   
   
},1000/25);