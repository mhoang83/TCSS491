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
    
    for (var i = 0; i < this.entities.length; i++) {

        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.editor.draw(this.ctx);
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

GameEngine.prototype.loadLevel = function(jSonString) {
    if( typeof jSonString === 'string') {
        mainObj = JSON.parse(jSonString);

    } else {

            mainObj = jSonString;
    }
    var levels = mainObj.levels;
    var background = levels.background;
    this.background = new BackGround(background.start_x, background.start_y, this, background.length, background.id);
    this.addEntity(this.background);
    var entities = levels.entities;
    for(var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (entity.type === 'Mario') {
            var mario = new Mario(entity.start_x, entity.start_y, this);
            this.addEntity(mario);
        } else if (entity.type !== 'Entity') {

            switch(this.superType(entity.type)) {
                case 'World Object':
                    var obj = this.makeWO(entity.type,entity.start_x, entity.start_y);
                    if (entity.coins)
                        obj.coins = entity.coins;
                    if (entity.extensions)
                        obj.setExtensions(entity.extensions);
                    this.addEntity(obj);
                    break;
                case 'Enemy':
                    this.addEntity(this.makeEnemy(entity.type,entity.start_x, entity.start_y, entity.state));
                    break;
                default:
                    break;
            }   
        }
    }


}
GameEngine.prototype.superType = function(type) {
    switch (type) {
        case 'Goomba': case 'RedKoopa': case 'SkeletalTurtle':
        case 'BonyBeetle':case 'Chomper':
           return  'Enemy';
        case 'question':  case 'shineygold': case 'blue':
        case 'exclamation': case 'whitenote': case 'pinknote':
        case 'pow': case 'brick': case 'pipe':  case 'pole':
        case 'castle': case 'coin': case 'brownblock':
            return 'World Object'
        default:
            'Mario'
    }
}

GameEngine.prototype.makeEnemy = function(type, x,y, init_state) {
    init_state = init_state || 0;
    console.log(type + ' ' + init_state);
    switch(type) {
        case 'Goomba':
           return  new Goomba(x, y, this, init_state);
        case 'RedKoopa':
           return  new RedKoopa(x, y, this);
        case 'SkeletalTurtle':
           return  new SkeletalTurtle(x, y, this);
        case 'BonyBeetle':
           return  new BonyBeetle(x, y, this);
        case 'Chomper':
           return  new Chomper(x, y, this);
        default :
           return null;
    }

}

GameEngine.prototype.makeWO = function(type, x, y) {
    switch(type) {
        case 'question':
           return  new QuestionBox(x, y, this);
        case 'shineygold':
           return  new ShineyGoldBox(x, y, this);
        case 'blue':
           return  new ShineyBlueBox(x, y, this);
        case 'exclamation':
           return  new ColorFullExclamation(x, y, this);
        case 'whitenote':
           return  new WhiteMusicNote(x, y, this);
        case 'pinknote':
           return  new PinkMusicNote(x, y, this);
        case 'pow':
           return  new PowBox(x, y, this);
        case 'brick':
           return  new StaticGoldBlock(x, y, this);
        case 'pipe':
           return  new GreenPipe(x, y, this);
        case 'pole':
           return  new Pole(x, y, this);
        case 'castle':
           return  new Castle(x, y, this);
        case 'coin':
           return  new Coin(x, y, this);
        case 'brownblock':
            return new BrownBlock(x,y,this);
        default :
           return null;
    }
}
GameEngine.prototype.loadLevelOld = function (jSonString, gameEngine) {
    //Change Json String to Javascript Object - parsing
    if( typeof jSonString === 'string') {
        this.mainObj = JSON.parse(jSonString);

    } else {

            this.mainObj = jSonString;
    }
    this.levelObj = this.mainObj.levels;
    this.score = 0;
    this.lives = 3;
    this.coins = 0;
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
    console.log(this.entitiesObj);
    //Players inside Entities 
    this.playersObj = this.entitiesObj.players;

    // need to make it load from json testing now
    //castle inside entitiies obj from json
    gameEngine.addEntity(new Castle(this.entitiesObj.castle.init_x, this.entitiesObj.castle.init_y, gameEngine));

    // pole
    gameEngine.addEntity(new Pole(this.entitiesObj.pole.init_x, this.entitiesObj.pole.init_y, gameEngine));

    // Boss
   // gameEngine.addEntity(new Bowser(this.entitiesObj.boss.init_x, this.entitiesObj.boss.init_y, gameEngine));

    //Mario inside Players
    this.marioObj = this.playersObj.mario;
    this.spriteSheetStr = this.marioObj.spritesheet;
    var mario = new Mario(this.marioObj.init_x, this.marioObj.init_y, gameEngine);
    gameEngine.addEntity(mario);
    gameEngine.mario = mario;

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
                case 9:
                    for (j = 0; j < count; j++) {
                        gameEngine.addEntity(new Coin(blockObject.init_x + (17 * j), blockObject.init_y, gameEngine));
                    }
                    break;
                case 8:

                    //Enables the construction of a green pipe with a variable height using only two sprite sheets,
                    //where the actual height of the pipe is = ((count - the top peice) x 15) 
                    var j;
                    for (j = 0; j < count; j++) {
                        // this will be used after the editor is complete.
                        // var pipe = new GreenPipe(blockObject.init_x, blockObject.init_y, gameEngine);
                        // if (count > 1)
                        //     pipe.setExtensions(count);
                        // gameEngine.addEntity(pipe);
                        if(count === 1){
                            gameEngine.addEntity(new GreenPipe(blockObject.init_x, blockObject.init_y-1, gameEngine));
                        } else if (count > 1 && j == 0) {
                            gameEngine.addEntity(new GreenPipe(blockObject.init_x, (blockObject.init_y +2) - ((count -1) * 15), gameEngine));
                        } else if (count > 1 && j >= 0) {
                            //gameEngine.addEntity(new GreenPipe(blockObject.init_x, blockObject.init_y + 15, gameEngine));
                            var offset = (j*14)-8 + ((4-count) * 14);
                            gameEngine.addEntity(new GreenPipeExtension(blockObject.init_x, (blockObject.init_y + offset), gameEngine));
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
    //this.addEntity(new LevelOver(this));
    
    //Enemies inside Entities
    this.enemiesObj = this.entitiesObj.enemies;

    //Enemies
    for (var key in this.enemiesObj) {
        var enemyGroupArray = this.enemiesObj[key];
        var arrayLength = enemyGroupArray.length;
        for (i = 0; i < arrayLength; i++) {
            var enemyObject = enemyGroupArray[i];
            switch(key) {
                case "goomba":
                    gameEngine.addEntity(new Goomba(enemyObject.init_x, enemyObject.init_y, gameEngine));
                    break;
                case "redkoopa":
                    gameEngine.addEntity(new RedKoopa(enemyObject.init_x, enemyObject.init_y, gameEngine));
                    break;
                case "chomper":
                    gameEngine.addEntity(new Chomper(enemyObject.init_x, enemyObject.init_y, gameEngine));
                    break;
            }
            
        }
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
Entity.prototype.toJSON = function() {
    var json = {};
    json.type = this.type;
    json.start_x = this.x;
    json.start_y = this.y;
    if(this.sprite)
        json.spritesheet = this.sprite.src.substring(30);
    if(this.extensions)
        json.extensions = this.extensions.length;
    if (this.coins)
        json.coins = this.coins;
    if (this.state)
        json.state = this.state;
    return json;
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

   
     Entity.call(this, game, init_x, init_y);
      this.type = "Mario";
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
     this.enemys = [new Goomba(160, 449, game, 1), new Goomba(200, 449, game), new RedKoopa(230, 449, game), new BonyBeetle(285, 449, game), new SkeletalTurtle(310, 449, game), new Chomper(340, 449, game)]; 
     for (var i = 0; i < this.enemys.length; i++) {
        if ( i == 0)
            console.log(this.enemys[i]);
        this.enemys[i].palletPiece = true;
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
    
    //this.enemy.palletPiece = true;
}
BackgroundEditor.prototype = new Entity();
BackgroundEditor.prototype.constructor = BackgroundEditor;

BackgroundEditor.prototype.update = function() {
    if (this.game.key) {
        var code = this.game.key.keyCode;
        if (this.editor === 'background') {
            if (code === 39 && this.backgroundx < this.init_x)
                this.backgroundx += 15;
            else if (code === 37 && -this.backgroundx < 6 *(this.x_sum / 10) - 6)
                this.backgroundx -= 15;
            for (var i = 0; i < this.bgImages.length; i++) {
                var bg = this.bgImages[i];
                bg.x = this.backgroundx + bg.init_x;
            }
        }
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
                this.game.line.hide();
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
            this.game.line.hide();
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

                    if(entity.boundingbox && click.x >= entity.boundingbox.left && click.x <= entity.boundingbox.right && click.y >= entity.boundingbox.top && click.y <= entity.boundingbox.bottom) {
                        if (this.superType(entity.type) === 'Enemy' ) {
                             this.editor = 'enemy';
                            //this.game.entities = entities.splice(i,1);
                            this.ghostEnemy = entity;
                            entity.palletPiece = true;
                             console.log(entity);
                            entity.removeFromWorld = true;
                        } else if (this.superType(entity.type) === 'World Object') {
                            this.editor = 'worldobjects';
                             entity.palletPiece = true;
                            this.ghostWO = entity;
                             console.log(entity);
                            entity.removeFromWorld = true;

                        }
                    }
                }

            } else if (this.editor === 'enemy' ) {
                this.game.addEntity(this.makeEnemy(this.ghostEnemy.type, this.ghostEnemy.x - this.game.background.x, this.ghostEnemy.y, this.ghostEnemy.state));
            } else if (this.editor === 'worldobjects') {
                if (this.stairs && this.stairs.length > 0) {
                    for (var i = 0; i < this.stairs.length; i++) {
                        for (var j = 0; j <= i; j++) {
                           this.game.addEntity(this.makeWO(this.ghostWO.type, this.stairs[i][j].x - this.game.background.x,  this.stairs[i][j].y));
                        }
                    }
                    $('#stairheight').val("1");
                    this.stairs = [];
                } else
                if (this.ghostWOLine && this.ghostWOLine.length > 0) {
                    for (var i = 0; i < this.ghostWOLine.length; i++) {
                        this.game.addEntity(this.makeWO(this.ghostWO.type, this.ghostWOLine[i].x - this.game.background.x,  this.ghostWOLine[i].y));
                    }
                    this.ghostWOLine = [];
                    $('#lineblocks').val("1");
                    $('#coins').val("none");
                    //console.log(this.game.line);
                } else {
                    var wo = this.makeWO(this.ghostWO.type, this.ghostWO.x - this.game.background.x, this.ghostWO.y)
                    this.game.addEntity(wo);
                    if(this.ghostWO.coins)
                        wo.coins = this.ghostWO.coins;
                    $('#coins').val("none");
                }
            }

        } else if (click.y < 512 && click.y>=430 && click.x > 50 && click.x < 450) {
            this.game.levellength.hide();
            this.game.extension.hide();
            this.game.coin.hide();
            this.game.line.hide();
            console.log('enemy');
            if (this.editor === 'enemy')
                this.editor = '';
            else
                this.editor = 'enemy';
            this.makeGhostEnemy(click.x, click.y);
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
            if (this.ghostWO.type === 'brownblock' && this.stairs && this.stairs.length > 0) {
                var start_x = hover.x - 10 - Math.floor(this.stairs.length / 2 * this.ghostWO.boundingbox.width);
                var start_y = hover.y - 10 + Math.floor(this.stairs.length / 2 * this.ghostWO.boundingbox.height);
                var rev = 1;
                if (this.game.reverse)
                    rev = -1;
                for (var i = 0; i < this.stairs.length; i++) {
                    for (var j = i; j >= 0; j--) {
                        this.stairs[i][j].x = start_x + rev * i * (this.ghostWO.boundingbox.width - 4);
                        this.stairs[i][j].y = start_y - j * (this.ghostWO.boundingbox.height - 4);
                    }
                }

            } else
            if (this.ghostWO.type !== 'pipe' && this.ghostWO.type !== 'pole' && this.ghostWO.type !== 'castle' && this.ghostWOLine && this.ghostWOLine.length > 0) {

               var start_x =  hover.x - 10 - Math.floor(this.ghostWOLine.length / 2 * this.ghostWO.boundingbox.width);
               for (var i = 0 ; i < this.ghostWOLine.length; i ++) {
                this.ghostWOLine[i].x = start_x + (this.ghostWO.boundingbox.width - 1) * i;
                this.ghostWOLine[i].y = hover.y - 10;
               }

            } else {
                this.ghostWO.x = hover.x - 10;
                this.ghostWO.y = hover.y - 10;
                if (this.ghostWO.type === 'pipe')
                    this.ghostWO.update();
            }
        }
    }
    
    
}

BackgroundEditor.prototype.makeGhostEnemy = function(x,y) {
    var items = this.enemys;
    var type = null;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (x >= item.boundingbox.left && x <= item.boundingbox.right && y >= item.boundingbox.top && y <= item.boundingbox.bottom) {
            type = item.type;
            break;
        }
    }
    console.log(item);
    this.ghostEnemy = this.makeEnemy(type, item.x, item.y, item.state);
    this.ghostEnemy.palletPiece = true;
}

BackgroundEditor.prototype.superType = function(type) {
    switch (type) {
        case 'Goomba': case 'RedKoopa': case 'SkeletalTurtle':
        case 'BonyBeetle':case 'Chomper':
           return  'Enemy';
        case 'question':  case 'shineygold': case 'blue':
        case 'exclamation': case 'whitenote': case 'pinknote':
        case 'pow': case 'brick': case 'pipe':  case 'pole':
        case 'castle': case 'coin': case 'brownblock':
            return 'World Object'
        default:
            'Mario'
    }
}

BackgroundEditor.prototype.makeEnemy = function(type, x,y, init_state) {
    init_state = init_state || 0;
    console.log(type + ' ' + init_state);
    switch(type) {
        case 'Goomba':
           return  new Goomba(x, y, this.game, init_state);
        case 'RedKoopa':
           return  new RedKoopa(x, y, this.game);
        case 'SkeletalTurtle':
           return  new SkeletalTurtle(x, y, this.game);
        case 'BonyBeetle':
           return  new BonyBeetle(x, y, this.game);
        case 'Chomper':
           return  new Chomper(x, y, this.game);
        default :
           return null;
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
            this.game.line.hide();
            this.game.staircase.hide();
            this.ghostWO = null;
        } else if (this.editor !== 'worldobjects') {
            this.editor = 'worldobjects';
            this.ghostWO = this.makeWO(type, item.x, item.y);
            if (this.ghostWO.type === 'brownblock') {
                 this.game.line.show();
                 this.game.staircase.show();
            } else
            if (this.ghostWO.type === 'pipe')
               this.game.extension.show();
            else if (this.ghostWO.type === 'question' || this.ghostWO.type ==='brick') {
                this.game.coin.show();
                this.game.line.show();
            } else if (this.ghostWO.type !== 'pipe' && this.ghostWO.type !== 'pole' && this.ghostWO.type !== 'castle'){
                    this.game.line.show();
                    this.game.coin.hide();
            } else {
                this.game.extension.hide();
                this.game.coin.hide();
                this.game.line.hide();
                this.game.staircase.hide();
            }
        } else {
            this.ghostWO = this.makeWO(type, item.x, item.y);
            if (this.ghostWO.type === 'pipe')
               this.game.extension.show();
            else if (this.ghostWO.type === 'question' || this.ghostWO.type ==='brick') {
                this.game.coin.show();
                this.game.line.show();
            } else if (this.ghostWO.type !== 'pipe' && this.ghostWO.type !== 'pole' && this.ghostWO.type !== 'castle'){
                    this.game.line.show();
                    this.game.coin.hide();
            } else {
                this.game.extension.hide();
                this.game.coin.hide();
                this.game.line.hide();
                 this.game.staircase.hide();
            }
        }
        if (this.ghostWO)
        this.ghostWO.palletPiece = true;
        //if (this.editor === ' worldobjects')
            
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
        if (this.stairs && this.stairs.length > 0) {
            for (var i = 0; i < this.stairs.length; i++) {
                for (var j = 0; j <= i; j++) {
                    this.stairs[i][j].draw(ctx);
                }
            }

        } else
        if (this.ghostWO.type !== 'pipe' && this.ghostWO.type !== 'pole' && this.ghostWO.type !== 'castle'&& this.ghostWOLine &&this.ghostWOLine.length > 0) {
            for(var i = 0; i < this.ghostWOLine.length; i++){
                this.ghostWOLine[i].draw(ctx);
            }
        } else {
            this.ghostWO.draw(ctx);
        }
        ctx.globalAlpha = 1;
    }
    for (var i = 0; i < this.enemys.length; i++) {
        this.enemys[i].draw(ctx);
    };
    //this.enemy.draw(ctx);
    this.mario.draw(ctx);
     ctx.strokeStyle = style;
     ctx.lineWidth= width; 
     ctx.fillStyle = fill;
}
BackgroundEditor.prototype.save = function() {
    var level = {};
    //level.id = this.id;
    var levels = {};
    level.levels = levels;
    levels.id = this.game.level; 
    levels.background = this.game.background.toJSON();
    levels.description = this.game.description;
    var entities = [];
    for (var i = 0; i < this.game.entities.length; i++){
        entities.push(this.game.entities[i].toJSON());
    }
    levels.entities = entities;
    return JSON.stringify(level);
}


//Enemy Code -- TODO: Enemies will have to be in some type of collection.
// function Enemy(init_x, init_y, game, scale) {
//     Entity.call(this, game, init_x, init_y);
//     var frameWidth = 50;
//     var frameHeight = 25;
//     this.init_x = init_x;
//     this.init_y= init_y;
//     this.type = 'Enemy';
//     this.scale = scale || 1.1;
//     this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
//     // this.bounceAnimation = new Animation(this.sprite, 0, 0, frameWidth, frameHeight, .4, 2, true, false );
//     // this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
//     this.init_x = init_x;
//     // this.direction = 1;
    
    
// }



// //Enemy Base Class
function Enemy(init_x, init_y, game) {
    this.frameWidth = 50;
    this.frameHeight = 25;
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    
    //Call Entity constructor
    Entity.call(this, game, init_x, init_y);
}

Enemy.prototype = new Entity();
Enemy.prototype.constructor = Enemy;

// Enemy.prototype = new Entity();
//End Enemy Base Class

//Goomba code
function Goomba(init_x, init_y, game, initial_state) {
    //Call Enemy super constructor
    console.log(init_x + ' ' + init_y);
    //this.prototype = new Enemy();
     Entity.call(this, game,init_x, init_y);
    this.frameWidth = 50;
    this.frameHeight = 25;
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    console.log(this.prototype);
    this.squished = false;
    this.direction = 1;
    this.state = initial_state || 0;
    this.type = "Goomba"; 
    this.wingedoffset = (this.state)?12:0;
    this.boundingbox = new BoundingBox(this.x + 17 + this.wingedoffset, this.y + 5, 17, 16);
    this.dewinged_animation = new Animation(this.sprite, 0, 0, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.winged_animation = new Animation(this.sprite, 90, 0, this.frameWidth, this.frameHeight, .4, 4, true, false);
    this.current_animation = (this.state === 1) ? this.winged_animation : this.dewinged_animation;

    this.cycleCount = 0;
}

Goomba.prototype = new Entity();
Goomba.prototype.constructor = Goomba;

Goomba.prototype.draw = function(ctx) {
    if(this.squished) {
        ctx.drawImage(this.sprite,
                  this.frameWidth * 6, 0, 
                  this.frameWidth, this.frameHeight,
                  this.game.background.x + this.x, this.y + 5,
                  this.frameWidth * 1,
                  this.frameHeight * 1);
            this.cycleCount += 1;
        if(this.cycleCount === 10) {
            this.removeFromWorld = true;
        }
    } else {
        //console.log('drawing goomba');
        //ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
         this.current_animation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, 1.1);
    }
}

Goomba.prototype.update = function() {
    // if(!this.squished) {
    //     if(this.direction === 1) {
    //         this.x += 1;        
    //     } else {
    //         this.x -= 1;
    //     }
    // }
     this.boundingbox = new BoundingBox( this.getX() + 17, this.y + 5, 17, 16);

}

Goomba.prototype.collide = function(other) {
    

    // if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
    //         //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
    //         (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
    //                 this.direction = 0;
    // } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
    //         //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
    //         (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
    //                 this.direction = 1;

    // } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
    //     this.game.addToScore(100);
    //     this.squished = true;
    //     this.removeFromWorld = true;
    // } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
    //     other.boundingbox.left <= this.boundingbox.right)
    //     && other.type === 'Mario') {
    //     this.game.isDead = true;
    // } 
}
//End Goomba

//Red Koopa code
function RedKoopa(init_x, init_y, game) {
    //Call Enemy super constructor
     Entity.call(this, game,init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    this.frameWidth = 40;
    this.frameHeight = 30;
    this.direction = 1;
    this.type = "RedKoopa"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 20, 25);
    this.right_animation = new Animation(this.sprite, 200, 248, this.frameWidth, this.frameHeight, .4, 4, true, false);
    this.left_animation = new Animation(this.sprite, 40, 248, this.frameWidth, this.frameHeight, .4, 4, true, true);
    this.current_animation = this.right_animation;
}
RedKoopa.prototype = new Entity();
RedKoopa.prototype.constructor = RedKoopa;

RedKoopa.prototype.draw = function(ctx) {
    /*
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    
    ctx.drawImage(this.sprite,
                  40, 248, 
                  this.frameWidth, this.frameHeight,
                  this.game.background.x + this.x, this.y,
                  this.frameWidth * 1,
                  this.frameHeight * 1);*/
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, 1.1);
}

