define(["utils/Utils"], function (Utils) {
    var NarrMetro = Utils.newObjectType(NarrMetro, "NarrMetro", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrMetro.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;


        this.view.style.backgroundImage = 'url("' + this.imagesSrc.gameBackground + '")';
        this.view.style.backgroundSize = "100% 100%";

        this.eStart = {};
        this.e = {};

        this.manSpeedInit = 55 / 1000; // px/ms
        this.manSpeedKoef = [2, 3, 6.5, 8];
        this.tunnelBackSpeed = 800 / 1000; // px/ms
        this.frameCount = 4;
        this.manLightW = 100; //px
        this.exitBorder = 100;

        this.walkTime = 0;
        this.wagonCount = 3;

        this.trainInitInterval = [3200, 2900, 2600, 2200];
        this.trainTimer = this.trainInitInterval[0] * (0.75 + 0.5 * Math.random());
        this.gradOpacityT = 1000;
        this.backOpacityT = 1500;
        this.trainMovingT = 3000;
        this.trainCrossT = 600;


        this.doorEnterT = 500;
        this.doorStuffAnimT = 2400;
        // this.blinkFrames = [400,500,600,800,1000,1200,1400,1500,1800,2000,2800];
        this.blinkFrames = [400, 430, 560, 650, 730, 800, 870, 950, 1050, 1100, 2000, 2300];
        this.doorCorrectionT = 200;
        this.respawnT = 1000;
        this.fadeT = 600;

        this.gamePause = true;

        this.maxCrossCount = 100;

        this.gameState = 0;

        this.allThingsCount = 35;

        this.delegate.addEventListener("timer", this.loop, this);

        this.isNotInited = true;

        this.finalScreenState = 0;
        this.finalScreenTimer = 0;
        this.finalScreenAnimTime = 1500;

        this.fadeTimer = 0;
    };

    NarrMetro.prototype.load = function () {
        this.currentCityNum = 0;
        this.findedCount = 0;
        this.findedCountPerCity = [0, 0, 0, 0];
        // Запоминаем вещи найдены в порядке нахождения для каждого уровня
        this.findedThings = [
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
        ];

        this.loadLevel();

        this.fade = document.createElement('div');
        this.view.appendChild(this.fade);
        this.fade.size = this.imagesSize.fade;
        this.fade.style.width = "100%";
        this.fade.style.height = "100%";
        this.fade.style.background = '#000000';
        this.fade.style.position = "absolute";
        this.fade.style.opacity = 0.001;
        bradapter.applyZIndex(this.view, this.fade, 100);

        this.whatWeFind = document.createElement('div');
        this.view.appendChild(this.whatWeFind);
        for (this.i = 0; this.i < this.allThingsCount; this.i++) {
            this.temp = document.createElement('div');
            this.whatWeFind.appendChild(this.temp);
        }
////////////////////////////////////////////////////////////////////
// WHAT WE FING
////////////////////////////////////////////////////////////////////
        this.whatWeFind.size = this.imagesSize.whatWeFind;
        this.whatWeFind.style.width = this.whatWeFind.size.x + "px";
        this.whatWeFind.style.height = this.whatWeFind.size.y + "px";
        this.whatWeFind.style.position = "absolute";
        this.whatWeFind.pos = {x: this.imagesPos.whatWeFind.x - this.imagesSize.whatWeFindImg.x * this.findedCount, y: this.imagesPos.whatWeFind.y};
        bradapter.applyZIndex(this.view, this.whatWeFind, 2);
        this.whatWeFind.style[brprefix + "transform"] = "translate3d(" + this.whatWeFind.pos.x + "px, " + this.whatWeFind.pos.y + "px,0px)";
        for (this.i = 0; this.i < this.allThingsCount; this.i++) {
/////// thing in bottom slider
            this.temp = this.whatWeFind.childNodes[this.i];
            this.temp.size = this.imagesSize.whatWeFindImg;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";

            this.temp.style.backgroundSize = "auto 100%";
            this.temp.style.position = "absolute";
            this.temp.pos = {};
            this.temp.pos.x = this.imagesSize.whatWeFindImg.x * this.i;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + "0px,0px)";

            this.temp.style.opacity = 0.999;
            if (this.i > 3)
                this.temp.imgToHide = this.whatWeFind.childNodes[this.i - 4];
        }

        this.crossCount = 0;
        this.gamePause = false;
    };


    NarrMetro.prototype.unload = function () {
        delete this.fade;
        delete this.whatWeFind;
        delete this.temp;
        delete this.activeState;
        delete this.finalBackground;

        this.clearLevel();

        this.fullPause = true;
        this.gamePause = true;
        this.findedCount = 0;
        this.findedCountPerCity = [0, 0, 0, 0];
        this.gamePause = true;
        this.gameState = 0;

        this.trainTimer = this.trainInitInterval[0] * (0.75 + 0.5 * Math.random());

        this.isReturning = false;
        this.finalScreenState = 0;
    };

    NarrMetro.prototype.clearLevel = function () {
        delete this.btnBackward;
        delete this.btnDoor;
        delete this.btnForward;
        delete this.btnPause;
        delete this.tunnel;
        delete this.light;
        delete this.gradient;
        delete this.train;
        delete this.wagons;
        delete this.wagonLight;
        delete this.deadMan;
        delete this.firstWagon;

        delete this.ground;
        delete this.bottomBack;
        delete this.man;
        delete this.city;
        delete this.sky;

        delete this.crossesWrapper;
        delete this.doorLamp;
        delete this.doorLight;
        delete this.doorPic;

        this.deleteDomElements(this.view);

        this.trainTimer = this.trainInitInterval[this.currentCityNum] * (0.75 + 0.5 * Math.random());
    };

    NarrMetro.prototype.loadLevel = function () {
        this.btnBackward = document.createElement('div');
        this.btnDoor = document.createElement('div');
        this.btnForward = document.createElement('div');
        this.btnPause = document.createElement('div');
        this.tunnel = document.createElement('div');
        this.light = document.createElement('div');
        this.gradient = document.createElement('div');
        this.train = document.createElement('div');
        this.wagons = document.createElement('div');
        this.wagonLight = document.createElement('div');
        this.deadMan = document.createElement('div');
        this.firstWagon = document.createElement('div');

        this.ground = document.createElement('div');
        this.bottomBack = document.createElement('div');
        this.man = document.createElement('div');
        this.city = document.createElement('div');
        this.sky = document.createElement('div');

        this.crossesWrapper = document.createElement('div');

//////////////////////////////////////////////////////
        this.view.appendChild(this.btnBackward);
        this.view.appendChild(this.btnDoor);
        this.view.appendChild(this.btnForward);
        this.view.appendChild(this.btnPause);
        this.view.appendChild(this.tunnel);
        this.view.appendChild(this.city);
        this.view.appendChild(this.sky);
        this.view.appendChild(this.ground);
        this.view.appendChild(this.bottomBack);

        for (this.i = 0; this.i < this.imagesPos.doors_x[this.currentCityNum].length; this.i++) {
            this.temp = document.createElement('div');
            this.doorLamp = document.createElement('div');
            this.doorLight = document.createElement('div');
            this.doorPic = document.createElement('div');
            this.temp.appendChild(this.doorLamp);
            this.temp.appendChild(this.doorLight);
            this.temp.appendChild(this.doorPic);
            this.tunnel.appendChild(this.temp);
        }

        this.tunnel.appendChild(this.man);
        this.tunnel.appendChild(this.train);
        this.view.appendChild(this.light);
        this.view.appendChild(this.gradient);

        this.tunnel.appendChild(this.crossesWrapper);
        for (this.i = 0; this.i < this.maxCrossCount; this.i++) {
            this.temp = document.createElement('div');
            this.crossesWrapper.appendChild(this.temp);
        }

        // Wagons
        for (this.i = 0; this.i < this.wagonCount; this.i++) {
            this.temp = document.createElement('div');
            this.train.appendChild(this.temp);
        }
        this.train.appendChild(this.firstWagon);
        this.train.appendChild(this.wagonLight);
        this.train.appendChild(this.deadMan);

////////////////////////////////////////////////////////////////////
// BUTTONS
////////////////////////////////////////////////////////////////////
        this.btnBackward.size = this.imagesSize.button;
        this.btnBackward.style.width = this.btnBackward.size.x + "px";
        this.btnBackward.style.height = this.btnBackward.size.y + "px";
        // this.btnBackward.style.backgroundImage = 'url("' + this.imagesSrc.btnBackward + '")';
        this.btnBackward.style.backgroundSize = this.btnBackward.style.width + " " + this.btnBackward.style.height;
        this.btnBackward.style.position = "absolute";
        this.btnBackward.pos = this.imagesPos.btnBackward;
        this.btnBackward.style[brprefix + "transform"] = "translate3d(" + this.btnBackward.pos.x + "px, " + this.btnBackward.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.btnBackward, 2);
        this.btnBackward.btnAction = 1;


        this.btnDoor.size = this.imagesSize.button;
        this.btnDoor.style.width = this.btnDoor.size.x + "px";
        this.btnDoor.style.height = this.btnDoor.size.y + "px";
        // this.btnDoor.style.backgroundImage = 'url("' + this.imagesSrc.btnDoor + '")';
        this.btnDoor.style.backgroundSize = this.btnDoor.style.width + " " + this.btnDoor.style.height;
        this.btnDoor.style.position = "absolute";
        this.btnDoor.pos = this.imagesPos.btnDoor;
        this.btnDoor.style[brprefix + "transform"] = "translate3d(" + this.btnDoor.pos.x + "px, " + this.btnDoor.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.btnDoor, 2);
        this.btnDoor.btnAction = 2;

        this.btnForward.size = this.imagesSize.button;
        this.btnForward.style.width = this.btnForward.size.x + "px";
        this.btnForward.style.height = this.btnForward.size.y + "px";
        // this.btnForward.style.backgroundImage = 'url("' + this.imagesSrc.btnForward + '")';
        this.btnForward.style.backgroundSize = this.btnForward.style.width + " " + this.btnForward.style.height;
        this.btnForward.style.position = "absolute";
        this.btnForward.pos = this.imagesPos.btnForward;
        this.btnForward.style[brprefix + "transform"] = "translate3d(" + this.btnForward.pos.x + "px, " + this.btnForward.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.btnForward, 2);
        this.btnForward.btnAction = 0;

        this.btnPause.size = this.imagesSize.button;
        this.btnPause.style.width = this.btnPause.size.x + "px";
        this.btnPause.style.height = this.btnPause.size.y + "px";
        this.btnPause.style.backgroundImage = 'url("' + this.imagesSrc.btnPause + '")';
        this.btnPause.style.display = this.gamePause ? 'block' : 'none';

        this.btnPause.style.backgroundSize = "28px 29px";
        this.btnPause.style.backgroundPosition = "center";
        this.btnPause.style.position = "absolute";
        this.btnPause.pos = this.imagesPos.btnPause;
        this.btnPause.style[brprefix + "transform"] = "translate3d(" + this.btnPause.pos.x + "px, " + this.btnPause.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.btnPause, 2);
        this.btnPause.btnAction = 3;

