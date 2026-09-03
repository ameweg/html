define(["utils/Utils"], function (Utils) {
    var NarrGallery = Utils.newObjectType(NarrGallery, "NarrGallery"); // обязательно, функция из API

    NarrGallery.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        // this.view.classList.add(description.settings.css_selector);

        var f = document.createElement('div');
        var b = document.createElement('div');
        if (description.settings.forward) {
            f.ngparams = {};
            if (description.settings.forward.src)
                f.style.backgroundImage = 'url("' + description.settings.forward.src + '")';
            if (description.settings.forward.size) {
                f.style.backgroundSize = description.settings.forward.size.x + 'px ' + description.settings.forward.size.y + 'px';
                f.style.width = description.settings.forward.size.x + "px ";
                f.style.height = description.settings.forward.size.y + "px";
                f.ngparams.width = description.settings.forward.size.x;
                f.ngparams.height = description.settings.forward.size.y;
            }
            f.style.position = "absolute";
            if (description.settings.forward.pos) {
                f.ngparams.pos = {};
                if (description.settings.forward.pos.x) {
                    f.style[brprefix + "transform"] += "translateX(" + description.settings.forward.pos.x + "px)";
                    f.ngparams.pos.x = description.settings.forward.pos.x;
                }
                else {
                    f.style[brprefix + "transform"] += "translateX(0px)";
                    f.ngparams.pos.x = 0;
                }
                if (description.settings.forward.pos.y) {
                    f.style[brprefix + "transform"] += "translateY(" + description.settings.forward.pos.y + "px)";
                    f.ngparams.pos.y = description.settings.forward.pos.y;
                }
                else {
                    f.style[brprefix + "transform"] += "translateY(0px)";
                    f.ngparams.pos.y = 0;
                }
            } else f.ngparams.pos = {x: 0, y: 0};

        }
        if (description.settings.back) {
            b.ngparams = {};
            if (description.settings.back.src)
                b.style.backgroundImage = 'url("' + description.settings.back.src + '")';
            if (description.settings.back.size) {
                b.style.backgroundSize = description.settings.back.size.x + 'px ' + description.settings.back.size.y + 'px';
                b.style.width = description.settings.back.size.x + "px ";
                b.style.height = description.settings.back.size.y + "px";
                b.ngparams.width = description.settings.back.size.x;
                b.ngparams.height = description.settings.back.size.y;
            }
            b.style.position = "absolute";
            if (description.settings.back.pos) {
                b.ngparams.pos = {};
                if (description.settings.back.pos.x) {
                    b.style[brprefix + "transform"] += "translateX(" + description.settings.back.pos.x + "px)";
                    b.ngparams.pos.x = description.settings.back.pos.x;
                }
                else {
                    b.style[brprefix + "transform"] += "translateX(0px)";
                    b.ngparams.pos.x = 0;
                }
                if (description.settings.back.pos.y) {
                    b.style[brprefix + "transform"] += "translateY(" + description.settings.back.pos.y + "px)";
                    b.ngparams.pos.y = description.settings.back.pos.y;
                }
                else {
                    b.style[brprefix + "transform"] += "translateX(0px)";
                    b.ngparams.pos.y = 0;
                }
            } else b.ngparams.pos = {x: 0, y: 0};

        }
        f.id = "forward";
        b.id = "back";
        if (description.settings.type)
            this.view.type = description.settings.type;
        else
            this.view.type = 0;
        var img = document.createElement('div');
        if (description.settings.imageSize) {
            this.view.imageSize = description.settings.imageSize.x;
            img.style.opacity = 1;
            img.style.width = description.settings.imageSize.x + "px ";
            img.style.height = description.settings.imageSize.y + "px";
            img.style.position = "absolute";
            if (!description.settings.imagePos) description.settings.imagePos = {};
            if (description.settings.imagePos.x)
                img.style[brprefix + "transform"] += "translateX(" + description.settings.imagePos.x + "px)";
            else
                img.style[brprefix + "transform"] += "translateX(0px)";
            if (description.settings.imagePos.y)
                img.style[brprefix + "transform"] += "translateY(" + description.settings.imagePos.y + "px)";
            else
                img.style[brprefix + "transform"] += "translateY(0px)";
        }
        img.id = "img";
        var text = document.createElement('div');
        text.style.opacity = 1;
        this.view.textSize = {x: 0, y: 0};
        if (description.settings.textSize) {
            if (description.settings.textSize.x)
                this.view.textSize.x = description.settings.textSize.x;
            else
                this.view.textSize.x = 50;
            if (description.settings.textSize.y)
                this.view.textSize.y = description.settings.textSize.y;
            else
                this.view.textSize.y = 200;
            text.style.width = this.view.textSize.x + "px ";
            text.style.height = this.view.textSize.y + "px";
        }

        text.style.position = "absolute";
        text.style.overflow = "hidden";
        img.style.overflow = "hidden";
        if (!description.settings.textPos) description.settings.textPos = {};
        if (description.settings.textPos.x) text.style[brprefix + "transform"] += "translateX(" + description.settings.textPos.x + "px)"; else text.style[brprefix + "transform"] += "translateX(0px)";
        if (description.settings.textPos.y) text.style[brprefix + "transform"] += "translateY(" + description.settings.textPos.y + "px)"; else text.style[brprefix + "transform"] += "translateY(0px)";
        text.id = "text";
        for (var i = 0; i < description.settings.imgs.length; i++) {
            var node = document.createElement('div');
            var text_i = document.createElement('div');
            text_i.innerHTML = description.settings.imgs[i].export;
            text_i.id = "text_" + i;
            text_i.style.position = "absolute";
            if (description.settings.imgs[i].src) {
                node.style.backgroundImage = 'url("' + description.settings.imgs[i].src + '")';
                node.style.backgroundSize = '100% 100%';
            }
            if (description.settings.imageSize) {
                node.style.width = description.settings.imageSize.x + "px ";
                node.style.height = description.settings.imageSize.y + "px";
            }
            node.style.position = "absolute";
            node.id = "img_" + i;
            node.pos = {x: 0, y: 0}
            bradapter.applyZIndex(this.view, node, 0);
            if (i == 0) {
                node.style.opacity = 1;
                text_i.style.opacity = 1;
                //node.style[brprefix+"transform"] = "translate3d("+description.settings.imagePos.x+"px," + description.settings.imagePos.y +"px,0px)";
                this.view.cur = node;
                this.view.cur_text = text_i;
            }
            else {
                if (this.view.type == 1) {
                    if (description.settings.imageSize)
                        node.style[brprefix + "transform"] = "translate3d(" + (-description.settings.imageSize.x) + "px,0px,0px)";
                    if (description.settings.textSize)
                        text_i.style[brprefix + "transform"] = "translate3d(" + (-description.settings.textSize.x) + "px,0px,0px)";
                    else
                        text_i.style[brprefix + "transform"] = "translate3d(-200px,0px,0px)";
                }
                node.style.opacity = 0;
                text_i.style.opacity = 0;
            }
            if (i == description.settings.imgs.length - 1) {
                this.view.prev = node;
                this.view.prev_text = text_i;

            }
            img.appendChild(node);
            text.appendChild(text_i);

        }

        if (f)
            this.forward = f;
        if (b)
            this.back = b;
        this.param = 0;
        this.wall = 1;
        this.view.appendChild(f);
        this.view.appendChild(b);
        this.f = false;
        this.anim = false;
        this.view.appendChild(img);
        this.view.appendChild(text);
        if (description.settings.random)
            this.random = true;
        if (description.settings.cycle)
            this.view.cycle = description.settings.cycle;
        else {
            this.view.cycle = false;
            if (b && !this.random)
                b.style.display = "none";
        }
        this.n = 0;
        this.prev_n = 0;
        this.count = description.settings.imgs.length - 1;

        this.view.imagePos = description.settings.imagePos;
        this.view.textPos = description.settings.textPos;
        this.view.style.overflow = "hidden";
        this.elem = this.view.childNodes;
        bradapter.applyZIndex(this.view, this.view.cur, this.view.childNodes.length);
        bradapter.applyZIndex(this.view, this.view.childNodes[0], this.view.childNodes.length + 1);
        bradapter.applyZIndex(this.view, this.view.childNodes[1], this.view.childNodes.length + 1);
    };

    NarrGallery.prototype.types = [];
    NarrGallery.prototype.types[0] = function (prev, cur, prev_text, cur_text, param) {
        prev.style.opacity = 1 - param;
        cur.style.opacity = param;

        prev_text.style.opacity = 1 - param;
        cur_text.style.opacity = param;
    };
    NarrGallery.prototype.types[0].time = 500;

    NarrGallery.prototype.types[1] = function (prev, cur, prev_text, cur_text, param, direction, imageSize, textSize) {
        if (direction == 1) {
            prev.style[brprefix + "transform"] = "translate3d(" + (param * imageSize) + "px,0px,0px)";
            cur.style[brprefix + "transform"] = "translate3d(" + (param * imageSize - imageSize) + "px,0px,0px)";

            prev_text.style[brprefix + "transform"] = "translate3d(" + (param * textSize) + "px,0px,0px)";
            cur_text.style[brprefix + "transform"] = "translate3d(" + (param * textSize - textSize) + "px,0px,0px)";
        }
        else {
            prev.style[brprefix + "transform"] = "translate3d(" + (-param * imageSize) + "px,0px,0px)";
            cur.style[brprefix + "transform"] = "translate3d(" + (imageSize - param * imageSize) + "px,0px,0px)";
            prev_text.style[brprefix + "transform"] = "translate3d(" + (-param * textSize) + "px,0px,0px)";
            cur_text.style[brprefix + "transform"] = "translate3d(" + (textSize - param * textSize) + "px,0px,0px)";
        }
    };
    NarrGallery.prototype.types[1].time = 500;

    NarrGallery.prototype.types[2] = function (prev, cur, prev_text, cur_text, param) {
        prev.style.opacity = 1 - param;
        cur.style.opacity = param;

        prev_text.style.opacity = 1 - param;
        cur_text.style.opacity = param;
    };
    NarrGallery.prototype.types[2].time = 0;

    NarrGallery.prototype.draw = function () { // необязательно

        if (this.f) {
            if (this.param < 1)
                this.anim = true;
            else if (this.param == 1)
                this.anim = false;
            this.types[this.view.type](this.view.prev, this.view.cur, this.view.prev_text, this.view.cur_text, this.param, this.arr, this.view.imageSize, this.view.textSize.x);
        }


    };
    NarrGallery.prototype.unload = function () { // необязательно
        for (var j = 0; j < this.view.childNodes.length; j++) {
            if (this.view.childNodes[j].id == "img")
                var img = this.view.childNodes[j];
            if (this.view.childNodes[j].id == "text")
                var text = this.view.childNodes[j];
        }
        for (var i = 0; i < img.childNodes.length; i++) {
            if (img.childNodes[i].id == "img_0") {
                img.childNodes[i].style.opacity = 1;
                //text.style.opacity = 1;
                this.view.cur = img.childNodes[i];
                // this.view.cur_text = text;
            }
            else {
                if (this.view.type == 1) {
                    img.childNodes[i].style[brprefix + "transform"] = "translate3d(" + (-this.view.imageSize.x) + "px,0px,0px)";
                }
                img.childNodes[i].style.opacity = 0;
            }
        }
        for (var i = 0; i < text.childNodes.length; i++) {
            if (text.childNodes[i].id == "text_0") {
                text.childNodes[i].style.opacity = 1;
                this.view.cur_text = text.childNodes[i];
            }
            else {
                if (this.view.type == 1) {
                    text.childNodes[i].style[brprefix + "transform"] = "translate3d(" + (-this.view.textSize.x) + "px,0px,0px)";
                }
                text.childNodes[i].style.opacity = 0;
            }
        }
        if (!this.view.cycle)
            this.back.style.display = "none";

    };


    NarrGallery.prototype.galleryEnd = function (e, obj) {

        e.stopPropagation();
        if (obj == 1)return;
        if (!obj) return false;
        this.opacity = 0;
        for (var i = 0; i < this.elem.length; i++) {
            if (this.elem[i].id == 'img') this.imgs = this.elem[i];
            if (this.elem[i].id == 'text') this.text = this.elem[i];
        }
        this.n = parseInt(this.view.cur.id.replace('img_', ''));
        this.view.prev = this.view.cur;
        this.view.prev_text = this.view.cur_text;

        if (obj.id == "forward") {
            this.arr = 1;

            if (!this.random) {
                if (this.n == (this.imgs.childNodes.length - 1)) {
                    if (this.view.cycle) {
                        for (var i = 0; i < this.imgs.childNodes.length; i++)
                            if (this.imgs.childNodes[i].id == 'img_0') this.view.cur = this.imgs.childNodes[i];
                        for (var i = 0; i < this.text.childNodes.length; i++)
                            if (this.text.childNodes[i].id == 'text_0') this.view.cur_text = this.text.childNodes[i];

                        //this.view.cur = document.getElementById('img_0');
                        //this.view.cur_text = document.getElementById('text_0');
                    }
                } else {
                    for (var i = 0; i < this.imgs.childNodes.length; i++)
                        if (this.imgs.childNodes[i].id == 'img_' + (this.n + 1)) this.view.cur = this.imgs.childNodes[i];
                    for (var i = 0; i < this.text.childNodes.length; i++)
                        if (this.text.childNodes[i].id == 'text_' + (this.n + 1)) this.view.cur_text = this.text.childNodes[i];
                }
            } else {
                this.prev_n = this.n;
                while (this.prev_n == this.n) {
                    this.n = (Math.floor(Math.random() * (this.count + 1)));
                }
                for (var i = 0; i < this.imgs.childNodes.length; i++)
                    if (this.imgs.childNodes[i].id == 'img_' + this.n) this.view.cur = this.imgs.childNodes[i];
                for (var i = 0; i < this.text.childNodes.length; i++)
                    if (this.text.childNodes[i].id == 'text_' + this.n) this.view.cur_text = this.text.childNodes[i];
            }

        }
        else {
            this.arr = 0;

            if (!this.random) {
                if (this.n == 0) {
                    if (this.view.cycle) {
                        for (var i = 0; i < this.imgs.childNodes.length; i++)
                            if (this.imgs.childNodes[i].id == 'img_' + (this.imgs.childNodes.length - 1)) this.view.cur = this.imgs.childNodes[i];
                        for (var i = 0; i < this.text.childNodes.length; i++)
                            if (this.text.childNodes[i].id == 'text_' + (this.text.childNodes.length - 1)) this.view.cur_text = this.text.childNodes[i];
                    }
                } else {
                    for (var i = 0; i < this.imgs.childNodes.length; i++)
                        if (this.imgs.childNodes[i].id == 'img_' + (this.n - 1)) this.view.cur = this.imgs.childNodes[i];
                    for (var i = 0; i < this.text.childNodes.length; i++)
                        if (this.text.childNodes[i].id == 'text_' + (this.n - 1)) this.view.cur_text = this.text.childNodes[i];
                }
            } else {

                this.prev_n = this.n;
                while (this.prev_n == this.n) {
                    this.n = (Math.floor(Math.random() * (this.count + 1)));
                }
                for (var i = 0; i < this.imgs.childNodes.length; i++)
                    if (this.imgs.childNodes[i].id == 'img_' + this.n) this.view.cur = this.imgs.childNodes[i];
                for (var i = 0; i < this.text.childNodes.length; i++)
                    if (this.text.childNodes[i].id == 'text_' + this.n) this.view.cur_text = this.text.childNodes[i];
            }
        }
        if (this.view.type == 1) {
            this.view.cur.style.opacity = 1;
            this.view.prev.style.opacity = 1;

            this.view.cur_text.style.opacity = 1;
            this.view.prev_text.style.opacity = 1;
        }

        if (!this.view.cycle && !this.random) {
            if (parseInt(this.view.cur.id.replace('img_', '')) >= this.imgs.childNodes.length - 1)
                this.forward.style.display = "none";
            else
                this.forward.style.display = "block";

            if (parseInt(this.view.cur.id.replace('img_', '')) > 0)
                this.back.style.display = "block";
            else
                this.back.style.display = "none";
        }

        for (var i = 0; i < this.imgs.childNodes[i].length; i++) {
            if (this.view.cur == this.imgs.childNodes[i] || this.view.prev == this.imgs.childNodes[i]) continue;
            this.imgs.childNodes[i].style.opacity = 0;
        }
        for (var i = 0; i < this.text.childNodes[i].length; i++) {
            if (this.view.cur_text == this.text.childNodes[i] || this.view.prev_text == this.text.childNodes[i]) continue;
            this.text.childNodes[i].style.opacity = 0;
        }
        if (this.view.cur == this.view.prev) return false;
        this.param = 0;
        this.wall = 0;
        this.f = true;
        this.animateTo('param', 1, this.types[this.view.type].time);
        this.animateTo('wall', 1, this.types[this.view.type].time + 300);

    };

    NarrGallery.prototype.customHittest = function (e, gesture) {
        if (this.anim) {
            e.stopPropagation();
            return false;
        }
        if (gesture == 'NarrGalleryTap') {
            if (this.wall != 1) {
                e.stopPropagation();
                return 1;
            }
            else {
                for (var i = 0; i < 2; i++) {
                    if (this.view.childNodes[i].ngparams)
                        if (this.hittestForRect({pType: 0, left: (this.view.childNodes[i].ngparams.pos.x - (50 - Math.min(50, this.view.childNodes[i].ngparams.width)) / 2), top: (this.view.childNodes[i].ngparams.pos.y - (50 - Math.min(50, this.view.childNodes[i].ngparams.height)) / 2), width: Math.max(50, this.view.childNodes[i].ngparams.width), height: Math.max(50, this.view.childNodes[i].ngparams.height)}, e))
                            return this.view.childNodes[i];
                }
            }
        }
        else
            return false;
    };

    Utils.addBehaviour('tap', 'NarrGallery', 'NarrGalleryTap', {start: function (e, obj) {
        return this.galleryStart(e, obj);
    }, move: function (e, obj) {
        this.galleryMove(e, obj);
    }, swipe: function (e) {
        e.stopPropagation();
        return true;
    }, end: function (e, obj) {
        e.stopPropagation();
        this.galleryEnd(e, obj);
    }}, false);

    return NarrGallery;
});