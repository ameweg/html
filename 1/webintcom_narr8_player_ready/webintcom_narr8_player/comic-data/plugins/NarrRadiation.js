define(["utils/Utils"], function (Utils) {

    var NarrRadiation = Utils.newObjectType(NarrRadiation, "NarrRadiation", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrRadiation.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        globalDiv = this;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        this.view.style.background = '#192e2b';
        // this.view.style.backgroundSize = "100% 100%";

        this.eStart = {};
        this.e = {};

        this.firstStart = true;
        this.delegate.addEventListener("timer", this.loop, this);

        this.minSpeed = 0.005 / 1000;
        this.maxSpeed = 0.07 / 1000;

        this.noizeSpeed = 0.15 / 1000;
        this.noizeMagnitude = 0.015;

        this.speedValsCount = 80;


        this.temperatureMin = 0;
        this.temperatureChain = 0.8;
        this.temperatureMax = 0.956;

        this.isInited = false;

        this.minPos = -0.37 * this.imagesSize.reactor.y;
        this.maxPos = 0;

        this.reactSwitchPoints = [0, 0.15, 0.3, 0.45, 0.55, 0.70, 0.85];
        this.reactionDelta = 0.02;

        this.colors = [
            [0x65, 0x2b, 0x01],  // blue
            [0xff, 0xb4, 0x00], // green
            // [0xf8, 0x51, 0x01], // red
            [0xf5, 0x52, 0x1e], // red
        ]
        this.startAngle = 150;
    };

    NarrRadiation.prototype.load = function () {
        this.city = document.createElement('div');
        this.windows = document.createElement('div');
        this.reactor = document.createElement('div');
        this.explosion = document.createElement('div');
        this.reactorTop = document.createElement('div');
        this.reactorColor = document.createElement('div');
        this.reactorCores = document.createElement('div');
        this.reactVisualMask = document.createElement('div');
        this.reactVisualColor = document.createElement('div');
        this.reactVisual = document.createElement('div');
        this.temperatureBack = document.createElement('div');
        this.temperaturePointer = document.createElement('div');
        this.restart = document.createElement('div');
        this.play = document.createElement('div');
        this.pause = document.createElement('div');
        this.clock1 = document.createElement('div');
        this.clock2 = document.createElement('div');
        this.clock3 = document.createElement('div');

        this.city.size = this.imagesSize.city;
        this.city.style.width = this.city.size.x + "px";
        this.city.style.height = this.city.size.y + "px";
        this.city.pos = this.imagesPos.city;
        this.city.style.backgroundImage = 'url("' + this.imagesSrc.city + '")';
        this.city.style.backgroundSize = "auto 100%";
        this.city.style.position = "absolute";
        this.city.style[brprefix + "transform"] = "translate3d(" + this.city.pos.x + "px, " + this.city.pos.y + "px,0px)";

        this.windows.size = this.imagesSize.city;
        this.windows.style.width = this.windows.size.x + "px";
        this.windows.style.height = this.windows.size.y + "px";
        this.windows.style.backgroundImage = 'url("' + this.imagesSrc.windows + '")';
        this.windows.style.backgroundPosition = -this.windows.size.x + "px 0px";
        this.windows.style.backgroundSize = "auto 100%";
        this.windows.style.position = "absolute";

///////////////////////////
// REACTOR
///////////////////////////
        this.reactor.size = this.imagesSize.reactor;
        this.reactor.style.width = this.reactor.size.x + "px";
        this.reactor.style.height = this.reactor.size.y + "px";
        this.reactor.pos = this.imagesPos.reactor;
        this.reactor.style.backgroundImage = 'url("' + this.imagesSrc.reactorBack + '")';
        this.reactor.style.backgroundSize = "100% 100%";
        this.reactor.style.position = "absolute";
        this.reactor.style.overflow = "visible";
        this.reactor.style[brprefix + "transform"] = "translate3d(" + this.reactor.pos.x + "px, " + this.reactor.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.reactor, 2);

        this.reactorTop.size = this.imagesSize.reactor;
        this.reactorTop.style.width = this.reactorTop.size.x + "px";
        this.reactorTop.style.height = this.reactorTop.size.y + "px";
        this.reactorTop.pos = this.imagesPos.reactor;
        this.reactorTop.style.backgroundImage = 'url("' + this.imagesSrc.reactorTop + '")';
        this.reactorTop.style.backgroundSize = "100% 100%";
        this.reactorTop.style.position = "absolute";
        this.reactorTop.style.overflow = "visible";
        this.reactorTop.style[brprefix + "transform"] = "translate3d(" + this.reactorTop.pos.x + "px, " + this.reactorTop.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.reactorTop, 3);

        this.reactorColor.size = {x: this.imagesSize.reactor.x - 2, y: this.imagesSize.reactor.y - 2};
        this.reactorColor.style.width = this.reactorColor.size.x + "px";
        this.reactorColor.style.height = this.reactorColor.size.y + "px";
        this.reactorColor.pos = {x: this.imagesPos.reactor.x + 1, y: this.imagesPos.reactor.y + 1};
        this.reactorColor.style.background = '#f5521e';
        this.reactorColor.style.position = "absolute";
        this.reactorColor.style.overflow = "visible";
        this.reactorColor.style[brprefix + "transform"] = "translate3d(" + this.reactorColor.pos.x + "px, " + this.reactorColor.pos.y + "px,0px)";

        this.reactorCores.size = this.imagesSize.reactor;
        this.reactorCores.style.width = this.reactorCores.size.x + "px";
        this.reactorCores.style.height = this.reactorCores.size.y + "px";
        this.reactorCores.style.backgroundImage = 'url("' + this.imagesSrc.reactorCores + '")';
        this.reactorCores.style.backgroundSize = "100% 100%";
        this.reactorCores.style.position = "absolute";
        this.reactorCores.pos = {x: 0, y: 0};

        this.explosion.size = this.imagesSize.explosion;
        this.explosion.style.width = this.explosion.size.x + "px";
        this.explosion.style.height = this.explosion.size.y + "px";
        this.explosion.pos = this.imagesPos.explosion;
        this.explosion.style.backgroundImage = 'url("' + this.imagesSrc.explosion + '")';
        this.explosion.style.backgroundSize = "100% auto";
        this.explosion.style.backgroundPosition = "0px " + this.explosion.size.y + "px";
        this.explosion.style.position = "absolute";
        this.explosion.style.overflow = "visible";
        this.explosion.style[brprefix + "transform"] = "translate3d(" + this.explosion.pos.x + "px, " + this.explosion.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.explosion, 5);


