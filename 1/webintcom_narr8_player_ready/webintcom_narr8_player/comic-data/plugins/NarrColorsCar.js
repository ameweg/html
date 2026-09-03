define(["utils/Utils"], function (Utils) {
    var NarrColorsCar = Utils.newObjectType(NarrColorsCar, "NarrColorsCar", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrColorsCar.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса


        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;
        this.maxDistSqr = description.maxDist * description.maxDist;
        this.shadowCount = description.shadowCount;
        this.blinkImgCount = description.blinkImgCount;


        this.view.style.background = '#000000';

        this.eStart = {};
        this.e = {};

        this.colors = [
            [255, 35, 31, 0],
            [195, 150, 50, 0],
            [185, 206, 50, 0],
            [88, 233, 71, 0],
            [0, 222, 255, 0],
            [1, 74, 239, 0],
            [192, 2, 243, 0]
        ];
        this.activeColors = [0, 0, 0, 0, 0, 0, 0];

        this.firstStart = true;

        this.vaweSpeed = 30 / 1000; //px per sec

        this.delegate.addEventListener("timer", this.loop, this);

        this.needUpdate = 0;
        this.inited = false;

    };

    NarrColorsCar.prototype.load = function () {
        var module = this;

        this.coloringCar = document.createElement('div');
        this.coloringCarStroke = document.createElement('div');
        this.colorButtons = document.createElement('div');
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = document.createElement('div');
            this.colorButtons.appendChild(this.temp);
        }
        this.eyeModule = document.createElement('div');
        this.circles = document.createElement('div');
        this.lines = document.createElement('div');
        this.coloringCircle_back = document.createElement('div');
        this.coloringCircle_top = document.createElement('div');
        this.coloringCircle_color = document.createElement('div');

        this.eyeModule.appendChild(this.circles);
        this.eyeModule.appendChild(this.lines);
        this.eyeModule.appendChild(this.coloringCircle_back);
        this.eyeModule.appendChild(this.coloringCircle_top);
        this.eyeModule.appendChild(this.coloringCircle_color);

        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = document.createElement('div');
            this.circles.appendChild(this.temp);
        }
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = document.createElement('div');
            this.lines.appendChild(this.temp);
        }

        this.vaweBack = document.createElement('div');
        this.vawe = document.createElement('div');
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = document.createElement('div');
            this.vaweBack.appendChild(this.temp);
        }


        this.view.appendChild(this.coloringCar);
        this.coloringCar.appendChild(this.coloringCarStroke);
        this.view.appendChild(this.colorButtons);
        this.view.appendChild(this.eyeModule);
        this.view.appendChild(this.vaweBack);

        this.coloringCar.size = this.imagesSize.coloringCar;
        this.coloringCar.style.width = this.coloringCar.size.x + "px";
        this.coloringCar.style.height = this.coloringCar.size.y + "px";
        this.coloringCar.style.background = 'black';
        this.coloringCar.style.position = "absolute";
        this.coloringCar.pos = this.imagesPos.coloringCar;
        this.coloringCar.style[brprefix + "transform"] = "translate3d(" + this.coloringCar.pos.x + "px, " + this.coloringCar.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.coloringCar, 2);

        this.coloringCarStroke.size = "100% 100%";
        this.coloringCarStroke.style.width = "100%";
        this.coloringCarStroke.style.height = "100%";
        this.coloringCarStroke.style.backgroundImage = 'url("' + this.imagesSrc.coloringCarStroke + '")';
        this.coloringCarStroke.style.backgroundSize = "100%, 100%";
        this.coloringCarStroke.style.position = "absolute";
        bradapter.applyZIndex(this.view, this.coloringCarStroke, 3);

