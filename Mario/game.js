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
    this.worldEntities = [];
    this.mario = null;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.key = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.jump = null;
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
        if (e.keyCode === 38) {

            that.jump = true;
             console.log(that.jump);
        } else {
            that.key = e;
        }
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        e.preventDefault();

        if (e.keyCode === 38) {
            that.mario.jumpVelocity = 20;
             that.mario.canJump = true;
            that.jump = false;
        } else {
            that.key = null;
        }
    }, false);

    console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    //console.log('added entity' + entity.type);
    this.entities.push(entity);
    
    //Copy world entities into another collection for collision detection
    if(entity.type !== 'Mario' || entity.type !== 'Goomba') { //Temp
        this.worldEntities.push(entity); //Push world entities

    } 
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

        if (entity && !entity.removeFromWorld) {
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

        if(entity.type === 'Goomba' || entity.type === 'RedKoopa') { //TODO
           for(var j = 0; j < this.worldEntities.length; j++) {
                if(entity.boundingbox.isCollision(this.worldEntities[j].boundingbox)){
                    entity.collide(this.worldEntities[j]);
                }
            }
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
     
    this.update();
    this.detectCollisions();
    this.draw();
    this.click = null;
    this.wheel = null;
    //this.key = null;
}

GameEngine.prototype.addToScore = function(points) {
    this.score += points;
    $('#score').html('Score: ' + this.score);
}



GameEngine.prototype.reset = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].reset();
    }
}

GameEngine.prototype.startOver = function() {
    console.log('starting over');
    if (this.isDead) {
        var lives = this.lives - 1;
        var coins = this.coins;
    }
    this.entities = [];
    this.loadLevel(this.mainObj, this);
    this.finishedLevel = false;
    this.addToScore(0); // to refresh
    if (lives > 0) {
        this.lives = lives;
         this.coins = coins;
    }
    this.isDead = false;
    $('#score').html("Score: " + this.score);
    $('#lives').html('Lives: ' + this.lives);
    $('#coins').html('Coins: ' + this.coins);

}

GameEngine.prototype.addCoin = function() {
    this.coins++;
    if (this.coins === 100) {
        this.coins = 0;
        this.lives++;
        $('#lives').html('Lives: ' + this.lives);
    }
    $('#coins').html('Coins: ' + this.coins);

}


GameEngine.prototype.loadLevel = function (jSonString, gameEngine) {
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
    this.addEntity(new LevelOver(this));
    
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

BoundingBox.prototype.isCollision = function (otherEntityBoundingBox) {

    if(otherEntityBoundingBox) {
       //TRUE = Collision on that side, false otherwise
        var leftCheck = false;
        var rightCheck = false;
        var topCheck = false;
        var bottomCheck = false;
        var oth = otherEntityBoundingBox;
        //Check collision with the right side of Mario
        if(this.right > oth.left && this.left < oth.left){
            rightCheck = true;
        }

         //Check collision with the left side of Mario
        if(this.left < oth.right &&  this.right > oth.right) {
            leftCheck = true;
        }

        //Check collision with the top of mario (his head)
        if(this.top < oth.bottom && this.bottom > oth.bottom) {
            topCheck = true;
        }

        //Check collision with bottom of Mario (his feet, aka landing on stuff)
        if(this.bottom > oth.top && this.top < oth.top) {
            bottomCheck = true;
        }

        //Check mario collision with an entity on his top right side
        if(rightCheck && topCheck) {
            return true;

        }

        //Check mario collision with an entity on his top left side
        else if(leftCheck && topCheck) {
            return true;

        }

        //Check mario collision with an entity on his bottom right
        else if(rightCheck && bottomCheck) {
            return true;
        }


        //Check Mario Collision with an enitity  on his bottom left

        else if(leftCheck && bottomCheck) {
            return true;

        }

        //Check for a collision on the right, but Mario is at equal level of the entity
        else if(rightCheck && (this.bottom === oth.bottom)) {
            return true;

        }

        //Check for collision on the left, but Mario is at equal level of the entity
        else if(leftCheck && (this.bottom === oth.bottom)) {
            return true;

        } else if(bottomCheck && this.right > oth.left && this.left > oth.left && this.right < oth.right && this.left < oth.right) { //Ontop of a larger box then marios boundboox
        	return true;

        } else if(bottomCheck && this.right > oth.left && this.left < oth.left) { //Ontop of a larger box then marios boundboox
        	return true;

        } else if(bottomCheck && this.left < oth.right && this.right > oth.right) { //Ontop of a larger box then marios boundboox
        	return true;

        } 


        //If not of the above apply, then the collision is not legit
        else {
    return false;
        }
    
}


}



    

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.init_x = x;
    this.init_y = y;
    /*
        use this. overwrite when extending entity ie for mario make type "Mario", for box "Box" etc.s
    */
    this.type = 'Entity' 
    this.removeFromWorld = false;
}