////////////////////////////////////////////////////////////////////
// GAMEPLAY
////////////////////////////////////////////////////////////////////
        this.tunnel.size = this.imagesSize.tunnel[this.currentCityNum];
        this.tunnel.style.width = this.tunnel.size.x + "px";
        this.tunnel.style.height = this.tunnel.size.y + "px";
        // this.tunnel.style.backgroundImage = 'url("' + this.imagesSrc.tunnel + '")';
        this.tunnel.style.background = '#322211';
        this.tunnel.style.backgroundSize = this.tunnel.style.width + " " + this.tunnel.style.height;
        this.tunnel.style.position = "absolute";
        if (this.isReturning)
            this.tunnel.pos = {x: this.moduleSize.x - this.tunnel.size.x, y: this.imagesPos.tunnel.y};
        else
            this.tunnel.pos = {x: this.imagesPos.tunnel.x, y: this.imagesPos.tunnel.y};
        this.tunnel.style[brprefix + "transform"] = "translate3d(" + this.tunnel.pos.x + "px, " + this.tunnel.pos.y + "px,0px)";
        this.tunnel.style.overflow = "visible";
        bradapter.applyZIndex(this.view, this.tunnel, 5);

        this.gradient.size = this.imagesSize.gradient;
        this.gradient.style.width = this.gradient.size.x + "px";
        this.gradient.style.height = this.gradient.size.y + "px";
        this.gradient.style.backgroundImage = 'url("' + this.imagesSrc.gradient + '")';
        this.gradient.style.backgroundSize = this.gradient.style.width + " " + this.gradient.style.height;
        this.gradient.pos = this.imagesPos.tunnel;
        this.gradient.style[brprefix + "transform"] = "translate3d(" + this.gradient.pos.x + "px, " + this.gradient.pos.y + "px,0px)";
        this.gradient.style.position = "absolute";
        this.gradient.style.opacity = 0.001;
        bradapter.applyZIndex(this.view, this.gradient, 6);

        this.light.size = this.imagesSize.gradient;
        this.light.style.width = this.light.size.x + "px";
        this.light.style.height = this.light.size.y + "px";
        this.light.style.background = '#ffffff';//'#f4d892';
        this.light.style.backgroundSize = this.light.style.width + " " + this.light.style.height;
        this.light.pos = this.imagesPos.tunnel;
        this.light.style[brprefix + "transform"] = "translate3d(" + this.light.pos.x + "px, " + this.light.pos.y + "px,0px)";
        this.light.style.position = "absolute";
        this.light.style.opacity = 0.001;
        bradapter.applyZIndex(this.view, this.light, 7);

        this.ground.size = this.imagesSize.ground;
        this.ground.style.width = this.ground.size.x + "px";
        this.ground.style.height = this.ground.size.y + "px";
        this.ground.style.backgroundSize = "auto 100%";
        this.ground.style.backgroundImage = 'url("' + this.imagesSrc.ground + '")';
        this.ground.style.backgroundRepeat = "repeat-x";
        this.ground.style.position = "absolute";
        this.ground.pos = this.imagesPos.ground;
        this.ground.style[brprefix + "transform"] = "translate3d(" + this.ground.pos.x + "px, " + this.ground.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.ground, 3);

        this.bottomBack.size = this.imagesSize.bottomBack;
        this.bottomBack.style.width = this.bottomBack.size.x + "px";
        this.bottomBack.style.height = this.bottomBack.size.y + "px";
        this.bottomBack.style.backgroundImage = 'url("' + this.imagesSrc.bottomBack + '")';
        this.bottomBack.style.backgroundSize = this.bottomBack.style.width + " " + this.bottomBack.style.height;
        this.bottomBack.style.position = "absolute";
        this.bottomBack.pos = this.imagesPos.bottomBack;
        this.bottomBack.style[brprefix + "transform"] = "translate3d(" + this.bottomBack.pos.x + "px, " + this.bottomBack.pos.y + "px,0px)";

        this.city.size = this.imagesSize.city;
        this.city.style.width = this.city.size.x + "px";
        this.city.style.height = this.city.size.y + "px";
        this.city.style.backgroundImage = 'url("' + this.imagesSrc.city[this.currentCityNum] + '")';
        this.city.style.backgroundSize = this.city.style.width + " " + this.city.style.height;
        this.city.style.position = "absolute";
        if (this.isReturning)
            this.city.pos = {x: this.moduleSize.x - this.city.size.x, y: this.imagesPos.city.y};
        else
            this.city.pos = {x: this.tunnel.pos.x, y: this.imagesPos.city.y};
        this.city.style[brprefix + "transform"] = "translate3d(" + this.city.pos.x + "px, " + this.city.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.city, 4);

        this.sky.size = this.imagesSize.sky;
        this.sky.style.width = this.sky.size.x + "px";
        this.sky.style.height = this.sky.size.y + "px";
        this.sky.style.backgroundImage = 'url("' + this.imagesSrc.sky[this.currentCityNum] + '")';
        this.sky.style.backgroundSize = this.sky.style.width + " " + this.sky.style.height;
        this.sky.style.position = "absolute";
        if (this.isReturning)
            this.sky.pos = {x: this.moduleSize.x - this.sky.size.x, y: this.imagesPos.sky.y};
        else
            this.sky.pos = {x: this.tunnel.pos.x, y: this.imagesPos.sky.y};
        this.sky.style[brprefix + "transform"] = "translate3d(" + this.sky.pos.x + "px, " + this.sky.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.sky, 2);

        this.man.size = this.imagesSize.man;
        this.man.style.width = this.man.size.x + "px";
        this.man.style.height = this.man.size.y + "px";
        this.man.style.backgroundImage = 'url("' + this.imagesSrc.man + '")';
        this.man.style.backgroundSize = this.man.size.x + "px, " + this.man.size.y * 8 + "px";
        this.man.style.position = "absolute";
        this.man.style.opacity = 0.999;
        if (this.isReturning) {
            this.man.pos = {x: this.tunnel.size.x - this.man.size.x, y: this.imagesPos.manStartEnd.y};
            this.man.style.backgroundPosition = "0px " + (-this.man.size.y * this.frameCount) + "px";
        }
        else {
            this.man.pos = {x: 0, y: this.imagesPos.manStart.y};
            this.man.style.backgroundPosition = "0px " + 0/*(-this.man.size.y)*/ + "px";
        }
        this.man.scaledPos = {};
        this.man.style[brprefix + "transform"] = "translate3d(" + this.man.pos.x + "px, " + this.man.pos.y + "px,0px)";
        bradapter.applyZIndex(this.man, this.view, 2);
        this.man.moveSign = 0;