RedKoopa.prototype.update = function() {    
    // if(this.direction === 1) {
    //     this.x += 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 5, 20, 25);        
    // } else {
    //     this.x -= 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y + 5, 20, 25);
    // }
    this.boundingbox = new BoundingBox( this.getX() + 17, this.y + 5, 20, 25);
    

}

RedKoopa.prototype.collide = function(other) {
       
    // if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
    //         //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
    //         (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
    //             this.direction = 0;
    //         this.current_animation = this.left_animation;
    // } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
    //         //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
    //         (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
    //                 this.direction = 1;
    //                 this.current_animation = this.right_animation;
    // } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
    //     this.game.addToScore(100);
    //     this.squished = true;
    //     this.removeFromWorld = true;
    // } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
    //     other.boundingbox.left <= this.boundingbox.right)
    //     && other.type === 'Mario') {
    //     this.game.isDead = true;
    // } 
}
//End RedKoopa

//Skeletal Turtle code
function SkeletalTurtle(init_x, init_y, game) {
    //Call Enemy super constructor
     Entity.call(this, game,init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "SkeletalTurtle"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y, 20, 30);
    this.right_animation = new Animation(this.sprite, 200, 298, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.left_animation = new Animation(this.sprite, 110, 298, this.frameWidth, this.frameHeight, .4, 2, true, true);
    this.current_animation = this.right_animation;
}

SkeletalTurtle.prototype = new Entity();
SkeletalTurtle.prototype.constructor = SkeletalTurtle;

SkeletalTurtle.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, 1.1);
}