Entity.prototype.reset = function () {
    this.x = this.init_x;
    this.y = this.init_y;
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
     Entity.call(this, game, init_x, init_y);
    this.type = "Mario";
    this.initial_y_floor = init_y;
    this.isRunning = false;
    this.isWalking = false;
    this.isJumping = false;
    this.isFalling = false;
    this.isRight = true;
    this.isJumpingRunning = false;
    this.isJumpingWalking = false;
    this.steps = 0;
    this.maxJumpHeight = 0;
    this.onSomething = false;
    this.canJump = true;
    this.jumpVelocity = 20;
    // made this the same as the debug box mario already has drawn around him.
    this.boundingbox = new BoundingBox(this.x + 15, this.y + 5, 18, 17);
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_mario_sheet.png');
    this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.15, 2, true, true);
    this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, 0.15, 2, true, false);
    this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, 0.15, 2, true, true);
    this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, 0.15, 2, true, false);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

Mario.prototype.update = function ()
{
    var velocityX = 4.0;
    var velocityY = 0.0;
    var gravity = 4;
    var jumpHeight = 110;
    var jumpKeyPressed = false;
    this.onSomething = false;
    var floorLevel = this.initial_y_floor
    if (!this.game.finishedLevel && !this.game.isDead)
    if ((this.game.key || this.game.jump ) ) {
       var code = this.game.key?this.game.key.keyCode:null;
        if ( code === 39)
        { //RIGHT
            if (!this.isRight)
            {
                this.steps = 0;
                this.isRight = true;
            }
            if (this.isRunning)
            {
                if (this.x < this.game.ctx.canvas.getBoundingClientRect().right / 2 - 50 || -(this.game.background.x ) + this.x  + 50 + this.game.background.length >= this.game.background.sizex * (this.game.length - 1)) {
                    if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40)
                    {

                        this.x += 2.5;
                        
                    }
                }
                else
                {
                    this.game.background.x -= 2.5;
                    this.platformMinX -= 2.5;
                    this.platformMaxX -= 2.5;
                   
                }
            }
            else if (this.steps > 5)
            {
                this.isRunning = true;
                this.isWalking = false;
            }
            else if (this.isWalking)
            {
                if (this.walkRightAnimation.elapsedTime + this.game.clockTick >= this.walkRightAnimation.totalTime && !this.game.jump)
                {
                    this.steps++;
                }
                if (this.x < this.game.ctx.canvas.getBoundingClientRect().right / 2 - 50 || -(this.game.background.x ) + this.x + 50 + this.game.background.length >= this.game.background.sizex * (this.game.length -1) ) {
                    if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40)
                    {
                        this.x +=1; 
                    }
                }
                else
                {
                    this.game.background.x -= 1;
                    this.platformMinX -= 1;
                    this.platformMaxX -= 1;
                }
            }
            else
            {
                
                this.isWalking =true;
               
            }
           
        }
        else if (code=== 37)
        { //LEFT
            if (this.isRight)
            {
                this.steps = 0;
                this.isRight = false;
            }
            
            if (this.isRunning)
            {
                if (this.x > this.game.ctx.canvas.getBoundingClientRect().left - 25)
                {
                    this.x -= 2.5;
                }
            }
            else if (this.steps > 5)
            {
                this.isRunning = true;
                this.isWalking = false;
            }
            else if (this.isWalking)
            {
                if (this.walkLeftAnimation.elapsedTime + this.game.clockTick >= this.walkLeftAnimation.totalTime && !this.game.jump)
                {
                    this.steps++;
                }
                if (this.x > this.game.ctx.canvas.getBoundingClientRect().left - 25)
                {
                    this.x -=1;   
                }
            }
            else
            {
                 this.isWalking =true;
            }

        }  else 
        {
            //this.isJumping = false;
            this.isWalking = false;
            this.isRunning = false;
            this.steps = 0;
            
            //this.game.jump = false;

            // if (this.y < floorLevel && !this.onSomething && !this.isJumping)
            // {
            //     this.isFalling = true;
            //     this.y += gravity;

            // }
        }

        if (this.game.jump && !this.jumpComplete )
        {
            
            if (!this.isJumping) {
                this.maxJumpHeight = this.y - jumpHeight;
                this.isJumping = true;
            }

            if(this.y > this.maxJumpHeight) {
                this.y -= this.jumpVelocity;
                this.jumpVelocity *= 0.82;

            } 
            else if (this.y <= this.maxJumpHeight) {
                this.canJump = false;
                this.jumpComplete = true;
                this.isFalling = true;
                this.jumpVelocity = 20;
               // if(this.y < floorLevel && !this.onSomething) {
               //       this.isFalling = true;
               //       this.isJumping = false;
               //       this.y += gravity;
               // }
            }


            
                       
        }
        if (this.isJumping && !this.game.jump) {
                this.isJumping = false;
                this.isFalling = true;
                this.y += gravity;
                 this.jumpComplete = true;
                 this.canJump = false;
        }

        if (!this.isFalling && !this.isJumping &&  this.y < floorLevel && (this.platformMaxX < this.boundingbox.left || this.platformMinX > this.boundingbox.right))
        {
            this.isFalling = true;
            this.y += gravity;
            this.platformMaxX = null;
            this.platformMinX = null;

        }

        

       
    } else
    {
            this.isWalking = false;
            this.isRunning = false;
            this.steps = 0;
            if (this.isJumping && !this.game.jump) {
                this.isJumping = false;
                this.isFalling = true;
                this.jumpVelocity = 20;
            }
            if (this.y > floorLevel)
        {
            this.jumpVelocity = 20;
             this.jumpComplete = false; 
            this.isFalling = false;
            this.y = floorLevel;
        }
            this.isJumping = false;  //On collision of platform, need to set to false as well if landed on it

    }
    if (this.isFalling) {
       if (this.y < floorLevel)
       {
           this.isFalling = true;
           this.y += gravity;
          
       }
       else if (this.y >= floorLevel)
        {
             this.jumpVelocity = 20;
            this.jumpComplete = false;
            this.isFalling = false;
            this.y = floorLevel;
            this.isJumping = false; 
        }
    } 
       
    this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 18, 17);    
    
}


