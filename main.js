var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

//this adds the variables for your game states
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_WIN = 3;

//-------SCORE-----
var score = 0
var timer = 160;
//-------SCORE------

var gameState = STATE_SPLASH
// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime() {
    endFrameMillis = startFrameMillis;
    startFrameMillis = Date.now();

    // Find the delta time (dt) - the change in time since the last drawFrame
    // We need to modify the delta time to something we can use.
    // We want 1 to represent 1 second, so if the delta is in milliseconds
    // we divide it by 1000 (or multiply by 0.001). This will make our 
    // animations appear at the right speed, though we may need to use
    // some large values to get objects movement and rotation correct
    var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;

    // validate that the delta is within range
    if (deltaTime > 1)
        deltaTime = 1;

    return deltaTime;
}

//-------------------- Don't modify anything above here

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

var LAYER_COUNT = 4;
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 1;
var LAYER_LADDERS = 2;
var LAYER_OBJECT_TRIGGERS = 3;

var currentLevel = level1;

var MAP;



var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;



var lives = 3;


//-----------ENEMIES----------------

var enemies = [];


//----------------------------------



//----BACKGROUND-----
//load the image to use for the tiled background
var star = document.createElement("img");
star.src = "stars.png"

//Create the tiled background
var background = [];
for (var y = 0; y < 15; y++) {
    background[y] = [];
    for (var x = 0; x < 20; x++)
        background[y][x] = star;
}


var heartImage = document.createElement("img");
heartImage.src = "heart.png";

// abitrary choice for 1m
var METER = TILE;
// very exaggerated gravity (6x)
var GRAVITY = METER * 3 * 6;
// max horizontal speed (10 tiles per second)
var MAXDX = METER * 10;
// max vertical speed (15 tiles per second)
var MAXDY = METER * 15;
// horizontal acceleration - take 1/2 second to reach maxdx
var ACCEL = MAXDX * 2;
// horizontal friction - take 1/6 second to stop from maxdx
var FRICTION = MAXDX * 6;
// (a large) instantaneous jump impulse
var JUMP = METER * 1500;

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load the image to use for the level tiles
var tileset = document.createElement("img");
tileset.src = "tileset.png";

// load an image to draw
var player = new Player();

//----enemies test----




var enemey = new Enemy();



//---enemies test----