////////////////////////////////////////////////////////////////////
// TRAIN
////////////////////////////////////////////////////////////////////
        this.train.size = {x: this.imagesSize.wagon[this.currentCityNum].x * this.wagonCount + this.imagesSize.firstWagon[this.currentCityNum].x + this.imagesSize.wagonLight.x, y: this.imagesSize.tunnel[0].y};
        this.train.style.width = this.train.size.x + "px";
        this.train.style.height = this.train.size.y + "px";
        this.train.style.position = "absolute";
        this.train.pos = {};
        this.train.pos.y = this.tunnel.size.y - this.train.size.y;
        this.train.pos.x = -this.train.size.x;
        this.train.style[brprefix + "transform"] = "translate3d(" + this.train.pos.x + "px, " + this.train.pos.y + "px,0px)";
        this.train.state = 0;

        for (this.i = 0; this.i < this.wagonCount; this.i++) {
            this.temp = this.train.childNodes[this.i];
            this.temp.size = {x: this.imagesSize.wagon[this.currentCityNum].x, y: this.imagesSize.tunnel[0].y};
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.wagon[this.currentCityNum] + '")';
            this.temp.style.backgroundSize = "100% auto";
            this.temp.style.backgroundPosition = "bottom";
            this.temp.style.position = "absolute";
            this.temp.pos = {};
            this.temp.pos.x = this.imagesSize.wagon[this.currentCityNum].x * this.i;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + "0px,0px)";
        }

        this.firstWagon = this.train.childNodes[this.wagonCount]; // children is all wagons + firstWagon
        this.firstWagon.size = this.imagesSize.firstWagon[this.currentCityNum];
        this.firstWagon.style.width = this.firstWagon.size.x + "px";
        this.firstWagon.style.height = this.train.style.height;
        this.firstWagon.style.backgroundImage = 'url("' + this.imagesSrc.firstWagon[this.currentCityNum] + '")';
        this.firstWagon.style.backgroundSize = "100% auto";
        this.firstWagon.style.position = "absolute";
        this.firstWagon.style.backgroundPosition = "bottom";
        this.firstWagon.pos = {};
        this.firstWagon.pos.x = this.imagesSize.wagon[this.currentCityNum].x * this.wagonCount;
        this.firstWagon.style[brprefix + "transform"] = "translate3d(" + this.firstWagon.pos.x + "px, " + "0px,0px)";

        this.wagonLight = this.train.childNodes[this.wagonCount + 1]; // children is all wagons + wagonLight
        this.wagonLight.size = this.imagesSize.wagonLight;
        this.wagonLight.style.width = this.wagonLight.size.x + "px";
        this.wagonLight.style.height = this.wagonLight.size.y + "px";
        this.wagonLight.style.backgroundImage = 'url("' + this.imagesSrc.wagonLight + '")';
        this.wagonLight.style.backgroundSize = "auto 100%";
        this.wagonLight.style.position = "absolute";
        this.wagonLight.pos = {};
        this.wagonLight.pos.x = this.imagesSize.wagon[this.currentCityNum].x * this.wagonCount + this.imagesSize.firstWagon[this.currentCityNum].x;
        this.wagonLight.style[brprefix + "transform"] = "translate3d(" + this.wagonLight.pos.x + "px, " + "0px,0px)";

        this.deadMan = this.train.childNodes[this.wagonCount + 2]; // children is all wagons + deadMan
        this.deadMan.size = this.imagesSize.deadMan;
        this.deadMan.style.width = this.deadMan.size.x + "px";
        this.deadMan.style.height = this.deadMan.size.y + "px";
        this.deadMan.style.backgroundImage = 'url("' + this.imagesSrc.deadMan + '")';
        this.deadMan.style.backgroundSize = "auto 100%";
        this.deadMan.style.position = "absolute";
        this.deadMan.pos = {x: this.imagesSize.wagon[this.currentCityNum].x * this.wagonCount + this.imagesSize.firstWagon[this.currentCityNum].x - 30, y: 50};
        this.deadMan.style[brprefix + "transform"] = "translate3d(" + this.deadMan.pos.x + "px, " + this.deadMan.pos.y + "px,0px)";
        this.deadMan.style.display = 'none';