Mario.prototype.draw = function(ctx) {
    if (this.game.isDead) {
        ctx.drawImage(this.sprite,
                  360, 200,  // source from sheet
                  40, 40,
                  this.x, this.y - 5,
                  40,
                  40);

    } else if (this.isFalling || this.isJumping) {
        if (this.boxes) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x + 17, this.y + 8, this.fallAnimation.frameWidth, this.fallAnimation.frameHeight);
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
        }
        if(!this.isRight) {
                  ctx.drawImage(this.sprite,
                  40, 80,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        } else {
                  ctx.drawImage(this.sprite,
                  320, 80,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);

        }
        
    } else if (!this.game.finishedLevel)
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
    
    }


    else if (this.isWalking) {
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
    }

    else {
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
                 40);

    }
}

Mario.prototype.collide = function(other) {
	if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && (this.boundingbox.bottom === other.boundingbox.bottom+1 || this.boundingbox.bottom === other.boundingbox.bottom) && (other.type === "Box" || other.type === "Pipe" || other.type === "PipeExt")) { //Collsion from the right
                    this.x = other.boundingbox.left - 33;

                } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && (this.boundingbox.bottom === other.boundingbox.bottom+1 || this.boundingbox.bottom === other.boundingbox.bottom) && (other.type === "Box" || other.type === "Pipe" || other.type === "PipeExt")) { //Collsion from the left
                    this.x = other.boundingbox.right - 15;
                }

            else if(this.boundingbox.top < other.boundingbox.bottom && this.boundingbox.bottom > other.boundingbox.bottom && other.type !== "Coin" && other.type !== "Pole") { //Collision from below
                this.maxJumpHeight = other.boundingbox.bottom;
                this.isFalling = true;

            } else if (this.boundingbox.bottom > other.boundingbox.top && this.boundingbox.top+3 < other.boundingbox.top && other.type !== "Goomba" && other.type !== "Coin" && other.type !== "Pole") {    
            	this.y = other.boundingbox.top - 25;
            	this.isFalling = false;
            	this.isJumping = false;
            	this.onSomething = true;
            	this.isJumpingWalking = false;
            	this.isJumpingRunning = false;
                this.platformMaxX = other.boundingbox.right;
                this.platformMinX = other.boundingbox.left;
                 this.jumpComplete = false; 
            	this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 18, 17);
            } else if (this.boundingbox.bottom > other.boundingbox.top && this.boundingbox.top + 3 < other.boundingbox.top && other.type == "Goomba" ) {
                this.y = other.boundingbox.top - 45;
                this.isFalling = true;
                this.isJumping = false;
            }
}


