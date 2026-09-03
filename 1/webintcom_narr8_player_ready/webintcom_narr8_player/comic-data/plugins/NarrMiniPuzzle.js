define(["utils/Utils"], function (Utils) {
var NarrMiniPuzzle = Utils.newObjectType(NarrMiniPuzzle, "NarrMiniPuzzle");
NarrMiniPuzzle.prototype.init = function(description){
    this.settings = description.settings;
    this.elements = [];
};
NarrMiniPuzzle.prototype.draw = function(){
    if(this.action)
    {
        if(this.animationElement.type == 'left' || this.animationElement.type == 'right')
        {
            this.animationElement.position.x = this.startX - (this.startX - this.endX) * this.seek;
            this.animationElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.places[this.animationElement.id].x, this.places[this.animationElement.id].y);
        }
        else if(this.animationElement.type == 'top' || this.animationElement.type == 'down')
        {
            this.animationElement.position.y = this.startY - (this.startY - this.endY) * this.seek;
            this.animationElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.places[this.animationElement.id].x, this.places[this.animationElement.id].y);
        }

    }
}
NarrMiniPuzzle.prototype.load = function(){
    if(!this.container)
    {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.width = this.width + 'px';
        this.container.style.height = this.height + 'px';
        this.places = [];
        var count = 0;
        for(var i = 0; i < this.settings.place.y; i++)
        {
            for(var j = 0; j < this.settings.place.x; j++)
            {
                this.places.push({
                    x           : Math.floor(this.width / this.settings.place.x * j),
                    y           : Math.floor(this.height / this.settings.place.y * i),
                    xID         : j,
                    yID         : i,
                    id          : count,
                    status      : false,
                    neighbor    : {left:false,right:false,top:false,down:false}
                });
                if(count < this.settings.place.x * this.settings.place.y - 1)
                {
                    this.elements.push({
                        container   : document.createElement('div'),
                        canvas      : document.createElement('canvas'),
                        id          : count,
                        startID     : count,
                        size        : {x:Math.floor(this.width/this.settings.place.x),y:Math.floor(this.height/this.settings.place.y)},
                        position    : {x:0,y:0}
                    });
                    this.elements[count].container.style.width = Math.ceil(this.elements[count].size.x*this.settings.scaleImage) + 'px';
                    this.elements[count].container.style.height = Math.ceil(this.elements[count].size.y*this.settings.scaleImage) + 'px';
                    this.elements[count].container.style.position = 'absolute';
                    if(this.settings.images[0]&&this.settings.images[0].src)
                    {
                        this.elements[count].container.style['background-image'] = 'url(' + this.settings.images[0].src + ')';
                        this.elements[count].container.style['background-size'] = this.width + 'px ' + this.height + 'px';
                        this.elements[count].container.style['background-position'] = Math.ceil(-this.elements[count].size.x*j) + 'px ' + Math.ceil(-this.elements[count].size.y*i) + 'px';
                        this.elements[count].container.style['background-repeat'] = 'no-repeat';
                    }
                    this.container.appendChild(this.elements[count].container);
                }
                count++;
            }
        }

        for(i = 0; i < this.places.length; i++)
        {
            for(j = 0; j < this.places.length; j++)
            {
                if(this.places[i].xID == this.places[j].xID)
                {
                    if(this.places[i].yID == this.places[j].yID - 1)
                        this.places[i].neighbor.down = this.places[j];
                    else if(this.places[i].yID == this.places[j].yID + 1)
                        this.places[i].neighbor.top = this.places[j];
                }
                else if(this.places[i].yID == this.places[j].yID)
                {
                    if(this.places[i].xID == this.places[j].xID - 1)
                        this.places[i].neighbor.right = this.places[j];
                    else if(this.places[i].xID == this.places[j].xID + 1)
                        this.places[i].neighbor.left = this.places[j];
                }
            }
        }
    }
    for(i = 0; i < this.elements.length; i++)
    {
        this.elements[i].position.x = this.places[i].x;
        this.elements[i].position.y = this.places[i].y;
        this.elements[i].container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[i].position.x, this.elements[i].position.y);
        this.elements[i].id = i;
    }
    this.view.appendChild(this.container);
    this.startGameMiniPuzzle();
}
NarrMiniPuzzle.prototype.unload = function(){
    this.moveElement = false;
    this.animationElement = false;
    this.view.removeChild(this.container);
}
NarrMiniPuzzle.prototype.startGameMiniPuzzle = function(){
    this.mixUnitsMiniPuzzle();
    this.activateEmptyPlace();
}
NarrMiniPuzzle.prototype.activateEmptyPlace = function(){
    for(var i = 0; i < this.elements.length; i++)
    {
        if(this.places[this.elements[i].id] != this.emptyPlace)
        {
            this.elements[i].action = false;
            if(this.emptyPlace.xID == this.places[this.elements[i].id].xID)
            {
                if(this.emptyPlace.yID == this.places[this.elements[i].id].yID + 1)
                {
                    this.elements[i].type = 'top';
                    this.elements[i].action = true;
                }
                else if(this.emptyPlace.yID == this.places[this.elements[i].id].yID - 1)
                {
                    this.elements[i].type = 'down';
                    this.elements[i].action = true;
                }
            }
            else if(this.emptyPlace.yID == this.places[this.elements[i].id].yID)
            {
                if(this.emptyPlace.xID == this.places[this.elements[i].id].xID + 1)
                {
                    this.elements[i].type = 'left';
                    this.elements[i].action = true;
                }
                else if(this.emptyPlace.xID == this.places[this.elements[i].id].xID - 1)
                {
                    this.elements[i].type = 'right';
                    this.elements[i].action = true;
                }
            }
        }
    }
}
NarrMiniPuzzle.prototype.mixUnitsMiniPuzzle = function(){
    for(var i = 0; i < this.places.length; i++)
    {
        if(this.elements[i])
            this.elements[i].id = i;
        else
            this.emptyPlace = this.places[i];
    }

    for(i = 0; i < this.settings.place.x * this.settings.place.y * 100; i++)
    {
        var element = this.randomElementMiniPuzzle();
        if(element)
        {
            var id = this.emptyPlace.id;
            this.emptyPlace = this.places[element.id];
            element.id = id;
            element.position.x = this.places[element.id].x;
            element.position.y = this.places[element.id].y;
        }
    }

    for(i = 0; i < this.elements.length; i++)
        this.elements[i].container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.places[this.elements[i].id].x, this.places[this.elements[i].id].y);
}
NarrMiniPuzzle.prototype.randomElementMiniPuzzle = function(){
    var element, place, type;

    switch(Math.round(Math.random() * 3))
    {
        case 0:
            place = this.emptyPlace.neighbor.left;
            type = 'left';
            break;
        case 1:
            place = this.emptyPlace.neighbor.top;
            type = 'top';
            break;
        case 2:
            place = this.emptyPlace.neighbor.right;
            type = 'right';
            break;
        case 3:
            place = this.emptyPlace.neighbor.down;
            type = 'down';
    }

    if(place)
    {
        for(var i = 0; i < this.elements.length; i++)
        {
            if(this.elements[i].id == place.id)
            {
                element = this.elements[i];
                element.type = type;
                break;
            }
        }
    }
    else
        element = this.randomElementMiniPuzzle();
    return element;
}
NarrMiniPuzzle.prototype.gameCompleteMiniPuzzle = function(){
    if(this.MINI_PUZZLE_COMPLETE)
        this.delegate.fireEvent("performAnimation",[this.MINI_PUZZLE_COMPLETE]);
    this.gameComplete = true;
}
NarrMiniPuzzle.prototype.animationCompleteMiniPuzzle = function(){
    this.action = false;
    this.animationElement = false;
}
NarrMiniPuzzle.prototype.animationElementMiniPuzzle = function(element){
    this.animationElement = element;
    this.seek = 0;
    this.animateTo('seek', 1, 200, 'easeOutQuad', this.animationCompleteMiniPuzzle);
    this.action = true;
}
NarrMiniPuzzle.prototype.checkChangePlaceMiniPuzzle = function(element){
    if(element.type == 'left' || element.type == 'right')
    {
        if(Math.abs(element.position.x - this.endX) > element.size.x / 2)
            return false;
        else
           return true;
    }
    if(element.type == 'top' || element.type == 'down')
    {
        if(Math.abs(element.position.y - this.endY) > element.size.y / 2)
            return false;
        else
           return true;
    }
}
NarrMiniPuzzle.prototype.panHandlerMiniPuzzle = function(event){
    if(this.gameComplete) return;
    switch(event.status)
    {
        case 'start':
            if(this.action) return;
            for(var i = 0; i < this.elements.length; i++)
            {
                if(this.elements[i].action)
                {
                    if(this.hittestForRect({
                            left    : this.places[this.elements[i].id].x,
                            top     : this.places[this.elements[i].id].y,
                            width   : this.elements[i].size.x,
                            height  : this.elements[i].size.y
                        },{
                            x       : event.x,
                            y       : event.y
                        }))
                    {
                        this.moveElement = this.elements[i];
                        this.startX = this.places[this.elements[i].id].x;
                        this.startY = this.places[this.elements[i].id].y;
                        this.endX  = this.emptyPlace.x;
                        this.endY  = this.emptyPlace.y;
                        this.qX = event.x - this.startX;
                        this.qY = event.y - this.startY;
                        break;
                    }
                }
            }
            break;
        case 'end':
            if(this.moveElement)
            {
                if(this.checkChangePlaceMiniPuzzle(this.moveElement))
                {
                    this.emptyPlace = this.places[this.moveElement.id];
                    this.moveElement.id += this.moveElement.type=='left'?1:this.moveElement.type=='right'?-1:this.moveElement.type=='top'?this.settings.place.x:-this.settings.place.x;
                    this.activateEmptyPlace();
                    for(var i = 0; i < this.elements.length; i++)
                        if(this.elements[i].startID != this.elements[i].id) break;
                    if(i == this.elements.length) this.gameCompleteMiniPuzzle();
                }
                else
                {
                    this.endX = this.startX;
                    this.endY = this.startY;
                }

                this.startX = this.moveElement.position.x;
                this.startY = this.moveElement.position.y;

                this.animationElementMiniPuzzle(this.moveElement);
                this.moveElement = false;
            }
            break;
        case 'move':
            if(this.moveElement)
            {
                switch(this.moveElement.type)
                {
                    case 'left':
                        if(event.x >= this.startX + this.qX && event.x <= this.endX + this.qX)
                        {
                            this.moveElement.position.x = (event.x - this.qX);
                            this.moveElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.moveElement.position.x, this.moveElement.position.y);
                        }
                        break;
                    case 'top':
                        if(event.y >= this.startY + this.qY && event.y <= this.endY + this.qY)
                        {
                            this.moveElement.position.y = (event.y - this.qY);
                            this.moveElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.moveElement.position.x, this.moveElement.position.y);
                        }
                        break;
                    case 'right':
                        if(event.x <= this.startX + this.qX && event.x >= this.endX + this.qX)
                        {
                            this.moveElement.position.x = (event.x - this.qX);
                            this.moveElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.moveElement.position.x, this.moveElement.position.y);
                        }
                        break;
                    case 'down':
                        if(event.y <= this.startY + this.qY && event.y >= this.endY + this.qY)
                        {
                            this.moveElement.position.y = (event.y - this.qY);
                            this.moveElement.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.moveElement.position.x, this.moveElement.position.y);
                        }
                }
            }
            break;
    }
}
Utils.addBehaviour('pan', 'NarrMiniPuzzle', 'NarrMiniPuzzlePan',
{
    start   : function(g){this.panHandlerMiniPuzzle(g); return true;},
    end     : function(g,obj){this.panHandlerMiniPuzzle(g); g.stopPropagation();},
    move   : function(g,obj){this.panHandlerMiniPuzzle(g); g.stopPropagation();}
},  false);

    return NarrMiniPuzzle;
});