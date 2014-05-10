window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    console.log(path.toString());
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}
AssetManager.prototype.downloadAll = function (callback) {
    if (this.downloadQueue.length === 0) window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function(path){
    //console.log(path.toString());
    return this.cache[path];
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration*frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index+1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex*this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}


function GameEngine() {
    this.entities = [];
    this.mario = null;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.key = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        if (x < 1024) {
            x = Math.floor(x / 32);
            y = Math.floor(y / 32);
        }

        return { x: x, y: y };
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        console.log(e);
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousewheel", function (e) {
        that.wheel = e;
    }, false);
    this.ctx.canvas.addEventListener("keydown", function (e) {
        e.preventDefault();
        that.key = e;
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        e.preventDefault();
        that.key = null;
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}


GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {

        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.detectCollisions = function () {
    var entities = this.entities;
    var mario = this.mario;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (mario.boundingbox.isCollision(entity.boundingbox) && mario.type !== entity.type) {
            mario.collide(entity);
            entity.collide(mario);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
    //this.key = null;
}




GameEngine.prototype.loadLevel = function (jSonString, gameEngine) {
    //Change Json String to Javascript Object - parsing
    if( typeof jSonString === 'string') {
        this.mainObj = JSON.parse(jSonString);

    } else {

            this.mainObj = jSonString;
    }
    this.levelObj = this.mainObj.levels;

    //Descriptive String for level type
    this.id = this.levelObj.id;
    this.descriptionStr = this.levelObj.description;

    //Background Object with background information
    this.backgroundObj = this.levelObj.background;
    this.spriteSheet = this.backgroundObj.spritesheet;
    this.start_x = this.backgroundObj.start_x;
    this.start_y = this.backgroundObj.start_y;
    this.size_x = this.backgroundObj.size_x;
    this.size_y = this.backgroundObj.size_y;
    this.length = this.backgroundObj.length;
    var background = new BackGround(this.start_x, this.start_y, gameEngine, this.length, this.id);
    gameEngine.addEntity(background);
    this.background = background;


    //Entities in the level (Player Characters, Enemies Characters, and Blocks
    this.entitiesObj = this.levelObj.entities;

    //Players inside Entities 
    this.playersObj = this.entitiesObj.players;

    //Mario inside Players
    this.marioObj = this.playersObj.mario;
    this.spriteSheetStr = this.marioObj.spritesheet;
    var mario = new Mario(this.marioObj.init_x, this.marioObj.init_y, gameEngine);
    gameEngine.addEntity(mario);
    gameEngine.mario = mario;

    //Enemies inside Entities
    this.enemiesObj = this.entitiesObj.enemies;

    //Enemies
    for (var key in this.enemiesObj) {
        var enemyGroupArray = this.enemiesObj[key];
        var arrayLength = enemyGroupArray.length;
        for (i = 0; i < arrayLength; i++) {
            var enemyObject = enemyGroupArray[i];
            gameEngine.addEntity(new Enemy(enemyObject.init_x, enemyObject.init_y, gameEngine));
        }
    }

    //Blocks inside Entities
    this.blocksObj = this.entitiesObj.blocks;
    var blockCount = Object.keys(this.blocksObj).length;
        console.log("Number of Block Types: " + blockCount);
    //Blocks
    var blockTypeInt = 0;
    for (var key in this.blocksObj) { //for every block type in this Blocks Object, do this


        var blockGroupArray = this.blocksObj[key];
        var arrayLength = blockGroupArray.length;
        for (i = 0; i < arrayLength; i++) {
            var blockObject = blockGroupArray[i];
            var count = blockObject.count;
            switch (blockTypeInt) {

                /*Each For Loop and the (17 * j) + x coordinate allows the creationg of platforms
                 based off count value inside the JSON document. Coordinates start from the first block on the
                 left, and increment 17 pixels to the right ever loop
                */
                case 1:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new QuestionBox(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 2:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new ShineyGoldBox(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 3:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new ShineyBlueBox(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 4:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new WhiteMusicNote(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 5:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new PinkMusicNote(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 6:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new PowBox(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 7:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new ColorFullExclamation(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 7:

                    //Enables the construction of a green pipe with a variable height using only to sprite sheets,
                    //where the actual height of the pipe is = (count x 15) + initial size of the regular green pipe (50) 
                    for (j = 0; j < count; j++) {
                        if (count > 1 && j === 0) {
                            gameEngine.addEntity(new GreenPipe(blockObject.init_x, blockObject.init_y - (count * 15), gameEngine));
                        } else if(count === 1){
                            gameEngine.addEntity(new GreenPipe(blockObject.init_x, blockObject.init_y, gameEngine));
                        } else if (count > 1 && j > 0) {
                            gameEngine.addEntity(new GreenPipeExtension(blockObject.init_x, ((blockObject.init_y + 50) + (j * 15) , gameEngine)));
                            GreenPipeExtension
                        }
                    }
                    break;
                default:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new StaticGoldBlock(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
            }
        }
                    blockTypeInt+=1;
                            console.log("Block type is currently block: " + blockTypeInt);

    }


}

// bouding box used for determining collisions

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.isCollision = function (oth) {
    return this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top;
    
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    /*
        use this. overwrite when extending entity ie for mario make type "Mario", for box "Box" etc.s
    */
    this.type = 'Entity' 
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

Entity.prototype.collide = function(other) {
    /*do what you need to do when you collide
        for example
        if(other.type == "Goomba") {
            if (<collided on side>) {
                this.isDead = true;
                this.game.isOver = true;
            }
        }
        but you get the idea handle collision logic here
    */
}
//mario

function Mario(init_x, init_y, game) {

    this.type = "Mario";
     Entity.call(this, game, init_x, init_y);
    this.isRunning = false;
    this.isWalking = false;
    this.isJumping = false;
    this.isRight = true;
    this.steps = 0;
    // made this the same as the debug box mario already has drawn around him.
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 8, 12, 16);
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_mario_sheet.png');
    this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.15, 2, true, true);
    this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, 0.15, 2, true, false);
    this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, 0.15, 2, true, true);
    this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, 0.15, 2, true, false);
   
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function() {
    //console.log(this.game.ctx);
    if (this.game.key) {
       // console.log('key' + " " + this.game.key.keyCode);
        if (this.game.key.keyCode === 39) {
            if(!this.isRight) {
                this.steps = 0;
                this.isRight = true;
            }
           // console.log(-(this.game.background.x ) + this.x + 50 +" " + (this.game.background.sizex * (this.game.length -1)))
            if (this.isRunning) {
                if (this.x < this.game.ctx.canvas.getBoundingClientRect().right / 2 - 50 || -(this.game.background.x ) + this.x  + 50 + this.game.background.length >= this.game.background.sizex * (this.game.length - 1)) {
                    if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40 )
                        this.x += 2.5;
                } else {
                    this.game.background.x -= 2.5;
                }
            } else  if (this.steps > 5) {
                this.isRunning = true;
                this.isWalking = false;
            } else if (this.isWalking) {
                if (this.walkRightAnimation.elapsedTime + this.game.clockTick >= this.walkRightAnimation.totalTime) {
                    this.steps++;
                }
                if (this.x < this.game.ctx.canvas.getBoundingClientRect().right / 2 - 50 || -(this.game.background.x ) + this.x + 50 + this.game.background.length >= this.game.background.sizex * (this.game.length -1) ) {
                    if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40)
                        this.x +=1; 
                }  else {
                    this.game.background.x -= 1;
                }
            } else {
                this.isWalking =true;
            }
           
        } else if (this.game.key.keyCode === 37) {
            if(this.isRight) {
                this.steps = 0;
                this.isRight = false;
            }
            
            if (this.isRunning) {
                if (this.x > this.game.ctx.canvas.getBoundingClientRect().left - 25)
                    this.x -= 2.5;
            } else if (this.steps > 5) {
                this.isRunning = true;
                this.isWalking = false;
            } else if (this.isWalking) {
                if (this.walkLeftAnimation.elapsedTime + this.game.clockTick >= this.walkLeftAnimation.totalTime) {
                    this.steps++;
                }
                if (this.x > this.game.ctx.canvas.getBoundingClientRect().left - 25)
                    this.x -=1;   
            } else {
                 this.isWalking =true;
            }

        } else if (this.game.key.keyCode === 38) {
            this.isJumping = true;
            if (this.y < 100) {

                this.y -= 2;
            }
        }

        else {
            this.isWalking = false;
            this.isRunning = false;
            this.steps = 0;
        }
    } else  {
        //console.log("key up");
       this.isWalking = false;
       this.isRunning = false;
       this.steps = 0;
    }
}

Mario.prototype.draw = function(ctx) {
     //console.log(this.game.clockTick);
    var style = ctx.strokeStyle;
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x+17, this.y+8, 12, 16);
    ctx.strokeStyle = style;
    //ctx.drawImage(this.sprite, this.x, this.y, 40, 40);
    if (this.isRunning) {
        if (this.isRight) {
            this.runRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            if (this.runRightAnimation.isDone())
                    this.runRightAnimation.elapsedTime = 0;
        } else {
            
            this.runLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            if (this.runLeftAnimation.isDone())
                    this.runLeftAnimation.elapsedTime = 0;
        }
    
    } else if (this.isWalking) {
        if (this.isRight) {
            this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            if (this.walkRightAnimation.isDone()) {
                    this.walkRightAnimation.elapsedTime = 0;
            }
        } else {
            this.walkLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
            if (this.walkLeftAnimation.isDone()) {
                    this.walkLeftAnimation.elapsedTime = 0;
            }
        }
    } else {
        if (this.isRight)
            ctx.drawImage(this.sprite,
                  200, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40,
                  40);
        else
             ctx.drawImage(this.sprite,
                  160, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40,
                  40 );

    }
    // if (this.runRightAnimation.isDone()) {
    //     console.log('here');
    //     this.runRightAnimation.elapsedTime = 0;
    // }
    // this.runRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    
    //Entity.prototype.draw.call(this, ctx);
}


//Enemy Code -- TODO: Enemies will have to be in some type of collection.
function Enemy(init_x, init_y, game) {
    var frameWidth = 50;
    var frameHeight = 25;

    this.sprite = ASSET_MANAGER.getAsset('images/smb3_enemies_sheet.png');
    this.bounceAnimation = new Animation(this.sprite, 0, 0, frameWidth, frameHeight, .4, 2, true, false);
    this.init_x = init_x;
    this.direction = 1;
    
    Entity.call(this, game, init_x, init_y);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    var travelCount = 100;
    if(this.direction === 1) {
        if(this.x === this.init_x + travelCount) {
            this.direction = 0;
        } else {
            this.x += 1;        
        }
    } else {
        if(this.x === this.init_x) {
            this.direction = 1;
        } else {
            this.x -= 1;
        }
    }
    
}

Enemy.prototype.draw = function(ctx) {
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    //console.log(this.sprite);
   this.bounceAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
    
    /*
    for(var i = 1; i < 4; i++) {
        ctx.drawImage(this.sprite,
                  0, 0,  
                  i * frameWidth, frameHeight,
                  this.x + frameWidth, this.y,
                  i * frameWidth, frameHeight);    
    }
    
    ctx.drawImage(this.sprite,
                  0, 0,  
                  frameWidth, frameHeight,
                  this.x, this.y,
                  frameWidth, frameHeight);

    ctx.drawImage(this.sprite,
                  0, 0,  
                  2 * frameWidth, 2 * frameHeight,
                  this.x + 50, this.y,
                  2 * frameWidth, 2* frameHeight); */
}



//QuestionBox
function QuestionBox(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 205, 1, 17, 16, 0.14, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

QuestionBox.prototype = new Entity();
QuestionBox.prototype.constructor = QuestionBox;

QuestionBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

QuestionBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

}

//ShineyGoldBox
function ShineyGoldBox(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 52, 35, 17, 16, 0.14, 8, true, false);
    Entity.call(this, game, init_x, init_y);
}

ShineyGoldBox.prototype = new Entity();
ShineyGoldBox.prototype.constructor = ShineyGoldBox;

ShineyGoldBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ShineyGoldBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}

//ShineyBlueBox
function ShineyBlueBox(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 378, 60, 17, 16, 0.14, 8, true, false);
    Entity.call(this, game, init_x, init_y);
}

ShineyBlueBox.prototype = new Entity();
ShineyBlueBox.prototype.constructor = ShineyBlueBox;

ShineyBlueBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ShineyBlueBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

}

//ColorFullExclamation
function ColorFullExclamation(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 205, 18, 17, 16, 0.30, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

ColorFullExclamation.prototype = new Entity();
ColorFullExclamation.prototype.constructor = ColorFullExclamation;

ColorFullExclamation.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ColorFullExclamation.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}

//PinkMusicNote
function PinkMusicNote(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 69, 17, 16, 0.20, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

PinkMusicNote.prototype = new Entity();
PinkMusicNote.prototype.constructor = PinkMusicNote;

PinkMusicNote.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

PinkMusicNote.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

}


//WhiteMusicNote
function WhiteMusicNote(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 52, 17, 16, 0.20, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

WhiteMusicNote.prototype = new Entity();
WhiteMusicNote.prototype.constructor = WhiteMusicNote;

WhiteMusicNote.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

WhiteMusicNote.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}


//PowBox
function PowBox(init_x, init_y, game) {

    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 35, 18, 17, 16, 0.14, 3, true, false);
    Entity.call(this, game, init_x, init_y);
}

