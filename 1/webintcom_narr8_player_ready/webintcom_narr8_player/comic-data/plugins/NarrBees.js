define(["utils/Utils"], function (Utils) {
    var NarrBees = Utils.newObjectType(NarrBees, "NarrBees", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrBees.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        // test
        // this.view.style.backgroundImage = "url('" + this.imagesSrc.back + "')";
        // this.view.style.backgroundImage = 'url("img/bees_atoms/dopdop_text.png")';

        this.eStart = {};
        this.e = {};


        this.maxBearCount = 10;

        this.curBearNum = 0;

        this.delegate.addEventListener("timer", this.loop, this);

        this.gravity = -700 / 1000000;

        this.HPData = [0, 100, 150, 200];

        this.phaseTime = [15000, 45000, 70000, 999999, 999999];
        // this.phaseTime = [3000, 6000, 9000];
        this.initBearInterval = [3000, 2500, 2000, 8000];

        this.miniGAnimT = 900;
        this.miniGPlayT = 6300;
        this.miniGFinalT = 1300;

        this.loseAnimT1 = 1000;
        this.loseAnimT2 = 500;

        this.balloonsOffset = [75, 95, 108, 80];

        this.fadeOutTime = 300;


        this.beesSpeed = 800 / 1000;
        this.bearsInitSpeed = [140 / 1000, 100 / 1000, 80 / 1000, 110 / 1000];

        this.bossAnimFrameTime = 150;
        this.bossAnimFrameCount = 3;

    };

    NarrBees.prototype.load = function () {
        this.hive = document.createElement('div');
        this.paws = document.createElement('div');
        this.pause = document.createElement('div');
        this.minigame = document.createElement('div');
        this.fade = document.createElement('div');
        this.bees = document.createElement('div');
        this.testPoint = document.createElement('div');
        this.crosshair = document.createElement('div');
        this.beeTarget = document.createElement('div');
        this.HPBar = document.createElement('div');
        this.HPBarBorder = document.createElement('div');
        this.beeTargetMask = document.createElement('div');
        this.minigameAnimPic = document.createElement('div');

        this.ok = document.createElement('div');

        this.circleWrapper = document.createElement('div');
        this.circleProgrL = document.createElement('div');
        this.circleProgrLWrap = document.createElement('div');
        this.circleProgrLRot = document.createElement('div');
        this.circleProgrLCirc = document.createElement('div');
        this.circleProgrR = document.createElement('div');
        this.circleProgrRWrap = document.createElement('div');
        this.circleProgrRRot = document.createElement('div');
        this.circleProgrRCirc = document.createElement('div');

        this.bears = [];
        this.balloons = [];
        for (this.i = 0; this.i < this.maxBearCount; this.i++) {
            this.bears[this.i] = document.createElement('div');
            this.view.appendChild(this.bears[this.i]);
            this.balloons[this.i] = document.createElement('div');
            this.view.appendChild(this.balloons[this.i]);
        }
        this.minigameBees = [];
        for (this.i = 0; this.i < 3; this.i++) {
            this.minigameBees[this.i] = document.createElement('div');
            this.minigame.appendChild(this.minigameBees[this.i]);
        }

        this.view.appendChild(this.hive);
        this.view.appendChild(this.minigameAnimPic);
        this.view.appendChild(this.paws);
        this.view.appendChild(this.pause);
        this.view.appendChild(this.minigame);
        this.view.appendChild(this.fade);
        this.view.appendChild(this.bees);
        // this.view.appendChild(this.testPoint); // for debug
        this.minigame.appendChild(this.beeTarget);
        this.minigame.appendChild(this.beeTargetMask);
        this.beeTarget.appendChild(this.crosshair);
        this.minigame.appendChild(this.HPBar);
        this.HPBar.appendChild(this.HPBarBorder);

        this.minigame.appendChild(this.ok);

        this.beeTarget.appendChild(this.circleWrapper);
        this.circleWrapper.appendChild(this.circleProgrL);
        this.circleProgrL.appendChild(this.circleProgrLWrap);
        this.circleProgrLWrap.appendChild(this.circleProgrLRot);
        this.circleProgrLRot.appendChild(this.circleProgrLCirc);

        this.circleWrapper.appendChild(this.circleProgrR);
        this.circleProgrR.appendChild(this.circleProgrRWrap);
        this.circleProgrRWrap.appendChild(this.circleProgrRRot);
        this.circleProgrRRot.appendChild(this.circleProgrRCirc);
        // this.view.appendChild(this.bear);

        this.pause.size = this.imagesSize.pause;
        this.pause.style.width = this.pause.size.x + "px";
        this.pause.style.height = this.pause.size.y + "px";
        this.pause.pos = this.imagesPos.pause;
        this.pause.style.backgroundImage = 'url("' + this.imagesSrc.pause + '")';
        this.pause.style.backgroundSize = "100% auto";
        this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y) + "px";
        this.pause.style.position = "absolute";
        this.pause.style[brprefix + "transform"] = "translate3d(" + this.pause.pos.x + "px, " + this.pause.pos.y + "px,0px)";
        this.pause.style.display = 'none';
        bradapter.applyZIndex(this.view, this.pause, 4);

        this.hive.size = this.imagesSize.hive;
        this.hive.style.width = this.hive.size.x + "px";
        this.hive.style.height = this.hive.size.y + "px";
        this.hive.pos = this.imagesPos.hive;
        this.hive.style.backgroundImage = 'url("' + this.imagesSrc.hive + '")';
        this.hive.style.backgroundSize = "auto 100%";
        this.hive.style.backgroundPosition = -this.hive.size.x + "px 0px";
        this.hive.style.position = "absolute";
        this.hive.style[brprefix + "transform"] = "translate3d(" + this.hive.pos.x + "px, " + this.hive.pos.y + "px,0px)";

        this.gesture = {
            eStart: {},
            eEnd: {},
            timeFromStart: 0,
            timeForSwipe: 500,
            isStarted: false,
        };
        this.isInited = true;

        this.bossAnimT = 0;

        this.reInitGame();
    };

    NarrBees.prototype.initAllElements = function () {
        this.hive.style.backgroundPosition = -this.hive.size.x + "px 0px";
        // bradapter.applyZIndex(this.view, this.hive, 2);

        this.minigameAnimPic.size = {};
        // this.minigameAnimPic.style.width = this.minigameAnimPic.size.x + "px";
        // this.minigameAnimPic.style.height = this.minigameAnimPic.size.y + "px";
        this.minigameAnimPic.pos = {};
        this.minigameAnimPic.style.backgroundImage = 'url("' + this.imagesSrc.minigameAnimPic + '")';
        this.minigameAnimPic.style.backgroundSize = "100% 100%";
        this.minigameAnimPic.style.position = "absolute";
        this.minigameAnimPic.style.display = 'none';
        bradapter.applyZIndex(this.view, this.minigameAnimPic, 10);

        this.paws.size = this.imagesSize.paws;
        this.paws.style.width = this.paws.size.x + "px";
        this.paws.style.height = this.paws.size.y + "px";
        this.paws.pos = this.imagesPos.paws;
        this.paws.style.backgroundImage = 'url("' + this.imagesSrc.paws + '")';
        this.paws.style.backgroundSize = "auto 100%";
        this.paws.style.backgroundPosition = "0px " + (-this.paws.size.y) + "px";
        this.paws.style.position = "absolute";
        this.paws.style[brprefix + "transform"] = "translate3d(" + this.paws.pos.x + "px, " + this.paws.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.paws, 2);


        this.minigame.style.width = 100 + "%";
        this.minigame.style.height = 100 + "%";
        this.minigame.style.backgroundColor = '#2b2b2b';
        this.minigame.style.backgroundSize = "auto 100%";
        this.minigame.style.backgroundPosition = "center";
        this.minigame.style.position = "absolute";
        this.minigame.style.display = 'none';
        bradapter.applyZIndex(this.view, this.minigame, 7);

        this.fade.style.width = 100 + "%";
        this.fade.style.height = 100 + "%";
        this.fade.style.background = 'black';
        this.fade.style.position = "absolute";
        this.fade.style.opacity = 0.001;
        this.fade.style.display = 'none';
        bradapter.applyZIndex(this.view, this.fade, 8);


        this.bees.size = {x: this.imagesSize.bees.x, y: this.imagesSize.bees.y};
        this.bees.style.width = this.bees.size.x + "px";
        this.bees.style.height = this.bees.size.y + "px";
        this.bees.pos = {x: this.imagesPos.bees.x, y: this.imagesPos.bees.y};
        this.bees.style.backgroundImage = 'url("' + this.imagesSrc.bees + '")';
        this.bees.style.backgroundSize = "100% 100%";
        this.bees.style.backgroundPosition = 0 + "px 0px";
        this.bees.style.position = "absolute";
        this.bees.style[brprefix + "transform"] = "translate3d(" + this.bees.pos.x + "px, " + this.bees.pos.y + "px,0px)";
        this.bees.style.overflow = "visible";
        this.bees.style.display = 'none';
        bradapter.applyZIndex(this.view, this.bees, 3);

        this.testPoint.style.width = 10 + "px";
        this.testPoint.style.height = 10 + "px";
        this.testPoint.style.background = 'green';
        this.testPoint.style.position = "absolute";
        // bradapter.applyZIndex(this.view, this.hive, 5);

        this.HPBar.size = this.imagesSize.HPBar;
        this.HPBar.style.width = this.HPBar.size.x + "px";
        this.HPBar.style.height = this.HPBar.size.y + "px";
        this.HPBar.pos = this.imagesPos.HPBar;
        this.HPBar.style.backgroundImage = 'url("' + this.imagesSrc.HPBarBack + '")';
        this.HPBar.style.backgroundSize = "100% 100%";
        this.HPBar.style.position = "absolute";
        this.HPBar.style[brprefix + "transform"] = "translate3d(" + this.HPBar.pos.x + "px, " + this.HPBar.pos.y + "px,0px)";
        this.HPBar.style.display = 'none';
        bradapter.applyZIndex(this.view, this.HPBar, 3);

        this.HPBarBorder.size = this.imagesSize.HPBar;
        this.HPBarBorder.style.width = this.HPBarBorder.size.x + "px";
        this.HPBarBorder.style.height = this.HPBarBorder.size.y + "px";
        this.HPBarBorder.style.backgroundImage = 'url("' + this.imagesSrc.HPBarBorder + '")';
        this.HPBarBorder.style.backgroundSize = "100% 100%";
        this.HPBarBorder.style.position = "absolute";

        this.ok.size = this.moduleSize;
        this.ok.style.width = this.ok.size.x + "px";
        this.ok.style.height = this.ok.size.y + "px";
        this.ok.style.backgroundImage = 'url("' + this.imagesSrc.ok + '")';
        // this.ok.style.backgroundSize = "100% 100%";
        this.ok.style.backgroundPosition = "center";
        this.ok.style.position = "absolute";
        this.ok.style.display = 'none';
        bradapter.applyZIndex(this.view, this.ok, 3);

        for (this.i = 0; this.i < 3; this.i++) {
            this.curBee = this.minigameBees[this.i];

            this.curBee.size = {x: this.imagesSize.minigameBee.x, y: this.imagesSize.minigameBee.y};
            this.curBee.style.width = this.curBee.size.x + "px";
            this.curBee.style.height = this.curBee.size.y + "px";
            this.curBee.pos = this.imagesPos.minigameBee[this.i];
            this.curBee.style.backgroundImage = 'url("' + this.imagesSrc.minigameBee + '")';
            this.curBee.style.backgroundSize = "100% 100%";
            this.curBee.style.position = "absolute";
            this.curBee.style[brprefix + "transform"] = "translate3d(" + this.curBee.pos.x + "px, " + this.curBee.pos.y + "px,0px)";
            bradapter.applyZIndex(this.view, this.curBee, 3);
        }


        this.beeTarget.size = {x: this.imagesSize.beeTarget.x, y: this.imagesSize.beeTarget.y};
        this.beeTarget.style.width = this.beeTarget.size.x + "px";
        this.beeTarget.style.height = this.beeTarget.size.y + "px";
        this.beeTarget.pos = this.imagesPos.beeTarget;
        this.beeTarget.style.backgroundImage = 'url("' + this.imagesSrc.beeTarget + '")';
        this.beeTarget.style.backgroundSize = "100% 100%";
        this.beeTarget.style.position = "absolute";
        this.beeTarget.style[brprefix + "transform"] = "translate3d(" + this.beeTarget.pos.x + "px, " + this.beeTarget.pos.y + "px,0px)";
        this.beeTarget.style.display = 'none';
        this.beeTarget.style.overflow = 'visible';
        // bradapter.applyZIndex(this.view, this.beeTarget, 3);

        this.beeTargetMask.style.width = 100 + "%";
        this.beeTargetMask.style.height = 100 + "%";
        // this.beeTargetMask.style.backgroundColor = '#2b2b2b';
        this.beeTargetMask.style.backgroundImage = 'url("' + this.imagesSrc.bearBig + '")';
        this.beeTargetMask.style.backgroundSize = "auto 100%";
        this.beeTargetMask.style.backgroundPosition = "center";
        this.beeTargetMask.style.position = "absolute";
        bradapter.applyZIndex(this.view, this.beeTargetMask, 2);


        this.crosshair.size = this.imagesSize.crosshair;
        this.crosshair.style.width = this.crosshair.size.x + "px";
        this.crosshair.style.height = this.crosshair.size.y + "px";
        this.crosshair.pos = {x: 0, y: this.beeTarget.size.y / 2 - this.crosshair.size.y / 2 - 6};
        this.crosshair.style.backgroundImage = 'url("' + this.imagesSrc.crosshair + '")';
        this.crosshair.style.backgroundSize = "100% 100%";
        this.crosshair.style.position = "absolute";
        this.crosshair.style[brprefix + "transform"] = "translate3d(" + this.crosshair.pos.x + "px, " + this.crosshair.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.crosshair, 3);

