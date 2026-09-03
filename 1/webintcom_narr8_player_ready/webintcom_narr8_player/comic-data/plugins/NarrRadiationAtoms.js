define(["utils/Utils"], function (Utils) {

    var NarrRadiationAtoms = Utils.newObjectType(NarrRadiationAtoms, "NarrRadiationAtoms", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrRadiationAtoms.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        this.view.style.background = '#192e2b';
        // this.view.style.backgroundImage = 'url("img/radiation_atoms/dopdop_text.png")';

        this.eStart = {};
        this.e = {};

        this.firstStart = true;
        this.delegate.addEventListener("timer", this.loop, this);

        this.nucleonsCount = 190;
        this.nucleonsLimit1 = 22;

        this.magicNmbs = [2, 8, 20, 35, 50, 65, 80, 95];
        this.pauses = [4000, 1800, 200];
        this.decayCounters = [5, 50, 5];

        this.flagTime = 150;

        this.shakeSpeed = 300 / 1000; // px/ms
        this.shakeSpeedCur = this.shakeSpeed;
        this.shakeMagnitude = 8;

        this.flagTextContent = [
            ['He', '4'],
            ['O', '16'],
            ['Ca', '40'],
            ['Pb', '208'],
            ['Np', '235'],
            ['Cm', '241'],
            ['Fm', '253'],
        ];
    };

    NarrRadiationAtoms.prototype.load = function () {
        this.flag = document.createElement('div');
        this.flagText0 = document.createElement('div');
        this.flagText1 = document.createElement('div');
        this.shaft = document.createElement('div');
        this.scale = document.createElement('div');
        this.grip = document.createElement('div');
        this.circlesWrapper = document.createElement('div');
        this.circlesPos = document.createElement('div');
        this.decayTimer = document.createElement('div');
        this.triangle = document.createElement('div');
        this.electronsWrapper = document.createElement('div');
        this.electronsAll = document.createElement('div');
        this.electrons = [];
        for (this.i = 0; this.i < 3; this.i++) {
            this.electrons[this.i] = document.createElement('div');
        }


        this.shaft.size = this.imagesSize.shaft;
        this.shaft.style.width = this.shaft.size.x + "px";
        this.shaft.style.height = this.shaft.size.y + "px";
        this.shaft.pos = {x: this.imagesPos.center.x - this.shaft.size.x / 2 + this.imagesSize.nucleon.x / 2, y: this.imagesPos.center.y - this.shaft.size.y + this.imagesSize.nucleon.y / 2};
        this.shaft.style.backgroundImage = 'url("' + this.imagesSrc.shaft + '")';
        this.shaft.style.backgroundSize = "100% 100%";
        this.shaft.style.position = "absolute";
        this.shaft.style[brprefix + "transform"] = "translate3d(" + this.shaft.pos.x + "px, " + this.shaft.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.shaft, 2);

        this.flag.size = this.imagesSize.flag;
        this.flag.style.width = this.flag.size.x + "px";
        this.flag.style.height = this.flag.size.y + "px";
        this.flag.pos = this.imagesPos.flag;
        this.flag.style.backgroundImage = 'url("' + this.imagesSrc.flag + '")';
        this.flag.style.backgroundSize = "100% 100%";
        this.flag.style.backgroundPosition = 0 + "px 0px";
        this.flag.style.position = "absolute";
        this.flag.style[brprefix + "transform"] = "translate3d(" + this.flag.pos.x + "px, " + this.flag.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.flag, 3);

        this.flagText0.size = this.imagesSize.flag;
        this.flagText0.style.width = this.flagText0.size.x + "px";
        this.flagText0.style.height = this.flagText0.size.y + "px";
        this.flagText0.innerHTML = this.flagTextContent[0][0];
        this.flagText0.style.position = "absolute";
        this.flagText0.style.textAlign = 'left';
        this.flagText0.style.margin = '15px 0 0 25px';
        this.flagText0.style.color = '#192e2b';
        this.flagText0.style.fontFamily = "PT Sans";
        this.flagText0.style.fontSize = "25px";
        this.flagText0.style.fontWeight = "bold";

        // console.log(this.flagTextContent[0][1]);

        this.flagText1.size = this.imagesSize.flag;
        this.flagText1.style.width = 31 + "px";
        this.flagText1.style.height = this.flagText1.size.y + "px";
        this.flagText1.innerHTML = this.flagTextContent[0][1];
        this.flagText1.style.position = "absolute";
        this.flagText1.style.textAlign = 'right';
        this.flagText1.style.margin = '2px 0 0 0px';
        this.flagText1.style.color = '#192e2b';
        this.flagText1.style.fontFamily = "PT Sans";
        this.flagText1.style.fontSize = "14px";
        this.flagText1.style.fontWeight = "bold";


        this.electronsWrapper.size = this.imagesSize.electrons;
        this.electronsWrapper.style.width = this.electronsWrapper.size.x + "px";
        this.electronsWrapper.style.height = this.electronsWrapper.size.y + "px";
        this.electronsWrapper.pos = {x: this.imagesPos.electrons.x, y: this.imagesPos.electrons.y};
        this.electronsWrapper.style.position = "absolute";
        this.electronsWrapper.style[brprefix + "transform"] = "translate3d(" + this.electronsWrapper.pos.x + "px, " + this.electronsWrapper.pos.y + "px,0px)";

        this.electronsAll.size = this.imagesSize.electrons;
        this.electronsAll.style.width = this.electronsAll.size.x + "px";
        this.electronsAll.style.height = this.electronsAll.size.y + "px";
        this.electronsAll.pos = {x: 0, y: 0};
        this.electronsAll.style.backgroundImage = 'url("' + this.imagesSrc.electrons + '")';
        this.electronsAll.style.backgroundSize = "auto 100%";
        this.electronsAll.style.position = "absolute";
        this.electronsAll.style[brprefix + "transform"] = "translate3d(" + this.electronsAll.pos.x + "px, " + this.electronsAll.pos.y + "px,0px)";

        // for (this.i = 0; this.i < this.electrons.length; this.i++){
        //     this.temp = this.electrons[this.i];
        //     this.temp.size = this.imagesSize.electrons;
        //     this.temp.style.width = this.temp.size.x + "px";
        //     this.temp.style.height = this.temp.size.y + "px";
        //     this.temp.pos = this.imagesPos.electrons;
        //     this.temp.style.backgroundImage = 'url("' + this.imagesSrc.electrons[this.i] + '")';
        //     this.temp.style.backgroundSize = "100% 100%";
        // }

        this.scale.size = this.imagesSize.scale;
        this.scale.style.width = this.scale.size.x + "px";
        this.scale.style.height = this.scale.size.y + "px";
        this.scale.pos = this.imagesPos.scale;
        this.scale.style.backgroundImage = 'url("' + this.imagesSrc.scale + '")';
        this.scale.style.backgroundSize = "100% 100%";
        this.scale.style.position = "absolute";
        this.scale.style.overflow = "visible";
        this.scale.style[brprefix + "transform"] = "translate3d(" + this.scale.pos.x + "px, " + this.scale.pos.y + "px,0px)";

        this.decayTimer.size = this.imagesSize.decayTimer;
        this.decayTimer.style.width = this.decayTimer.size.x + "px";
        this.decayTimer.style.height = this.decayTimer.size.y + "px";
        this.decayTimer.pos = this.imagesPos.decayTimer;
        this.decayTimer.style.backgroundImage = 'url("' + this.imagesSrc.decayTimer + '")';
        this.decayTimer.style.backgroundSize = "auto 100%";
        this.decayTimer.style.position = "absolute";
        this.decayTimer.style.overflow = "visible";
        this.decayTimer.style[brprefix + "transform"] = "translate3d(" + this.decayTimer.pos.x + "px, " + this.decayTimer.pos.y + "px,0px)";

        this.decayTimer.style.lineHeight = this.decayTimer.style.height;
        this.decayTimer.style.textIndent = "50px"
        this.decayTimer.style.fontFamily = "MuseoSansCyrl500-700";
        this.decayTimer.style.fontSize = "25px";
        // this.decayTimer.style.fontWeight = "bold";
        this.decayTimer.style.color = "#737373";
        this.decayTimer.style.position = "absolute";
        this.decayTimer.innerHTML = " ";

        this.triangle.size = this.imagesSize.triangle;
        this.triangle.style.width = this.triangle.size.x + "px";
        this.triangle.style.height = this.triangle.size.y + "px";
        this.triangle.pos = this.imagesPos.triangle;
        this.triangle.style.backgroundImage = 'url("' + this.imagesSrc.triangle[0] + '")';
        this.triangle.style.backgroundSize = "100% 100%";
        this.triangle.style.position = "absolute";
        this.triangle.style.overflow = "visible";
        this.triangle.style[brprefix + "transform"] = "translate3d(" + this.triangle.pos.x + "px, " + this.triangle.pos.y + "px,0px)";

        this.step = 78.5;
        this.intervalsCount = 8;
        this.minPos = -this.imagesSize.grip.x / 2 + 4;
        this.maxPos = Math.floor(this.minPos + this.step * this.intervalsCount);

        // this.step = ~~((this.maxPos - this.minPos)/this.intervalsCount);

        this.grip.size = this.imagesSize.grip;
        this.grip.style.width = this.grip.size.x + "px";
        this.grip.style.height = this.grip.size.y + "px";
        this.grip.style.backgroundImage = 'url("' + this.imagesSrc.grip + '")';
        this.grip.style.backgroundSize = "100% 100%";

        this.grip.style.position = "absolute";
        this.grip.style.overflow = "visible";
        this.grip.pos = {x: this.minPos, y: 8};
        this.grip.style[brprefix + "transform"] = "translate3d(" + this.grip.pos.x + "px, " + this.grip.pos.y + "px,0px)";
        this.grip.startAnim = false;


///////////////////////////
// NUCLEONS
///////////////////////////
        this.circlesPos.pos = {x: this.imagesPos.center.x, y: this.imagesPos.center.y};
        this.circlesPos.style.position = "absolute";
        this.circlesPos.style.overflow = "visible";
        this.circlesPos.style[brprefix + "transform"] = "translate3d(" + this.circlesPos.pos.x + "px, " + this.circlesPos.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.circlesPos, 5);

        this.circlesWrapper.pos = {x: 0, y: 0};
        this.circlesWrapper.style.position = "absolute";
        this.circlesWrapper.style.overflow = "visible";
        this.circlesWrapper.style[brprefix + "transform"] = "translate3d(" + this.circlesWrapper.pos.x + "px, " + this.circlesWrapper.pos.y + "px,0px)";

        this.initIntervals();
        this.intervalN = 0;
        this.numInInterval = 0;

        for (this.i = 0; this.i < this.nucleonsCount / 2; this.i++) {
            this.tempRed = document.createElement('div');
            this.tempBlue = document.createElement('div');


            if (this.i >= this.magicNmbs[this.intervalN]) {
                this.intervalN++;
                this.numInInterval = 0;
            }

            this.tempRed.distance = this.tempBlue.distance = this.visibleR + this.numInInterval * this.intervals[this.intervalN].distance;

            this.tempRed.style.width = this.tempBlue.style.width = this.imagesSize.nucleon.x + "px";
            this.tempRed.style.height = this.tempBlue.style.height = this.imagesSize.nucleon.y + "px";
            this.tempRed.style.backgroundImage = 'url("' + this.imagesSrc.nucleon[0] + '")';
            this.tempBlue.style.backgroundImage = 'url("' + this.imagesSrc.nucleon[1] + '")';
            this.tempRed.style.position = this.tempBlue.style.position = "absolute";
            this.tempRed.style.backgroundSize = this.tempBlue.style.backgroundSize = "100% 100%";

            this.numInInterval++;
            this.circlesWrapper.appendChild(this.tempRed);
            this.circlesWrapper.appendChild(this.tempBlue);
        }
        ;

        this.initAngles();
