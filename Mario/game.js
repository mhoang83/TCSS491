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
    this.hasWon = false;
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
    this.score = 0;
    this.coins = 0;
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
    if (entity) {
        this.entities.push(entity);
        
        //Copy world entities into another collection for collision detection
        if(entity.type !== 'Mario' || entity.type !== 'Goomba') { //Temp
            this.worldEntities.push(entity); //Push world entities

        } 
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
    var distance = 0;
    for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if(entity && entity.type != "Mario") {

        		if (mario.boundingbox.isCollision(entity.boundingbox)) {
        			entity.collide(mario);
            		mario.collide(entity);
        		}



        	if(entity.subType === 'Enemy') { 
           		for(var j = 0; j < this.worldEntities.length; j++) {
                	if(entity.boundingbox.isCollision(this.worldEntities[j].boundingbox)){
                    	entity.collide(this.worldEntities[j]);
                	}
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
    this.entities.splice(0, this.entities.length);
    this.worldEntities.splice(0, this.worldEntities.length);
    var me = this;
    $.get('services/levelService.php', {id:this.levels[this.current_level]}, function(data){
        me.loadLevel(data);
        me.finishedLevel = false;
        me.addToScore(0); // to refresh
        if (lives > 0) {
            me.lives = lives;
            me.coins = coins;
        }
        me.isDead = false;
        $('#score').html("Score: " + me.score);
        $('#lives').html('Lives: ' + me.lives);
        $('#coins').html('Coins: ' + me.coins);
    });
    

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


GameEngine.prototype.loadLevel = function(jSonString) {
    if( typeof jSonString === 'string') {
        mainObj = JSON.parse(jSonString);

    } else {

            mainObj = jSonString;
    }
    this.lives = 3;
    this.score = 0;
    this.coins = 0;
    var levels = mainObj.levels;
    var background = levels.background;
    this.background = new BackGround(background.start_x, background.start_y, this, background.length, background.id);
    this.addEntity(this.background);
    var entities = levels.entities;
    for(var i = 0; i < entities.length; i++) {
        var entity = entities[i];
        if (entity.type === 'Mario') {
            var mario = new Mario(entity.start_x, entity.start_y, this);
            
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
                case 'Boss':
                    this.addEntity(this.makeBoss(entity.type,entity.start_x, entity.start_y));
                    break;
                default:
                    break;
            }   
        }
    }
    // so mario doesnt appear behind castle at the end

    this.addEntity(mario);
    this.mario = mario;
    this.addEntity(new LevelOver(this));


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
            return 'World Object';
        case 'Bowser': case 'Superflower': case 'Superghost':
           return  'Boss';
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

GameEngine.prototype.makeBoss = function(type, x, y) {
    switch(type) {
        case 'Bowser':
           return  new Bowser(x, y, this);
        case 'Superflower':
           
        case 'Superghost':
           
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
	var isMessagesOn = false;
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
        	if(isMessagesOn) {
				console.log("Collide Right and Top");
        	}
        	
            return true;
        }

        //Check mario collision with an entity on his top left side
        else if(leftCheck && topCheck) {
        	if(isMessagesOn) {
        		console.log("Collide Left and Top");
        	}
        	        	
            return true;

        }

        //Check mario collision with an entity on his bottom right
        else if(rightCheck && bottomCheck) {
        	if(isMessagesOn) {
        		console.log("Collide Right and Botton");
        	}
        	        	
            return true;
        }


        //Check Mario Collision with an enitity  on his bottom left

        else if(leftCheck && bottomCheck) {
        	 if(isMessagesOn) {
        		console.log("Collide Left and Botton");
        	}
        	        	
            return true;

        }

        //Check for a collision on the right, but Mario is at equal level of the entity
        else if(rightCheck && (this.bottom === oth.bottom)) {
        	 if(isMessagesOn) {
        		console.log("Collide Right and bottom equals bottom");
        	}
        	        	
            return true;

        }

        //Check for collision on the left, but Mario is at equal level of the entity
        else if(leftCheck && (this.bottom === oth.bottom)) {
        	if(isMessagesOn) {
        		console.log("Collide Left and bottom equals bottom");
        	}
        	        	
            return true;

        } else if(bottomCheck && this.right > oth.left && this.left > oth.left && this.right < oth.right && this.left < oth.right) { //Ontop of a larger box then marios boundboox
        	 if(isMessagesOn) {
        		console.log("Collide Bottom and mario is smaller then other");
        	}
        	        	
        	return true;

        } else if(bottomCheck && this.right > oth.left && this.left < oth.left) { //Ontop of a larger box then marios boundboox
        	 if(isMessagesOn) {
        		console.log("Collide Bottom and right");
        	}
        	        	
        	return true;

        } else if(bottomCheck && this.left < oth.right && this.right > oth.right) { //Ontop of a larger box then marios boundboox
        	 if(isMessagesOn) {
        		console.log("Collide Bottom and left");
        	}
        	        	
        	return true;

        } 
        else if(rightCheck && this.top > oth.top && this.bottom < oth.bottom) { //Collision on right of Mario with something larger then himself (like a pipe)
        	 if(isMessagesOn) {
        		console.log("Collide Right and Bigger then mario");
        	}
        	        	
            return true;

        } else if(leftCheck && this.top > oth.top && this.bottom < oth.bottom) { //Collision on left of Mario with something larger then himself (like a pipe)
        	 if(isMessagesOn) {
        		       	console.log("Collide Left and Bigger then mario");
        	}


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
    this.isGrowth = false;
    this.isRunning = false;
    this.isWalking = false;
    this.isJumping = false;
    this.isFalling = false;
    this.passThrough = true;
    this.isBouncing = false;
    this.isRight = true;
    this.isJumpingRunning = false;
    this.isJumpingWalking = false;
    this.steps = 0;
    this.maxJumpHeight = 0;
    this.onSomething = false;
    this.canJump = true;
    this.jumpVelocity = 20;
    this.ticker = 0;
    this.direction = 0;
    this.lastDirection = 0;
    this.jump = null;
    this.d;
    // made this the same as the debug box mario already has drawn around him.
    this.boundingbox = new BoundingBox(this.x + 15, this.y , 17, 16);
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_mario_sheet.png');
    this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.15, 2, true, true);
    this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, 0.15, 2, true, false);
    this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, 0.15, 2, true, true);
    this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, 0.15, 2, true, false);
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

function mFireBall(init_x, init_y, isRight) {
    Entity.call(this, game, init_x, init_y);
    this.isRight = isRight;
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_enemies_sheet.png');
    this.leftFireAnimation = new Animation(this.sprite, 92, 10, 40, 40, 0.14, 5, false, false);
    this.rightFireAnimation = new Animation(this.sprite, 300, 955, 75, 15, 0.14, 5, false, true);
    this.boundingbox = new BoundingBox(this.x, this.y, 15, 15);
    this.type = "FireBall";
    
}

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
        if ( code === 39 && !this.isBouncing)
        { //RIGHT
            if (!this.isRight)
            {
                this.steps = 0;
                this.isRight = true;
            }
            if (this.isWalking)
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


                    if(this.x -this.game.background.x < ((this.game.background.length-1) * 512 -50)) {
                        this.game.background.x -= 1;
                        this.platformMinX -= 1;
                        this.platformMaxX -= 1;
                    } else {
                        if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40)
                        {
                            this.x +=1; 
                        }
                    }
                }
            }
            else
            {
                
                this.isWalking =true;
               
            }
           
        }
        else if (code === 16) {
            if (this.isWalking) {
                this.isRunning = true;
                this.isWAlking = false;
    
                if (this.isRunning && this.isRight) {
                    if (this.x < this.game.ctx.canvas.getBoundingClientRect().right / 2 - 50 || -(this.game.background.x) + this.x + 50 + this.game.background.length >= this.game.background.sizex * (this.game.length - 1)) {
                        if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40) {

                            this.x += 2.5;

                        }
                    }
                    else {
                        if (this.x - this.game.background.x < ((this.game.background.length - 1) * 512 - 50)) {
                            this.game.background.x -= 2.5;
                            this.platformMinX -= 2.5;
                            this.platformMaxX -= 2.5;
                        } else {
                            if (this.x < this.game.ctx.canvas.getBoundingClientRect().right - 40) {

                                this.x += 2.5;

                            }
                        }


                    }
                }
                if (this.isRunning && !this.isRight) {
                    if (this.x > this.game.ctx.canvas.getBoundingClientRect().left - 25) {
                        this.x -= 2.5;
                    }
                }
            }

        }
        else if (code=== 37 && !this.isBouncing)
        { //LEFT
            if (this.isRight)
            {
                this.steps = 0;
                this.isRight = false;
            }
            
            if (this.isWalking)
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

        }

        else if (code === 87)
        { //Growth
            if (!this.isGrowth)
            {
                this.isGrowth = true;
                if (this.isGrowth)
                {
                    this.walkLeftAnimation = new Animation(this.sprite, 120, 243, 40, 40, 0.15, 2, true, true);
                    this.walkRightAnimation = new Animation(this.sprite, 200, 243, 40, 40, 0.15, 2, true, false);                 
                    this.runLeftAnimation = new Animation(this.sprite, 90, 243, 40, 40, 0.15, 2, true, true);
                    this.runRightAnimation = new Animation(this.sprite, 250, 243, 40, 40, 0.15, 2, true, false);
                    this.boundingbox = new BoundingBox(this.x, this.y, 18, 34);
                }
            }
            else {
                this.isGrowth = false;
                this.walkLeftAnimation = new Animation(this.sprite, 120, 80, 40, 40, 0.15, 2, true, true);
                this.walkRightAnimation = new Animation(this.sprite, 200, 80, 40, 40, 0.15, 2, true, false);
                this.runLeftAnimation = new Animation(this.sprite, 120, 160, 40, 40, 0.15, 2, true, true);
                this.runRightAnimation = new Animation(this.sprite, 200, 160, 40, 40, 0.15, 2, true, false);
            }
        }


        else
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

        

       
    } else {
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
    if (this.isFalling && !this.isBouncing) {
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

    if(this.isBouncing) {
        if (this.jump === null) {
                    var direct;
                    if(this.isRight) {
                        direct = 1;
                    } else {
                        direct = -1;
                    }
                    this.d = direct;
                    this.jump = {
                        start: {
                        x: this.x,
                        y: this.y
                    },
                    control: {
                        x: this.x + 30 * this.d,
                        y: this.y - 105
                    },
                    end: {
                        x: this.x + 60 * this.d,
                        y: this.y
                    },
                    t: 0
                    };
                } 
        }
       
    this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);    
    
}


