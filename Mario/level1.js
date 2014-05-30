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
                        {"id":1, "init_x":100,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":2, "init_x":910,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":3, "init_x":475,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":4, "init_x":1180,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":5, "init_x":1680,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":6, "init_x":1980,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":7, "init_x":2250,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":8, "init_x":2550,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":9, "init_x":2850,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":10, "init_x":3150,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1}
                    ],
                    "redkoopa":[
                        {"id":1, "init_x":50,"init_y":210,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":0},
                        {"id":1, "init_x":100,"init_y":205,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":1, "init_x":1980,"init_y":205,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1},
                        {"id":1, "init_x":3150,"init_y":205,"spritesheet":"images/smb3_enemies_sheet.png","initial_state":1}
                    ],
                    "chomper":[
                        {"id":1, "init_x":642,"init_y":127,"spritesheet":"images/smb3_enemies_sheet.png"}
                    ],
                    "skeletalturtle":[
                        {"id":1, "init_x":100,"init_y":205,"spritesheet":"images/smb3_enemies_sheet.png"}
                    ],
                    "bonybeetle":[
                        {"id":1, "init_x":50,"init_y":205,"spritesheet":"images/smb3_enemies_sheet.png"}
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
                        {"id":1, "init_x":650,"init_y":183,"spritesheet": "/images/pipe.png", "count":3},
                        {"id":2, "init_x":1879,"init_y":183,"spritesheet": "/images/pipe.png", "count":2},
                        {"id":3, "init_x":2182,"init_y":183,"spritesheet": "/images/pipe.png", "count":3}

                    ],
                    "coin": [
                        {"id":1, "init_x":220,"init_y":210,"spritesheet": "/images/levelRemovedBorder1.png", "count":3},
                        {"id":2, "init_x":776,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                        {"id":3, "init_x":940,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":5},
                            {"id":4, "init_x":1401,"init_y":125,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":5, "init_x":1418,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":6, "init_x":1435,"init_y":115,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":7, "init_x":1452,"init_y":120,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":8, "init_x":1469,"init_y":125,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                            {"id":9, "init_x":1850,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":10, "init_x":1867,"init_y":70,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":11, "init_x":1884,"init_y":65,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":12, "init_x":1901,"init_y":70,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":13, "init_x":1918,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                            {"id":14, "init_x":2156,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":15, "init_x":2173,"init_y":70,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":16, "init_x":2190,"init_y":65,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":17, "init_x":2207,"init_y":70,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":18, "init_x":2224,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                            {"id":19, "init_x":1624,"init_y":163,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":20, "init_x":1624,"init_y":146,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":21, "init_x":1624,"init_y":129,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":22, "init_x":1624,"init_y":112,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":23, "init_x":1624,"init_y":95,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                             {"id":24, "init_x":2480,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":25, "init_x":2497,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":26, "init_x":2514,"init_y":85,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":27, "init_x":2531,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":28, "init_x":2548,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":29, "init_x":2565,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":30, "init_x":2582,"init_y":85,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":31, "init_x":2599,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":32, "init_x":2616,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":33, "init_x":2633,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                         {"id":34, "init_x":2650,"init_y":85,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":35, "init_x":2667,"init_y":80,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":36, "init_x":2684,"init_y":75,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                             {"id":37, "init_x":2899,"init_y":163,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":38, "init_x":2899,"init_y":146,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":39, "init_x":2899,"init_y":129,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":40, "init_x":2899,"init_y":112,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":41, "init_x":2899,"init_y":95,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                            {"id":42, "init_x":3151,"init_y":163,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":43, "init_x":3151,"init_y":146,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":44, "init_x":3151,"init_y":129,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":45, "init_x":3151,"init_y":112,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":46, "init_x":3151,"init_y":95,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                             {"id":47, "init_x":543,"init_y":113,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":48, "init_x":577,"init_y":113,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":49, "init_x":443,"init_y":113,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":50, "init_x":477,"init_y":113,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                              {"id":51, "init_x":526,"init_y":97,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":52, "init_x":560,"init_y":97,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":53, "init_x":426,"init_y":97,"spritesheet": "/images/levelRemovedBorder1.png", "count":1},
                        {"id":54, "init_x":460,"init_y":97,"spritesheet": "/images/levelRemovedBorder1.png", "count":1}




                    ]

                },
                "castle" : {"id": 1,"init_x":3464,"init_y":153,"spritesheet": "images/castlepole.gif"},
                "pole": {"id": 1,"init_x":3340,"init_y":60,"spritesheet": "images/castlepole.gif"}
            }
        }
    }








