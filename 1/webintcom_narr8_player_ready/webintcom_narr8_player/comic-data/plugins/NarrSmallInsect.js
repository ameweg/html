define(["utils/Utils"], function (Utils) {

    var NarrSmallInsect = Utils.newObjectType(NarrSmallInsect, "NarrSmallInsect"); // обязательно, функция из API


    NarrSmallInsect.prototype.init = function (description) {
        if (description.settings.image == undefined) return;

        var imageLength = description.settings.image.size.x < description.settings.image.size.y ? description.settings.image.size.y : description.settings.image.size.x;
        var place = {x: imageLength, y: imageLength, width: this.width - imageLength, height: this.height - imageLength};

        this.images = [];
        this.point = {x: 0, y: 0};
        this.place = {x: place.x, y: place.y, width: place.width, height: place.height};
        this.imageSize = description.settings.image.size;
        this.radius = description.settings.radius;
        this.defaultAnimation = description.settings.defaultAnimation;
        this.returnObjects = description.settings.returnObjects;
        this.speed = description.settings.speed;
        this.count = description.settings.count;
        this.first = true;

        for (var i = 0; i < this.count; i++) {
            var node = document.createElement('div');
            var image = new Image();
            image.src = description.settings.image.src;
            image.x = -(parseInt(description.settings.image.size.x) / 2);
            image.y = -(parseInt(description.settings.image.size.y) / 2);
            image.style.marginLeft = image.x + 'px';
            image.style.marginTop = image.y + 'px';
            node.style.position = "absolute";
            node.x = Math.ceil(Math.random() * place.width);
            node.y = Math.ceil(Math.random() * place.height);
            node.z = i;
            node.style[brprefix + "transform"] = "translate3d(" + node.x + "px," + node.y + "px," + node.z + "px)";
            node.id = i;
            node.angle = Math.ceil(360 / this.count) * (i + 1);
            node.startPoint = {x: 0, y: 0};
            node.endPoint = {x: 0, y: 0};
            node.appendChild(image);
            this.view.appendChild(node);
            this.images.push(node);

            if (this.defaultAnimation)
                this.randomAnimation(node);
            else if (this.returnObjects)
                node.place = {x: node.x, y: node.y};
        }

    }

    NarrSmallInsect.prototype.vectorAnimation = function (x, y) {
        for (var i = 0; i < this.images.length; i++) {
            var node = this.images[i];
            node.startX = node.startPoint.x = node.x;
            node.startY = node.startPoint.y = node.y;
            node.endPoint.x = x;
            node.endPoint.y = y;
            var point = this.radiusPoint(node.endPoint, node.angle);
            node.endX = node.endPoint.x = point.x;
            node.endY = node.endPoint.y = point.y;
            node.rotation = this.calculateAngle(node.startPoint, node.endPoint);
            this.restart(node);
        }
    }

    NarrSmallInsect.prototype.randomAnimation = function (node) {
        node.startX = node.startPoint.x = node.x;
        node.startY = node.startPoint.y = node.y;
        node.endX = node.endPoint.x = this.randomCoordinates(this.place.x, this.place.width);
        node.endY = node.endPoint.y = this.randomCoordinates(this.place.y, this.place.height);
        node.rotation = this.calculateAngle(node.startPoint, node.endPoint);
        this.restart(node, this.randomAnimationComplete);
    }

    NarrSmallInsect.prototype.restart = function (node, complete) {
        var distance = this.calculateDistance({x: node.endX, y: node.endY}, node);
        var speed = distance * 100 / this.speed;
        if (node.animation != undefined)
            this.cancelAnimation(node.animation);
        this['seek_' + node.id] = 0;
        node.animation = this.animateTo('seek_' + node.id, 1, speed, 'linear', complete);
    }

    NarrSmallInsect.prototype.randomAnimationComplete = function () {
        if (!this.defaultAnimation) return;

        for (var i = 0; i < this.count; i++)
            if (this['seek_' + i] == 1)
                this.randomAnimation(this.images[i]);
    }

    NarrSmallInsect.prototype.draw = function () {
        for (var i = 0; i < this.images.length; i++) {
            if (!this.images[i].startX || !this.images[i].startY || !this.images[i].endX || !this.images[i].endY)
                continue;

            this.images[i].x = this.images[i].startX - (this.images[i].startX - this.images[i].endX) * this['seek_' + this.images[i].id];
            this.images[i].y = this.images[i].startY - (this.images[i].startY - this.images[i].endY) * this['seek_' + this.images[i].id];
            this.images[i].style[brprefix + "transform"] = "translate3d(" + this.images[i].x + "px," + this.images[i].y + "px," + this.images[i].z + "px) rotate(" + this.images[i].rotation + "deg)";
        }
    }

    NarrSmallInsect.prototype.returnToPlace = function () {
        for (var i = 0; i < this.images.length; i++) {
            this.images[i].endX = this.images[i].place.x;
            this.images[i].endY = this.images[i].place.y;
            this.images[i].startX = this.images[i].x;
            this.images[i].startY = this.images[i].y;
            this.images[i].rotation = this.calculateAngle({x: this.images[i].startX, y: this.images[i].startY}, {x: this.images[i].endX, y: this.images[i].endY});
            this.restart(this.images[i]);
        }
    }

    NarrSmallInsect.prototype.eventHandler = function (event) {
        switch (event.status) {
            case 'move':
            case 'start':
                if (event.x >= this.x + this.place.x && event.x <= this.x + this.place.width
                    && event.y >= this.y + this.place.y && event.y <= this.y + this.place.height) {
                    for (var i = 0; i < this.count; i++)
                        if (this.images[i].animation)
                            this.cancelAnimation(this.images[i].animation);
                    this.vectorAnimation(event.x - this.x - this.imageSize.x / 2, event.y - this.y - this.imageSize.y / 2);
                }
                break;
            case 'end':
                if (this.defaultAnimation)
                    for (var i = 0; i < this.count; i++)
                        this.randomAnimation(this.images[i]);
                else if (this.returnObjects)
                    this.returnToPlace();
                else
                    for (var i = 0; i < this.count; i++)
                        this.cancelAnimation(this.images[i].animation);
                break;
        }
    }


///////////////////////////////////////
///////////---УТИЛИТЫ----//////////////
///////////////////////////////////////
    NarrSmallInsect.prototype.radiusPoint = function (point, angle) {
        return {x: point.x + this.radius * Math.cos(angle), y: point.y + this.radius * Math.sin(angle)};
    }


    NarrSmallInsect.prototype.randomCoordinates = function (limit_0, limit_1) {
        var v = limit_0 + Math.random() * limit_1;

        if (v > limit_1)
            v = this.randomCoordinates(limit_0, limit_1);

        return Math.ceil(v);
    }

    NarrSmallInsect.prototype.calculateDistance = function (point_0, point_1) {
        return Math.sqrt((point_0.x - point_1.x) * (point_0.x - point_1.x) + (point_0.y - point_1.y) * (point_0.y - point_1.y));
    }

    NarrSmallInsect.prototype.calculateAngle = function (p0, p1) {
        var catX = p0.x - p1.x;
        var catY = p0.y - p1.y;
        var gipo = Math.sqrt(catX * catX + catY * catY);
        var angle = Math.acos(catX / gipo) * 180 / Math.PI;
        if (catX < 0 && catY < 0 || catX > 0 && catY < 0)
            angle = (Math.PI / 2 - Math.acos(catX / gipo)) * 180 / Math.PI + 180;
        else if (catX >= 0 && catY >= 0 || catX <= 0 && catY >= 0)
            angle = (Math.PI / 2 + Math.acos(catX / gipo)) * 180 / Math.PI + 180;
        if (!angle) angle = 0;
        return angle;
    }

    Utils.addBehaviour('pan', 'NarrSmallInsect', 'NarrSmallInsectPan',
        {
            start: function (g) {
                return true;
            },
            end: function (g, obj) {
            },
            swipe: function (g) {
                g.stopPropagation();
            },
            move: function (g, obj) {
                this.eventHandler(g);
            }
        }, false);

    Utils.addBehaviour('touch', 'NarrSmallInsect', 'NarrSmallInsectTouch',
        {
            start: function (g) {
                this.eventHandler(g);
                return true;
            },
            swipe: function (g) {
                g.stopPropagation();
            },
            end: function (g, obj) {
                this.eventHandler(g);
            }
        }, false);

    return NarrSmallInsect;
});