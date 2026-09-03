define(["utils/Utils"], function (Utils) {
    var NarrAntibiotics = Utils.newObjectType(NarrAntibiotics, "NarrAntibiotics"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.
// test
// Поскольку модуль писался на основе жуков, все бактерии называются жуками (Bug);


    NarrAntibiotics.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        // this.view.style.background = '#EEEEEE';

        this.nearestCount = 5;
        this.moduleSize = description.size;
        this.speed = 50 / 1000; // px/ms
        this.rotSpeed = 120 / 1000; // deg/ms

        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        this.bugSize = description.imagesSize.bug;

        this.bugR = Math.min(this.bugSize.x, this.bugSize.y) / 2; // условно, пока так
        this.availDistSqr = (this.bugR + this.bugR) * (this.bugR + this.bugR);

        this.targetR = (description.imagesSize.target.x + description.imagesSize.target.y) / 4;
        this.availDistToTgtSqr = (this.bugR + this.targetR ) * (this.bugR + this.targetR);

        this.animTime = 6500;
        this.activityPause = 7000;

        this.curingTime = 2000;

        this.initRotSpeed = 110 / 1000; // deg per sec

        this.blinkingPhase = 0;
        this.blinkPeriod = 60;
        this.blinkingTimer = this.blinkPeriod;

        this.count = 30;

        this.fixedBugsData = [
            {x: -7, y: 93, angle: 0},
            {x: 0, y: 210, angle: 45},
            {x: -2, y: 263, angle: 120},
            {x: -2, y: 332, angle: 95},
            {x: 3, y: 504, angle: 250},
            {x: 329, y: 589, angle: 200},
            {x: 522, y: 498, angle: 180},
            {x: 533, y: 335, angle: 300},
            {x: 544, y: 154, angle: 330},
            {x: 541, y: 75, angle: 100},
        ];

        this.delegate.addEventListener("timer", this.loop, this);
    };


    NarrAntibiotics.prototype.load = function () {
        this.targetCross = document.createElement('div');
        this.curingAnim = document.createElement('div');
        this.allBugs = document.createElement('div');
        this.mansHead = document.createElement('div');
        this.timer = document.createElement('div');
        this.timerText = document.createElement('div');
        this.restart = document.createElement('div');

        this.view.appendChild(this.allBugs);


        for (this.j = 0; this.j < this.count; this.j++) {
            this.newBug = document.createElement('div');
            this.redDot = document.createElement('div');
            this.redDotAnim = document.createElement('div');

            this.allBugs.appendChild(this.newBug);
            this.newBug.appendChild(this.redDot);
            this.view.appendChild(this.redDotAnim);
        }

        for (this.j = 0; this.j < this.fixedBugsData.length; this.j++) {
            this.newBug = document.createElement('div');
            this.redDot = document.createElement('div');
            this.redDotAnim = document.createElement('div');

            this.allBugs.appendChild(this.newBug);
            this.newBug.appendChild(this.redDot);
            this.view.appendChild(this.redDotAnim);
        }

        this.initAllElements();

        this.allBugs.appendChild(this.targetCross);
        this.targetCross.appendChild(this.curingAnim);
        this.view.appendChild(this.mansHead);
        this.view.appendChild(this.timer);
        this.view.appendChild(this.restart);
        this.timer.appendChild(this.timerText);
    };


    NarrAntibiotics.prototype.unload = function () {
        delete this.targetCross;
        delete this.curingAnim;
        delete this.allBugs;
        delete this.mansHead;
        delete this.timer;
        delete this.timerText;
        delete this.newBug;
        delete this.redDot;
        delete this.redDotAnim;
        delete this.newBug;
        delete this.redDot;
        delete this.redDotAnim;

        delete this.tempBug;
        delete this.tempBug1;
        delete this.tempBug2;

        this.isInited = false;
        this.fullPause = true;
        this.deleteDomElements(this.view);

        // console.log("childs after unload " + this.view.childNodes.length);
    };

    NarrAntibiotics.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }


    NarrAntibiotics.prototype.loop = function (dt) {
        if (!this.isInited)
            return;
        if (this.fullPause)
            return;

        dt = Math.min(100, dt);

        this.updateAngle(dt);
        this.processMovement(dt);

        this.updateAnimations(dt);
        this.updateBugsState(dt);
        this.updateGameProgress(dt);

        this.updateTimer(dt);
    };

    NarrAntibiotics.prototype.draw = function () { // необязательно
        // this.fullPause = 0; // comment for release
        if (this.fullPause == 0)
            this.initAllElements();
    };

    NarrAntibiotics.prototype.initAllElements = function () { // необязательно
        this.view.style.backgroundImage = 'url("' + this.imagesSrc.moduleBack + '")';
        this.view.style.backgroundSize = this.imagesSize.moduleBack;
        this.view.style.backgroundPosition = "180px 0px";
        this.view.style.backgroundRepeat = 'no-repeat';

        // this.allBugs.size = {x:250, y:250};
        this.allBugs.size = {x: 554, y: 620};
        // this.allBugs.style.background = "rgba(0, 0, 255, 0.1)"; // debugging
        this.allBugs.style.width = this.allBugs.size.x + "px";
        this.allBugs.style.height = this.allBugs.size.y + "px";
        this.allBugs.style.position = "absolute";
        this.allBugs.style.overflow = 'visible';
        this.allBugs.pos = {x: 252, y: 83};
        this.allBugs.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.allBugs.pos.x) + "px," + Math.ceil(this.allBugs.pos.y) + "px,0px)";
        bradapter.applyZIndex(this.view, this.allBugs, 6);


        for (this.j = 0; this.j < this.count; this.j++) {
            this.newBug = this.allBugs.childNodes[this.j];
            this.redDot = this.newBug.childNodes[0];
            this.redDotAnim = this.view.childNodes[this.j + 1];

            // this.newBug.isInfected = Math.floor(Math.random()*2);
            this.newBug.isInfected = Math.floor(Math.random() * 1.3);
            this.newBug.isAnimated = false;

            this.newBug.Num = this.j; // debug
            this.newBug.size = this.bugSize;
            this.newBug.style.backgroundImage = 'url("' + this.imagesSrc.bug[0] + '")';
            this.newBug.style.backgroundSize = '100% 100%';
            this.newBug.style.width = this.bugSize.x + "px";
            this.newBug.style.height = this.bugSize.y + "px";
            this.newBug.pos = {x: ~~(Math.random() * (this.allBugs.size.x - this.bugSize.x)), y: ~~(Math.random() * (this.allBugs.size.y - this.bugSize.y))};
            this.newBug.curAngle = Math.random() * 360;
            this.newBug.finAngle = Math.random() * 360;
            this.newBug.state = 0;
            this.newBug.style.overflow = "visible";
            this.newBug.style.position = "absolute";
            this.newBug.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.newBug.pos.x) + "px," + Math.ceil(this.newBug.pos.y) + "px,0px)" +
                'rotateZ(' + this.newBug.curAngle + 'deg) ';
            this.newBug.speed = this.speed;
            this.newBug.rotSpeed = this.rotSpeed;

            this.newBug.lastMoveNorm = this.newBug.curMoveNorm = 0;
            this.newBug.nearestL = {};
            this.newBug.nearestNbrs = {};
            this.newBug.imgAngle = Math.random() * 360;
            this.newBug.imgRotSpeed = (2 * Math.random() - 1) * this.initRotSpeed;
            this.newBug.activityTimer = this.activityPause * (Math.random() * 0.4 + 0.8);
            this.newBug.isActive = false;

            this.newBug.redDot = this.redDot;
            this.redDot.style.backgroundImage = 'url("' + this.imagesSrc.redDot + '")';
            this.redDot.style.backgroundSize = '100% 100%';
            this.redDot.size = this.imagesSize.redDot;
            this.redDot.style.width = this.redDot.size.x + "px";
            this.redDot.style.height = this.redDot.size.y + "px";
            this.redDot.pos = {x: 0, y: 0};
            this.redDot.style.position = "absolute";
            this.redDot.style.display = this.newBug.isInfected ? "block" : "none";

            this.newBug.animDot = this.redDotAnim;
            this.redDotAnim.timer = 0;
            this.redDotAnim.finalPos = {};
            this.redDotAnim.style.backgroundImage = 'url("' + this.imagesSrc.redDot + '")';
            this.redDotAnim.style.backgroundSize = '100% 100%';
            this.redDotAnim.size = this.imagesSize.redDot;
            this.redDotAnim.style.width = this.redDotAnim.size.x + "px";
            this.redDotAnim.style.height = this.redDotAnim.size.y + "px";
            this.redDotAnim.pos = {x: 0, y: 0};
            this.redDotAnim.style.position = "absolute";
            this.redDotAnim.style.display = 'none';
            this.redDotAnim.state = 0;
            this.resetAnimation(this.redDotAnim);
        }

        for (this.j = 0; this.j < this.fixedBugsData.length; this.j++) {
            this.newBug = this.allBugs.childNodes[this.j + this.count];
            this.redDot = this.newBug.childNodes[0];
            this.redDotAnim = this.view.childNodes[this.j + 1 + this.count];

            this.newBug.isInfected = Math.floor(Math.random() * 1.5 + 0.5);
            this.newBug.isAnimated = false;

            this.newBug.Num = this.j + this.count; // debug
            this.newBug.size = this.bugSize;
            this.newBug.style.backgroundImage = 'url("' + this.imagesSrc.bug[1] + '")';
            this.newBug.style.backgroundSize = '100% 100%';
            this.newBug.style.width = this.bugSize.x + "px";
            this.newBug.style.height = this.bugSize.y + "px";
            this.newBug.pos = {x: this.fixedBugsData[this.j].x, y: this.fixedBugsData[this.j].y};
            this.newBug.curAngle = 0;
            this.newBug.finAngle = 0;
            this.newBug.state = 0;
            this.newBug.style.overflow = "visible";
            this.newBug.style.position = "absolute";
            this.newBug.style.opacity = 0.999;

            this.newBug.speed = 0;
            this.newBug.rotSpeed = 0;
            this.newBug.imgAngle = this.fixedBugsData[this.j].angle;
            this.newBug.imgRotSpeed = 0;
            this.newBug.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.newBug.pos.x) + "px," + Math.ceil(this.newBug.pos.y) + "px,0px)" +
                'rotateZ(' + this.newBug.imgAngle + 'deg) ';

            this.newBug.lastMoveNorm = this.newBug.curMoveNorm = 0;
            this.newBug.nearestL = {};
            this.newBug.nearestNbrs = {};
            this.newBug.activityTimer = this.activityPause * (Math.random() * 0.4 + 0.8);
            this.newBug.isActive = false;

            this.newBug.redDot = this.redDot;
            this.redDot.style.backgroundImage = 'url("' + this.imagesSrc.redDot + '")';
            this.redDot.style.backgroundSize = '100% 100%';
            this.redDot.size = this.imagesSize.redDot;
            this.redDot.style.width = this.redDot.size.x + "px";
            this.redDot.style.height = this.redDot.size.y + "px";
            this.redDot.pos = {x: 0, y: 0};
            this.redDot.style.position = "absolute";
            this.redDot.style.display = this.newBug.isInfected ? "block" : "none";

            this.newBug.animDot = this.redDotAnim;
            this.redDotAnim.timer = 0;
            this.redDotAnim.finalPos = {};
            this.redDotAnim.style.backgroundImage = 'url("' + this.imagesSrc.redDot + '")';
            this.redDotAnim.style.backgroundSize = '100% 100%';
            this.redDotAnim.size = this.imagesSize.redDot;
            this.redDotAnim.style.width = this.redDotAnim.size.x + "px";
            this.redDotAnim.style.height = this.redDotAnim.size.y + "px";
            this.redDotAnim.pos = {x: 0, y: 0};
            this.redDotAnim.style.position = "absolute";
            this.redDotAnim.style.display = 'none';
            this.redDotAnim.state = 0;
            this.resetAnimation(this.redDotAnim);
        }

        this.targetCross.style.backgroundImage = 'url("' + this.imagesSrc.target + '")';
        this.targetCross.style.backgroundSize = this.imagesSize.target.x + 'px ' + this.imagesSize.target.y + 'px';
        this.targetCross.size = this.imagesSize.target;
        this.targetCross.style.width = this.targetCross.size.x + "px";
        this.targetCross.style.height = this.targetCross.size.y + "px";
        this.targetCross.style.position = "absolute";
        this.targetCross.pos = {x: Math.ceil(this.allBugs.size.x / 2 - this.targetR), y: Math.ceil(this.allBugs.size.y / 2 - this.targetR)};
        this.targetCross.start = {};
        this.targetCross.eStart = {};
        this.targetCross.eEnd = {};
        this.targetCross.state = 0;
        this.targetCross.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.targetCross.pos.x) + "px," + Math.ceil(this.targetCross.pos.y) + "px,0px)";
        this.targetCross.style.overflow = 'visible';
        bradapter.applyZIndex(this.view, this.targetCross, 6);

        this.curingAnim.style.backgroundSize = this.imagesSize.curingAnim.x + 'px ' + this.imagesSize.curingAnim.y + 'px';
        this.curingAnim.size = this.imagesSize.curingAnim;
        this.curingAnim.style.width = this.curingAnim.size.x + "px";
        this.curingAnim.style.height = this.curingAnim.size.y + "px";
        this.curingAnim.style.position = "absolute";
        this.curingAnim.pos = this.imagesPos.curingAnim;
        this.curingAnim.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.curingAnim.pos.x) + "px," + Math.ceil(this.curingAnim.pos.y) + "px,0px)";
        this.curingAnim.style.overflow = 'visible';
        this.resetCuring();

        this.mansHead.style.backgroundImage = 'url("' + this.imagesSrc.mansHead + '")';
        this.mansHead.style.backgroundSize = "100% auto";
        this.mansHead.size = this.imagesSize.mansHead;
        this.mansHead.style.width = this.mansHead.size.x + "px";
        this.mansHead.style.height = this.mansHead.size.y + "px";
        this.mansHead.style.position = "absolute";
        this.mansHead.pos = this.imagesPos.mansHead;
        this.mansHead.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.mansHead.pos.x) + "px," + Math.ceil(this.mansHead.pos.y) + "px,0px)";
        this.mansHead.style.backgroundPosition = "0px " + (-this.mansHead.size.y * 5) + "px";

        this.timer.style.backgroundImage = 'url("' + this.imagesSrc.timer + '")';
        this.timer.style.backgroundSize = "100% 100%";
        this.timer.size = this.imagesSize.timer;
        this.timer.style.width = this.timer.size.x + "px";
        this.timer.style.height = this.timer.size.y + "px";
        this.timer.style.position = "absolute";
        this.timer.pos = this.imagesPos.timer;
        this.timer.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.timer.pos.x) + "px," + Math.ceil(this.timer.pos.y) + "px,0px)";

        this.timerText.innerHTML = "1:30";
        this.timerText.style.fontFamily = "MuseoSansCyrl500-700";
        this.timerText.style.fontSize = "34px";
        this.timerText.style.color = "#000000";
        this.timerText.pos = {x: 70, y: 45};
        this.timerText.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.timerText.pos.x) + "px," + Math.ceil(this.timerText.pos.y) + "px,0px)";

        this.restart.size = this.imagesSize.restart;
        this.restart.style.width = this.restart.size.x + "px";
        this.restart.style.height = this.restart.size.y + "px";
        this.restart.style.backgroundImage = 'url("' + this.imagesSrc.restart + '")';
        this.restart.style.backgroundSize = "100% auto";
        this.restart.style.backgroundPosition = "0px 0px";
        this.restart.style.position = "absolute";
        this.restart.pos = this.imagesPos.restart;
        this.restart.style[brprefix + "transform"] = "translate3d(" + this.restart.pos.x + "px," + this.restart.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.restart, 2);

        this.isTapped = false;
        this.gameTime = 1000 * 60 * 1.5 + 999; // ms
        this.timeLeft = this.gameTime;

        this.isInited = true;

        this.initBugDistances(); //инициализация расстояний между жуками для оптимизации перемещений
    };

