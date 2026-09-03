define(["utils/Utils"], function (Utils) {
    var NarrGalleryCarousel = Utils.newObjectType(NarrGalleryCarousel, "NarrGalleryCarousel");

    var ngc = NarrGalleryCarousel;


    ngc.prototype.init = function (description) {
        this.images = [];
        this.places = [];
        this.animationObjects = [];
        this.LIGHT = 0;
        this.DARK = 1;
        this.first = false;
        this.moveFlag = false;
        this.slide = 0;
        this.seek = 0;
        this.speed = description.settings.speed;
        this.slide = 0;
        this.saveValue = 0;

        this.count = description.settings.count;
        this.levelSwitch = description.settings.levelSwitch;

        var l = 0;
        for (var i = 0; i < this.count; i++) {
            var node = document.createElement('div');
            var image0 = new Image();
            var image1 = new Image();
            node.style.position = 'absolute';

            description.settings.images[i].src[this.LIGHT] != '' ? image0.src = description.settings.images[i].src[this.LIGHT] : image0.src = description.settings.images[i].src[this.DARK];
            description.settings.images[i].src[this.DARK] != '' ? image1.src = description.settings.images[i].src[this.DARK] : image1.src = description.settings.images[i].src[this.LIGHT];

            if (!i)
                image1.style.opacity = 0;
            else
                image0.style.opacity = 0;

            image0.style.position = 'absolute';
            image0.style.position = 'absolute';

            image0.style.width = description.settings.images[i].size.x * description.settings.images[i].scale + 'px';
            image1.style.width = description.settings.images[i].size.x * description.settings.images[i].scale + 'px';
            image0.style.height = description.settings.images[i].size.y * description.settings.images[i].scale + 'px';
            image1.style.height = description.settings.images[i].size.y * description.settings.images[i].scale + 'px';
            node.style.left = description.settings.images[i].position.x + 'px';
            node.style.top = description.settings.images[i].position.y + 'px';
            node.style.zIndex = description.settings.images[i].position.z;

            if (description.settings.alpha)
                node.style.opacity = description.settings.images[i].alpha;

            this.places[i] = {
                x: description.settings.images[i].position.x,
                y: description.settings.images[i].position.y,
                z: description.settings.images[i].position.z + 1,
                scale: description.settings.images[i].scale,
                alpha: description.settings.images[i].alpha,
                line: description.settings.images[i].line,
                id: i
            };
            if (l < this.places[i].line) l = this.places[i].line;

            this.images[i] = {
                image0: image0,
                image1: image1,
                node: node,
                width: description.settings.images[i].size.x,
                height: description.settings.images[i].size.y,
                x: description.settings.images[i].position.x,
                y: description.settings.images[i].position.y,
                z: description.settings.images[i].position.z,
                scale: description.settings.images[i].scale,
                alpha: description.settings.images[i].alpha,
                id: i,
                src: [description.settings.images[i].src[this.LIGHT], description.settings.images[i].src[this.DARK]]
            };

            node.appendChild(image0);
            node.appendChild(image1);
            this.view.appendChild(node);

            this.animationObjects[i] = new this.AnimationObject(this.images[i], description.settings.speed);
        }

        for (i = 0; i < this.places.length; i++)
            this.places[i].line = l - this.places[i].line;

        for (i = 1; i < this.images.length; i++) {
            var id = i <= this.images.length / 2 ? i : this.images.length - Math.abs(Math.floor(this.images.length / 2) - i);
            if (this.places[id].line >= this.levelSwitch) {
                this.places[id].area = this.addArea({
                    event_type: 'tap',
                    behaviour: 'NarrGalleryCarouselImageTap',
                    left: this.images[id].x,
                    top: this.images[id].y,
                    width: this.images[id].scale > 0 ? this.images[id].width * this.images[id].scale : 1,
                    height: this.images[id].scale > 0 ? this.images[id].height * this.images[id].scale : 1,
                    visible: false,
                    propagation: 0,
                    params: {id: id}
                });
            }
            else
                this.animationObjects[id].node.style.display = 'none';
        }
    }
    ngc.prototype.load = function () {
        if (!this.carousel) {
            this.carousel = new this.Carousel(this.animationObjects, this.places, this.levelSwitch, this);
            this.carousel.complete = this.carouselComplete;
        }
        else
            this.carousel.restart();
        this.delegate.addEventListener('timer', this.redraw, this);

    }
    ngc.prototype.unload = function () {
        this.delegate.removeEventListener('timer', this.redraw, this);
    }
    ngc.prototype.imageEventHandler = function (event, area) {
        if (!this.carousel.action) {
            this.vectorX = 0;
            this.carousel.open(area.params.id);
            this.animation();
        }
    }
    ngc.prototype.animation = function () {
        if (this.a) this.cancelAnimation(this.a);
        this.seek = 0;
        this.a = this.animateTo('seek', 1, this.carousel.timeQ / this.speed, this.carousel.ease, this.animationComplete);
    }
    ngc.prototype.animationComplete = function () {
        if (!this.carousel.getAction()) {
            this.carousel.stop();
            this.fireImageEvent(this.carousel.current);
        }
        else {
            this.carousel.animation();
            this.animation();
        }
    }
    ngc.prototype.animationSimpleComplete = function () {
        this.carousel.stop();
    }
    ngc.prototype.carouselComplete = function (event) {
        this.client.action = false;
        this.client.fireImageEvent(this.current)
    }
    ngc.prototype.fireImageEvent = function (id) {
        if (this['GalleryCarouselSlide_' + id])
            this.delegate.fireEvent("performAnimation", [this['GalleryCarouselSlide_' + id]]);
    }
    ngc.prototype.eventHandlerPan = function (event) {
        switch (event.status) {
            case 'move':
                if (this.carousel.action && event.vectorX < -5 && this.vectorX > 0 || event.vectorX > 5 && this.vectorX < 0 && this.seek < 0.8) {
                    this.carousel.action = false;
                    this.carousel.return = true;
                }
                if (this.carousel.action) return;
                if (event.vectorX < 0)
                    this.carousel.next();
                else if (event.vectorX > 0)
                    this.carousel.prev();
                else    return;
                this.vectorX = event.vectorX;
                if (this.a && this.seek != 1) this.cancelAnimation(this.a);
                var time = 9000 / this.speed * (this.seek > 0 ? this.seek : 1);
                this.seek = this.seek == 1 || this.seek == 0 ? 0 : Easing['easeInQuad'](null, this.seek < 0.5 ? this.seek : 1 - this.seek, 0, 1, 1);
                ;
                this.a = this.animateTo('seek', 1, time, 'easeOutQuad', this.animationSimpleComplete);
                break;
            case 'start':
                this.moveFlag = true;
                break;
            case 'end':
                if (!this.moveFlag) return;
                this.moveFlag = false;
                this.fireImageEvent(this.carousel.current);
                break;
        }
    }
    ngc.prototype.redraw = function (event) {
        this.carousel.redraw(this.seek);
    }
    ngc.prototype.draw = function () {
        if (this.slide != this.carousel.current + 1 && this.saveValue != this.slide && !this.carousel.action) {
            var value = this.slide - this.carousel.current - 1;
            if (value < 0)       value += this.count;
            else if (value == 0) return;

            this.carousel.open(value);
            this.animation();
        }

        this.saveValue = this.slide;
        this.slide = 0;
    }
    Utils.addBehaviour('tap', 'NarrGalleryCarousel', 'NarrGalleryCarouselImageTap',
        {
            start: function (g) {
                return true;
            },
            end: function (g, obj) {
                g.stopPropagation();
                this.imageEventHandler(g, obj);
            },
            swipe: function (g) {
                g.stopPropagation();
            }
        }, false);
    Utils.addBehaviour('pan', 'NarrGalleryCarousel', 'NarrGalleryCarouselPan',
        {
            start: function (g) {
                this.eventHandlerPan(g);
                return true;
            },
            end: function (g, obj) {
                this.eventHandlerPan(g);
            },
            swipe: function (g) {
                g.stopPropagation();
            },
            move: function (g, obj) {
                this.eventHandlerPan(g);
            }
        }, false);
    ngc.prototype.Carousel = function (animationObjects, places, levelSwitch, client) {
        this.client = client;
        this.animationObjects = animationObjects;
        this.places = places;
        this.levelSwitch = levelSwitch;
        this.current = 0;
        this.q = 0;
        this.ease = 'linear';
        this.timeQ = 5000;
        this.action = false;
        this.return = false;

        var completeCarouselCounter = 0;

        this.restart = function () {
            this.current = 0;

            for (var i = 0; i < this.animationObjects.length; i++) {
                this.animationObjects[i].id = i;
                this.animationObjects[i].position(this.places[i].x, this.places[i].y, this.places[i].scale, this.places[i].alpha);
                this.animationObjects[i].node.style.display = this.places[i].line >= this.levelSwitch ? 'block' : 'none';
                this.animationObjects[i].alpha = this.animationObjects[i].endAlpha;
                this.animationObjects[i].applyRestart();
            }
        }
        this.next = function () {
            if (this.action) return;
            completeCarouselCounter = 1;
            this.goto(this.current == this.animationObjects.length - 1 ? 0 : this.current + 1);
        }
        this.prev = function () {
            if (this.action) return;
            completeCarouselCounter = 1;
            this.goto(this.current == 0 ? this.animationObjects.length - 1 : this.current - 1);
        }
        this.open = function (id) {
            if (this.action) return;
            if (id < this.animationObjects.length / 2)
                completeCarouselCounter = id;
            else if (id < this.animationObjects.length)
                completeCarouselCounter = Math.abs(id - this.animationObjects.length);
            else
                return;

            this.openedID = id;
            this.animation();
        }
        this.animation = function () {
            if (completeCarouselCounter == 1) {
                this.ease = 'easeOutQuad';
                this.timeQ = 9000;
            }
            else {
                this.ease = 'linear';
                this.timeQ = 5000;
            }

            if (this.openedID <= this.animationObjects.length / 2)
                this.goto(this.current + 1);
            else
                this.goto(this.current - 1);
        }
        this.goto = function (id, complete) {
            this.q = this.current - id;

            for (var i = 0; i < this.animationObjects.length; i++) {
                var next = this.animationObjects[i].id + this.q;
                if (next >= this.animationObjects.length)
                    next -= this.animationObjects.length;
                else if (next < 0)
                    next += this.animationObjects.length;

                if (this.animationObjects[i].id == 0) {
                    this.animationObjects[i].up = false;
                    this.animationObjects[i].down = true;
                }
                else if (next == 0) {
                    this.animationObjects[i].down = false;
                    this.animationObjects[i].up = true;
                }
                else {
                    this.animationObjects[i].up = false;
                    this.animationObjects[i].down = false;
                }

                if (this.places[next].line < this.levelSwitch && this.places[this.animationObjects[i].id].line >= this.levelSwitch)
                    this.animationObjects[i].onComplete = this.offLevel;
                else
                    this.animationObjects[i].onComplete = null;

                if (this.places[next].line >= this.levelSwitch || this.animationObjects[i].onComplete) {
                    if (!this.return)
                        this.animationObjects[i].position(this.places[this.animationObjects[i].id].x, this.places[this.animationObjects[i].id].y, this.places[this.animationObjects[i].id].scale, this.places[this.animationObjects[i].id].alpha);
                    this.animationObjects[i].start(this.places[next].x, this.places[next].y, this.places[next].z, this.places[next].scale, this.places[next].alpha);

                }
                else
                    this.animationObjects[i].off();

                this.animationObjects[i].id = next;
                this.animationObjects[i].z = this.places[next].z;
            }

            this.current = id < this.animationObjects.length && id >= 0 ? id : id > 0 ? id - this.animationObjects.length : id + this.animationObjects.length;

            this.action = true;
            this.return = false;
        }
        this.stop = function () {
            this.redraw(1);
            for (var i = 0; i < this.animationObjects.length; i++)
                this.animationObjects[i].action = false;
            this.action = false;
        }
        this.getAction = function () {
            return (--completeCarouselCounter != 0)
        }
        this.redraw = function (seek) {
            if (this.action)
                for (var i = 0; i < this.animationObjects.length; i++) {
                    if (this.animationObjects[i].action)
                        this.animationObjects[i].redraw(seek);
                }
        }
        this.offLevel = function () {
            this.node.style.display = 'none';
        }
        this.complete = function (event) {
        }
    }
    ngc.prototype.AnimationObject = function (image, speed) {
        this.name = 'AnimationObject';
        this.image = image;
        this.image0 = image.image0;
        this.image1 = image.image1;
        this.node = image.node;
        this.settings = image;
        this.x = image.x;
        this.y = image.y;
        this.z = image.z;
        this.scale = image.scale;
        this.startAlpha = 1;
        this.endAlpha = 1;
        this.alpha = image.alpha;
        this.startPoint = {};
        this.endPoint = {};
        this.startScale = 0;
        this.endScale = 0;
        this.id = image.id;
        this.src = image.src;

        this.up = false;
        this.down = false;

        this.applyRestart = function () {
            this.node.style.left = this.x + 'px';
            this.node.style.top = this.y + 'px';
            this.image0.style.width = this.image1.style.width = (this.settings.width * this.scale) + 'px';
            this.image0.style.height = this.image1.style.height = (this.settings.height * this.scale) + 'px';
            this.node.style.opacity = this.alpha;
            if (!this.id) {
                this.image0.style.opacity = 1;
                this.image1.style.opacity = 0;
            }
            else {
                this.image0.style.opacity = 0;
                this.image1.style.opacity = 1;
            }
        }
        this.position = function (x, y, scale, alpha) {
            this.x = x;
            this.y = y;
            this.scale = scale;
            this.startAlpha = this.alpha;
            this.endAlpha = alpha;
            this.node.style.zIndex = Math.round(this.scale * 100);
        }
        this.start = function (x, y, z, scale, alpha) {
            this.action = true;
            this.startPoint.x = this.x;
            this.startPoint.y = this.y;
            this.startScale = this.scale;
            this.endScale = scale;
            this.endPoint.x = x;
            this.endPoint.y = y;
            this.z = z;
            this.startAlpha = this.alpha;
            this.endAlpha = alpha;
            this.node.style.display = 'block';
        }
        this.redraw = function (seek) {
            if (!this.action)return;
            this.x = Math.ceil(this.startPoint.x - (this.startPoint.x - this.endPoint.x) * seek);
            this.y = Math.ceil(this.startPoint.y - (this.startPoint.y - this.endPoint.y) * seek);
            this.scale = this.startScale - (this.startScale - this.endScale) * seek;
            this.alpha = this.startAlpha - (this.startAlpha - this.endAlpha) * seek;

            this.node.style.left = Math.ceil(this.x) + "px";
            this.node.style.top = Math.ceil(this.y) + "px";
            this.node.style.zIndex = this.z;
            this.node.style.opacity = this.alpha;
            this.image0.style.width = this.image1.style.width = Math.ceil(this.settings.width * this.scale) + "px";
            this.image0.style.height = this.image1.style.height = Math.ceil(this.settings.height * this.scale) + "px";

            if (this.down) {
                this.image0.style.opacity = 1 - seek;
                this.image1.style.opacity = 1;
                this.image0.style.zIndex = 2;
                this.image1.style.zIndex = 1;
                if (seek < 0.1)
                    this.image0.style.opacity = 1;
            }
            else if (this.up) {
                this.image0.style.opacity = seek;
                this.image1.style.opacity = 1;
                this.image0.style.zIndex = 2;
                this.image1.style.zIndex = 1;
                if (seek < 0.1)
                    this.image0.style.opacity = 0;
            }

            if (seek == 1) {
                this.action = false;
                if (this.onComplete) this.onComplete();
                return;
            }

            this.node.style.zIndex = Math.round(this.scale * 100);
        }
        this.off = function () {
            this.action = false;
            this.node.style.display = 'none';
        }
        this.onComplete = function () {
        }
    }

    return NarrGalleryCarousel;
});