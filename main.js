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


(function() {
    var canvas,
        context,
        playerImage,
        keys = {};     // pressed keys are in this object
    
    colors = {
        headColor : ['#ffd1ab', '#dfa26f', '#b3723d', '#854917','#522500'],
        bodyColor : ['#74b9ff', '#a29bfe', '#fd79a8', '#00b894', '#63cdda', '#eccc68', '#7bed9f', '#ff4757'],
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


    // Player
    function Player(x, y, headColor, bodyColor) {
        this.x = x;  //first location
        this.y = y;  //
        this.moving = false;  //for animation (cute feet)
        this.headColor = headColor;
        this.bodyColor = bodyColor;
        this.live = false;
        this.sprite = sprite({       
            context: context,
            width:480,
            height:120,
            image: playerImage,
            numberOfFrames: 6,
            ticksPerFrame: 6,
            x : this.x,
            y : this.y
        }) 

        this.barrelX = 0;
        this.barrelY = 0;
        this.damage = 3;
        this.bx=0;
        this.by=0;
        this.bSpeed=15;  // default speed
        this.bxSpeed=0;  // this and next line are for bullets moving
        this.bySpeed=0;
        this.bDirectionSign = +1; // --> +1 or -1, if directionSing is +1, bullet will go right.
        this.bIndex = -1;
        
        this.barrelCooldownTime = 250;
        this.barrelReady = false;
        this.capacityOfMagazine = 10;
        this.bullet = new Array();
        for (var i =0; i<this.capacityOfMagazine; i++) {
            this.bullet[i] = {
                // temporary x, y, xSpeed, ySpeed, directionSign --> those are for drawing
                x : 0,
                y : 0,
                xSpeed : 0,
                ySpeed : 0,
                directionSign: +1,
                ready: true,  //it is ready for firing
                kill : function() {
                    this.ready = true;
                }
            }
        }
        
        //Default ability
        this.speed = 4;
        this.hp = 100;

        // Cursor on the menu
        this.cursorX = this.x+5;
        this.cursorY = this.y-83;
        this.lineIndex= 0;
        this.pixelToJump= 16;
        this.cursorStop = false;
        this.lines = {
                headColor: {x: this.x+5, y: this.y-83, pixelToJump: 16, index: 0, lastIndex : colors.headColor.length},
                bodyColor: {x: this.x+2, y: this.y-53,  pixelToJump: 10, index: 0, lastIndex : colors.bodyColor.length},
                list: ["headColor", "bodyColor"]
        };
        this.currentLine = "headColor";
        this.drawMenuBool = true;
        this.readyToPlay = false;
    };

    // methods
    Player.prototype.move = function(sign, xOrY, bxSpeed, bySpeed, bDirectionSign, barrelX, barrelY) {
        this[xOrY] += sign * this.speed;
        this.sprite[xOrY] = this[xOrY];
        this.moving = true;     // for animation
        
        this.bxSpeed = bxSpeed;
        this.bySpeed = bySpeed;
        this.bDirectionSign = bDirectionSign;
        this.barrelX = barrelX;
        this.barrelY = barrelY;
    }
    
    Player.prototype.fire = function() {
        if((this.barrelReady) && (this.bullet[0].ready)) {
            this.barrelReady = false;
            this.bIndex = (this.bIndex+1 == this.capacityOfMagazine) ? 0 : this.bIndex + 1 ;
            this.bullet[this.bIndex].x = this.barrelX;
            this.bullet[this.bIndex].y = this.barrelY;
            this.bullet[this.bIndex].xSpeed = this.bxSpeed;
            this.bullet[this.bIndex].ySpeed = this.bySpeed;
            this.bullet[this.bIndex].directionSign = this.bDirectionSign;
            this.bullet[this.bIndex].ready = false;

            setTimeout(()=> { // to delay per press
                this.barrelReady = true;
            }, this.barrelCooldownTime);
        }
    }

    Player.prototype.draw = function() {
        // draw head
        drawRectangle(this.x + 20, this.y+5, 40, 35, this.headColor);
        // draw neck
        drawRectangle(this.x + 25, this.y+40, 30, 5, this.headColor);
        // draw body
        drawRectangle(this.x + 5, this.y+45, 70, 60, this.bodyColor);
        this.drawHealtBar();
    }
    Player.prototype.drawHealtBar = function() {
        var barWidth = (this.hp <= 0) ? 0:(70 * this.hp / 100)
        drawRectangle(this.x + 5, this.y - 10, barWidth, 7, "#a5ffa0");
    }
    Player.prototype.drawMenu = function() {
        if(this.drawMenuBool) {
            // draw palet
            var d = 0;     //for only draw colors, I couldn't find appropriate name
            for (var i = 0; i<colors.headColor.length; i++) {
                drawRectangle(this.x+d, this.y - 90, 16, 20, colors.headColor[i]);
                d += 16;
            }
            d = 0;
            for (var i = 0; i<colors.bodyColor.length; i++) {
                drawRectangle(this.x+d, this.y-60, 10, 20, colors.bodyColor[i]);
                d += 10;
            }
            // draw shadows of cursor
            for (var i = 0; i<this.lines.list.length; i++) {
                var line = this.lines[this.lines.list[i]];
                drawRectangle(line.x + line.pixelToJump * line.index, line.y, 6, 6, "grey");
            }
            // draw cursor
            drawRectangle(this.cursorX, this.cursorY, 6, 6, "black");
            if(this.readyToPlay) {
                context.drawImage(readyTicImage, this.x + 3,this.y + 23);
            }
        }
    }
    
    Player.prototype.die = function() {
        this.headColor = "#FF3535";
        this.live = false;
    }

    // this method is for update cursor x-y after changed index by cursorMove and cursorMoveVertical
    Player.prototype.cursorUpdate = function() {
        this.cursorX = this.lines[this.currentLine].x+this.lines[this.currentLine].pixelToJump * this.lines[this.currentLine].index;
        this.cursorY = this.lines[this.currentLine].y;
    }
    // move cursor on horizontal
    Player.prototype.cursorMove = function (sign) {  // sign -1 or +1
        this.readyToPlay = false;
        this.lines[this.currentLine].index += sign;
        // limit control
        if(this.lines[this.currentLine].index == -1) {
            this.lines[this.currentLine].index = this.lines[this.currentLine].lastIndex -1;
        }
        if(this.lines[this.currentLine].index == this.lines[this.currentLine].lastIndex) {
            this.lines[this.currentLine].index = 0;
        }
        this.cursorUpdate();
        this.cursorStop = true;
        this[this.currentLine] = colors[this.currentLine][this.lines[this.currentLine].index];
        setTimeout(() => { // to delay pre press
            this.cursorStop = false;
        }, 125);
    }
    // move cursor on vertical
    Player.prototype.cursorMoveVertical = function (sign) { // sign -1 or +1
        this.readyToPlay = false;
        this.lineIndex += sign;
        // limit control
        if (this.lineIndex == -1) {
            this.lineIndex = this.lines.list.length -1;
        }
        if (this.lineIndex == this.lines.list.length) {
            this.lineIndex = 0;
        }
        this.currentLine = this.lines.list[this.lineIndex];  
        this.cursorUpdate();
        this.cursorStop = true;

        setTimeout(()=> { // to delay per press
            this.cursorStop = false;
        }, 200);
    }

    Player.prototype.readyTicDraw = function() {
        if(this.readyToPlay) {
            context.drawImage(readyTicImage, 0,0);
        }
    }

    // players creating     
    var p1 = new Player(20, canvas.height/2-60, colors.headColor[0], colors.bodyColor[0]);
        p2 = new Player(canvas.width-100, canvas.height/2-60, colors.headColor[0], colors.bodyColor[0]);

    // first barrel and bullet values
    p1.barrelX = p1.x + 70;
    p1.barrelY = p1.y + 35;
    p1.bullet[0].xSpeed = p1.bullet[0].speed;

    p2.barrelX = p2.x + 0;
    p2.barrelY = p2.y + 35;
    p2.bullet[0].xSpeed = -1 * p2.bullet[0].speed;
    
    // the pulse of the player
    var pulseControl = function () {
        if(p1.hp <= 0) {
            p1.die();
        } else if (p2.hp <= 0) {
            p2.die();
        }
    }

    var readyToPlayControl = function () {
        if(p1.readyToPlay && p2.readyToPlay) {
            setTimeout(function() {
                p1.live = true;
                p1.drawMenuBool = false;
                p2.live = true;
                p2.drawMenuBool = false;
                p1.barrelReady = true;
                p2.barrelReady = true;
            },  100);
        }
    }



    

    // testing
    
    /*
     *   these lines are for more sensitive control
     *   the undermentioned object is for the image of the player. These values defined the image's limit
     *   I mentioned it "testing" because I try it
     */ 
    
        var playerHitBox = { 0: [50,30], 5: [20, 60], 6: [20, 60], 7: [20, 60], 8: [20, 60], 9: [20, 60], 10: [20, 60], 11: [20, 60], 12: [20, 60], 13: [20, 60], 14: [20, 60], 15: [20, 60], 16: [20, 60], 17: [20, 60], 18: [20, 60], 19: [20, 60], 20: [20, 60], 21: [20, 60], 22: [20, 60], 23: [20, 60], 24: [20, 60], 25: [20, 60], 26: [20, 60], 27: [20, 60], 28: [20, 60], 29: [20, 60], 30: [20, 60], 31: [20, 60], 32: [20, 60], 33: [20, 60], 34: [20, 60], 35: [20, 60], 36: [20, 60], 37: [20, 60], 38: [20, 60], 39: [20, 60], 40: [20, 60], 41: [25, 55], 42: [25, 55], 43: [25, 55], 44: [25, 55], 45: [5, 75], 46: [5, 75], 47: [5, 75], 48: [5, 75], 49: [5, 75], 50: [5, 75], 51: [5, 75], 52: [5, 75], 53: [5, 75], 54: [5, 75], 55: [5, 75], 56: [5, 75], 57: [5, 75], 58: [5, 75], 59: [5, 75], 60: [5, 75], 61: [5, 75], 62: [5, 75], 63: [5, 75], 64: [5, 75], 65: [5, 75], 66: [5, 75], 67: [5, 75], 68: [5, 75], 69: [5, 75], 70: [5, 75], 71: [5, 75], 72: [5, 75], 73: [5, 75], 74: [5, 75], 75: [5, 75], 76: [5, 75], 77: [5, 75], 78: [5, 75], 79: [5, 75], 80: [5, 75], 81: [5, 75], 82: [5, 75], 83: [5, 75], 84: [5, 75], 85: [5, 75], 86: [5, 75], 87: [5, 75], 88: [5, 75], 89: [5, 75], 90: [5, 75], 91: [5, 75], 92: [5, 75], 93: [5, 75], 94: [5, 75], 95: [5, 75], 96: [5, 75], 97: [5, 75], 98: [5, 75], 99: [5, 75], 100: [5, 75], 101: [5, 75], 102: [5, 75], 103: [5, 75], 104: [5, 75], 105: [5, 75], 106: [25, 55], 107: [25, 55], 108: [25, 55], 109: [25, 55], 110: [25, 55], 111: [25, 55], 112: [25, 55], 113: [25, 55], 114: [25, 55], 115: [25, 55]
        }


    // ^ testing
    
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

    var attackControl = function(off, def, index) {  // off - offensive player , def - defensive player
        // did bullets arrive the rival of its owner?
        // 7 is width and height of bullets
        // I have planned it that bullets like point but now I have changed bullets like square. So I have defined new variables.
        var route, topLineStart, topLineFinish, botLineStart, botLineFinish, topIndex, botIndex;
        if((!off.bullet[index].ready) && isItOnTheLine(off.bullet[index].x, off.bullet[index].x+7, def.sprite.x, def.sprite.x + 80)) {
            if(isItOnTheLine(off.bullet[index].y, off.bullet[index].y+7, def.sprite.y, def.sprite.y + 110)) {
                route = off.bullet[index].y;
                topIndex = route - def.sprite.y;
                topindex = (topIndex>4)? topIndex: 0;
                botIndex = route - def.sprite.y + 7;
                botIndex = (botIndex>4)? botIndex: 0;
                try {   //this is bad code, I will delete try-catch some day!
                    topLineStart = playerHitBox [topIndex][0];
                    topLineFinish = playerHitBox [topIndex][1];
                    botLineStart = playerHitBox [botIndex][0];
                    botLineFinish = playerHitBox [botIndex][1];
                } catch {
                }
                if(isItOnTheLine(off.bullet[index].x, off.bullet[index].x+7, def.sprite.x + topLineStart, def.sprite.x+topLineFinish) ||
                    isItOnTheLine(off.bullet[index].x, off.bullet[index].x+7, def.sprite.x + botLineStart, def.sprite.x+botLineFinish)
                ) {
                    def.hp -= off.damage;
                    off.bullet[index].kill();
                    pulseControl();
                }
            }
        }
    }


    function gameLoop() {

        window.requestAnimationFrame(gameLoop);
        
        // bullets can live inside canvas
        if((p1.bullet[0].x > canvas.width) ||
            (p1.bullet[0].x < 0) ||
            (p1.bullet[0].y > canvas.height) ||
            (p1.bullet[0].y < 0)){ 
                p1.bullet[0].kill();
        }
        if((p2.bullet[0].x > canvas.width) ||
            (p2.bullet[0].x < 0) ||
            (p2.bullet[0].y > canvas.height) ||
            (p2.bullet[0].y < 0)){ 
                p2.bullet[0].kill();
        }


        for (var i = 0; i<p1.capacityOfMagazine; i++) {
            attackControl(p1,p2, i);
        }
        for (var i = 0; i<p2.capacityOfMagazine; i++) {
            attackControl(p2,p1, i);
        }

        

        
        //clear the canvas
        context.clearRect(0,0,canvas.width, canvas.height);

        //draw bullets
        for (var i = 0; i<p1.capacityOfMagazine; i++) {
            if(!p1.bullet[i].ready){   //the bullet going
                p1.bullet[i].x += p1.bullet[i].directionSign * p1.bullet[i].xSpeed;
                p1.bullet[i].y += p1.bullet[i].directionSign * p1.bullet[i].ySpeed;
                drawCircle(p1.bullet[i].x, p1.bullet[i].y, 3.5, "black");
            }
        }
        for ( var i = 0; i<p2.capacityOfMagazine; i++) {
            if(!p2.bullet[i].ready){
                p2.bullet[i].x += p2.bullet[i].directionSign * p2.bullet[i].xSpeed;
                p2.bullet[i].y += p2.bullet[i].directionSign * p2.bullet[i].ySpeed;
                drawCircle(p2.bullet[i].x, p2.bullet[i].y, 3.5, "black");
            }
        }

        //control for animation
        if(p1.moving) {                 
            p1.sprite.update();
        }

        //draw players
        p1.sprite.render();
        p1.draw();
    
        if(p2.moving) {
            p2.sprite.update();
        }
        p2.sprite.render();
        p2.draw();


        // draw menu per frame
        p1.drawMenu();
        p2.drawMenu();

        // this line stop animation when release moving keys
        p1.moving = false;  
        p2.moving = false;

        //console.log(keys);  //for testing

        // player1, to detect keys
        if(p1.live) {
            if (68 in keys) {  // right
                p1.move(+1, "x", p1.bSpeed, 0, 1, p1.x + 70, p1.y + 35);
            } if (65 in keys) {  // left
                p1.move(-1, "x", p1.bSpeed, 0, -1, p1.x + 0, p1.y + 35);
            } if (83 in keys) {  // bottom
                p1.move(+1, "y", 0, p1.bSpeed, 1, p1.x + 35, p1.y + 50);
            } if (87 in keys) {  // top
                p1.move(-1, "y", 0, p1.bSpeed, -1, p1.x + 55, p1.y + 35);
            }
            if (70 in keys) {
                p1.fire();
            }
        } else if(p1.drawMenuBool) {
            if (68 in keys) {  // right
                if(!p1.cursorStop) {
                    p1.cursorMove(1);
                }
            } if (65 in keys) {  // left
                if (!p1.cursorStop) {
                    p1.cursorMove(-1);
                }
            } if (83 in keys) {  // bottom
                if (!p1.cursorStop) {
                    p1.cursorMoveVertical(+1);
                }
            } if (87 in keys) {  // top
                if(!p1.cursorStop) {
                    p1.cursorMoveVertical(-1);
                }
            } if (70 in keys) {
                p1.readyToPlay = true;
                readyToPlayControl();
            }
        }

        // player2, to detect keys
        if (p2.live) {
            if (39 in keys) {   // right
                p2.move(+1, "x", p2.bSpeed, 0, 1, p2.x + 70, p2.y + 35);
            } if (37 in keys) {  // left
                p2.move(-1, "x", p2.bSpeed, 0, -1, p2.x + 0, p2.y + 35);
            } if (40 in keys) { // bottom
                p2.move(+1, "y", 0, p2.bSpeed, 1, p2.x + 35, p2.y + 50);
            } if (38 in keys) { // top
                p2.move(-1, "y", 0, p2.bSpeed, -1, p2.x + 55, p2.y + 35);
            }

            if (106 in keys) {
                p2.fire();
            }
        } else if (p2.drawMenuBool) {
            if (39 in keys) {   // right
                if(!p2.cursorStop) {
                    p2.cursorMove(1);
                }
            } if (37 in keys) {  // left
                if (!p2.cursorStop) {
                    p2.cursorMove(-1);
                }
            } if (40 in keys) { // bottom
                if(!p2.cursorStop) {
                    p2.cursorMoveVertical(+1)
                 }
            } if (38 in keys) { // top
                if(!p2.cursorStop) {
                    p2.cursorMoveVertical(-1);
                }
            } if (106 in keys) {
                p2.readyToPlay = true;
                readyToPlayControl();
            }
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
    
    gameLoop();

}());
    