////////////////////////////////////////////////////////////////////
// BUTTONS
////////////////////////////////////////////////////////////////////
        this.colorButtons.size = this.imagesSize.colorButtons;
        this.colorButtons.style.width = this.colorButtons.size.x + "px";
        this.colorButtons.style.height = this.colorButtons.size.y + "px";
        this.colorButtons.style.position = "absolute";
        this.colorButtons.pos = this.imagesPos.colorButtons;
        this.colorButtons.style[brprefix + "transform"] = "translate3d(" + this.colorButtons.pos.x + "px, " + this.colorButtons.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.colorButtons, 2);

        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = this.colorButtons.childNodes[this.i];
            this.temp.size = {x: this.imagesSize.colorButtons.x / 7, y: this.imagesSize.colorButtons.y};
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.button[this.i] + '")';
            this.temp.style.backgroundSize = this.imagesSize.button.x + "px auto";
            this.temp.style.backgroundPosition = "10px 0px";
            this.temp.style.position = "absolute";
            this.temp.pos = {x: (this.temp.size.x) * this.i, y: 0};
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
        }
        delete this.temp;
////////////////////////////////////////////////////////////////////
// EYE MODULE
////////////////////////////////////////////////////////////////////
        this.eyeModule.size = this.imagesSize.eyeModule;
        this.eyeModule.style.width = this.eyeModule.size.x + "px";
        this.eyeModule.style.height = this.eyeModule.size.y + "px";
        this.eyeModule.style.backgroundImage = 'url("' + this.imagesSrc.eyeModule + '")';
        this.eyeModule.style.backgroundSize = this.eyeModule.style.width + " " + this.eyeModule.style.height;
        this.eyeModule.style.position = "absolute";
        this.eyeModule.pos = this.imagesPos.eyeModule;
        this.eyeModule.style[brprefix + "transform"] = "translate3d(" + this.eyeModule.pos.x + "px, " + this.eyeModule.pos.y + "px,0px)";


        this.circles.style.position = "absolute";
        this.circles.style.overflow = "visible";
        this.circles.pos = this.imagesPos.circles;
        this.circles.style[brprefix + "transform"] = "translate3d(" + this.circles.pos.x + "px, " + this.circles.pos.y + "px,0px)";
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = this.circles.childNodes[this.i];
            this.temp.size = this.imagesSize.circle;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.circle[this.i] + '")';
            this.temp.style.backgroundSize = "100% 100%";
            this.temp.style.position = "absolute";
            this.temp.style.display = "block";
            this.temp.pos = {x: (this.temp.size.x + 2) * this.i, y: 0};
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
        }

        this.lines.style.position = "absolute";
        this.lines.style.overflow = "visible";
        this.lines.pos = this.imagesPos.lines;
        this.lines.style[brprefix + "transform"] = "translate3d(" + this.lines.pos.x + "px, " + this.lines.pos.y + "px,0px)";
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = this.lines.childNodes[this.i];
            this.temp.size = this.imagesSize.lines;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.lines[this.i] + '")';
            this.temp.style.backgroundSize = "100% 100%";
            this.temp.style.position = "absolute";
            this.temp.style.display = "none";
        }
        bradapter.applyZIndex(this.view, this.lines, 5);


        this.coloringCircle_back.size = this.imagesSize.coloringCircle;
        this.coloringCircle_back.style.width = this.coloringCircle_back.size.x + "px";
        this.coloringCircle_back.style.height = this.coloringCircle_back.size.y + "px";
        this.coloringCircle_back.style.backgroundImage = 'url("' + this.imagesSrc.coloringCircle_back + '")';
        this.coloringCircle_back.style.backgroundSize = "100%, 100%";
        this.coloringCircle_back.style.position = "absolute";
        this.coloringCircle_back.pos = this.imagesPos.coloringCircle;
        this.coloringCircle_back.style[brprefix + "transform"] = "translate3d(" + this.coloringCircle_back.pos.x + "px, " + this.coloringCircle_back.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.coloringCircle_back, 1);

        this.coloringCircle_top.size = this.imagesSize.coloringCircle;
        this.coloringCircle_top.style.width = this.coloringCircle_top.size.x + "px";
        this.coloringCircle_top.style.height = this.coloringCircle_top.size.y + "px";
        this.coloringCircle_top.style.backgroundImage = 'url("' + this.imagesSrc.coloringCircle_top + '")';
        this.coloringCircle_top.style.backgroundSize = "100%, 100%";
        this.coloringCircle_top.style.position = "absolute";
        this.coloringCircle_top.pos = this.imagesPos.coloringCircle;
        this.coloringCircle_top.style[brprefix + "transform"] = "translate3d(" + this.coloringCircle_top.pos.x + "px, " + this.coloringCircle_top.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.coloringCircle_top, 3);

        this.coloringCircle_color.size = this.imagesSize.coloringCircle;
        this.coloringCircle_color.style.width = this.coloringCircle_color.size.x + "px";
        this.coloringCircle_color.style.height = this.coloringCircle_color.size.y + "px";
        this.coloringCircle_color.style.background = 'none';
        this.coloringCircle_color.style.position = "absolute";
        this.coloringCircle_color.pos = this.imagesPos.coloringCircle;
        this.coloringCircle_color.style[brprefix + "transform"] = "translate3d(" + this.coloringCircle_color.pos.x + "px, " + this.coloringCircle_color.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.coloringCircle_color, 2);