///////////////////////////
// CLOCK
///////////////////////////
        this.clock1.size = this.imagesSize.clock;
        this.clock1.style.width = this.clock1.size.x + "px";
        this.clock1.style.height = this.clock1.size.y + "px";
        this.clock1.pos = this.imagesPos.clock;
        this.clock1.style.backgroundImage = 'url("' + this.imagesSrc.clock1 + '")';
        this.clock1.style.backgroundSize = "100% 100%";
        this.clock1.style.position = "absolute";
        this.clock1.style.overflow = "visible";
        this.clock1.style[brprefix + "transform"] = "translate3d(" + this.clock1.pos.x + "px, " + this.clock1.pos.y + "px,0px)";

        this.clock2.size = this.imagesSize.clock;
        this.clock2.style.width = this.clock2.size.x + "px";
        this.clock2.style.height = this.clock2.size.y + "px";
        this.clock2.style.backgroundImage = 'url("' + this.imagesSrc.clock2 + '")';
        this.clock2.style.backgroundSize = "100% 100%";
        this.clock2.style.position = "absolute";
        this.clock2.style.overflow = "visible";
        this.clock2.alpha = this.startAngle;
        this.clock2.style[brprefix + "transform"] = "translate3d(0px, 0px, 0px)" +
            "rotateZ(" + this.clock2.alpha + "deg) "

        this.clock3.size = this.imagesSize.clock3;
        this.clock3.style.width = this.clock3.size.x + "px";
        this.clock3.style.height = this.clock3.size.y + "px";
        this.clock3.pos = this.imagesPos.clock3;
        this.clock3.style.backgroundImage = 'url("' + this.imagesSrc.clock3 + '")';
        this.clock3.style.backgroundSize = "100% 100%";
        this.clock3.style.position = "absolute";
        this.clock3.style.overflow = "visible";
        this.clock3.style[brprefix + "transform"] = "translate3d(" + this.clock3.pos.x + "px, " + this.clock3.pos.y + "px,0px)";

