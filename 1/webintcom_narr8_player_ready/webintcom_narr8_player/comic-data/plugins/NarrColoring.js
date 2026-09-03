define(["utils/Utils", "plugins/NarrColoringClass"], function (Utils, coloring) {
    var NarrColoring = Utils.newObjectType( NarrColoring, "NarrColoring"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrColoring.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
    	this.setProperty("o",0);
        this.firstStart = true;
    	description = description.settings;
    	this._opa = 0;
    	this.animate = false;
    	
		this.parseImg = false;
		if(description.img.retina){
			description.img.pos.x = description.img.pos.x * 2;
			description.img.pos.y = description.img.pos.y * 2;
			description.img.size.x = description.img.size.x * 2;
			description.img.size.y = description.img.size.y * 2;
		
		}
		this.imgRealSize = description.img.realsize;
		this.coloringBox = {x : description.img.pos.x, y : description.img.pos.y, w : description.img.size.x, h : description.img.size.y};
		
		this.objects = {}; //все объекты расскраски
		this.hitAreas = [];
		
		this.contentIsLoad = 0;
		
		this.enableColoring = false;
		/////////////////////////////////////Модуль загрузки картинок///////////////////////
		this.imgs = (function(){                 
			var imgs = {};                     
			var n = 0;							 
			var callBack = function(){};		 
			
			function allLoad(func){				
				if(func) callBack = func;
			}

			function load(){
				n--;
				if(n==0) callBack();			
			}
			
			function add(src){					
				
				if(src in imgs){				
					//console.log("Уже добавляли " + src)
					return;					   
				} 
				
				n++;
				imgs[src] = new Image();
				imgs[src].onload = load;
				imgs[src].src = src;
				
				return imgs[src];
			}
		
			function get(src){
				return imgs[src];
			}
		
			function append(src, domNode){
				domNode.appendChild(imgs[src]);
				return imgs[src];
			}
			
			function imgStyle(src, box){
				if(!(src in imgs)){
					//console.log("Нету картинки " + src);
					return;
				} 

				imgs[src].style.position = "absolute";
				imgs[src].style.width = box.w + "px ";
				imgs[src].style.height = box.h + "px ";
				imgs[src].style.left = box.x + "px ";
				imgs[src].style.top = box.y + "px ";
				
				return imgs[src];	
			}
		
			return {
				add : add,
				get : get,
		   imgStyle : imgStyle,	
			allLoad : allLoad,
 			 append : append
			
			};
		})();	
		//////////////////////////конец хмодуль загрузки//////////////////////////////////
		var _this = this;
	requirejs([description.template+".js"],
		function(tmpl){
			_this.coloring = new coloring({w:tmpl.coloring.box.w, h:tmpl.coloring.box.h});		
    		_this.img = new Image();
    		_this.img.setAttribute('crossOrigin', 'Anonymous');
    		_this.img.onload = function(){ _this.load(); };
    		_this.img.src = description.img.src;
			_this.makeTemplate(tmpl);	
			_this.coloring.paintCanvas.style.left = 0 + "px";
			_this.coloring.paintCanvas.style.top = 0 + "px";
			_this.coloring.mainCanvas.style.left = 0 + "px";
			_this.coloring.mainCanvas.style.top = 0 + "px";
			_this.tmpl = tmpl;
		}
	);	
};
    
    
    
    NarrColoring.prototype.makeTemplate = function(tmpl){
    	var n = 0;
    	for(var f in tmpl){
            if(!tmpl.hasOwnProperty(f)) continue;
    		n++;
    		var node = document.createElement("div");
    		node.style.position = "absolute";
    		node.style.overflow = "visible";
    		node.className = "coloring" + f;
    		
    		if("box" in tmpl[f]){
    			node.style.left = tmpl[f].box.x + "px";
    			node.style.top = tmpl[f].box.y + "px";
    			node.style.width = tmpl[f].box.w + "px";
    			node.style.height = tmpl[f].box.h + "px";
    		} else if(tmpl[f].length>0) {
    			tmpl[f].forEach(function(value){
    				n++;
    				if( ("img" in value) && (value.img) ){
    					

    		var _img =  this.imgs.add(value.img);
   						this.imgs.imgStyle(value.img, value.box);
    					this.imgs.append(value.img, node);

	    				if(value.default){
	    					_img.style.opacity = 1 ;  	
							if(("act" in value) &&  ("setTool" == value.act[0])) this.coloring.setTool(value.act[1]);    				
	    				} else {
	    					_img.style.opacity = 0 ; 
	    				}
    				}
    					    				
    				
    				this.objects[f + n] = _img;
    				
    				if( ("interact" in value) && (value.interact) ){
    					
						this.hitAreas.push({
							id : f + n,	
						   box : value.box,
						 group : value.group,
						   act : value.act,
					 animation : value.animation	 	   
						});

    				}    				
    			
    			}, this);
    		
    		}
    		
			this.view.appendChild(node);
    		this.objects[f] = node;	
    		
    	}
    
    }; 
    
    NarrColoring.prototype.load = function(){
    	
    	if(this.contentIsLoad == 0){
    			this.contentIsLoad++;
    			return;
    	}

    	if(!this.parseImg){
    		this.img.width = this.imgRealSize.x;
            this.img.height = this.imgRealSize.y;
    		this.coloring.parseImg(this.img,this.coloringBox.x,this.coloringBox.y,this.coloringBox.w, this.coloringBox.h);
			this.objects.coloring.appendChild(this.coloring.paintCanvas);
			this.objects.coloring.appendChild(this.coloring.mainCanvas);
			this.parseImg = true;
		}

		this.enableColoring = false;
		this.setProperty("o",0);

        if(this.firstStart) {
            this.firstStart = false;
            this.delegate.addEventListener("coloring", function () {
                this.start();
            }.bind(this));
        }

    }; 
    
    NarrColoring.prototype.start = function(){
    	if(this.enableColoring || this.animate) return;
		this.animate = true;
		this.animateTo("_opa",1,1000,"linear"	);
		setTimeout(function(){
			this.enableColoring = true;
			this.animate = false;
			this.delegate.fireEvent('pauseLock');
		}.bind(this),1000);
    };
    
    /////////////////переключение кнопок////////////////
     NarrColoring.prototype.setTool = function(butt){

        for(var i = this.hitAreas.length; i--;){
	
     		if( (this.hitAreas[i].group == butt.group) && (this.objects[this.hitAreas[i].id])) this.objects[this.hitAreas[i].id].style.opacity = 0;
     	}
     	
     	this.objects[butt.id].style.opacity = 1;
		this.coloring.setTool(butt.act[1]);

     };
    
    ///////////render///////////////////
     NarrColoring.prototype.draw = function(){
     	if(this.animate){
     	
     		this.setProperty("o",this._opa);
     	
     	}
     
     };


    //////////подписка на события мыши/тапа
    
    Utils.addBehaviour('touch', 'NarrColoring', 'NarrColoring-tap',
        {
            start: function (e) {
            	var coord = this.getInternalCoordinatesForPoint(e);
            	coord.x = Math.floor(coord.x);
            	coord.y = Math.floor(coord.y);
				
				//console.log(coord.x, coord.y, " - ", this.tmpl.coloring.box.x + this.tmpl.coloring.box.w, this.tmpl.coloring.box.y + this.tmpl.coloring.box.h);
				
				
				if( this.enableColoring &&
					(coord.x > this.tmpl.coloring.box.x) && 
					(coord.x < this.tmpl.coloring.box.x + this.tmpl.coloring.box.w ) && 
					(coord.y > this.tmpl.coloring.box.y) && 
					(coord.y < this.tmpl.coloring.box.y + this.tmpl.coloring.box.h )  
				){
					coord.x = coord.x - this.tmpl.coloring.box.x;
                	coord.y = coord.y - this.tmpl.coloring.box.y; 
            		this.coloring.coloringStart( Math.floor(coord.x),  Math.floor(coord.y));
            		e.stopPropagation();
            		return;
				
				}

                var _this = this;
				
                for(var i = this.hitAreas.length; i--;){
                	if(
                		(coord.x>this.hitAreas[i].box.x) &&
                		(coord.x<this.hitAreas[i].box.x+this.hitAreas[i].box.w) &&
                		(coord.y>this.hitAreas[i].box.y) &&
                		(coord.y<this.hitAreas[i].box.y+this.hitAreas[i].box.h)
                	)  {
                		switch(this.hitAreas[i].act){
                			case "open":
                				if(!this.enableColoring&&!this.animate){
                					this.start();
                					e.stopPropagation();
                				}
                				break;
                			case "close":
                					if(this.enableColoring&&!this.animate){
                					e.stopPropagation();
                					this.enableColoring = false;
                					this.animate = true;
                					this.animateTo("_opa",0,1000,"linear"	);
                					setTimeout(function(){
                						_this.animate = false;
                                        _this.delegate.fireEvent('pauseUnlock');
                					},1000);
                					//this.setProperty("o",0);

                				}
                				break;
                			case "clear":
                				if(this.enableColoring) this.coloring.clearcanvas();
                				e.stopPropagation();
                				break;
                			default:
                				if(this.enableColoring) this.setTool(this.hitAreas[i]);
                				e.stopPropagation();
                		}
                	}
                }
            
                return false;
            },
            end: function () {
            	//var coord = this.getInternalCoordinatesForPoint(e);
                return false;
            }
        }, false);

    Utils.addBehaviour('pan', 'NarrColoring', 'NarrColoring-pan',
        {
            start: function (e) {
				e.stopPropagation();
                var coord = this.getInternalCoordinatesForPoint(e);
                
                coord.x = coord.x - this.tmpl.coloring.box.x;
                coord.y = coord.y - this.tmpl.coloring.box.y; 
                
            	this.coloring.coloringStart( Math.floor(coord.x),  Math.floor(coord.y));
            	return true;
            },
            move: function (e) {
            	e.stopPropagation();
                var coord = this.getInternalCoordinatesForPoint(e);
                coord.x = coord.x - this.tmpl.coloring.box.x;
                coord.y = coord.y - this.tmpl.coloring.box.y; 
            	this.coloring.coloringMove( Math.floor(coord.x),  Math.floor(coord.y));
            	return true;
            },
            swipe: function (e) {
            	e.stopPropagation();
                return true;
            },
            end: function (e) {
            	e.stopPropagation();
            	var coord = this.getInternalCoordinatesForPoint(e);
                coord.x = coord.x - this.tmpl.coloring.box.x;
                coord.y = coord.y - this.tmpl.coloring.box.y;           
                this.coloring.coloringEnd( Math.floor(coord.x),  Math.floor(coord.y));
                return true;
            }
        }, false);


    NarrColoring.prototype.customHittest = function (e, gesture) {
		
		e.self = this;

		switch(gesture){
			
			case "NarrColoring-pan":
				 if(!this.enableColoring) return false;
				return e;
				break;
			
			case "NarrColoring-tap":
				return e;
				break;	  
		}
		
		return false;
    }; 
    
    return NarrColoring;
});