Mario.prototype.draw = function(ctx) {
	if (true) {
            //ctx.strokeStyle = "red";
            //ctx.strokeRect(this.x + 17, this.y + 8, this.fallAnimation.frameWidth, this.fallAnimation.frameHeight);
            //ctx.strokeStyle = "green";
            //ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    }
    if (this.game.isDead) {
        ctx.drawImage(this.sprite,
                  360, 200,  // source from sheet
                  40, 40,
                  this.x, this.y - 5,
                  40,
                  40);

    } else if ((this.isFalling || this.isJumping) && !this.isBouncing) {

        if(!this.isRight && !this.isGrowth) { //LEFT AND SMALL
                  ctx.drawImage(this.sprite,
                  40, 80,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);

        } else if (!this.isRight && this.isGrowth) { //LEFT AND BIG
            ctx.drawImage(this.sprite,
                  40, 243,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        }
        else if (this.isRight && this.isGrowth) { //RIGHT AND BIG
                  ctx.drawImage(this.sprite,
                  320, 243,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        } else if (this.isRight && !this.isGrowth) { //RIGHT AND SMALL
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

    else if(this.isBouncing) {
        if (this.jump) {

            var pos = getQuadraticBezierXYatT(this.jump.start, this.jump.control, this.jump.end, this.jump.t / 100);
            this.x = pos.x;
            this.y = pos.y;
        //
            this.jump.t += 4;
            if (this.jump.t > 100) {
                this.jump = null;
                this.isBouncing = false;
                this.direction = 0;
                this.isFalling = true;
                this.steps = 4;
                this.isJumping = false;
                this.isRunning = true;
            }

        } else {
            this.isBouncing = true;
            this.x += this.direction;
            this.direction = 0;

        }
        if(!this.isRight && !this.isGrowth) { //LEFT AND SMALL
                  ctx.drawImage(this.sprite,
                  40, 80,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);

        } else if (!this.isRight && this.isGrowth) { //LEFT AND BIG
            ctx.drawImage(this.sprite,
                  40, 243,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        }
        else if (this.isRight && this.isGrowth) { //RIGHT AND BIG
                  ctx.drawImage(this.sprite,
                  320, 243,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        } else if (this.isRight && !this.isGrowth) { //RIGHT AND SMALL
            ctx.drawImage(this.sprite,
                  320, 80,  // source from sheet
                  40, 40,
                   this.x, this.y,
                  40,
                  40);
        }
        
    } else {
        if (this.isRight && !this.isGrowth)
            ctx.drawImage(this.sprite,
                  200, 80,  // source from sheet
                  40, 40,
                  this.x, this.y,
                  40,
                  40);
        else if (this.isRight && this.isGrowth)
            ctx.drawImage(this.sprite,
                200, 243,
                40, 40,
                this.x, this.y,
                40, 40);
        else if (!this.isRight && this.isGrowth)
            ctx.drawImage(this.sprite,
                160, 243,
                40, 40,
                this.x, this.y,
                40, 40);
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
    if(this.boundingbox.top < other.boundingbox.bottom && this.boundingbox.bottom > other.boundingbox.bottom && other.type !== "Coin" && other.type !== "Pole") { //Collision from below
                this.maxJumpHeight = other.boundingbox.bottom;
                this.isBouncing = false;
                this.isFalling = true;
                //this.isRunning = true;
                this.jump = null;
    } else if (this.boundingbox.bottom > other.boundingbox.top && this.boundingbox.top+3 < other.boundingbox.top && other.type !== "Goomba" && other.type !== "Coin" && other.type !== "Pole" && other.type !== "Bowser") {    
            	this.y = other.boundingbox.top - 25;
                this.isBouncing = false;
            	this.isFalling = false;
            	this.isJumping = false;
            	this.onSomething = true;
            	this.isJumpingWalking = false;
            	this.isJumpingRunning = false;
                this.platformMaxX = other.boundingbox.right;
                this.platformMinX = other.boundingbox.left;
                this.jumpComplete = false; 
                this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);
    } else if (this.boundingbox.bottom > other.boundingbox.top && this.boundingbox.top + 3 < other.boundingbox.top && (other.type == "Goomba" || other.type == "Bowser") ) {
                this.y = other.boundingbox.top - 45;
                this.isBouncing = true;
                this.isFalling = false;
                this.isJumping = false;
                this.isWalking = false;
                this.isRunning = false;
                this.isJumpingRunning = false;
                this.isJumpingWalking = false;
                this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);

    } 

     if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right ) { //Collision Left SIDE Other
        	if(other.type === "Box") {
            	if( (this.boundingbox.top - other.boundingbox.top < 17 && this.boundingbox.top - other.boundingbox.top > -17) &&
            		(this.boundingbox.bottom - other.boundingbox.bottom < 17 && this.boundingbox.bottom - other.boundingbox.bottom > -17) 
            		){
            			if(this.isFalling) {

            			} else {
            				this.x = other.boundingbox.right -15; 
           				 	this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);
            			}
        		}

        	} else if(other.type === "Pipe") {
        		if( (this.boundingbox.top - other.boundingbox.top < 48 && this.boundingbox.top - other.boundingbox.top > -48) &&
            		(this.boundingbox.bottom - other.boundingbox.bottom < 48 && this.boundingbox.bottom - other.boundingbox.bottom > -48) 
            		){
            			if(this.isFalling) {

            			} else {
            				this.x = other.boundingbox.right - 15; 
           					this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);
            			}
            		
        		}
        	}
    }

    else if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left ) { //Collision Left SIDE Other
        	if(other.type === "Box") {
            	if( (this.boundingbox.top - other.boundingbox.top < 17 && this.boundingbox.top - other.boundingbox.top > -17) &&
            		(this.boundingbox.bottom - other.boundingbox.bottom < 17 && this.boundingbox.bottom - other.boundingbox.bottom > -17) 
            		){
            			if(this.isFalling) {

            			} else {
            				this.x = other.boundingbox.left - 33; 
           					this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);
            			}
            		
        		}
        	} else if(other.type === "Pipe") {
        		if( (this.boundingbox.top - other.boundingbox.top < 48 && this.boundingbox.top - other.boundingbox.top > -48) &&
            		(this.boundingbox.bottom - other.boundingbox.bottom < 48 && this.boundingbox.bottom - other.boundingbox.bottom > -48) 
            		){
            			if(this.isFalling) {

            			} else {
            				this.x = other.boundingbox.left - 33; 
           					this.boundingbox = new BoundingBox(this.x + 14, this.y + 8, 17, 16);
            			}
            		
        		}
        	}
    }
     
}


//Enemy Base Class
function Enemy(init_x, init_y, game) {
    this.frameWidth = 50;
    this.frameHeight = 25;
    this.sprite = ASSET_MANAGER.getAsset('images/smb3_enemies_sheet.png');
    this.init_x = init_x;
    this.init_y = init_y;
    this.passThrough = true;
    this.subType = 'Enemy';
    
    //Call Entity constructor
    Entity.call(this, game, init_x, init_y);
}

Enemy.prototype = new Entity();
//End Enemy Base Class

//Goomba code
function Goomba(init_x, init_y, game, initial_state) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.direction = 1;
    this.state = initial_state;
    this.type = "Goomba"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 17, 16);
    this.dewinged_animation = new Animation(this.sprite, 0, 0, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.winged_animation = new Animation(this.sprite, 90, 0, this.frameWidth, this.frameHeight, .4, 4, true, false);
    this.squished_animation = new Animation(this.sprite, this.frameWidth * 6, 0, this.frameWidth, this.frameHeight, .1, 1, false, false);
    this.current_animation = (this.state === 1) ? this.winged_animation : this.dewinged_animation;
    this.game = game;
    this.cycleCount = 0;
}