//Enemy Base Class
function Enemy(init_x, init_y, game) {
    this.frameWidth = 50;
    this.frameHeight = 25;
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    
    //Call Entity constructor
    Entity.call(this, game, init_x, init_y);
}

Enemy.prototype = new Entity();
//End Enemy Base Class

//Goomba code
function Goomba(init_x, init_y, game) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.squished = false;
    this.direction = 1;
    this.type = "Goomba"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
    this.back_forth_animation = new Animation(this.sprite, 0, 0, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.cycleCount = 0;
}

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
        this.back_forth_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
    }
}

Goomba.prototype.update = function() {
    if(!this.squished) {
        if(this.direction === 1) {
            this.x += 1;        
        } else {
            this.x -= 1;
        }
    }
    this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 5, 17, 16);

}

Goomba.prototype.collide = function(other) {
    

    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
                    this.direction = 0;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
                    this.direction = 1;

    } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
        this.game.addToScore(100);
        this.squished = true;
        this.removeFromWorld = true;
    } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left <= this.boundingbox.right)
        && other.type === 'Mario') {
        this.game.isDead = true;
    } 
}
//End Goomba

//Red Koopa code
function RedKoopa(init_x, init_y, game) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.frameWidth = 40;
    this.frameHeight = 30;
    this.direction = 1;
    this.type = "RedKoopa"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 20, 25);
    this.right_animation = new Animation(this.sprite, 200, 248, this.frameWidth, this.frameHeight, .4, 4, true, false);
    this.left_animation = new Animation(this.sprite, 40, 248, this.frameWidth, this.frameHeight, .4, 4, true, true);
    this.current_animation = this.right_animation;
}

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
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
}

RedKoopa.prototype.update = function() {    
    if(this.direction === 1) {
        this.x += 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 5, 20, 25);        
    } else {
        this.x -= 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y + 5, 20, 25);
    }

    

}

RedKoopa.prototype.collide = function(other) {
       
    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
                this.direction = 0;
            this.current_animation = this.left_animation;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
                    this.direction = 1;
                    this.current_animation = this.right_animation;
    } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
        this.game.addToScore(100);
        this.squished = true;
        this.removeFromWorld = true;
    } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left <= this.boundingbox.right)
        && other.type === 'Mario') {
        this.game.isDead = true;
    } 
}
//End RedKoopa

//QuestionBox
function QuestionBox(init_x, init_y, game) {
	Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.staticAnimation = new Animation(this.sprite, 205, 1, 17, 16, 0.14, 4, true, false);
    this.usedAnimation = new Animation(this.sprite, 1, 86, 16, 16, 0.14, 1, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);
    this.hasCoin = true;
    this.type = "Box"; 
    this.hasPowerUp = false;
    this.gameEngine = game;
    this.hitAlready = false;
    this.canHavePowerUps = false; //Set this to true in FINAL version of game
    var maximum = 10;
    var minimum = 1;

    //Randomly make this QuestionBox produce a powerup instead of a coin
    var randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    if(randomnumber > 5 && this.canHavePowerUps) { 
        this.hasCoin = false;
        this.hasPowerUp = true;

    }


}

QuestionBox.prototype = new Entity();
QuestionBox.prototype.constructor = QuestionBox;


QuestionBox.prototype.update = function () {
    //Entity.prototype.update.call(this);
    if (this.hitAlready) {

        if (this.y != this.init_y) {
            this.hitAlready = true;
            this.y += 2;
        }
    }
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

QuestionBox.prototype.collide = function(other) {
    //Check for bottom collision
    
    if(other.boundingbox.top < this.boundingbox.bottom && other.boundingbox.bottom > this.boundingbox.bottom) { //We have a collsion from below
            if(!this.hitAlready) { //if not hit already
                if(this.hasCoin) {                   
                    this.hitAlready = true;
                    this.popContents = false;
                    this.gameEngine.addEntity(new Coin(this.x, this.y - 17, this.gameEngine)); //have a coin pop out above the box
                    this.y -= 10;
                } else if (hasPowerUp) { //Will not be handled/completed until Final Release. canHavePowerUps will be always set false until then

                }
            }
    }
    
}

QuestionBox.prototype.draw = function (ctx) {
    if(this.hitAlready) {
        this.usedAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

    } else {
            this.staticAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);
    }


}