////////////////////////////////////////////////////////////////////
// CROSSES
////////////////////////////////////////////////////////////////////
        this.crossesWrapper.style.width = 100 + "%";
        this.crossesWrapper.style.height = 100 + "%";
        this.crossesWrapper.style.position = "absolute";
        this.crossesWrapper.style.overflow = "visible";
        for (this.i = 0; this.i < this.maxCrossCount; this.i++) {
            this.temp = this.crossesWrapper.childNodes[this.i];
            this.temp.size = this.imagesSize.cross;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.cross + '")';
            this.temp.style.backgroundSize = this.temp.style.width + " " + this.temp.style.height;
            this.temp.style.position = "absolute";
            this.temp.style.display = "none";
            this.temp.pos = {};
            this.temp.pos.y = -this.temp.size.y;
        }

////////////////////////////////////////////////////////////////////
// DOORS
////////////////////////////////////////////////////////////////////
        for (this.i = this.imagesPos.doors_x[this.currentCityNum].length - 1; this.i >= 0; this.i--) {
            this.doorState = this.checkDoor(this.i, this.currentCityNum);

            this.temp = this.tunnel.childNodes[this.i];
            this.temp.size = this.imagesSize.doorClosed;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.doorClosed + '")';
            this.temp.style.backgroundSize = "auto 100%";
            this.temp.style.position = "absolute";
            this.temp.pos = {};
            this.temp.pos.x = this.imagesPos.doors_x[this.currentCityNum][this.i] * this.tunnel.size.x / 100;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.imagesPos.doors_y + "px,0px)";
            this.temp.style.overflow = "visible";
            this.temp.activated = this.doorState;
            // this.temp.finded = this.whatWeFind.childNodes[this.i];
            this.temp.num = this.i;

            this.temp = this.tunnel.childNodes[this.i].childNodes[0];
            this.temp.size = this.imagesSize.doorLight;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.doorLight + '")';
            this.temp.style.backgroundPosition = -this.temp.size.x + "px 0px";
            this.temp.style.backgroundSize = "200% 100%";
            this.temp.style.position = "absolute";
            this.temp.style.opacity = 0.999;
            this.temp.pos = this.imagesPos.doorLight;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
            bradapter.applyZIndex(this.view, this.temp, 2);

            this.temp = this.tunnel.childNodes[this.i].childNodes[1];
            this.temp.size = this.imagesSize.doorPic;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.doorPic[this.currentCityNum][this.i] + '")';
            this.temp.style.backgroundSize = this.doorState ? (80 + "% auto") : (0 + "% auto");
            this.temp.style.opacity = 0.35;
            this.temp.style.backgroundPosition = "center";
            this.temp.style.position = "absolute";
            this.temp.pos = this.imagesPos.doorPic;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";

            this.temp = this.tunnel.childNodes[this.i].childNodes[2];
            this.temp.size = this.imagesSize.doorLamp;
            this.temp.style.width = this.temp.size.x + "px";
            this.temp.style.height = this.temp.size.y + "px";
            this.temp.style.backgroundImage = 'url("' + this.imagesSrc.doorLamp + '")';
            this.temp.style.backgroundSize = "100% 100%";
            this.temp.style.position = "absolute";
            this.temp.pos = this.imagesPos.doorLamp;
            this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
        }


        this.manSpeed = this.manSpeedInit * this.manSpeedKoef[this.currentCityNum];

        this.isNotInited = false;
        this.isOnFinalScreen = false;

        this.canGo = true;
    };


    NarrMetro.prototype.draw = function () { // необязательно
        // this.fullPause = 0; // comment for release
        this.switchPause(this.fullPause);
    };

    NarrMetro.prototype.checkDoor = function (doorN, cityN) {
        for (this.j = 0; this.j < 8; this.j++) {
            if (this.findedThings[cityN][this.j] == doorN)
                return true;
        }
        return false;
    };

    NarrMetro.prototype.loadNextLevel = function () {
        this.isReturning = false;
        this.currentCityNum++;
        this.clearLevel();
        if (this.currentCityNum == 4) {
            this.loadFinalScreen();
            this.finalScreenTimer = this.fadeT * 1.3;
            this.finalScreenState = 1;
            return;
        }
        this.loadLevel();
    };

    NarrMetro.prototype.loadPrevLevel = function () {
        this.isReturning = true;
        this.currentCityNum--;
        this.clearLevel();
        if (this.currentCityNum < 0) this.currentCityNum = 0;
        this.loadLevel();
    };

    NarrMetro.prototype.loadFinalScreen = function () {
        this.whatWeFind.style.display = 'none';

        this.isOnFinalScreen = true;

        this.finalBackground = document.createElement('div');
        this.view.appendChild(this.finalBackground);

        this.finalBackground.style.width = this.moduleSize.x + "px";
        this.finalBackground.style.height = this.moduleSize.y + "px";
        this.finalBackground.style.backgroundImage = 'url("' + this.imagesSrc.finalBackground + '")';
        this.finalBackground.style.backgroundSize = "100% 100%";
        this.finalBackground.style.position = "absolute";

        this.finalThingsCount = 0;
        this.finalFindedThingsCount = 0;
        this.finalFindedImagesList = [];

        for (this.i = 0; this.i < 4; this.i++) {
            for (this.j = 0; this.j < this.imagesPos.doors_x[this.i].length; this.j++) {
                this.temp = document.createElement('div');
                this.temp.size = this.imagesSize.finalImages;
                this.temp.style.width = this.temp.size.x + "px";
                this.temp.style.height = this.temp.size.y + "px";
                this.temp.style.backgroundImage = 'url("' + this.imagesSrc.whatWeFindImg[this.i][this.j] + '")';
                this.temp.style.backgroundSize = "auto 100%";
                this.temp.style.backgroundPosition = "center";
                this.temp.style.position = "absolute";
                this.temp.style.display = 'none';
                this.temp.pos = {x: this.imagesPos.finalImages.x + this.imagesSize.finalImagesRow.x / 8 * (this.finalThingsCount % 8), y: this.imagesPos.finalImages.y + this.imagesSize.finalImagesRow.y * (Math.floor(this.finalThingsCount / 8))};
                this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
                this.activeState = this.temp;


                this.temp = document.createElement('div');
                this.temp.size = this.imagesSize.finalImages;
                this.temp.style.width = this.temp.size.x + "px";
                this.temp.style.height = this.temp.size.y + "px";
                this.temp.style.backgroundImage = 'url("' + this.imagesSrc.whatWeFindImgGray[this.i][this.j] + '")';
                this.temp.activeState = this.activeState;
                this.temp.style.backgroundSize = "auto 100%";
                this.temp.style.backgroundPosition = "center";
                this.temp.style.position = "absolute";
                this.temp.pos = {x: this.imagesPos.finalImages.x + this.imagesSize.finalImagesRow.x / 8 * (this.finalThingsCount % 8), y: this.imagesPos.finalImages.y + this.imagesSize.finalImagesRow.y * (Math.floor(this.finalThingsCount / 8))};
                this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";


                if (this.findedThings[this.i][this.j]) {
                    this.finalFindedImagesList[this.finalFindedThingsCount++] = this.temp;
                }

                if (this.finalThingsCount == 32)
                    break;

                // this.finalImagesList[] = this.temp;

                this.finalThingsCount++;
                this.view.appendChild(this.activeState);
                this.view.appendChild(this.temp);
            }
        }
    };

    NarrMetro.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            if (node.childNodes[i] != this.fade && node.childNodes[i] != this.whatWeFind) {
                this.deleteDomElements(node.childNodes[i]);
                node.removeChild(node.childNodes[i]);
            }
        }
    }

    NarrMetro.prototype.loop = function (dt) {
        dt = Math.min(dt, 100);

        this.updateFinalScreen(dt);
        this.processFade(dt);

        if (this.gamePause || this.fullPause || this.isNotInited)
            return;

        if (!this.isOnFinalScreen) {
            this.processManMoving(dt);
            this.updateTrain(dt);
        }
        this.processGameAnimations(dt);

    };
