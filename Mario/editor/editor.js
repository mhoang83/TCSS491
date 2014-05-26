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
    
}

function Entity(game, x, y, scale) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.scale = scale || 1;
    /*
        use this. overwrite when extending entity ie for mario make type "Mario", for box "Box" etc.s
    */
    this.type = 'Entity' 
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}
Entity.prototype.getX = function() {
    if (this.palletPiece) {
        return this.x
    }
    return this.game.background.x + this.x;

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
Entity.prototype.isSelected = function() {
    return this.game.ghostWO && this.game.ghostWO.type === this.type; 
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
    this.bgImages = [];
    this.worldItems = [ new QuestionBox(555, 450, game), new ShineyGoldBox(580, 450, game), new ShineyBlueBox(605, 450, game), 
                       new ColorFullExclamation(630, 450, game), new PinkMusicNote(655, 450, game),new WhiteMusicNote(680, 450, game), new PowBox(705, 450, game), 
                    new StaticGoldBlock(730, 450, game), new BrownBlock(755, 450, game), new Coin(780, 450, game), new GreenPipe(805, 450, game), new Pole(840, 450, game, .40), new Castle(860, 450, game, .65)];
    for (var i = 0; i < this.worldItems.length; i++) {
        this.worldItems[i].palletPiece = true;
     }   
    this.init_x = init_x;
    this.init_y = init_y;
    this.prevMouse = {};
    this.length = length;
    this.selected = selected;
    this.editor = 'background';
    this.isGameBoardSelected = false;
    this.backgroundx = 0;
    this.ghostMario = new Mario(5,460, game);
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
    this.enemy.palletPiece = true;
}
BackgroundEditor.prototype = new Entity();
BackgroundEditor.prototype.constructor = BackgroundEditor;

BackgroundEditor.prototype.update = function() {
    if (this.game.key) {
        var code = this.game.key.keyCode;
        if (this.editor === 'background')
            if (code === 39 && this.backgroundx < this.init_x)
                this.backgroundx += 15;
            else if (code === 37 && -this.backgroundx < 6 *(this.x_sum / 10) - 6)
                this.backgroundx -= 15;
       // console.log(this.isGameBoardSelected);
        if (this.isGameBoardSelected)
             if (code === 39 && this.game.background.x < 0)
                this.game.background.x += 15;
            else if (code === 37 && -(this.game.background.x )  <= this.game.background.sizex * (this.game.background.length - 2) - 15)
                this.game.background.x  -= 15;
        // console.log(-(this.game.background.x )   + " " + (this.game.background.sizex * (this.game.background.length - 1)));        
    }
   // console.log(this.game.click);
    if (this.game.click) {
        var click = this.game.click;
        if (click.y >256) {
            this.isGameBoardSelected = false;
        }
        if ((click.y > 283 && click.y <= 403)) {
            this.game.extension.hide();
                this.game.coin.hide();
            for (var i = 0; i < this.bgImages.length; i++) {
                var bg = this.bgImages[i];
                bg.x = this.backgroundx + bg.init_x;
                if( click && (this.editor === 'background' || this.editor === '') && click.y <= 403 && click.y >= 283 && click.x >= bg.x && click.x <= bg.x + 250 ) {
                    
                     
                     if (this.selected === i + 1) {
                        if (this.editor === 'background') {
                            console.log('turn off background');
                            this.editor = '';
                            this.game.levellength.hide();
                        } else if (this.editor === '') {

                            console.log('turn on background');
                            this.editor = 'background';
                            this.game.levellength.show();
                        }
                    } else {
                        this.selected = i + 1;
                         this.game.background = new BackGround(0,0,this.game, this.length, i +1);
                        console.log('turn on background');
                        this.editor = 'background';
                        this.game.levellength.show();
                        
                    }
                    break;
                }
            }
        } else if (click.y > 256 && click.y <= 283) {
             if (this.editor === 'background') {
                console.log('turn off background');
                this.editor = '';
                this.game.levellength.hide();
            } else if (this.editor === '') {

                console.log('turn on background');
                this.editor = 'background';
                this.game.levellength.show();
            }
            
        } else if (click.y < 512 && click.y>=430 && click.x >0 && click.x < 50) {
            if (this.editor === 'mario')
                this.editor = '';
            else
                this.editor = 'mario';
            this.ghostMario.x = click.x - 20;
            this.ghostMario.y = click.y - 20;
            this.game.levellength.hide();
            this.game.extension.hide();
            this.game.coin.hide();
        } else if (click.y < 256 && click.y > 0 && click.x > 0 && click.x < 1024) {
            if (!this.isGameBoardSelected && this.editor === '')
                this.isGameBoardSelected = true;
           
            var mario = this.game.mario;
            if (mario &&  click.x>= mario.boundingbox.left && click.x <= mario.boundingbox.right && click.y>= mario.boundingbox.top && click.y <= mario.boundingbox.bottom) {
                this.game.mario = null;
            } else if (this.editor === 'mario'&& !mario) {
                this.game.mario = new Mario(this.ghostMario.x, this.ghostMario.y, this.game);
            }
            if (this.editor === '' ) {
                var entities = this.game.entities;
                for (var i = 0; i < entities.length; i++) {
                    var entity = entities[i];
                    if(entity.boundingbox && click.x  >= entity.boundingbox.left && click.x <= entity.boundingbox.right && click.y >= entity.boundingbox.top && click.y <= entity.boundingbox.bottom) {
                        if (entity.type === 'Enemy' ) {
                             this.editor = 'enemy';
                            //this.game.entities = entities.splice(i,1);
                            entity.removeFromWorld = true;
                        } else if (entity.type != 'Mario' || entity.type != 'Enemy') {
                            this.editor = 'worldobjects';
                            this.ghostWO = entity;
                            entity.removeFromWorld = true;

                        }
                    }
                }

            } else if (this.editor === 'enemy' ) {
                this.game.addEntity(new Enemy(this.ghostEnemy.x, this.ghostEnemy.y, this.game));
            } else if (this.editor === 'worldobjects') {
                this.game.addEntity(this.makeWO(this.ghostWO.type, this.ghostWO.x, this.ghostWO.y));
            }

        } else if (click.y < 512 && click.y>=430 && click.x > 50 && click.x < 450) {
            this.game.levellength.hide();
            this.game.extension.hide();
            this.game.coin.hide();
            console.log('enemy');
            if (this.editor === 'enemy')
                this.editor = '';
            else
                this.editor = 'enemy';
            this.ghostEnemy.x = click.x - 24;
            this.ghostEnemy.y = click.y - 20;
        } else if (click.y < 512 && click.y>=430 && click.x > 450 && click.x < 1024) {
            this.makeGhostWO(click.x, click.y);
            this.game.levellength.hide();       
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
        } else if (this.editor === 'worldobjects') {
            this.ghostWO.x = hover.x - 10;
            this.ghostWO.y = hover.y - 10;
            if (this.ghostWO.type === 'pipe')
                this.ghostWO.update();
        }
    }
    
    
}

BackgroundEditor.prototype.makeGhostWO = function(x, y) {
    var items = this.worldItems;
    var type = null;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (x >= item.boundingbox.left && x <= item.boundingbox.right && y >= item.boundingbox.top && y <= item.boundingbox.bottom) 
            type = item.type;
    }
    if (type) {
        if (this.ghostWO && type === this.ghostWO.type) {
            this.editor = '';
            this.game.extension.hide();
            this.game.coin.hide();
        } else if (this.editor != 'worldobjects') {
            this.editor = 'worldobjects';
            this.ghostWO = this.makeWO(type, item.x, item.y);
        } else 
            this.ghostWO = this.makeWO(type, item.x, item.y);
        
        if (this.ghostWO.type === 'pipe')
           this.game.extension.show();
        else if (this.ghostWO.type === 'question' || this.ghostWO.type ==='brick') {
            this.game.coin.show();
        } else {
            this.game.extension.hide();
            this.game.coin.hide();
        }
    }
    
}