////////////
////////////////////////////////////////////////////////////////////
// WAVE
////////////////////////////////////////////////////////////////////
        this.vaweBack.size = this.imagesSize.vaweBack;
        this.vaweBack.style.width = this.vaweBack.size.x + "px";
        this.vaweBack.style.height = this.vaweBack.size.y + "px";
        this.vaweBack.style.backgroundImage = 'url("' + this.imagesSrc.vaweBack + '")';
        this.vaweBack.style.backgroundSize = this.vaweBack.style.width + " " + this.vaweBack.style.height;
        this.vaweBack.style.position = "absolute";
        this.vaweBack.pos = this.imagesPos.vaweBack;
        this.vaweBack.style[brprefix + "transform"] = "translate3d(" + this.vaweBack.pos.x + "px, " + this.vaweBack.pos.y + "px,0px)";
        // bradapter.applyZIndex(this.view, this.vaweBack, 2);
        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = this.vaweBack.childNodes[this.i];
            this.temp.size = this.imagesSize.vawe;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.backPos = 0;
            this.temp.style.backgroundSize = "auto 100%";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.vawe[this.i] + '")';
            this.temp.style.backgroundRepeat = "repeat-x";
            // this.temp.style.backgroundSize = this.temp.style.width + " " + this.temp.style.height;
            this.temp.style.position = "absolute";
            this.temp.style.display = 'none';
            this.temp.pos = this.imagesPos.vawe;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
            bradapter.applyZIndex(this.view, this.vawe, 2);
        }
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
        this.inited = true;
    };

    NarrColorsCar.prototype.updateColor = function () {
        this.colorCounter = 0;
        for (this.i = 0; this.i < this.activeColors.length; this.i++) {
            if (this.activeColors[this.i])
                this.colorCounter++;
        }

        this.resultColor = [0, 0, 0, 0];
        for (this.i = 0; this.i < this.activeColors.length; this.i++) {
            if (this.activeColors[this.i]) {
                for (this.k = 0; this.k < 4; this.k++) {
                    this.resultColor[this.k] += this.colors[this.i][this.k];
                }
            }
        }

        this.maxColor = 0;
        for (this.k = 0; this.k < 4; this.k++) {
            this.maxColor = Math.max(this.maxColor, this.resultColor[this.k]);
        }
        this.scaleK = 255 / this.maxColor;
        for (this.k = 0; this.k < 4; this.k++) {
            this.resultColor[this.k] *= this.scaleK;
        }

        if (this.commonState() === true)
            this.resultColor = [255, 255, 255, 0];

        this.coloringCar.style.background = 'rgba(' + ~~this.resultColor[0] + ',' + ~~this.resultColor[1] + ',' + ~~this.resultColor[2] + ',1)';
        this.coloringCircle_color.style.background = 'rgba(' + ~~this.resultColor[0] + ',' + ~~this.resultColor[1] + ',' + ~~this.resultColor[2] + ',1)';
    };

    NarrColorsCar.prototype.unload = function () {
        this.coloringCar.style.background = 'black';

        delete this.temp;
        delete this.coloringCar;
        delete this.coloringCarStroke;
        delete this.colorButtons;

        delete this.eyeModule;
        delete this.circles;
        delete this.lines;
        delete this.coloringCircle_back;
        delete this.coloringCircle_top;
        delete this.coloringCircle_color;

        delete this.vaweBack;
        delete this.vawe;
        delete this.deleteDomElements(this.view);

        this.activeColors = [0, 0, 0, 0, 0, 0, 0];
        this.inited = false;
    };

    NarrColorsCar.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrColorsCar.prototype.commonState = function (node) {
        this.colorCounter = 0;
        for (this.i = 0; this.i < this.activeColors.length; this.i++) {
            if (this.activeColors[this.i])
                this.colorCounter++;
        }

        if (this.colorCounter == this.activeColors.length)
            return true;
        if (this.colorCounter == 0)
            return false;
        else
            return undefined;
    }

    NarrColorsCar.prototype.loop = function (dt) { // необязательно
        if (!this.inited)
            return;

        dt = Math.min(50, dt);

        for (this.i = 0; this.i < 7; this.i++) {
            this.temp = this.vaweBack.childNodes[this.i];
            this.temp.backPos += dt * this.vaweSpeed;
            this.temp.style.backgroundPosition = this.temp.backPos + "px, 0px";
        }
    };


    NarrColorsCar.prototype.colorsCarEnd = function (e) {
        e.stopPropagation();

        if (this.needUpdate)
            return;

        this.eStart = this.getInternalCoordinatesForPoint(e);

        this.switchedColor = Math.floor((this.eStart.x - this.colorButtons.pos.x) / this.colorButtons.size.x * 7);
        this.activeColors[this.switchedColor] = !this.activeColors[this.switchedColor];

        this.coloringCircle_color.style.display = (this.commonState() === false) ? 'none' : 'block';

        this.circles.childNodes[this.switchedColor].style.display = this.activeColors[this.switchedColor] ? 'none' : 'block';
        this.vaweBack.childNodes[this.switchedColor].style.display = this.activeColors[this.switchedColor] ? 'block' : 'none';
        this.lines.childNodes[this.switchedColor].style.display = this.activeColors[this.switchedColor] ? 'block' : 'none';
        this.colorButtons.childNodes[this.switchedColor].style.backgroundPosition = "10px " + (-this.imagesSize.colorButtons.y * this.activeColors[this.switchedColor]) + "px";
        this.updateColor();

        return true;
    };

    NarrColorsCar.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrColorsCarTouch') {
            if (this.hittestForRect({pType: 0, left: this.colorButtons.pos.x, top: this.colorButtons.pos.y, width: this.colorButtons.size.x, height: this.colorButtons.size.y}, e)) {
                return true;
            }
        }
        else if (gesture == 'NarrColorsCarPan') {
            return true;
        }
        else
            return false;
    };


    Utils.addBehaviour('tap', 'NarrColorsCar', 'NarrColorsCarTouch', {
        end: function (e) {
            this.colorsCarEnd(e);
        }}, false);

    Utils.addBehaviour('pan', 'NarrColorsCar', 'NarrColorsCarPan', {
        start: function (e) {
            e.stopPropagation();
            return true;
        }, move: function (e) {
            e.stopPropagation();
        }, swipe: function (e) {
            e.stopPropagation();
            return false;
        }, end: function (e) {
            e.stopPropagation();
        }}, false);

    return NarrColorsCar;
});