///////////////////////////
// TEMPARATURE
///////////////////////////
        this.temperatureBack.size = this.imagesSize.temperatureBack;
        this.temperatureBack.style.width = this.temperatureBack.size.x + "px";
        this.temperatureBack.style.height = this.temperatureBack.size.y + "px";
        this.temperatureBack.pos = this.imagesPos.temperatureBack;
        this.temperatureBack.style.backgroundImage = 'url("' + this.imagesSrc.temperatureBack + '")';
        this.temperatureBack.style.backgroundSize = "100% 100%";
        this.temperatureBack.style.position = "absolute";
        this.temperatureBack.style.overflow = "visible";
        this.temperatureBack.style[brprefix + "transform"] = "translate3d(" + this.temperatureBack.pos.x + "px, " + this.temperatureBack.pos.y + "px,0px)";

        this.temperaturePointer.size = this.imagesSize.temperaturePointer;
        this.temperaturePointer.style.width = this.temperaturePointer.size.x + "px";
        this.temperaturePointer.style.height = this.temperaturePointer.size.y + "px";
        this.temperaturePointer.pos = {x: 0, y: 0};
        this.temperaturePointer.style.backgroundImage = 'url("' + this.imagesSrc.temperaturePointer + '")';
        this.temperaturePointer.style.backgroundSize = "100% 100%";
        this.temperaturePointer.style.position = "absolute";
        this.temperaturePointer.style[brprefix + "transform"] = "translate3d(" + this.temperaturePointer.pos.x + "px, " + this.temperaturePointer.pos.y + "px,0px)";