Goomba.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);                  
}

Goomba.prototype.update = function() {
    //Updates state when stepped on
    if(this.steppedOn && this.state >= 0) {
        this.state--;
        this.steppedOn = false;
        this.game.addToScore(100);
    } 

    //Set current animation
    switch(this.state){
        case 1:
            this.current_animation = this.winged_animation;
            break;
        case 0:
            this.current_animation = this.dewinged_animation;
            break;
        default:
            this.current_animation = this.squished_animation;
            break;
    }
    
    //Set direction
    if(this.state >= 0) {
        if(this.direction === 1) {
            this.x += 1;       
        } else {
            this.x -= 1;
        }
    } else {
        if(this.cycleCount === 50) 
            this.removeFromWorld = true;
        else 
            this.cycleCount += 1;
    }
    
    this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 5, 17, 16);

}

Goomba.prototype.collide = function(other) {
    

    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === "Pipe" || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
                    this.direction = 0;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === "Pipe" || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
                    this.direction = 1;

    } else if(other.boundingbox.bottom > this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === "Mario") { //Check for top collision
        this.steppedOn = true;
        if (this.state === 0)
            this.y = -5000;
        //this.squished = true;
    } else if((other.boundingbox.right > this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left < this.boundingbox.right)
        && other.type === 'Mario') {
        this.game.isDead = true;
    } 
}
//End Goomba