///////////////////////////

        this.view.appendChild(this.circlesPos);
        this.circlesPos.appendChild(this.circlesWrapper);
        this.view.appendChild(this.decayTimer);
        this.view.appendChild(this.flag);
        this.flag.appendChild(this.flagText0);
        this.flag.appendChild(this.flagText1);
        this.view.appendChild(this.shaft);
        this.view.appendChild(this.scale);
        this.view.appendChild(this.triangle);
        this.scale.appendChild(this.grip);
        this.view.appendChild(this.electronsWrapper);
        this.electronsWrapper.appendChild(this.electronsAll);

        this.isInited = true;
        this.timer = 0;
        this.shake = 0;
        this.finalShakePoint = {};
        this.timerFlagShow = 0;
        this.timerFlagHide = 0;

        this.grip.pos.x = this.step + this.minPos;
        this.grip.style[brprefix + "transform"] = "translate3d(" + this.grip.pos.x + "px," + this.grip.pos.y + "px,0px)";
        this.nucleonsState = {};
        this.nucleonsState.level = Math.floor((this.grip.pos.x - this.minPos) / this.step);
        this.nucleonsState.position = (this.grip.pos.x - this.minPos - this.nucleonsState.level * this.step) / this.step;
        this.updateNucleons(this.nucleonsState);
    };

    NarrRadiationAtoms.prototype.initIntervals = function () {
        this.intervals = [];
        this.visibleR = 800;
        this.longerDist = 1800;
        // this.speed = 1/this.longerDist;

        for (this.i = 0; this.i < this.magicNmbs.length; this.i++) {
            this.intervals[this.i] = {};
            this.intervals[this.i].count = this.i ? this.magicNmbs[this.i] - this.magicNmbs[this.i - 1] : this.magicNmbs[this.i];
            this.intervals[this.i].distance = (this.longerDist - this.visibleR) / this.intervals[this.i].count;
        }
        ;
    };

    NarrRadiationAtoms.prototype.initAngles = function () {
        // this.nucleonsLevelsCount = [1, 5,10,15,25,30,38, 48, 60, 70,140]; // сколько нуклонов на каждом уровне
        // this.nucleonsLevelsR =     [0,15,30,45,60,75,90,105,120,135,150];
        this.nucleonsLevelsCount = [1, 5, 10, 20, 30, 40, 55, 70, 90, 110, 130]; // сколько нуклонов на каждом уровне
        // this.nucleonsLevelsR =     [0,15,30,45,55,65,75,105,120,135,150];
        this.nucleonsLevelsR = [0, 10, 23, 35, 50, 62, 70, 105, 120, 135, 145];

        this.curNucleonN = 0;

        for (this.i = 0; this.i < this.nucleonsLevelsCount.length; this.i++) {

            this.curLevelAngles = [];
            this.curLevelAngles[0] = Math.random() * 360;
            this.angStep = 360 / this.nucleonsLevelsCount[this.i];
            for (this.j = 1; this.j < this.nucleonsLevelsCount[this.i]; this.j++) {
                this.curLevelAngles[this.j] = this.curLevelAngles[this.j - 1] + this.angStep;
            }
            this.curLevelAngles = this.shuffle(this.curLevelAngles);

            for (this.j = 0; this.j < this.nucleonsLevelsCount[this.i]; this.j++) {

                if (this.curNucleonN >= this.nucleonsCount)
                    return;

                this.temp = this.circlesWrapper.childNodes[this.curNucleonN];
                this.temp.angle = this.curLevelAngles[this.j];

                // if (this.i>2)
                //     this.temp.finalR = this.nucleonsLevelsR[this.i] + ((0.2 - Math.random())*this.imagesSize.nucleon.x);
                // else
                if (this.i > 1)
                    this.temp.finalR = this.nucleonsLevelsR[this.i] + ((0.2 - 0.4 * Math.random()) * this.imagesSize.nucleon.x);
                else
                    this.temp.finalR = this.nucleonsLevelsR[this.i];
                if (this.curNucleonN > this.nucleonsLimit1 && !((this.curNucleonN % 4) < 2)) {
                    this.temp.finalR = 0;
                    this.j--;
                }

                // this.temp.angle = 0;


                this.temp.pos = {x: this.temp.distance * Math.cos(this.temp.angle * Math.PI / 180), y: this.temp.distance * Math.sin(this.temp.angle * Math.PI / 180)};
                this.temp.style[brprefix + "transform"] = "translate3d(" + this.temp.pos.x + "px, " + this.temp.pos.y + "px,0px)";
                bradapter.applyZIndex(this.view, this.temp, this.nucleonsCount - this.curNucleonN);

                this.curNucleonN++;
            }
        }
        ;
    };


    NarrRadiationAtoms.prototype.unload = function () {
        delete this.flag;
        delete this.flagText0;
        delete this.flagText1;
        delete this.shaft;
        delete this.scale;
        delete this.grip;
        delete this.circlesWrapper;
        delete this.circlesPos;
        delete this.decayTimer;
        delete this.triangle;
        delete this.electronsWrapper;
        delete this.electronsAll;
        for (this.i = 0; this.i < 3; this.i++) {
            delete this.electrons[this.i];
        }

        delete this.tempRed;
        delete this.tempBlue;

        delete this.temp;

        this.deleteDomElements(this.view);

        this.isInited = false;
        this.isMessageShowed = false;
    };


    NarrRadiationAtoms.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrRadiationAtoms.prototype.shuffle = function (o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    NarrRadiationAtoms.prototype.loop = function (dt) { // необязательно
        dt = Math.min(dt, 100);
        if (!this.isInited)
            return;
        this.updateTimer(dt);
        this.updateShake(dt);
        this.updateFlag(dt);

    };

    NarrRadiationAtoms.prototype.updateTimer = function (dt) {
        if (this.timer) {
            this.timer -= dt;
            this.tempNum = this.nucleonsState.level - 5;
            this.tempProgress = this.timer / this.pauses[this.tempNum];
            this.shake = 1 - this.tempProgress;
            this.decayTimer.innerHTML = "~ " + Math.max(0, Math.round(this.tempProgress * this.decayCounters[this.tempNum]));
            if (this.timer <= 0) {
                this.timer = 0;
                this.shake = 0;
                this.tmpGripPos = this.grip.pos.x;

                this.curFinalPos = (this.nucleonsState.level - 1) * this.step + this.minPos;
                this.grip.startAnim = true;
                this.animation = this.animateTo("tmpGripPos", this.curFinalPos, 1200, /*'easeInQuad'*/'linear');
                this.timerFlagHide = this.flagTime;
                this.decayTimer.innerHTML = "";
                this.triangle.style.backgroundImage = "";

                this.circlesWrapper.pos.x = 0;
                this.circlesWrapper.pos.y = 0;
                this.circlesWrapper.style[brprefix + "transform"] = "translate3d(" + this.circlesWrapper.pos.x + "px, " + this.circlesWrapper.pos.y + "px,0px)";

                this.electronsAll.pos = this.circlesWrapper.pos;
                this.electronsAll.style[brprefix + "transform"] = "translate3d(" + this.electronsAll.pos.x + "px, " + this.electronsAll.pos.y + "px,0px)";
            }
        }
    };

    NarrRadiationAtoms.prototype.updateShake = function (dt) {
        if (this.shake) {
            if (this.circlesWrapper.pos.x == 0) { // если нуклоны в начальном, положении (в покое)
                this.initShakeDirection(this.shake);
            }

            this.shakeSpeedCur = this.shakeSpeed * (1 + this.shake * this.shake);
            this.circlesWrapper.pos.x += this.shakeDir.x * dt * this.shakeSpeedCur * this.shake * this.shake;
            this.circlesWrapper.pos.y += this.shakeDir.y * dt * this.shakeSpeedCur * this.shake * this.shake;
            this.circlesWrapper.style[brprefix + "transform"] = "translate3d(" + this.circlesWrapper.pos.x + "px, " + this.circlesWrapper.pos.y + "px,0px)";

            // this.electronsAll.pos = this.circlesWrapper.pos;
            // this.electronsAll.style[brprefix + "transform"] = "translate3d(" + this.electronsAll.pos.x + "px, " + this.electronsAll.pos.y + "px,0px)";

            if ((Math.abs(this.circlesWrapper.pos.x) > Math.abs(this.finalShakePoint.x)) || (Math.abs(this.circlesWrapper.pos.y) > Math.abs(this.finalShakePoint.y)))
                this.initShakeDirection(this.shake);

        }
        else {
            this.permanentShake = 0.2;
            if (this.circlesWrapper.pos.x == 0) { // если нуклоны в начальном, положении (в покое)
                this.initShakeDirection(this.permanentShake);
            }

            this.shakeSpeedCur = this.shakeSpeed * 0.2;
            this.circlesWrapper.pos.x += this.shakeDir.x * dt * this.shakeSpeedCur * this.permanentShake;
            this.circlesWrapper.pos.y += this.shakeDir.y * dt * this.shakeSpeedCur * this.permanentShake;
            this.circlesWrapper.style[brprefix + "transform"] = "translate3d(" + this.circlesWrapper.pos.x + "px, " + this.circlesWrapper.pos.y + "px,0px)";

            if ((Math.abs(this.circlesWrapper.pos.x) > Math.abs(this.finalShakePoint.x)) || (Math.abs(this.circlesWrapper.pos.y) > Math.abs(this.finalShakePoint.y)))
                this.initShakeDirection(this.permanentShake);
        }
    };

    NarrRadiationAtoms.prototype.initShakeDirection = function (magnitude) {
        this.finalShakePoint.x = (2 * Math.random() - 1);
        this.finalShakePoint.y = ((Math.random() - 0.5) > 0 ? 1 : -1) * Math.sqrt(1 - this.finalShakePoint.x * this.finalShakePoint.x);

        this.shakeDir = {};
        this.shakeDir.x = this.finalShakePoint.x - this.circlesWrapper.pos.x;
        this.shakeDir.y = this.finalShakePoint.y - this.circlesWrapper.pos.y;
        this.norm = Math.sqrt(this.shakeDir.x * this.shakeDir.x + this.shakeDir.y * this.shakeDir.y)
        this.shakeDir.x /= this.norm;
        this.shakeDir.y /= this.norm;

        this.finalShakePoint.x *= this.shakeMagnitude * magnitude;
        this.finalShakePoint.y *= this.shakeMagnitude * magnitude;
    };


    NarrRadiationAtoms.prototype.updateFlag = function (dt) {
        if (this.timerFlagShow) {
            this.timerFlagShow -= dt;
            this.flag.style.backgroundPosition = -(this.timerFlagShow / this.flagTime) * this.flag.size.x + "px 0px";
            if (this.timerFlagShow <= 0) {
                this.timerFlagShow = 0;
                this.flag.style.backgroundPosition = 0 + "px 0px";
            }
        }
        else if (this.timerFlagHide) {
            this.timerFlagHide -= dt;
            this.flag.style.backgroundPosition = -(1 - this.timerFlagHide / this.flagTime) * this.flag.size.x + "px 0px";
            if (this.timerFlagHide <= 0) {
                this.timerFlagHide = 0;
                this.flag.style.backgroundPosition = -this.flag.size.x + "px 0px";
            }
        }
    };

    NarrRadiationAtoms.prototype.draw = function () { // необязательно
        //this.view.innerHTML=parseInt(this.value);
        if (this.grip && this.grip.startAnim) {

            this.nucleonsState = {};
            this.nucleonsState.level = Math.floor((this.tmpGripPos - this.minPos) / this.step);
            this.nucleonsState.position = (this.grip.pos.x - this.minPos - this.nucleonsState.level * this.step) / this.step;

            if (this.nucleonsState.level >= 4 && this.grip.isAutoAnimated) {
                this.shake = this.nucleonsState.position;
            }

            if (this.tmpGripPos === this.curFinalPos) {
                this.grip.startAnim = false;
                this.grip.isAutoAnimated = false;

                if (this.nucleonsState.level >= 5) {
                    this.timer = this.pauses[this.nucleonsState.level - 5];
                    this.grip.startAnim = true;
                    this.grip.isAutoAnimated = true;
                }
                else
                    this.decayTimer.style.backgroundPosition = "0px 0px";

                this.flagText0.innerHTML = this.flagTextContent[this.nucleonsState.level - 1][0];
                this.flagText1.innerHTML = this.flagTextContent[this.nucleonsState.level - 1][1];
                if (this.nucleonsState.level == 1) {
                    this.flagText0.style.margin = '15px 0 0 25px';
                    this.flagText1.style.width = 31 + "px";
                }
                else {
                    this.flagText0.style.margin = '15px 0 0 30px';
                    this.flagText1.style.width = 36 + "px";
                }

                this.timerFlagShow = this.flagTime;
                this.timerFlagHide = 0;
                this.shake = 0;

                this.triangle.style.backgroundImage = 'url("' + this.imagesSrc.triangle[Math.max(0, this.nucleonsState.level - 4)] + '")';
            }

            this.grip.pos.x = this.tmpGripPos;
            this.grip.style[brprefix + "transform"] = "translate3d(" + this.grip.pos.x + "px," + this.grip.pos.y + "px,0px)";

            this.updateNucleons(this.nucleonsState);
        }
        ;
    };


    NarrRadiationAtoms.prototype.updateNucleons = function (nucleonsState) { // необязательно
        this.intervalN = 0;
        this.numInInterval = 0;

        for (this.i = 0; this.i < this.nucleonsCount / 2; this.i++) {
            if (this.i >= this.nucleonsCount / 2)
                return;

            if (this.i >= this.magicNmbs[this.intervalN]) {
                this.intervalN++;
            }

            this.tempRed = this.circlesWrapper.childNodes[this.i * 2];
            this.tempBlue = this.circlesWrapper.childNodes[this.i * 2 + 1];

            if (this.intervalN < nucleonsState.level)
                this.tempRed.curDistance = this.tempRed.finalR;
            else if (this.intervalN > nucleonsState.level)
                this.tempRed.curDistance = this.tempRed.distance;
            else
                this.tempRed.curDistance = Math.max(this.tempRed.finalR, this.tempRed.distance - nucleonsState.position * this.longerDist);
            this.tempRed.pos = {x: this.tempRed.curDistance * Math.cos(this.tempRed.angle * Math.PI / 180), y: this.tempRed.curDistance * Math.sin(this.tempRed.angle * Math.PI / 180)};
            this.tempRed.style[brprefix + "transform"] = "translate3d(" + this.tempRed.pos.x + "px, " + this.tempRed.pos.y + "px,0px)";

            if (this.intervalN < nucleonsState.level)
                this.tempBlue.curDistance = this.tempBlue.finalR;
            else if (this.intervalN > nucleonsState.level)
                this.tempBlue.curDistance = this.tempBlue.distance;
            else
                this.tempBlue.curDistance = Math.max(this.tempBlue.finalR, this.tempBlue.distance - nucleonsState.position * this.longerDist);
            // this.tempBlue.curDistance = Math.max(this.tempBlue.finalR, this.tempBlue.distance - nucleonsState.position * this.longerDist);
            this.tempBlue.pos = {x: this.tempBlue.curDistance * Math.cos(this.tempBlue.angle * Math.PI / 180), y: this.tempBlue.curDistance * Math.sin(this.tempBlue.angle * Math.PI / 180)};
            this.tempBlue.style[brprefix + "transform"] = "translate3d(" + this.tempBlue.pos.x + "px, " + this.tempBlue.pos.y + "px,0px)";

            if (nucleonsState.level > 4)
                this.electronsAll.style.backgroundPosition = -this.electronsAll.size.x * 2 + "px 0px";
            else if (nucleonsState.level > 2)
                this.electronsAll.style.backgroundPosition = -this.electronsAll.size.x + "px 0px";
            else
                this.electronsAll.style.backgroundPosition = 0 + "px 0px";

        }
        ;
    };

    NarrRadiationAtoms.prototype.radiationStart = function (e, obj) {
        e.stopPropagation();
        if (!obj)
            return false;
        if ((this.grip && this.grip.startAnim) || this.timer) {
            this.cancelAnimation(this.animation);
            this.timer = 0;
            this.shake = 0;
            this.grip.isAutoAnimated = 0;
            this.grip.startAnim = false;

            this.decayTimer.innerHTML = "";
            this.circlesWrapper.pos.x = 0;
            this.circlesWrapper.pos.y = 0;
            this.circlesWrapper.style[brprefix + "transform"] = "translate3d(" + this.circlesWrapper.pos.x + "px, " + this.circlesWrapper.pos.y + "px,0px)";

            this.electronsAll.pos = this.circlesWrapper.pos;
            this.electronsAll.style[brprefix + "transform"] = "translate3d(" + this.electronsAll.pos.x + "px, " + this.electronsAll.pos.y + "px,0px)";
        }
        this.timerFlagHide = this.flagTime;
        this.timerFlagShow = 0;

        this.decayTimer.style.backgroundPosition = -this.decayTimer.size.x + "px 0px";
        this.triangle.style.backgroundImage = '';

        this.grip.startX = this.grip.pos.x;
        this.eStart = this.getInternalCoordinatesForPoint(e);

        return true;
    };

    NarrRadiationAtoms.prototype.radiationMove = function (e) {
        e.stopPropagation();

        this.e = this.getInternalCoordinatesForPoint(e);

        this.grip.startX += this.e.x - this.eStart.x;
        if (this.grip.startX > this.maxPos)
            this.grip.startX = this.maxPos;
        if (this.grip.startX < this.minPos)
            this.grip.startX = this.minPos;

        this.grip.pos.x = this.grip.startX;
        this.grip.style[brprefix + "transform"] = "translate3d(" + this.grip.pos.x + "px," + this.grip.pos.y + "px,0px)";

        // Положение нуклонов задается текущим положением бегунка. Номером участка и положением на участке

        this.nucleonsState = {};
        this.nucleonsState.level = Math.floor((this.grip.pos.x - this.minPos) / this.step);
        this.nucleonsState.position = (this.grip.pos.x - this.minPos - this.nucleonsState.level * this.step) / this.step;

        if (!this.isMessageShowed && this.nucleonsState.level >= 5) {
            this.isMessageShowed = true;
            this.delegate.fireEvent("performAnimation", [this.show_message]);
        }


        this.updateNucleons(this.nucleonsState);

        this.eStart = this.getInternalCoordinatesForPoint(e);
    };

    NarrRadiationAtoms.prototype.radiationEnd = function (e) {
        e.stopPropagation();

        this.tmpGripPos = this.grip.pos.x;
        if (this.nucleonsState.level == 0)
            this.curFinalPos = 1 * this.step + this.minPos + 0.1;
        else
            this.curFinalPos = this.nucleonsState.level * this.step + this.minPos + 0.01;

        this.grip.startAnim = true;
        this.animation = this.animateTo("tmpGripPos", this.curFinalPos, 650, 'easeInQuad');
        this.decayTimer.innerHTML = "";
    };

    NarrRadiationAtoms.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrRadiationAtomsPan') {
            if (this.hittestForRect({pType: 0, left: this.grip.pos.x + this.scale.pos.x, top: this.grip.pos.y + this.scale.pos.y, width: this.grip.size.x, height: this.grip.size.y}, e)) {
                return this.grip;
            }
        }
        else
            return false;
    };

    Utils.addBehaviour('pan', 'NarrRadiationAtoms', 'NarrRadiationAtomsPan', {
        start: function (e, obj) {
            return this.radiationStart(e, obj);
        }, move: function (e) {
            this.radiationMove(e);
        }, swipe: function (e) {
            e.stopPropagation();
        }, end: function (e) {
            this.radiationEnd(e);
        }}, false);

    return NarrRadiationAtoms;
});