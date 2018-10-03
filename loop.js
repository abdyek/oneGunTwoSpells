function gameLoop() {

    window.requestAnimationFrame(gameLoop);
    
    //clear the canvas
    context.clearRect(0,0,canvas.width, canvas.height);


    for(i = 0; i<players.length; i++) {
    
        // bullets can live inside canvas
        for (var j = 0; j<players[i].capacityOfMagazine; j++) {
            attackControl(players[i],players[i].rival, j);
            if((players[i].bullet[j].x > canvas.width) ||
                (players[i].bullet[j].x < 0) ||
                (players[i].bullet[j].y > canvas.height) ||
                (players[i].bullet[j].y < 0)){ 
                    players[i].bullet[j].kill();
            }
        }

        //control for animation
        if(players[i].moving) {                 
            players[i].sprite.update();
        }

        //draw players
        players[i].sprite.render();
        players[i].draw();

        //draw bullets
        for (var j = 0; j<players[i].capacityOfMagazine; j++) {
            if(!players[i].bullet[j].ready){   //the bullet going
                players[i].bullet[j].x += players[i].bullet[j].directionSign * players[i].bullet[j].xSpeed;
                players[i].bullet[j].y += players[i].bullet[j].directionSign * players[i].bullet[j].ySpeed;
                drawCircle(players[i].bullet[j].x, players[i].bullet[j].y, 3.5, p1.bColor);
            }
        }
        // draw menu per frame
        players[i].drawMenu();

        // this line stop animation when release moving keys
        players[i].moving = false;

        // player, to detect keys
        if(players[i].live) {
            if (players[i].keys[0] in keys) {  // right
                players[i].move(+1, "x");
                players[i].changeRouteOfBarrel(players[i].bSpeed, 0, 1, 0);
            } if (players[i].keys[2] in keys) {  // left
                players[i].move(-1, "x");
                players[i].changeRouteOfBarrel( players[i].bSpeed, 0, -1, 2);
            } if (players[i].keys[3] in keys) {  // bottom);
                players[i].move(+1, "y");
                players[i].changeRouteOfBarrel(0, players[i].bSpeed, 1, 3);
            } if (players[i].keys[1] in keys) {  // top
                players[i].move(-1, "y");
                players[i].changeRouteOfBarrel(0, players[i].bSpeed, -1, 1);
            }
            if (players[i].keys[4] in keys) {
                players[i].fire();
            }
        } else if(players[i].drawMenuVisible && players[i].drawMenuControl) {
            if (players[i].keys[0] in keys) {  // right
                if(!players[i].cursorStop) {
                    players[i].cursorMove(1);
                }
            } if (players[i].keys[2] in keys) {  // left
                if (!players[i].cursorStop) {
                    players[i].cursorMove(-1);
                }
            } if (players[i].keys[3] in keys) {  // bottom
                if (!players[i].cursorStop) {
                    players[i].cursorMoveVertical(+1);
                }
            } if (players[i].keys[1] in keys) {  // top
                if(!players[i].cursorStop) {
                    players[i].cursorMoveVertical(-1);
                }
            } if (players[i].keys[4] in keys) {
                players[i].readyToPlay = true;
                readyToPlayControl();
            }
        }
    }
}

gameLoop();