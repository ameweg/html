define(["utils/Utils"], function (Utils) {
    var NarrEyes = Utils.newObjectType(NarrEyes, "NarrEyes", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrEyes.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;
        this.maxDistSqr = description.maxDist * description.maxDist;
        this.shadowCount = description.shadowCount;
        this.blinkImgCount = description.blinkImgCount;


        this.view.style.backgroundImage = 'url("' + this.imagesSrc.gameBackground + '")';
        this.view.style.backgroundSize = "100% 100%";

        this.eStart = {};
        this.e = {};

        this.orientationVect = {};

        this.blinkPeriod = 1 / 6 * 1000; // img per sec
        this.dtCounter = this.blinkPeriod;


        this.firstStart = true;

        this.delegate.addEventListener("timer", this.loop, this);

    };

    NarrEyes.prototype.load = function () {
        this.eyes = document.createElement('div');
        this.eyesCover = document.createElement('div');
        this.eyesRed = document.createElement('div');
        this.eyesMoving = document.createElement('div');

        this.eyes.appendChild(this.eyesCover);
        this.eyes.appendChild(this.eyesRed);
        this.eyes.appendChild(this.eyesMoving);

        this.arrow = document.createElement('div');
        this.girl = document.createElement('div');
        this.shadow = document.createElement('div');
        this.blinkingImgs = document.createElement('div');

        this.eyes.size = this.imagesSize.eyesWrapperSize;
        this.eyes.style.width = this.eyes.size.x + "px";
        this.eyes.style.height = this.eyes.size.y + "px";
        this.eyes.pos = this.imagesPos.eyesWrapperPos;
        this.eyes.style.position = "absolute";
        this.eyes.style.overflow = "hide";
        bradapter.applyZIndex(this.view, this.eyes, 1);
        this.eyes.style[brprefix + "transform"] = "translate3d(" + this.eyes.pos.x + "px, " + this.eyes.pos.y + "px,0px)";

        this.eyesCover.size = this.imagesSize.eyesWrapperSize;
        this.eyesCover.style.backgroundImage = 'url("' + this.imagesSrc.eyesCoverSrc + '")';
        this.eyesCover.style.backgroundSize = "100% 100%";
        this.eyesCover.style.width = this.eyesCover.size.x + "px";
        this.eyesCover.style.height = this.eyesCover.size.y + "px";
        this.eyesCover.style.position = "absolute";
        bradapter.applyZIndex(this.view, this.eyesCover, 3);

        this.eyesRed.size = this.imagesSize.eyesWrapperSize;
        this.eyesRed.style.backgroundImage = 'url("' + this.imagesSrc.eyesRedSrc + '")';
        this.eyesRed.style.backgroundSize = "100% 100%";
        this.eyesRed.style.width = this.eyesRed.size.x + "px";
        this.eyesRed.style.height = this.eyesRed.size.y + "px";
        this.eyesRed.style.position = "absolute";

        this.eyesMoving.size = this.imagesSize.eyesSize;

        this.eyesMoving.style.backgroundImage = 'url("' + this.imagesSrc.eyesMovingSrc + '")';
        this.eyesMoving.style.backgroundSize = "100% 100%";
        this.eyesMoving.style.width = this.eyesMoving.size.x + "px";
        this.eyesMoving.style.height = this.eyesMoving.size.y + "px";
        this.eyesMoving.pos = {x: this.imagesPos.eyesMovingPos.x, y: this.imagesPos.eyesMovingPos.y};
        this.eyesMoving.startPos = {x: this.eyesMoving.pos.x, y: this.eyesMoving.pos.y};
        this.eyesMoving.center = {x: this.eyesMoving.pos.x + this.eyesMoving.size.x / 2 + this.eyes.pos.x, y: this.eyesMoving.pos.y + this.eyesMoving.size.y / 2 + this.eyes.pos.y };
        this.eyesMoving.style.position = "absolute";
        this.eyesMoving.style[brprefix + "transform"] = "translate3d(" + this.eyesMoving.pos.x + "px, " + this.eyesMoving.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.eyesMoving, 2);

        this.girl.size = this.imagesSize.girlSize;
        this.girl.style.backgroundImage = 'url("' + this.imagesSrc.girlSrc + '")';
        this.girl.style.backgroundSize = "100% 100%";
        this.girl.style.width = this.girl.size.x + "px";
        this.girl.style.height = this.girl.size.y + "px";
        bradapter.applyZIndex(this.view, this.girl, 4);
        this.girl.pos = {x: this.imagesPos.girlPos.x, y: this.imagesPos.girlPos.y};
        this.girl.start = {};
        this.girl.style.position = "absolute";
        this.girl.style[brprefix + "transform"] = "translate3d(" + this.girl.pos.x + "px, " + this.girl.pos.y + "px,0px)";

        this.arrow.size = this.imagesSize.arrowSize;
        this.arrow.style.backgroundImage = 'url("' + this.imagesSrc.arrowSrc + '")';
        this.arrow.style.backgroundSize = "100% 100%";
        this.arrow.style.width = this.arrow.size.x + "px";
        this.arrow.style.height = this.arrow.size.y + "px";
        bradapter.applyZIndex(this.view, this.arrow, 2);
        this.arrow.pos = this.imagesPos.arrowPos;
        this.arrow.style.position = "absolute";
        this.arrow.style[brprefix + "transform"] = "translate3d(" + this.arrow.pos.x + "px, " + this.arrow.pos.y + "px,0px)";


        this.shadow.size = this.imagesSize.shadowSize;
        this.shadow.pos = {};
        this.shadow.style.width = this.shadow.size.x + "px";
        this.shadow.style.height = this.shadow.size.y + "px";
        this.shadow.style.position = "absolute";
        this.shadow.style.backgroundSize = "100% auto";
        this.shadow.style.backgroundImage = 'url("' + this.imagesSrc.shadowSrc + '")';
        bradapter.applyZIndex(this.view, this.shadow, 3);

        this.blinkingImgs.style.width = 574 + "px";
        this.blinkingImgs.style.height = 398 + "px";
        this.blinkingImgs.style.backgroundImage = 'url("' + this.imagesSrc.blinkingImgsSrc[0] + '")';
        this.blinkingImgs.style.backgroundSize = this.blinkingImgs.style.width + " " + this.blinkingImgs.style.height;
        this.blinkingImgs.style[brprefix + "transform"] = "translate3d(" + 189 + "px, " + 172 + "px,0px)";
        this.blinkingImgs.style.position = "absolute";
        this.blinkingImgs.style.display = "none";
        bradapter.applyZIndex(this.view, this.blinkingImgs, 5);
        // this.blinkingImgs.style.display = "none";


        this.view.appendChild(this.eyes);
        this.view.appendChild(this.girl);
        this.view.appendChild(this.arrow);
        this.view.appendChild(this.shadow);
        this.view.appendChild(this.blinkingImgs);

        this.girl.center = {x: this.girl.pos.x + this.girl.size.x / 2, y: this.girl.pos.y + this.girl.size.y / 2};
        this.orientationVect.x = this.girl.center.x - this.eyesMoving.center.x;
        this.orientationVect.y = this.girl.center.y - this.eyesMoving.center.y;
        this.startDistanceSqr = this.orientationVect.x * this.orientationVect.x + this.orientationVect.y * this.orientationVect.y;

        this.updateOnMove();

    };


    NarrEyes.prototype.unload = function () {
        delete this.eyes;
        delete this.eyesCover;
        delete this.eyesRed;
        delete this.eyesMoving;
        delete this.girl;
        delete this.shadow;
        delete this.blinkingImgs;
        delete this.arrow;

        this.firstStart = true;
        this.deleteDomElements(this.view);
    };

    NarrEyes.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrEyes.prototype.loop = function (dt) { // необязательно
        if (!this.isFinalBlinking)
            return;

        this.dtCounter += dt;
        if (this.dtCounter > this.blinkPeriod) {
            this.dtCounter = 0;
            // this.curImage.style.backgroundImage = 'url("' + this.imagesSrc.blinkingImgsSrc[Math.floor(Math.random()*this.blinkImgCount)] + '")';
        }
    };
// NarrEyes.prototype.draw = function () { // необязательно
// };


    NarrEyes.prototype.updateOnMove = function () {

        this.girl.center = {x: this.girl.pos.x + this.girl.size.x / 2, y: this.girl.pos.y + this.girl.size.y / 2};

        this.orientationVect.x = this.girl.center.x - this.eyesMoving.center.x;
        this.orientationVect.y = this.girl.center.y - this.eyesMoving.center.y;

        this.distanceSqr = this.orientationVect.x * this.orientationVect.x + this.orientationVect.y * this.orientationVect.y;


        if (!this.isFinalBlinking) {
            if (this.distanceSqr < 30 * 30) {
                this.isFinalBlinking = true;
                this.blinkingImgs.style.display = "block";
                this.dtCounter = this.blinkPeriod;
            }
        }
        else {
            if (this.distanceSqr > 60 * 60) {
                this.isFinalBlinking = false;
                this.blinkingImgs.style.display = "none";
            }
        }

        if (this.isFinalBlinking)
            return;

        this.eyesMoving.pos.x = this.eyesMoving.startPos.x + Math.min(this.orientationVect.x / 15, 35);
        this.eyesMoving.pos.y = this.eyesMoving.startPos.y + Math.min(this.orientationVect.y / 15, 15);
        this.eyesMoving.style[brprefix + "transform"] = "translate3d(" + this.eyesMoving.pos.x + "px, " + this.eyesMoving.pos.y + "px,0px)";


        this.shadow.pos.x = this.eyesMoving.center.x - this.orientationVect.x - this.shadow.size.x / 2;
        this.shadow.pos.y = this.eyesMoving.center.y - this.orientationVect.y - this.shadow.size.y / 2;
        this.shadow.style[brprefix + "transform"] = "translate3d(" + this.shadow.pos.x + "px, " + this.shadow.pos.y + "px,0px)";

        this.eyesRed.style.opacity = Math.min(Math.max(0.001, (1 - Math.sqrt(this.distanceSqr / this.startDistanceSqr) )), 0.999);

        this.shadowNum = Math.min(this.shadowCount - 1, Math.floor(Math.sqrt(this.distanceSqr / this.maxDistSqr) * this.shadowCount));

        this.shadow.style.backgroundPosition = "0px " + (-Math.ceil(this.shadow.size.y * (this.shadowCount - 1 - this.shadowNum))) + "px";
    };

    NarrEyes.prototype.eyesStart = function (e, obj) {
        e.stopPropagation();
        if (!obj)
            return false;

        if (this.firstStart) {
            this.firstStart = false;
            this.arrow.style.display = 'none';
        }

        this.girl.start.x = this.girl.pos.x;
        this.girl.start.y = this.girl.pos.y;
        this.eStart = this.getInternalCoordinatesForPoint(e);

        return true;
    };

    NarrEyes.prototype.eyesMove = function (e) {
        e.stopPropagation();

        this.e = this.getInternalCoordinatesForPoint(e);

        this.girl.start.x += this.e.x - this.eStart.x;
        this.girl.start.y += this.e.y - this.eStart.y;
        if (this.girl.start.x < 171 - this.girl.size.x / 2)
            this.girl.start.x = 171 - this.girl.size.x / 2;
        if (this.girl.start.x + this.girl.size.x / 2 > this.moduleSize.x - 171)
            this.girl.start.x = this.moduleSize.x - this.girl.size.x / 2 - 171;
        if (this.girl.start.y < -this.girl.size.y / 2)
            this.girl.start.y = -this.girl.size.y / 2;
        if (this.girl.start.y + this.girl.size.y > this.moduleSize.y + this.girl.size.y / 2)
            this.girl.start.y = this.moduleSize.y - this.girl.size.y + this.girl.size.y / 2;

        this.girl.style[brprefix + "transform"] = "translate3d(" + this.girl.start.x + "px," + this.girl.start.y + "px,0px)";
        this.girl.pos.x = this.girl.start.x;
        this.girl.pos.y = this.girl.start.y;
        this.eStart = this.getInternalCoordinatesForPoint(e);

        this.updateOnMove();
    };

    NarrEyes.prototype.eyesEnd = function (e) {
        e.stopPropagation();

    };

    NarrEyes.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrEyesPan') {
            if (this.hittestForRect({pType: 0, left: this.girl.pos.x, top: this.girl.pos.y, width: this.girl.size.x, height: this.girl.size.y}, e))
                return this.girl;
        }
        else
            return false;
    };


    Utils.addBehaviour('pan', 'NarrEyes', 'NarrEyesPan', {
        start: function (e, obj) {
            return this.eyesStart(e, obj);
        }, move: function (e) {
            this.eyesMove(e);
        }, swipe: function (e) {
            e.stopPropagation();
        }, end: function (e) {
            this.eyesEnd(e);
        }}, false);

    return NarrEyes;
});