//Red Koopa code
function RedKoopa(init_x, init_y, game, initial_state) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.frameWidth = 40;
    this.frameHeight = 30;
    this.type = "RedKoopa"; 
    this.direction = 1;
    this.cycleCount = 0;
    this.state = initial_state || 1;
    this.steppedOn = false;
    this.boundingbox = new BoundingBox(this.x + 17, this.y + 5, 20, 25);
    this.dewinged_right_animation = new Animation(this.sprite, 200, 200, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.dewinged_left_animation = new Animation(this.sprite, 120, 200, this.frameWidth, this.frameHeight, .4, 2, true, true);
    this.winged_right_animation = new Animation(this.sprite, 200, 248, this.frameWidth, this.frameHeight, .4, 4, true, false);
    this.winged_left_animation = new Animation(this.sprite, 40, 248, this.frameWidth, this.frameHeight, .4, 4, true, true);
    this.current_animation = (this.state === 1) ? this.winged_right_animation : this.dewinged_right_animation;
}

RedKoopa.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
}

RedKoopa.prototype.update = function() {    
    //Updates state when stepped on
    if(this.steppedOn && this.state >= 0) {
        this.state--;
        this.steppedOn = false;
        this.game.addToScore(100);
    } 

    if(this.state === 0 && this.direction === 1) {
        this.x += 1;
        this.current_animation = this.dewinged_right_animation;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y, 20, 25);        
    } else if(this.state === 0 && this.direction === 0) {
        this.x -= 1;
        this.current_animation = this.dewinged_left_animation;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y, 20, 25);
    } else if(this.state === 1 && this.direction === 1) {
        this.x += 1;
        this.current_animation = this.winged_right_animation;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 5, 20, 25);      
    } else if(this.state === 1 && this.direction === 0) {
        this.x -= 1;
        this.current_animation = this.winged_left_animation;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y + 5, 20, 25);
    } else {
        if(this.cycleCount === 50) 
            this.removeFromWorld = true;
        else 
            this.cycleCount += 1;
    }
}

RedKoopa.prototype.collide = function(other) {
       
    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && !other.passThrough) { //Collsion from the right
        this.direction = 1;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && !other.passThrough) { //Collsion from the left
        this.direction = 0;
    } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
        this.steppedOn = true;
    } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left <= this.boundingbox.right)
        && other.type === 'Mario') {
        this.game.isDead = true;
    } 
}

//Skeletal Turtle code
function SkeletalTurtle(init_x, init_y, game) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "SkeletalTurtle"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y, 20, 30);
    this.right_animation = new Animation(this.sprite, 200, 298, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.left_animation = new Animation(this.sprite, 110, 298, this.frameWidth, this.frameHeight, .4, 2, true, true);
    this.current_animation = this.right_animation;
}

SkeletalTurtle.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
}

SkeletalTurtle.prototype.update = function() {    
    if(this.current_animation === this.right_animation) {
        this.x += 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y, 20, 30);        
    } else if(this.current_animation === this.left_animation){
        this.x -= 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y, 20, 30);
    } 
}

SkeletalTurtle.prototype.collide = function(other) {
       
    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && !other.passThrough) { //Collsion from the right
        this.current_animation = this.left_animation;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && !other.passThrough) { //Collsion from the left
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
//End SkeletalTurtle

//BonyBeetle Code
function BonyBeetle(init_x, init_y, game) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "BonyBeetle"; 
    this.boundingbox = new BoundingBox(this.x + 17, this.y, 20, 30);
    this.right_animation = new Animation(this.sprite, 110, 745, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.left_animation = new Animation(this.sprite, 0, 745, this.frameWidth, this.frameHeight, .4, 2, true, true);
    this.current_animation = this.right_animation;
}

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
   
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
}

BonyBeetle.prototype.update = function() {    
    if(this.current_animation === this.right_animation) {
        this.x += 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 3, this.y + 10, 20, 15);        
    } else if(this.current_animation === this.left_animation){
        this.x -= 1;
        this.boundingbox = new BoundingBox( this.game.background.x + this.x + 17, this.y + 10, 20, 15);
    } 
}

BonyBeetle.prototype.collide = function(other) {
       
    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && !other.passThrough) { //Collsion from the right
        this.current_animation = this.left_animation;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && !other.passThrough) { //Collsion from the left
        this.current_animation = this.right_animation;
    } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
        this.game.isDead = true;
    } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left <= this.boundingbox.right) 
        && other.type === 'Mario') {
        this.game.isDead = true;
    } 
}
//End BonyBeetle

//Chomper code
function Chomper(init_x, init_y, game) {
    //Call Enemy super constructor
    Enemy.call(this,init_x, init_y, game);
    this.frameWidth = 50;
    this.frameHeight = 30;
    this.type = "Chomper"; 
    this.boundingbox = new BoundingBox(this.game.background.x + this.x + 15, this.y + 5, 20, 25);
    this.chomp_animation = new Animation(this.sprite, 0, 345, this.frameWidth, this.frameHeight, .4, 2, true, false);
    this.current_animation = this.chomp_animation;
}

Chomper.prototype.draw = function(ctx) {
    this.current_animation.drawFrame(this.game.clockTick, ctx, this.game.background.x + this.x, this.y, 1.1);
}

Chomper.prototype.update = function() {    
    this.boundingbox = new BoundingBox(this.game.background.x + this.x + 15, this.y + 5, 20, 25);
}

Chomper.prototype.collide = function(other) {
    if((other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top) || 
        (other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario
        other.boundingbox.left <= this.boundingbox.right)
        && other.type === 'Mario') { //Check for top collision
        this.game.isDead = true;
    } 
}

function BrownBlock(init_x, init_y, game) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/castlepole.gif');
    this.type = "Box";
    this.boundingbox = new BoundingBox(this.x, this.y, 20, 20);
}
BrownBlock.prototype = new Entity();
BrownBlock.prototype.constructor = BrownBlock;
BrownBlock.prototype.draw = function (ctx) {
    
         ctx.drawImage(this.sprite,
                  115, 493,  // source from sheet
                  21, 21,
                   this.game.background.x + this.x, this.y,
                  21,
                  21);
    
     
}

