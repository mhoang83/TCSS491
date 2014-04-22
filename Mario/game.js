// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

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
    this.maxStep = 0.1;
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

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.wheel = null;
   // this.key = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
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
//mario

function Mario(init_x, init_y, game) {
    this.isRunning = false;
    this.isWalking = false;
    this.isRight = true;
    this.steps = 0;
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_mario_sheet.png');
    this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.22, 2, false, true);
    this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, .22, 2, false, false);
    this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, .15, 2, false, true);
    this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, .15, 2, false, false);
    Entity.call(this, game, init_x, init_y);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function() {
   
     
    if (this.game.key) {
       // console.log('key' + " " + this.game.key.keyCode);
        if (this.game.key.keyCode === 39) {
            if(!this.isRight) {
                this.walkLeftAnimation.elapsedTime = 0;
                this.walkLeftAnimation.elapsedTime = 0;
                this.steps = 0;
                this.isRight = true;
            }
            
            if (this.isRunning) {
                if (this.runRightAnimation.isDone())
                    this.runRightAnimation.elapsedTime = 0;
                this.x += 2.5;
            }
            if (this.isWalking) {
                if (this.walkRightAnimation.isDone()) {
                    this.walkRightAnimation.elapsedTime = 0;
                    this.steps++;

                }
                this.x +=1;
                
                
            }
            if (!this.isWalking && !this.isRunning)
                this.isWalking =true;
           
            
            if (this.steps > 5 && !this.isRunning) {
                this.isRunning = true;
                this.isWalking = false;
                this.walkRightAnimation.elapsedTime = 0;
            }
        } else if (this.game.key.keyCode === 37) {
            if(this.isRight) {
                this.walkRightAnimation.elapsedTime = 0;
                this.walkRightAnimation.elapsedTime = 0;
                this.steps = 0;
                this.isRight = false;
            }
            
            if (this.isRunning) {
                if (this.runLeftAnimation.isDone())
                    this.runLeftAnimation.elapsedTime = 0;
                this.x -= 2.5;
            }
            if (this.isWalking) {
                if (this.walkLeftAnimation.isDone()) {
                    this.walkLeftAnimation.elapsedTime = 0;
                    this.steps++;
                }
                this.x -=1;
                
            }
            if (!this.isWalking && !this.isRunning)
                this.isWalking =true;
           
            
            if (this.steps > 5 && !this.isRunning) {
                this.isRunning = true;
                this.isWalking = false;
                this.walkRightAnimation.elapsedTime = 0;
            }

        } else {
             if (this.walkRightAnimation.isDone()) {
                //console.log('walking done');
                this.isWalking = false;
                this.walkRightAnimation.elapsedTime = 0;
                 this.x += 1;
            }
            if (this.runRightAnimation.isDone()) {
                this.isRunning = false;
                this.runRightAnimation.elapsedTime = 0;
                 this.x += 2.5;

            }
            if (this.walkLeftAnimation.isDone()) {
                this.isWalking = false;
                this.walkLeftAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x -= 1;
            }
            if (this.runLeftAnimation.isDone()) {
                this.isRunning = false;
                this.runLeftAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x -= 2.5;

            }
            this.steps = 0;
        }
    } else  {
        //console.log("key up");
        if (this.isRight) {
            if (this.walkRightAnimation.isDone()) {
                this.isWalking = false;
                this.walkRightAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x += 2.5;
            }
            if (this.runRightAnimation.isDone()) {
                this.isRunning = false;
                this.runRightAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x += 5;

            }
        } else {
            if (this.walkLeftAnimation.isDone()) {
                this.isWalking = false;
                this.walkLeftAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x -= 2.5;
            }
            if (this.runLeftAnimation.isDone()) {
                this.isRunning = false;
                this.runLeftAnimation.elapsedTime = 0;
                this.steps = 0;
                this.x -= 5;

            }
        }  
    }
}

Mario.prototype.draw = function(ctx) {
     //console.log(this.game.clockTick);
     var style = ctx.strokeStyle;
     ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x + 23, this.y + 13, 22, 25);
    ctx.strokeStyle = style;
    //ctx.drawImage(this.sprite, this.x, this.y, 40, 40);
    if (this.isRunning) {
        if (this.isRight)
            this.runRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.5);
        else
            this.runLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.5);
    
    } else if (this.isWalking) {
        if (this.isRight)
            this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.5);
        else
            this.walkLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.5);
    } else {
        if (this.isRight)
            ctx.drawImage(this.sprite,
                  200, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40* 1.5,
                  40 * 1.5);
        else
             ctx.drawImage(this.sprite,
                  160, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40* 1.5,
                  40 * 1.5);

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
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_enemies_sheet.png');
    //spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse
    this.moveRightAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.1, 2, false, true);
    this.moveLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.1, 2, false, true);
    Entity.call(this, game, init_x, init_y);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    
}

Enemy.prototype.draw = function(ctx) {
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    //console.log(this.sprite);
    ctx.drawImage(this.sprite,
                  179, 150,  
                  75, 75,
                  this.x, this.y,
                  75,
                  75);
}
// GameBoard code below

function QuestionBox(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/animateQuestionBox.png');
    this.moveAnimation = new Animation(this.sprite, 0, 0, 18, 17, 0.22, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

QuestionBox.prototype = new Entity();
QuestionBox.prototype.constructor = QuestionBox;

QuestionBox.prototype.update = function () {
    Entity.prototype.update.call(this);
}

QuestionBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, 0, 100);

}

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
ASSET_MANAGER.queueDownload('images/animateQuestionBox.png');
ASSET_MANAGER.queueDownload('images/smb3_mario_sheet.png');
ASSET_MANAGER.queueDownload('images/smb3_enemies_sheet.png');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();
    
    //Create Character objects
    var mario = new Mario( 0, 400, gameEngine);
    var enemy = new Enemy( 100 , 40, gameEngine);
    var qbox = new QuestionBox(0, 100, gameEngine);

    
    gameEngine.addEntity(gameboard);
    gameEngine.addEntity(mario);
    gameEngine.addEntity(enemy);
    gameEngine.addEntity(qbox);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
