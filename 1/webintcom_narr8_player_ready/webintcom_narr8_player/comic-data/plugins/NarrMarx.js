define(["utils/Utils"], function (Utils) {
    var NarrMarx = Utils.newObjectType(NarrMarx, "NarrMarx");
// обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.


    NarrMarx.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        // this.view.style.background = '#555555';

        this.count = 40;
        this.nearestCount = 5;
        this.moduleSize = description.size;
        this.speed = 100 / 1000; // px/ms
        this.rotSpeed = 120 / 1000; // deg/ms

        this.redTime = 4000;


        description = description.settings;
        this.moduleSize = description.size;

        this.imagesSrc = description.imagesSrc;
        this.imagesSize = description.imagesSize;
        this.imagesPos = description.imagesPos;

        this.view.style.backgroundImage = 'url("' + this.imagesSrc.back + '")';
        this.view.style.backgroundSize = '100% 100%';

        this.bugSize = description.imagesSize.bug;

        this.bugR = (this.bugSize.x + this.bugSize.y) / 6; // условно, пока так
        this.availDistSqr = (this.bugR + this.bugR) * (this.bugR + this.bugR);

        this.targetR = (description.imagesSize.target.x + description.imagesSize.target.y) / 4;
        this.availDistToTgtSqr = (this.bugR + this.targetR ) * (this.bugR + this.targetR);

        this.delegate.addEventListener("timer", this.loop, this);
    };


    NarrMarx.prototype.loop = function (dt) {
        if (!this.isInited)
            return;

        dt = Math.min(100, dt);
        this.updateAngle(dt);
        this.processMovement(dt);
        this.processRedBugs(dt);
        this.processBugCollision();
    };

    NarrMarx.prototype.load = function () {
        this.targetImg = document.createElement('div');
        this.allBugs = document.createElement('div');
        this.mouth = document.createElement('div');

        this.targetImg.style.backgroundImage = 'url("' + this.imagesSrc.target + '")';
        this.targetImg.style.backgroundSize = 'auto 100%';
        this.targetImg.style.width = this.imagesSize.target.x + "px";
        this.targetImg.style.height = this.imagesSize.target.y + "px";
        this.targetImg.style.position = "absolute";
        this.targetImg.pos = this.imagesPos.target;
        this.targetImg.size = this.imagesSize.target;
        this.targetImg.start = {};
        this.targetImg.eStart = {};
        this.targetImg.eEnd = {};
        this.targetImg.state = 0;
        this.targetImg.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.targetImg.pos.x) + "px," + Math.ceil(this.targetImg.pos.y) + "px,0px)";

        this.mouth.style.backgroundImage = 'url("' + this.imagesSrc.mouth + '")';
        this.mouth.style.backgroundSize = 'auto 100%';
        this.mouth.style.width = this.imagesSize.mouth.x + "px";
        this.mouth.style.height = this.imagesSize.mouth.y + "px";
        this.mouth.style.position = "absolute";
        this.mouth.size = this.imagesSize.mouth;
        this.mouth.style.opacity = 0.999;
        this.mouth.pos = this.imagesPos.mouth;
        this.mouth.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.mouth.pos.x) + "px," + Math.ceil(this.mouth.pos.y) + "px,0px)";

        this.allBugs.style.width = 100 + "%";
        this.allBugs.style.height = 100 + "%";
        this.allBugs.style.position = "absolute";
        bradapter.applyZIndex(this.view, this.allBugs, 2);
        this.view.appendChild(this.allBugs);

        for (this.j = 0; this.j < this.count; this.j++) {
            this.newBug = document.createElement('div');
            this.newBug.bugType = Math.floor(Math.random() * 2);

            this.newBug.style.backgroundImage = 'url("' + this.imagesSrc.bug[this.newBug.bugType] + '")';
            this.newBug.style.backgroundSize = '100% 100%';
            this.newBug.style.width = this.bugSize.x + "px";
            this.newBug.style.height = this.bugSize.y + "px";
            this.newBug.pos = {x: ~~(Math.random() * (this.moduleSize.x - this.bugSize.x)), y: ~~(Math.random() * (this.moduleSize.y - this.bugSize.y))};
            this.newBug.curAngle = Math.random() * 360;
            this.newBug.finAngle = Math.random() * 360;
            this.newBug.state = 0;
            this.newBug.style.position = "absolute";
            this.newBug.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.newBug.pos.x) + "px," + Math.ceil(this.newBug.pos.y) + "px,0px)" +
                'rotateZ(' + this.newBug.curAngle + 'deg) ';

            this.newBug.redTimer = this.redTime * 0.1 + this.redTime * Math.random() * 0.9;

            this.newBug.start = {};
            this.newBug.eStart = {};
            this.newBug.eEnd = {};

            this.newBug.place = false;
            this.newBug.lastMoveNorm = this.newBug.curMoveNorm = 0;

            this.newBug.nearestL = {};
            this.newBug.nearestNbrs = {};

            this.allBugs.appendChild(this.newBug);
        }

        this.view.appendChild(this.targetImg);
        this.targetImg.appendChild(this.mouth);
        this.initBugDistances(); //инициализация расстояний между жуками для оптимизации перемещений

        this.isTapped = false;
        this.marxAnim = {state: 0, phase: 0};
        this.marxAnimT = 300;
        this.marxAnimTimer = this.marxAnimT;

        this.isInited = true;
    };


    NarrMarx.prototype.unload = function () {
        delete this.targetImg;
        delete this.mouth;
        delete this.allBugs;

        delete this.newBug;
        delete this.tempBug;
        delete this.tempBug1;
        delete this.tempBug2;

        this.isInited = false;
        this.deleteDomElements(this.view);
    };

    NarrMarx.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrMarx.prototype.updateAngle = function (dt) {
        for (this.i = 0; this.i < this.allBugs.childNodes.length; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];

            this.deltaAngle = (this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360; // 0 % 360

            if (this.deltaAngle == 0) {

                if (this.tempBug.collisionCount)
                    this.tempBug.finAngle = (this.tempBug.finAngle + 180) % 360;
                this.tempBug.rotDir = 0;
                continue;
            }

            else if (this.deltaAngle >= 180) {
                if (this.tempBug.collisionCount > 1)
                    this.tempBug.curAngle -= this.rotSpeed * dt * 3;
                else
                    this.tempBug.curAngle -= this.rotSpeed * dt;

                this.tempBug.curAngle = (this.tempBug.curAngle + 360) % 360;
                this.tempBug.rotDir = -1;
                if ((this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360 < 180) {
                    this.tempBug.curAngle = this.tempBug.finAngle;
                }
            }
            else if (this.deltaAngle < 180) {
                if (this.tempBug.collisionCount > 1)
                    this.tempBug.curAngle += this.rotSpeed * dt * 3;
                else
                    this.tempBug.curAngle += this.rotSpeed * dt;

                this.tempBug.curAngle = (this.tempBug.curAngle + 360) % 360;
                this.tempBug.rotDir = 1;
                if ((this.tempBug.finAngle - this.tempBug.curAngle + 360) % 360 > 180) {
                    this.tempBug.curAngle = this.tempBug.finAngle;
                }
            }
        }
    };

    NarrMarx.prototype.processRedBugs = function (dt) {
        this.redCounter = 0;
        for (this.i = 0; this.i < this.allBugs.childNodes.length; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];
            if (!this.tempBug.bugType)
                this.redCounter++;
            if (this.tempBug.bugType == 0) {
                if (!this.isTapped) {
                    this.tempBug.redTimer -= dt;
                    if (this.tempBug.redTimer < 0) {
                        this.switchBugType(this.tempBug, 1);
                    }
                }
            }
        }

        this.redPercent = Math.max(0, this.redCounter / (this.allBugs.childNodes.length + 1) - 0.001);
        this.marxAnim.state = 20 - Math.floor(this.redPercent * 21);
        this.targetImg.style.backgroundPosition = -this.targetImg.size.x * this.marxAnim.state + "px 0px";
        this.mouth.style.backgroundPosition = -this.targetImg.size.x * this.marxAnim.state + "px 0px";

        if (this.isTapped) {
            this.marxAnimTimer -= dt;
            if (this.marxAnimTimer < 0) {
                this.marxAnimTimer = this.marxAnimT;
                this.marxAnim.phase = !this.marxAnim.phase;
                this.mouth.style.opacity = this.marxAnim.phase ? 0.999 : 0.001;
            }
        }


    };


    NarrMarx.prototype.processMovement = function (dt) {
        for (this.i = 0; this.i < this.allBugs.childNodes.length; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];

            this.tempBug.forwardX = this.speed * dt * Math.sin(this.tempBug.curAngle * Math.PI / 180);
            this.tempBug.forwardY = -this.speed * dt * Math.cos(this.tempBug.curAngle * Math.PI / 180);

            this.tempBug.newXAfterColl = this.tempBug.pos.x + this.tempBug.forwardX;
            this.tempBug.newYAfterColl = this.tempBug.pos.y + this.tempBug.forwardY;
        }
        this.targetImg.newXAfterColl = this.targetImg.pos.x;
        this.targetImg.newYAfterColl = this.targetImg.pos.y;

        this.processBugCollision();

        for (this.i = 0; this.i < this.allBugs.childNodes.length; this.i++) {
            this.tempBug = this.allBugs.childNodes[this.i];

            if (this.tempBug.newXAfterColl < 0)
                this.newX = 0;
            else if (this.tempBug.newXAfterColl > this.moduleSize.x - this.bugSize.x)
                this.newX = this.moduleSize.x - this.bugSize.x;
            else
                this.newX = this.tempBug.newXAfterColl;
            this.mvX = (Math.abs(this.tempBug.forwardX) - Math.abs(this.tempBug.newXAfterColl - this.newX));

            if (this.tempBug.newYAfterColl < 0)
                this.newY = 0;
            else if (this.tempBug.newYAfterColl > this.moduleSize.y - this.bugSize.y)
                this.newY = this.moduleSize.y - this.bugSize.y;
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

            // if (!this.i)
            //     console.log(this.tempBug.curAngle);
            this.tempBug.style[brprefix + "transform"] = "translate3d(" + Math.ceil(this.tempBug.pos.x) + "px," + Math.ceil(this.tempBug.pos.y) + "px,0px)" +
                'rotateZ(' + this.tempBug.curAngle + 'deg) ';

        }
    };

    NarrMarx.prototype.processBorderCollision = function (bug) {
        if (!bug) return;

        if (bug.bugType == 0 && this.isTapped) {
            this.setAngleToTarget(bug);
        }
        else {
            switch (bug.collisionCount) {
                case 0:
                {
                    bug.collisionCount++;
                    bug.finAngle = bug.curAngle + (90 + Math.random() * 90);
                    bug.finAngle = (bug.finAngle + 360) % 360;
                    break;
                }
                case 1:
                {
                    // ждем круг для оценки првильности выбора направления
                    bug.collisionCount++;
                    break;
                }
                case 2:
                {
                    if (bug.lastMoveNorm >= bug.curMoveNorm) {
                        bug.collisionCount++;
                        // bug.finAngle = bug.finAngle + 180;
                        bug.finAngle = (bug.finAngle + 360 + 90) % 360;
                        // console.log("case 2:{ bug.collisionCount++;" + bug.finAngle);
                    }
                    break;
                }
            }
        }
    };

    NarrMarx.prototype.setAngleToTarget = function (bug) {
        if (!bug) return;

        this.bugCenter = {x: bug.pos.x + this.bugSize.x / 2, y: bug.pos.y + this.bugSize.y / 2};
        this.targetCenter = {x: this.targetImg.pos.x + this.targetImg.size.x / 2, y: this.targetImg.pos.y + this.targetImg.size.y / 2};
        this.dirVector = {x: this.targetCenter.x - this.bugCenter.x, y: this.targetCenter.y - this.bugCenter.y};
        // this.dirVector.x *= -1;
        // this.dirVector.y *= -1;
        bug.finAngle = this.dirVector.y < 0 ? -Math.atan(this.dirVector.x / this.dirVector.y) * 180 / Math.PI : 180 - Math.atan(this.dirVector.x / this.dirVector.y) * 180 / Math.PI;
        bug.finAngle = (bug.finAngle + 360) % 360;
    }

    NarrMarx.prototype.switchBugType = function (bug, type) {
        if (!bug) return;
        if (type === undefined) type = !bug.bugType;

        bug.bugType = type;
        bug.style.backgroundImage = 'url("' + this.imagesSrc.bug[bug.bugType] + '")';
    }

    NarrMarx.prototype.processAngleCollision = function (bug) {
        if (!bug) return;

        // console.log("NarrMarx.prototype.processAngleCollision " + bug.collisionCount);
        if (bug.bugType == 0 && this.isTapped) {
            this.setAngleToTarget(bug);
        }
        else {
            if (bug.collisionCount == 4)
                return;
            // console.log("bug.finAngle1 " + bug.finAngle);
            bug.collisionCount = 4;
            bug.finAngle = (bug.curAngle + 180 + (Math.random() - 0.5) + 360) % 360;
            // console.log("bug.finAngle2 " + bug.finAngle);
        }
    };

    NarrMarx.prototype.processBugCollision = function () {
        this.findBugNearest(this.allBugs.childNodes[this.curBugNum++]);
        if (this.curBugNum == this.allBugs.childNodes.length)
            this.curBugNum = 0;

        // Функция берет переменные
        // this.tempBug.newXAfterColl
        // this.tempBug.newXAfterColl
        // и корректирует их в зависимости от перекрытия жуков. они "расталкивают" друг друга
        for (this.j = 0; this.j < this.allBugs.childNodes.length; this.j++) {
            this.tempBug1 = this.allBugs.childNodes[this.j];

            for (this.k = 0; this.k < Math.min(this.nearestCount, this.allBugs.childNodes.length - 2); this.k++) {
                // if (this.k == this.j)
                //     continue;
                // this.tempBug2 = this.view.childNodes[this.k];
                // console.log("this.k " + this.k)
                this.tempBug2 = this.allBugs.childNodes[this.tempBug1.nearestNbrs[this.k]];

                if (this.tempBug2 == undefined)
                    debugger;

                this.distY = this.tempBug2.newYAfterColl - this.tempBug1.newYAfterColl;
                this.distX = this.tempBug2.newXAfterColl - this.tempBug1.newXAfterColl;
                // console.log("this.distX " + this.distX);
                // console.log("this.distY " + this.distY);

                this.distanceSqr = this.distX * this.distX + this.distY * this.distY;
                // console.log("this.distanceSqr " + this.distanceSqr);
                // console.log("this.availDistSqr " + this.availDistSqr);
                if (this.distanceSqr > this.availDistSqr)
                    continue;
                else {
                    // this.overlapMeasure = ((Math.sqrt(this.availDistSqr) - Math.sqrt(this.distanceSqr)) / Math.sqrt(this.availDistSqr)) / 2;
                    this.overlapMeasure = (1 - Math.sqrt(this.distanceSqr / this.availDistSqr)) * 0.5;
                    this.overlapX = this.distX * this.overlapMeasure;
                    this.overlapY = this.distY * this.overlapMeasure;

                    this.tempBug1.newXAfterColl -= this.overlapX;
                    this.tempBug1.newYAfterColl -= this.overlapY;

                    this.tempBug2.newXAfterColl += this.overlapX;
                    this.tempBug2.newYAfterColl += this.overlapY;
                }
            }
        }
        // Отработка коллизий с целью (куда они ползут)
        for (this.j = 0; this.j < this.allBugs.childNodes.length; this.j++) {
            this.tempBug1 = this.allBugs.childNodes[this.j];

            // this.targetImg = this.view.childNodes[0];

            this.distX = (this.targetImg.newXAfterColl + this.targetR) - (this.tempBug1.newXAfterColl + this.bugR);
            this.distY = (this.targetImg.newYAfterColl + this.targetR) - (this.tempBug1.newYAfterColl + this.bugR);

            this.distanceSqr = this.distX * this.distX + this.distY * this.distY;
            if (this.distanceSqr > this.availDistToTgtSqr)
                continue;
            else {
                this.overlapMeasure = ((Math.sqrt(this.availDistToTgtSqr) - Math.sqrt(this.distanceSqr)) / Math.sqrt(this.availDistToTgtSqr));
                this.overlapX = this.distX * this.overlapMeasure;
                this.overlapY = this.distY * this.overlapMeasure;

                this.tempBug1.newXAfterColl -= this.overlapX;
                this.tempBug1.newYAfterColl -= this.overlapY;

                if (this.tempBug1.bugType == 1)
                    this.switchBugType(this.tempBug1, 0);

                // this.tempBug1.redTimer = this.redTime*0.5 + this.redTime*Math.random();
                this.tempBug1.redTimer = this.redTime * 0.1 + this.redTime * Math.random() * 0.9;
                // if (!this.isTapped){
                //     this.tempBug1.finAngle = this.tempBug1.curAngle + (180-Math.random()*360);
                //     this.tempBug1.finAngle = (this.tempBug1.finAngle + 360) % 360;
                // }
            }
        }
    };

    NarrMarx.prototype.initBugDistances = function () {
        for (this.j = 0; this.j < this.allBugs.childNodes.length; this.j++) {
            this.findBugNearest(this.allBugs.childNodes[this.j]);
        }
        this.curBugNum = 0;
    };


    NarrMarx.prototype.findBugNearest = function (bug) {
        if (!bug) return;
        this.distances = [];

        for (this.k = 0; this.k < this.allBugs.childNodes.length; this.k++) {
            // if (this.k == this.j)
            //     continue;

            this.tempBug1 = this.allBugs.childNodes[this.k];

            this.distX = bug.newXAfterColl - this.tempBug1.newXAfterColl;
            this.distY = bug.newYAfterColl - this.tempBug1.newYAfterColl;

            this.distanceSqr = this.distX * this.distX + this.distY * this.distY;
            this.distances[this.k - 1] = {dist: this.distanceSqr, num: this.k};
        }

        this.distances.sort(function (a, b) {
            return a.dist - b.dist;
        });

        // перебор от самых близких.
        for (this.k = 0; this.k < Math.min(this.nearestCount, this.allBugs.childNodes.length - 1); this.k++) {
            bug.nearestL[this.k] = this.distances[this.k].dist;
            bug.nearestNbrs[this.k] = this.distances[this.k].num;
        }
    };

    NarrMarx.prototype.marxStart = function (e, obj) {
        e.stopPropagation();
        if (!obj || this.moveObj) return false;
        this.moveObj = obj;
        this.moveObj.start.x = obj.pos.x;
        this.moveObj.start.y = obj.pos.y;
        this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        // bradapter.applyZIndex(this.view, this.moveObj, 5);

        for (this.k = 0; this.k < this.allBugs.childNodes.length; this.k++) {
            this.tempBug1 = this.allBugs.childNodes[this.k];
            if (this.tempBug1.bugType == 0) {
                this.setAngleToTarget(this.tempBug1);
            }
        }

        this.isTapped = true;
        return true;
    };

    NarrMarx.prototype.marxMove = function (e, obj) {
        e.stopPropagation();
        this.moveObj.eEnd = this.getInternalCoordinatesForPoint(e);
        if (this.moduleSize.x < this.moveObj.eEnd.x || this.moduleSize.y < this.moveObj.eEnd.y || this.moveObj.eEnd.x < 0 || this.moveObj.eEnd.y < 0)
            return true;
        else {
            this.moveObj.start.x += this.moveObj.eEnd.x - this.moveObj.eStart.x;
            this.moveObj.start.y += this.moveObj.eEnd.y - this.moveObj.eStart.y;
            if (this.moveObj.start.x < 0)
                this.moveObj.start.x = 0;
            if (this.moveObj.start.x + this.moveObj.size.x > this.moduleSize.x)
                this.moveObj.start.x = this.moduleSize.x - this.moveObj.size.x;
            if (this.moveObj.start.y < 0)
                this.moveObj.start.y = 0;
            if (this.moveObj.start.y + this.moveObj.size.y > this.moduleSize.y)
                this.moveObj.start.y = this.moduleSize.y - this.moveObj.size.y;
            this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.start.x + "px," + this.moveObj.start.y + "px,0px)";
            this.moveObj.pos.x = this.moveObj.start.x;
            this.moveObj.pos.y = this.moveObj.start.y;

            for (this.k = 0; this.k < this.allBugs.childNodes.length; this.k++) {
                this.tempBug1 = this.allBugs.childNodes[this.k];
                if (this.tempBug1.bugType == 0) {
                    this.setAngleToTarget(this.tempBug1);
                }
            }

            this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        }
    };

    NarrMarx.prototype.marxEnd = function (e) {
        e.stopPropagation();
        if (!this.moveObj)
            return false;
        this.moveObj = false;
        for (this.k = 0; this.k < this.allBugs.childNodes.length; this.k++) {
            this.tempBug1 = this.allBugs.childNodes[this.k];
            if (this.tempBug1.bugType == 0) {
                this.tempBug1.finAngle = Math.random() * 360;
                // this.tempBug1.redTimer = this.redTime*0.5 + this.redTime*Math.random();
                this.tempBug1.redTimer = this.redTime * 0.1 + this.redTime * Math.random() * 0.9;
            }
        }
        this.isTapped = false;
    };


    NarrMarx.prototype.customHittest = function (e, gesture) {
        if (gesture == 'NarrMarxPan') {
            if (this.hittestForRect({pType: 0, left: this.targetImg.pos.x,
                top: this.targetImg.pos.y, width: this.targetImg.size.x,
                height: this.targetImg.size.y}, e))
                return this.targetImg;
        }
        else
            return false;
    };


    Utils.addBehaviour('pan', 'NarrMarx', 'NarrMarxPan', {
        start: function (e, obj) {
            return this.marxStart(e, obj);
        }, move: function (e, obj) {
            this.marxMove(e, obj);
        }, swipe: function (e) {
            e.stopPropagation();
            return true;
        }, end: function (e) {
            this.marxEnd(e);
        }}, false);

    return NarrMarx;
});