///////////////////////////
// REACTION VISUALISATION
///////////////////////////
        this.reactVisualMask.size = this.imagesSize.reactVisualMask;
        this.reactVisualMask.style.width = this.reactVisualMask.size.x + "px";
        this.reactVisualMask.style.height = this.reactVisualMask.size.y + "px";
        this.reactVisualMask.style.backgroundImage = 'url("' + this.imagesSrc.reactVisualMask + '")';
        this.reactVisualMask.style.backgroundSize = "100% 100%";
        this.reactVisualMask.style.position = "absolute";
        this.reactVisualMask.pos = {x: -1, y: -1};
        this.reactVisualMask.style[brprefix + "transform"] = "translate3d(" + this.reactVisualMask.pos.x + "px, " + this.reactVisualMask.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.reactVisualMask, 2);

        this.reactVisualColor.size = {x: this.imagesSize.reactVisualMask.x - 2, y: this.imagesSize.reactVisualMask.y - 2};
        this.reactVisualColor.style.width = this.reactVisualColor.size.x + "px";
        this.reactVisualColor.style.height = this.reactVisualColor.size.y + "px";
        this.reactVisualColor.pos = this.imagesPos.reactVisualMask;
        this.reactVisualColor.style.background = '#f5521e';
        this.reactVisualColor.style.position = "absolute";
        // this.reactVisualColor.style.padding = '55px';
        this.reactVisualColor.style.overflow = "visible";
        this.reactVisualColor.style[brprefix + "transform"] = "translate3d(" + this.reactVisualColor.pos.x + "px, " + this.reactVisualColor.pos.y + "px,0px)";

        this.reactVisual.size = this.imagesSize.reactVisual;
        this.reactVisual.style.width = this.reactVisual.size.x + "px";
        this.reactVisual.style.height = this.reactVisual.size.y + "px";
        this.reactVisual.pos = this.imagesPos.reactVisual;
        this.reactVisual.style.backgroundImage = 'url("' + this.imagesSrc.reactVisual + '")';
        this.reactVisual.style.backgroundSize = this.reactVisual.style.width * 7 + " " + this.reactVisual.style.height * 7;
        this.reactVisual.style.position = "absolute";
        this.reactVisual.style[brprefix + "transform"] = "translate3d(" + this.reactVisual.pos.x + "px, " + this.reactVisual.pos.y + "px,0px)";

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.restart.size = {x: this.imagesSize.button.x, y: this.imagesSize.button.y};
        this.restart.style.width = this.restart.size.x + "px";
        this.restart.style.height = this.restart.size.y + "px";
        this.restart.style.backgroundImage = 'url("' + this.imagesSrc.restart + '")';
        this.restart.style.backgroundSize = "auto 100%";
        this.restart.style.backgroundPosition = "0px 0px";
        this.restart.style.position = "absolute";
        this.restart.pos = this.imagesPos.restart;
        this.restart.style[brprefix + "transform"] = "translate3d(" + this.restart.pos.x + "px," + this.restart.pos.y + "px,0px)";
        this.restart.runCommand = this.repairReactor;

        this.play.size = {x: this.imagesSize.button.x, y: this.imagesSize.button.y};
        this.play.style.width = this.play.size.x + "px";
        this.play.style.height = this.play.size.y + "px";
        this.play.style.backgroundImage = 'url("' + this.imagesSrc.play + '")';
        this.play.style.backgroundSize = "auto 100%";
        this.play.style.backgroundPosition = "0px 0px";
        this.play.style.position = "absolute";
        this.play.pos = this.imagesPos.play;
        this.play.style[brprefix + "transform"] = "translate3d(" + this.play.pos.x + "px," + this.play.pos.y + "px,0px)";
        this.play.runCommand = this.turnOnReactor;

        this.pause.size = {x: this.imagesSize.button.x, y: this.imagesSize.button.y};
        this.pause.style.width = this.pause.size.x + "px";
        this.pause.style.height = this.pause.size.y + "px";
        this.pause.style.backgroundImage = 'url("' + this.imagesSrc.pause + '")';
        this.pause.style.backgroundSize = "auto 100%";
        this.pause.style.backgroundPosition = "0px 0px";
        this.pause.style.position = "absolute";
        this.pause.pos = this.imagesPos.pause;
        this.pause.style[brprefix + "transform"] = "translate3d(" + this.pause.pos.x + "px," + this.pause.pos.y + "px,0px)";
        this.pause.runCommand = this.turnOffReactor;

        this.view.appendChild(this.city);
        this.city.appendChild(this.windows);
        this.view.appendChild(this.reactor);
        this.view.appendChild(this.reactorTop);
        this.view.appendChild(this.reactorColor);
        this.reactor.appendChild(this.reactorCores);
        this.view.appendChild(this.explosion);
        this.view.appendChild(this.reactVisualColor);
        this.reactVisualColor.appendChild(this.reactVisualMask);
        this.reactVisualColor.appendChild(this.reactVisual);
        this.view.appendChild(this.temperatureBack);
        this.temperatureBack.appendChild(this.temperaturePointer);
        this.view.appendChild(this.restart);
        this.view.appendChild(this.play);
        this.view.appendChild(this.pause);
        this.view.appendChild(this.clock1);
        this.clock1.appendChild(this.clock2);
        this.view.appendChild(this.clock3);

        this.reactFrameTime = 200;
        this.reactTimer = 0;
        this.framesCount = 7;
        this.reactFrameNum = 0;

        // this.loopPause = true;
        this.loopPause = false;
        this.switchPause(this.loopPause);

        this.restartReactor();
        this.turnOffReactor();

        this.isInited = true;

        this.timePeriodTimes = [9000, 4000, 7000, 4000];
        this.dayPeriod = (9000 + 4000 + 7000 + 4000) / 2;
        this.clockPeriodTimer = this.dayPeriod;

        this.timePeriodNum = 0;
        this.timePeriodTimer = this.timePeriodTimes[this.timePeriodNum];

        this.explosionFrameTime = 300;
        this.explosionTimer = this.explosionFrameTime;
        this.explosionState = 0;
    };


    NarrRadiation.prototype.unload = function () {
        delete this.city;
        delete this.windows;
        delete this.reactor;
        delete this.explosion;
        delete this.reactorTop;
        delete this.reactorColor;
        delete this.reactorCores;
        delete this.reactVisualMask;
        delete this.reactVisualColor;
        delete this.reactVisual;
        delete this.temperatureBack;
        delete this.temperaturePointer;
        delete this.restart;
        delete this.play;
        delete this.pause;
        delete this.clock1;
        delete this.clock2;
        delete this.clock3;

        this.deleteDomElements(this.view);

        this.isInited = false;
    };

    NarrRadiation.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrRadiation.prototype.loop = function (dt) { // необязательно
        dt = Math.min(dt, 100);
        if (!this.isInited)
            return;

        if (this.loopPause)
            return;
        this.updateTemperature(dt, this.coresPosition);
        this.updateReactVisual(dt);
        this.updateTimePeriod(dt);
        this.updateExplosion(dt);
    };

    NarrRadiation.prototype.updateTemperature = function (dt, coresPosition) {
        if (this.reactState == 3 || this.reactState == 1)
            return;

        this.speed[this.curSpeedPointer++] = this.getSpeed(coresPosition);
        if (this.curSpeedPointer >= this.speedValsCount)
            this.curSpeedPointer = 0;

        this.avSpeed = eval(this.speed.join('+')) / this.speed.length;

        // if (this.reactState == 1)
        //     this.temperature += this.avSpeed*dt; //остывание
        if (this.reactState == 2)
            this.temperature += 0.5 * this.avSpeed * dt + 2 * this.maxSpeed * dt; //перед взрывом
        else if (this.reactState == 4)
            this.temperature -= 10 * this.maxSpeed * dt; //перед взрывом
        else
            this.temperature += this.avSpeed * dt; //обычный режим (посередине)

        if (this.reactState == 2)
            this.temperatureNoized = this.temperature;
        else
            this.temperatureNoized = this.temperature + this.randomNoize;

        // console.log("this.temperatureNoized " + this.temperatureNoized);

        if (this.temperatureNoized < this.temperatureMin) {
            this.temperatureNoized = this.temperatureMin;
            this.windows.style.backgroundPosition = this.windows.size.x + "px 0px";
            this.turnOffReactor();
            this.reactState = 1;
        }
        else if (this.temperatureNoized > this.temperatureMax) {
            this.temperatureNoized = this.temparetureMax;
            this.play.style.backgroundPosition = (-this.play.size.x) + "px 0px";
            this.pause.style.backgroundPosition = (-this.pause.size.x) + "px 0px";
            this.restart.style.backgroundPosition = 0 + "px 0px";
            this.windows.style.backgroundPosition = this.windows.size.x + "px 0px";
            this.reactState = 3;
        }
        else if (this.temperatureNoized > this.temperatureChain) {
            this.reactState = 2;
        }
        else if (this.reactState != 4) {
            this.reactState = 0;
        }

        this.temperaturePointer.pos.x = Math.round(this.temperatureNoized * (this.temperatureBack.size.x - this.temperaturePointer.size.x));
        this.temperaturePointer.style[brprefix + "transform"] = "translate3d(" + this.temperaturePointer.pos.x + "px, " + this.temperaturePointer.pos.y + "px,0px)";

        this.updateReactionState(this.sign, this.temperature);
        this.updateColor(this.temperature);

        this.updateNoize(dt, coresPosition);
    }

    NarrRadiation.prototype.updateExplosion = function (dt) {
        if (this.reactState != 3)
            return;

        this.explosionTimer -= dt;
        if (this.explosionTimer < 0) {
            this.explosionTimer = this.explosionFrameTime;

            this.explosionState++;
            if (this.explosionState >= 9)
                this.explosionState = 5;
        }
        this.explosion.style.backgroundPosition = "0px " + (-this.explosion.size.y * this.explosionState) + "px";
    }

    NarrRadiation.prototype.updateNoize = function (dt, coresPosition) {
        this.noizeSign = (this.nextNoizeValue - this.randomNoize) > 0 ? 1 : -1;
        this.randomNoize += this.noizeSpeed * dt * this.noizeSign;

        if (this.noizeSign > 0) {
            if (this.randomNoize >= this.nextNoizeValue)
                this.nextNoizeValue = this.noizeMagnitude * (Math.random() * 2 - 1);
        }
        else {
            if (this.randomNoize <= this.nextNoizeValue)
                this.nextNoizeValue = this.noizeMagnitude * (Math.random() * 2 - 1);
        }
    }

    NarrRadiation.prototype.updateTimePeriod = function (dt) {
        this.timePeriodTimer -= dt;
        if (this.timePeriodTimer < 0) {
            this.timePeriodNum++;
            if (this.timePeriodNum >= 4)
                this.timePeriodNum = 0;

            this.timePeriodTimer = this.timePeriodTimes[this.timePeriodNum];

            if (this.reactState == 3 || this.reactState == 1) {
                this.windows.style.backgroundPosition = this.windows.size.x + "px 0px";
            }
            else {
                if (this.timePeriodNum == 1 || this.timePeriodNum == 3)
                    this.windows.style.backgroundPosition = 0 + "px 0px";
                else
                    this.windows.style.backgroundPosition = -this.windows.size.x + "px 0px";
            }
            this.city.style.backgroundPosition = -this.city.size.x * this.timePeriodNum + "px 0px";
        }
        ;

        this.clockPeriodTimer -= dt;
        if (this.clockPeriodTimer < 0) {
            this.clockPeriodTimer = this.dayPeriod;
        }

        this.clock2.alpha = (this.startAngle + (1 - this.clockPeriodTimer / this.dayPeriod) * 360) % 360;
        this.clock2.style[brprefix + "transform"] = "translate3d(0px, 0px, 0px)" +
            "rotateZ(" + this.clock2.alpha + "deg) ";
    }

    NarrRadiation.prototype.updateColor = function (temperature) {
        this.resultColor = [];
        if (temperature < 0.5) {
            this.k1 = (1 - temperature * 2);
            this.k2 = (temperature * 2);
            this.col1 = 0;
            this.col2 = 1;
        }
        else {
            temperature -= 0.5;
            this.k1 = (1 - temperature * 2);
            this.k2 = (temperature * 2);
            this.col1 = 1;
            this.col2 = 2;
        }
        this.resultColor = [
            (this.k1 * this.colors[this.col1][0] + this.k2 * this.colors[this.col2][0]),
            (this.k1 * this.colors[this.col1][1] + this.k2 * this.colors[this.col2][1]),
            (this.k1 * this.colors[this.col1][2] + this.k2 * this.colors[this.col2][2])
        ];
        this.reactorColor.style.background = 'rgba(' + ~~this.resultColor[0] + ',' + ~~this.resultColor[1] + ',' + ~~this.resultColor[2] + ',1)';
        this.reactVisualColor.style.background = 'rgba(' + ~~this.resultColor[0] + ',' + ~~this.resultColor[1] + ',' + ~~this.resultColor[2] + ',1)';
    }

    NarrRadiation.prototype.switchPause = function (new_value) {
        if (new_value === undefined)
            this.loopPause = !this.loopPause;
        else
            this.loopPause = new_value;
        this.play.style.backgroundPosition = -this.play.size.x * (!this.loopPause) + "px 0px";
        this.pause.style.backgroundPosition = -this.play.size.x * (this.loopPause) + "px 0px";
    }

    NarrRadiation.prototype.updateReactionState = function (sign, temperature) {
        this.lastState = this.reactionState;
        this.reactionState = 0;
        for (this.i = 0; this.i < 6; this.i++) {
            if (this.temperature >= this.reactSwitchPoints[this.i] + this.reactionDelta * sign)
                this.reactionState = this.i + 1;
        }
    }

    NarrRadiation.prototype.updateReactVisual = function (dt) {
        if (this.reactState == 1)
            this.lastState = 0;
        if (this.reactState == 3)
            this.lastState = 6;

        this.reactTimer -= dt;
        if (this.reactTimer < 0) {
            this.reactTimer = this.reactFrameTime;
            this.reactFrameNum++;
            if (this.reactFrameNum >= this.framesCount)
                this.reactFrameNum = 0;
        }

        if (this.reactState == 3)
            this.reactVisual.style.backgroundPosition = (-this.reactVisual.size.x * (this.framesCount - 1)) + 'px ' + (-this.reactVisual.size.y * (this.lastState)) + 'px';
        else
            this.reactVisual.style.backgroundPosition = (-this.reactVisual.size.x * this.reactFrameNum) + 'px ' + (-this.reactVisual.size.y * (this.lastState)) + 'px';
    }


    NarrRadiation.prototype.getSpeed = function (coresPosition) {
        this.newSpeed = (2 * coresPosition - 1) * this.maxSpeed;
        if (this.timePeriodNum == 1 || this.timePeriodNum == 3)
            this.newSpeed -= 0.8 * this.maxSpeed;
        else
            this.newSpeed += 0.8 * this.newSpeed;

        this.sign = this.newSpeed > 0 ? 1 : this.newSpeed < 0 ? -1 : 0;
        if (Math.abs(this.newSpeed) < this.minSpeed)
            this.newSpeed = this.minSpeed * this.sign;

        return this.newSpeed;
    }

    NarrRadiation.prototype.restartReactor = function () {
        globalDiv.curSpeedPointer = 0;
        globalDiv.speed = [];
        for (globalDiv.i = globalDiv.speedValsCount - 1; globalDiv.i >= 0; globalDiv.i--) {
            globalDiv.speed[globalDiv.i] = 0;
        }
        ;
        globalDiv.temperature = 0.25; // 0 - 1

        globalDiv.randomNoize = 0;
        globalDiv.nextNoizeValue = globalDiv.noizeMagnitude * (Math.random() * 2 - 1);

        globalDiv.reactState = 0;

        globalDiv.reactorCores.pos.y = -50;
        globalDiv.reactorCores.style[brprefix + "transform"] = "translate3d(0px," + globalDiv.reactorCores.pos.y + "px,0px)";
        globalDiv.coresPosition = globalDiv.reactorCores.pos.y / (globalDiv.minPos - globalDiv.maxPos);

        globalDiv.restart.style.backgroundPosition = (-globalDiv.restart.size.x) + "px 0px";

        this.explosionState = 0;
        this.explosion.style.backgroundPosition = "0px " + this.explosion.size.y + "px";
    }
