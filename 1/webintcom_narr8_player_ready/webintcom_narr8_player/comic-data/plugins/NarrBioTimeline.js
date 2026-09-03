define(["utils/Utils"], function (Utils) {
var NarrBioTimeline = Utils.newObjectType(NarrBioTimeline, "NarrBioTimeline");
NarrBioTimeline.prototype.init = function(description) {
    var layers=document.createElement('div');
    var forward=document.createElement('img');
    var back=document.createElement('img');
    var front=document.createElement('div');
    var control=document.createElement('div');
    var death=document.createElement('img');
    var images=document.createElement('div');
    var line_container=document.createElement('div');
    var line=document.createElement('div');
    var year=document.createElement('div');
    var person=document.createElement('img');
    var text=document.createElement('div');
    var right=document.createElement('div');
    var age=document.createElement('div');
    this.view.layers = description.settings.layers;
    this.age=[];
    this.test=1;


    age.style.fontFamily = "PT Sans Narrow";
    age.style.textAlign = "center";
    age.style.lineHeight = "70px";
    age.style.height = "100%";
    age.style.fontSize = "26px";
    age.style.display = "inline-block";
    age.style.left="0px";
    age.style.top="-250px";
    age.style.fontWeight='bold';
    //_______________
    right.style.position="absolute";
    right.style.left ="1195px";
    right.style.width="0px";
    right.style.height="768px";
    right.style.borderLeft="1px dotted #000";
    layers.id = "layers_bio";
    images.id = "images_bio";
    front.id = "front_bio";
    this.view.count=0;
    this.view.that=this;

    for(var i=0;i<description.settings.layers.length;i++){
        if(description.settings.layers[i].road)  this.view.count++;
        if(i!=0)
            this.age.push(description.settings.layers[i].age);
    }


    control.id = "control_bio";

    year.id = "year_bio";
    line_container.id = "line_container_bio";
    line.id = "line_bio";
    line.style.width = "64px";
    line.style.height = "0px";
    line.style.position = "absolute";
    line.style.borderBottom = "350px solid transparent";
    line.style.borderLeft = "185px solid transparent";
    line.style.borderRight = "185px solid transparent";
    line.style.borderBottomColor  = "rgb("+description.settings.color.join()+")" ;
    line.style.bottom="0px";

    images.style.position = "absolute";

    line_container.style.height = "350px";
    line_container.style.width = "434px";
    line_container.style.position = "absolute";
    line_container.style.overflow = "hidden";
    line_container.style.bottom = "220px";
    line_container.style.left = "466px";

    person.onload = function(){
        this.style.position = "absolute";
        this.style.top='-119px';
        this.style.left = "195px";

        this.id = "person_bio";
        delete this.onload;
    };
    if(description.settings.imgs&& description.settings.imgs.person){
    person.src =description.settings.imgs.person;
        person.style.height="119px";
    }

    images.style.position = "absolute";
    death.onload=function(){
        this.style.position = "absolute";
        this.style[brprefix+"transform"] = "scale3d(0.4,0.4,1)";
        this.style.left = "659px";
        this.style[brprefix+"transform-origin"]= "50% 100%";
        this.style.bottom = "570px";
        this.style.width="48px";
        this.id = "death_bio";
        delete this.onload;
    };
    if(description.settings.imgs&& description.settings.imgs.death)
    death.src = description.settings.imgs.death;
    if(description.settings.imgs&& description.settings.imgs.button_back){
        back.onload=function(){
            this.id = "back_bio";
            this.style.position = "absolute";
            this.style.width="30px";
            this.style.right = "0px";
            this.style.top = "0px";
            delete this.onload;
        };

        back.src = description.settings.imgs.button_back;
    }
    if(description.settings.imgs&& description.settings.imgs.button_forward){
        forward.onload=function(){
            this.style.bottom = "0px";
            this.style.position = "absolute";
            this.id = "forward_bio";
            this.style.width="30px";
            this.style.width
            delete this.onload;
        };
        forward.src = description.settings.imgs.button_forward ;
    }

    control.style.position = "absolute";
    control.style.width = "188px";
    control.style.height = "70px";
    control.style[brprefix+"transform"] = "translate3d(589px,0px,0px)";
    control.style.bottom="0px";

    layers.style.width = "1366px";
    layers.style.height = "570px"
    layers.style.position = "absolute";
    layers.style.bottom = "0px";
    layers.style.background = "#fff";
    layers.style.overflow = "visible";
    this.layers = description.settings.layers;
    for(var i=0,j=description.settings.layers.length;i<j;i++){
        var l= document.createElement('div');
        var p = document.createElement('p');
        var lay_p = document.createElement('div');
        var place = document.createElement('div');

        var lay_p_img = document.createElement('img');
        var lay_p_name = document.createElement('div');
        var lay_p_text = document.createElement('div');

        var place_text = document.createElement('div');
        var place_img = document.createElement('img');
        var place_name = document.createElement('div');
        //var road = document.createElement('img');

        var l_text =  document.createElement('div');

        var container = document.createElement('div');

        l_text.innerHTML =   description.settings.layers[i].text;
        l_text.style.position = "absolute";
        if(i!=0)l_text.style[brprefix+"transform"]='translateY(-200px)';
        else l_text.style[brprefix+"transform"]='translateY(0px)';

        l_text.style.left = (217 -l_text.childNodes[0].style.width.replace("px","")/2)+"px";
        l.offset=Math.round((j-1-i)*((j-1-i)*2+350/(j-1)-(j-1)*2));

	var road=false;
        if(description.settings.layers[i].road){
            road = document.createElement('img');
            road.pos = description.settings.layers[i].road.pos.x;
            road.temp= l.offset;
            road.onload=this.onloadRoad;
            road.src = description.settings.layers[i].road.image;
        }
        if(road)
        road.style.position ="absolute";
        p.innerHTML = this.view.layers[i].year;
        p.style.font = "bold 10px PT Sans Narrow";
        p.style.position = "absolute";
       // p.style.left= "-22px";
        p.style[brprefix+"transform"]='translate3d(-22px,0px,0px)';
        p.style.margin = "0px";
        p.style.padding = "0px";
        p.style.lineHeight = "6px";

        //l.style.top =l.offset +"px";
        l.style[brprefix+"transform"]='translateY('+l.offset +'px)';
        l.style.position = "absolute";
        l.style.borderTop = "1px dotted #000";
        l.style.marginLeft = "45px";
        l.style.width = "979px";
        l.style.overflow = "visible";
        l.style.left = "171px";

        lay_p.style.height = "50px";
        lay_p.style.position = "absolute";
        lay_p.style.overflow = "visible";

        place.style.fontSize = "0";
        place.style.textAlign = "center";
        place.style.position = "absolute";

        //console.log(asd);
        if(description.settings.layers[i].person){
        lay_p_name.innerHTML = description.settings.layers[i].person.name;
            lay_p.pos = description.settings.layers[i].person.pos.x;

            lay_p_name.style.position = "absolute";
            lay_p_name.style[brprefix+"transform"] = "translate3d(46px,16px,0px)";
            lay_p_name.style.font = "bold 11px PT Sans,Nanum Gothic";
            lay_p_name.style.lineHeight = "15px";
            lay_p_name.style.padding = "2px 6px 0px 6px";
            lay_p_name.style.display ="inline-block";
            lay_p_name.style.letterSpacing = "1px";
            lay_p_name.style.textTransform = "uppercase";
            lay_p_name.style.whiteSpace = "nowrap";


            container.style.position="absolute";
            container.style.overflow="hidden";
            container.style.width="52px";
            container.style.height="52px";
            container.style.boxSizing="border-box";
            container.style.zIndex = "57";
            container.style[brprefix+"border-radius"]="25px";
            container.style.borderRadius="25px";
            container.style.border="1px solid";
            container.style.borderColor ="rgb("+description.settings.color.join()+")" ;
            container.style[brprefix+"radius"] = '40px';

            lay_p_img.style[brprefix+"border-radius"]="25px";
            lay_p_img.style.borderRadius="25px";
            lay_p_img.onload=function(){
                this.style.height = "50px" ;
                this.style.width = "50px" ;
                delete this.onload;
            };
            lay_p_img.src = description.settings.layers[i].person.image;
            container.appendChild(lay_p_img);
            lay_p_text.innerHTML = description.settings.layers[i].person.text;
            lay_p_text.style.position = "absolute";
            lay_p_text.style.padding = "0px 15px 15px 0px";
            lay_p_text.style[brprefix+"transform"] = "translate3d(50px,40px,0px)";
            if(i==0)
                lay_p_text.style.opacity=0.999;
            else
                lay_p_text.style.opacity=0.001;
            lay_p_name.class = "bio_person_name";
            lay_p_name.style.backgroundColor =   "rgb("+description.settings.color.join()+")" ;
        }
        if(description.settings.layers[i].event) {
           place_name.innerHTML =  description.settings.layers[i].event.name;

            place.pos = description.settings.layers[i].event.pos.x;
            place_name.style.display = "inline-block";
	        place_name.style.overflow = "hidden";
            place_name.style.whiteSpace = "nowrap";
            place_name.style.letterSpacing = "1px";
            place_name.style.textTransform = "uppercase";
            place_name.style.font = "bold 11px PT Sans,Nanum Gothic";
            place_name.style.lineHeight = "15px";
            place_name.style.padding = "2px 6px 0px 6px";
            place_img.onload=function(){
               this.style.borderColor = "rgb("+description.settings.color.join()+")" ;
               delete this.onload;
            };
            place_img.src = description.settings.layers[i].event.image;
            place_text.style.marginTop = "10px";
            place_text.padding = "0px 15px 15px 0px";
            place_text.innerHTML = description.settings.layers[i].event.text;
            if(i==0)
                place_text.style.opacity=0.999;
            else
                place_text.style.opacity=0.001;
            place_name.style.backgroundColor =   "rgb("+description.settings.color.join()+")" ;

        }
        place.style.width="180px";

        place.appendChild(place_img);
        place.appendChild(place_name);
        place.appendChild(place_text);

        lay_p.appendChild(container);
        lay_p.appendChild(lay_p_name);
        lay_p.appendChild(lay_p_text);

        text.appendChild(l_text);
        l.appendChild(lay_p);
        l.appendChild(place);
        if(road)
        l.appendChild(road);
        l.appendChild(p);
        this.layers[i].view = l;
        layers.appendChild(l);
        bradapter.applyZIndex(this.view.layers, l, 60-i);
    }

    front.style.position = "absolute";
    front.style.width = "434px";
    front.style.height = "150px";
    front.style.bottom = "70px";
    front.style[brprefix+"transform"] = "translate3d(466px,0px,0px)";
    front.style.border  = "solid black";
    front.style.borderWidth = "1px 0px";
    front.style.boxSizing = "border-box";
    front.style.padding = "0px";
    front.style.paddingRight = "0px";
    front.style.textAlign = "center";
    front.style.backgroundColor =   "rgb("+description.settings.color.join()+")" ;
    front.style.overflow = "visible";


    text.style.width = "434px";
    text.style.height = "148px";

    for(var i = 0;i<description.settings.layers.length;i++){
        var img=document.createElement('img');
         if( i==0)
             img.onload=function(){
                 this.style.opacity=0.999;
                 this.style.position="absolute";
                // this.parentNode.style.width ='100%';
                 //this.parentNode.style.width="100%";
                 //this.parentNode.style.height = this.naturalHeight+'px';
                // this.parentNode.style.width = this.delegate.width+'px';
                 delete this.onload;
             };
        else
             img.onload=this.onloadImg;
        img.src = description.settings.layers[i].image;
        img.style.width=this.delegate.settings.width+"px";
        images.appendChild(img);
        images.style.width=this.delegate.settings.width+"px";

    }
    bradapter.applyZIndex(this.view, layers, 55);
    bradapter.applyZIndex(this.view, front, 56);
    bradapter.applyZIndex(this.view, control, 56);
    year.innerHTML = description.settings.layers[0].year;
    year.style.fontFamily = "Retropecan";
    year.style.textAlign = "center";
    year.style.lineHeight = "70px";
    year.style.height = "100%";
    year.style.fontSize = "58px";
    text.style.display = "inline-block";
    control.appendChild(year);
    control.appendChild(back);
    control.appendChild(forward);
    line_container.appendChild(line);
    layers.appendChild(right);
    layers.appendChild(line_container);

    front.appendChild(person);
    front.appendChild(text);
    front.appendChild(age);

    this.view.appendChild(layers);
    this.view.appendChild(images);
    this.view.appendChild(front);
    this.view.appendChild(control);
    this.view.appendChild(death);
    bradapter.applyZIndex(this.view.front, age, 60);

    this.back = back;
    this.forward = forward;
    this.cur = 0;
    this.year = year;
    this.death = death;
    if(description.settings.imgs)
    this.but_imgs = [description.settings.imgs.button_back,description.settings.imgs.button_back_active,description.settings.imgs.button_forward,description.settings.imgs.button_forward_active];
    this.img = images;
    this.person = person;
    this.text = text;
    this.offset = [];
    this.layer = layers;
    this.off = 0;
    this.arr = 0;
    this.age_view=age;
    this.death.scale_start = 0.4;
    this.death.scale = 0;
    this.anim = false;
    bradapter.applyZIndex(front, person, 56);
    for(var i=0,j=this.view.childNodes[0].childNodes.length - 2;i<j;i++){
        this.offset[i]=Math.round((j-1-i)*((j-1-i)*2+350/(j-1)-(j-1)*2));

    }
    this.viewChilds=this.view.childNodes[0].childNodes;

   this.k=this.temp =this.r = this.p = false;this.scale_road= this.scale= false ;
   this.scale_road= this.scale= 0 ;
};


NarrBioTimeline.prototype.onloadImg = function(){
    this.style.opacity = 0.001;
    this.style.position = "absolute";

    delete this.onload;
};

NarrBioTimeline.prototype.onloadRoad = function(){


    this.style[brprefix+"transform-origin"]='50% 100%';
    this.style[brprefix+"transform"]='translate3d('+ 512-45-this.naturalWidth/2+(23/216+(this.temp/350)*(216-23)/216)*this.pos+'px,'+(-this.naturalHeight)+'px,0px) scale3d('+0.3+0.7*(this.temp/350)+','+0.3+0.7*(this.temp/350)+',1)';
    this.parentNode.parentNode.parentNode.count--;
    if(this.parentNode.parentNode.parentNode.count==0) this.parentNode.parentNode.parentNode.that.draw();
    delete this.onload;
    //delete this.temp;
};

NarrBioTimeline.prototype.customHittest = function(e,gesture){
    if(this.anim) return false;
    if(gesture == 'NarrBioTimelineTap'){
        if(this.test!=1) return false;
        else{
        if(this.hittestForRect({pType:0,left:589, top:768-this.forward.clientHeight , width: this.forward.clientWidth, height: this.forward.clientHeight}, e)){
                this.prev=this.cur;
                if(this.cur < this.layers.length-1)
                    this.cur ++;
            this.tempLay=this.cur;
            if(this.prev==this.cur) return false;
            else
               return  this.forward;
        }
        if(this.hittestForRect({pType:0,left:589+this.back.parentNode.clientWidth-this.back.clientWidth, top:698 , width: this.back.clientWidth, height: this.back.clientHeight}, e)){
                this.tempLay=this.cur;
                this.prev=this.cur;
                return this.back;

        } // Переход по нажатию на уровень
        /* for(var i=this.cur;i<this.layers.length;i++){
         //if(i!=this.layers.length-1)
         if(i==0) continue;
         if(this.hittestForRect({pType:0,left:0, top:198+ this.layers[i].view.offset, width: 1366, height:this.layers[i-1].view.offset-this.layers[i].view.offset}, e)) {
         this.tempLay=i;
         this.prev=this.cur;
         this.cur++;
         return this.forward;
         }
         }  */
        }
    }
    else if(gesture == 'NarrBioTimelineSwipe'){
        if(e.vectorY>0){
            this.prev=this.cur;
            if(this.cur < this.layers.length-1)
                this.cur ++;
            this.tempLay=this.cur;
            if(this.prev==this.cur) return false;
            else
                return  this.forward;


        }
        else {
            this.tempLay=this.cur;
            this.prev=this.cur;
            return this.back;
        }
    }
    else
        return false;
};

NarrBioTimeline.prototype.unload = function () {
    this.cur = 0;
    this.tempLay=0;
    this.arr = 0;
    this.off = 0;
    this.person.style[brprefix+"transform"]='translateY(-120px)';
    this.person.style[brprefix+"transform"]='rotate(0deg)';
    this.death.style.bottom = "570px";
    this.death.shift = 0;
    this.death.startD = 570;
    this.layers.startl = 570;
    this.death.scale_start = 0.4;
    this.line = 350;
    this.person.style.top='-119px';
    this.layer.style.height =  "570px";
    this.age_view.innerHTML='';
    this.img.style.width = this.img.childNodes[this.cur].clientWidth +'px';
    this.img.style.height = this.img.childNodes[this.cur].clientHeight+'px';
    this.img.childNodes[this.cur].style.opacity = 0.999;
   for(var i=1;i< this.img.childNodes.length;i++){
       this.img.childNodes[i].style.opacity =0.001;
   }
    this.text.childNodes[0].style[brprefix+"transform"]='translateY(0px)';
    for(var i=1;i<this.text.childNodes.length;i++){
        this.text.childNodes[i].style[brprefix+"transform"]='translateY(-200px)';
    }
    for(var i=0;i<this.viewChilds.length-2;i++){
        var pers = this.viewChilds[i].childNodes[0];
        var road = this.viewChilds[i].childNodes[2];
        var event = this.viewChilds[i].childNodes[1];
        var l = this.viewChilds[i];
        if(i==0){
            pers.childNodes[2].style.opacity=0.999;
            event.childNodes[2].style.opacity=0.999;
        }
        else{
            pers.childNodes[2].style.opacity=0.001;
            event.childNodes[2].style.opacity=0.001;
        }
        delete pers.scale_start  ;
        delete pers.scale ;
        delete road.scale_rStart  ;
        delete road.scale_r  ;
        delete l.elShift ;
        l.offset= this.offset[i];
        l.startl =  l.offset;
        l.shift = 0;


    }
    for(var i=0;i<this.layers.length-1;i++)
        this.layers[i].view.style.display = "block";

};
NarrBioTimeline.prototype.draw = function(){


       if(this.param <1)
            this.anim = true;
       else if(this.param==1) {
            this.anim = false;

       }
       var len= this.viewChilds.length-2;
       for(var j=0;j<len;j++){
	   this._v=this.viewChilds[j];
             if(this.arr ==0)
                 this._v.style[brprefix+"transform"]='translateY('+(this._v.startl+this._v.shift*this.param) +'px)';
             else
                 this._v.style[brprefix+"transform"]='translateY('+(this._v.startl-this._v.shift*this.param) +'px)';
        }
        // Движение Креста
        this._v=this.text.childNodes;
	    this._v1=this.img.childNodes;

        if(this.cur==0)
            this.back.style.display="none";
        else
            this.back.style.display="block";
        if(this.cur==this.layers.length-1)
            this.forward.style.display="none";
        else
            this.forward.style.display="block";

        if(this.arr == 0) {
            // Движение креста
            this.death.style.bottom=this.death.startD - this.death.shift*this.param +'px';
            //Изменение размера линии
            if(this.param == 1 && this.cur !=0){
                for(var l=0;l< this.layers.length;l++){
                    if(l<=this.cur-1)
                        this.layers[l].view.style.display = "none";
                    else
                        this.layers[l].view.style.display = "block";
                }
            }
            this.view.childNodes[0].lastChild.style.height= this.line- this.death.shift*this.param +'px';
            this.layer.style.height=this.layers.startl- this.death.shift*this.param +'px';
            //Смена текста
	        this._v[this.cur].style[brprefix+"transform"]='translateY('+(-200+ 200*this.param) +'px)' ;
            if( this.cur == this.view.layers.length-1){
                this._v[this.cur-1].style[brprefix+"transform"]='translateY('+ 200*5*this.param +'px)';
            } else if(this.cur!=0)
                    this._v[this.cur-1].style[brprefix+"transform"]='translateY(' +200*this.param +'px)';

            //Смена картинок
            this.img.style.width = this._v1[this.cur].clientWidth +'px';
            this.img.style.height = this._v1[this.cur].clientHeight+'px';

            if( this.param>0.5){
                if(this.cur != 0 )
                    this._v1[this.cur-1].style.opacity = Math.max(0.001,Math.min(0.999,1-(this.param-0.5)*2));
                if(this.cur != this.view.layers.length &&  this._v1[this.cur].style.opacity!= 0.999)
                    this._v1[this.cur].style.opacity =Math.max(0.001,Math.min(0.999,(this.param-0.5)*2));
            }
            // Смена подсветки управляющих стрелок

            if(this.param < 0.2 )
                this.forward.src = this.but_imgs[3];
            else
                this.forward.src =  this.but_imgs[2];
        }

        else   {
            //Движение Креста
            this.death.style.bottom=this.death.startD + this.death.shift*this.param +'px';
            // Изменение размера линии
            if(this.param <0.1)
                this.layers[this.cur].view.style.display = "block";


            if(this.param <0.1){
                for(var l=0;l< this.layers.length;l++){
                    if(l>=this.cur)
                        this.layers[l].view.style.display = "block";
                    else
                        this.layers[l].view.style.display = "none";
                }
            }
            this.view.childNodes[0].lastChild.style.height= this.line+ this.death.shift*this.param +'px';
            this.layer.style.height=this.layers.startl+ this.death.shift*this.param +'px';
            //Смена текста
            if( this.cur == this.view.layers.length-2){
                this._v[this.cur].style[brprefix+"transform"]='translateY('+(1000-200*5*this.param) +'px)';
            } else {
                this._v[this.cur].style[brprefix+"transform"]='translateY('+(200-200*this.param) +'px)';
            }
	        this._v[this.cur+1].style[brprefix+"transform"]='translateY('+ (-200*this.param) +"px)";
            //Смена картинок
            //this.img.style.width = this._v1[this.cur].clientWidth +'px';
            this.img.style.height = this._v1[this.prev].clientHeight +Math.abs(this._v1[this.cur].clientHeight - this._v1[this.prev].clientHeight)*this.param +'px';
            if( this.param>0.5){
                if(this.cur !== this.view.layers.length && this._v1[this.cur].style.opacity !== 0.999){
                    this._v1[this.cur].style.opacity = Math.max(0.001,Math.min(0.999,(this.param-0.5)*2));
                    this._v1[this.cur+1].style.opacity =Math.max(0.001,Math.min(0.999,1-(this.param-0.5)*2));
                }
            }
            // Смена подсветки управляющих стрелок

            this.back.src = this.but_imgs[(this.param < 0.2 )?1:0];
        }

        this.death.style[brprefix+"transform"]='scale3d('+(this.death.scale_start + this.death.scale*this.param)+','+(this.death.scale_start + this.death.scale*this.param)+',1)';
        this.year.innerHTML = this.layers[this.cur].year;
         if(this.cur < this.layers.length-2 && this.cur!=0)
             this.age_view.innerHTML = this.age[this.cur-1];
         else if(this.cur == this.layers.length-1 || this.cur==0)
             this.age_view.innerHTML = '';
         else if(this.cur == this.layers.length-2 && this.param==1)
             this.age_view.innerHTML = this.age[this.cur-1];

    // Падение человека
       if(this.cur === this.view.layers.length-1 && this.arr === 0){

           if(this.param <0.5)
                this.person.style[brprefix+"transform"]=' rotate('+180*this.param+'deg)';
           if(this.param >0.2)
               this.person.style.top= -38 + this.param*260+ 'px';
           this.person.style[brprefix+"transform-origin"]='50% 100%';
       }
       else if(this.cur === this.view.layers.length-2 && this.arr === 1){

           if(this.param >0.6)
               this.person.style[brprefix+"transform"]=' rotate('+225*(1-this.param)+'deg)';
           if(this.param <0.8)
               this.person.style.top=305 - this.param*430 + 'px';
           else
               this.person.style.top='-119px';
       }

    for(var i=0;i<len;i++){
        this.k = this.viewChilds[i].childNodes[0];
        this.temp =this.viewChilds[i].offset;
        this.r = this.viewChilds[i].childNodes[2];
        this.p = this.viewChilds[i].childNodes[1];
        this.width=Math.max(this.p.childNodes[0].naturalWidth,this.p.childNodes[1].clientWidth);
        //

        this.scale_road= 0.3+0.7*(this.temp/350);
        this.scale= 0.5+0.5*(this.temp/350) ;

        if(i==this.cur){
            this.k.childNodes[2].style.opacity=Math.max(0.001,Math.min(0.999,this.param));
            this.p.childNodes[2].style.opacity=Math.max(0.001,Math.min(0.999,this.param));
        }
        else if((this.arr==0 && i==this.cur-1) || (this.arr==1 && i==this.cur+1)){
            this.k.childNodes[2].style.opacity=Math.max(0.001,Math.min(0.999,1-this.param));
            this.p.childNodes[2].style.opacity=Math.max(0.001,Math.min(0.999,1-this.param));
        }

        if( this.viewChilds[i].elShift){
           if(this.arr == 0 ){
               if(i!=this.viewChilds.length-3)
                   this.temp = this.viewChilds[i+1].offset + this.viewChilds[i].elShift* this.param;
               else{
                   this.temp = this.viewChilds[i].offset -this.viewChilds[i].elShift+ this.viewChilds[i].elShift* this.param;
               }
           }
           else {
               this.temp = (this.viewChilds[i].offset + this.viewChilds[i].elShift)-this.viewChilds[i].elShift* this.param;
             }
        }

        if(this.r.scale_rStart)  {
            this.scale_road =  (this.r.scale_rStart + this.r.scale_r*this.param) ;
        }
        if(this.k.scale_start){
            this. scale = (this.k.scale_start + this.k.scale*this.param);
        }
        if(this.arr == 0){
                 if(this.cur-1 == i){

                     //человек
                     this.k.style[brprefix+"transform"]='translate3d('+(this.k.prev-(400*this.param))+'px,-22px,0px)';

                        if(this.r.prev <464) {
                            this.r.style[brprefix+"transform"]='translate3d('+ (this.r.prev *(1-this.param*3))+'px,'+(-this.r.naturalHeight)+'px,0px)';
                        }
                        else   {
                            this.r.style[brprefix+"transform"]='translate3d('+ (this.r.prev *(1+this.param*2)) +'px,'+(-this.r.naturalHeight)+'px,0px)';
                        }
                     //событие
                     this.p.style[brprefix+"transform"]='translate3d('+ (this.p.prev*(1+this.param))+'px,-'+(this.p.childNodes[0].naturalHeight+9)+'px,0px)';

                }
                else if ( i>=this.cur){
                     this.k.prev = Math.round(512-45-(20+ this.k.childNodes[1].clientWidth/2)*this.scale+(60/216+(this.temp/350)*(216-60)/216)*this.k.pos);
                     this.k.style[brprefix+"transform"]='translate3d('+ this.k.prev+'px,-22px,0px) scale3d('+this.scale+','+this.scale+',1)';

                     this.p.prev =  Math.round(512-45-this.width*this.scale/2+(60/216+(this.temp/350)*(216-60)/216)*this.p.pos);
                     this.p.style[brprefix+"transform"]='translate3d('+ this.p.prev+'px,-'+(this.p.childNodes[0].naturalHeight+9)+'px,0px) scale3d('+this.scale+','+this.scale+',1)';

                     this.r.prev = 512-45-this.r.naturalWidth/2+(23/216+(this.temp/350)*(216-23)/216)*this.r.pos;
                     this.r.style[brprefix+"transform"]='translate3d('+ this.r.prev+'px,'+(-this.r.naturalHeight)+'px,0px) scale3d('+this.scale_road+','+this.scale_road+',1)';
                }
         }
    else{
        if(this.cur == i ){
            if(this.k.prev<100)
                this.k.shift= this.k.prev+20;
            else if(this.k.prev >500)
                this.k.shift= 500-this.k.prev;
            else
                this.k.shift=0;
            this.k.style[brprefix+"transform"]='translate3d('+ ((this.k.prev+ this.k.shift) *(-10*(1-this.param)))+'px,-22px,0px)';

            if(this.r.prev <464) {
                this.r.style[brprefix+"transform"]='translate3d('+ (-this.r.prev *(1-this.param*2))+'px,'+(-this.r.naturalHeight)+'px,0px)';
            }
            else   {
                this.r.style[brprefix+"transform"]='translate3d('+( this.r.prev *(2-this.param) )+'px,'+(-this.r.naturalHeight)+'px,0px)';
            }
            this.p.style[brprefix+"transform"]='translate3d('+ (this.p.prev *(2-this.param))+'px,-'+(this.p.childNodes[0].naturalHeight+9)+'px,0px)';
        }
        else if(i>this.cur){
            this.k.prev = Math.round(512-45-(20+ this.k.childNodes[1].clientWidth/2)*this.scale+(60/216+(this.temp/350)*(216-60)/216)*this.k.pos);
            this.k.style[brprefix+"transform"]='translate3d('+ this.k.prev+'px,-22px,0px) scale3d('+this.scale+','+this.scale+',1)';

            this. p.prev =  Math.round(512-45-this.width*this.scale/2+(60/216+(this.temp/350)*(216-60)/216)*this.p.pos);
            this.p.style[brprefix+"transform"]='translate3d('+ this.p.prev+'px,-'+(this.p.childNodes[0].naturalHeight+9)+'px,0px) scale3d('+this.scale+','+this.scale+',1)';

            this.r.prev = 512-45-this.r.naturalWidth/2+(23/216+(this.temp/350)*(216-23)/216)*this.r.pos;
            this.r.style[brprefix+"transform"]='translate3d('+ this.r.prev+'px,'+(-this.r.naturalHeight)+'px,0px) scale3d('+this.scale_road+','+this.scale_road+',1)';

        }

    }
        if(this.p.childNodes[2].childNodes.length!=0 && this.width< this.p.childNodes[2].childNodes[0].clientWidth) {
            this.p.style.width=this.p.childNodes[2].childNodes[0].clientWidth+'px';
            var margin=Math.floor(this.p.childNodes[2].childNodes[0].clientWidth- this.p.childNodes[0].naturalWidth)/2;
            this.p.childNodes[0].style.marginRight=margin +'px';
            this.p.childNodes[0].style.marginLeft=margin+'px';
        }
        else {
             this.p.style.width=this.width+'px';
            var margin=Math.floor(this.width- this.p.childNodes[0].naturalWidth)/2;
            this.p.childNodes[0].style.marginRight=margin +'px';
            this.p.childNodes[0].style.marginLeft=margin+'px';
        }

        this.p.style[brprefix+"transform-origin"]='50% '+(this.p.childNodes[0].naturalHeight+9)+'px';
        //this.p.style.top='-'+(this.p.childNodes[0].naturalHeight+9)+'px';
    }

    if(this.param==1) {
        if(this.tempLay > this.cur && this.arr!=1){
            this.prev=this.cur;
            this.cur++;
            this.param=0;
            this.bioTimelineEnd(0,{id:"forward_bio"});
        }
    }

};

NarrBioTimeline.prototype.bioTimelineEnd = function(e,obj){

    //e.stopPropagation();



        this.death.startD = parseInt(this.death.style.bottom.replace("px",""));
        this.line =  parseInt(this.view.childNodes[0].lastChild.style.height.replace("px",""));
        this.layers.startl =  parseInt(this.layer.style.height.replace("px",""));

        this.death.scale_start = this.death.scale + this.death.scale_start ;
        this.death.scale =( 0.4+0.6* this.offset[this.offset.length-this.cur-1]/350) - this.death.scale_start;




        if(obj.id == "forward_bio"){
           if(this.cur <= this.layers.length-1) {
                // this.cur ++;
               for(var i=this.cur;i<this.view.childNodes[0].childNodes.length-2;i++){
                   var pers = this.view.childNodes[0].childNodes[i].childNodes[0];
                   var road = this.view.childNodes[0].childNodes[i].childNodes[2];
                   pers.scale_start =  (pers.scale_start + pers.scale) ;
                   if(!pers.scale_start)
                       pers.scale_start =  0.5+0.5*(this.view.childNodes[0].childNodes[i].offset/350);
                   pers.scale = 0.5+0.5*(this.view.childNodes[0].childNodes[i-1].offset/350) - pers.scale_start;
                   road.scale_rStart = (road.scale_rStart + road.scale_r) ;
                   if(!road.scale_rStart )
                       road.scale_rStart  =  0.3+0.7*(this.view.childNodes[0].childNodes[i].offset/350);
                   road.scale_r =  0.3+0.7*(this.view.childNodes[0].childNodes[i-1].offset/350) -road.scale_rStart ;
               }
                //this.death.shift =  this.layers[this.view.childNodes[0].childNodes.length-4].view.offset-this.off;
               this.death.shift=this.offset[this.offset.length-this.cur-1]-this.offset[this.offset.length-this.prev-1];
                this.off =this.offset[this.offset.length - this.cur-1];
                for(var j=0;j<this.view.childNodes[0].childNodes.length-2;j++){
                    var l = this.view.childNodes[0].childNodes[j];
                    l.elShift = Math.abs(l.offset -this.offset[Math.abs(j-this.cur)]);
                    l.offset= this.offset[Math.abs(j-this.cur)];
                    if(brprefix.indexOf("webkit")!=-1)
                        l.startl = parseInt(l.style.webkitTransform.replace("px)","").replace("translateY(",""));
                    else if(brprefix.indexOf("moz")!=-1)
                        l.startl = parseInt(l.style.MozTransform.replace("px)","").replace("translateY(",""));
                    else if(brprefix.indexOf("ms")!=-1)
                        l.startl = parseInt(l.style.msTransform.replace("px)","").replace("translateY(",""));
                    if(j<this.cur ){
                        l.shift =-this.death.shift;//700- l.start ;
                        l.offset = 350;
                    }
                    else
                        l.shift =l.offset- l.startl - this.off ;
                }
                this.param = 0;
                this.arr = 0;
               this.test=0;
                this.animateTo('param',1,600);
                this.animateTo('test',1,900);
           }
        }
        else{
            if(this.cur != 0) {
                this.cur --;
                for(var i=this.cur+1;i<this.view.childNodes[0].childNodes.length-2;i++){
                    var pers = this.view.childNodes[0].childNodes[i].childNodes[0];
                    var road = this.view.childNodes[0].childNodes[i].childNodes[2];

                    pers.scale_start =  (pers.scale_start + pers.scale) ;
                    if(!pers.scale_start)
                        pers.scale_start =  0.5+0.5*(this.view.childNodes[0].childNodes[i].offset/350);
                    if(i==this.view.childNodes[0].childNodes.length-3){
                        pers.scale =  (0.5+0.5*(this.offset[this.offset.indexOf(this.view.childNodes[0].childNodes[i].offset)+1]/350)-pers.scale_start );
                    }
                    else
                        pers.scale =  (0.5+0.5*(this.view.childNodes[0].childNodes[i+1].offset/350)-pers.scale_start );
                    road.scale_rStart = (road.scale_rStart + road.scale_r) ;

                    if(!road.scale_rStart )
                        road.scale_rStart  = 0.3+0.7*(this.view.childNodes[0].childNodes[i].offset/350);
                    if(i==this.view.childNodes[0].childNodes.length-3)
                        road.scale_r = ( 0.3+0.7*(this.view.childNodes[0].childNodes[i].offset/350)-road.scale_rStart  ) ;
                    else
                        road.scale_r = ( 0.3+0.7*(this.view.childNodes[0].childNodes[i+1].offset/350)-road.scale_rStart  ) ;
                }
            this.off =this.offset[this.offset.length - this.cur-1];
            this.death.shift =  this.layers[this.view.childNodes[0].childNodes.length-3].view.offset-this.off;

            for(var j=0;j<this.view.childNodes[0].childNodes.length-2;j++){
                var l = this.view.childNodes[0].childNodes[j];
                l.elShift = Math.abs(l.offset -this.offset[Math.abs(j-this.cur)]);
                l.offset= this.offset[Math.abs(j-this.cur)];
                if(brprefix.indexOf("webkit")!=-1)
                    l.startl = parseInt(l.style.webkitTransform.replace("px)","").replace("translateY(",""));
                else if(brprefix.indexOf("moz")!=-1)
                    l.startl = parseInt(l.style.MozTransform.replace("px)","").replace("translateY(",""));
                else if(brprefix.indexOf("ms")!=-1)
                    l.startl = parseInt(l.style.msTransform.replace("px)","").replace("translateY(",""));
                if(j<this.cur ){
                    l.shift = -this.death.shift ;
                }
                else
                    l.shift = l.startl - (l.offset - this.off) ;
            }
            this.arr = 1;
            this.param =0;
                this.test=0;
            this.animateTo('param',1,600);
            this.animateTo('test',1,900);

            }
        }

        this.param =0;

};


Utils.addBehaviour('tap', 'NarrBioTimeline', 'NarrBioTimelineTap', {
end: function(e,obj) {
    e.stopPropagation();
        this.bioTimelineEnd(e,obj);
}}, false);

Utils.addBehaviour('swipe', 'NarrBioTimeline', 'NarrBioTimelineSwipe', {
    end: function(e,obj) {
        e.stopPropagation();
        this.bioTimelineEnd(e,obj);
    }}, false);

    return NarrBioTimeline;
});