PowBox.prototype = new Entity();
PowBox.prototype.constructor = PowBox;

PowBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

PowBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    //this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);

                    ctx.drawImage(this.sprite,
                  35, 18,  // source from sheet
                  17, 16,
                   this.game.background.x + this.x, this.y,
                  17,
                  16);

}


//Backgrounds
function BackGround(init_x, init_y, game, length, id) {
    this.length = length;
    this.id = id;
    this.sizex = 512;
    this.sizey = 256;
    this.sprite = ASSET_MANAGER.getAsset('images/mariolevels.png');
    Entity.call(this, game, init_x, init_y);
}

BackGround.prototype = new Entity();
BackGround.prototype.constructor = BackGround;

BackGround.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

BackGround.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    //this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    var sourcSheetX = 1;
    var sourceSheetY = 1;
    var verticleShiftSprite = 258;
    var verticleShuffleSprite = 514;

        switch (this.id) { // This is the LEVEL ID. The Switch will load the proper sprite from the sprite sheet for that level
        case 2:
            var sourcSheetX = 1;
            var sourceSheetY = 1*verticleShiftSprite;
            break;
        case 3:
            var sourcSheetX = 1;
            var sourceSheetY = 2*verticleShiftSprite;
            break;
        case 4:
            var sourcSheetX = 1;
            var sourceSheetY = 3*verticleShiftSprite;
            break;
        case 5:
            var sourcSheetX = 1;
            var sourceSheetY = 4*verticleShiftSprite;
            break;
         case 6:
            var sourcSheetX = verticleShuffleSprite;
            var sourceSheetY = 1;
            break;
        case 7:
            var sourcSheetX = verticleShuffleSprite;
            var sourceSheetY = 1*verticleShiftSprite;
            break;
        case 8:
            var sourcSheetX = verticleShuffleSprite;
            var sourceSheetY = 2*verticleShiftSprite;
            break;
        case 9:
            var sourcSheetX = verticleShuffleSprite;
            var sourceSheetY = 3*verticleShiftSprite;
            break;
        case 10:
            var sourcSheetX = 1;
            var sourceSheetY = 4*verticleShiftSprite;
            break;

        default: //Default is level 1 which starts at top left of the sprite sheet at 1,1
            var sourcSheetX = 1;
            var sourceSheetY = 1;
            break;

            }
            var j = 0;
            while(j < this.length) {
                                    ctx.drawImage(this.sprite,
                  sourcSheetX, sourceSheetY,  // source from sheet
                  512, 256,
                  (this.x + (j * 511)), this.y,
                  512,256);

                j++;
            }
}