BackgroundEditor.prototype.makeWO = function(type, x, y) {
    switch(type) {
        case 'question':
           return  new QuestionBox(x, y, this.game);
        case 'shineygold':
           return  new ShineyGoldBox(x, y, this.game);
        case 'blue':
           return  new ShineyBlueBox(x, y, this.game);
        case 'exclamation':
           return  new ColorFullExclamation(x, y, this.game);
        case 'whitenote':
           return  new WhiteMusicNote(x, y, this.game);
        case 'pinknote':
           return  new PinkMusicNote(x, y, this.game);
        case 'pow':
           return  new PowBox(x, y, this.game);
        case 'brick':
           return  new StaticGoldBlock(x, y, this.game);
        case 'pipe':
            var ext = this.ghostWO?(this.ghostWO.extensions?this.ghostWO.extensions.length:0):0;
           return  new GreenPipe(x, y, this.game, ext);
        case 'pole':
           return  new Pole(x, y, this.game);
        case 'castle':
           return  new Castle(x, y, this.game);
        case 'coin':
           return  new Coin(x, y, this.game);
        case 'brownblock':
            return new BrownBlock(x,y,this.game);
        default :
           return null;
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

     if (this.editor === 'worldobjects') {
        ctx.fillStyle = 'rgba(255,0, 0, 100)';
        ctx.fillRect(635,418, 95, 15);
        ctx.fillStyle = 'white';
        ctx.fillText("World Objects",635,430);
        ctx.fillStyle = fill;

    } else
         ctx.fillText("World Objects",635,430);
    if (this.isGameBoardSelected) {
        ctx.strokeRect(0, 0, 1024, 256);
    }
  
    ctx.moveTo(5, 275);
    ctx.lineTo(1024-5, 275);
    ctx.stroke();
   
    ctx.moveTo(5, 435);
    ctx.lineTo(1024-5, 435);
    ctx.stroke();
    for (var i =0; i < this.worldItems.length; i++) {
        this.worldItems[i].draw(ctx);
    }

   
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
    if (this.editor === 'worldobjects') {
        ctx.globalAlpha = 0.5;
        this.ghostWO.draw(ctx);
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
    this.init_x = init_x;
    this.init_y= init_y;
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
    // if (!this.ghost) {
    //     var travelCount = 100;
    //     if(this.direction === 1) {
    //         if(this.x === this.init_x + travelCount) {
    //             this.direction = 0;
    //         } else {
    //             this.x += 1;        
    //         }
    //     } else {
    //         if(this.x === this.init_x) {
    //             this.direction = 1;
    //         } else {
    //             this.x -= 1;
    //         }
    //     }
    // }
    //  this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
}

Enemy.prototype.draw = function(ctx) {
    //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    //console.log(this.sprite);
    //console.log(this.ghost);
    
        this.bounceAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, this.scale);
    
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

function Coin(init_x, init_y, game) {

    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 422, 0, 16, 16, 0.14, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 16, 16);
    this.type = "coin";
    this.isVisible = true;


}

Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    //Entity.prototype.update.call(this);
        this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 16, 16);
}

