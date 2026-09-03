define(["utils/Utils"], function (Utils) {

    var NarrVampires = Utils.newObjectType(NarrVampires, "NarrVampires", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrVampires.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;
        this.maxVampiresOnTheScreen = description.vampOnScreen;
        this.startScale = description.startScale;
        this.vampRate = description.vampRate;
        this.vampTimeStart = description.vampTime;
        this.vampTime = this.vampTimeStart;
        this.ragTime = description.ragTime;
        this.vampSpeed = (1 - description.startScale) / this.vampTime;

        this.timeBeetweenSpawnsStart = 1 / this.vampRate * 1000;
        this.timeBeetweenSpawns = this.timeBeetweenSpawnsStart;
        this.timeFromLastV = this.timeBeetweenSpawns;
        this.timeToDestroy = description.timeToDestroy;

        this.vampireSize = description.imageSizes.vampireSize;
        this.blurSize = description.imageSizes.blurSize;
        this.buttonWidth = parseInt(description.imageSizes.buttonSize.x);
        this.buttonHeight = parseInt(description.imageSizes.buttonSize.y);
        this.textWidth = parseInt(description.imageSizes.textSize.x);
        this.ragSize = description.imageSizes.ragSize;

        this.imagesSrc = description.imagesSrc;

        this.finalBounds = description.finalBounds;

        // this.view.style.background = '#555555';
        // this.view.style.backgroundImage = 'url("' + this.imagesSrc.gameBackground + '")';

        // console.log(description);
        this.leftTopStart = {
            x: description.size.x * 0.5 - description.size.x * 0.5 * this.startScale,
            y: description.size.y * 0.5 - description.size.y * 0.5 * this.startScale
        }

        this.addArea({
            event_type: 'pan',
            behaviour: 'NarrVampiresPan',
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,
            visible: true,
            params: this,
            propagation: 1
        });
        this.addArea({
            event_type: 'tap',
            behaviour: 'NarrVampiresTap',
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,
            visible: true,
            params: this,
            propagation: 1
        });

        this.gesture = {
            eStart1: {},
            eEnd1: {},
            eStart2: {},
            eEnd2: {},
            timeFromStart: 0,
            timeBetween: description.gestureTime,
            vertSwipe: false,
            horSwipe: false,
        }

// For eraser
        this.eStart = {};
        this.e = {};

        this.eraseR = description.eraseR;
        this.losePercent = description.losePercent;
        this.ragTimer = 0;

        this.bombPrice = description.bombPrice;
        this.ragPrice = description.ragPrice;
        this.allPoints = 0;
        this.gameTime = 0;
        this.vampiresKilled = 0;

        this.timeToDisappear = 600;

        this.randomizeSpawn = 1 + (0.3 * (0.5 - Math.random()));

        this.ready = false;

        this.delegate.addEventListener("timer", this.loop, this);
    };

    NarrVampires.prototype.load = function () {
        this.GUI = document.createElement('div');

        this.GUI.style.width = 100 + "%";
        this.GUI.style.height = 100 + "%";
        this.GUI.style.position = "absolute";
        this.view.appendChild(this.GUI);
        bradapter.applyZIndex(this.view, this.GUI, 101);

        this.GUI.topPanel = document.createElement('div');
        this.GUI.topPanel.width = this.buttonWidth * 2 + this.textWidth;
        this.GUI.topPanel.style.width = this.GUI.topPanel.width + "px";
        this.GUI.topPanel.style.height = this.buttonHeight + "px";
        this.GUI.topPanel.pos = {x: (this.moduleSize.x - this.GUI.topPanel.width) / 2, y: 15};
        this.GUI.topPanel.style.position = "absolute";
        this.GUI.topPanel.style.overflow = "visible";
        // console.log(this.GUI.topPanel.pos);
        // console.log("translate3d(" + this.GUI.topPanel.pos.x + "px, " + this.GUI.topPanel.pos.y + "px)");
        this.GUI.topPanel.style[brprefix + "transform"] = "translate3d(" + this.GUI.topPanel.pos.x + "px, " + this.GUI.topPanel.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.GUI.topPanel, 2);
        this.GUI.appendChild(this.GUI.topPanel);
////////////////////////////////////////////////////////////////////
// BOMB
////////////////////////////////////////////////////////////////////
        this.GUI.bomb = document.createElement('div');
        this.GUI.bomb.pos = {x: this.GUI.topPanel.pos.x, y: this.GUI.topPanel.pos.y};
        this.GUI.bomb.size = {x: this.buttonWidth, y: this.buttonWidth};
        this.GUI.bomb.style.width = this.buttonWidth + "px";
        this.GUI.bomb.style.height = this.buttonHeight + "px";
        this.GUI.bomb.style.backgroundImage = 'url("' + this.imagesSrc.bombOffSrc + '")';
        this.GUI.bomb.style.backgroundSize = this.GUI.bomb.style.width + " " + this.GUI.bomb.style.height;
        this.GUI.bomb.style.position = "absolute";
        this.GUI.topPanel.appendChild(this.GUI.bomb);

        this.GUI.bombProgress = document.createElement('div');
        this.GUI.bombProgress.width = this.buttonWidth;
        this.GUI.bombProgress.style.width = this.buttonWidth + "px";
        this.GUI.bombProgress.style.height = 0 + "px";
        this.GUI.bombProgress.style.bottom = "0px";
        this.GUI.bombProgress.style.backgroundImage = 'url("' + this.imagesSrc.btnProgressSrc + '")';
        this.GUI.bombProgress.style.backgroundSize = this.buttonWidth + "px, " + this.buttonHeight + "px";
        this.GUI.bombProgress.style.backgroundPosition = "bottom"
        this.GUI.bombProgress.style.position = "absolute";
        this.GUI.bomb.appendChild(this.GUI.bombProgress);
////////////////////////////////////////////////////////////////////
// POINTS
////////////////////////////////////////////////////////////////////
        this.GUI.points = document.createElement('div');
        this.GUI.points.width = this.textWidth;
        this.GUI.points.style.width = this.textWidth + "px";
        this.GUI.points.style.height = this.buttonHeight + "px";
        this.GUI.points.style.overflow = "visible";
        this.GUI.points.style.lineHeight = this.GUI.points.style.height;
        this.GUI.points.style.textAlign = "center";

        this.GUI.points.style.fontFamily = "Retropecan";
        this.GUI.points.style.fontSize = "72px";
        this.GUI.points.style.color = "#FFFFFF";

        this.GUI.points.style.position = "absolute";
        this.GUI.points.style[brprefix + "transform"] = "translate3d(" + this.buttonWidth + "px,0px,0px)";
        this.GUI.points.innerHTML = "0";
        this.GUI.topPanel.appendChild(this.GUI.points);
////////////////////////////////////////////////////////////////////
// RAG
////////////////////////////////////////////////////////////////////
        this.GUI.rag = document.createElement('div');
        this.GUI.rag.pos = {x: this.buttonWidth + this.textWidth + this.GUI.topPanel.pos.x, y: this.GUI.topPanel.pos.y};
        this.GUI.rag.size = {x: this.buttonWidth, y: this.buttonWidth};
        this.GUI.rag.style.width = this.buttonWidth + "px";
        this.GUI.rag.style.height = this.buttonHeight + "px";
        this.GUI.rag.style.backgroundImage = 'url("' + this.imagesSrc.ragOffSrc + '")';
        this.GUI.rag.style.backgroundSize = this.GUI.rag.style.width + " " + this.GUI.rag.style.height;
        this.GUI.rag.style.position = "absolute";
        this.GUI.rag.style[brprefix + "transform"] = "translate3d(" + (this.buttonWidth + this.textWidth) + "px,0px,0px)";
        this.GUI.topPanel.appendChild(this.GUI.rag);

        this.GUI.ragProgress = document.createElement('div');
        this.GUI.ragProgress.width = this.buttonWidth;
        this.GUI.ragProgress.style.width = this.buttonWidth + "px";
        this.GUI.ragProgress.style.height = 0 + "px";
        this.GUI.ragProgress.style.bottom = "0px";
        this.GUI.ragProgress.style.backgroundImage = 'url("' + this.imagesSrc.btnProgressSrc + '")';
        this.GUI.ragProgress.style.backgroundSize = this.buttonWidth + "px, " + this.buttonHeight + "px";
        this.GUI.ragProgress.style.backgroundPosition = "bottom"
        this.GUI.ragProgress.style.position = "absolute";
        this.GUI.rag.appendChild(this.GUI.ragProgress);

        this.GUI.ragTimerTxt = document.createElement('div');
        this.GUI.ragTimerTxt.width = this.buttonWidth;
        this.GUI.ragTimerTxt.style.width = this.buttonWidth + "px";
        this.GUI.ragTimerTxt.style.height = this.buttonHeight + "px";
        this.GUI.ragTimerTxt.style.lineHeight = this.GUI.ragTimerTxt.style.height;
        this.GUI.ragTimerTxt.style.textAlign = "center";

        this.GUI.ragTimerTxt.style.fontFamily = "PT Sans Narrow";
        this.GUI.ragTimerTxt.style.fontSize = "28px";
        this.GUI.ragTimerTxt.style.fontWeight = "bold";
        this.GUI.ragTimerTxt.style.color = "#FFFFFF";

        this.GUI.ragTimerTxt.style.position = "absolute";
        this.GUI.ragTimerTxt.innerHTML = "";
        this.GUI.rag.appendChild(this.GUI.ragTimerTxt);
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.GUI.pause = document.createElement('div');
        this.GUI.pause.pos = {x: (this.moduleSize.x - this.buttonWidth) / 2, y: (this.moduleSize.y - this.buttonHeight - 15)};
        this.GUI.pause.size = {x: this.buttonWidth, y: this.buttonWidth};
        this.GUI.pause.width = this.buttonWidth;
        this.GUI.pause.style.width = this.buttonWidth + "px";
        this.GUI.pause.style.height = this.buttonHeight + "px";
        this.GUI.pause.style.backgroundImage = 'url("' + this.imagesSrc.playSrc + '")';
        this.GUI.pause.style.backgroundSize = this.GUI.pause.style.width + " " + this.GUI.pause.style.height;
        this.GUI.pause.style.position = "absolute";
        this.GUI.pause.style[brprefix + "transform"] = "translate3d(" + this.GUI.pause.pos.x + "px," + this.GUI.pause.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.GUI.pause, 2);
        this.GUI.appendChild(this.GUI.pause);

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.GUI.ragEraser = document.createElement('div');
        this.GUI.ragEraser.pos = {x: (this.moduleSize.x - this.ragSize.x) / 2, y: (this.moduleSize.y - this.ragSize.y) / 2};
        this.GUI.ragEraser.size = this.ragSize;
        this.GUI.ragEraser.width = this.ragSize.y;
        this.GUI.ragEraser.style.width = this.ragSize.x + "px";
        this.GUI.ragEraser.style.height = this.ragSize.y + "px";
        this.GUI.ragEraser.style.backgroundImage = 'url("' + this.imagesSrc.ragStartSrc + '")';
        this.GUI.ragEraser.style.backgroundSize = this.GUI.ragEraser.style.width + " " + this.GUI.ragEraser.style.height;
        this.GUI.ragEraser.style.position = "absolute";
        this.GUI.ragEraser.style.display = 'none';
        this.GUI.ragEraser.style[brprefix + "transform"] = "translate3d(" + this.GUI.ragEraser.pos.x + "px," + this.GUI.ragEraser.pos.y + "px,0px)";

        this.GUI.ragEraser.start = {};

        bradapter.applyZIndex(this.view, this.GUI.ragEraser, 2);
        this.GUI.appendChild(this.GUI.ragEraser);

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
        this.blurCanvas = document.createElement('canvas');
        this.blurCanvas.ctx = this.blurCanvas.getContext('2d');
        this.blurCanvas.style.position = "absolute";
        this.blurCanvas.style.width = this.moduleSize.x + "px ";
        this.blurCanvas.style.height = this.moduleSize.y + "px";
        this.blurCanvas.width = this.moduleSize.x;
        this.blurCanvas.height = this.moduleSize.y;
        this.blurCanvas.ctx.globalCompositeOperation = "source-over";
        this.GUI.appendChild(this.blurCanvas);

        this.blurImg = new Image();
        this.blurImg.src = this.imagesSrc.blurSrc;

        this.vampiresOnScreen = this.maxVampiresOnTheScreen + 5; // +2 обязательно, еще +2 если родится новый до исчезновения предыдущего
        this.curDivNum = 0;
        for (this.i = 0; this.i < this.vampiresOnScreen; this.i++) {
            this.newVampire = document.createElement('div');
            this.newVampire.style.display = 'none';


            this.newDyingVampire = document.createElement('div');
            this.newDyingVampire.style.backgroundImage = 'url("' + this.imagesSrc.dyingVampireSrc + '")';
            this.newDyingVampire.style.width = 100 + "%";
            this.newDyingVampire.style.height = 100 + "%";
            this.newDyingVampire.style.backgroundSize = this.newDyingVampire.style.width + " " + this.newDyingVampire.style.height;
            this.newDyingVampire.style.position = "absolute";
            this.newDyingVampire.style.display = 'none';
            bradapter.applyZIndex(this.view, this.newDyingVampire, 2);

            this.newExplosion1 = document.createElement('div');
            this.newExplosion1.style.backgroundImage = 'url("' + this.imagesSrc.explosionSrc1 + '")';
            this.newExplosion1.style.width = 100 + "%";
            this.newExplosion1.style.height = 100 + "%";
            this.newExplosion1.style.backgroundSize = this.newExplosion1.style.width + " " + this.newExplosion1.style.height;
            this.newExplosion1.style.position = "absolute";
            bradapter.applyZIndex(this.view, this.newExplosion1, 1);

            this.newExplosion2 = document.createElement('div');
            this.newExplosion2.style.backgroundImage = 'url("' + this.imagesSrc.explosionSrc2 + '")';
            this.newExplosion2.style.width = 100 + "%";
            this.newExplosion2.style.height = 100 + "%";
            this.newExplosion2.style.backgroundSize = this.newExplosion2.style.width + " " + this.newExplosion2.style.height;
            this.newExplosion2.style.position = "absolute";
            bradapter.applyZIndex(this.view, this.newExplosion2, 3);

            this.newVampire.active = false;
            this.newVampire.appendChild(this.newDyingVampire);
            this.newVampire.appendChild(this.newExplosion1);
            this.newVampire.appendChild(this.newExplosion2);

            this.view.appendChild(this.newVampire);

            this.ready = true;
        }
    };


    NarrVampires.prototype.unload = function () {

// For eraser
        this.curDivNum = undefined;
        this.eStart = {};
        this.e = {};

        this.ragTimer = 0;
        this.allPoints = 0;
        this.gameTime = 0;
        this.isUsingRag = false;

        this.vampiresKilled = 0;

        this.pause = false;


        this.timeBeetweenSpawns = this.timeBeetweenSpawnsStart;
        this.timeFromLastV = this.timeBeetweenSpawns;
        this.vampTime = this.vampTimeStart;

        delete this.GUI.topPanel;// = null;
        delete this.GUI.bomb;// = null;
        delete this.GUI.bombProgress;// = null;
        delete this.GUI.points;// = null;
        delete this.GUI.rag;// = null;
        delete this.GUI.ragProgress;// = null;
        delete this.GUI.ragTimerTxt;// = null;
        delete this.GUI.pause;// = null;
        delete this.GUI.ragEraser;// = null;
        delete this.GUI;// = null;
        delete this.blurCanvas;// = null;
        delete this.newVampire;// = null;
        delete this.newDyingVampire;// = null;
        delete this.newExplosion1;// = null;
        delete this.newExplosion2;// = null;

        this.ready = false;

        this.deleteDomElements(this.view);

        // console.log("childs after unload " + this.view.childNodes.length);
    };

    NarrVampires.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrVampires.prototype.draw = function () { // необязательно
        // console.log("this.fullPause on DRAW " + this.fullPause);
        // this.fullPause = 0; // comment for release
        this.switchPause(this.fullPause);
    };


    NarrVampires.prototype.loop = function (dt) { // необязательно
        if (!this.ready)
            return;

        dt = Math.min(dt, 100);
        if (!this.pause && !this.fullPause) {
            if (this.isUsingRag) {
                this.processRag(dt);
                return;
            }

            this.processSpawn(dt);
            this.processMovement(dt);
            this.processGesture(dt);
            this.updateDifficulty(dt);
        }
    };

    NarrVampires.prototype.processRag = function (dt) {
        this.ragTimer -= dt;
        this.GUI.ragTimerTxt.innerHTML = Math.ceil(this.ragTimer / 1000);
        this.GUI.ragProgress.style.height = Math.ceil(this.buttonHeight * this.ragTimer / this.ragTime) + "px";
        if (this.ragTimer < 0) {
            this.isUsingRag = false

            this.GUI.ragEraser.style.display = 'none';
            this.GUI.ragTimerTxt.innerHTML = "";
            this.blurCanvas.ctx.globalCompositeOperation = "source-over";

            this.addPoints(0);
        }

        return;
    }

    NarrVampires.prototype.updateDifficulty = function (dt) {
        this.gameTime += dt;
        this.spawnTimeDecrease = 1;
        this.vampTimeDecrease = 1;

        for (this.i = 0; this.i < Math.floor(this.gameTime / 5000); this.i++) {
            this.spawnTimeDecrease *= 0.9;
            this.vampTimeDecrease *= 0.92;
        }

        this.timeBeetweenSpawns = this.timeBeetweenSpawnsStart * this.spawnTimeDecrease;
        this.vampTime = this.vampTimeStart * this.vampTimeDecrease;

        this.timeBeetweenSpawns = Math.max(this.timeBeetweenSpawns, this.vampTime / this.maxVampiresOnTheScreen);
    }

    NarrVampires.prototype.processSpawn = function (dt) {
        this.timeFromLastV += dt;
        if (this.timeFromLastV > this.timeBeetweenSpawns * this.randomizeSpawn) {
            this.randomizeSpawn = 1 + (0.3 * (0.5 - Math.random()));
            this.timeFromLastV = 0;
        }
        else
            return;

        if (this.curDivNum === undefined)
            return;

        this.newVampire = this.view.childNodes[1 + this.curDivNum]; // первый дочерний элемент - canvas

        this.ZIndex = 0;
        for (this.j = this.curDivNum + 1; this.j >= 1; this.j--) {
            bradapter.applyZIndex(this.view, this.view.childNodes[this.j], this.ZIndex++);
            this.view.childNodes[this.j].curZIndex = this.ZIndex;
        }
        for (this.j = this.view.childNodes.length - 1; this.j > this.curDivNum + 1; this.j--) {
            bradapter.applyZIndex(this.view, this.view.childNodes[this.j], this.ZIndex++);
            this.view.childNodes[this.j].curZIndex = this.ZIndex;
        }

        this.curDivNum++;
        if (this.curDivNum == this.vampiresOnScreen)
            this.curDivNum = 0;

        this.randX = Math.random();
        this.randY = Math.random();
        this.newVampire.params = {
            startPos: {
                x: Math.ceil(this.leftTopStart.x + this.startScale * (this.randX * this.moduleSize.x - 0.5 * this.vampireSize.x)),
                y: Math.ceil(this.leftTopStart.y + this.startScale * (this.randY * this.moduleSize.y - 0.5 * this.vampireSize.y))
            },
            pos: {},
            curScale: this.startScale,
            lifeTime: 0,
            vampTime: this.vampTime,
            isKilledByBomb: false,
            state: 0,
            delta: {},
        };

        this.newVampire.style.backgroundImage = 'url("' + this.imagesSrc.vampireSrc + '")';
        this.newVampire.style.width = Math.ceil(this.vampireSize.x * this.newVampire.params.curScale) + "px";
        this.newVampire.style.height = Math.ceil(this.vampireSize.y * this.newVampire.params.curScale) + "px";
        this.newVampire.style.backgroundSize = this.newVampire.style.width + " " + this.newVampire.style.height;
        this.newVampire.style.position = "absolute";
        this.newVampire.style.overflow = "visible";
        this.newVampire.style.opacity = 0.999;

        this.newVampire.childNodes[0].style.display = 'none';
        this.newVampire.childNodes[1].style.display = 'none';
        this.newVampire.childNodes[2].style.display = 'none';

        this.newVampire.active = true;
        this.newVampire.disappearing = false;
        this.newVampire.destroing = false;
        this.newVampire.params.pos.x = this.newVampire.params.startPos.x;
        this.newVampire.params.pos.y = this.newVampire.params.startPos.y;


        // Перемещение вампира в течение своего "полета"
        this.newVampire.params.delta = {
            x: (this.randX * this.moduleSize.x - 0.5 * this.vampireSize.x) - this.newVampire.params.startPos.x,
            y: (this.randY * this.moduleSize.y - 0.5 * this.vampireSize.y) - this.newVampire.params.startPos.y
        };

        this.newVampire.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.newVampire.params.pos.x) + "px," + Math.ceil(this.newVampire.params.pos.y) + "px,0px)";
    };

    NarrVampires.prototype.processMovement = function (dt) {
        for (this.i = 1; this.i < this.view.childNodes.length; this.i++) {
            this.moveVampire(this.view.childNodes[this.i], dt)
        }
    };

    NarrVampires.prototype.moveVampire = function (vampire, dt) {

        if (vampire.active || vampire.disappearing)
            vampire.params.lifeTime += dt;

        if (!vampire.active) {
            if (vampire.destroing) {
                vampire.timeFromDeath += dt;
                if (vampire.timeFromDeath > this.timeToDestroy) {
                    vampire.timeFromDeath = 0;
                    this.destroyVampire(vampire);
                }
                else {
                    this.dyingProgress = vampire.timeFromDeath / this.timeToDestroy;

                    this.tempScale1 = Math.max(1, (1 + this.dyingProgress * 2.0));
                    this.tempScale2 = Math.max(1, (1 + this.dyingProgress * 9.5));

                    this.curExplWidth = this.vampireSize.x * vampire.params.curScale * this.tempScale1;
                    this.curExplHeight = this.vampireSize.y * vampire.params.curScale * this.tempScale1;
                    vampire.childNodes[1].style.width = this.curExplWidth + "px";
                    vampire.childNodes[1].style.height = this.curExplHeight + "px";
                    vampire.childNodes[1].style.backgroundSize = vampire.childNodes[1].style.width + " " + vampire.childNodes[1].style.height;
                    this.explPos = {
                        x: Math.ceil(-(this.curExplWidth - this.vampireSize.x * vampire.params.curScale) / 2),
                        y: Math.ceil(-(this.curExplHeight - this.vampireSize.x * vampire.params.curScale) / 2)
                    }
                    vampire.childNodes[1].style[brprefix + "transform"] = "translate3d(" + this.explPos.x + "px,"
                        + this.explPos.y + "px,0px)";

                    this.curExplWidth = this.vampireSize.x * vampire.params.curScale * this.tempScale2;
                    this.curExplHeight = this.vampireSize.y * vampire.params.curScale * this.tempScale2;
                    vampire.childNodes[2].style.width = this.curExplWidth + "px";
                    vampire.childNodes[2].style.height = this.curExplHeight + "px";
                    vampire.childNodes[2].style.backgroundSize = vampire.childNodes[2].style.width + " " + vampire.childNodes[2].style.height;
                    this.explPos = {
                        x: Math.ceil(-(this.curExplWidth - this.vampireSize.x * vampire.params.curScale) / 2),
                        y: Math.ceil(-(this.curExplHeight - this.vampireSize.x * vampire.params.curScale) / 2)
                    }
                    vampire.childNodes[2].style[brprefix + "transform"] = "translate3d(" + this.explPos.x + "px,"
                        + this.explPos.y + "px,0px)";

                    vampire.style.opacity = Math.min(Math.max(0.001, (2 - Math.sqrt(this.dyingProgress)/**this.dyingProgress*/ * 2)), 0.999);

                    vampire.style.backgroundImage = "";
                    vampire.childNodes[0].style.display = 'block'; // показать грустное лицо
                    vampire.childNodes[1].style.display = 'block'; // показать взрыв1
                    vampire.childNodes[2].style.display = 'block'; // показать взрыв2
                }
            }
            if (vampire.disappearing) {
                if (vampire.params.lifeTime - vampire.params.vampTime > this.timeToDisappear) {
                    vampire.disappearing = false;
                    vampire.style.display = 'none';
                }
                else {
                    vampire.style.opacity = Math.min(Math.max(0.001, (2 - Math.sqrt((vampire.params.lifeTime - vampire.params.vampTime) / this.timeToDisappear) * 2)), 0.999);


                    // Scaling while disappearing
                    this.progress = vampire.params.lifeTime / vampire.params.vampTime;
                    this.vampSpeed = (1 - this.startScale) / vampire.params.vampTime;
                    vampire.params.curScale = this.startScale + this.vampSpeed * vampire.params.lifeTime;

                    vampire.style.width = Math.ceil(this.vampireSize.x * vampire.params.curScale) + "px";
                    vampire.style.height = Math.ceil(this.vampireSize.y * vampire.params.curScale) + "px";
                    vampire.style.backgroundSize = vampire.style.width + " " + vampire.style.height;


                    vampire.params.pos.x = vampire.params.startPos.x + vampire.params.delta.x * this.progress;
                    vampire.params.pos.y = vampire.params.startPos.y + vampire.params.delta.y * this.progress;
                    vampire.style[brprefix + "transform"] = "translate3d(" + Math.ceil(vampire.params.pos.x) + "px," + Math.ceil(vampire.params.pos.y) + "px,0px)";
                    vampire.style.display = 'block';
                }
            }
            return;
        }

        if (vampire.params.lifeTime < vampire.params.vampTime) {
            this.progress = vampire.params.lifeTime / vampire.params.vampTime;
            this.vampSpeed = (1 - this.startScale) / vampire.params.vampTime;
            vampire.params.curScale = this.startScale + this.vampSpeed * vampire.params.lifeTime;

            vampire.style.width = Math.ceil(this.vampireSize.x * vampire.params.curScale) + "px";
            vampire.style.height = Math.ceil(this.vampireSize.y * vampire.params.curScale) + "px";
            vampire.style.backgroundSize = vampire.style.width + " " + vampire.style.height;

            if (vampire.params.vampTime - vampire.params.lifeTime < 100)
                vampire.style.backgroundImage = 'url("' + this.imagesSrc.smashVampireSrc + '")';

            vampire.params.pos.x = vampire.params.startPos.x + vampire.params.delta.x * this.progress;
            vampire.params.pos.y = vampire.params.startPos.y + vampire.params.delta.y * this.progress;
            vampire.style[brprefix + "transform"] = "translate3d(" + Math.ceil(vampire.params.pos.x) + "px," + Math.ceil(vampire.params.pos.y) + "px,0px)";
            vampire.style.display = 'block';
            return true;
        }
        else {
            vampire.active = false;
            vampire.disappearing = true;

            this.blurScale = 0.9 + Math.random() * 0.2;
            this.blurImg.width = this.blurScale * this.blurSize.x;
            this.blurImg.height = this.blurScale * this.blurSize.y;

            this.blurX = vampire.params.pos.x + this.vampireSize.x / 2 - this.blurImg.width / 2;
            this.blurY = vampire.params.pos.y + this.vampireSize.y / 2 - this.blurImg.height / 2;

            this.drawRotatedImage(this.blurImg, this.blurX, this.blurY, Math.random() * 2 * Math.PI);

            this.erasePer = 0;
            this.pointCount = 0;
            // this.data = this.blurCanvas.ctx.getImageData(0, 0, this.blurCanvas.width/10, this.blurCanvas.height/10);
            for (var i = 100; i < this.blurCanvas.width - 100; i += 100) {
                for (var j = 100; j < this.blurCanvas.height - 100; j += 100) {
                    // console.log("i " + i);
                    // console.log("j " + j);
                    // console.log(this.blurCanvas.ctx.getImageData(i, j, 1, 1).data);
                    this.erasePer += this.blurCanvas.ctx.getImageData(i, j, 1, 1).data[3];
                    this.pointCount++;
                }
            }
            // -2 добавлено для подгонки под полный расчет (стабильно разница в 2 процента после 90% заполненности кровью экрана)
            this.erasePer = this.erasePer / (255 * this.pointCount) * 100 - 2;

            // console.log("short Percent" + this.erasePer);

            // Full calculation of blood percent

            // this.erasePer=0;
            // this.data = this.blurCanvas.ctx.getImageData(0, 0, this.blurCanvas.width, this.blurCanvas.height);
            // for (var i=0; i < this.blurCanvas.height*(this.blurCanvas.width-1)*4; i+=4*this.blurCanvas.width) {
            //     for (var j=0; j < this.blurCanvas.width*4; j+=4) {
            //         this.erasePer += this.data.data[i+j+3];
            //     }
            // }
            // this.erasePer = (this.erasePer/(this.width*this.height))/255*100;
            // console.log("full Percent" + this.erasePer);

            if (this.erasePer > this.losePercent) {
                this.fullPause = true;
                this.GUI.topPanel.style.display = 'none';
                this.GUI.pause.style.display = 'none';
                this.delegate.fireEvent("textSubst", ["vampiresKilled", this.vampiresKilled]);
                if ((this.vampiresKilled >= this.finalBounds[1]) && this.prize3)
                    this.delegate.fireEvent("performAnimation", [this.prize3]);
                else if ((this.vampiresKilled >= this.finalBounds[0]) && this.prize2)
                    this.delegate.fireEvent("performAnimation", [this.prize2]);
                else if (this.prize1)
                    this.delegate.fireEvent("performAnimation", [this.prize1]);
            }

            vampire.style.backgroundImage = 'url("' + this.imagesSrc.smashVampireSrc + '")';

            return false;
        }
    };


    NarrVampires.prototype.drawRotatedImage = function (image, x, y, angle) {
        this.blurCanvas.ctx.save();
        this.blurCanvas.ctx.translate(x + (image.width / 2), y + (image.height / 2));
        this.blurCanvas.ctx.rotate(angle);
        this.blurCanvas.ctx.drawImage(image, -(image.width / 2), -(image.height / 2), image.width, image.height);
        this.blurCanvas.ctx.restore();
    }

    NarrVampires.prototype.findVampire = function (targetPoint) {
        this.vampireToKill = undefined;
        for (var i = 1; i < this.view.childNodes.length; i++) {
            if (this.checkVampire(this.view.childNodes[i], targetPoint)) {
                if (!this.vampireToKill || (this.vampireToKill.curZIndex < this.view.childNodes[i].curZIndex))
                    this.vampireToKill = this.view.childNodes[i];
            }
        }
    };
    NarrVampires.prototype.checkVampire = function (vampire, targetPoint) {
        if (!vampire) {
            return false;
        }
        if (!vampire.active) {
            return false;
        }
        return this.checkHit(targetPoint, vampire.params.pos, {x: this.vampireSize.x * vampire.params.curScale, y: this.vampireSize.y * vampire.params.curScale});
    };

    NarrVampires.prototype.checkHit = function (eXY, posXY, sizeXY) {
        if (!(posXY.x < eXY.x && eXY.x < posXY.x + sizeXY.x)) {
            return false;
        }
        if (!(posXY.y < eXY.y && eXY.y < posXY.y + sizeXY.y)) {
            return false;
        }
        return true;
    };

    NarrVampires.prototype.killVampire = function (vampire) {
        if (!vampire)
            return;
        // console.log("KillVampire");
        this.vampiresKilled++;
        vampire.timeFromDeath = 0;
        vampire.active = false;
        vampire.destroing = true;
    };

    NarrVampires.prototype.destroyVampire = function (vampire) {
        if (!vampire)
            return;
        vampire.style.display = 'none';
        vampire.destroing = false;
        if (!vampire.params.isKilledByBomb)
            this.addPoints();
    };

    NarrVampires.prototype.useBomb = function () {
        for (this.i = 1; this.i < this.view.childNodes.length; this.i++) {
            if (this.view.childNodes[this.i].active) {
                this.view.childNodes[this.i].params.isKilledByBomb = true;
                this.killVampire(this.view.childNodes[this.i]);
            }
        }
        this.addPoints(-this.bombPrice);
        this.timeFromLastV = 0;
    };

    NarrVampires.prototype.startUsingRag = function () {
        this.addPoints(-this.ragPrice);
        this.isUsingRag = true;
        this.ragTimer = this.ragTime;

        this.GUI.ragEraser.style.backgroundImage = 'url("' + this.imagesSrc.ragStartSrc + '")';
        this.GUI.ragEraser.style.display = 'block';
        this.GUI.ragEraser.pos = {x: (this.moduleSize.x - this.ragSize.x) / 2, y: (this.moduleSize.y - this.ragSize.y) / 2};
        this.GUI.ragEraser.style[brprefix + "transform"] = "translate3d(" + this.GUI.ragEraser.pos.x + "px," + this.GUI.ragEraser.pos.y + "px,0px)";

        this.GUI.rag.style.backgroundImage = 'url("' + this.imagesSrc.timerBackSrc + '")';
        this.blurCanvas.ctx.globalCompositeOperation = "destination-out";
    };

    NarrVampires.prototype.switchPause = function (value) {
        if (value === undefined)
            this.pause = !this.pause;
        else
            this.pause = value;

        if (this.pause)
            this.GUI.pause.style.backgroundImage = 'url("' + this.imagesSrc.playSrc + '")';
        else
            this.GUI.pause.style.backgroundImage = 'url("' + this.imagesSrc.pauseSrc + '")';
    };

    NarrVampires.prototype.addPoints = function (points) {
        if (points === undefined)
            points = 1;

        if (/*(this.allPoints < this.bombPrice) && */((this.allPoints + points) >= this.bombPrice)) {
            this.GUI.bomb.style.backgroundImage = 'url("' + this.imagesSrc.bombOnSrc + '")';
            this.GUI.bomb.canUse = true;
        }
        if (/*(this.allPoints >= this.bombPrice) && */((this.allPoints + points) < this.bombPrice)) {
            this.GUI.bomb.style.backgroundImage = 'url("' + this.imagesSrc.bombOffSrc + '")';
            this.GUI.bomb.canUse = false;
        }

        if (/*(this.allPoints < this.ragPrice) && */((this.allPoints + points) >= this.ragPrice)) {
            this.GUI.rag.style.backgroundImage = 'url("' + this.imagesSrc.ragOnSrc + '")';
            this.GUI.rag.canUse = true;
        }
        if (/*(this.allPoints >= this.ragPrice) && */((this.allPoints + points) < this.ragPrice)) {
            this.GUI.rag.style.backgroundImage = 'url("' + this.imagesSrc.ragOffSrc + '")';
            this.GUI.rag.canUse = false;
        }

        this.allPoints += parseInt(points);
        this.GUI.points.innerHTML = this.allPoints;

        if (this.allPoints < this.bombPrice)
            this.GUI.bombProgress.style.height = (this.buttonHeight * this.allPoints / this.bombPrice) + "px";
        else
            this.GUI.bombProgress.style.height = "0px";

        if (this.allPoints < this.ragPrice)
            this.GUI.ragProgress.style.height = (this.buttonHeight * this.allPoints / this.ragPrice) + "px";
        else
            this.GUI.ragProgress.style.height = "0px";
    };

    NarrVampires.prototype.processGesture = function (dt) {
        if (this.gesture.vertSwipe) {
            this.gesture.timeFromStart += dt;
            if (this.gesture.timeFromStart > this.gesture.timeBetween) {
                this.resetGesture();
                return;
            }
            if (this.gesture.horSwipe) {
                // console.log(this.gesture.eStart1);
                // console.log(this.gesture.eEnd1);
                // console.log(this.gesture.eStart2);
                // console.log(this.gesture.eEnd2);

                this.targetPos = {
                    x: (this.gesture.eStart1.x + this.gesture.eEnd1.x) / 2,
                    y: (this.gesture.eStart2.y + this.gesture.eEnd2.y) / 2
                }
                // console.log(this.targetPos);

                this.findVampire(this.targetPos); //this.vampireToKill
                if (this.vampireToKill)
                    this.killVampire(this.vampireToKill);

                this.resetGesture();
            }
        }
    }
    NarrVampires.prototype.resetGesture = function (dt) {
        this.gesture.horSwipe = false;
        this.gesture.vertSwipe = false;
        this.gesture.timeFromStart = 0;
    }


    NarrVampires.prototype.vampiresStart = function (e) {
        e.stopPropagation();

        if (this.fullPause || this.pause)
            return true;

        if (!this.isUsingRag) {
            this.startGesture = false;
            if (!this.gesture.vertSwipe)
                this.gesture.eStart1 = this.getInternalCoordinatesForPoint(e);
            else
                this.gesture.eStart2 = this.getInternalCoordinatesForPoint(e);
        }
        else {
            this.e = this.getInternalCoordinatesForPoint(e);
            this.e = this.getInternalCoordinatesForPoint(e);
            this.eStart.x = this.e.x;
            this.eStart.y = this.e.y;

            this.GUI.ragEraser.start.x = this.e.x - this.GUI.ragEraser.size.x / 2;
            this.GUI.ragEraser.start.y = this.e.y - this.GUI.ragEraser.size.y / 2;

            return true;
        }
        return true;
    };

    NarrVampires.prototype.vampiresMove = function (e) {
        e.stopPropagation();

        if (!this.isUsingRag) {
            return true;
        }
        else {
            this.e = this.getInternalCoordinatesForPoint(e);
            if (this.moduleSize.x < this.eStart.xx || this.moduleSize.y < this.e.y || this.e.x < 0 || this.e.y < 0)
                return true;
            else {


                this.GUI.ragEraser.start.x += this.e.x - this.eStart.x;
                this.GUI.ragEraser.start.y += this.e.y - this.eStart.y;

                this.blurCanvas.ctx.beginPath();
                this.blurCanvas.ctx.moveTo(this.eStart.x, this.eStart.y);
                this.blurCanvas.ctx.lineTo(this.e.x, this.e.y);
                this.blurCanvas.ctx.lineWidth = this.eraseR * 2;
                this.blurCanvas.ctx.lineCap = "round";
                this.blurCanvas.ctx.stroke();

                this.GUI.ragEraser.style[brprefix + "transform"] = "translate3d(" + this.GUI.ragEraser.start.x + "px," + this.GUI.ragEraser.start.y + "px,0px)";
                this.GUI.ragEraser.pos.x = this.GUI.ragEraser.start.x;
                this.GUI.ragEraser.pos.y = this.GUI.ragEraser.start.y;
                this.GUI.ragEraser.style.backgroundImage = 'url("' + this.imagesSrc.ragSrc + '")';


            }


            this.eStart.x = this.e.x;
            this.eStart.y = this.e.y;
        }
    };

    NarrVampires.prototype.vampiresSwipe = function (e) {
        e.stopPropagation();
        // if (!this.gesture.vertSwipe)
        // {
        //     if (e.vertical === true){
        //         this.gesture.vertSwipe = true;
        //         this.startGesture = true;
        //         this.gesture.eEnd1 = this.getInternalCoordinatesForPoint(e);
        //     }
        // }
        // else {
        //     if (e.vertical === false){
        //         this.gesture.horSwipe = true;
        //         this.gesture.eEnd2 = this.getInternalCoordinatesForPoint(e);
        //     }
        //     else{
        //         this.resetGesture();
        //     }
        // }
    };

    NarrVampires.prototype.vampiresEnd = function (e) {
        e.stopPropagation();

// part from swipe for analize it as usual pan
        if (!this.gesture.vertSwipe) {
            this.gesture.eEnd1 = this.getInternalCoordinatesForPoint(e);
            if (this.isVertical(this.gesture.eStart1, this.gesture.eEnd1) === true) {
                this.gesture.vertSwipe = true;
                this.startGesture = true;
            }
        }
        else {
            this.gesture.eEnd2 = this.getInternalCoordinatesForPoint(e);
            if (this.isVertical(this.gesture.eStart2, this.gesture.eEnd2) === false) {
                this.gesture.horSwipe = true;
            }
            else {
                this.resetGesture();
            }
        }
////////////////////////////////////////////

        if (!this.gesture.vertSwipe) {
            // если это не жест, который начал движение
            // вертикальный свайп прошел, а горизонтальный нет, сбрасываем последовательность жестов
            if (!this.startGesture && this.gesture.vertSwipe && !this.gesture.horSwipe) {
                this.resetGesture();
                // console.log("RESET GESTURE");
            }
        }

        // console.log(this.gesture);
    };

