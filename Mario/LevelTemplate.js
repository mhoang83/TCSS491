
/*
Each level picture is 512x256

0,0 - Level 1 (Blue Sky Colorful Block)
514, 0 - Level 2 (Poka Dot mounds)

0, 258 - Level 3 (Clouds and green Mounds): 
514, 258 - Level 4 (Desert and Pyramids): 

0, 516 - Level 5 (UnderGround and dirt):
514, 516 - Level 6 (Desert Empty):

0, 774 - Level 7 (UnderWater):
514, 774 - Level 8 (Rockey with Water ditechs):

0, 1032 - Level 9: (Forest)
514, 1032 - Level 10: (Castle

*/
	var level = 

		{ "id": "Level 1",
			"description": "Blue Sky Colorful Blocks",
			"background":{
				"spritesheet": "/images/mariolevels.png",
				"startX":0,
				"startY":0,
				"sizeX":512,
				"sizeY":256
			},
			"entities":{
				"players": {


				},
				"enemies":{


				},
				"blocks":{


				}
			}
		},

				{ "id": "Level 2",
			"description": "Poka Dot mounds",
			"background":{
				"spritesheet": "/images/mariolevels.png",
				"startX":514,
				"startY":0,
				"sizeX":512,
				"sizeY":256
			},
			"entities":{
				"players": {


				},
				"enemies":{


				},
				"blocks":{


				}
			}
		}
	};