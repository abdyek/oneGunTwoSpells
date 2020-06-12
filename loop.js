function gameLoop() {

    window.requestAnimationFrame(gameLoop);
    
    //clear the canvas
    context.clearRect(0,0,canvas.width, canvas.height);
    
    // p1
    p1.draw();
    if(p1.live) {
       if (p1.keys[0] in keys) {  // right
           p1.move(p1.speed, 0);
       } if (p1.keys[2] in keys) {  // left
           p1.move( - p1.speed, 0);
       } if (p1.keys[3] in keys) {  // bottom);
           p1.move(0, p1.speed);
       } if (p1.keys[1] in keys) {  // top
           p1.move(0, - p1.speed);
       } if (p1.keys[4] in keys) {
           p1.gun.fire();
       }
    }
    // drawing bullets
    p1.gun.drawBul();
    p1.attackControl();

    if(p1.moving) {                 
        p1.sprite.update();
    }
    p1.sprite.render();
    p1.moving = false;

    //p2
    p2.draw();
    if(p2.live) {
       if (p2.keys[0] in keys) {  // right
           p2.move(p2.speed, 0);
       } if (p2.keys[2] in keys) {  // left
           p2.move( - p2.speed, 0);
       } if (p2.keys[3] in keys) {  // bottom);
           p2.move(0, p2.speed);
       } if (p2.keys[1] in keys) {  // top
           p2.move(0, - p2.speed);
       } if (p2.keys[4] in keys) {
           p2.gun.fire();
       }
    }
    // drawing bullets
    p2.gun.drawBul();
    p2.attackControl();

    if(p2.moving) {                 
        p2.sprite.update();
    }
    p2.sprite.render();
    p2.moving = false;

}

gameLoop();