Coin.prototype.collide = function(other) {
    if(this.isVisible && other.type === "Mario") {
        //gameEngine.points.increment(1);
        this.game.addToScore(10);
        this.game.addCoin();
        this.isVisible = false;
        this.boundingbox = null;
        this.removeFromWorld = true;
    }
}

Coin.prototype.draw = function (ctx) {
    if(this.isSelected())
    ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
        this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y);
}

// QuestionBox, ShineyGoldBox, ShineyBlueBox, ColorFullExclamation, PinkMusicNote,WhiteMusicNote, PowBox, GreenPipe, StaticGoldBlock

//QuestionBox
function QuestionBox(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 205, 1, 17, 16, 0.14, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'question';
    
}

QuestionBox.prototype = new Entity();
QuestionBox.prototype.constructor = QuestionBox;

QuestionBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

QuestionBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.getX(), this.y);

}

//ShineyGoldBox
function ShineyGoldBox(init_x, init_y, game) {
     Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 52, 35, 17, 16, 0.14, 8, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'shineygold';
   
}

ShineyGoldBox.prototype = new Entity();
ShineyGoldBox.prototype.constructor = ShineyGoldBox;

ShineyGoldBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ShineyGoldBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
    ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
     
        this.moveAnimation.drawFrame(this.game.clockTick, ctx,this.getX(), this.y);
    

}

//ShineyBlueBox
function ShineyBlueBox(init_x, init_y, game) {
     Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 378, 60, 17, 16, 0.14, 8, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'blue';
   
}

ShineyBlueBox.prototype = new Entity();
ShineyBlueBox.prototype.constructor = ShineyBlueBox;

ShineyBlueBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ShineyBlueBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
    ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
        this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y);

}

//ColorFullExclamation
function ColorFullExclamation(init_x, init_y, game) {
     Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 205, 18, 17, 16, 0.30, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'exclamation';
   
}

ColorFullExclamation.prototype = new Entity();
ColorFullExclamation.prototype.constructor = ColorFullExclamation;

ColorFullExclamation.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

ColorFullExclamation.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
    ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
        this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y);

}

//PinkMusicNote
function PinkMusicNote(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 69, 17, 16, 0.20, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'pinknote';
    
}

PinkMusicNote.prototype = new Entity();
PinkMusicNote.prototype.constructor = PinkMusicNote;

PinkMusicNote.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

PinkMusicNote.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
    ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
     
        this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y);

}
// 

//WhiteMusicNote
function WhiteMusicNote(init_x, init_y, game) {
     Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 52, 17, 16, 0.20, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'whitenote';
   
}