var keyboard = new Keyboard();
//---------------------------------------------------------------------------------------------------------------------------
function cellAtPixelCoord(layer, x, y) {
    if (x < 0 || x > SCREEN_WIDTH) // || y < 0)
        return 1;
    // let the player drop of the bottom of the screen (this means death)
    if (y > SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, p2t(x), p2t(y));
};
function cellAtTileCoord(layer, tx, ty) {
    if (tx < 0 || tx >= MAP.tw) // || ty < 0)
        return 1;
    // let the player drop of the bottom of the screen (this means death)
    if (ty >= MAP.th || ty < 0)
        return 0;
    return cells[layer][ty][tx];
};
function tileToPixel(tile) {
    return tile * TILE;
};
function pixelToTile(pixel) {
    return Math.floor(pixel / TILE);
};
function bound(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
//--------------------------------------------------------------------
var musicBackgroundLevel1;
var musicBackgroundLevel2;
var MusicBackgroundLevel3;
var MusicBackgroundLevel4;
var MusicBackgroundLevel5;
var MusicBackgroundLevel6;

var cells = []; // the array that holds our simplified collision data
function initialize()
{
    enemies = []
    cells = [];

    //-----MUSIC---------
    if (currentLevel == level1) {
        musicBackgroundLevel1 = new Howl({
            urls: ["Music/Blazing-Stars_Level_1.ogg"],
            loop: true,
            buffer: true,
            volume: 0.6
        });
    
        musicBackgroundLevel1.play();
    }



        if (currentLevel == level2) {
            musicBackgroundLevel1.stop()

            musicBackgroundLevel2 = new Howl({
                urls: ["Music/Light-Years_Ending_Credits.mp3"],
                loop: true,
                buffer: true,
                volume: 0.6
            });
    
            musicBackgroundLevel2.play();

        }


        if (currentLevel == level3)
        {
            musicBackgroundLevel2.stop()

            musicBackgroundLevel3 = new Howl({
                urls: ["Music/Night-Winds_Intro_Music.mp3"],
                loop: true,
                buffer: true,
                volume: 0.6
            });

            musicBackgroundLevel3.play();

        }

        if (currentLevel == level4) {
            musicBackgroundLevel3.stop()

            musicBackgroundLevel4 = new Howl({
                urls: ["Music/Urban-Jungle-2061_Level_3.mp3"],
                loop: true,
                buffer: true,
                volume: 0.6
            });

            musicBackgroundLevel4.play();

        }

        if (currentLevel == level5) {
            musicBackgroundLevel4.stop()

            musicBackgroundLevel5 = new Howl({
                urls: ["Music/Trouble-on-Mercury_Level_2.mp3"],
                loop: true,
                buffer: true,
                volume: 0.6
            });

            musicBackgroundLevel5.play();

        }

        if (currentLevel == level6) {
            musicBackgroundLevel5.stop()

            musicBackgroundLevel6 = new Howl({
                urls: ["Music/World-of-Automatons_Boss_Fight.mp3"],
                loop: true,
                buffer: true,
                volume: 0.6
            });

            musicBackgroundLevel6.play();

        }










    player.position.set(3 * TILE, 0 * TILE);
   




    // initialize trigger layer in collision map
    cells[LAYER_OBJECT_TRIGGERS] = [];
    idx = 0;
    for (var y = 0; y < currentLevel.layers[LAYER_OBJECT_TRIGGERS].height; y++) {
        cells[LAYER_OBJECT_TRIGGERS][y] = [];
        for (var x = 0; x < currentLevel.layers[LAYER_OBJECT_TRIGGERS].width; x++) {
            if (currentLevel.layers[LAYER_OBJECT_TRIGGERS].data[idx] != 0) {
                cells[LAYER_OBJECT_TRIGGERS][y][x] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y - 1][x] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y - 1][x + 1] = 1;
                cells[LAYER_OBJECT_TRIGGERS][y][x + 1] = 1;
            }
            else if (cells[LAYER_OBJECT_TRIGGERS][y][x] != 1) {
                // if we haven't set this cell's value, then set it to 0 now
                cells[LAYER_OBJECT_TRIGGERS][y][x] = 0;
            }
            idx++;
        }
    }
    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
        cells[layerIdx] = [];
        var idx = 0;
        for (var y = 0; y < currentLevel.layers[layerIdx].height; y++) {
            cells[layerIdx][y] = [];
            for (var x = 0; x < currentLevel.layers[layerIdx].width; x++) {
                if (currentLevel.layers[layerIdx].data[idx] != 0) {
                    // for each tile we find in the layer data, we need to create 4 collisions
                    // (because our collision squares are 35x35 but the tile in the
                    // level are 70x70)
                    cells[layerIdx][y][x] = 1;
                    cells[layerIdx][y - 1][x] = 1;
                    cells[layerIdx][y - 1][x + 1] = 1;
                    cells[layerIdx][y][x + 1] = 1;
                }
                else if (cells[layerIdx][y][x] != 1) {
                    // if we haven't set this cell's value, then set it to 0 now
                    cells[layerIdx][y][x] = 0;
                }
                idx++;
            }

        }
    }

    //------------------ add enemies---------------------------
    // add enemies
    idx = 0;
   /* for (var y = 0; y < currentLevel.layers[LAYER_OBJECT_ENEMIES].height; y++) {
      for (var x = 0; x < currentLevel.layers[LAYER_OBJECT_ENEMIES].width; x++) {
           if (currentLevel.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
                var px = tileToPixel(x);
                var py = tileToPixel(y);
                var e = new Enemy(px, py);
                enemies.push(e);
            }
            idx++;
        }
    }*/

    //-------------------------------ENEMY's from left-right --------------------------
    if (currentLevel == level1)
    {
        //wall of pineapples top-bottom
        // first pineapple 
        var px = tileToPixel(20);
        var py = tileToPixel(3.5);
        var e = new Enemy(px, py);
        enemies.push(e);

        //second pinapple
        var px = tileToPixel(20);
        var py = tileToPixel(1);
        var e = new Enemy(px, py);
        enemies.push(e);

        //third pinapple
        var px = tileToPixel(20);
        var py = tileToPixel(-1.5);
        var e = new Enemy(px, py);
        enemies.push(e);
        //-----------------------------

        //second pineapple
        var px = tileToPixel(45.5);
        var py = tileToPixel(4);
        var e = new Enemy(px, py);
        enemies.push(e);

        //third pineapple
        var px = tileToPixel(55);
        var py = tileToPixel(6.5);
        var e = new Enemy(px, py);
        enemies.push(e);
    }

    if (currentLevel == level3)
    {
        //first pineapple
        var px = tileToPixel(20);
        var py = tileToPixel(3.5);
        var e = new Enemy(px, py);
        enemies.push(e);

        
        //second pineapple
        var px = tileToPixel(25);
        var py = tileToPixel(3.5);
        var e = new Enemy(px, py);
        enemies.push(e);




    }



    //-----------------------------------------------------------

    if (currentLevel == level1 || currentLevel == level2 || currentLevel == level3)
    {
        MAP = { tw: 60, th: 15 };
    }
    else if (currentLevel == level4)
    {
        MAP = { tw: 120, th: 15 };
    }
    else if (currentLevel == level5)
    {
        MAP = { tw: 180, th: 15 };
    }
    else (currentLevel == level6)
    {
        MAP = { tw: 240, th: 15 }
    }
    
}
//---------------------------------------------------------------------------------------------------------------------------

