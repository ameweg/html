define([], function () {

	var skin = function(view, params){
		if(!view || !params) return false;
		
		this._params = params;
		this._view = view;
		this._parent = 0;
		this._elements = [{box : {x:0,y:0, w:0, h:0}, name : "root", children : this._elements, src : view}];
		this._names = {};
		this._acts = [];
		this._groups = {};
		this.acts = {}; 
		
		this._createElements(params, view);
		
		this._curentIterator = -1;
	};
	
	skin.prototype.hitTest = function(x,y){
	
		for(var i = this._acts.length; i -- ;){
			if(this._acts[i].box.x < x && (this._acts[i].box.x + this._acts[i].box.w) > x &&  this._acts[i].box.y < y && (this._acts[i].box.y + this._acts[i].box.h) > y ) return this._acts[i];
		}
		return false;
	};
	
	skin.prototype.elementOff = function(node){
		node.visible = 0;
		node.src.style.opacity = node.visible;
		
	};
	
	skin.prototype.elementOn = function(node){
		node.visible = 1;
		node.src.style.opacity = node.visible;
		
	};	
	
	skin.prototype.toggleElements = function(node){
		
		if(node && this._groups[node.parent.name] && this._groups[node.parent.name].length){
			for(var i = this._groups[node.parent.name].length; i--;){
				this._groups[node.parent.name][i].src.style.opacity = 0;
				this._groups[node.parent.name][i].visble = 0;
			}
			node.visible =1;
			node.src.style.opacity = 1;
		}
		
		
		node.src.style.opacity = node.visible;
		
	};
	
	skin.prototype.toggleElement = function(node){
		node.visible = node.visible ? 0 : 1;
		node.src.style.opacity = node.visible;
		
	};
	
	skin.prototype.getNextElement = function(n){
		this._curentIterator++;
		return this.getElement(this._curentIterator)
	};
	
	
	skin.prototype.getElement = function(n){
	
		if(this._elements[n]) {
			this._curentIterator = n;
			return this._elements[n];
		}	
		this._curentIterator = -1;
		return this.getNextElement() ;
	};
	
	
	skin.prototype.getElements = function(){
		return this._elements;
	};
	
	skin.prototype.getByName = function(name){
		return (this._names[name] ? this._names[name] : undefined);
	};
	
	skin.prototype.getActs = function(){
		return this._acts;
	};	
	
	
	skin.prototype._createElements = function(params, view){

		
		for(var i = params.length; i--;){
			if( "items" in params[i] ) {
				this._createElement("div", params[i], view);
				var par = this._parent;
				this._parent = this._elements.length-1;
				this._createElements( params[i].items, this._elements[this._parent].src );
				this._parent = par;
				
			} else {
				this._createElement("img", params[i], view);
			}
		}
	};
	
	skin.prototype._createElement = function(elType, params, view){
		var node = {};

		node.src = document.createElement(elType);
		node.src.style.position = "absolute";
		node.src.style.width = params.box.w + "px";
		node.src.style.height = params.box.h + "px";
		node.src.style.left = params.box.x + "px";
		node.src.style.top = params.box.y + "px";
		node.box = {
			x: params.box.x,
			y: params.box.y,
			w: params.box.w,
			h: params.box.h
			};;
		node.box.x += this._elements[this._parent].box.x;
		node.box.y += this._elements[this._parent].box.y;
		node.name = params.name;
		node.parent = this._elements[this._parent];
		node.def = params.def ? true : false;	
		node.visible = params.visible;
		node.src.style.opacity = node.visible ? 1 : 0;
		
		if("src" in params && params.src && elType == "div") {
			var tmpParams = {
				box : {x: 0, y: 0, w:params.box.w, h:params.box.h},
				src : params.src,
				visible : true,
				def : true
			};
			
			this._createElement("img", tmpParams, node.src);
			
		} else if("src" in params && params.src && elType == "img") {
			node.src.src = params.src;
			node.src.width = params.box.w;
			node.src.height = params.box.h;
			
		}
		
		if(this._elements[this._parent].name != "root"){
		this._groups[this._elements[this._parent].name] = this._elements[this._parent].name in this._groups ?  this._groups[this._elements[this._parent].name] : [];
			this._groups[this._elements[this._parent].name].push(node);
		}
		
		if("act" in params && params.act)  {
			node.act = params.act;
			this._acts.push(node);
			this.acts[params.act.name] = params.act.value;
		}
		
		if(node.name){
			this._elements.push(node);
			this._names[node.name] = node;
		}
		
		if(view) view.appendChild(node.src);
		
		
	};

	return skin;
});