// 
    NarrRadiation.prototype.repairReactor = function () {
        globalDiv.restartReactor();
        globalDiv.pause.style.backgroundPosition = "0px 0px";
        globalDiv.play.style.backgroundPosition = (-globalDiv.play.size.x) + "px 0px";
    }

    NarrRadiation.prototype.turnOnReactor = function () {
        globalDiv.restartReactor();
        globalDiv.pause.style.backgroundPosition = "0px 0px";
        globalDiv.play.style.backgroundPosition = (-globalDiv.play.size.x) + "px 0px";

        if (globalDiv.timePeriodNum == 1 || globalDiv.timePeriodNum == 3)
            globalDiv.windows.style.backgroundPosition = 0 + "px 0px";
        else
            globalDiv.windows.style.backgroundPosition = -globalDiv.windows.size.x + "px 0px";
    }

    NarrRadiation.prototype.turnOffReactor = function () {
        globalDiv.curSpeedPointer = 0;
        globalDiv.speed = [];
        for (globalDiv.i = globalDiv.speedValsCount - 1; globalDiv.i >= 0; globalDiv.i--) {
            globalDiv.speed[globalDiv.i] = 0;
        }
        ;
        globalDiv.reactState = 4;

        globalDiv.reactorCores.pos.y = 0;
        globalDiv.reactorCores.style[brprefix + "transform"] = "translate3d(0px," + globalDiv.reactorCores.pos.y + "px,0px)";
        globalDiv.coresPosition = globalDiv.reactorCores.pos.y / (globalDiv.minPos - globalDiv.maxPos);

        globalDiv.pause.style.backgroundPosition = (-globalDiv.pause.size.x) + "px 0px";
        globalDiv.play.style.backgroundPosition = "0px 0px";
    }

    NarrRadiation.prototype.radiationStart = function (e, obj) {
        e.stopPropagation();
        if (!obj)
            return false;

        if (this.reactState == 1 || this.reactState == 4 || this.reactState == 3)
            return false;

        this.reactorCores.startY = this.reactorCores.pos.y;
        this.eStart = this.getInternalCoordinatesForPoint(e);
        return true;
    };

    NarrRadiation.prototype.radiationMove = function (e) {
        e.stopPropagation();

        if (this.reactState == 1 || this.reactState == 4 || this.reactState == 3)
            return false;

        this.e = this.getInternalCoordinatesForPoint(e);

        this.reactorCores.startY += this.e.y - this.eStart.y;
        if (this.reactorCores.startY > this.maxPos)
            this.reactorCores.startY = this.maxPos;
        if (this.reactorCores.startY < this.minPos)
            this.reactorCores.startY = this.minPos;

        this.reactorCores.pos.y = this.reactorCores.startY;
        this.reactorCores.style[brprefix + "transform"] = "translate3d(0px," + this.reactorCores.pos.y + "px,0px)";

        this.coresPosition = this.reactorCores.startY / (this.minPos - this.maxPos);

        this.eStart = this.getInternalCoordinatesForPoint(e);
    };

    NarrRadiation.prototype.radiationEnd = function (e) {
        e.stopPropagation();

    };

    NarrRadiation.prototype.restartStart = function (e, obj) {
        e.stopPropagation();
        this.tappedObj = obj;

        obj.style.backgroundPosition = (-obj.size.x) + "px 0px";
        return true;
    };

    NarrRadiation.prototype.restartEnd = function (e) {
        e.stopPropagation();
        if (this.hittestForRect({pType: 0, left: this.tappedObj.pos.x, top: this.tappedObj.pos.y, width: this.tappedObj.size.x, height: this.tappedObj.size.y}, e)) {
            // debugger;
            this.tappedObj.runCommand();
            // this.restartReactor();
        }
        else
            this.tappedObj.style.backgroundPosition = "0px 0px";
        // this.tappedObj.style.backgroundPosition = "0px 0px";
    };


    NarrRadiation.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrRadiationPan') {
            if (this.hittestForRect({pType: 0, left: this.reactor.pos.x, top: this.reactor.pos.y + this.reactorCores.pos.y, width: this.reactor.size.x, height: this.reactor.size.y}, e)) {
                return this.reactorCores;
            }
        }
        else if (gesture == 'NarrRadiationTouch') {
            if (this.hittestForRect({pType: 0, left: this.restart.pos.x, top: this.restart.pos.y, width: this.restart.size.x, height: this.restart.size.y}, e)) {
                if (this.reactState == 3)
                    return this.restart;
            }
            else if (this.hittestForRect({pType: 0, left: this.pause.pos.x, top: this.pause.pos.y, width: this.pause.size.x, height: this.pause.size.y}, e)) {
                if (this.reactState == 0 || this.reactState == 2)
                    return this.pause;
            }
            else if (this.hittestForRect({pType: 0, left: this.play.pos.x, top: this.play.pos.y, width: this.play.size.x, height: this.play.size.y}, e)) {
                if (this.reactState == 4 || this.reactState == 1)
                    return this.play;
            }
        }
        else
            return false;
    };

    Utils.addBehaviour('pan', 'NarrRadiation', 'NarrRadiationPan', {
        start: function (e, obj) {
            return this.radiationStart(e, obj);
        }, move: function (e) {
            this.radiationMove(e);
        }, swipe: function (e) {
            e.stopPropagation();
        }, end: function (e) {
            this.radiationEnd(e);
        }}, false);

    Utils.addBehaviour('touch', 'NarrRadiation', 'NarrRadiationTouch', {
        start: function (e, obj) {
            return this.restartStart(e, obj);
        }, end: function (e) {
            this.restartEnd(e);
        }}, false);

    return NarrRadiation;
});
