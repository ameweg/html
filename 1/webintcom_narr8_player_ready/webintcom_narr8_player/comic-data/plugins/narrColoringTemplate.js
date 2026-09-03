define([], function () {	
	return {
	
	
	 	"coloring" : {
	 			"box" : {"x" : 114, "y" : 206, "w" : 539, "h" : 751},
	 	},
	 	"top" : [
	 			{
	 				"img" : "img/tpl/back.png",
	 				"box" : {"x" : 0, "y" : 0, "w" : 768, "h" : 1537},
					"interact" : false,
	 				"default"  : true
	 			}, 
				{ 
					"img"      : "img/tpl/but4.png",
	 				"box"      : {"x" : 607, "y" : 204, "w" : 50, "h" : 50},
					"interact" : false, 
					"default"  : true
				}, 
				{ 
					"img"      : "img/tpl/but3.png",
	 				"box"      : {"x" : 108, "y" : 206, "w" : 50, "h" : 50},
					"interact" : false, 
					"default"  : true
				}, 
				{ 
					"img"      : "img/tpl/but2.png",
	 				"box"      : {"x" : 609, "y" : 911, "w" : 50, "h" : 50},
					"interact" : false, 
					"default"  : true
				}, 
				{ 
					"img"      : "img/tpl/but1.png",
	 				"box"      : {"x" : 105, "y" : 909, "w" : 50, "h" : 50},
					"interact" : false, 
					"default"  : true
				}
//            ,
//				{
//					"box"  : {"x" : 245, "y" : 600, "w" : 299, "h" : 200}, ///Слушатель кнопки паинт
//					"interact" : true,
//					"act"  : "open",
//					"default"  : false
//	 			}
	 		 ],
	 		"colors" : [ 

				{
	 				"img"  : "img/tpl/colorred.png",
	 				"box"  : {"x" : 0, "y" : 1099, "w" : 95, "h" : 95},
	 				"act"  : ["setTool" , { "toolcolor" : [255,0,0,255] } ],
	 				"animation" : {}, 
					"group"    : "colors", 
					"interact" : true, 
					"default"  : true
				},
	 			{ 
					"img"    : "img/tpl/colororange.png",
					"box"    : {"x" : 83, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [248,96,0,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/coloryellow.png",
					"box"    : {"x" : 168, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [255,240,0,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorgreen.png",
					"box"    : {"x" : 252, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [75,211,0,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorblue.png",
					"box"    : {"x" : 337, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [0,222,230,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorcian.png",
					"box"    : {"x" : 421, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [10,24,182,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorviolet.png",
					"box"    : {"x" : 506, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [126,0,227,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorpink.png",
					"box"    : {"x" : 590, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [250,0,200,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				},
	 			{ 
					"img"    : "img/tpl/colorlgreen2.png",
					"box"    : {"x" : 675, "y" : 1099, "w" : 95, "h" : 95},
					"act"    : ["setTool" , { "toolcolor" : [0,234,143,255] } ],
					"animation" : {},
	 				"group"  : "colors", 
					"interact" : true 
				}
			],
	 		"tools" : [ 
				{
		 				"img"    : "img/tpl/brushbig.png",
		 				"box"    : {"x" : 109, "y" : 966, "w" : 96, "h" : 129},
		 				"act"    : ["setTool" , { "tooltype" : "brush", "toolsize" : "40", "toolopacity" : 0.2,"toolsoft"   : 0.4, "toolcomposite" : "source-over"} ],
		 				"animation" : {},
		 				"group"  : "tools", 
						"interact" : true,
	 					"default"   : false
	 			}, 
				{
		 				"img"    : "img/tpl/brushmed.png",
		 				"box"    : {"x" : 198, "y" : 976, "w" : 80, "h" : 108},
		 				"act"    : ["setTool" , { "tooltype" : "brush", "toolsize" : "20", "toolopacity" : 0.2,"toolsoft"   : 0.4, "toolcomposite" : "source-over"} ],
		 				"animation" : {},
		 				"group"  : "tools", 
						"interact" : true,
	 					"default"   : false
	 			}, 
				{
		 				"img"    : "img/tpl/brushlo.png",
		 				"box"    : {"x" : 276, "y" : 984, "w" : 69, "h" : 92},
		 				"act"    : ["setTool" , { "tooltype" : "brush", "toolsize" : "10", "toolopacity" : 0.2,"toolsoft"   : 0.4, "toolcomposite" : "source-over"} ],
		 				"animation" : {},
		 				"group"  : "tools", 
						"interact" : true,
	 					"default"   : false
	 			}, 
				{
		 				"img"    : "img/tpl/erase.png",
		 				"box"    : {"x" : 370, "y" : 986, "w" : 81, "h" : 97},
		 				"act"    : ["setTool" , { "tooltype" : "erase", "toolsize" : "40", "toolopacity" : 1,"toolsoft"   : 1, "toolcomposite" : "source-over" } ],
		 				"animation" : {},
		 				"group"  : "tools",
	 					"interact" : true 
				},
	 			{
		 				"img"    : "img/tpl/fill.png",
		 				"box"    : {"x" : 488, "y" : 979, "w" : 141, "h" : 108},
		 				"act"    : ["setTool" , { "tooltype" : "fill"} ],
		 				"animation" : {},
		 				"group"  : "tools", 
						"interact" : true,
                        "default"   : true
	 			},
	 			{
		 				"img"    : false,
		 				"box"    : {"x" : 667, "y" : 342, "w" : 87, "h" : 96},
		 				"act"    : "close", 
						"animation" : {},
						"group"  : "tools", 
						"interact" : true
	 			}, 
				{
		 				"img"    : false, 
						"box"    : {"x" : 670, "y" : 256, "w" : 86, "h" : 78},
						"act"    : "clear",
	 					"animation" : {},
	 					"group"  : "tools", 
						"interact" : true 
				}
	 		]
	 	}; 
});	