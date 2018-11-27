
// creating players

var p1 = new Player(20, canvas.height/2-60, colors.headColor[0], colors.bodyColor[0], m1, g1),
    p2 = new Player(canvas.width-100, canvas.height/2-60, colors.headColor[0], colors.bodyColor[0], m1, g1);

// to set keys
p1.keys.push(68,87,65,83,70); //right, top, left, bottom, fire

// first barrel and bullet values
p1.barrelX = p1.x + 70;
p1.barrelY = p1.y + 35;
//p1.bullet[0].xSpeed = p1.bullet[0].speed;
p1.barrelIndex = 0;
p1.rival = p2;

//to set keys
p2.keys.push(39,38,37,40,106); //right, top, left, bottom, fire

p2.barrelX = p2.x + 0;
p2.barrelY = p2.y + 35;
//p2.bullet[0].xSpeed = -1 * p2.bullet[0].speed;
p2.barrelIndex = 2;
p2.rival = p1;

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
            p1.drawMenuVisible = false;
            p2.live = true;
            p2.drawMenuVisible = false;
            p1.barrelReady = true;
            p2.barrelReady = true;
        },  100);
    }
}

