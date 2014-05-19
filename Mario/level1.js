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
                    "staticGoldblocks": [
                        {"id":1, "init_x":66,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":2, "init_x":168,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":3, "init_x":3200,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":8},
                        {"id":4, "init_x":892,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":5, "init_x":3356,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "questionBlocks": [
                        {"id":1, "init_x":100,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":4}

                    ],
                    "shineyGoldBlocks": [
                        {"id":1, "init_x":287,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ],
                    "shineyBlueBlocks": [
                        {"id":1, "init_x":725,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":742,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":759,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":776,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ],
                    "whiteMusicBlocks": [
                        {"id":1, "init_x":526,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":560,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "pinkMusicBlocks": [
                        {"id":1, "init_x":543,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":577,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "powBlocks": [
                        {"id":1, "init_x":375,"init_y":215,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "colorExclamationBlocks": [
                        {"id":1, "init_x":875,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":909,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "greenPipes": [
                        {"id":1, "init_x":450,"init_y":183,"spritesheet": "/images/pipe.png", "count":3}

                    ],
					"coin": [
                        {"id":1, "init_x":220,"init_y":210,"spritesheet": "/images/levelRemovedBorder1.png", "count":3},
                        {"id":2, "init_x":776,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ]

                },
                "castle" : {"id": 1,"init_x":3464,"init_y":153,"spritesheet": "images/castlepole.gif"},
                "pole": {"id": 1,"init_x":3340,"init_y":60,"spritesheet": "images/castlepole.gif"}
            }
        }
    }








