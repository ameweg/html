define(["utils/Utils"], function (Utils) {
    var NarrGravitation = Utils.newObjectType(NarrGravitation, "NarrGravitation", {withCss: true}); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrGravitation.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        this.centerPos = description.centerPos;

        this.view.style.background = '#001B2D';

        // this.addArea({
        //     event_type  : 'pan',
        //     behaviour   : 'NarrGravitationPan',
        //     top         : 0,
        //     left        : 0,
        //     width       : this.width,
        //     height      : this.height,
        //     visible     : true,
        //     params      : this,
        //     propagation : 0
        // });

        // this.addArea({
        //     event_type  : 'touch',
        //     behaviour   : 'NarrGravitationTouch',
        //     top         : 0,
        //     left        : 0,
        //     width       : this.width,
        //     height      : this.height,
        //     visible     : true,
        //     params      : this,
        //     propagation : 1
        // });


        // this.gesture = {
        //     eStart1: {},
        //     eEnd1: {},
        //     eStart2: {},
        //     eEnd2: {},
        //     timeFromStart: 0,
        //     timeBetween: description.gestureTime,
        //     vertSwipe: false, horSwipe: false,
        // }

        this.eStart = {};
        this.e = {};

        this.orientationVect = {};

        this.minViableAngle = 25;
        this.maxViableAngle = 210;

        this.minActiveAngle = 70;
        this.maxActiveAngle = 200;


        this.startShipSpeed = 20 / 1000; //deg/ms
        this.shipSpeed = this.startShipSpeed; //deg/ms
        this.shipMaxAngle = 170;
        this.shipMinAngle = 135 - 15;
        this.earthR = 300;


        this.curGravR = 422;
        this.minGravR = 314;
        this.maxGravR = 602;
        this.gravStep = Math.round((this.maxGravR - this.minGravR) / 8);

        this.shipFireAngleUp = 150;
        this.shipFireAngleDown = 150;

        this.explosionTime = 500;
        this.finalExplosionTime1 = 300;
        this.finalExplosionTime2 = 500;

        // this.firstStart = true;

        this.loopPause = false;

        this.pointCounter = 0;

        this.difTime1 = 30 * 1000;
        this.difTime2 = 60 * 1000;
        this.difTime3_final = 30 * 1000;

        this.isNotInited = true;

        this.delegate.addEventListener("timer", this.loop, this);

    };

    NarrGravitation.prototype.load = function () {

        this.ship = document.createElement('div');
        this.earth = document.createElement('div');
        this.circles = document.createElement('div');
        this.flyingObject = document.createElement('div');
        this.gravField = document.createElement('div');
        this.regulator = document.createElement('div');
        this.regPointer = document.createElement('div');
        this.pause = document.createElement('div');
        this.explosion = document.createElement('div');
        this.finalExplosion = document.createElement('div');
        this.points = document.createElement('div');
        this.timer = document.createElement('div');
        this.timerText = document.createElement('div');
        this.progress = document.createElement('div');
        this.progressActive = document.createElement('div');

        this.timer.appendChild(this.timerText);
        this.progress.appendChild(this.progressActive);

        this.initAllElements();

        this.view.appendChild(this.points);
        this.view.appendChild(this.earth);
        this.view.appendChild(this.circles);
        this.view.appendChild(this.ship);
        this.view.appendChild(this.flyingObject);
        this.view.appendChild(this.gravField);
        // this.view.appendChild(this.regulator);
        this.view.appendChild(this.pause);
        this.view.appendChild(this.explosion);
        this.view.appendChild(this.finalExplosion);
        this.view.appendChild(this.timer);
        this.view.appendChild(this.progress);
        // this.view.appendChild(this.timerText);
        // this.updateOnMove();
    };

    NarrGravitation.prototype.initAllElements = function () {
        this.curGravR = 422;
        this.pointCounter = 0;
        this.timeLeft = 1000 * 60 * 2; // 2 min
        this.gameTime = 0;
        this.ship.nextRandomShotType = Math.round(Math.random());
        this.randShipAngle = Math.random();
        this.randAngleZone = 15;


        this.ship.size = this.imagesSize.ship;
        this.ship.polarPos = {alpha: 155, r: 800};
        this.ship.polarPosLast = {};
        this.ship.pos = {};
        this.ship.style.width = this.ship.size.x + "px";
        this.ship.style.height = this.ship.size.y + "px";
        this.ship.style.backgroundImage = 'url("' + this.imagesSrc.ship + '")';
        this.ship.style.backgroundSize = this.ship.style.width + " " + this.ship.style.height;
        this.ship.style.position = "absolute";
        bradapter.applyZIndex(this.view, this.ship, 4);
        this.ship.speedSign = ((0.5 - Math.random()) >= 0 ? 1 : -1);
        this.setPosFromPolar(this.ship, true);

        // this.ship.pos = this.imagesPos.shipWrapperPos;
        // this.ship.style[brprefix + "transform"] = "translate3d(" + this.ship.pos.x + "px, " + this.ship.pos.y + "px,0px)";

        this.earth.state = 0;
        this.earth.size = {x: this.imagesSize.earth.x, y: this.imagesSize.earth.y / 3};
        this.earth.style.width = this.earth.size.x + "px";
        this.earth.style.height = this.earth.size.y + "px";
        this.earth.style.backgroundImage = 'url("' + this.imagesSrc.earth + '")';
        this.earth.style.backgroundPosition = "0px " + (-this.earth.size.y * this.earth.state) + "px";
        this.earth.style.backgroundSize = this.imagesSize.earth.x + "px " + this.imagesSize.earth.y + "px ";
        this.earth.pos = this.imagesPos.earth;
        bradapter.applyZIndex(this.view, this.earth, 2);
        this.earth.style[brprefix + "transform"] = "translate3d(" + this.earth.pos.x + "px, " + this.earth.pos.y + "px,0px)";
        this.earth.style.position = "absolute";

        this.circles.state = 0;
        this.circles.size = this.imagesSize.circles;
        this.circles.style.width = this.circles.size.x + "px";
        this.circles.style.height = this.circles.size.y + "px";
        this.circles.style.backgroundImage = 'url("' + this.imagesSrc.circles + '")';
        this.circles.style.backgroundSize = this.imagesSize.circles.x + "px " + this.imagesSize.circles + "px ";
        this.circles.pos = this.imagesPos.circles;
        bradapter.applyZIndex(this.view, this.circles, 2);
        this.circles.style[brprefix + "transform"] = "translate3d(" + this.circles.pos.x + "px, " + this.circles.pos.y + "px,0px)";
        this.circles.style.position = "absolute";


////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.pause.size = {x: this.imagesSize.pause.x, y: this.imagesSize.pause.y / 4};
        this.pause.style.width = this.pause.size.x + "px";
        this.pause.style.height = this.pause.size.y + "px";
        this.pause.style.backgroundImage = 'url("' + this.imagesSrc.pause + '")';
        this.pause.style.backgroundSize = this.imagesSize.pause.x + "px " + this.imagesSize.pause.y + "px ";
        this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y) + "px";
        this.pause.style.position = "absolute";
        this.pause.pos = this.imagesPos.pause;
        this.pause.style[brprefix + "transform"] = "translate3d(" + this.pause.pos.x + "px," + this.pause.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.pause, 2);

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.progress.size = this.imagesSize.progress;
        this.progress.style.width = this.progress.size.x + "px";
        this.progress.style.height = this.progress.size.y + "px";
        this.progress.style.backgroundImage = 'url("' + this.imagesSrc.progress + '")';
        this.progress.style.backgroundSize = this.imagesSize.progress.x + "px " + this.imagesSize.progress.y + "px ";
        // this.progress.style.backgroundPosition = "0px " + (-this.progress.size.y) + "px";
        this.progress.style.position = "absolute";
        this.progress.pos = this.imagesPos.progress;
        this.progress.style[brprefix + "transform"] = "translate3d(" + this.progress.pos.x + "px," + this.progress.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.progress, 2);

        this.progressActive.style.width = 100 + "%";
        this.progressActive.style.height = 100 + "%";
        this.progressActive.style.backgroundImage = 'url("' + this.imagesSrc.progressActive + '")';
        this.progressActive.style.backgroundSize = this.progressActive.style.width + " " + this.progressActive.style.height;
        this.progressActive.style.backgroundPosition = (-this.progress.size.x - 15) + "px 0px ";
        this.progress.style.position = "absolute";

