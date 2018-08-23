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
        keys = {};
    
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

    bulletImage = new Image();
    bulletImage.src = "images/bullet.png";
    
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


        /*          //this block have a spoiler
        this.bulletLen = 5;
        this.bullets = new Array();
        this.bulletIndex = -1;
        for (var i=0; i<this.bulletLen; i++) {
            this.bullets[i] = {
                index:i,
                fire: false,
                x : 0,
                y : 0,
                kill : function() {
                    this.fire = true;
                },
                image: "image will come here"
            }
        };
         *
         * multiple bullet not now
         *
        */
        this.bullet = {
            x:0,
            y:0,
            speed:15,  // default speed
            xSpeed:0,  // this and next line are for bullets moving
            ySpeed:0,
            damage: 3,
            ready: true,  //it is ready for firing
            directionSign : +1, // --> +1 or -1, if directionSing is +1, bullet will go right.
            barrelX: 0,
            barrelY: 0,
            fire : function () {
                if(this.ready) {
                    this.x = this.barrelX; //this.sprite.x + 50; //the barrel is at  (0,0) because this is only for testing
                    this.y = this.barrelY; //this.sprite.y + 50;
                    this.ready = false;     //it is not ready until it kill
                }
            },
            kill : function() {
                this.ready = true;
            },
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
    Player.prototype.move = function(sign, xOrY) {
        this[xOrY] += sign * this.speed;
        this.sprite[xOrY] = this[xOrY];
        this.moving = true;     // for animation
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
    p1.bullet.barrelX = p1.x + 70;
    p1.bullet.barrelY = p1.y + 35;
    p1.bullet.xSpeed = 15;

    p2.bullet.barrelX = p2.x + 0;
    p2.bullet.barrelY = p2.y + 35;
    p2.bullet.xSpeed = -15;
    
    // the pulse of the player
    var pulseControl = function () {
        if(p1.hp <= 0) {
            p1.die();
        } else if (p2.hp <= 0) {
            p2.die();
        }
    }

    var readyToPlayControl = function () {
        if((p1.readyToPlay) && p2.readyToPlay) {
            p1.live = true;
            p1.drawMenuBool = false;
            p2.live = true;
            p2.drawMenuBool = false;
        }
    }



    

    // testing
    
    /*
     *   these lines are for more sensitive control
     *   the undermentioned object is for the image of the player. These values defined the image's limit
     *   I mentioned it "testing" because I try it
     */ 
    
        var targetDict = {
            5: [10, 60],
            6: [10, 60],
            7: [10, 60],
            8: [10, 60],
            9: [10, 60],
            10: [10, 60],
            11: [10, 60],
            12: [10, 60],
            13: [10, 60],
            14: [10, 60],
            15: [10, 60],
            16: [10, 60],
            17: [10, 60],
            18: [10, 60],
            19: [10, 60],
            20: [10, 60],
            21: [10, 60],
            22: [10, 60],
            23: [10, 60],
            24: [10, 60],
            25: [10, 60],
            26: [10, 60],
            27: [10, 60],
            28: [10, 60],
            29: [10, 60],
            30: [10, 60],
            31: [10, 60],
            32: [10, 60],
            33: [10, 60],
            34: [10, 60],
            35: [10, 60],
            36: [10, 60],
            37: [10, 60],
            38: [10, 60],
            39: [10, 60],
            40: [10, 60],
            41: [15, 55],
            42: [15, 55],
            43: [15, 55],
            44: [15, 55],
            45: [0, 75],
            46: [0, 75],
            47: [0, 75],
            48: [0, 75],
            49: [0, 75],
            50: [0, 75],
            51: [0, 75],
            52: [0, 75],
            53: [0, 75],
            54: [0, 75],
            55: [0, 75],
            56: [0, 75],
            57: [0, 75],
            58: [0, 75],
            59: [0, 75],
            60: [0, 75],
            61: [0, 75],
            62: [0, 75],
            63: [0, 75],
            64: [0, 75],
            65: [0, 75],
            66: [0, 75],
            67: [0, 75],
            68: [0, 75],
            69: [0, 75],
            70: [0, 75],
            71: [0, 75],
            72: [0, 75],
            73: [0, 75],
            74: [0, 75],
            75: [0, 75],
            76: [0, 75],
            77: [0, 75],
            78: [0, 75],
            79: [0, 75],
            80: [0, 75],
            81: [0, 75],
            82: [0, 75],
            83: [0, 75],
            84: [0, 75],
            85: [0, 75],
            86: [0, 75],
            87: [0, 75],
            88: [0, 75],
            89: [0, 75],
            90: [0, 75],
            91: [0, 75],
            92: [0, 75],
            93: [0, 75],
            94: [0, 75],
            95: [0, 75],
            96: [0, 75],
            97: [0, 75],
            98: [0, 75],
            99: [0, 75],
            100: [0, 75],
            101: [0, 75],
            102: [0, 75],
            103: [0, 75],
            104: [0, 75],
            105: [0, 75],
            106: [15, 55],
            107: [15, 55],
            108: [15, 55],
            109: [15, 55],
            110: [15, 55],
            111: [15, 55],
            112: [15, 55],
            113: [15, 55],
            114: [15, 55],
            115: [15, 55]
        }

    var way, min, max;

    // ^ testing
    

    var drawRectangle = function (x, y, width, height, color) {
        context.beginPath();
        context.moveTo(x, y+(height/2));
        context.lineTo(x+width, y+(height/2));
        context.lineWidth = height;
        context.strokeStyle = color;
        context.stroke();
    }

    function gameLoop() {

        window.requestAnimationFrame(gameLoop);
        
        /*   // I will add multiple bullet some day
        //bullets control
        for (var i = 0; i<p1.bulletLen; i++) { 
            if (p1.bullets[i].fire) {
                console.log("this bulet will fire");
            }
        }
         * 
         * multiple bullet not now
         *
        */


        // bullets can live inside canvas
        if((p1.bullet.x > canvas.width) ||
            (p1.bullet.x < 0) ||
            (p1.bullet.y > canvas.height) ||
            (p1.bullet.y < 0)){ 
                p1.bullet.kill();
        }
        if((p2.bullet.x > canvas.width) ||
            (p2.bullet.x < 0) ||
            (p2.bullet.y > canvas.height) ||
            (p2.bullet.y < 0)){ 
                p2.bullet.kill();
        }

        // did bullets arrive the rival of its owner?
        if((!p1.bullet.ready) &&(p1.bullet.x > p2.sprite.x)&&(p1.bullet.x < p2.sprite.x + 100)) {
            if((p1.bullet.y > p2.sprite.y) &&(p1.bullet.y < p2.sprite.y + 100)) {
                way = p1.bullet.y;
                try {   //this is bad code, I will delete these
                    min = targetDict[(way - p2.sprite.y)][0];
                    max = targetDict[(way - p2.sprite.y)][1];
                } catch {
                    console.log("caught");
                }

                if((p1.bullet.x > p2.sprite.x + min) &&(p1.bullet.x < p2.sprite.x + max)) {
                    p2.hp -= p1.bullet.damage;
                    p1.bullet.kill();
                    pulseControl();
                }
            };
        };

        if((!p2.bullet.ready) &&(p2.bullet.x > p1.sprite.x)&&(p2.bullet.x < p1.sprite.x + 100)) {
            if((p2.bullet.y > p1.sprite.y) &&(p2.bullet.y < p1.sprite.y + 100)) {
                way = p2.bullet.y;
                try  {
                    min = targetDict[(way - p1.sprite.y)][0];
                    max = targetDict[(way - p1.sprite.y)][1];
                } catch {
                }

                if((p2.bullet.x > p1.sprite.x + min) &&(p2.bullet.x < p1.sprite.x + max)) {
                    p1.hp -= p2.bullet.damage;
                    p2.bullet.kill();
                    pulseControl();
                }
            };
        };

        
        

        
        //clear the canvas
        context.clearRect(0,0,canvas.width, canvas.height);
        
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

        //draw bullets
        if(!p1.bullet.ready){   //the bullet going
            p1.bullet.x += p1.bullet.directionSign * p1.bullet.xSpeed;
            p1.bullet.y += p1.bullet.directionSign * p1.bullet.ySpeed;
            context.drawImage(bulletImage, p1.bullet.x, p1.bullet.y, 10, 10);
        }
        if(!p2.bullet.ready){
            p2.bullet.x += p2.bullet.directionSign * p2.bullet.xSpeed;
            p2.bullet.y += p2.bullet.directionSign * p2.bullet.ySpeed;
            context.drawImage(bulletImage, p2.bullet.x, p2.bullet.y, 10, 10);
        }

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
                p1.move(+1, "x");
                if(p1.bullet.ready) {
                    p1.bullet.xSpeed = p1.bullet.speed;
                    p1.bullet.ySpeed = 0;
                    p1.bullet.directionSign = 1;
                }
                p1.bullet.barrelX = p1.x + 70;
                p1.bullet.barrelY = p1.y + 35;
            } if (65 in keys) {  // left
                p1.move(-1, "x");
                if(p1.bullet.ready) {
                    p1.bullet.xSpeed = p1.bullet.speed;
                    p1.bullet.ySpeed = 0;
                    p1.bullet.directionSign = -1;
                }
                p1.bullet.barrelX = p1.x + 0;
                p1.bullet.barrelY = p1.y + 35;
            } if (83 in keys) {  // bottom
                p1.move(+1, "y");
                if(p1.bullet.ready) {
                    p1.bullet.xSpeed = 0;
                    p1.bullet.ySpeed = p1.bullet.speed;
                    p1.bullet.directionSign = +1;
                }
                p1.bullet.barrelX = p1.x + 35;
                p1.bullet.barrelY = p1.y + 50;
            } if (87 in keys) {  // top
                p1.move(-1, "y");
                if(p1.bullet.ready) {
                    p1.bullet.xSpeed = 0;
                    p1.bullet.ySpeed = p1.bullet.speed;
                    p1.bullet.directionSign = -1;
                }
                p1.bullet.barrelX = p1.x + 55;
                p1.bullet.barrelY = p1.y + 35;
            }
            if (70 in keys) {
                p1.bullet.fire();
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
                p2.move(+1, 'x');
                if(p2.bullet.ready) {
                    p2.bullet.xSpeed = p2.bullet.speed;
                    p2.bullet.ySpeed = 0;
                    p2.bullet.directionSign = 1;
                }
                p2.bullet.barrelX = p2.x + 70;
                p2.bullet.barrelY = p2.y + 35;
            } if (37 in keys) {  // left
                p2.move(-1, 'x');
                if(p2.bullet.ready) {
                    p2.bullet.xSpeed = p2.bullet.speed;
                    p2.bullet.ySpeed = 0;
                    p2.bullet.directionSign = -1;
                }
                p2.bullet.barrelX = p2.x + 0;
                p2.bullet.barrelY = p2.y + 35;
            } if (40 in keys) { // bottom
                p2.move(+1, 'y');
                if(p2.bullet.ready) {
                    p2.bullet.xSpeed = 0;
                    p2.bullet.ySpeed = p2.bullet.speed;
                    p2.bullet.directionSign = +1;
                }
                p2.bullet.barrelX = p2.x + 35;
                p2.bullet.barrelY = p2.y + 50;

            } if (38 in keys) { // top
                p2.move(-1, 'y');
                if(p2.bullet.ready) {
                    p2.bullet.xSpeed = 0;
                    p2.bullet.ySpeed = p2.bullet.speed;
                    p2.bullet.directionSign = -1;
                }
                p2.bullet.barrelX = p2.x + 55;
                p2.bullet.barrelY = p2.y + 35;
            }

            if (106 in keys) {
                p2.bullet.fire();
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
    