BrownBlock.prototype.update = function () {
   // Entity.prototype.update.call(this);
   this.boundingbox = new BoundingBox(this.game.background.x + this.x, this.y, 20,20);
  

}

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
    
    if(other.boundingbox.top < this.boundingbox.bottom && other.boundingbox.bottom > this.boundingbox.bottom && ((other.boundingbox.left < this.boundingbox.right && other.boundingbox.right > this.boundingbox.right) ||(other.boundingbox.right > this.boundingbox.left && other.boundingbox.left < this.boundingbox.left)) ) { //We have a collsion from below
            if(!this.hitAlready) { //if not hit already
                if(this.hasCoin) {                   
                    this.hitAlready = true;
                    this.popContents = false;
                    this.gameEngine.addEntity(new Coin(this.x, this.y - 17, this.gameEngine, true)); //have a coin pop out above the box
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
function Coin(init_x, init_y, game, popped) {

    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/levelRemovedBorder1.png');
    this.moveAnimation = new Animation(this.sprite, 422, 0, 16, 16, 0.14, 4, true, false);
    this.boundingbox = new BoundingBox(this.x, this.y, 16, 16);
    this.type = "Coin";
    this.passThrough = true;
    this.Ycoord = 20
    this.popped = popped;
    this.givePoints = false;


}

Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;

Coin.prototype.update = function () {
    //Entity.prototype.update.call(this);
        this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 16, 16);
        if(this.givePoints) {
        	this.game.addToScore(10);
        	this.game.addCoin();
        	this.isVisible = false;
       		this.boundingbox = null;
        	this.removeFromWorld = true;
        	this.givePoints = false;
        	this.popped = false;
        } else {
        	if(this.popped) {
    			this.Ycoord -= 2;
    			if(this.Ycoord === 0) {
        			this.givePoints = true;
       			}
        	}

        }
}

Coin.prototype.collide = function(other) {

    if(other.type === "Mario") {
    	    this.givePoints= true;
    }
}

Coin.prototype.draw = function (ctx) {
    if(this.popped && !this.givePoints) {
    	
        this.moveAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y - this.Ycoord);
    } else {
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
function GreenPipe(init_x, init_y, game, extLength) {
    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/pipe.png');
    //this.moveAnimation = new Animation(this.sprite, 1, 1, 17, 16, 0.22, 4, true, false);
    this.init_x = init_x;
    this.init_y = init_y;
    this.bottom = this.y + 49;
    this.type = "Pipe";
    this.extensions = [];
    if(extLength) {

        this.setExtensions(extLength);
    } else {
        this.boundingbox = new BoundingBox(this.x+1, this.y + 3, 32, 49);
    }

}

GreenPipe.prototype = new Entity();
GreenPipe.prototype.constructor = GreenPipe;

GreenPipe.prototype.update = function () {
   // Entity.prototype.update.call(this);
   this.boundingbox = new BoundingBox(this.game.background.x+this.x+1, this.y + 3, 32, 49 + (14 * this.extensions.length));
   var ext = this.extensions;
   for (var i = 0 ; i < ext.length; i++) {
        ext[i].x = this.x;
        ext[i].y = this.y + 49 + 14 * i;
    }

}

GreenPipe.prototype.setExtensions = function(count) {
    this.extensions = [];
    //var offset = (j*14)-8 + ((4-count) * 14);
    for (var i = 0; i < count; i++) {
        this.bottom += (i * 14);
        this.extensions.push(new GreenPipeExtension(this.x, this.bottom , this.game));
    }
    this.boundingbox = new BoundingBox(this.game.background.x+this.x+1, this.y + 3, 32, this.bottom);

}

GreenPipe.prototype.draw = function (ctx) {
         ctx.drawImage(this.sprite,
                  0, 0,  // source from sheet
                  35, 51,
                   this.game.background.x + this.x, this.y,
                  35,
                  51);
     for (var i = 0; i < this.extensions.length; i++) {
        this.extensions[i].draw(ctx);
     }
     
}

//Green pipe Extension   - Works up to height 5 ONLY. 
function GreenPipeExtension(init_x, init_y, game) {
	    Entity.call(this, game, init_x, init_y);
    this.sprite = ASSET_MANAGER.getAsset('images/pipeextension.png');
    this.type = "PipeExt";

}

GreenPipeExtension.prototype = new Entity();
GreenPipeExtension.prototype.constructor = GreenPipeExtension;

GreenPipeExtension.prototype.update = function () {

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
         if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 100 && mousey <= y + 125) {
         	$('#game').hide();
            this.game.levelComplete = false;
            this.game.current_level = 0;
            this.game.isDead =false;
            this.game.entities = [];
            this.game.worldEntities = [];
         	build_menu(null, this.game.user_id, true, this.game);
             //$.get('services/levelService.php', {id:this.game.levels[this.game.current_level]}, function(data) {});
         } else
         if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 60 && mousey <= y + 85)
            if (!this.game.isDead && this.game.levels.length > this.game.current_level + 1) {
                console.log('here');
                this.game.current_level++;
                var me = this;
                $.get('services/levelService.php', {id:this.game.levels[this.game.current_level]}, function(data) {
                    var score = me.game.score;
                    var lives = me.game.lives;
                    var coins = me.game.coins;
                    me.game.entities.splice(0, me.game.entities.length);
                    me.game.worldEntities.splice(0, me.game.worldEntities.length);
                    me.game.LevelOver = false;
                    me.game.loadLevel(data);
                    me.game.addToScore(score);
                    me.game.coins = coins - 1;
                    me.game.addCoin();
                    me.game.lives = lives;
                    $('#lives').html('Lives : ' + lives);
                });
            } else if (!this.game.isDead && this.game.levels.length === this.game.current_level + 1) {
                //need to load menu and store score
                var me = this;
                $.post('services/userService.php', {score:this.game.score, user_id:this.game.user_id,ls_id:this.game.ls_id}, function(data) { 
                        console.log('updating score');
                        // update global scores view
                        set_global_scores($('#global_scores'));
                        // update user scores view
                        set_user_scores($('#user_scores'), me.game.user_id);
                        
                });
                this.game.current_level = 0;
                this.game.startOver();

            } else
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
            if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 60 && mousey <= y + 85) { ctx.fillStyle = "blue"; }
        }
        //console.log(this.game.levels);
        if (this.game.levels.length > this.game.current_level + 1) {
            ctx.fillText("Continue?", x- 40, y + 80);
        } 
        else if (!this.game.isDead && this.game.levels.length === this.game.current_level + 1) {
            //need to load menu and store score
            console.log('levelComplete');
            ctx.fillText("Play Again?", x- 40, y + 80);
        } else
            ctx.fillText("Play Again?", x- 40, y + 80);
             ctx.fillStyle = "red";  
        if (this.game.mouse) {
            var mousex = this.game.mouse.x, mousey = this.game.mouse.y;
            if (mousex >= x - 60 && mousex <= x + 60 && mousey >=y + 100 && mousey <= y + 125) { ctx.fillStyle = "blue"; }
        }
        ctx.fillText("Menu", x- 40, y + 120);
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

//Bowser the Boss
function Bowser(init_x, init_y, game) {

    Entity.call(this, game, init_x, init_y);
    this.initY = init_y;
    this.game = game;
    this.isRight = false;
    this.isJumping = false;
    this.isWalking = true;
    this.isStunned = false;
    this.timeToShoot = false;
    this.isShooting = false;
    this.isStunnedTimer = 0;
    this.ticker = 0;
    this.direction = 0;
	this.lastDirection = 0;
	this.jump = null;
	this.d;
    this.stunCounter = 0;
    this.sprite = ASSET_MANAGER.getAsset('images/boss_sprite.png');
    this.rightBowserShootAnimation = new Animation(this.sprite, 88.5, 220, 40, 40, 0.22, 5, true, true);
    this.leftBowserShootAnimation = new Animation(this.sprite, 90.5, 43, 40, 40, 0.22, 5, true, false);



    this.jumpRightAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.jumpLeftAnimation = new Animation(this.sprite, 248, 52, 40, 40, 0.14, 5, true, false);
    this.walkRightAnimation = new Animation(this.sprite, 92, 136, 40, 40, 0.14, 4, true, false);
    this.walkLeftAnimation = new Animation(this.sprite, 125, 312, 40, 40, 0.14, 4, true, true);
    this.boundingbox = new BoundingBox(this.x, this.y, 40, 40);
    this.type = "Bowser";
}