////////////////////////////////////////////////////////////////////
// POINTS
////////////////////////////////////////////////////////////////////
        this.points.style.width = 140 + "px";
        this.points.style.height = 70 + "px";
        this.points.style.overflow = "visible";
        this.points.style.lineHeight = this.points.style.height;
        this.points.style.textAlign = "left";

        this.points.style.fontFamily = "MuseoSansCyrl900";
        this.points.style.fontSize = "70px";
        this.points.style.color = "#737373";

        this.points.pos = this.imagesPos.points;
        this.points.style.position = "absolute";
        this.points.style[brprefix + "transform"] = "translate3d(" + this.points.pos.x + "px," + this.points.pos.y + "px,0px)";
        this.points.innerHTML = "0";
        this.points.style.display = 'none';

////////////////////////////////////////////////////////////////////
// TIMER
////////////////////////////////////////////////////////////////////
        this.timer.size = this.imagesSize.timer;
        this.timer.style.width = this.timer.size.x + "px";
        this.timer.style.height = this.timer.size.y + "px";
        this.timer.style.backgroundImage = 'url("' + this.imagesSrc.timer + '")';
        this.timer.style.backgroundSize = this.imagesSize.timer.x + "px " + this.imagesSize.timer.y + "px ";
        this.timer.style.position = "absolute";
        this.timer.pos = this.imagesPos.timer;
        this.timer.style[brprefix + "transform"] = "translate3d(" + this.timer.pos.x + "px," + this.timer.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.timer, 3);


        this.timerText.style.width = 140 + "px";
        this.timerText.style.height = 70 + "px";
        this.timerText.style.overflow = "visible";
        this.timerText.style.lineHeight = this.timerText.style.height;
        this.timerText.style.textAlign = "left";

        this.timerText.style.fontFamily = "MuseoSansCyrl900";
        this.timerText.style.fontSize = "70px";
        this.timerText.style.color = "#737373";

        this.timerText.pos = this.imagesPos.timerText;
        this.timerText.style.position = "absolute";
        this.timerText.style[brprefix + "transform"] = "translate3d(" + this.timerText.pos.x + "px," + this.timerText.pos.y + "px,0px)";
        this.timerText.innerHTML = "2:00";

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

        this.explosion.size = this.imagesSize.explosion;
        this.explosion.style.width = this.explosion.size.x + "px";
        this.explosion.style.height = this.explosion.size.y + "px";
        this.explosion.style.backgroundImage = 'url("' + this.imagesSrc.explosion + '")';
        this.explosion.style.backgroundSize = this.explosion.style.width + " " + this.explosion.style.height;
        this.explosion.style.position = "absolute";
        this.explosion.pos = {};
        // this.explosion.style[brprefix + "transform"] = "translate3d(" + this.explosion.pos.x + "px," + this.explosion.pos.y + "px,0px)";
        this.explosion.style.display = 'none';
        bradapter.applyZIndex(this.view, this.explosion, 3);

        this.finalExplosion.size = {x: this.imagesSize.finalExplosion.x, y: this.imagesSize.finalExplosion.y / 2};
        this.finalExplosion.style.width = this.finalExplosion.size.x + "px";
        this.finalExplosion.style.height = this.finalExplosion.size.y + "px";
        this.finalExplosion.style.backgroundImage = 'url("' + this.imagesSrc.finalExplosion + '")';
        this.finalExplosion.style.backgroundSize = this.imagesSize.finalExplosion.x + "px " + this.imagesSize.finalExplosion.y + "px ";
        this.finalExplosion.style.backgroundPosition = "0px " + (-this.finalExplosion.size.y) + "px";
        this.finalExplosion.style.position = "absolute";
        this.finalExplosion.style.display = 'none';
        this.finalExplosion.pos = this.imagesPos.finalExplosion;
        this.finalExplosion.style[brprefix + "transform"] = "translate3d(" + this.finalExplosion.pos.x + "px," + this.finalExplosion.pos.y + "px,0px)";
        bradapter.applyZIndex(this.view, this.finalExplosion, 4);

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
        this.gravField.size = {x: this.curGravR * 2, y: this.curGravR * 2};
        this.gravField.style.width = this.gravField.size.x + "px";
        this.gravField.style.height = this.gravField.size.y + "px";
        this.gravField.style.backgroundImage = 'url("' + this.imagesSrc.gravField + '")';
        // this.gravField.style.background = "#9b9b9b";
        // this.gravField.style.borderRadius = 50 + "%";
        // this.gravField.style.opacity = 0.5;

        this.gravField.style.backgroundSize = "100% 100%";
        this.gravField.pos = {x: (this.centerPos.x - this.gravField.size.x / 2), y: (this.centerPos.y - this.gravField.size.y / 2)};
        this.gravField.style[brprefix + "transform"] = "translate3d(" + this.gravField.pos.x + "px, " + this.gravField.pos.y + "px,0px)";
        this.gravField.style.position = "absolute";


        this.flyingObject.state = 0;
        this.flyingObject.size = {x: this.imagesSize.flyingObject.x, y: this.imagesSize.flyingObject.y};
        this.flyingObject.polarPos = {alpha: 135, r: 800};
        // this.flyingObject.polarPosLast = {alpha:135, r:800};
        this.flyingObject.pos = {};
        this.flyingObject.style.width = this.flyingObject.size.x + "px";
        this.flyingObject.style.height = this.flyingObject.size.y + "px";
        // this.flyingObject.style.backgroundImage = 'url("' + this.imagesSrc.flyingObject[0] + '")';
        this.flyingObject.style.backgroundSize = this.flyingObject.style.width + " " + this.flyingObject.style.height;
        this.flyingObject.style.position = "absolute";
        this.flyingObject.style.display = 'none';
        bradapter.applyZIndex(this.view, this.flyingObject, 3);

        this.isNotInited = false;
    };

    NarrGravitation.prototype.unload = function () {
        this.curGravR = 422;
        this.pointCounter = 0;
        this.fullPause = true;
        this.loopPause = false;
        this.shipSpeed = this.startShipSpeed;

        delete this.ship;
        delete this.earth;
        delete this.circles;
        delete this.flyingObject;
        delete this.gravField;
        delete this.regulator;
        delete this.regPointer;
        delete this.pause;
        delete this.explosion;
        delete this.finalExplosion;
        delete this.points;
        delete this.timer;
        delete this.timerText;
        delete this.progress;
        delete this.progressActive;

        this.deleteDomElements(this.view);
    };

    NarrGravitation.prototype.setPosFromPolar = function (obj, isOrientedToCenter) {
        if (!obj.polarPos) {
            return;
        }
        obj.pos.x = this.centerPos.x + obj.polarPos.r * Math.cos(obj.polarPos.alpha * Math.PI / 180) - obj.size.x / 2;
        obj.pos.y = this.centerPos.y + obj.polarPos.r * Math.sin(obj.polarPos.alpha * Math.PI / 180) - obj.size.y / 2;

        if (isOrientedToCenter) {
            obj.style[brprefix + "transform"] = "translate3d(" + obj.pos.x + "px, " + obj.pos.y + "px,0px)" +
                "rotateZ(" + (obj.polarPos.alpha - 180 + 36) + "deg) ";
        }
        else {
            obj.style[brprefix + "transform"] = "translate3d(" + obj.pos.x + "px, " + obj.pos.y + "px,0px)";
        }
    };

    NarrGravitation.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrGravitation.prototype.draw = function () { // необязательно
        // this.fullPause = 0; // comment for release
        if (this.fullPause == 0)
            this.initAllElements();
        this.switchPause(this.fullPause);
    };

    NarrGravitation.prototype.loop = function (dt) { // необязательно
        if (this.loopPause || this.fullPause || this.isNotInited)
            return;

        dt = Math.min(100, dt);
        this.updateShip(dt);
        this.updateFlyingObject(dt);
        this.updateTimer(dt);
        this.updateDifficulty(dt);
    };