var worldOffsetX = 0;
function drawMap() {
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 2;
    var tileX = pixelToTile(player.position.x);
    var offsetX = TILE + Math.floor(player.position.x % TILE);

    startX = tileX - Math.floor(maxTiles / 2);

    if (startX < -1) {
        startX = 0;
        offsetX = 0;
    }
    if (startX > MAP.tw - maxTiles) {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    worldOffsetX = startX * TILE + offsetX;

    for (var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
        for (var y = 0; y < currentLevel.layers[layerIdx].height; y++) {
            var idx = y * currentLevel.layers[layerIdx].width + startX;
            for (var x = startX; x < startX + maxTiles; x++) {
                if (currentLevel.layers[layerIdx].data[idx] != 0) {
                    // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
                    // so subtract one from the tileset id to get the correct tile
                    var tileIndex = currentLevel.layers[layerIdx].data[idx] - 1;
                    var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
                   (TILESET_TILE + TILESET_SPACING);
                    var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
                   (TILESET_TILE + TILESET_SPACING);
                    context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
                   (x - startX) * TILE - offsetX, (y - 1) * TILE, TILESET_TILE, TILESET_TILE);
                }
                idx++;
            }
        }
    }
}
//---------------------------------------------------------------------------------------------------------------------------------------
    //this adds the timer for the splash to finish
    var splashTimer = 3;

    function runSplash(deltaTime) {
        //this adds the splash
        splashTimer -= deltaTime;
        if (splashTimer <= 0) {
            gameState = STATE_GAME;
            return;
        }
        var happyPizza = document.createElement("img");
        happyPizza.src = "happy pizza.jpg";

        context.drawImage(happyPizza, 0, 0, canvas.width, canvas.height);

        //this customizies the splash 
        context.fillStyle = "#7D0552";
        context.font = "30px Comic Sans";
        context.fillText("Are you ready? Go to the exit sign!", 120, 240);
    }
    
    function runGame(deltaTime) {

        player.update(deltaTime);
        //Draw the world map
        // draw the tiled background
        for (var y = 0; y < 15; y++) {
            for (var x = 0; x < 20; x++) {
                context.drawImage(background[y][x], x * 32, y * 32)
            }
        }

        drawMap();


        player.draw();

        for (var i = 0; i < enemies.length; i++) {
           

            enemies[i].draw();
        }

      
        // update the frame counter
        fpsTime += deltaTime;
        fpsCount++;
        if (fpsTime >= 1) {
            fpsTime -= 1;
            fps = fpsCount;
            fpsCount = 0;
        }

        // draw the FPS
        context.fillStyle = "#fa335e";
        context.font = "14px Arial";
        context.fillText("FPS: " + fps, 5, 20, 100);

        //------SCORE/TIMER--------
        context.fillStyle = "#fa335e";
        context.font = "20px Arial";
        var scoreText = "Score: " + score.toFixed(0);
        context.fillText(scoreText, SCREEN_WIDTH - 170, 35);

        var timerText = "Time Left: " + timer.toFixed(0);
        timer -= deltaTime;
        score += deltaTime * 2,
        context.fillText(timerText, SCREEN_WIDTH - 400, 30);
        if (timer < 0)
        {
            gameState = STATE_GAMEOVER
        }

        //Draw Lives Text
        context.fillStyle = "#fa335e";
        context.font = "18px Arial";
        context.fillText("Lives: " , 5, 40, 100);

        //Draw Hearts (Lives)
        for (var i = 0; i < lives; i++) {
            context.drawImage(heartImage, 5 + ((heartImage.width) * i / 60), 50, 30, 30);
        }
        if (player.position.y >= canvas.height) {
            lives -= 1;
            player.position.set(9 * TILE, 0 * TILE);

            if (lives <= 0) {
                gameState = STATE_GAMEOVER;
                return;
            }
        }
    }

    function runGameOver(deltaTime) {
        var sadPizza = document.createElement("img");
        sadPizza.src = "sad pizza.jpg";

        context.drawImage(sadPizza, 0, 0, canvas.width, canvas.height);

        //this customizies the splash 
        context.fillStyle = "#7D0552";
        context.font = "50px Comic Sans";
        context.fillText("Game Over", 200, 290);

       

    }

    function runWinGame(deltaTime)
    {
        var winPizza = document.createElement("img");
        winPizza.src = "winning pizza.png";

        context.drawImage(winPizza, 0, 0, canvas.width, canvas.height);

        //this customizies the splash 
        context.fillStyle = "#7D0552";
        context.font = "50px Comic Sans";
        context.fillText("You Win!", 200, 290);

       
    }



