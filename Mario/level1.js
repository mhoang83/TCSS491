var level1 = {"levels":
        { "id": 1,
            "description": "Blue Sky Colorful Blocks",
            "background":{
                "spritesheet": "/images/mariolevels.png",
                "start_x":1,
                "start_y":1,
                "size_x":512,
                "size_y":256,
                "length":7
            },
            "entities":{
                "players":{
                    "mario":{
                        "init_x":0,
                        "init_y":208,
                        "spritesheet":"images/smb3_mario_sheet.png"
                    }
                },
                "enemies":{
                    "goomba":[
                        {"id":1, "init_x":100,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png"},
                        {"id":2, "init_x":180,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png"},
                        {"id":3, "init_x":580,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png"},
                        {"id":4, "init_x":475,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png"}
                    ]
                },


                "blocks":{

                    /*
                        ID id of single block, or flat repeated platform if count greater than 1 
                        init_x and init_y are positions on canvas; 
                        count number of blocks for this platform (only use this if flat platform, since stairs are considered a single platform, where count is 1 per incline of Y for each step)
                    */
                    "staticGoldblocks": [
                        //First Platform with question boxes in between these 2 groups
                        {"id":1, "init_x":66,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":2, "init_x":168,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},

                        //Second instance with Exclamation boxes on either side
                        {"id":3, "init_x":892,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "questionBlocks": [
                        //First platform from beginning in between staticGoldBlocks
                        {"id":1, "init_x":100,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":4}

                    ],
                    "shineyGoldBlocks": [
                        //Second platform from beginning consisting of 5 shiney gold blocks
                        {"id":1, "init_x":287,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ],
                    "shineyBlueBlocks": [
                        {"id":1, "init_x":725,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":742,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":759,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":776,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ],
                    "whiteMusicBlocks": [
                        // First grouping of White and Pink music boxes from beginning  
                        {"id":1, "init_x":526,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":560,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "pinkMusicBlocks": [
                        // First grouping of White and Pink music boxes from beginning  
                        {"id":1, "init_x":543,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":577,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "powBlocks": [
                        // Single Pow box (not animated) near Green Pipe    
                        {"id":1, "init_x":375,"init_y":215,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "colorExclamationBlocks": [
                        // Color Exclamation blocks near end of map with single static gold in between them 
                        {"id":1, "init_x":875,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":909,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],


                    /*
                        ID = id of single block, or flat repeated platform if count > 1; 
                        init_x and init_y = position on canvas; 
                        count = number of blocks for this pipe    Example, a small clip can be added to raise the bottom of the initial pipe to make it higher. 
                        3 of these would mean the initial pipe has been added to it, so height would be 4. height equal to 1 means the current pipe is a basic pipe. 
                    */
                    "greenPipes": [
                        {"id":1, "init_x":450,"init_y":183,"spritesheet": "/images/pipe.png", "count": 1}

                    ]

                }
            }
        }
};