////////////////////////////
// CIRCLE PROGRESS
////////////////////////////
        this.circleWrapper.size = {x: this.imagesSize.circleProgr.x, y: this.imagesSize.circleProgr.y};
        this.circleWrapper.style.width = this.circleWrapper.size.x + "px";
        this.circleWrapper.style.height = this.circleWrapper.size.y + "px";
        this.circleWrapper.style.position = "absolute";
        this.circleWrapper.style.opacity = 0.3;
        // this.circleWrapper.style.background = 'yellow';
        this.circleWrapper.pos = {x: -3, y: -9};
        this.circleWrapper.style[brprefix + "transform"] = "translate3d(" + this.circleWrapper.pos.x + "px, " + this.circleWrapper.pos.y + "px,0px)";
        // bradapter.applyZIndex(this.view, this.circleWrapper, 3);

// LEFT
        this.circleProgrL.size = {x: this.imagesSize.circleProgr.x / 2, y: this.imagesSize.circleProgr.y};
        this.circleProgrL.style.width = this.circleProgrL.size.x + "px";
        this.circleProgrL.style.height = this.circleProgrL.size.y + "px";
        this.circleProgrL.style.position = "absolute";

        this.circleProgrLWrap.size = this.imagesSize.circleProgr;
        this.circleProgrLWrap.style.width = this.circleProgrLWrap.size.x + "px";
        this.circleProgrLWrap.style.height = this.circleProgrLWrap.size.y + "px";
        this.circleProgrLWrap.style.position = "absolute";
        this.circleProgrLWrap.pos = {x: 0, y: 0};
        this.circleProgrLWrap.style[brprefix + "transform"] = "translate3d(" + this.circleProgrLWrap.pos.x + "px, " + this.circleProgrLWrap.pos.y + "px,0px)" +
            "rotateZ(" + 0 + "deg) ";

        this.circleProgrLRot.size = {x: this.imagesSize.circleProgr.x / 2, y: this.imagesSize.circleProgr.y};
        this.circleProgrLRot.style.width = this.circleProgrLRot.size.x + "px";
        this.circleProgrLRot.style.height = this.circleProgrLRot.size.y + "px";
        this.circleProgrLRot.style.position = "absolute";

        this.circleProgrLCirc.size = {x: this.imagesSize.circleProgr.x, y: this.imagesSize.circleProgr.y};
        this.circleProgrLCirc.style.width = this.circleProgrLCirc.size.x + "px";
        this.circleProgrLCirc.style.height = this.circleProgrLCirc.size.y + "px";
        this.circleProgrLCirc.style.border = '0px solid';
        this.circleProgrLCirc.style.background = 'green';
        this.circleProgrLCirc.style.borderRadius = '860px';
        this.circleProgrLCirc.style.backgroundSize = "100% 100%";
        this.circleProgrLCirc.style.position = "absolute";

