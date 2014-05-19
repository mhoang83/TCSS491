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
						{"id":4, "init_x":3356,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":5, "init_x":1200,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":6},
                        {"id":6, "init_x":1800,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":3},
                        {"id":7, "init_x":2000,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":7},
                        {"id":8, "init_x":2800,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":4},
                        {"id":9, "init_x":3000,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}


                    ],
                    "questionBlocks": [
                        {"id":1, "init_x":100,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":4},
                        {"id":2, "init_x":3183,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":1302,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":4, "init_x":1766,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":5, "init_x":1983,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":6, "init_x":2300,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":7, "init_x":2600,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":2},
                        {"id":8, "init_x":3085,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":3},
                        {"id":9, "init_x":2783,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":10, "init_x":2950,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":4}

                    ],
                    "shineyGoldBlocks": [
                        {"id":1, "init_x":287,"init_y":150,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":2, "init_x":1350,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":1367,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":1384,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":5, "init_x":1401,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":6, "init_x":1520,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":7, "init_x":1503,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":8, "init_x":1486,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                         {"id":9, "init_x":2395,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":10, "init_x":2412,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":11, "init_x":2429,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":12, "init_x":2446,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ],
                    "shineyBlueBlocks": [
                        {"id":1, "init_x":725,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":742,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":759,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":892,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":5, "init_x":776,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":6, "init_x":940,"init_y":169,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":7, "init_x":1059,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":8, "init_x":1042,"init_y":201,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":9, "init_x":1025,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":10, "init_x":1600,"init_y":185,"spritesheet": "/images/levelRemovedBorder1.png", "count":4},
                        {"id":11, "init_x":2683,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":6},
                        {"id":12, "init_x":2700,"init_y":200,"spritesheet": "/images/levelRemovedBorder1.png", "count":4},
                        {"id":13, "init_x":2717,"init_y":183,"spritesheet": "/images/levelRemovedBorder1.png", "count":2}


                    ],
                    "whiteMusicBlocks": [
                        {"id":1, "init_x":526,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":560,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":426,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":460,"init_y":165,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "pinkMusicBlocks": [
                        {"id":1, "init_x":543,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":577,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":3, "init_x":443,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":4, "init_x":477,"init_y":181,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "powBlocks": [
                        

                    ],
                    "colorExclamationBlocks": [
                        {"id":1, "init_x":875,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":2, "init_x":909,"init_y":217,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}

                    ],
                    "greenPipes": [
                        

                    ],
					"coin": [
                        {"id":1, "init_x":220,"init_y":210,"spritesheet": "/images/levelRemovedBorder1.png", "count":3},
                        {"id":2, "init_x":776,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":2, "init_x":940,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":5}

                    ]

                },
                "castle" : {"id": 1,"init_x":3464,"init_y":153,"spritesheet": "images/castlepole.gif"},
                "pole": {"id": 1,"init_x":3340,"init_y":60,"spritesheet": "images/castlepole.gif"}
            }
        }
    }