//Green pipe
function GreenPipe(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/pipe.png');
    //this.moveAnimation = new Animation(this.sprite, 1, 1, 17, 16, 0.22, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

GreenPipe.prototype = new Entity();
GreenPipe.prototype.constructor = GreenPipe;

GreenPipe.prototype.update = function () {
   // Entity.prototype.update.call(this);
}

GreenPipe.prototype.draw = function (ctx) {
                ctx.drawImage(this.sprite,
                  1, 1,  // source from sheet
                  34, 50,
                   this.game.background.x + this.x, this.y,
                  35,
                  51);

}

//StaticGoldBlock
function StaticGoldBlock(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    Entity.call(this, game, init_x, init_y);
}

StaticGoldBlock.prototype = new Entity();
StaticGoldBlock.prototype.constructor = StaticGoldBlock;

StaticGoldBlock.prototype.update = function () {

}

StaticGoldBlock.prototype.draw = function (ctx) {
                ctx.drawImage(this.sprite,
                  1, 35,  
                  16, 16,
                   this.game.background.x + this.x, this.y,
                  16,
                  16);

}

// GameBoard code below
function GameBoard() {

    Entity.call(this, null, 0, 0);
}

GameBoard.prototype = new Entity();
GameBoard.prototype.constructor = GameBoard;

GameBoard.prototype.update = function () {
    Entity.prototype.update.call(this);
}

GameBoard.prototype.draw = function (ctx) {
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload('images/levelRemovedBorder1.png');
ASSET_MANAGER.queueDownload('images/smb3_mario_sheet.png');
ASSET_MANAGER.queueDownload('images/smb3_enemies_sheet.png');
ASSET_MANAGER.queueDownload('images/pipe.png');
ASSET_MANAGER.queueDownload('images/mariolevels.png');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();

    gameEngine.addEntity(gameboard);
  
    $.get('services/levelService.php', {id:1}, function(data) {
        console.log(data);
         gameEngine.loadLevel(data, gameEngine);
        gameEngine.init(ctx);
        gameEngine.start();
    }).fail(function(error) { console.log('error');});
   
});