SkeletalTurtle.prototype.update = function() {    
    // if(this.current_animation === this.right_animation) {
    //     this.x += 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y, 20, 30);        
    // } else if(this.current_animation === this.left_animation){
    //     this.x -= 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y, 20, 30);
    // } 
    this.boundingbox = new BoundingBox( this.getX() + 17, this.y, 20, 30);
}

SkeletalTurtle.prototype.collide = function(other) {
       
    // if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && !other.passThrough) { //Collsion from the right
    //     this.current_animation = this.left_animation;
    // } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && !other.passThrough) { //Collsion from the left
    //     this.current_animation = this.right_animation;
    // } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
    //     this.game.addToScore(100);
    //     this.squished = true;
    //     this.removeFromWorld = true;
    // } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
    //     other.boundingbox.left <= this.boundingbox.right)
    //     && other.type === 'Mario') {
    //     this.game.isDead = true;
    // } 
}
//End SkeletalTurtle

//BonyBeetle Code
function BonyBeetle(init_x, init_y, game) {
    //Call Enemy super constructor
     Entity.call(this, game,init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "BonyBeetle"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y, 20, 30);
    this.right_animation = new Animation(this.sprite, 110, 745, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.left_animation = new Animation(this.sprite, 0, 745, this.frameWidth, this.frameHeight, .4, 2, true, true);
    this.current_animation = this.right_animation;
}

BonyBeetle.prototype = new Entity();
BonyBeetle.prototype.constructor = BonyBeetle;

BonyBeetle.prototype.draw = function(ctx) {
     
    /*
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    
    ctx.drawImage(this.sprite,
                  110, 745, 
                  this.frameWidth, this.frameHeight,
                  this.game.background.x + this.x, this.y,
                  this.frameWidth * 1,
                  this.frameHeight * 1);*/
   
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, 1.1);
}