// RIGHT
        this.circleProgrR.size = {x: this.imagesSize.circleProgr.x / 2, y: this.imagesSize.circleProgr.y};
        this.circleProgrR.style.width = this.circleProgrR.size.x + "px";
        this.circleProgrR.style.height = this.circleProgrR.size.y + "px";
        this.circleProgrR.pos = {x: this.imagesSize.circleProgr.x / 2, y: 0};
        this.circleProgrR.style[brprefix + "transform"] = "translate3d(" + this.circleProgrR.pos.x + "px, " + this.circleProgrR.pos.y + "px,0px)";
        this.circleProgrR.style.position = "absolute";

        this.circleProgrRWrap.size = this.imagesSize.circleProgr;
        this.circleProgrRWrap.style.width = this.circleProgrRWrap.size.x + "px";
        this.circleProgrRWrap.style.height = this.circleProgrRWrap.size.y + "px";
        this.circleProgrRWrap.style.position = "absolute";
        this.circleProgrRWrap.pos = {x: -(this.imagesSize.circleProgr.x / 2 + 1), y: 0};
        this.circleProgrRWrap.style[brprefix + "transform"] = "translate3d(" + this.circleProgrRWrap.pos.x + "px, " + this.circleProgrRWrap.pos.y + "px,0px)" +
            "rotateZ(" + 45 + "deg) ";


        this.circleProgrRRot.size = {x: this.imagesSize.circleProgr.x / 2, y: this.imagesSize.circleProgr.y};
        this.circleProgrRRot.style.width = this.circleProgrRRot.size.x + "px";
        this.circleProgrRRot.style.height = this.circleProgrRRot.size.y + "px";
        this.circleProgrRRot.pos = {x: this.imagesSize.circleProgr.x / 2 + 1, y: 0};
        this.circleProgrRRot.style[brprefix + "transform"] = "translate3d(" + this.circleProgrRRot.pos.x + "px, " + this.circleProgrRRot.pos.y + "px,0px)";
        this.circleProgrRRot.style.position = "absolute";


        this.circleProgrRCirc.size = {x: this.imagesSize.circleProgr.x, y: this.imagesSize.circleProgr.y};
        this.circleProgrRCirc.style.width = this.circleProgrRCirc.size.x + "px";
        this.circleProgrRCirc.style.height = this.circleProgrRCirc.size.y + "px";
        this.circleProgrRCirc.style.border = '0px solid';
        this.circleProgrRCirc.style.background = 'green';
        this.circleProgrRCirc.pos = {x: -(this.imagesSize.circleProgr.x / 2 + 1), y: 0};
        this.circleProgrRCirc.style[brprefix + "transform"] = "translate3d(" + this.circleProgrRCirc.pos.x + "px, " + this.circleProgrRCirc.pos.y + "px,0px)";
        this.circleProgrRCirc.style.borderRadius = '860px';
        this.circleProgrRCirc.style.backgroundSize = "100% 100%";
        this.circleProgrRCirc.style.position = "absolute";

    }

    NarrBees.prototype.unload = function () {
        delete this.hive;
        delete this.paws;
        delete this.pause;
        delete this.minigame;
        delete this.fade;
        delete this.bees;
        delete this.testPoint;
        delete this.crosshair;
        delete this.beeTarget;
        delete this.HPBar;
        delete this.HPBarBorder;
        delete this.beeTargetMask;
        delete this.minigameAnimPic;

        delete this.ok;

        delete this.circleWrapper;
        delete this.circleProgrL;
        delete this.circleProgrLWrap;
        delete this.circleProgrLRot;
        delete this.circleProgrLCirc;
        delete this.circleProgrR;
        delete this.circleProgrRWrap;
        delete this.circleProgrRRot;
        delete this.circleProgrRCirc;

        for (this.i = 0; this.i < this.maxBearCount; this.i++) {
            delete this.bears[this.i];
            delete this.balloons[this.i];
        }
        for (this.i = 0; this.i < 3; this.i++) {
            delete this.minigameBees[this.i];
        }
        delete this.curBee;
        delete this.curBear;
        delete this.curBalloon;
        delete this.newBear;
        delete this.newBalloon;
        delete this.minigameBear;

        this.deleteDomElements(this.view);

        this.isInited = false;
    };


    NarrBees.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrBees.prototype.shuffle = function (o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    NarrBees.prototype.draw = function () { // необязательно
        // this.fullPause = 0; // comment for release

        if (this.fullPause == 0) {
            this.reInitGame();
            this.pause.style.display = 'block';
        }
        this.switchPause(this.fullPause);
    };

    NarrBees.prototype.loop = function (dt) { // необязательно
        dt = Math.min(dt, 100);
        if (!this.isInited)
            return;

        if (this.loopPause || this.fullPause)
            return;

        if (this.minigameIsActive) {
            this.processMinigame(dt);
        }
        else {
            this.processGesture(dt);
            this.processBees(dt);
            this.processBears(dt);
            this.processGamePhase(dt);
            if (this.justLost) {
                this.processLoseSeq(dt);
            }
        }

    };

    NarrBees.prototype.switchPause = function (new_value) {
        this.loopPause = (new_value === undefined) ? !this.loopPause : new_value;

        if (this.loopPause)
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y) + "px";
        else
            this.pause.style.backgroundPosition = "0px " + 0 + "px";
    }

    NarrBees.prototype.reInitGame = function () {

        this.bearInterval = this.initBearInterval[0];
        this.bearTimer = 0;//this.bearInterval;

        this.bees.state = 0;

        this.gamePhase = 0;
        this.gameTimer = 0;

        this.loopPause = false;
        this.justLost = false;

        this.initAllElements();

        for (this.i = 0; this.i < this.maxBearCount; this.i++) {
            this.curBear = this.bears[this.i];
            this.curBalloon = this.balloons[this.i];
            this.curBear.isActive = false;
            this.curBear.style.display = 'none';
            this.curBalloon.style.display = 'none';
        }
    }

    NarrBees.prototype.processGesture = function (dt) {
        if (this.gesture.isStarted) {
            this.gesture.timeFromStart += dt;
        }
    }

    NarrBees.prototype.processBees = function (dt) {
        switch (this.bees.state) {
            case 0:
                break;
            case 1:
                this.bees.pos.x += dt * this.beesSpeed * this.bees.direction.x;
                this.bees.pos.y += dt * this.beesSpeed * this.bees.direction.y;
                if (this.bees.pos.x < -100 || this.bees.pos.x > this.moduleSize.x + 100 || this.bees.pos.y > this.moduleSize.y + 100)
                    this.bees.state = 2;

                this.bees.style[brprefix + "transform"] = "translate3d(" + this.bees.pos.x + "px, " + this.bees.pos.y + "px,0px)" +
                    "rotateZ(" + this.angle + "rad) ";

                this.testPoint.pos = this.bees.intersectOffset;
                this.testPoint.style[brprefix + "transform"] = "translate3d(" + (this.testPoint.pos.x + this.bees.pos.x) + "px, " + (this.testPoint.pos.y + this.bees.pos.y) + "px,0px)";
                break;
            case 2:
                this.bees.pos = {x: this.imagesPos.bees.x, y: this.imagesPos.bees.y};
                this.bees.style[brprefix + "transform"] = "translate3d(" + this.bees.pos.x + "px, " + this.bees.pos.y + "px,0px)" +
                    "rotateZ(" + this.angle + "rad) ";

                this.bees.style.opacity = 0.999;
                this.bees.style.display = 'none';
                this.bees.size.x = this.imagesSize.bees.x;
                this.bees.size.y = this.imagesSize.bees.y;
                this.bees.style.width = this.bees.size.x + "px";
                this.bees.style.height = this.bees.size.y + "px";
                this.bees.state = 0;

                this.hive.style.backgroundPosition = -this.hive.size.x + "px 0px";
                break;

            case 3:

                break;
        }
    }

    NarrBees.prototype.processGamePhase = function (dt) {
        if (this.gamePhase >= 3)
            return;

        this.gameTimer += dt;
        if (this.gameTimer > this.phaseTime[this.gamePhase]) {
            this.gamePhase++;
            this.bearTimer = this.initBearInterval[this.gamePhase];
        }
    }

    NarrBees.prototype.processLoseSeq = function (dt) {
        this.loseTimer += dt;
        switch (this.loseState) {
            case 0:
                if (this.loseTimer > this.loseAnimT1) {
                    this.loseState = 1;
                    this.loseTimer = 0;
                }
                else {
                    this.loseAnimProgr = this.loseTimer / this.loseAnimT1;
                    this.paws.style.backgroundPosition = "0px " + (-this.paws.size.y) * (1 - this.loseAnimProgr) + "px";
                }
                break;
            case 1:
                if (this.loseTimer > this.loseAnimT2) {
                    this.loseState = 2;
                }
                else {
                    this.loseAnimProgr = this.loseTimer / this.loseAnimT2;
                    this.paws.style.backgroundPosition = -this.paws.size.x + "px " + (-this.paws.size.y) * this.loseAnimProgr + "px";

                    this.hive.style.backgroundPosition = -this.hive.size.x + "px " + (-this.paws.size.y) * this.loseAnimProgr + "px";

                }
                break;
            case 2:
                this.loopPause = true;
                this.fullPause = true;
                this.pause.style.display = 'none';
                this.delegate.fireEvent("performAnimation", [this.anim_lost]);
                break;
        }
    }


    NarrBees.prototype.processBears = function (dt) {
        this.bearTimer -= dt;

        if (this.bearTimer < 0 && this.gamePhase != 4) {
            this.bearTimer = this.initBearInterval[this.gamePhase]; // add random
            this.spawnBear();
        }
        for (this.i = 0; this.i < this.maxBearCount; this.i++) {
            this.curBear = this.bears[this.i];
            if (!this.curBear.isActive)
                continue;
            this.updateBear(this.curBear, dt);
        }
    }

    NarrBees.prototype.spawnBear = function () {
        this.newBear = this.bears[this.curBearNum];
        this.newBalloon = this.balloons[this.curBearNum++];

        if (this.curBearNum == this.maxBearCount)
            this.curBearNum = 0;

        this.random = Math.random();
        switch (this.gamePhase) {
            case 0:
                this.newBear.bearType = 0;
                break;
            case 1:
                this.newBear.bearType = this.random > 0.5 ? 0 : 1;
                // this.newBear.bearType = 1;
                break;
            case 2:
                this.newBear.bearType = this.random > 0.5 ? (this.random > 0.75 ? 0 : 1) : 2;
                // this.newBear.bearType = 2;
                break;
            case 3:
                this.newBear.bearType = 3;
                this.gamePhase++; // turn off spawns, boss is single
                // this.newBear.bearType = this.random > 0.5 ? 0 : 1;
                break;
            case 4:
                return;
            default:
                break;
        }

        this.newBear.size = this.imagesSize.bear[this.newBear.bearType];
        this.newBear.style.width = this.newBear.size.x + "px";
        this.newBear.style.height = this.newBear.size.y + "px";
        this.newBear.pos = {x: Math.random() * (this.moduleSize.x - this.newBear.size.x), y: this.moduleSize.y + 80};
        if (this.newBear.bearType == 3)
            this.newBear.pos = {x: (Math.random() * 0.5 + 0.25) * (this.moduleSize.x - this.newBear.size.x), y: this.moduleSize.y + 80}; // center final bear
        this.newBear.style.backgroundPosition = "0px 0px";
        this.newBear.style.backgroundImage = 'url("' + this.imagesSrc.bear[this.newBear.bearType] + '")';
        this.newBear.style.backgroundSize = "auto 100%";
        this.newBear.style.position = "absolute";
        this.newBear.style[brprefix + "transform"] = "translate3d(" + this.newBear.pos.x + "px, " + this.newBear.pos.y + "px,0px)";
        this.newBear.style.display = 'block';
        this.newBear.speed = this.bearsInitSpeed[this.newBear.bearType];
        this.newBear.state = 0;
        this.newBear.HP = this.HPData[this.newBear.bearType];
        this.newBear.isActive = true;
        bradapter.applyZIndex(this.view, this.newBear, 3);

        this.newBear.balloon = this.newBalloon;

        this.newBalloon.size = this.imagesSize.bear[this.newBear.bearType];
        this.newBalloon.style.width = this.newBalloon.size.x + "px";
        this.newBalloon.style.height = this.newBalloon.size.y + "px";
        this.newBalloon.pos = {x: this.newBear.pos.x, y: this.newBear.pos.y - this.balloonsOffset[this.newBear.bearType]};
        this.randomBalloonN = Math.floor(this.imagesSrc.balloon[this.newBear.bearType].length * Math.random());
        this.newBalloon.style.backgroundImage = 'url("' + this.imagesSrc.balloon[this.newBear.bearType][this.randomBalloonN] + '")';
        this.newBalloon.style.backgroundSize = "100% 100%";
        this.newBalloon.style.position = "absolute";
        this.newBalloon.style[brprefix + "transform"] = "translate3d(" + this.newBalloon.pos.x + "px, " + this.newBalloon.pos.y + "px,0px)";
        this.newBalloon.style.display = 'block';
        bradapter.applyZIndex(this.view, this.newBalloon, 2);
    }

    NarrBees.prototype.updateBear = function (curBear, dt) {
        if (curBear.bearType == 3) {
            this.bossAnimT += dt;
            this.bossAnimT %= this.bossAnimFrameTime * this.bossAnimFrameCount;
            this.bossState = ~~(this.bossAnimT / this.bossAnimFrameTime);

            if (this.bossState != this.lastBossState) {
                curBear.style.backgroundPosition = -curBear.size.x * this.bossState + 'px 0px';
            }
            this.lastBossState = this.bossState;
        }
        switch (curBear.state) {
            case 0:
                curBear.pos.y -= curBear.speed * dt;
                curBear.style[brprefix + "transform"] = "translate3d(" + curBear.pos.x + "px, " + curBear.pos.y + "px,0px)";
                curBear.balloon.pos = {x: curBear.pos.x, y: curBear.pos.y - this.balloonsOffset[curBear.bearType]};
                curBear.balloon.style[brprefix + "transform"] = "translate3d(" + curBear.balloon.pos.x + "px, " + curBear.balloon.pos.y + "px,0px)";

                if (this.checkCollision(curBear)) {
                    if (curBear.bearType >= 1) {
                        this.minigameIsActive = true;
                        this.mingameState = 0;
                        this.minigameTimer = 0;
                        this.minigameBear = curBear;

                        this.beesToShot = 3;

                        this.minigameBees[0].style.display = 'block';
                        this.minigameBees[1].style.display = 'block';
                        this.minigameBees[2].style.display = 'block';

                        this.bees.startPos = this.bees.pos;
                        curBear.state = 2;
                        this.fade.style.display = 'block';
                        this.minigameAnimPic.style.width = "0px";
                        this.minigameAnimPic.style.height = "0px";
                        this.minigameAnimPic.style.display = 'block';
                        this.minigameAnimPic.startPos = {x: curBear.pos.x + curBear.size.x / 2, y: curBear.pos.y + curBear.size.y / 2};
                    }
                    else {
                        this.bees.state = 2;
                        curBear.state = 1;
                        curBear.style.backgroundPosition = -curBear.size.x + "px 0px";
                    }
                }
                else if ((curBear.pos.y < -curBear.size.y) && !this.justLost /*&& 0 debug*/) {
                    curBear.isActive = false;
                    this.justLost = true;
                    this.loseTimer = 0;
                    this.loseState = 0;
                }
                break;
            case 1:
                curBear.speed += dt * this.gravity;
                curBear.pos.y -= curBear.speed * dt;
                curBear.style[brprefix + "transform"] = "translate3d(" + curBear.pos.x + "px, " + curBear.pos.y + "px,0px)";
                curBear.balloon.pos.y += curBear.speed * dt / 5;
                curBear.balloon.style[brprefix + "transform"] = "translate3d(" + curBear.balloon.pos.x + "px, " + curBear.balloon.pos.y + "px,0px)";
                break;
            case 2:

                break;
        }
    }

    NarrBees.prototype.processMinigame = function (dt) {
        switch (this.mingameState) {
            case 0: // pre-game animation
                this.minigameTimer += dt;
                if (this.minigameTimer > this.miniGAnimT) {
                    this.bees.style.opacity = 0.001;
                    // this.fade.style.opacity = 0.001;
                    this.minigameTimer = 0;
                    this.mingameState = 1;
                    this.phase = 0;

                    this.minigame.style.display = 'block';
                    this.circleWrapper.style.display = 'block';
                    this.beeTarget.style.display = 'block';
                    this.HPBar.style.display = 'block';
                    this.minigameAnimPic.style.display = 'none';
                    this.HPperc = this.minigameBear.HP / this.HPData[this.minigameBear.bearType];
                    this.HPBar.style.backgroundPosition = "0px " + (this.HPperc - 1) * 390 + "px";
                    // this.minigameBear
                    this.minigameTimer = 0;
                }
                else {
                    this.progress = this.minigameTimer / this.miniGAnimT;
                    this.processMiniGAnim(this.progress);
                }
                break;
            case 1: // minigame itself
                this.minigameTimer += dt;

                this.updateTarget(dt);

                this.miniGProgress = this.minigameTimer / this.miniGPlayT;
                if (this.miniGPlayT < this.minigameTimer) {
                    this.circleWrapper.style.display = 'none';
                    this.exitMiniGame();
                }
                else {
                    if (this.fade.style.opacity != 0.001) {
                        this.fadeOurProgress = this.minigameTimer / this.fadeOutTime;
                        this.fade.style.opacity = Math.min(0.999, 1 * Math.max(0.001, 1 - this.fadeOurProgress * this.fadeOurProgress));
                    }
                    this.updateTimer(this.miniGProgress);
                }
                break;
            case 2: // exit
                this.minigameTimer += dt;
                if (this.miniGFinalT < this.minigameTimer) {
                    this.mingameState = 0;
                    this.minigameIsActive = false;
                    this.minigame.style.display = 'none';
                    this.ok.style.display = 'none';
                    // this.fade.style.opacity = 0.0;
                    this.fade.style.display = 'none';
                    this.beeTarget.style.display = 'none';
                    this.HPBar.style.display = 'none';

                    this.bees.state = 2;
                    if (this.minigameBear.HP > 0) {
                        this.minigameBear.state = 0;
                    }
                    else {
                        if (this.minigameBear.bearType != 3) {
                            this.minigameBear.state = 1;
                            this.minigameBear.style.backgroundPosition = -this.minigameBear.size.x + "px 0px";
                        } else {
                            this.minigameBear.style.display = 'none';
                            this.pause.style.display = 'none';
                            this.loopPause = true;
                            this.fullPause = true;
                            this.delegate.fireEvent("performAnimation", [this.anim_win]);
                        }
                    }
                }
                else {
                    this.progress = this.minigameTimer / this.miniGFinalT;

                    // if (this.minigameBear.HP > 0){
                    //     this.ok.style.backgroundImage = 'url("' + this.imagesSrc.notOk + '")';
                    // }
                    // else{
                    //     this.ok.style.backgroundImage = 'url("' + this.imagesSrc.ok + '")';
                    // }
                }
                break;
        }
    }

    NarrBees.prototype.processMiniGAnim = function (progress) {
        // this.bees.size.x = this.imagesSize.bees.x + 1.5*progress*(this.moduleSize.x - this.imagesSize.bees.x);
        // this.bees.size.y = this.imagesSize.bees.y + 1.5*progress*(this.moduleSize.y - this.imagesSize.bees.y);
        // this.bees.style.width = this.bees.size.x + "px";
        // this.bees.style.height = this.bees.size.y + "px";
        // this.bees.pos = {x:this.bees.startPos.x + (-this.moduleSize.x*0.2 - this.bees.startPos.x)*progress, y:this.bees.startPos.y + (-this.moduleSize.y*0.2 - this.bees.startPos.y)*progress};
        // this.bees.style[brprefix + "transform"] = "translate3d(" + this.bees.pos.x + "px, " + this.bees.pos.y + "px,0px)" +
        //                                                     "rotateZ(" + this.angle + "rad) ";

        // if (progress > 0.5)
        //     this.minigame.style.display = 'block';
        // this.bees.style.opacity = Math.min(0.999, Math.max(0.001, 2 - 2*progress));
        // this.fade.style.opacity = Math.min(0.999, 0.6*Math.max(0.001, 2 - 2*progress))

        this.minigameAnimPic.size.x = progress * (this.imagesSize.minigameAnimPic.x);
        this.minigameAnimPic.size.y = progress * (this.imagesSize.minigameAnimPic.y);
        this.minigameAnimPic.style.width = this.minigameAnimPic.size.x + "px";
        this.minigameAnimPic.style.height = this.minigameAnimPic.size.y + "px";
        this.minigameAnimPic.pos = {x: this.minigameAnimPic.startPos.x + (this.imagesPos.beeTarget.x - this.minigameAnimPic.startPos.x) * progress, y: this.minigameAnimPic.startPos.y + (this.imagesPos.beeTarget.y - this.minigameAnimPic.startPos.y) * progress};
        this.minigameAnimPic.style[brprefix + "transform"] = "translate3d(" + this.minigameAnimPic.pos.x + "px, " + this.minigameAnimPic.pos.y + "px,0px)";

        // if (progress > 0.5)
        //     this.minigame.style.display = 'block';

        this.fade.style.opacity = Math.min(0.999, 1 * Math.max(0.001, 2 * progress * progress - 1));
    }

    NarrBees.prototype.updateTarget = function (dt) {
        this.period = 5000;
        this.phase += dt / this.period * 2 * 360;
        this.phase %= 360;

        this.damage = 1 - Math.abs(Math.sin(this.phase * Math.PI / 180));
        this.magnitude = this.beeTarget.size.x - this.crosshair.size.x;
        this.crosshair.pos.x = (Math.sin(this.phase * Math.PI / 180) + 1) * this.magnitude / 2;
        this.crosshair.style[brprefix + "transform"] = "translate3d(" + this.crosshair.pos.x + "px, " + this.crosshair.pos.y + "px,0px)";
    }

    NarrBees.prototype.updateTimer = function (progress) {
        this.angleR = (progress > 0.5) ? 180 : progress * 2 * 180;
        this.angleL = (progress > 0.5) ? (progress - 0.5) * 2 * 180 : 0;

        this.circleProgrRWrap.style[brprefix + "transform"] = "translate3d(" + this.circleProgrRWrap.pos.x + "px, " + this.circleProgrRWrap.pos.y + "px,0px)" +
            "rotateZ(" + this.angleR + "deg) ";
        this.circleProgrLWrap.style[brprefix + "transform"] = "translate3d(" + this.circleProgrLWrap.pos.x + "px, " + this.circleProgrLWrap.pos.y + "px,0px)" +
            "rotateZ(" + this.angleL + "deg) ";
    }

    NarrBees.prototype.exitMiniGame = function () {
        this.minigameTimer = 0;
        this.mingameState = 2;
        if (this.minigameBear.HP > 0) {
            this.ok.style.backgroundImage = 'url("' + this.imagesSrc.notOk + '")';
        }
        else {
            this.ok.style.backgroundImage = 'url("' + this.imagesSrc.ok + '")';
        }
        this.ok.style.display = 'block';
        this.minigameAnimPic.style.display = 'none';
    }

    NarrBees.prototype.checkCollision = function (curBear) {
        if (this.bees.state == 0)
            return false;
        this.intersectPointPos = {x: this.bees.intersectOffset.x + this.bees.pos.x, y: this.bees.intersectOffset.y + this.bees.pos.y};
        return (curBear.pos.y < this.intersectPointPos.y && (curBear.pos.y + this.curBear.size.y) > this.intersectPointPos.y &&
            curBear.pos.x < this.intersectPointPos.x && (curBear.pos.x + this.curBear.size.x) > this.intersectPointPos.x);
    }

    NarrBees.prototype.beesStart = function (e, obj) {
        if (this.fullPause)
            return false;
        e.stopPropagation();
        if (!obj || this.bees.state != 0 || this.fullPause || this.loopPause)
            return false;

        this.gesture.isStarted = true;
        this.gesture.eStart = this.getInternalCoordinatesForPoint(e);
        this.gesture.timeFromStart = 0;

        return true;
    };

    NarrBees.prototype.beesMove = function (e) {
        e.stopPropagation();

        this.e = this.getInternalCoordinatesForPoint(e);

        this.eStart = this.getInternalCoordinatesForPoint(e);
    };

    NarrBees.prototype.beesEnd = function (e) {
        e.stopPropagation();
        this.gesture.eEnd = this.getInternalCoordinatesForPoint(e);
        if (this.gesture.timeFromStart <= this.gesture.timeForSwipe /*&& this.bees.isFlying == false*/) {

            this.dX = this.gesture.eEnd.x - this.gesture.eStart.x;
            this.dY = this.gesture.eEnd.y - this.gesture.eStart.y;
            this.gestLength = (Math.sqrt(this.dX * this.dX + this.dY * this.dY));
            if (!this.gestLength) {
                this.gesture.isStarted = false;
                return;
            }
            this.bees.state = 1;
            this.bees.direction = {
                x: this.dX / this.gestLength,
                y: this.dY / this.gestLength,
            };

            this.bees.pos = {x: this.imagesPos.bees.x, y: this.imagesPos.bees.y};
            this.angle = Math.acos(this.dX / this.gestLength) - Math.PI / 2;

            if (this.dY < 0) {
                this.bees.style.display = 'none';
                this.bees.state = 0;
            }
            else {
                this.bees.style.display = 'block';
                this.hive.style.backgroundPosition = 0 + "px 0px";
            }

            this.bees.intersectOffset = {x: this.bees.size.x / 2 + this.bees.size.x / 2 * this.bees.direction.x, y: this.bees.size.y / 2 + this.bees.size.x / 2 * this.bees.direction.y};
        }

        this.gesture.isStarted = false;
    };

    NarrBees.prototype.targetEnd = function (e, obj) {
        if (this.fullPause)
            return false;
        e.stopPropagation();

        if (typeof obj === 'object') {
            this.switchPause();
        }
        else if (this.mingameState == 1) {
            if (!(this.fullPause || this.loopPause)) {
                this.minigameBear.HP -= 50 * this.damage;
                this.HPperc = this.minigameBear.HP / this.HPData[this.minigameBear.bearType];
                this.HPBar.style.backgroundPosition = "0px " + (this.HPperc - 1) * 390 + "px";
                this.minigameBees[3 - this.beesToShot].style.display = 'none';

                if (!--this.beesToShot || this.minigameBear.HP <= 0)
                    this.exitMiniGame();
            }
        }
    };

    NarrBees.prototype.customHittest = function (e, gesture) {
        if (this.fullPause)
            return false;
        if (gesture == 'NarrBeesPan') {
            if (this.hittestForRect({pType: 0, left: this.hive.pos.x, top: this.hive.pos.y, width: this.hive.size.x, height: this.hive.size.y}, e)) {
                return this.hive;
            }
        }
        else if (gesture == 'NarrBeesTap') {
            if (this.hittestForRect({pType: 0, left: this.pause.pos.x, top: this.pause.pos.y, width: this.pause.size.x, height: this.pause.size.y}, e)) {
                return this.pause;
            }
            return true;
        }
        else
            return false;
    };

    Utils.addBehaviour('pan', 'NarrBees', 'NarrBeesPan', {
        start: function (e, obj) {
            return this.beesStart(e, obj);
        }, move: function (e) {
            this.beesMove(e);
        }, swipe: function (e) {
            e.stopPropagation();
        }, end: function (e) {
            this.beesEnd(e);
        }}, false);

    Utils.addBehaviour('tap', 'NarrBees', 'NarrBeesTap', {
        end: function (e, obj) {
            this.targetEnd(e, obj);
        }}, false);

    return NarrBees;
});