// NarrAntibiotics.prototype.switchPause = function(new_value) {
//     if (new_value === undefined)
//         this.loopPause = !this.loopPause;  
//     else
//         this.loopPause = new_value;  


//     // if (this.loopPause)
//     //     this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y*3) + "px";
//     // else
//     //     this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y*1) + "px";
// }

    NarrAntibiotics.prototype.updateAnimations = function (dt) {
        this.checkBugs();

        for (this.i = 0; this.i < this.allBugs.childNodes.length - 1; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];
            //Если бактерия заражена и сейчас анимируется (т.е. столкнулась с другой), она посылвает свою красную точку в сторону второй бактерии.

            if (this.tempBug.isAnimated && this.tempBug.isInfected) {
                switch (this.tempBug.animDot.state) {
                    case 0: // enter
                        this.tempBug.animDot.timer = 0;
                        this.tempBug.animDot.style.display = 'block'

                        this.tempBug.animDot.curAngle = this.tempBug.curAngle;
                        this.tempBug.animDot.pos.x = this.tempBug.pos.x + this.allBugs.pos.x;
                        this.tempBug.animDot.pos.y = this.tempBug.pos.y + this.allBugs.pos.y;
                        this.tempBug.animDot.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.tempBug.animDot.pos.x) + "px," + Math.ceil(this.tempBug.animDot.pos.y) + "px,0px)" +
                            'rotateZ(' + this.tempBug.animDot.curAngle + 'deg) ';

                        this.tempBug.animDot.state = 1;
                        break;
                    case 1:  // process
                        // если под прицелом пусто, проверяем тут текущую клетку
                        if (!this.isCuring) {
                            this.checkBugs(this.tempBug)
                        }
                        if (this.isCuring && this.curingBug == this.tempBug) {
                            this.updateCuring(dt);
                        }
                        else {
                            this.tempBug.animDot.timer += dt;
                            this.progress = this.tempBug.animDot.timer / this.animTime;
                            if (this.progress > 1) {
                                this.tempBug.animDot.state = 2;
                                continue;
                            }

                            this.tempBug.animDot.curAngle = (((this.tempBug.paredBug.curAngle - this.tempBug.curAngle) + 360) % 180) * this.progress + this.tempBug.curAngle;
                            this.tempBug.animDot.pos.x = (this.tempBug.paredBug.pos.x - this.tempBug.pos.x) * this.progress + this.tempBug.pos.x + this.allBugs.pos.x;
                            this.tempBug.animDot.pos.y = (this.tempBug.paredBug.pos.y - this.tempBug.pos.y) * this.progress + this.tempBug.pos.y + this.allBugs.pos.y;
                            this.tempBug.animDot.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.tempBug.animDot.pos.x) + "px," + Math.ceil(this.tempBug.animDot.pos.y) + "px,0px)" +
                                'rotateZ(' + this.tempBug.animDot.curAngle + 'deg) ';
                        }

                        break;
                    case 2: // end (infected)
                        this.tempBug.isAnimated = this.tempBug.paredBug.isAnimated = false;
                        this.tempBug.paredBug.isInfected = true;
                        this.tempBug.paredBug.redDot.style.display = 'block';
                        // this.tempBug.paredBug.style.display = this.tempBug.style.display = 'block';
                        this.tempBug.paredBug.style.opacity = this.tempBug.style.opacity = 0.999;
                        this.tempBug.isActive = this.tempBug.paredBug.isActive = false;
                        this.tempBug.activityTimer = this.tempBug.paredBug.activityTimer = this.activityPause;
                        this.resetAnimation(this.tempBug.animDot);
                        break;
                    case 3: // end (cured)
                        this.tempBug.isAnimated = this.tempBug.paredBug.isAnimated = false;
                        this.tempBug.paredBug.isInfected = false;
                        this.tempBug.isActive = this.tempBug.paredBug.isActive = false;
                        this.tempBug.paredBug.style.opacity = this.tempBug.style.opacity = 0.999;
                        this.tempBug.activityTimer = this.tempBug.paredBug.activityTimer = this.activityPause;
                        this.resetAnimation(this.tempBug.animDot);
                        break;
                }
            }
        }
    };

    NarrAntibiotics.prototype.updateTimer = function (dt) {
        this.timeLeft -= dt;
        this.seconds = Math.floor(this.timeLeft / 1000) % 60;
        if (this.timeLeft < 0) {
            this.timerText.innerHTML = "";
            this.fullPause = true;
            this.delegate.fireEvent("performAnimation", [this.animWin]);
        }
        else
            this.timerText.innerHTML = Math.floor(this.timeLeft / 1000 / 60) + ":" + (this.seconds < 10 ? "0" : "") + Math.floor(this.timeLeft / 1000) % 60;


        return;
    }

    NarrAntibiotics.prototype.updateGameProgress = function (dt) {
        this.infectedCount = 0;
        this.allCount = this.allBugs.childNodes.length - 1;
        for (this.i = 0; this.i < this.allCount; this.i++) {
            if (this.allBugs.childNodes[this.i].isInfected)
                this.infectedCount++;
        }
        this.infectionPct = this.infectedCount / this.allCount;


        // if (this.infectionPct != this.lastInfectionPct)
        //     console.log(this.infectionPct);
        // this.lastInfectionPct = this.infectionPct;

        this.stage = Math.round((Math.max(0, (this.infectionPct * 1.5 - 0.5))) * 6 + 0.5);

        // if (this.lastStage != this.stage)
        //     console.log(this.stage);
        // this.lastStage = this.stage;

        if (this.stage == 6) {
            this.fullPause = true;
            this.delegate.fireEvent("performAnimation", [this.animLost]);
            return;
        }
        else {
            this.mansHead.style.backgroundPosition = "0px " + (-this.mansHead.size.y * (5 - this.stage)) + "px";
        }
    };