// NarrGravitation.prototype.draw = function () { // необязательно
// };

    NarrGravitation.prototype.updateTimer = function (dt) {
        this.timeLeft -= dt;

        if (this.timeLeft < 0) {
            this.delegate.fireEvent("textSubst", ["gravGamePoints", this.pointCounter]);
            this.delegate.fireEvent("performAnimation", [this.animLost]);
            this.fullPause = true;
            return;
        }

        this.seconds = (Math.floor(this.timeLeft / 1000) % 60);
        this.timerText.innerHTML = Math.floor(this.timeLeft / 1000 / 60) + ":" + (this.seconds < 10 ? ("0" + this.seconds) : (this.seconds));
    }

    NarrGravitation.prototype.updateDifficulty = function (dt) {
        this.gameTime += dt;

        if (this.gameTime < this.difTime1) {
            this.shipSpeed = this.startShipSpeed * (1 + 3 * this.gameTime / this.difTime1);
            return;
        }
        if (this.gameTime > this.difTime2 && this.gameTime < this.difTime2 + this.difTime3_final) {
            this.shipSpeed = this.startShipSpeed * (4 + 1 * (this.gameTime - this.difTime2) / this.difTime3_final);
            return;
        }
    }

    NarrGravitation.prototype.updateShip = function (dt) {
        this.ship.polarPosLast.alpha = this.ship.polarPos.alpha;
        this.ship.polarPos.alpha += Math.min(this.startShipSpeed * 1.5, this.shipSpeed) * dt * this.ship.speedSign;

        if ((this.ship.polarPos.alpha > this.shipMaxAngle - this.randShipAngle * this.randAngleZone) && this.ship.speedSign > 0) {
            this.randShipAngle = Math.random();
            // this.ship.polarPos.alpha = this.shipMaxAngle;
            this.ship.speedSign *= -1;
            return;
        }
        else if ((this.ship.polarPos.alpha < this.shipMinAngle + this.randShipAngle * this.randAngleZone) && this.ship.speedSign < 0) {
            this.randShipAngle = Math.random();
            // this.ship.polarPos.alpha = this.shipMinAngle;
            this.ship.speedSign *= -1;
            return;
        }

        if (this.ship.polarPosLast.alpha > this.shipFireAngleUp && this.ship.polarPos.alpha < this.shipFireAngleUp) {
            if (this.flyingObject.state == 0 && this.ship.nextRandomShotType == 0) {
                this.ship.nextRandomShotType = Math.round(Math.random());
                this.flyingObject.state = 1; //start
            }
        }
        else if (this.ship.polarPosLast.alpha < this.shipFireAngleDown && this.ship.polarPos.alpha > this.shipFireAngleDown) {
            if (this.flyingObject.state == 0 && this.ship.nextRandomShotType == 1) {
                this.ship.nextRandomShotType = Math.round(Math.random());
                this.flyingObject.state = 1; //start
            }
        }

        this.setPosFromPolar(this.ship, true);
    };

    NarrGravitation.prototype.updateFlyingObject = function (dt) {
        switch (this.flyingObject.state) {
            case 0: //idle
                break;
            case 1: //start
                this.flyingObject.polarPos.alpha = this.ship.polarPos.alpha;
                this.flyingObject.polarPos.r = this.ship.polarPos.r - this.ship.size.x;
                this.flyingObject.speedSign = this.ship.speedSign;
                this.flyingObject.isActive = true;
                this.flyingObject.speedToEarth = 0.03;
                this.flyingObject.startSpeedToEarth = this.flyingObject.speedToEarth * 4;
                this.flyingObject.style.display = 'block';
                this.setPosFromPolar(this.flyingObject, false);
                this.flyingObject.state = 2;
                this.flyingObject.rotSpeed = this.shipSpeed * 3;
                this.flyingObject.startRotSpeed = this.flyingObject.rotSpeed;

                this.flyingObject.type = Math.round(Math.random());
                if (this.flyingObject.type == 0) {
                    this.flyingObject.style.backgroundImage = 'url("' + this.imagesSrc.flyingObjectBad[Math.ceil(Math.random() * 3) - 1] + '")';
                }
                else {
                    this.flyingObject.style.backgroundImage = 'url("' + this.imagesSrc.flyingObjectGood[Math.ceil(Math.random() * 3) - 1] + '")';
                }

                this.flyingObject.angle = this.ship.polarPos.alpha - 180;
                this.flyingObject.style[brprefix + "transform"] = "translate3d(" + this.flyingObject.pos.x + "px, " + this.flyingObject.pos.y + "px,0px)" +
                    "rotateZ(" + this.flyingObject.angle + "deg) ";

                break;

            case 2: //spiral flying
                this.flyingObject.polarPos.alpha += this.shipSpeed * dt * this.flyingObject.speedSign;
                this.flyingObject.polarPos.r -= dt * this.flyingObject.speedToEarth;
                this.setPosFromPolar(this.flyingObject, false);


                this.flyingObject.angle += this.flyingObject.rotSpeed * dt;
                this.flyingObject.style[brprefix + "transform"] = "translate3d(" + this.flyingObject.pos.x + "px, " + this.flyingObject.pos.y + "px,0px)" +
                    "rotateZ(" + this.flyingObject.angle + "deg) ";

                if (this.flyingObject.polarPos.r < this.curGravR/* - this.flyingObject.size.x/4*/ && this.flyingObject.isActive)
                    this.flyingObject.state = 3;
                if ((this.flyingObject.polarPos.alpha < this.minViableAngle) || (this.flyingObject.polarPos.alpha > this.maxViableAngle))
                    this.flyingObject.state = 5;
                if ((this.flyingObject.polarPos.alpha < this.minActiveAngle) || (this.flyingObject.polarPos.alpha > this.maxActiveAngle))
                    this.flyingObject.isActive = false;
                break;

            case 3: //vertical flying
                this.flyingObject.speedToEarth += this.flyingObject.startSpeedToEarth / 1000 * dt * 10;

                // this.flyingObject.polarPos.alpha += this.shipSpeed*dt*this.flyingObject.speedSign;
                this.flyingObject.polarPos.r -= dt * this.flyingObject.speedToEarth;
                this.setPosFromPolar(this.flyingObject, false);

                this.flyingObject.rotSpeed += this.flyingObject.startRotSpeed / 1000 * dt * 2;
                // this.flyingObject.angle += dt*this.flyingObject.rotSpeed;
                this.flyingObject.style[brprefix + "transform"] = "translate3d(" + this.flyingObject.pos.x + "px, " + this.flyingObject.pos.y + "px,0px)" +
                    "rotateZ(" + this.flyingObject.angle + "deg) ";

                if (this.flyingObject.polarPos.r < this.earthR) {
                    this.flyingObject.style.display = 'none';

                    this.explosion.pos.x = this.flyingObject.pos.x + this.flyingObject.size.x / 2 - this.explosion.size.x / 2;
                    this.explosion.pos.y = this.flyingObject.pos.y + this.flyingObject.size.y / 2 - this.explosion.size.y / 2;
                    this.explosion.style[brprefix + "transform"] = "translate3d(" + this.explosion.pos.x + "px," + this.explosion.pos.y + "px,0px)";
                    if (this.flyingObject.type == 0)
                        this.explosion.style.backgroundImage = 'url("' + this.imagesSrc.explosion + '")';
                    else {
                        this.pointCounter++;
                        this.points.innerHTML = this.pointCounter;

                        this.progressActive.style.backgroundPosition = (-this.progress.size.x - 15 + (15 + 18) * this.pointCounter) + "px 0px ";

                        this.explosion.style.backgroundImage = 'url("' + this.imagesSrc.confetti + '")';
                    }
                    this.explosion.style.display = 'block';

                    this.explisionTimer = 0;

                    this.flyingObject.state = 4;
                }
                break;
            case 4: //explosion

                this.explisionTimer += dt;
                if (this.explisionTimer > this.explosionTime) {
                    this.explosion.style.display = 'none';

                    if (this.flyingObject.type == 0) {
                        this.earth.state++;
                        if (this.earth.state == 3) {
                            // game over
                            this.flyingObject.state = 7;
                            this.finalExplisionTimer = 0;
                            this.finalExplosion.style.display = 'block';
                            break;
                        }
                        else {
                            this.earth.style.backgroundPosition = "0px " + (-this.earth.size.y * this.earth.state) + "px";
                        }
                    }
                    else {
                        if (this.pointCounter == 12) {
                            this.delegate.fireEvent("textSubst", ["gravGamePoints", this.pointCounter]);
                            this.delegate.fireEvent("performAnimation", [this.animWin]);
                            this.fullPause = true;
                        }
                    }

                    this.flyingObject.state = 6;
                }
                break;
            case 7: //final boom
                this.finalExplisionTimer += dt;
                if (this.finalExplisionTimer > this.finalExplosionTime2) {
                    this.delegate.fireEvent("textSubst", ["gravGamePoints", this.pointCounter]);
                    this.delegate.fireEvent("performAnimation", [this.animLost]);
                    this.flyingObject.state = 6;
                    this.fullPause = true;
                }
                if (this.finalExplisionTimer > this.finalExplosionTime1) {
                    this.finalExplosion.style.backgroundPosition = "0px " + 0 + "px";
                }
                break;
            case 5: //out
                // if (this.flyingObject.type == 0){
                //     this.pointCounter++;
                //     this.points.innerHTML = this.pointCounter;
                // }
                this.flyingObject.state = 6;
                break;

            case 6: //finish
                this.flyingObject.state = 0;
                break;

        }
    };

    NarrGravitation.prototype.updateGravR = function () {
        // this.curGravR = this.minGravR + (this.maxGravR - this.minGravR)*progress;

        // this.discreteGravR = this.curGravR - ((this.minGravR - this.curGravR)%this.gravStep);
        this.dR = (this.curGravR - this.minGravR);
        this.discreteGravR = this.minGravR + Math.round(this.dR % this.gravStep / this.gravStep) * this.gravStep + Math.floor(this.dR / this.gravStep) * this.gravStep;

        this.gravField.size = {x: this.discreteGravR * 2, y: this.discreteGravR * 2};
        this.gravField.style.width = this.gravField.size.x + "px";
        this.gravField.style.height = this.gravField.size.y + "px";

        this.gravField.pos = {x: (this.centerPos.x - this.gravField.size.x / 2), y: (this.centerPos.y - this.gravField.size.y / 2)};
        this.gravField.style[brprefix + "transform"] = "translate3d(" + this.gravField.pos.x + "px, " + this.gravField.pos.y + "px,0px)";

    };

    NarrGravitation.prototype.switchPause = function (new_value) {
        if (new_value === undefined)
            this.loopPause = !this.loopPause;
        else
            this.loopPause = new_value;


        if (this.loopPause)
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 3) + "px";
        else
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 1) + "px";
    }

    NarrGravitation.prototype.gravitationStart = function (e, obj) {
        if (this.fullPause)
            return false;
        e.stopPropagation();

        if (!obj || this.loopPause)
            return false;

        this.tempE = this.getInternalCoordinatesForPoint(e);
        if (((this.tempE.x - this.centerPos.x) * (this.tempE.x - this.centerPos.x) + (this.tempE.y - this.centerPos.y) * (this.tempE.y - this.centerPos.y)) < this.maxGravR * this.maxGravR) {
            this.eStart = this.getInternalCoordinatesForPoint(e);
            this.rStart = Math.sqrt((this.eStart.x - this.centerPos.x) * (this.eStart.x - this.centerPos.x) + (this.eStart.y - this.centerPos.y) * (this.eStart.y - this.centerPos.y));
            return true;
        }
        else {
            return false;
        }
    };

    NarrGravitation.prototype.gravitationMove = function (e) {
        e.stopPropagation();

        if (this.fullPause)
            return false;


        this.e = this.getInternalCoordinatesForPoint(e);

        this.rEnd = Math.sqrt((this.e.x - this.centerPos.x) * (this.e.x - this.centerPos.x) + (this.e.y - this.centerPos.y) * (this.e.y - this.centerPos.y));
        this.deltaR = this.rEnd - this.rStart;
        // this.regPointer.start.x += this.e.x - this.eStart.x;
        // if (this.regPointer.start.x < 0)
        //     this.regPointer.start.x = 0;
        // if (this.regPointer.start.x + this.regPointer.size.x > this.regulator.size.x)
        //     this.regPointer.start.x = this.regulator.size.x - this.regPointer.size.x;

        // this.regPointer.style[brprefix + "transform"] = "translate3d(" + this.regPointer.start.x + "px," + this.regPointer.pos.y + "px,0px)";
        // this.regPointer.pos.x = this.regPointer.start.x;
        this.rStart = this.rEnd;
        this.eStart = this.getInternalCoordinatesForPoint(e);

        this.curGravR += this.deltaR;
        this.curGravR = Math.max(Math.min(this.curGravR, this.maxGravR), this.minGravR);
        this.updateGravR();

    };

    NarrGravitation.prototype.gravitationEnd = function (e) {
        e.stopPropagation();

    };


    NarrGravitation.prototype.pauseStart = function (e, obj) {
        if (this.fullPause)
            return false;
        e.stopPropagation();
        if (this.loopPause) {
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 2) + "px";
            // this.pause.style.backgroundImage = 'url("' + this.imagesSrc.play[1] + '")';
        }
        else {
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 0) + "px";
            // this.pause.style.backgroundImage = 'url("' + this.imagesSrc.pause[1] + '")';
        }

        return true;
    };

    NarrGravitation.prototype.pauseEnd = function (e) {
        e.stopPropagation();

        if (this.hittestForRect({pType: 0, left: this.pause.pos.x, top: this.pause.pos.y, width: this.pause.size.x, height: this.pause.size.y}, e)) {
            this.loopPause = !this.loopPause;
        }

        if (this.loopPause) {
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 3) + "px";
            // this.pause.style.backgroundImage = 'url("' + this.imagesSrc.play[0] + '")';
        }
        else {
            this.pause.style.backgroundPosition = "0px " + (-this.pause.size.y * 1) + "px";
            // this.pause.style.backgroundImage = 'url("' + this.imagesSrc.pause[0] + '")';
        }
    };


    NarrGravitation.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrGravitationPan') {
            return true;
        }
        else if (gesture == 'NarrGravitationTouch') {
            if (this.hittestForRect({pType: 0, left: this.pause.pos.x, top: this.pause.pos.y, width: this.pause.size.x, height: this.pause.size.y}, e))
                return this.pause;
        }
        else
            return false;
    };


    Utils.addBehaviour('pan', 'NarrGravitation', 'NarrGravitationPan', {
        start: function (e, obj) {
            return this.gravitationStart(e, obj);
        }, move: function (e) {
            this.gravitationMove(e);
        }, swipe: function (e) {
            e.stopPropagation();
        }, end: function (e) {
            this.gravitationEnd(e);
        }}, false);

    Utils.addBehaviour('touch', 'NarrGravitation', 'NarrGravitationTouch', {
        start: function (e, obj) {
            return this.pauseStart(e, obj);
        }, end: function (e) {
            this.pauseEnd(e);
        }}, false);

    return NarrGravitation;
});