// true - vertical, false - horizintal, undef - undef.
    NarrVampires.prototype.isVertical = function (start, end) {
        this.dx = end.x - start.x;
        this.dy = end.y - start.y;

        if ((this.dy > 0) && (Math.abs(this.dy / this.dx) > 3))
            return true;
        if ((this.dx > 0) && (Math.abs(this.dx / this.dy) > 3))
            return false;
        return undefined;
    };


    NarrVampires.prototype.pressButton = function (e) {
        this.eTap = this.getInternalCoordinatesForPoint(e);

        if (this.fullPause)
            return;

        e.stopPropagation();

        if (this.checkHit(this.eTap, this.GUI.pause.pos, this.GUI.pause.size)) {
            this.switchPause();
            return;
        }
        if (this.pause || this.isUsingRag)
            return;

        if (this.checkHit(this.eTap, this.GUI.rag.pos, this.GUI.rag.size)) {
            if (!this.GUI.rag.canUse)
                return;

            this.startUsingRag();
            return;
        }
        if (this.checkHit(this.eTap, this.GUI.bomb.pos, this.GUI.bomb.size)) {
            if (this.GUI.bomb.canUse)
                this.useBomb();
        }
        return true;
    };


    Utils.addBehaviour('pan', 'NarrVampires', 'NarrVampiresPan', {
        start: function (e) {
            return this.vampiresStart(e);
        }, move: function (e) {
            this.vampiresMove(e);
        }, swipe: function (e) {
            this.vampiresSwipe(e);
        }, end: function (e) {
            this.vampiresEnd(e);
        }}, false);

    Utils.addBehaviour('tap', 'NarrVampires', 'NarrVampiresTap', {
        end: function (e) {
            this.pressButton(e);
        }}, false);

    return NarrVampires;
});