//Coin
function Coin(init_x, init_y, game) {

    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 422, 0, 16, 16, 0.14, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 16, 16);
    this.type = "Coin";
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
    if(this.isVisible) {
        this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);
    }
}

//ShineyGoldBox
function ShineyGoldBox(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 52, 35, 17, 16, 0.14, 8, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

ShineyGoldBox.prototype = new Entity();
ShineyGoldBox.prototype.constructor = ShineyGoldBox;

ShineyGoldBox.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

ShineyGoldBox.prototype.draw = function (ctx) {
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}

//ShineyBlueBox
function ShineyBlueBox(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 378, 60, 17, 16, 0.14, 8, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

ShineyBlueBox.prototype = new Entity();
ShineyBlueBox.prototype.constructor = ShineyBlueBox;

ShineyBlueBox.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

ShineyBlueBox.prototype.draw = function (ctx) {
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

}

//ColorFullExclamation
function ColorFullExclamation(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 205, 18, 17, 16, 0.30, 4, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

ColorFullExclamation.prototype = new Entity();
ColorFullExclamation.prototype.constructor = ColorFullExclamation;

ColorFullExclamation.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

ColorFullExclamation.prototype.draw = function (ctx) {
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}

//PinkMusicNote
function PinkMusicNote(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 69, 17, 16, 0.20, 4, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

PinkMusicNote.prototype = new Entity();
PinkMusicNote.prototype.constructor = PinkMusicNote;

PinkMusicNote.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

PinkMusicNote.prototype.draw = function (ctx) {
    this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);

}


//WhiteMusicNote
function WhiteMusicNote(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 120, 52, 17, 16, 0.20, 4, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

WhiteMusicNote.prototype = new Entity();
WhiteMusicNote.prototype.constructor = WhiteMusicNote;

WhiteMusicNote.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

WhiteMusicNote.prototype.draw = function (ctx) {
    this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y);

}


//PowBox
function PowBox(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 35, 18, 17, 16, 0.14, 3, true, false);
        this.type = "Box";
        this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}

PowBox.prototype = new Entity();
PowBox.prototype.constructor = PowBox;

PowBox.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
}

PowBox.prototype.draw = function (ctx) {

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

}

BackGround.prototype.draw = function (ctx) {
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
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/pipe.png');
    this.type = "Pipe";
    this.boundingbox = new BoundingBox(this.x+1, this.y-5, 32, 45);

}

GreenPipe.prototype = new Entity();
GreenPipe.prototype.constructor = GreenPipe;

GreenPipe.prototype.update = function () {
   this.boundingbox = new BoundingBox( this.game.background.x + this.x+1, this.y+4, 32, 45);
}

GreenPipe.prototype.draw = function (ctx) {
                ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 51,
                   this.game.background.x + this.x, this.y,
                  35,
                  51);

}

//Green pipe Extension   - Works up to height 5 ONLY. 
function GreenPipeExtension(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/pipeextension.png');
    this.type = "PipeExt";
    this.boundingbox = new BoundingBox(this.x+1, this.y, 32, 15);

}

GreenPipeExtension.prototype = new Entity();
GreenPipeExtension.prototype.constructor = GreenPipeExtension;

GreenPipeExtension.prototype.update = function () {
   this.boundingbox = new BoundingBox( this.game.background.x + this.x+1, this.y, 32, 15);
}

GreenPipeExtension.prototype.draw = function (ctx) {
                ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 15,
                   this.game.background.x + this.x, this.y,
                  35,
                  15);

}

function Castle(init_x, init_y, game) {
    this.sprite = ASSET_MANAGER.getAsset('images/castlepole.gif');
     
      Entity.call(this, game, init_x, init_y);
      this.type = "Castle";
     this.boundingbox = new BoundingBox(this.x +50, this.y + 55, 17, 25);
   
}

Castle.prototype = new Entity();
Castle.prototype.constructor = Castle;

Castle.prototype.update = function () {
        this.boundingbox = new BoundingBox(this.game.background.x + this.x +50, this.y + 55, 17, 25);
}