WhiteMusicNote.prototype = new Entity();
WhiteMusicNote.prototype.constructor = WhiteMusicNote;

WhiteMusicNote.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

WhiteMusicNote.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);

        this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y);

}


//PowBox
function PowBox(init_x, init_y, game) {
     Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 35, 18, 17, 16, 0.14, 3, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.type = 'pow';
   
}

PowBox.prototype = new Entity();
PowBox.prototype.constructor = PowBox;

PowBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
}

PowBox.prototype.draw = function (ctx) {
    //console.log(this.sprite);
    //this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    if(this.isSelected())
     ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
     
         ctx.drawImage(this.sprite,
                  35, 18,  // source from sheet
                  17, 16,
                   this.getX(), this.y,
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

function BrownBlock(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/castlepole.gif');
    this.type = 'brownblock';
    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20);
}
BrownBlock.prototype = new Entity();
BrownBlock.prototype.constructor = BrownBlock;
BrownBlock.prototype.draw = function (ctx) {
    

    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
         ctx.drawImage(this.sprite,
                  115, 493,  // source from sheet
                  21, 21,
                   this.getX(), this.y,
                  21,
                  21);
    
     
}

BrownBlock.prototype.update = function () {
   // Entity.prototype.update.call(this);
   this.boundingbox = new BoundingBox(this.getX(), this.y, 20,20);
  

}


//Green pipe
function GreenPipe(init_x, init_y, game, extLength) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/pipe.png');
    //this.moveAnimation = new Animation(this.sprite, 1, 1, 17, 16, 0.22, 4, true, false);
    this.init_x = init_x;
    this.init_y = init_y;
    this.type = 'pipe';
    this.extensions = [];
    console.log(extLength);
    if(extLength)
        this.setExtensions(extLength);
    this.boundingbox = new BoundingBox(this.x+1, this.y + 3, 32, 49);
}

GreenPipe.prototype = new Entity();
GreenPipe.prototype.constructor = GreenPipe;

GreenPipe.prototype.update = function () {
   // Entity.prototype.update.call(this);
   this.boundingbox = new BoundingBox(this.x+1, this.y + 3, 32, 49 + 14 * this.extensions.length - this.extensions.length );
   var ext = this.extensions;
   for (var i = 0 ; i < ext.length; i++) {
        ext[i].x = this.x;
        ext[i].y = this.y + 49 + 14 * i;
    }

}

GreenPipe.prototype.setExtensions = function(count) {
    var bottom = this.y + 49;
    this.extensions = [];
    //var offset = (j*14)-8 + ((4-count) * 14);
    for (var i = 0; i < count; i++) {
        this.extensions.push(new GreenPipeExtension(this.x, bottom + i * 14 , this.game));
    }
    this.boundingbox = new BoundingBox(this.x+1, this.y + 3, 32, 49 + 14 * count - count);

}

GreenPipe.prototype.draw = function (ctx) {
    

    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
         ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 51,
                   this.getX(), this.y,
                  35,
                  51);
     for (var i = 0; i < this.extensions.length; i++) {
        this.extensions[i].draw(ctx);
     }
     
}

//Green pipe Extension   - Works up to height 5 ONLY. 
function GreenPipeExtension(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/pipeextension.png');
    this.type = "PipeExt";
    this.boundingbox = new BoundingBox(this.x+1, this.y, 32, 15);

}

GreenPipeExtension.prototype = new Entity();
GreenPipeExtension.prototype.constructor = GreenPipeExtension;

GreenPipeExtension.prototype.update = function () {
   this.boundingbox = new BoundingBox( this.game.background.x + this.x+1, this.y, 32, 15);
}

GreenPipeExtension.prototype.draw = function (ctx) {
                //ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
                ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 15,
                   this.game.background.x + this.x, this.y,
                  35,
                  15);

}

