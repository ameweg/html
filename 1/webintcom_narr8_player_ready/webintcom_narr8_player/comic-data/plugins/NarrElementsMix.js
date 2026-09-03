define(["utils/Utils"], function (Utils) {
var NarrElementsMix = Utils.newObjectType(NarrElementsMix, "NarrElementsMix");
NarrElementsMix.prototype.init = function(description){
    this.images = description.settings.images;
    this.count = 0;
}
NarrElementsMix.prototype.load = function(){
    this.container = document.createElement('div');
    this.container.style.width = this.width + 'px';
    this.container.style.height = this.height + 'px';

    for(var i = 0; i < this.images.length; i++)
    {
        for(var j = 0; j < 3; j++)
        {
            if(j < 2)
                this.images[i][j].partner = this.images[i][Math.abs(j - 1)];
            this.images[i][j].group = i;
            this.images[i][j].status = false;
            this.images[i][j].image = new Image();
            if(j < 2)
            {
                if(!this.images[i][j].place)
                    this.images[i][j].place = {x:this.images[i][j].position.x,y:this.images[i][j].position.y};
                else
                    this.images[i][j].position = {x:this.images[i][j].place.x,y:this.images[i][j].place.y};
                this.images[i][j].z = -i * 2 - j;
            }
            else
            {
                this.images[i][j].position.x = this.images[i][j].zone.position.x + (this.images[i][j].zone.size.x - this.images[i][j].size.x) / 2;
                this.images[i][j].position.y = this.images[i][j].zone.position.y + (this.images[i][j].zone.size.y - this.images[i][j].size.y) / 2;
                this.images[i][j].z = 0;
                this.images[i][j].image.style.opacity = 0;
                this.images[i][j].image.style.display = 'none';
            }

            this.images[i][j].image.src = this.images[i][j].src;
            this.images[i][j].image.style.position = 'absolute';
            this.images[i][j].image.style.left =  this.images[i][j].position.x + 'px';
            this.images[i][j].image.style.top =  this.images[i][j].position.y + 'px';
            this.images[i][j].image.style.zIndex = this.images[i][j].z;
            this.container.appendChild(this.images[i][j].image);
        }
    }

    this.view.appendChild(this.container);

    this.areaPanElementsMix = this.addArea({
        event_type  : 'pan',
        behaviour   : 'NarrElementsMixPan',
        left        : 0,
        top         : 0,
        width       : this.width,
        height      : this.height,
        visible     : false,
        propagation : 0
    });
}
NarrElementsMix.prototype.unload = function(){
    this.view.removeChild(this.container);
    this.container = null;
    this.removeArea(this.areaPanElementsMix);
}
NarrElementsMix.prototype.eventHandlerPan = function(event){
    if(this.action) return;
    switch(event.status)
    {
        case 'start':
            var test = false;
            for(var i = 0; i < this.images.length; i++)
                for(var j = 0; j < 2; j++)
                    if(this.images[i][j]&&this.hittestForRect({left:this.images[i][j].position.x, top:this.images[i][j].position.y, width:this.images[i][j].size.x, height:this.images[i][j].size.y},{x:event.x, y:event.y}))
                        test = !test ? this.images[i][j] : (this.images[i][j].z > test.z ? this.images[i][j] : test);
            if(test)
            {
                if(test.status && test.partner.status) return;
                this.moveImage = test;
                this.moveImage.status = false;

                this.delegate.removeEventListener('timer', this.moveElementsMix, this);
                this.moveImage.z = 200 + (this.count += 2);
                this.moveImage.image.style.zIndex = this.moveImage.z;
                this.moveImage.startPosition = {x:this.moveImage.position.x,y:this.moveImage.position.y};
                this.qX = event.x - this.moveImage.position.x;
                this.qY = event.y - this.moveImage.position.y;
            }
            break;
        case 'move':
            if(this.moveImage)
            {
                if(event.x-this.qX>=0&&event.x - this.qX<=this.width-this.moveImage.size.x)
                {
                    this.moveImage.position.x = event.x - this.qX;
                    this.moveImage.image.style.left = this.moveImage.position.x + 'px';
                }
                if(event.y-this.qY>=0&&event.y - this.qY<=this.height-this.moveImage.size.y)
                {
                    this.moveImage.position.y = event.y - this.qY;
                    this.moveImage.image.style.top = this.moveImage.position.y + 'px';
                }
            }
            break;
        case 'end':
            if(this.moveImage)
            {
                if(this.imageHittestElementsMix(this.moveImage, this.moveImage.zone))
                {
                    this.moveImage.status = true;
                    this.animateMoveElementsMix(this.moveImage,this.moveImage.zone.position.x + (this.moveImage.zone.size.x - this.moveImage.size.x) / 2,this.moveImage.zone.position.y + (this.moveImage.zone.size.y - this.moveImage.size.y) / 2);
                    if(this.moveImage.partner.status)
                    {
                        this.createElementID = this.moveImage.group;
                        this.createElement();
                    }
                }
                else
                    this.animateMoveElementsMix(this.moveImage, this.moveImage.place.x, this.moveImage.place.y);
                this.moveImage = null;
            }
    }
}
NarrElementsMix.prototype.createElement = function(){
    this.action = true;
    this.images[this.createElementID][2].image.style.zIndex = this.images[this.createElementID][1].z + 1;
    this.images[this.createElementID][2].image.style.display = 'block';
    this.createSeek = 0;
    this.animateTo('createSeek', 1, 500, 'easeOutQuad', this.createComplete);
    this.delegate.addEventListener('timer', this.alphaElementsMix, this);
}
NarrElementsMix.prototype.createComplete = function(){
    this.action = false;
    this.images[this.createElementID][0].image.style.display = 'none';
    this.images[this.createElementID][1].image.style.display = 'none';
    this.images[this.createElementID][2].image.style.display = 'block';
    this.delegate.removeEventListener('timer', this.alphaElementsMix, this);
}
NarrElementsMix.prototype.alphaElementsMix = function(){
    for(var i = 0; i < this.images[this.createElementID].length; i++)
    {
        if(i < 2)
            this.images[this.createElementID][i].image.style.opacity = 1 - this.createSeek;
        else
        {
            this.images[this.createElementID][i].width = this.images[this.createElementID][i].size.x * 0.6 + this.images[this.createElementID][i].size.x * 0.4 * this.createSeek;
            this.images[this.createElementID][i].height = this.images[this.createElementID][i].size.y * 0.6 + this.images[this.createElementID][i].size.y * 0.4 * this.createSeek;
            this.images[this.createElementID][i].image.style.width = this.images[this.createElementID][i].width + 'px';
            this.images[this.createElementID][i].image.style.height = this.images[this.createElementID][i].height + 'px';
            this.images[this.createElementID][i].image.style.left = (this.images[this.createElementID][i].zone.position.x + (this.images[this.createElementID][i].zone.size.x - this.images[this.createElementID][i].width) / 2) + 'px';
            this.images[this.createElementID][i].image.style.top = (this.images[this.createElementID][i].zone.position.y + (this.images[this.createElementID][i].zone.size.y - this.images[this.createElementID][i].height) / 2) + 'px';
            this.images[this.createElementID][i].image.style.opacity = this.createSeek;
        }
    }
}
NarrElementsMix.prototype.moveElementsMix = function(){
    this.animationObject.position.x = this.animationObject.startPosition.x - (this.animationObject.startPosition.x - this.moveX) * this.seek;
    this.animationObject.position.y = this.animationObject.startPosition.y - (this.animationObject.startPosition.y - this.moveY) * this.seek;
    this.animationObject.image.style.left = this.animationObject.position.x + 'px';
    this.animationObject.image.style.top  = this.animationObject.position.y + 'px';
}
NarrElementsMix.prototype.animateMoveElementsMix = function(obj,x,y){
    if(this.tween)
        this.cancelAnimation(this.tween);
    this.moveX = x;
    this.moveY = y;
    this.animationObject = obj;
    this.animationObject.startPosition.x = this.animationObject.position.x;
    this.animationObject.startPosition.y = this.animationObject.position.y;
    this.seek = 0;
    this.delegate.addEventListener('timer', this.moveElementsMix, this);
    this.tween = this.animateTo('seek', 1, 500, 'easeOutQuad', this.moveComplete);
}
NarrElementsMix.prototype.moveComplete = function(){
    this.delegate.removeEventListener('timer', this.moveElementsMix, this);
}
NarrElementsMix.prototype.imageHittestElementsMix = function(rect_0, rect_1){
    if(!rect_0||!rect_1) return false;
    var flag = false;
    for(var i = 0; i < 4; i++)
    {
        var x = !i||i==2 ? rect_0.position.x : rect_0.position.x + rect_0.size.x;
        var y = !i||i==1 ? rect_0.position.y : rect_0.position.y + rect_0.size.y;
        flag = this.hittestForRect({left:rect_1.position.x-this.x, top:rect_1.position.y-this.y, width:rect_1.size.x, height:rect_1.size.y},{x:x, y:y})
        if(flag) break;
    }
    if(!flag)
    {
        for(i = 0; i < 4; i++)
        {
            var x = !i||i==2 ? rect_0.position.x + rect_0.size.x/2 : i==1 ? rect_0.position.x : rect_0.position.x + rect_0.size.x;
            var y = i==1||i==3 ? rect_0.position.y + rect_0.size.y/2 : !i ? rect_0.position.y : rect_0.position.y + rect_0.size.y;
            flag = this.hittestForRect({left:rect_1.position.x-this.x, top:rect_1.position.y-this.y, width:rect_1.size.x, height:rect_1.size.y},{x:x, y:y})
            if(flag) break;
        }
    }
    return flag;
}
Utils.addBehaviour('pan', 'NarrElementsMix', 'NarrElementsMixPan',
{
        start   : function(g,obj){this.eventHandlerPan(g);return true;},
        end     : function(g,obj){this.eventHandlerPan(g);},
        swipe   : function(g){g.stopPropagation();},
        move    : function(g,obj){this.eventHandlerPan(g);}
    },  false);

    return NarrElementsMix;
});