// NarrMetro.prototype.draw = function () { // необязательно
// };


    NarrMetro.prototype.processManMoving = function (dt) {
        if (this.man.moveSign && this.canGo) {
            this.walkTime += dt;

            this.man.pos.x += Math.round(this.manSpeed * dt * this.man.moveSign);
            this.man.pos.x = Math.min(Math.max(this.man.pos.x, 0 - this.manLightW + this.exitBorder), this.tunnel.size.x - this.man.size.x + this.manLightW - this.exitBorder);
            this.man.style[brprefix + "transform"] = "translate3d(" + this.man.pos.x + "px, " + this.man.pos.y + "px,0px)";

            if ((this.man.pos.x == this.tunnel.size.x - this.man.size.x + this.manLightW - this.exitBorder) /*&& (this.currentCityNum != 3)*/) {
                this.canGo = false;
                this.doorTimer = this.fadeT;
                this.man.style.backgroundImage = 'url("' + this.imagesSrc.man2 + '")';
                this.gameState = 21;
                return;
            }
            if ((this.man.pos.x == 0 - this.manLightW + this.exitBorder) && (this.currentCityNum != 0)) {
                this.canGo = false;
                this.doorTimer = this.fadeT;
                this.man.style.backgroundImage = 'url("' + this.imagesSrc.man2 + '")';
                this.gameState = 22
                ;
                return;
            }

            if (this.man.moveSign > 0)
                this.tunnel.pos.x = Math.max(this.moduleSize.x - this.tunnel.size.x, Math.min(this.tunnel.pos.x, (this.moduleSize.x - this.man.size.x) / 2 - this.man.pos.x));
            else
                this.tunnel.pos.x = Math.min(0, Math.max(this.tunnel.pos.x, (this.moduleSize.x - this.man.size.x) / 2 - this.man.pos.x));


            this.tunnel.style[brprefix + "transform"] = "translate3d(" + this.tunnel.pos.x + "px, " + this.tunnel.pos.y + "px,0px)";
            // this.ground.style.backgroundPosition = this.tunnel.pos.x +  "px 0px";

            this.tunnelOffset = this.tunnel.pos.x / (this.tunnel.size.x - this.moduleSize.x);
            this.city.pos.x = this.tunnelOffset * (this.city.size.x - this.moduleSize.x);
            this.city.style[brprefix + "transform"] = "translate3d(" + this.city.pos.x + "px, " + this.city.pos.y + "px,0px)";

            this.sky.pos.x = this.tunnelOffset * (this.sky.size.x - this.moduleSize.x);
            this.sky.style[brprefix + "transform"] = "translate3d(" + this.sky.pos.x + "px, " + this.sky.pos.y + "px,0px)";

            // this.fullStepCycle = 80; // px
            // this.frameNum = Math.floor(this.man.pos.x % this.fullStepCycle / (this.fullStepCycle/this.frameCount));
            this.fullStepCycle = 1000; // ms
            this.oneStep = this.fullStepCycle / this.frameCount;
            this.frameNum = Math.floor(((this.walkTime + this.oneStep) % this.fullStepCycle) / (this.oneStep));
            if (this.man.moveSign > 0)
                ;
            else
                this.frameNum += this.frameCount;

            this.man.style.backgroundPosition = "0px " + (-this.man.size.y * this.frameNum) + "px";
        }
    };

    NarrMetro.prototype.processGameAnimations = function (dt) {

        this.doorTimer -= dt;
        switch (this.gameState) {
            case 0:
                break;
            case 1:
                for (this.i = 0; this.i < this.imagesPos.doors_x[this.currentCityNum].length; this.i++) {
                    this.temp = this.tunnel.childNodes[this.i];
                    if ((this.temp.pos.x - this.man.pos.x) > 50 && (this.temp.pos.x - this.man.pos.x) < 110) {
                        this.curDoor = this.temp

                        // this.curDoor.style.backgroundImage = 'url("' + this.imagesSrc.doorOpen + '")';
                        this.curDoor.style.backgroundPosition = -this.curDoor.size.x + "px 0px";
                        this.doorTimer = this.doorCorrectionT;
                        this.canGo = false;
                        this.gameState = 2;
                        return;
                    }
                }
                this.gameState = 0;
                break;
            case 2:
                if (this.doorTimer < 0) {
                    this.doorTimer = this.doorEnterT;
                    this.gameState = 3;
                }
                break;
            case 3:
                if (this.doorTimer < 0) {
                    this.doorTimer = this.doorStuffAnimT;
                    this.man.style.opacity = 0.001;
                    this.curDoor.style.backgroundPosition = "0px 0px";
                    this.curDoor.childNodes[0].style.opacity = 0.4;
                    this.gameState = 4;
                }
                else {
                    this.man.style.opacity = Math.sqrt((Math.max(0.001, Math.min(this.doorTimer / this.doorEnterT * 2 - 1, 0.998))));
                }
                break;
            case 4:
                if (this.doorTimer < 0) {
                    this.temp.activated = true;
                    this.gameState = 5;
                }
                else {
                    if (this.temp.activated) {
                        this.gameState = 5;
                        break;
                    }
                    this.processBlinking(this.doorTimer);
                }
                break;
            case 5:
                break;
            case 6:
                // this.curDoor.style.backgroundImage = 'url("' + this.imagesSrc.doorOpen + '")';
                this.curDoor.style.backgroundPosition = -this.curDoor.size.x + "px 0px";
                this.doorTimer = this.doorEnterT;
                this.gameState = 7;
                break;
            case 7:
                if (this.doorTimer < 0) {
                    this.doorTimer = this.doorEnterT;
                    this.gameState = 8;
                }
                break;
            case 8:
                if (this.doorTimer < 0) {
                    this.man.style.opacity = 0.999;
                    // this.curDoor.style.backgroundImage = 'url("' + this.imagesSrc.doorClosed + '")';
                    this.curDoor.style.backgroundPosition = "0px 0px";
                    // this.curDoor.childNodes[0].style.backgroundImage = 'url("' + this.imagesSrc.doorLamp[0] + '")';
                    this.gameState = 9;
                }
                else {
                    this.man.style.opacity = 1 - Math.sqrt((Math.max(0.001, Math.min(this.doorTimer / this.doorEnterT * 2 - 1, 0.998))));
                    // this.scaleMan( 1 - 0.03*(1 - this.doorTimer/this.doorEnterT) ); // отладить (дрожжит при смещении). можно и так остваить
                }
                break;
            case 9:
                this.canGo = true;
                this.gameState = 0;
                break;
            case 10:

                break;
            case 20: //RESPAWN
                if (this.doorTimer < 0) {
                    this.man.style.opacity = 0.999;
                    this.gameState = 0;
                    this.canGo = true;
                }
                else {
                    this.man.style.opacity = 1 - Math.sqrt((Math.max(0.001, Math.min(this.doorTimer / this.doorEnterT * 2 - 1, 0.998))));
                }
                break;

            case 21: //NEXT LEVEL (RIGHT SCREEN BORDER)
                this.walkTime += dt;

                this.man.pos.x += Math.round(this.manSpeed / 2 * dt);
                this.manVisibleWidth = 70;
                this.rightBorder = this.tunnel.size.x - this.man.size.x + this.manLightW + this.manVisibleWidth;
                this.man.pos.x = Math.min(this.man.pos.x, this.rightBorder);
                if (this.man.pos.x == this.rightBorder) {
                    this.fadeTimer = this.fadeT;
                    this.gameState = 23;
                }
                else {
                    this.man.style[brprefix + "transform"] = "translate3d(" + this.man.pos.x + "px, " + this.man.pos.y + "px,0px)";
                    this.fullStepCycle = 1000; // ms
                    this.oneStep = this.fullStepCycle / this.frameCount;
                    this.frameNum = Math.floor(((this.walkTime + this.oneStep) % this.fullStepCycle) / (this.oneStep));
                    this.man.style.backgroundPosition = "0px " + (-this.man.size.y * this.frameNum) + "px";
                }
                break;
            case 22: //PREV LEVEL (LEFT SCREEN BORDER)
                this.walkTime += dt;

                this.man.pos.x -= Math.round(this.manSpeed / 2 * dt);
                this.manVisibleWidth = 70;
                this.leftBorder = -this.manLightW - this.manVisibleWidth;
                this.man.pos.x = Math.max(this.man.pos.x, this.leftBorder);
                if (this.man.pos.x == this.leftBorder) {
                    this.fadeTimer = this.fadeT;
                    this.gameState = 23;
                }
                else {
                    this.man.style[brprefix + "transform"] = "translate3d(" + this.man.pos.x + "px, " + this.man.pos.y + "px,0px)";
                    this.fullStepCycle = 1000; // ms
                    this.oneStep = this.fullStepCycle / this.frameCount;
                    this.frameNum = Math.floor(((this.walkTime + this.oneStep) % this.fullStepCycle) / (this.oneStep));
                    this.frameNum += this.frameCount;
                    this.man.style.backgroundPosition = "0px " + (-this.man.size.y * this.frameNum) + "px";
                }
                break;
        }
        return;

    };

    NarrMetro.prototype.processFade = function (dt) {
        this.fadeTimer -= dt;
        switch (this.gameState) {
            case 23: //FADE IN
                if (this.fadeTimer < 0) {
                    this.man.style.opacity = 0.999;
                    if (this.man.pos.x > 0)
                        this.loadNextLevel();
                    else
                        this.loadPrevLevel();
                    this.gameState = 24;
                    this.fadeTimer = this.fadeT;
                }
                else {
                    this.fadeProgress = 1 - Math.max(0.001, Math.min(this.fadeTimer / this.fadeT, 0.998));
                    this.fade.style.opacity = Math.min(2 * /*Math.sqrt*/(this.fadeProgress), 0.999);
                }
                break;
            case 24: //FADE OUT
                if (this.fadeTimer < 0) {
                    this.fade.style.opacity = 0.001;
                    this.gameState = 0;
                    this.canGo = true;

                    if (this.isOnFinalScreen)
                        this.gamePause = true;
                }
                else {
                    this.fadeProgress = Math.max(0.001, Math.min(this.fadeTimer / this.fadeT, 0.998));
                    this.fade.style.opacity = Math.min(2 * /*Math.sqrt*/(this.fadeProgress), 0.999);
                }
                break;
            default:
                break;
        }
        return;
    };

    NarrMetro.prototype.updateFinalScreen = function (dt) {
        this.finalScreenTimer -= dt;
        switch (this.finalScreenState) {
            case 0:
                break;
            case 1:
                if (this.finalScreenTimer < 0) {
                    this.finalScreenState = 2;
                    this.finalScreenTimer = 2000;
                    this.finalImgAnimT = 0;

                    this.delegate.fireEvent("performAnimation", [this.prize1]);
                }
                break;
            case 2:
                this.finalImgAnimT -= dt;
                if (this.finalImgAnimT < 0) {
                    this.finalImgAnimT = 150;
                    if (this.finalFindedImagesList.length) {
                        this.randomNum = Math.floor(this.finalFindedImagesList.length * Math.random());
                        this.imgToReplace = this.finalFindedImagesList.splice(this.randomNum, 1)[0];
                        this.imgToReplace.style.display = 'none';
                        this.imgToReplace.activeState.style.display = 'block';
                    }
                    else {
                        this.finalScreenState = 3;
                        this.fullPause = this.gamePause = true;
                        break;
                    }
                }
                break;
            default:
                break;
        }
        return;
    }

    NarrMetro.prototype.processBlinking = function (timeLeft) {
        if (timeLeft > this.doorStuffAnimT - this.blinkFrames[0])
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[1])
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[2])
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[3])
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[4])
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[5])
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[6])
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[7])
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[8])
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[9]) {
            this.curDoor.childNodes[0].style.opacity = 0.999;
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";

            this.curDoor.childNodes[1].style.opacity = 0.999;
            this.curDoor.childNodes[1].style.backgroundSize = (80) + "% auto";
        }
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[10]) {
            this.blinkProgress = (timeLeft - (this.doorStuffAnimT - this.blinkFrames[10])) / (this.blinkFrames[10] - this.blinkFrames[9]);
            this.blinkProgress *= this.blinkProgress;
            this.curDoor.childNodes[0].style.opacity = Math.max(0.001, Math.min(0.999, this.blinkProgress));
            this.curDoor.childNodes[0].style.backgroundPosition = 0 + "px 0px";
        }
        else if (timeLeft > this.doorStuffAnimT - this.blinkFrames[11]) {
            this.blinkProgress = 1 - (timeLeft - (this.doorStuffAnimT - this.blinkFrames[11])) / (this.blinkFrames[11] - this.blinkFrames[10]);
            // this.blinkProgress *= this.blinkProgress;
            this.curDoor.childNodes[0].style.opacity = 0.999;
            this.curDoor.childNodes[0].style.backgroundPosition = -this.curDoor.childNodes[0].size.x + "px 0px";

            this.curDoor.childNodes[1].style.opacity = 0.999 - this.blinkProgress * 0.65;

            this.whatWeFind.childNodes[this.findedCount].style.display = 'block';
            this.whatWeFind.childNodes[this.findedCount].style.opacity = Math.min(0.999, this.blinkProgress * this.blinkProgress);
            this.whatWeFind.childNodes[this.findedCount].style.backgroundImage = 'url("' + this.imagesSrc.whatWeFindImg[this.currentCityNum][this.curDoor.num] + '")';

            if (this.whatWeFind.childNodes[this.findedCount].imgToHide)
                this.whatWeFind.childNodes[this.findedCount].imgToHide.style.display = 'none';


            this.whatWeFind.style[brprefix + "transform"] = "translate3d(" + (this.whatWeFind.pos.x - this.blinkProgress * this.imagesSize.whatWeFindImg.x) + "px, " + this.whatWeFind.pos.y + "px,0px)";

            this.finished = true;
            // this.curDoor.childNodes[0].style.opacity = Math.max(0.001, Math.min(0.999, this.blinkProgress));
            // this.curDoor.childNodes[0].style.backgroundPosition =  0 + "px 0px";
        }
        else {
            if (this.finished) {
                this.finished = false;
                this.findedThings[this.currentCityNum][this.curDoor.num] = true;
                this.whatWeFind.childNodes[this.findedCount].style.opacity = 0.999;
                this.whatWeFind.pos.x -= this.imagesSize.whatWeFindImg.x;

                this.findedCount++;
                this.findedCountPerCity[this.currentCityNum]++;
                // this.whatWeFind.style[brprefix + "transform"] = "translate3d(" + this.whatWeFind.pos.x + "px, " + this.whatWeFind.pos.y + "px,0px)";
                this.curDoor.childNodes[1].style.opacity = 0.35;
            }
        }
    }

    NarrMetro.prototype.updateTrain = function (dt) {
        this.trainTimer -= dt;
        switch (this.train.state) {
            case 0:
                if (this.trainTimer < 0) {
                    this.train.state = 1;
                    // this.trainTimer = this.trainInitInterval[this.currentCityNum] * (0.8 + 0.4*Math.random());
                    this.trainTimer = this.gradOpacityT;
                }
                break;
            case 1:
                if (this.trainTimer < 0) {
                    this.train.state = 2;
                    this.trainTimer = this.backOpacityT;
                }
                else {
                    this.gradient.style.opacity = (0.999 - Math.min(this.trainTimer / this.gradOpacityT, 0.998)) * 0.3;
                }
                break;
            case 2:
                if (this.trainTimer < 0) {
                    this.train.state = 3;
                    this.trainTimer = this.trainMovingT;
                    this.train.pos.x = -this.train.size.x - this.tunnel.pos.x;
                }
                else {
                    this.light.style.opacity = (0.999 - Math.min(this.trainTimer / this.backOpacityT, 0.998)) * 0.3;
                    this.deadMan.style.display = 'none';
                }
                break;
            case 3:
                if (this.trainTimer < 0) {
                    if (this.gameState == -1) {
                        this.trainTimer = this.trainCrossT;
                        this.train.state = 4;
                    }
                    else {
                        this.trainTimer = this.trainInitInterval[this.currentCityNum] * (0.75 + 0.5 * Math.random());
                        this.train.state = 0;
                    }


                    this.gradient.style.opacity = 0.001;
                    this.light.style.opacity = 0.001;
                    this.train.pos.x = -this.train.size.x;
                    this.train.style[brprefix + "transform"] = "translate3d(" + this.train.pos.x + "px, " + this.train.pos.y + "px,0px)";

                }
                else {
                    this.train.pos.x = -this.train.size.x + (1 - this.trainTimer / this.trainMovingT) * (this.train.size.x + this.moduleSize.x * 1.5) - this.tunnel.pos.x;
                    this.tempProgress = 0.001 + Math.min(this.trainTimer / this.trainMovingT, 0.998);
                    this.gradient.style.opacity = this.tempProgress * this.tempProgress * this.tempProgress * 0.5;
                    this.light.style.opacity = this.tempProgress * this.tempProgress * this.tempProgress * 0.5;

                    this.deadMan.style.backgroundPosition = ( (~~this.trainTimer % 300 > 150) ? 0 : -this.imagesSize.deadMan.x) + "px 0px";

                    this.checkMan();
                    this.train.style[brprefix + "transform"] = "translate3d(" + this.train.pos.x + "px, " + this.train.pos.y + "px,0px)";
                }
                break;
            case 4:
                if (this.trainTimer < 0) {
                    this.train.state = 5;
                    if (this.curCross)
                        this.curCross.style.backgroundPosition = "0px 0px";
                    // this.trainTimer = this.trainCrossT;
                    break;
                }
                else {
                    this.tempProgress = Math.max(0.001, Math.min(this.trainTimer / this.trainCrossT * 2 - 1, 0.998));
                    if (this.curCross) {
                        this.curCross.style.backgroundPosition = "0px " + this.curCross.size.y * this.tempProgress + "px";
                        // this.curCross.style.backgroundPosition= "0% " +  (this.tempProgress*100) + "%";
                    }

                }
                break;
            case 5:
                this.walkTime += dt;

                this.tunnel.pos.x += Math.round(this.tunnelBackSpeed * dt);
                this.tunnel.pos.x = Math.min(this.tunnel.pos.x, 0);
                this.tunnel.style[brprefix + "transform"] = "translate3d(" + this.tunnel.pos.x + "px, " + this.tunnel.pos.y + "px,0px)";

                this.tunnelOffset = this.tunnel.pos.x / (this.tunnel.size.x - this.moduleSize.x);
                this.city.pos.x = this.tunnelOffset * (this.city.size.x - this.moduleSize.x);
                this.city.style[brprefix + "transform"] = "translate3d(" + this.city.pos.x + "px, " + this.city.pos.y + "px,0px)";

                this.sky.pos.x = this.tunnelOffset * (this.sky.size.x - this.moduleSize.x);
                this.sky.style[brprefix + "transform"] = "translate3d(" + this.sky.pos.x + "px, " + this.sky.pos.y + "px,0px)";

                if (this.tunnel.pos.x == 0) {
                    this.train.state = 0;
                    this.trainTimer = this.trainInitInterval[this.currentCityNum] * (0.75 + 0.5 * Math.random());
                    this.respawn();
                }
                break;
        }
    };

    NarrMetro.prototype.checkMan = function () {

        if (this.gameState != 0)
            return;
        this.curCross = undefined;
        if (this.train.pos.x + this.train.size.x - this.imagesSize.wagonLight.x > this.man.pos.x + this.manLightW) {
            if (this.crossCount < this.maxCrossCount) {
                this.curCross = this.crossesWrapper.childNodes[this.crossCount++];
                this.curCross.style.display = "block";
                this.curCross.style.backgroundPosition = "0px " + this.curCross.size.y + "px";
                this.curCross.pos.x = this.man.pos.x + this.manLightW + 10;
                this.curCross.style[brprefix + "transform"] = "translate3d(" + this.curCross.pos.x + "px, " + this.curCross.pos.y + "px,0px)";
            }

            this.man.style.display = 'none';
            this.deadMan.style.display = 'block';
            this.canGo = false;
            this.gameState = -1;
        }
    }

    NarrMetro.prototype.respawn = function () {
        this.man.pos = {x: this.imagesPos.manStart.x, y: this.imagesPos.manStart.y};
        this.man.style[brprefix + "transform"] = "translate3d(" + this.man.pos.x + "px, " + this.man.pos.y + "px,0px)";
        this.man.style.backgroundPosition = "0px 0px";
        this.man.style.display = 'block';
        this.man.style.opacity = 0.001;
        this.doorTimer = this.respawnT;
        this.man.moveSign = 0;
        this.gameState = 20;
        this.curCross = undefined;
    }

    NarrMetro.prototype.switchPause = function (val) {
        // this.nextPause == undefuned;
        // if (this.gameState == 23 || this.gameState == 24){ // fade in / fade out
        //     this.nextPause = val == undefined ? false : val;
        //     return;
        // }

        if (val === undefined)
            this.gamePause = !this.gamePause;
        else
            this.gamePause = val;

        this.btnPause.style.display = this.gamePause ? 'block' : 'none';
    };

    NarrMetro.prototype.touchStart = function (e, obj) {
        e.stopPropagation();
        if (!obj)
            return false;
        if (this.gamePause /*|| !this.canGo || this.gameState != 0*/)
            return false;

        if (obj.btnAction == 0) {
            this.man.moveSign = 1;
        }
        if (obj.btnAction == 1) {
            this.man.moveSign = -1;
        }
        return true;
    };

    NarrMetro.prototype.touchEnd = function (e, obj) {
        e.stopPropagation();

        if (this.gamePause)
            return false;

        if (this.canGo) {
            if (this.man.moveSign > 0)
                this.man.style.backgroundPosition = "0px " + 0/*(-this.man.size.y)*/ + "px";
            else if (this.man.moveSign < 0)
                this.man.style.backgroundPosition = "0px " + (-this.man.size.y * 4) + "px";
        }
        this.man.moveSign = 0;
        this.walkTime = 0;

        return true;
    };


    NarrMetro.prototype.tapEnd = function (e, obj) {
        e.stopPropagation();
        if (this.fullPause)
            return false;
        if (!obj)
            return false;

        if (obj.btnAction == 2 && !this.gamePause) {
            if (this.gameState == 0) {
                this.gameState = 1;
            }
            if (this.gameState == 5) {
                if (this.train.state == 3)
                    return;

                this.gameState = 6;
            }

        }
        if (obj.btnAction == 3) {
            this.switchPause();
        }
    };

    NarrMetro.prototype.customHittest = function (e, gesture) {
        if (this.isOnFinalScreen)
            return false;
        if (gesture == 'NarrMetroTouch') {
            if (this.hittestForRect({pType: 0, left: this.btnBackward.pos.x, top: this.btnBackward.pos.y, width: this.btnBackward.size.x, height: this.btnBackward.size.y}, e)) {
                return this.btnBackward;
            }
            if (this.hittestForRect({pType: 0, left: this.btnForward.pos.x, top: this.btnForward.pos.y, width: this.btnForward.size.x, height: this.btnForward.size.y}, e)) {
                return this.btnForward;
            }
        }
        if (gesture == 'NarrMetroTap') {
            if (this.hittestForRect({pType: 0, left: this.btnDoor.pos.x, top: this.btnDoor.pos.y, width: this.btnDoor.size.x, height: this.btnDoor.size.y}, e)) {
                return this.btnDoor;
            }
            if (this.hittestForRect({pType: 0, left: this.btnPause.pos.x, top: this.btnPause.pos.y, width: this.btnPause.size.x, height: this.btnPause.size.y}, e)) {
                return this.btnPause;
            }
        }
        else if (gesture == 'NarrMetroPan') {
            return true;
        }
        else
            return false;
    };


    Utils.addBehaviour('tap', 'NarrMetro', 'NarrMetroTap', {
//    start: function (e) {
//     return this.MetroStart(e);
// }, 
        end: function (e, obj) {
            this.tapEnd(e, obj);
        }}, false);

    Utils.addBehaviour('touch', 'NarrMetro', 'NarrMetroTouch', {
        start: function (e, obj) {
            return this.touchStart(e, obj);
        }, end: function (e) {
            this.touchEnd(e);
        }}, false);


    Utils.addBehaviour('pan', 'NarrMetro', 'NarrMetroPan', {
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

    return NarrMetro;
});