function Castle(init_x, init_y, game, scale) {
    this.sprite = ASSET_MANAGER.getAsset('../images/castlepole.gif');
     
      Entity.call(this, game, init_x, init_y, scale);
      this.type = "castle";
     this.boundingbox = new BoundingBox(this.x , this.y , 103 * scale, 81 * scale);
   
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.update = function () {
        if(!this.palletPiece)
            this.boundingbox = new BoundingBox(this.game.background.x + this.x , this.y , 103 * this.scale, 81 * this.scale);
}

Castle.prototype.draw = function (ctx) {
    if(this.isSelected())
     ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
    ctx.strokeStyle = style;
                ctx.drawImage(this.sprite,
                  0, 482,  
                  103, 81,
                   this.getX(), this.y,
                  103 * this.scale,
                  81 * this.scale);
                 var style = ctx.strokeStyle;
    ctx.strokeStyle = 'red';
}

Castle.prototype.collide = function(entity) {
    
    if (entity.type === 'Mario') {
        this.game.finishedLevel = true;
    }
}

function Pole(init_x, init_y, game, scale) {
     Entity.call(this, game, init_x, init_y, scale);
    var games = game;
    this.sprite = ASSET_MANAGER.getAsset('../images/castlepole.gif');
     this.type = "pole";
     this.moveAnimation = new Animation(this.sprite, 115, 520, 20, 20, 0.14, 4, true, true);

     this.boundingbox = new BoundingBox(this.x + 5, this.y, 28* this.scale,
                  140* this.scale);
     this.topVariable = this.y + 135;
     this.flagY = this.y;
     this.isLowering = false;
}

Pole.prototype = new Entity();
Pole.prototype.constructor = Pole;

Pole.prototype.update = function () {
                
}

Pole.prototype.draw = function (ctx) {
    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    ctx.drawImage(this.sprite,
      400, 458,  
      52, 220,
       this.getX(), this.y,
      52* this.scale,
      180* this.scale);
      this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.getX() + (23 * this.scale), this.flagY + (15 * this.scale), this.scale);
                


}

Pole.prototype.collide = function(other) {
    if(other.type === "Mario" && !this.isLowering) {
        this.isLowering = true;
        console.log("Collision with flag - Now lowering");
    }
}

//StaticGoldBlock
function StaticGoldBlock(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/levelRemovedBorder1.png');
    this.type = 'brick';
    this.boundingbox = new BoundingBox(this.x , this.y, 17, 16);
}

StaticGoldBlock.prototype = new Entity();
StaticGoldBlock.prototype.constructor = StaticGoldBlock;

StaticGoldBlock.prototype.update = function () {

}

StaticGoldBlock.prototype.draw = function (ctx) {
    if(this.isSelected())
        ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
    
         ctx.drawImage(this.sprite,
                  1, 35,  
                  16, 16,
                  this.getX(), this.y,
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
ASSET_MANAGER.queueDownload('../images/castlepole.gif');
ASSET_MANAGER.queueDownload('../images/pipeextension.png');
ASSET_MANAGER.queueDownload('../images/mariolevels.png');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();

    gameEngine.addEntity(gameboard);
    // need to add controls
    var coin = $('<div id="extension">');
    var coinlab = $('<span>').text('Number of Coins');
    var editArea = $('#editarea');
    var extension = $('<div id="extension">');
    var extlabel = $('<span>').text('Number of extentions');
    var levellength = $('<div id="length">');
    var levelLabel = $('<span>').text('Level length: ');
    levelLabel.css('margin-left', '10px');
    var levels = $('<select id="levels">');
    for (var i = 4; i < 20; i++)
        levels.append($('<option>').val(i).text(i));
    var extensions= $('<select id="extensions">');
    for (var i = 0; i < 13; i++)
        extensions.append($('<option>').val(i).text(i));
    var coins= $('<select id="extensions">');
    coins.append($('<option>').val('How many coins').text('How many coins'));
    coins.append($('<option>').val('random').text('random'));
    for (var i = 0; i < 11; i++)
        coins.append($('<option>').val(i).text(i));
    coin.append(coinlab);
    coin.append(coins);
    coin.hide();
    editArea.append(coin);
    extension.append(extlabel);
    extension.append(extensions);
    extension.hide();
    editArea.append(extension);
    levellength.append(levelLabel);
    levellength.append(levels);
    editArea.append(levellength);
     gameEngine.background = new BackGround(0,0,gameEngine,7,1);
    gameEngine.editor = new BackgroundEditor(0, 256, gameEngine, 1, 4);
    gameEngine.changeEditor(1);
    gameEngine.extension = extension;
    gameEngine.levellength = levellength;
    gameEngine.coin = coin;
   
    levels.change(function() {
         var val = $(this).val();
         gameEngine.editor.length = parseInt(val);
         gameEngine.background.length = parseInt(val);
    });
    extensions.change(function(){
        var val = $(this).val();
        gameEngine.editor.ghostWO.setExtensions(parseInt(val));
    });
    coins.change(function(){
        var val = $(this).val();
        var block = gameEngine.editor.ghostWO;
        if (val === 'random') {
            block.coins = Math.floor(Math.random() * 10) + 1;

        } else
            block.coins = parseInt(val);
        console.log(block);
    });

    

    gameEngine.init(ctx);
    gameEngine.start();
    
   
});