BonyBeetle.prototype.update = function() {    
    // if(this.current_animation === this.right_animation) {
    //     this.x += 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y + 10, 20, 15);        
    // } else if(this.current_animation === this.left_animation){
    //     this.x -= 1;
    //     this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 10, 20, 15);
    // } 
    this.boundingbox = new BoundingBox( this.getX() + 17, this.y + 10, 20, 15);
}

BonyBeetle.prototype.collide = function(other) {
       
    // if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && !other.passThrough) { //Collsion from the right
    //     this.current_animation = this.left_animation;
    // } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && !other.passThrough) { //Collsion from the left
    //     this.current_animation = this.right_animation;
    // } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
    //     this.game.isDead = true;
    // } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
    //     other.boundingbox.left <= this.boundingbox.right) 
    //     && other.type === 'Mario') {
    //     this.game.isDead = true;
    // } 
}
//End BonyBeetle

//Chomper code
function Chomper(init_x, init_y, game) {
    //Call Enemy super constructor
    Entity.call(this, game,init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('../images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "Chomper"; 
    this.boundingbox = new BoundingBox(this.game.background.x + this.x + 15, this.y + 5, 20, 25);
    this.chomp_animation = new Animation(this.sprite, 0, 345, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.current_animation = this.chomp_animation;
}

Chomper.prototype = new Entity();
Chomper.prototype.constructor = Chomper;

Chomper.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.getX(), this.y, 1.1);
}

Chomper.prototype.update = function() {    
    this.boundingbox = new BoundingBox(this.getX()+ 15, this.y + 5, 20, 25);
}

Chomper.prototype.collide = function(other) {
    // if((other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top) || 
    //     (other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
    //     other.boundingbox.left <= this.boundingbox.right)
    //     && other.type === 'Mario') { //Check for top collision
    //     this.game.isDead = true;
    // } 
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
        this.boundingbox = new BoundingBox(this.getX(), this.y, 16, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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

BackGround.prototype.toJSON = function() {
    var json = {};
    json.id = this.id;
    json.spritesheet = '/images/mariolevels.png';
    json.start_x = 0;
    json.start_y = 0;
    json.sizex = this.sizex;
    json.sizey = this.sizey;
    json.length = this.length;
    return json;
}

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
   this.boundingbox = new BoundingBox(this.getX()+1, this.y + 3, 32, 49 + 14 * this.extensions.length - this.extensions.length );
   var ext = this.extensions;
   for (var i = 0 ; i < ext.length; i++) {
        ext[i].x = this.getX();
        ext[i].y = this.y + 49 + 14 * i;
    }

}

GreenPipe.prototype.setExtensions = function(count) {
    var bottom = this.y + 49;
    this.extensions = [];
    //var offset = (j*14)-8 + ((4-count) * 14);
    for (var i = 0; i < count; i++) {
        this.extensions.push(new GreenPipeExtension(this.getX(), bottom + i * 14 , this.game));
    }
    this.boundingbox = new BoundingBox(this.getX()+1, this.y + 3, 32, 49 + 14 * count - count);

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
   //this.boundingbox = new BoundingBox(this.x+1, this.y, 32, 15);
}

GreenPipeExtension.prototype.draw = function (ctx) {
                //ctx.strokeRect(this.boundingbox.left, this.boundingbox.top, this.boundingbox.width, this.boundingbox.height);
                ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 15,
                    this.x, this.y,
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
            this.boundingbox = new BoundingBox(this.getX() , this.y , 103 * this.scale, 81 * this.scale);
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
     this.bottomBlock = new BrownBlock(this.x + 14, this.y + 128, game);
     this.game.addEntity(this.bottomBlock);
}

Pole.prototype = new Entity();
Pole.prototype.constructor = Pole;

Pole.prototype.update = function () {
                this.flagY = this.y;
                 this.boundingbox = new BoundingBox(this.getX() +5, this.y, 28* this.scale,
                  140* this.scale);
                // this.bottomBlock.x = this.x + 20;
                // this.bottomBlock.y = this.y + 100;
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
        this.bottomBlock.draw(ctx);


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
    this.boundingbox = new BoundingBox(this.getX(), this.y, 17, 16);
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

//Bowser the Boss
function Bowser(init_x, init_y, game) {

    Entity.call(this, game, init_x, init_y);
    this.isRight = false;
    this.isJumping = false;
    this.isWalking = false;
    this.isStunned = false;
    this.timeToShoot = false;
    this.ticker = 0;
    this.sprite = ASSET_MANAGER.getAsset('../images/boss_sprite.png');
    this.rightBowserShootAnimation = new Animation(this.sprite, 88, 220, 40, 40, 0.22, 5, true, true);
    this.leftBowserShootAnimation = new Animation(this.sprite, 91, 43, 40, 40, 0.22, 5, true, false);



    this.jumpRightAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.jumpLeftAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.walkRightAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.walkLeftAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 40, 40);
    this.type = "Bowser";
}

Bowser.prototype = new Entity();
Bowser.prototype.constructor = Bowser;

Bowser.prototype.update = function () {
    //Entity.prototype.update.call(this);
        this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 40, 40);
        if(this.isRight) {
            if(this.timeToShoot && this.rightBowserShootAnimation.isDone) {
                //this.timeToShoot = false;
            }
        } else {
            if(this.timeToShoot && this.leftBowserShootAnimation.isDone) {
                //this.timeToShoot = false;
            }
        }

}

Bowser.prototype.collide = function(other) {
    console.log("Bowser collided with Mario");
}

Bowser.prototype.draw = function (ctx) {
    //ctx.strokeStyle = "red";
    //ctx.strokeRect(this.x, this.y, this.rightBowserShootAnimation.frameWidth, this.rightBowserShootAnimation.frameHeight);
    if(this.timeToShoot) {
        //console.log("TIME TO SHOOT: " + this.timeToShoot);
        var direction = "left";
            if(this.isRight) {
                direction = "right";
            }
            //console.log("IS FACING: " + direction);
        if(this.isRight) {

            this.rightBowserShootAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y);
        } else {
            this.leftBowserShootAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y);
        }

    } else if(this.moveRight) {

    } else if(this.moveLeft) {

    } else if(this.isJumping) {

    } else {
        if(this.isRight) {
                        //this.rightBowserIdleAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y);

                            ctx.drawImage(this.sprite,
                  246, 220,  
                  40, 40,
                   this.game.background.x + this.x, this.y,
                  40,
                  40);

        } else {
                        //this.leftBowserIdleAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y);
                    
                            ctx.drawImage(this.sprite,
                  91, 43,  
                  40, 40,
                   this.game.background.x + this.x, this.y,
                  40,
                  40);

        }

    }
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
    // need to add controls using jquery hide() and show() are jquery functions
     var editArea = $('#editarea');
     var namelevels = $('<select id="namelevels">');
     var load = $('<input type="button" value="Load">');
     var save = $('<input type="button" value="Save">');
     var levelname = $('<input type="text" placeholder="Save As">')
     var revlbl =  $('<span>').text('Reverse Staircase');
     var reverse = $('<input type="checkbox">');
     var staircase = $('<div id="stairs">');
     var stairlbl =  $('<span>').text('Staircase Height');
      var stairheight = $('<select id="stairheight">');
    for (var i = 1; i < 11; i++)
        stairheight.append($('<option>').val(i).text(i));
    staircase.append(stairlbl);
    staircase.append(stairheight);
    staircase.append(revlbl);
    staircase.append(reverse);
    staircase.hide();
    var hline = $('<div id="line">');
    var linelabel = $('<span>').text('Horizontal line of blocks');
    var hlineblocks = $('<select id="lineblocks">');
    for (var i = 1; i < 21; i++)
        hlineblocks.append($('<option>').val(i).text(i));
    hline.append(linelabel);
    hline.append(hlineblocks);
   hline.hide();
    var coin = $('<div id="coin">');
    var coinlab = $('<span>').text('Number of Coins');
   
    var extension = $('<div id="extension">');
    var extlabel = $('<span>').text('Number of extentions');
    var levellength = $('<div id="length">');
    var levelLabel = $('<span>').text('Level length: ');
    levelLabel.css('margin-left', '10px');
    var levels = $('<select id="levels">');
    for (var i = 4; i < 20; i++)
        levels.append($('<option>').val(i).text(i));
    levellength.append(levelLabel);
    levellength.append(levels);
    var extensions= $('<select id="extensions">');
    for (var i = 0; i < 13; i++)
        extensions.append($('<option>').val(i).text(i));
    extension.append(extlabel);
    extension.append(extensions);
    extension.hide();
    var coins= $('<select id="coins">');
    coins.append($('<option>').val('none').text('No Coins'));
    coins.append($('<option>').val('random').text('random'));
    for (var i = 1; i < 11; i++)
        coins.append($('<option>').val(i).text(i));
    coin.append(coinlab);
    coin.append(coins);
    coin.hide();
    editArea.append(coin);
    editArea.append(hline);
    editArea.append(extension);
    editArea.append(staircase);
    editArea.append(levellength);
    editArea.append(namelevels);
    editArea.append(load);
    editArea.append(levelname);
    editArea.append(save);
     gameEngine.background = new BackGround(0,0,gameEngine,7,1);
    gameEngine.editor = new BackgroundEditor(0, 256, gameEngine, 1, 4);
    gameEngine.changeEditor(1);
    gameEngine.extension = extension;
    gameEngine.levellength = levellength;
    gameEngine.coin = coin;
    gameEngine.line = hline;
    gameEngine.staircase = staircase;
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
        if (val === 'random') { // random between 1 and 10
            block.coins = Math.floor(Math.random() * 10) + 1;

        } else
            block.coins = parseInt(val);
    });
    hlineblocks.change(function() {
        var val = $(this).val();
        var editor = gameEngine.editor;
        var ghostWO = editor.ghostWO;
        var ghostWOLine = [];
        console.log(typeof editor.worldItems);
        if (parseInt(val) === 1 || ghostWO.type === 'pipe' ||  ghostWO.type === 'pole' ||  ghostWO.type === 'castle') {
            ghostWOLine = [];
        } else {
            var howmany = parseInt(val);
            var start_x = ghostWO.x - Math.floor(howmany / 2 * ghostWO.boundingbox.width);
            for (var i = 0; i < howmany; i++) {
                ghostWOLine.push(editor.makeWO(ghostWO.type, start_x + i * (ghostWO.boundingbox.width - 1), ghostWO.y));
            }
            console.log(ghostWOLine);
        }
        editor.ghostWOLine = ghostWOLine;
    });
    stairheight.change(function(){
        var val = parseInt($(this).val());
        var stairs = [];
        var editor = gameEngine.editor;
        if (parseInt(val) > 1) {
            stairs = new Array(val);
            for (var i = 0; i < val; i++) {
                stairs[i] = new Array(i + 1);
            }
            var rev = 1;
            if (gameEngine.reverse)
                rev = -1;
             var ghostWO = editor.ghostWO;
            var start_x = ghostWO.x - Math.floor(val / 2 * ghostWO.boundingbox.width);
            var start_y = ghostWO.y + Math.floor(val /2 * ghostWO.boundingbox.height);
            for (var i = 0; i < val; i++) {
                for (var j = i; j >= 0; j--) {
                    stairs[i][j] = editor.makeWO(ghostWO.type, start_x + rev * i * (ghostWO.boundingbox.width - 4), start_y - j * (ghostWO.boundingbox.height - 4));

                }
            }
        } 
        console.log(stairs);
        editor.stairs = stairs;
    });
    reverse.change(function() {
        gameEngine.reverse = $(this)[0].checked;
    });
    save.click(function(){
        var name = levelname.val();
        console.log(name);
        var json = gameEngine.editor.save();
        console.log(json);
        $.post('../services/levelService.php', {save:true, name:name, data:json}, function(data) {
            console.log(data);
            $.get('../services/levelService.php', {levels:true}, function(data) {

                var levelnames = JSON.parse(data).levels;
                    for (var i = 0; i < levelnames.length; i++) {
                        var name = levelnames[i].split('/')[1].split('.')[0];
                        namelevels.append($('<option>').text(name).val(name));
                    }
            }).fail(function(err){console.log(err);});
        }).fail(function(err) {console.log(err)});
         
    });
    load.click(function() {
        console.log(namelevels.val());
         $.get('../services/levelService.php', {id:namelevels.val()}, function(data) {
            var json = JSON.parse(data);
            if (json.levels.entities.players) {
                gameEngine.loadLevelOld(json, gameEngine);
            } else {
                gameEngine.loadLevel(json);
            }
         }).fail(function(err){console.log(err);});
         levelname.val(namelevels.val());
    });
    $.get('../services/levelService.php', {levels:true}, function(data) {

        var levelnames = JSON.parse(data).levels;
        for (var i = 0; i < levelnames.length; i++) {
            var name = levelnames[i].split('/')[1].split('.')[0];
            namelevels.append($('<option>').text(name).val(name));
        }
    }).fail(function(err){console.log(err);});
    

    gameEngine.init(ctx);
    gameEngine.start();
    
   
});