Bowser.prototype = new Entity();
Bowser.prototype.constructor = Bowser;

Bowser.prototype.update = function () {
		//Track Marios location and approach within 10 pixels to attack
        if(this.isStunned) {
            this.isStunnedTimer++;
            if(this.isStunnedTimer >= 120) {
                this.isStunned = false;
                this.isStunnedTimer = 0;
            } else if(this.isStunnedTimer > 0  && this.isStunnedTimer < 120) {
                this.isShooting = false;
                this.isWalking = false;
                this.timeToShoot = false;
                //this.isJumping = false;
            }


        }
		else if((this.game.mario.x - this.x) <= -52 ) { //Mario is on the left, Bowser go left
			this.isRight = false;
            this.isShooting = false;
			this.isWalking = true;
			this.timeToShoot = false;
			this.direction--;
    		this.lastDirection = -1;
		} else if((this.game.mario.x - this.x) >= 52 ) { //Mario is on the right, Bowser go right
			this.isRight = true;
			this.isWalking = true;
			this.timeToShoot = false;
            this.isShooting = false;
			this.direction++;
    		this.lastDirection = 1;
		} else {
			this.isWalking = false;
			if(this.y = this.initY) {
				this.timeToShoot = true;
			}if((this.game.mario.y - this.y) <= -10 ) {
			    this.isShooting = false;
			    this.isJumping = true;
		} else {
			//this.isJumping = false;
		}

		}


    //Do Movemement Adjustments for Walking, or Jumping
        if(this.isRight) {
        	if (this.isWalking && !this.isJumping) {
        		this.x += 0.85;
        	}
        } else {
        	if (this.isWalking && !this.isJumping) {
        		this.x -= 0.85;
        	}
        }
        if(this.isJumping) {
        		if (this.jump === null) {
    				this.d = this.lastDirection;
    				this.jump = {
        				start: {
            			x: this.x,
            			y: this.y
        			},
        			control: {
            			x: this.x + 30 * this.d,
            			y: this.y - 105
        			},
        			end: {
            			x: this.x + 60 * this.d,
            			y: this.y
        			},
        			t: 0
    				};
    			} 
        }

        //console.log("Bowser Location   X: " + this.x   + "    Y: "+ this.y);
        this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 40, 40);


}

Bowser.prototype.collide = function(other) {
    if(this.boundingbox.right > other.boundingbox.left && this.boundingbox.left < other.boundingbox.left && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the right
                    this.direction = 0;
    } else if(this.boundingbox.left < other.boundingbox.right && this.boundingbox.right > other.boundingbox.right && 
            //(this.boundingbox.bottom + 2 === other.boundingbox.bottom || this.boundingbox.bottom === other.boundingbox.bottom) && 
            (other.type === 'Pipe' || other.type === 'Box' || other.type === 'PipeExt')) { //Collsion from the left
                    this.direction = 1;

    } else if(other.boundingbox.bottom >= this.boundingbox.top && other.boundingbox.top < this.boundingbox.top && other.type === 'Mario') { //Check for top collision
        this.game.addToScore(200);
        this.stunCounter += 1;
        this.isStunned = true;
        this.isShooting = false;
        this.timeToShoot = false;
        if(this.stunCounter === 10) {
            this.game.hasWon = true;
        } 
    } else if((other.boundingbox.right >= this.boundingbox.left ||  //Check for collision with Mario LEFT RIGHT
        other.boundingbox.left <= this.boundingbox.right)
        && other.type === 'Mario') {
        this.game.isDead = true;
    }
}

// get an x/y point along a quadratic bezier curve
function getQuadraticBezierXYatT(startPt, controlPt, endPt, T) {
    var x = Math.pow(1 - T, 2) * startPt.x + 2 * (1 - T) * T * controlPt.x + Math.pow(T, 2) * endPt.x;
    var y = Math.pow(1 - T, 2) * startPt.y + 2 * (1 - T) * T * controlPt.y + Math.pow(T, 2) * endPt.y;
    return ({
        x: x,
        y: y
    });
}


Bowser.prototype.draw = function (ctx) {
	if(this.timeToShoot && !this.isJumping) {
		if(this.isRight) {
			this.rightBowserShootAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y+1);
            if(!this.isShooting) {
                this.isShooting = true;
                this.game.addEntity(new BowserFire(this.x + 35, this.y, this.game, this)); //have a fire entity come out of bowsers mouth
            }

		} else {
        	this.leftBowserShootAnimation.drawFrame(this.game.clockTick, ctx,  this.x, this.y+1);
                if(!this.isShooting) {
                    this.isShooting = true;
                    this.game.addEntity(new BowserFire(this.x - 35, this.y , this.game, this)); //have a fire entity come out of bowsers mouth
                }

		}

	} 

	else if(this.isJumping) {
		if (this.jump) {

            var pos = getQuadraticBezierXYatT(this.jump.start, this.jump.control, this.jump.end, this.jump.t / 100);
            this.x = pos.x;
            this.y = pos.y;
        
            this.jump.t += 4;
            if (this.jump.t > 100) {
                this.jump = null;
                this.isJumping = false;
                this.direction = 0;
            }

    	} else {
    		this.isJumping = true;
        	this.x += direction;
        	direction = 0;

    	}
    	if(this.isRight) {
    		ctx.drawImage(this.sprite,
                  204, 264,  
                  40, 40,
                   this.game.background.x + this.x, this.y,
                  40,
                  40);
    	} else {
    		ctx.drawImage(this.sprite,
                  136, 88,  
                  40, 40,
                   this.game.background.x + this.x, this.y,
                  40,
                  40);
    	}
    	
	}

	else if(this.isWalking) {
		if(this.isRight) {
			this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		} else {
			this.walkLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
		}

	} 

	else {
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

    this.boundingbox = new BoundingBox( this.game.background.x + this.x, this.y, 40, 40);
    //ctx.strokeStyle = "red";
    //ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.rightBowserShootAnimation.frameWidth, this.rightBowserShootAnimation.frameHeight);
}

