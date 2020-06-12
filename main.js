/* 
 * oneGunTwoSpells
 */
 
(function() {
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    // MIT license

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o']; 
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) 
        window.requestAnimationFrame = function(callback, element) { 
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall); 
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var canvas,
    context,
    playerImage,
    keys = {};     // pressed keys are in this object

var guns = [];
guns[0] = {
    position: [[60, 45],  // right
               [25,20],   // top
               [-17,43],  // left
               [20, 55],  // bot
               [45,18],  // topRi
               [5,17],  // topLe
               [-8, 60],  // botLe
               [55,60]], // botRi
    barrelPosition: [[93, 52], // right  
                     [38, 15], // top
                     [-20,52], // left
                     [34,87],  // bot
                     [72,15],  // topRi
                     [3,14],  // topLe
                     [-13,89],  // botLe
                     [89,89]], // botRi     // for right, top, left, bottom
    subRectanglePosition: [[7,0],   // right
                          [43,0],   // top
                          [76, -2], // left
                          [112,0],  // bot
                          [146,4],  // topRi
                          [270,2],  // topLe
                          [224,0],  // botLe
                          [182,0]], // botRi
};

//Get canvas
canvas = document.getElementById("canvas");
context = canvas.getContext("2d");

canvas.width = $(document).width() - 50;
canvas.height = $(document).height() - 50;



playerImage = new Image();
playerImage.src = "images/feet.png";

readyTicImage = new Image();
readyTicImage.src = "images/ready-tic.png";

gunImage = new Image();
gunImage.src = "images/gun-all-position-2.png";

var Point = function(x, y) {
    this.x = x;
    this.y = y;
}
function Rectangle(x, y, wid, hei, color) {  // color geçici sonra silicem, şimdi test amaçlı
    this.x = x;
    this.y = y;
    this.width = wid;
    this.height = hei;
    this.color = color;
    this.points = {
        topLe: new Point(this.x, this.y),
        topRi: new Point(this.x + this.width, this.y),
        botLe: new Point(this.x, this.y + this.height),
        botRi: new Point(this.x + this.width, this.y + this.height),
    }
}
Rectangle.prototype.updatePosition = function (x, y) {
    this.x += x;
    this.y += y;
    this.points.topLe.x += x;
    this.points.topRi.x += x;
    this.points.botLe.x += x;
    this.points.botRi.x += x;
    this.points.topLe.y += y;
    this.points.topRi.y += y;
    this.points.botLe.y += y;
    this.points.botRi.y += y;
}
Rectangle.prototype.teleport = function (x , y) {
    x -= this.x;
    y -= this.y;
    this.updatePosition(x,y);
}

Rectangle.prototype.draw = function() {
    drawRectangle(this.x, this.y, this.width, this.height, this.color);
}

// functions
var isPointInRect = function(point, rectangle, recoveryPixel) {
    recoveryPixel = recoveryPixel || 0;
    if ((point.x + recoveryPixel > rectangle.x) && (point.x < rectangle.x + rectangle.width) && (point.y + recoveryPixel > rectangle.y) && (point.y < rectangle.y + rectangle.height)){
        //console.log("inside");
        return true;
    } else {
        //console.log("outside");
        return false;
    }
}
var isRectInRect = function(rec, rec2) {
    var key = false;
    if(isPointInRect(rec.points.topLe, rec2) ||
       isPointInRect(rec.points.topRi, rec2) ||
       isPointInRect(rec.points.botLe, rec2) ||
       isPointInRect(rec.points.botRi, rec2)) {
        //console.log("inside");
        key = true;
    } else if(isPointInRect(rec2.points.topLe, rec) ||
       isPointInRect(rec2.points.topRi, rec) ||
       isPointInRect(rec2.points.botLe, rec) ||
       isPointInRect(rec2.points.botRi, rec)) {
        //console.log("inside");
        key = true;
    }
    return key;
}

// ^ functions


// Bullet
function Bullet(calibre, color) {
    this.directionSign = {x: 0, y: 0}; // -1 or +1
    this.calibre = calibre;
    this.speed = {x: 0, y:0};
    this.hitbox = new Rectangle(0, 0, calibre, calibre, color);
    this.ready = true;  //it is ready for firing
}
Bullet.prototype.kill = function() {
    this.ready = true;
}

g1 = {capOfMag: 6, damage: 3, calibre: 6, bColor: "purple", barCool: 250, magCool: 3000, bSpeed : 15, image: gunImage };
// Gun
function Gun(arr) { 
    this.capOfMag = arr.capOfMag  // capOfMag - capacityOfMagazine
    this.damage = arr.damage;
    this.calibre = arr.calibre;
    this.bColor = arr.bColor;
    this.bSpeed = arr.bSpeed;
    this.speedBuffer = {x: 0, y:0};
    this.barCool = arr.barCool; // barCool - barrelCooldown
    this.magCool = arr.magCool; // magCool - magazineCooldown
    this.isMagOkey = true; // is magazine okey?
    this.bulInd = 0; // the bullet is waiting for firing

    this.lenBarCool = 70;  // length of remaining barrel cooldown
    this.lenMagCool = 70;  // length of remaining magazine cooldown
    this.decBarCoolPF = 70 / (this.barCool / 1000 * 60);  // decreasing quantity per frame
    this.decMagCoolPF = 70 / (this.magCool /1000* 60);  // decreasing quantity per frame
    
    // for firing mechanic 
    this.readyToFire = true;
    this.barrel = {x: 0, y : 0};
    
    this.image = arr.image;
    this.bullets = new Array();
    for (i = 0; i<this.capOfMag; i++) {
        this.bullets[i] = new Bullet(this.calibre, this.bColor);
    }
}

Gun.prototype.fire = function() {
    if(this.readyToFire)  { 
        //console.log("bang bang");
        this.readyToFire = false;
        this.bullets[this.bulInd].hitbox.teleport(this.barrel.x, this.barrel.y);
        this.bullets[this.bulInd].speed.x = this.speedBuffer.x;
        this.bullets[this.bulInd].speed.y = this.speedBuffer.y;
        this.bullets[this.bulInd].ready = false;
        this.bulInd++;
        this.lenMagCool = 70;
        if(this.bulInd==this.capOfMag) {
            this.isMagOkey = false;
            this.lenBarCool = 70;
            setTimeout(()=> {
                this.bulInd = 0;
                this.isMagOkey = true;
                this.readyToFire = true;
            },this.magCool);
        } else {
            setTimeout(()=> {
                this.readyToFire = true;
            }, this.barCool);
        }
    }
}

Gun.prototype.drawBul = function() {
    for(b = 0; b<this.bullets.length; b++) {
        if(!this.bullets[b].ready){
            this.bullets[b].hitbox.draw();
            this.bullets[b].hitbox.updatePosition(this.bullets[b].speed.x, this.bullets[b].speed.y);
        }
    }
}

// Model
function Model(arr) {
    this.x = 0;
    this.y = 0;
    this.hitboxes = new Array();
    for(i = 0; i<arr.length; i++) {
        this.hitboxes[i] = new Rectangle(arr[i].x,  arr[i].y, arr[i].width, arr[i].height, arr[i].color);
    }
}
Model.prototype.updatePosition = function(x, y) {
    this.x += x;
    this.y += y;
    this.direction;  //right, top, left, bot
    // updating hitboxes
    for(i = 0; i<this.hitboxes.length; i++) {
        this.hitboxes[i].updatePosition(x, y); // --> parantezlerin içi ne olması gerekiyor kafam basmadı
    }
}

m1 = [{x: 20, y: 5, width:40, height: 35, color: "#dea16f"}, {x: 25, y: 40, width: 30, height: 5, coor: "#dea16f"}, {x: 5, y: 45, width: 70, height: 60, color: "#1d1d1d"}];
m2 = [{x: 25, y: 5, width:40, height: 35, color: "#dea16f"}, {x: 27, y: 40, width: 30, height: 5, coor: "#dea16f"}, {x: 5, y: 45, width: 70, height: 60, color: "#005691"}];

// Player
function Player(x, y, /*headColor, bodyColor,*/ m, g) {
    this.rival;
    this.keys = [] //right, top, left, bottom, fire
    this.x = x;  //first location
    this.y = y;  //
    this.moving = false;  //for animation (cute feet)
    this.imageWidth = 80;
    this.imageHeight = 120;
    this.live = false;

    this.model = new Model(m);
    this.model.updatePosition(this.x, this.y);
    this.gun = new Gun(g);
    this.sprite = sprite({       
        context: context,
        width:480,
        height:120,
        image: playerImage,
        numberOfFrames: 6,
        ticksPerFrame: 6,
        x : this.model.x,
        y : this.model.y
    }) 

    this.gunIndex = 0;
    
    //Default ability
    this.speed = 4;
    this.hp = 100;

};

// methods
Player.prototype.move = function(x, y) {
    this.moving = true;     // for animation
    if((this.model.x + this.speed) < 0) {
        this.model.updatePosition(1, 0);
    } else if((this.model.x + this.speed + 70) > canvas.width) {   // I will define called 'width' and 'height' in Model class for this line
        this.model.updatePosition(-1, 0);
    } else if((this.model.y + this.speed + -30) < 0) {   
        this.model.updatePosition(0, 1);
    } else if((this.model.y + this.speed + 120) > canvas.height) {   // I will define called 'width' and 'height' in Model class for this line
        this.model.updatePosition(0, -1);
    } else {
        this.model.updatePosition(x, y);
        this.updateSpritePosition();
        this.updateBarrelPosition();
    }
}

Player.prototype.updateBarrelPosition = function() {
    var X, Y;
    if ((this.keys[0] in keys) && (this.keys[1] in keys)) {   // top - right 
        X = this.gun.bSpeed; Y = - this.gun.bSpeed;
        this.changeRouteOfBarrel(4);
    } else if ((this.keys[0] in keys) && (this.keys[3] in keys)) {   // bottom - right
        X = this.gun.bSpeed; Y = this.gun.bSpeed;
        this.changeRouteOfBarrel(7);
    } else if ((this.keys[2] in keys) && (this.keys[1] in keys)) {   // top - left
        X = - this.gun.bSpeed; Y = - this.gun.bSpeed;
        this.changeRouteOfBarrel(5);
    } else if ((this.keys[2] in keys) && (this.keys[3] in keys)) {   // bottom - left
        X = - this.gun.bSpeed; Y = + this.gun.bSpeed;
        this.changeRouteOfBarrel(6);
    } else if (this.keys[0] in keys) {  // right
        X = this.gun.bSpeed; Y = 0;
        this.changeRouteOfBarrel(0);
    } else if (this.keys[2] in keys) {  // left
        X = - this.gun.bSpeed; Y = 0;
        this.changeRouteOfBarrel(2);
    } else if (this.keys[3] in keys) {  // bottom);
        X = 0; Y = this.gun.bSpeed;
        this.changeRouteOfBarrel(3);
    } else if (this.keys[1] in keys) {  // top
        X = 0; Y = - this.gun.bSpeed;
        this.changeRouteOfBarrel(1);
    }

    this.gun.speedBuffer.x = X;
    this.gun.speedBuffer.y = Y;
}
Player.prototype.updateSpritePosition = function() {
    this.sprite.x = this.model.x;
    this.sprite.y = this.model.y;
}

Player.prototype.attackControl = function() {
    for(i = 0; i<this.gun.bullets.length; i++) {
        if(!this.gun.bullets[i].ready) {
            for(j = 0; j<this.rival.model.hitboxes.length; j++) {
                if(isRectInRect(this.gun.bullets[i].hitbox, this.rival.model.hitboxes[j])) {
                    this.rival.hp -= this.gun.damage;
                    this.gun.bullets[i].kill();
                    if(this.rival.hp<0) {
                        this.rival.live = false;
                    }
                }
            }
        }
    }
}

Player.prototype.changeRouteOfBarrel = function(barrelIndex) { 
    this.barrelIndex = barrelIndex;
    this.gun.barrel.x = this.model.x + guns[this.gunIndex].barrelPosition[this.barrelIndex][0];
    this.gun.barrel.y = this.model.y + guns[this.gunIndex].barrelPosition[this.barrelIndex][1];
}

Player.prototype.fire = function() { // old system
    if(this.barrelReady) {
        this.barrelReady = false;
        this.bullet[this.bIndex].x = this.barrelX;
        this.bullet[this.bIndex].y = this.barrelY;
        this.bullet[this.bIndex].xSpeed = this.bxSpeed;
        this.bullet[this.bIndex].ySpeed = this.bySpeed;
        this.bullet[this.bIndex].directionSign = this.bDirectionSign;
        this.bullet[this.bIndex].ready = false;
        this.timerBarToCooldownBarrel = 70;

        this.bIndex += 1;
        if(this.bIndex == this.capacityOfMagazine) {
            this.bIndex = 0;
            this.isMagazineOkey = false;
            this.delayTime = this.fillMagazineTime;
        }

        setTimeout(()=> { // to delay per press
            this.isMagazineOkey = true;
            this.timerBarToFillMagazine = 70;
            this.barrelReady = true;
            this.delayTime = this.barrelCooldownTime;
        }, this.delayTime);
    }
}

Player.prototype.draw = function() {
    // draw model
    for(a = 0; a<this.model.hitboxes.length; a++) { // i yapınca patlıyor
        this.model.hitboxes[a].draw();
    }
    this.drawHealtBar();
    this.drawCooldownBarrelBar();
    this.drawMagBar();
    // draw gun
    context.drawImage(gunImage,
        guns[this.gunIndex].subRectanglePosition[this.barrelIndex][0],
        guns[this.gunIndex].subRectanglePosition[this.barrelIndex][1],
        35,35,
        this.model.x + guns[this.gunIndex].position[this.barrelIndex][0],
        this.model.y + guns[this.gunIndex].position[this.barrelIndex][1],
        35,35
    );
}
Player.prototype.drawHealtBar = function() {
    var barWidth = (this.hp <= 0) ? 0:(70 * this.hp / 100)
    drawRectangle(this.model.x + 5, this.model.y - 20, barWidth, 7, "#a5ffa0");
}
Player.prototype.drawMagBar = function () {
    if(this.gun.isMagOkey) {
        var block = 70 / this.gun.capOfMag;
        var blockCenter = block/2;
        for (var i = 0; i<this.gun.capOfMag-this.gun.bulInd; i++) {  // current size of bullets
            // drawing bullets
            drawCircle(this.model.x + 5 + block*i+blockCenter-2, this.model.y - 10, 2, "#555");
        }
    } else {
        // drawing cooldown bar
        drawRectangle(this.model.x+5, this.model.y - 10, this.gun.lenBarCool , 4, "#BBB");
        this.gun.lenBarCool -= this.gun.decMagCoolPF;
    }
}
Player.prototype.drawCooldownBarrelBar = function() {
    if (!this.gun.readyToFire && this.gun.isMagOkey) {
        drawRectangle(this.model.x + 5, this.model.y - 10, this.gun.lenMagCool, 4, "#BBB");
        this.gun.lenMagCool-= this.gun.decBarCoolPF;
    }
}

Player.prototype.die = function() {
    this.live = false;
}

// draw tools
var drawRectangle = function (x, y, width, height, color) {
    context.beginPath();
    context.moveTo(x, y+(height/2));
    context.lineTo(x+width, y+(height/2));
    context.lineWidth = height;
    context.strokeStyle = color;
    context.stroke();
}
var drawCircle = function (x,y, radius, color) {
    context.beginPath();
    context.arc(x+radius,y+radius,radius, 0, 2 * Math.PI, false); 
    context.fillStyle = color;
    context.fill();
}

var isItOnTheLine= function(itsStart, itsFinish, lineStart, lineFinish) {
    if((itsFinish > lineStart) && (itsStart < lineFinish)) {
        return true;
    } else {
        return false;
    }
}

// I found it from
// http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
// and I changed some piece of it
function sprite (options) {

    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;
    
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.x = options.x;
    that.y = options.y;
    that.image = options.image;
    that.scaleRatio = 1;
    
    that.update = function () {

        tickCount += 1;

        if (tickCount > ticksPerFrame) {

            tickCount = 0;
            
            // If the current frame index is in range   
            if (frameIndex < numberOfFrames - 1) {	
                // Go to the next frame
                frameIndex += 1;
            } else {
                frameIndex = 0;
            }
        }
    };
    
    that.render = function () {

      // Draw the animation
      that.context.drawImage(
        that.image,
        frameIndex * that.width / numberOfFrames,
        0,
        that.width / numberOfFrames,
        that.height,
        that.x,
        that.y,
        that.width / numberOfFrames * that.scaleRatio,
        that.height * that.scaleRatio);
    };
    
    that.getFrameWidth = function () {
        return that.width / numberOfFrames;
    };
    
    return that;
}
// I found it from
// http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
// and I changed some piece of it
    
$(document).keydown(function (e) {
 keys[e.which] = true;
    
});
 $(document).keyup(function (e) {
     delete keys[e.which];
 });