// Поиск, процесс лечения под "прицелом". Когда мы мешаем клеткам передавать болезнь
    NarrAntibiotics.prototype.checkBugs = function (bugToCheck) {
        this.lastIsCuring = this.isCuring;
        if (!bugToCheck)
            bugToCheck = this.curingBug;
        if (!bugToCheck)
            return;

        // положение самого перекрестияна картинке с прибором
        this.targetCrossP = {x: this.targetCross.pos.x + 42, y: this.targetCross.pos.y + 144};
        if (
            ((this.targetCrossP.x > bugToCheck.pos.x && this.targetCrossP.x < bugToCheck.pos.x + bugToCheck.size.x)
                && (this.targetCrossP.y > bugToCheck.pos.y && this.targetCrossP.y < bugToCheck.pos.y + bugToCheck.size.y))
            ||
            ((this.targetCrossP.x > bugToCheck.paredBug.pos.x && this.targetCrossP.x < bugToCheck.paredBug.pos.x + bugToCheck.paredBug.size.x)
                && (this.targetCrossP.y > bugToCheck.paredBug.pos.y && this.targetCrossP.y < bugToCheck.paredBug.pos.y + bugToCheck.paredBug.size.y))
            ) {
            this.curingBug = bugToCheck;
            this.isCuring = true;
        }
        else {
            this.curingBug = false;
            this.isCuring = false;
        }

        // Начало анимации
        if (!this.lastIsCuring && this.isCuring) {
            this.curingTimer = 0;
            this.curingAnim.style.backgroundImage = 'url("' + this.imagesSrc.curingAnim[1] + '")';
        }
        else if (this.lastIsCuring && !this.isCuring) {
            this.resetCuring();
        }
    };

    NarrAntibiotics.prototype.updateCuring = function (dt) {
        this.curingTimer += dt;
        this.curingProgress = this.curingTimer / this.curingTime;
        if (this.curingProgress > 1) {
            this.curingBug.animDot.state = 3; // завершение анимации после лечения
        }
        // else{
        //     console.log("process Curing");
        // }
    };

    NarrAntibiotics.prototype.resetCuring = function () {
        this.curingAnim.style.backgroundImage = 'url("' + this.imagesSrc.curingAnim[0] + '")';
    };

    NarrAntibiotics.prototype.resetAnimation = function (animDot) {
        animDot.timer = 0;
        animDot.state = 0;
        animDot.curAngle = 0;
        animDot.pos.x = animDot.pos.y = 0;
        // animDot.style[brprefix + "transform"] = "translate3d(" + Math.ceil(animDot.pos.x) + "px," + Math.ceil(animDot.pos.y) + "px,0px)" +
        //                                                 'rotateZ(' + animDot.curAngle + 'deg) ';
        animDot.style.display = 'none';
    };

    NarrAntibiotics.prototype.updateAngle = function (dt) {
        for (this.i = 0; this.i < this.allBugs.childNodes.length - 1; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];
            if (this.tempBug.isAnimated)
                continue;

            this.deltaAngle = (this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360; // 0 % 360

            if (this.deltaAngle == 0) {

                if (this.tempBug.collisionCount)
                    this.tempBug.finAngle = (this.tempBug.finAngle + 180) % 360;
                this.tempBug.rotDir = 0;
                continue;
            }

            else if (this.deltaAngle >= 180) {
                if (this.tempBug.collisionCount > 1)
                    this.tempBug.curAngle -= this.tempBug.rotSpeed * dt * 50;
                else
                    this.tempBug.curAngle -= this.tempBug.rotSpeed * dt;

                this.tempBug.curAngle = (this.tempBug.curAngle + 360) % 360;
                this.tempBug.rotDir = -1;
                if ((this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360 < 180) {
                    this.tempBug.curAngle = this.tempBug.finAngle;
                }
            }
            else if (this.deltaAngle < 180) {
                if (this.tempBug.collisionCount > 1)
                    this.tempBug.curAngle += this.tempBug.rotSpeed * dt * 50;
                else
                    this.tempBug.curAngle += this.tempBug.rotSpeed * dt;

                this.tempBug.curAngle = (this.tempBug.curAngle + 360) % 360;
                this.tempBug.rotDir = 1;
                if ((this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360 > 180) {
                    this.tempBug.curAngle = this.tempBug.finAngle;
                }
            }
        }
    };

    NarrAntibiotics.prototype.processMovement = function (dt) {
        for (this.i = 0; this.i < this.allBugs.childNodes.length - 1; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];
            if (this.tempBug.isAnimated)
                continue;

            this.tempBug.forwardX = this.tempBug.speed * dt * Math.sin(this.tempBug.curAngle * Math.PI / 180);
            this.tempBug.forwardY = -this.tempBug.speed * dt * Math.cos(this.tempBug.curAngle * Math.PI / 180);

            this.tempBug.newXAfterColl = this.tempBug.pos.x + this.tempBug.forwardX;
            this.tempBug.newYAfterColl = this.tempBug.pos.y + this.tempBug.forwardY;
        }
        this.targetCross.newXAfterColl = this.targetCross.pos.x;
        this.targetCross.newYAfterColl = this.targetCross.pos.y;

        this.processBugCollision();

        for (this.i = 0; this.i < this.allBugs.childNodes.length - 1; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];
            if (this.tempBug.isAnimated || !this.tempBug.speed)
                continue;

            if (this.tempBug.newXAfterColl < 0)
                this.newX = 0;
            else if (this.tempBug.newXAfterColl > this.allBugs.size.x - this.bugSize.x)
                this.newX = this.allBugs.size.x - this.bugSize.x;
            else
                this.newX = this.tempBug.newXAfterColl;
            this.mvX = (Math.abs(this.tempBug.forwardX) - Math.abs(this.tempBug.newXAfterColl - this.newX));

            if (this.tempBug.newYAfterColl < 0)
                this.newY = 0;
            else if (this.tempBug.newYAfterColl > this.allBugs.size.y - this.bugSize.y)
                this.newY = this.allBugs.size.y - this.bugSize.y;
            else
                this.newY = this.tempBug.newYAfterColl;
            this.mvY = (Math.abs(this.tempBug.forwardY) - Math.abs(this.tempBug.newYAfterColl - this.newY));


            this.tempBug.lastMoveNorm = this.tempBug.curMoveNorm;
            this.tempBug.curMoveNorm = this.mvX * this.mvX + this.mvY * this.mvY;


            if ((Math.abs(this.mvX) < Math.abs(this.tempBug.forwardX)) && (Math.abs(this.mvY) < Math.abs(this.tempBug.forwardY))) {
                this.processAngleCollision(this.tempBug);
            }
            else if ((Math.abs(this.mvX) < Math.abs(this.tempBug.forwardX)) || (Math.abs(this.mvY) < Math.abs(this.tempBug.forwardY))) {
                this.processBorderCollision(this.tempBug);
            }
            else {
                this.tempBug.collisionCount = 0;
            }

            if (this.tempBug.collisionCount != 3)
                this.tempBug.pos.x = this.newX;
            if (this.tempBug.collisionCount != 3)
                this.tempBug.pos.y = this.newY;

            this.tempBug.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.tempBug.pos.x) + "px," + Math.ceil(this.tempBug.pos.y) + "px,0px)" +
                'rotateZ(' + this.tempBug.imgAngle + 'deg) ';

        }
    };

    NarrAntibiotics.prototype.processBorderCollision = function (bug) {
        if (!bug) return;

        if (bug.bugType == 0 && this.isTapped) {

        }
        else {
            switch (bug.collisionCount) {
                case 0:
                {
                    bug.collisionCount++;
                    bug.finAngle = bug.curAngle + (90 + Math.random() * 90);
                    bug.finAngle = (bug.finAngle + 360) % 360;

                    bug.imgRotSpeed = (2 * Math.random() - 1) * this.initRotSpeed;
                    break;
                }
                case 1:
                {
                    // ждем круг для оценки правильности выбора направления
                    bug.collisionCount++;
                    break;
                }
                case 2:
                {
                    if (bug.lastMoveNorm >= bug.curMoveNorm) {
                        bug.collisionCount++;
                        // bug.finAngle = bug.finAngle + 180;
                        bug.finAngle = (bug.finAngle + 360 + 90) % 360;
                    }
                    break;
                }
            }
        }
    };
    NarrAntibiotics.prototype.processAngleCollision = function (bug) {
        if (!bug) return;

        if (bug.bugType == 0 && this.isTapped) {

        }
        else {
            if (bug.collisionCount == 4)
                return;
            bug.collisionCount = 4;
            bug.finAngle = (bug.curAngle + 180 + (Math.random() - 0.5) + 360) % 360;
        }
    };

    NarrAntibiotics.prototype.processBugCollision = function () {
        this.findBugNearest(this.allBugs.childNodes[this.curBugNum++]);
        if (this.curBugNum == this.allBugs.childNodes.length - 2)
            this.curBugNum = 0;

        // Функция берет переменные
        // this.tempBug.newXAfterColl
        // this.tempBug.newXAfterColl
        // и корректирует их в зависимости от перекрытия жуков. они "расталкивают" друг друга
        for (this.j = 0; this.j < this.allBugs.childNodes.length - 1; this.j++) {
            this.tempBug1 = this.allBugs.childNodes[this.j];
            if (this.tempBug1.isAnimated)
                continue;

            for (this.k = 0; this.k < Math.min(this.nearestCount, this.allBugs.childNodes.length - 2); this.k++) {
                // if (this.k == this.j)
                //     continue;
                // this.tempBug2 = this.view.childNodes[this.k];
                this.tempBug2 = this.allBugs.childNodes[this.tempBug1.nearestNbrs[this.k]];


                this.distY = this.tempBug2.newYAfterColl - this.tempBug1.newYAfterColl;
                this.distX = this.tempBug2.newXAfterColl - this.tempBug1.newXAfterColl;

                this.distanceSqr = this.distX * this.distX + this.distY * this.distY;
                if (this.distanceSqr > this.availDistSqr)
                    continue;
                else {
                    // if ((this.tempBug1.isInfected ^ this.tempBug2.isInfected) && !this.tempBug2.isAnimated && this.tempBug1.isActive && this.tempBug2.isActive){
                    if (this.tempBug1.isInfected && !this.tempBug2.isInfected && this.tempBug1.isActive && this.tempBug2.isActive && !this.tempBug2.isAnimated) {
                        this.tempBug1.isAnimated = this.tempBug2.isAnimated = true;
                        this.tempBug1.animDot.state = this.tempBug2.animDot.state = 0;

                        this.tempBug1.paredBug = this.tempBug2;
                        this.tempBug2.paredBug = null;
                        break;
                    }

                    this.overlapMeasure = (1 - Math.sqrt(this.distanceSqr / this.availDistSqr)) / 2;
                    this.overlapX = this.distX * this.overlapMeasure;
                    this.overlapY = this.distY * this.overlapMeasure;

                    if (this.tempBug1.speed) {
                        this.tempBug1.newXAfterColl -= this.overlapX;
                        this.tempBug1.newYAfterColl -= this.overlapY;
                    }

                    if (!this.tempBug2.isAnimated && this.tempBug2.speed) {
                        this.tempBug2.newXAfterColl += this.overlapX;
                        this.tempBug2.newYAfterColl += this.overlapY;
                    }
                }
            }
        }
        // Отработка коллизий с целью (куда они ползут)
        // for (this.j = 0; this.j < this.allBugs.childNodes.length - 1; this.j++) {
        //     this.tempBug1 = this.allBugs.childNodes[this.j];

        //     // this.targetCross = this.view.childNodes[0];

        //     this.distX = (this.targetCross.newXAfterColl + this.targetR) - (this.tempBug1.newXAfterColl + this.bugR);
        //     this.distY = (this.targetCross.newYAfterColl + this.targetR) - (this.tempBug1.newYAfterColl + this.bugR);

        //     this.distanceSqr = this.distX*this.distX + this.distY*this.distY;
        //     if (this.distanceSqr > this.availDistToTgtSqr)
        //         continue;
        //     else{
        //         this.overlapMeasure = ((Math.sqrt(this.availDistToTgtSqr) - Math.sqrt(this.distanceSqr)) / Math.sqrt(this.availDistToTgtSqr));
        //         this.overlapX = this.distX * this.overlapMeasure;
        //         this.overlapY = this.distY * this.overlapMeasure;

        //         this.tempBug1.newXAfterColl -= this.overlapX;
        //         this.tempBug1.newYAfterColl -= this.overlapY;
        //     }
        // }
    };

    NarrAntibiotics.prototype.updateBugsState = function (dt) {
        this.blinkingTimer -= dt;
        if (this.blinkingTimer < 0) {
            this.blinkingTimer = this.blinkPeriod;
            this.blinkingPhase = !this.blinkingPhase;
        }

        for (this.j = 0; this.j < this.allBugs.childNodes.length - 1; this.j++) {
            this.tempBug = this.allBugs.childNodes[this.j];

            if (!this.tempBug.isAnimated) {
                this.tempBug.imgAngle += this.tempBug.imgRotSpeed * dt;

                if (this.tempBug.activityTimer)
                    this.tempBug.activityTimer -= dt;
                if (this.tempBug.activityTimer < 0) {
                    this.tempBug.isActive = true;
                    this.tempBug.activityTimer = 0;
                }
            }
            else if (this.tempBug.isInfected) {
                // this.tempBug.paredBug.style.display = this.blinkingPhase ? 'block' : 'none';
                // this.tempBug.style.display = this.blinkingPhase ? 'block' : 'none';
                this.tempBug.paredBug.style.opacity = this.blinkingPhase ? 0.5 : 0.999;
                this.tempBug.style.opacity = this.blinkingPhase ? 0.5 : 0.999;
            }
        }
    };

    NarrAntibiotics.prototype.initBugDistances = function () {
        for (this.j = 0; this.j < this.allBugs.childNodes.length - 1; this.j++) {
            this.findBugNearest(this.allBugs.childNodes[this.j]);
        }
        this.curBugNum = 0;
    };


    NarrAntibiotics.prototype.findBugNearest = function (bug) {
        if (!bug) return;
        this.distances = [];

        for (this.k = 0; this.k < this.allBugs.childNodes.length - 1; this.k++) {
            if (this.k == this.j)
                continue;

            this.tempBug1 = this.allBugs.childNodes[this.k];

            this.distX = bug.newXAfterColl - this.tempBug1.newXAfterColl;
            this.distY = bug.newYAfterColl - this.tempBug1.newYAfterColl;

            this.distanceSqr = this.distX * this.distX + this.distY * this.distY;
            this.distances[this.k] = {dist: this.distanceSqr, num: this.k};
        }

        this.distances.sort(function (a, b) {
            return a.dist - b.dist;
        });

        // перебор от самых близких.
        for (this.k = 0; this.k < Math.min(this.nearestCount, this.allBugs.childNodes.length - 2); this.k++) {
            bug.nearestL[this.k] = this.distances[this.k].dist;
            bug.nearestNbrs[this.k] = this.distances[this.k].num;
        }
    };

    NarrAntibiotics.prototype.antiBStart = function (e, obj) {
        e.stopPropagation();
        if (!obj || this.moveObj) return false;
        this.moveObj = obj;
        this.moveObj.start.x = obj.pos.x;
        this.moveObj.start.y = obj.pos.y;
        this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        bradapter.applyZIndex(this.view, this.moveObj, 5);

        this.isTapped = true;
        return true;
    };

    NarrAntibiotics.prototype.antiBMove = function (e, obj) {
        e.stopPropagation();
        this.moveObj.eEnd = this.getInternalCoordinatesForPoint(e);
        // if (this.allBugs.size.x < this.moveObj.eEnd.x || this.allBugs.size.y < this.moveObj.eEnd.y || this.moveObj.eEnd.x < 0 || this.moveObj.eEnd.y < 0)
        //     return true;
        // else
        this.minX = -30 - this.allBugs.pos.x;
        // this.maxX = this.allBugs.size.x - this.moveObj.size.x + 320;
        this.maxX = this.moduleSize.x - this.moveObj.size.x + 320 - this.allBugs.pos.x;
        this.minY = -130 - this.allBugs.pos.y;
        // this.maxY = this.allBugs.size.y - this.moveObj.size.y + 85;
        this.maxY = this.moduleSize.y - this.moveObj.size.y + 85 - this.allBugs.pos.y;
        {
            this.moveObj.start.x += this.moveObj.eEnd.x - this.moveObj.eStart.x;
            this.moveObj.start.y += this.moveObj.eEnd.y - this.moveObj.eStart.y;
            if (this.moveObj.start.x < this.minX)
                this.moveObj.start.x = this.minX;
            if (this.moveObj.start.x > this.maxX)
                this.moveObj.start.x = this.maxX;
            if (this.moveObj.start.y < this.minY)
                this.moveObj.start.y = this.minY;
            if (this.moveObj.start.y > this.maxY)
                this.moveObj.start.y = this.maxY;
            this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.start.x + "px," + this.moveObj.start.y + "px,0px)";
            this.moveObj.pos.x = this.moveObj.start.x;
            this.moveObj.pos.y = this.moveObj.start.y;
            this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        }
    };

    NarrAntibiotics.prototype.antiBEnd = function (e) {
        e.stopPropagation();
        if (!this.moveObj)
            return false;
        this.moveObj = false;
        this.isTapped = false;
    };


    NarrAntibiotics.prototype.customHittest = function (e, gesture) {
        if (this.fullPause)
            return false;

        if (gesture == 'NarrAntibioticsPan') {
            if (this.hittestForRect({pType: 0, left: this.targetCross.pos.x + this.allBugs.pos.x,
                top: this.targetCross.pos.y + this.allBugs.pos.y, width: this.targetCross.size.x,
                height: this.targetCross.size.y}, e))
                return this.targetCross;
        }
        else if (gesture == 'NarrAntibioticsTouch') {
            if (this.hittestForRect({pType: 0, left: this.restart.pos.x, top: this.restart.pos.y, width: this.restart.size.x, height: this.restart.size.y}, e))
                return this.restart;
        }
        else
            return false;
    };

    NarrAntibiotics.prototype.restartStart = function (e, obj) {
        e.stopPropagation();
        this.restart.style.backgroundPosition = "0px " + (-this.restart.size.y) + "px";
        return true;
    };

    NarrAntibiotics.prototype.restartEnd = function (e) {
        e.stopPropagation();
        this.restart.style.backgroundPosition = "0px 0px";

        this.fullPause = true;
        this.delegate.fireEvent("performAnimation", [this.animPauseRestart]);
    };

    Utils.addBehaviour('pan', 'NarrAntibiotics', 'NarrAntibioticsPan', {
        start: function (e, obj) {
            return this.antiBStart(e, obj);
        }, move: function (e, obj) {
            this.antiBMove(e, obj);
        }, swipe: function (e) {
            e.stopPropagation();
            return true;
        }, end: function (e) {
            this.antiBEnd(e);
        }}, false);

    Utils.addBehaviour('touch', 'NarrAntibiotics', 'NarrAntibioticsTouch', {
        start: function (e, obj) {
            return this.restartStart(e, obj);
        }, end: function (e) {
            this.restartEnd(e);
        }}, false);

    return NarrAntibiotics;
});