//Fire Boss
function BowserFire(init_x, init_y, game, bowser) {

    this.bowser = bowser;
    Entity.call(this, game, init_x, init_y);
    this.isRight = bowser.isRight;
    this.sprite = ASSET_MANAGER.getAsset('images/boss_sprite.png');
    this.leftFireAnimation = new Animation(this.sprite, 80.5, 3, 39, 40, 0.14, 5, true, false);
    this.rightFireAnimation = new Animation(this.sprite, 101.5, 180, 39, 40, 0.14, 5, true, true);
    this.boundingbox = new BoundingBox(this.x, this.y+ 7, 40, 20);
    this.type = "BowserFire";
}

BowserFire.prototype = new Entity();
BowserFire.prototype.constructor = BowserFire;

BowserFire.prototype.update = function () {

    	if(!this.bowser.isShooting) {
        	this.removeFromWorld = true;
    	} else {

            this.boundingbox = new BoundingBox(this.x, this.y+ 7, 40, 20);     
        }
}

BowserFire.prototype.collide = function(other) {
    this.game.isDead = true;
}

BowserFire.prototype.draw = function (ctx) {


	if(this.isRight) {
                //ctx.strokeStyle = "green";
                //ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, 40, 20);
        this.rightFireAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);
	} else {
                //ctx.strokeStyle = "green";
    //ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, 40, 20);
		this.leftFireAnimation.drawFrame(this.game.clockTick, ctx,  this.game.background.x + this.x, this.y);
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
ASSET_MANAGER.queueDownload('images/levelRemovedBorder1.png');
ASSET_MANAGER.queueDownload('images/smb3_mario_sheet.png');
ASSET_MANAGER.queueDownload('images/smb3_enemies_sheet.png');
ASSET_MANAGER.queueDownload('images/pipe.png');

ASSET_MANAGER.queueDownload('images/mariolevels.png');
ASSET_MANAGER.queueDownload('images/castlepole.gif');
ASSET_MANAGER.queueDownload('images/pipeextension.png');
ASSET_MANAGER.queueDownload('images/boss_sprite.png');

$(function(){
   
   
     var user_id = null;
    var game = $('#game').hide();
    if($.cookie('mario')) {
        user_id = $.cookie('mario');
        $.post('services/userService.php', {user_id:user_id}, function(data) {
            console.log(data);
            name = data;
            build_menu(data, user_id);
        });
        

    } else {
       create_login();
    }

    
});

function restart_game(ls_id, levels, game) {
     $('#game').show();
     game.ls_id = ls_id;
     game.levels = levels;
      // $.get('services/levelService.php', {id:game.levels[game.current_level]}, function(data) {
               // console.log(data);
                //game.loadLevel(data);
                // gameEngine.init(ctx);
                // gameEngine.start();
                game.startOver();
               
            // })
}

function init_game(user_id, ls_id, levels) {
    ASSET_MANAGER.downloadAll(function () {
        $('#game').show();
        console.log("starting up da sheild");
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');

        var gameEngine = new GameEngine();
        gameEngine.user_id = user_id;
        gameEngine.ls_id = ls_id;
        gameEngine.levels = levels;
        gameEngine.current_level = 0;
        var gameboard = new GameBoard();

        gameEngine.addEntity(gameboard);
        var levelID = "level1";
        try {
            $.get('services/levelService.php', {id:gameEngine.levels[gameEngine.current_level]}, function(data) {
               // console.log(data);
                gameEngine.loadLevel(data);
                gameEngine.init(ctx);
                gameEngine.start();
               
            }).fail(function(error) { 
                 if(levelID === 1) {
                     gameEngine.loadLevel(level1, gameEngine);
                 } else if(levelID === 2) {
                     gameEngine.loadLevel(level2, gameEngine);
                 } else if(levelID === 3) {
                     gameEngine.loadLevel(level3, gameEngine);
                 }else if (levelID === 4) {
                     gameEngine.loadLevel(level4, gameEngine);
                 }

                 gameEngine.init(ctx);
                gameEngine.start();
            });

        } catch (err) {
             if(levelID === 1) {
                 gameEngine.loadLevel(level1, gameEngine);
             } else if(levelID === 2) {
                 gameEngine.loadLevel(level2, gameEngine);
             } else if(levelID === 3) {
                 gameEngine.loadLevel(level3, gameEngine);
             }else if (levelID === 4) {
                 gameEngine.loadLevel(level4, gameEngine);
             }
            gameEngine.init(ctx);
            gameEngine.start();
        }
        
       
    });

}

function build_menu(name, user_id, restart, game) {
    var menu = $('#menu');
    var error = $('#error');
    if(!name) {
    	  var error = $('#error');
        menu.html(error);
    } else
    	menu.html($('<p>').text('Welcome ' + name));
    menu.append(error);
    menu.append($('<h4>').text('Create a Level Sequence'));
    var seq_name = $('<input type="text" placeholder="Sequence Name">');
    menu.append(seq_name);
    menu.append($('<br>'));
    var namelevels = $('<select id="namelevels">');
    var sequences = $('<select id="sequences">');
    var addSequences = function() {
        sequences.html('');
        $.get('services/levelService.php', {sequences:true}, function(data) {
            var seqs = JSON.parse(data);
            console.log(seqs);
            $.each(seqs, function(index, value) {
                sequences.append($('<option>').val(index).text(value));
            });
                
            
        });
    }
    addSequences();
    var add = $('<input type="button" value="Add">');
    var build_levels = function() {
        $.get('services/levelService.php', {levels:true}, function(data) {

            var levelnames = JSON.parse(data).levels;
            namelevels.html('');
            for (var i = 0; i < levelnames.length; i++) {
                var name = levelnames[i].split('/')[1].split('.')[0];
                if ($.inArray(name, levels) < 0) {
                    namelevels.append($('<option>').text(name).val(name));
                }
            }
            if ($('#namelevels option').length == 0) {
                namelevels.hide();
                add.hide();
            } else {
                namelevels.show();
                add.show();
            }
            
        }).fail(function(err){console.log(err);});
    }
    var levels = [];
    var domLevels = $('<div id="levels">');
    menu.append(domLevels);

    var addlevels = function() {
        domLevels.html('');
        for (var i = 0; i < levels.length; i++) {
            var levelname = levels[i];
            var level = $('<div>');
            var label = $('<span>').text(levelname);
            level.append(label);
            var remove = $('<input type="button" value="Remove">');
            level.append(remove);
            remove.click(function () {
                levels = $.grep(levels, function(n, i) { return n !== levelname});
                build_levels();
                addlevels();

            });
            domLevels.append(level);
             build_levels();
        }
    }
    build_levels();
    menu.append(namelevels);
    
    menu.append(add);
    add.click(function() {
        levels.push(namelevels.val());
        addlevels();
        build_levels();
    });
    menu.append($('<br>'));
    var create = $('<input type="button" value="Create Sequence">');
    menu.append(create);
    create.click(function() {
        console.log('create');
        console.log(error);
        if (seq_name.val() === '') {
            console.log(seq_name.val());

            error.html('Please name your sequence');
        } else if (levels.length === 0) {
            console.log(levels.length);
             error.html('Please add levels to your sequence');
        } else {
            $.post('services/levelService.php', {seq:seq_name.val(), user_id:user_id, levels:levels}, function(data) {
                console.log(data);
                 addSequences();
            }).fail(function(err){
                console.log(err)
            });
        }
    });
     menu.append($('<br>'));
     menu.append($('<p>').text('Choose a sequence to play'));
      menu.append(sequences);
      var play = $('<input type="button"value="play">');
      play.click(function() {
        if(restart) 
            $.get('services/levelService.php', {seq_levels:sequences.val()}, function(data) {
                var jsondata = JSON.parse(data);
                levels = [];
                $.each(jsondata, function(index, value) {
                    levels.push(value);
                });
                restart_game(sequences.val(), levels, game);
                menu.html('');
                 var global_scores = $('<div id="global_scores" style="float:left;">');
                set_global_scores(global_scores);
                menu.append(global_scores);
                var user_scores = $('<div id="user_scores">');
                set_user_scores(user_scores, user_id);
                menu.append(user_scores);
            });
        else
            $.get('services/levelService.php', {seq_levels:sequences.val()}, function(data) {
                var jsondata = JSON.parse(data);
                levels = [];
                $.each(jsondata, function(index, value) {
                    levels.push(value);
                });
                console.log(levels);
               init_game(user_id, sequences.val(), levels);
                menu.html('');
                 var global_scores = $('<div id="global_scores" style="float:left;">');
                set_global_scores(global_scores);
                menu.append(global_scores);
                var user_scores = $('<div id="user_scores">');
                set_user_scores(user_scores, user_id);
                menu.append(user_scores);
            });
      });
      menu.append(play);
    menu.append($('<br>'));
   // console.log($('body #lout'));
    if (!restart) {
       var logout = $('<input id="lout" type="button" value="Logout">');
        $('body').append(logout);
        logout.click(function() {
            $(this).hide();
            $('#game').hide();
            $.removeCookie('mario', {path: '/'});
            create_login();
        });
    }
}

function set_user_scores(score_area, user_id) {
    $.get('services/userService.php', {userscores:true, user_id:user_id}, function(data) {
        console.log(data);
        data = JSON.parse(data);
        score_area.html('');
         var set = $('<fieldset style=" display: inline-block;">').append($('<legend>').text("Top 10 user scores"));
         var table = $('<table>');
        set.append(table);
        score_area.append(set);
           var row = $('<tr>');
            row.append($('<th style="padding:10px 5px 10px 5px;">').text('Username'));
             row.append($('<th style="padding:10px 5px 10px 5px;">').text('Score'));
            table.append(row);
        $.each(data, function(index, value) {
            row = $('<tr>');
            row.append($('<td style="padding:5px;">').text(index));
            row.append($('<td style="padding:5px;">').text(value));
            table.append(row);
        });
        var refresh = $('<input type="button" value ="Refresh">');
        refresh.click(function() {set_user_scores(score_area, user_id)});
        set.append(refresh);
    }).fail(function(err){console.log(err)}); 

}

function set_global_scores(score_area) {
    $.get('services/userService.php', {globalscores:true}, function(data) {
        console.log(data);
        data = JSON.parse(data);
        score_area.html('');
        var set = $('<fieldset style=" display: inline-block;">').append($('<legend>').text("Top 10 global scores"));
        var table = $('<table>');
        set.append(table);
        score_area.append(set);
             var row = $('<tr>');
             row.append($('<th style="padding:10px 5px 10px 5px;">').text('User name'));
            row.append($('<th style="padding:10px 5px 10px 5px;">').text('Level Sequence'));
            
             row.append($('<th style="padding:10px 5px 10px 5px;">').text('Score'));
            table.append(row);
        $.each(data, function(index, value) {
            row = $('<tr>');
            row.append($('<td style="padding:5px;">').text(value[0]));
            row.append($('<td style="padding:5px;">').text(index));
            
             row.append($('<td style="padding:5px;">').text(value[1]));
            table.append(row);
        });
        var refresh = $('<input type="button" value ="Refresh">');
        refresh.click(function() {set_global_scores(score_area)});
        set.append(refresh);
    }).fail(function(err){console.log(err)}); 

}

function create_login() {
     var attempts = 3;
         var login_error = 'Invalid username/password combination or user does not exist';
        var menu = $('#menu');
         var error = $('#error');
         if (!error[0])
             error = $('<div id="error" style="color:red;font-style:bold;">');
        menu.html(error);
        var error = $('#error');
        //error.html('Invalid username/password');

        menu.append($('<p>').text('Login'));
        var name = $('<input id="uname" type="text" placeholder="Username">');
        menu.append(name);
        menu.append($('<br>'));
        var pword = $('<input id="password" type="password" placeholder="Password">');
        menu.append(pword);
         menu.append($('<br>'));
         var login = $('<input type="button" value="Login">');
        menu.append(login);
        var reg = $('<input type="button" value="Register">');
        menu.append(reg);
       
        login.click(function() {
            if (name.val() === '') {
                error.html('Please enter a Username.');
            } else if(pword.val() === '') {
                 error.html('Please enter a Password.');
            } else if (attempts > 0) {
                $.post('services/userService.php', {login:true, name: name.val(), pword:pword.val()}, function(data) {
                    console.log(data);
                    if (attempts === 0) {
                        error.html('too many unsuccesful attempts made');
                    } else
                    if(data === 'user not found;') {
                        error.html(login_error);
                        attempts--;
                    } else {
                        user_id = parseInt(data);
                        $.cookie('mario', user_id, {expires: 7 , path: '/'});
                        
                        build_menu(name.val(), user_id);
                    }
                   

                }).fail(function(err) {
                    error.html('Could not login server error');
                    //attempts--;
                });
                
            }
        });

         reg.click(function() {
            if (name.val() === '') {
                error.html('Please enter a Username.');
            } else if(pword.val() === '') {
                 error.html('Please enter a Password.');
            } else if (attempts > 0) {
                $.post('services/userService.php', {register:true, name: name.val(), pword:pword.val()}, function(data) {
                    console.log(data);
                    if(data === 'user already exists') {
                        error.html(data);
                    } else {
                        user_id = parseInt(data);
                         $.cookie('mario', user_id, {expires: 7, path: '/'});
                         alert($.cookie('mario'));
                         build_menu(build_menu(name.val()));
                    }
                   

                }).fail(function(err) {
                    error.html('Could not register server error');
                });
                
            }
        });
}
