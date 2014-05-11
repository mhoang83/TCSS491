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
    this.background = null;
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

GameEngine.prototype.changeEditor= function(id){

}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');

    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    var that = this;

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mousedown", function (e) {
        that.mousedown = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("mouseup", function (e) {
        that.mousedown = null;
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.hover = getXandY(e);
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
    if(this.background)
        this.background.draw(this.ctx);
    if(this.mario) {
        this.mario.draw(this.ctx);
    }
    this.editor.draw(this.ctx);
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

    if(this.background)
        this.background.update();
    this.editor.update();

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


//mario

function Mario(init_x, init_y, game, scale) {

    this.type = "Mario";
     Entity.call(this, game, init_x, init_y);
    this.isRunning = false;
    this.isWalking = false;
    this.isJumping = false;
    this.isRight = true;
    this.steps = 0;
    this.scale = scale || 1;
    // made this the same as the debug box mario already has drawn around him.
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 8, 12, 16);
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_mario_sheet.png');
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function() {
    
}

Mario.prototype.draw = function(ctx) {
     //console.log(this.game.clockTick);
    
            ctx.drawImage(this.sprite,
                  200, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40 * this.scale,
                  40 * this.scale);
       
}

function BackgroundEditor(init_x, init_y, game, selected,length) {
    Entity.call(this,game,init_x,init_y);
    this.label = "Backround";
    this.bgImages = [];
    this.init_x = init_x;
    this.init_y = init_y;
    this.prevMouse = {};
    this.length = length;
    this.selected = selected;
    this.editor = 'background';
    this.backgroundx = 0;
    this.ghostMario = new Mario(5,460, this.game);
    this.ghostEnemy = new Enemy(250, 430, game);
    var x_inc = 5;
    this.x_sum = 5;
    var smallbgwidth = 250;
    var smallbgheight = 120;
    for (var i = 1; i <=10; i++) {
        var bg = new BackGround(this.x_sum, 283, game, 1, i);
        bg.init_x = this.x_sum;
        this.x_sum += x_inc + smallbgwidth;
        bg.sizex = smallbgwidth;
        bg.sizey = smallbgheight;
        this.bgImages.push(bg);
    }
    this.mario = new Mario(-15, 445, game, 1.5);
    this.enemy = new Enemy(240, 449, game, 1.5);
}
BackgroundEditor.prototype = new Entity();
BackgroundEditor.prototype.constructor = BackgroundEditor;

BackgroundEditor.prototype.update = function() {
    if (this.game.key) {
        var code = this.game.key.keyCode;
        if (this.editor === 'background')
            if (code === 39 && this.backgroundx < this.init_x)
                this.backgroundx += 5;
            else if (code == 37 && -this.backgroundx < 6 *(this.x_sum / 10) - 6)
                this.backgroundx -= 5;
    }
   // console.log(this.game.click);
    if (this.game.click) {
        var click = this.game.click;
        if ((click.y >= 283 && click.y <= 403)) {
            if (this.editor === ' background')
                this.editor = '';
            else
                this.editor = 'background';
        } else if (click.y < 512 && click.y>=430 && click.x >0 && click.x < 50) {
            if (this.editor === 'mario')
                this.editor = '';
            else
                this.editor = 'mario';
            this.ghostMario.x = click.x - 20;
            this.ghostMario.y = click.y - 20;
        } else if (click.y < 256 && click.y > 0 && click.x > 0 && click.x < 1024) {
            var mario = this.game.mario;
            console.log(mario);
            if (mario &&  click.x>= mario.boundingbox.left && click.x <= mario.boundingbox.right && click.y>= mario.boundingbox.top && click.y <= mario.boundingbox.bottom) {
                this.game.mario = null;
            } else if (this.editor === 'mario') {

                this.game.mario = new Mario(this.ghostMario.x, this.ghostMario.y, this.game);
            }
            if (this.editor === '' ) {
                console.log('picking enemy up');
                var entities = this.game.entities;
                for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    console.log(entity);
                    console.log(click.x + " " + click.y);
                    if (entity.type === 'Enemy' && click.x  >= entity.boundingbox.left && click.x <= entity.boundingbox.right && click.y >= entity.boundingbox.top && click.y <= entity.boundingbox.bottom) {
                         this.editor = 'enemy';
                         console.log('here');
                        //this.game.entities = entities.splice(i,1);
                        entity.removeFromWorld = true;
                    }
                }

            } else if (this.editor === 'enemy' ) {
                this.game.addEntity(new Enemy(this.ghostEnemy.x, this.ghostEnemy.y, this.game));
            }

        } else if (click.y < 512 && click.y>=430 && click.x > 50 && click.x < 450) {
            console.log('enemy');
            if (this.editor === 'enemy')
                this.editor = '';
            else
                this.editor = 'enemy';
            this.ghostEnemy.x = click.x - 24;
            this.ghostEnemy.y = click.y - 20;
        }
    }
    var hover = this.game.hover;

    if (hover) {
       // console.log(this.editor);
        if (this.editor === 'mario') {
             this.ghostMario.x = hover.x - 24;
            this.ghostMario.y = hover.y - 20;
        } else if (this.editor === 'enemy') {
            this.ghostEnemy.x = hover.x - 24;
            this.ghostEnemy.y = hover.y - 20;
        }
    }
    for (var i = 0; i < this.bgImages.length; i++) {
        var bg = this.bgImages[i];
        bg.x = this.backgroundx + bg.init_x;
        if( click && this.editor === 'background' && click.y <= 403 && click.y >= 283 && click.x >= bg.x && click.x <= bg.x + 250 && this.selected != i+1) {
            this.selected = i + 1;
            this.game.background = new BackGround(0,0,this.game, this.length, i+1);
            console.log(this.game.background);
        }
    }
    
}

BackgroundEditor.prototype.draw = function(ctx) {
     //console.log(this.game.clockTick);
    var style = ctx.strokeStyle;
    var fill = ctx.fillStyle;
    ctx.font = "15px Arial";
    ctx.strokeStyle = 'red';
    if (this.editor === 'background') {
        ctx.fillStyle = 'rgba(255,0, 0, 100)';
        ctx.fillRect(5,258, 87, 15);
        ctx.fillStyle = 'white';
        ctx.fillText("Backgrounds",5,270);
        ctx.fillStyle = fill;
        
   } else
         ctx.fillText("Backgrounds",5,270);
    
    if (this.editor === 'mario') {
        ctx.fillStyle = 'rgba(255,0, 0, 100)';
        ctx.fillRect(5,418, 37, 15);
        ctx.fillStyle = 'white';
        ctx.fillText("Mario",5,430);
        ctx.fillStyle = fill;

    } else
         ctx.fillText("Mario",5,430);

    if (this.editor === 'enemy') {
        ctx.fillStyle = 'rgba(255,0, 0, 100)';
        ctx.fillRect(250,418, 58, 15);
        ctx.fillStyle = 'white';
        ctx.fillText("Enemies",250,430);
        ctx.fillStyle = fill;

    } else
         ctx.fillText("Enemies",250,430);
  
    ctx.moveTo(5, 275);
    ctx.lineTo(1024-5, 275);
    ctx.stroke();
   
    ctx.moveTo(5, 435);
    ctx.lineTo(1024-5, 435);
    ctx.stroke();

   
    for (var i = 0; i < this.bgImages.length; i++) {
        var bg = this.bgImages[i];
        if (this.selected === i + 1) {
                ctx.strokeStyle = 'blue';
                var width = ctx.lineWidth;
                ctx.lineWidth=5;
                ctx.strokeRect(bg.x - 2,bg.y -2,bg.sizex + 3,bg.sizey + 3);
        }
        bg.draw(ctx);
        
    }
    if (this.editor === 'mario' && !this.game.mario) {
        //console.log(this.game.hover);
        ctx.globalAlpha = 0.5;
        this.ghostMario.draw(ctx);
        ctx.globalAlpha = 1;
    }

    if (this.editor === 'enemy') {
        ctx.globalAlpha = 0.5;
        this.ghostEnemy.draw(ctx);
        ctx.globalAlpha = 1;
    }
    this.enemy.draw(ctx);
    this.mario.draw(ctx);
     ctx.strokeStyle = style;
     ctx.lineWidth= width; 
     ctx.fillStyle = fill;
}


//Enemy Code -- TODO: Enemies will have to be in some type of collection.
function Enemy(init_x, init_y, game, scale) {
    Entity.call(this, game, init_x, init_y);
    var frameWidth = 50;
    var frameHeight = 25;
    this.type = 'Enemy';
    this.scale = scale || 1.1;
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.bounceAnimation = new Animation(this.sprite, 0, 0, frameWidth, frameHeight, .4, 2, true, false );
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
    this.init_x = init_x;
    this.direction = 1;
    
    
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
    if (!this.ghost) {
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
     this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
}

Enemy.prototype.draw = function(ctx) {
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    //console.log(this.sprite);
   this.bounceAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, this.scale);
    
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
    this.sprite = ASSET_MANAGER.getAsset('../images/mariolevels.png');
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
                  this.sizex,this.sizey);

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
ASSET_MANAGER.queueDownload('../images/levelRemovedBorder1.png');
ASSET_MANAGER.queueDownload('../images/smb3_mario_sheet.png');
ASSET_MANAGER.queueDownload('../images/smb3_enemies_sheet.png');
ASSET_MANAGER.queueDownload('../images/pipe.png');
ASSET_MANAGER.queueDownload('../images/mariolevels.png');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();

    gameEngine.addEntity(gameboard);
    // need to add controls
    var editArea = $('#editarea');
    var label = $('<span>').text('What would you like to edit: ');
    var levelLabel = $('<span>').text('Level length: ');
    levelLabel.css('margin-left', '10px');
    var levels = $('<select id="levels">');
    for (var i = 4; i < 20; i++)
        levels.append($('<option>').val(i).text(i));
    var select= $('<select id="editors">');
     editArea.append(label);
    editArea.append(select);
    editArea.append(levelLabel);
    editArea.append(levels);
    var entities = [{val: 1, text:'background'}, {val: 2, text:'enemies'}, {val: 3, text:'worldobjects'}, {val: 4, text: 'mario'}];
    $(entities).each(function(index, value) {
        select.append($('<option>').val(value.val).text(value.text));
    });
     gameEngine.background = new BackGround(0,0,gameEngine,7,1);
    gameEngine.editor = new BackgroundEditor(0, 256, gameEngine, 1, 4);
    select.change(function() {
            var val = parseInt($(this).val());
            console.log(val === '1');
            if (val === "1") {
                levelLabel.show();
                levels.show();
           } else {
                levelLabel.hide();
                levels.hide();
            }
            console.log($(this)[0][val - 1]);
            gameEngine.editor.editor = $(this)[0][val - 1].text;
            console.log(gameEngine.editor.editor);
    });

    gameEngine.changeEditor(1);

   
    levels.change(function() {
         var val = $(this).val();
         gameEngine.editor.length = parseInt(val);
         gameEngine.background.length = parseInt(val);
    });
    

    gameEngine.init(ctx);
    gameEngine.start();
    
   
});