//----------------------------------------------------------------------------------------------------------------------------------------
function run() {
    context.fillStyle = "#ccc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    var deltaTime = getDeltaTime();

//---------------Enemies-----------------------
    for (var i = 0; i < enemies.length; i++) {
       // enemies[i].update(deltaTime);

       
    }

    // tests if two rectangles are intersecting.
    // Pass in the x,y coordinates, width and height of each rectangle.
    // Returns 'true' if the rectangles are intersecting
    function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (y2 + h2 < y1 ||
        x2 + w2 < x1 ||
        x2 > x1 + w1 ||
        y2 > y1 + h1) {
            return false;
        }
        return true;
    }


    //PLAYER COLLISION AGAINST PINEAPPLE

    //player collision
    for (var i = 0; i < enemies.length; i++) {
        if (intersects(
         player.position.x - 50 / 2,
         player.position.y - 50 / 2,
         50, 50,
         enemies[i].position.x - 50 / 2,
         enemies[i].position.y - 50 / 2,
         50, 50) == true) {
            
            lives -= 1;
            player.position.set(9 * TILE, 0 * TILE);
         
            console.log("IS DEAD")

        }
    }


    if (player.isDead == true) {
        gameState = STATE_GAMEOVER;

    }
    
    if (lives == 0)
    {
        gameState = STATE_GAMEOVER
    }


//--------------------------------------------


    switch (gameState)
    {
        case STATE_SPLASH:
            runSplash(deltaTime);
            break;
        case STATE_GAME:
            runGame(deltaTime);
            break;
        case STATE_GAMEOVER:
            runGameOver(deltaTime);
            break;
        case STATE_WIN:
            runWinGame(deltaTime);
            break;
    }
    
}
//Build 2D array
initialize();



//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function () {
    var onEachFrame;
    if (window.requestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.requestAnimationFrame(_cb); }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () { cb(); window.mozRequestAnimationFrame(_cb); }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / 60);
        }
    }

    window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
