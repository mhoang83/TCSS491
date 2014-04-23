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
    //this.key = null;
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
    this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.15, 2, true, true);
    this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, 0.15, 2, true, false);
    this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, 0.15, 2, true, true);
    this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, 0.15, 2, true, false);
    Entity.call(this, game, init_x, init_y);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function() {
    if (this.game.key) {
       // console.log('key' + " " + this.game.key.keyCode);
        if (this.game.key.keyCode === 39) {
            if(!this.isRight) {
                this.steps = 0;
                this.isRight = true;
            }
            if (this.isRunning) {
                this.x += 2.5;
            } else  if (this.steps > 5) {
                this.isRunning = true;
                this.isWalking = false;
            } else if (this.isWalking) {
                if (this.walkRightAnimation.elapsedTime + this.game.clockTick >= this.walkRightAnimation.totalTime) {
                    this.steps++;
                }
                this.x +=1;   
            } else {
                this.isWalking =true;
            }
           
        } else if (this.game.key.keyCode === 37) {
            if(this.isRight) {
                this.steps = 0;
                this.isRight = false;
            }
            
            if (this.isRunning) {
                this.x -= 2.5;
            } else if (this.steps > 5) {
                this.isRunning = true;
                this.isWalking = false;
            } else if (this.isWalking) {
                if (this.walkLeftAnimation.elapsedTime + this.game.clockTick >= this.walkLeftAnimation.totalTime) {
                    this.steps++;
                }
                this.x -=1;   
            } else {
                 this.isWalking =true;
            }
        } else {
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
   this.bounceAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1.1);
    
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
    this.sprite = ASSET_MANAGER.getAsset('images/qBoxTransparant.png');
    this.moveAnimation = new Animation(this.sprite, 1, 1, 17, 16, 0.22, 4, true, false);
    Entity.call(this, game, init_x, init_y);
}

QuestionBox.prototype = new Entity();
QuestionBox.prototype.constructor = QuestionBox;

QuestionBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

QuestionBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);

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
    //console.log(this.sprite);
    //this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
	            ctx.drawImage(this.sprite,
                  1, 1,  // source from sheet
                  34, 50,
                  this.x, this.y,
                  35,
                  51);

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
ASSET_MANAGER.queueDownload('images/qBoxTransparant.png');
ASSET_MANAGER.queueDownload('images/smb3_mario_sheet.png');
ASSET_MANAGER.queueDownload('images/smb3_enemies_sheet.png');
ASSET_MANAGER.queueDownload('images/pipe.png');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();
    
    //Create Character objects
    var mario = new Mario( 0, 208, gameEngine);
    var enemy = new Enemy( 100 , 210, gameEngine);
    var enemy1 = new Enemy( 180 , 210, gameEngine);
    var enemy2 = new Enemy( 580 , 210, gameEngine);
    var enemy3 = new Enemy( 475 , 210, gameEngine);
    var qbox = new QuestionBox(100, 150, gameEngine);
    var qbox1 = new QuestionBox(117, 150, gameEngine);
    var qbox2 = new QuestionBox(134, 150, gameEngine);
    var qbox3 = new QuestionBox(151, 150, gameEngine);
	var pipe = new GreenPipe(450, 183, gameEngine);
    
    gameEngine.addEntity(gameboard);
    
    gameEngine.addEntity(enemy);
    gameEngine.addEntity(enemy1);
    gameEngine.addEntity(enemy2);
    gameEngine.addEntity(enemy3);
    gameEngine.addEntity(qbox);
    gameEngine.addEntity(qbox1);
    gameEngine.addEntity(qbox2);
    gameEngine.addEntity(qbox3);
	gameEngine.addEntity(pipe);
    gameEngine.addEntity(mario);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