Castle.prototype.draw = function (ctx) {
     
    
    ctx.strokeStyle = style;
                ctx.drawImage(this.sprite,
                  0, 482,  
                  103, 81,
                   this.game.background.x + this.x, this.y,
                  103,
                  81);
                 var style = ctx.strokeStyle;
    ctx.strokeStyle = 'red';
}

Castle.prototype.collide = function(entity) {
    
    if (entity.type === 'Mario') {
        this.game.finishedLevel = true;
    }
}

function LevelOver(game) {
    Entity.call(this, game, game.background.sizex - 30, game.background.sizey / 2 - 50);
}

LevelOver.prototype = new Entity();
LevelOver.prototype.constructor = LevelOver;

LevelOver.prototype.reset = function () {
    this.game.finishedLevel = false;
}
LevelOver.prototype.update = function () {
     if ((this.game.finishedLevel || this.game.isDead )&& this.game.click) {
        var mousex = this.game.click.x, mousey = this.game.click.y,  x = this.x, y = this.y;
         if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 70 && mousey <= y + 110)
            this.game.startOver();
    }
  
}

LevelOver.prototype.draw = function (ctx) {
    var x = this.x;
    var y = this.y;

    if (this.game.finishedLevel || this.game.isDead) {
        ctx.font = "18pt Impact";
        ctx.fillStyle = "red";   
         
        if (this.game.isDead) {
            ctx.fillText("You're Dead", x - 40, y);
        } else 
            ctx.fillText("Level Complete!", x - 40, y);
        ctx.fillText("Score : "+this.game.score, x- 40, y + 40);
        if (this.game.mouse) {
            var mousex = this.game.mouse.x, mousey = this.game.mouse.y;
            if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 70 && mousey <= y + 110) { ctx.fillStyle = "blue"; }
        }
        ctx.fillText("Play Again?", x- 40, y + 80);
    }

       

}


function Pole(init_x, init_y, game) {
	 Entity.call(this, game, init_x, init_y);
	var games = game;
    this.sprite = ASSET_MANAGER.getAsset('images/castlepole.gif');
     this.type = "Pole";
     this.moveAnimation = new Animation(this.sprite, 115, 520, 20, 20, 0.14, 4, true, true);

     this.boundingbox = new BoundingBox(this.x + 20, this.y + 14, 20, 20);
     this.topVariable = this.y + 135;
     this.flagY = this.y;
     this.isLowering = false;
}

Pole.prototype = new Entity();
Pole.prototype.constructor = Pole;

Pole.prototype.update = function () {
	            if(this.isLowering && this.boundingbox.bottom < this.topVariable) {
                	this.flagY += 2;

                } else if(this.isLowering && this.boundingbox.bottom > this.topVariable) {
                	this.isLowering = false;
                	this.flagY = (this.topVariable - 14);
                }
               
              this.boundingbox = new BoundingBox(this.game.background.x + this.x + 20, this.flagY + 14, 20, 20);
}

Pole.prototype.draw = function (ctx) {

                ctx.drawImage(this.sprite,
                  400, 458,  
                  52, 180,
                   this.game.background.x + this.x, this.y,
                  52,
                  180);
                  this.moveAnimation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x + 23, this.flagY + 15);


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
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
     this.type = "Box";
     this.boundingbox = new BoundingBox(this.x, this.y, 17, 16);

}




StaticGoldBlock.prototype = new Entity();
StaticGoldBlock.prototype.constructor = StaticGoldBlock;

StaticGoldBlock.prototype.update = function () {
    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 17, 16);
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
ASSET_MANAGER.queueDownload('images/pipeextension.png');
ASSET_MANAGER.queueDownload('images/mariolevels.png');
ASSET_MANAGER.queueDownload('images/castlepole.gif');

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var gameboard = new GameBoard();

    gameEngine.addEntity(gameboard);

    try {
        $.get('services/levelService.php', {id:1}, function(data) {
            gameEngine.loadLevel(data, gameEngine);
            gameEngine.init(ctx);
            gameEngine.start();
           
        }).fail(function(error) { gameEngine.loadLevel(level1, gameEngine);
        gameEngine.init(ctx);
        gameEngine.start();});
    } catch (err) {
        gameEngine.loadLevel(level1, gameEngine);
        gameEngine.init(ctx);
        gameEngine.start();
    }
    
   
});