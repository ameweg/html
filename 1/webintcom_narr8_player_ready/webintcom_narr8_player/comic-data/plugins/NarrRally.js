define(["utils/Utils"], function (Utils) {

    var NarrRally = Utils.newObjectType(NarrRally, "NarrRally");

    NarrRally.prototype.init = function (description) {
        this.settings = description.settings;
        this.rallyClockTimeCounter = 0;
        this.rallyTimeCounter = 0;
        this.place = {x: this.width, y: this.height};
        this.livesCounter = 0;
        this.rallyGoldCounter = 0;
        this.checkPointCounter = 0;
        this.rallyA = 0.04;
        this.rallySCounter = 0;
        this.rallyGeneratorFlag = false;
        this.save100m = 0;
        this.rally100mCounter = 0;
        this.rally1kmCounter = 0;
        this.animationCounter = 0;
        this.settings.levels = this.settings.levels || 10;
        this.rallyGameOverFlag = false;
    }
    NarrRally.prototype.draw = function () {
        if (this.RALLY_RESTART_GAME) {
            this.RALLY_RESTART_GAME = 0;
            this.clearRallyGame();
            this.restartRallyGame();
        }
        if (this.RALLY_PAUSE_GAME) {
            this.RALLY_PAUSE_GAME = 0;
            this.pauseRallyGame();
        }
        if (this.RALLY_RESUME_GAME) {
            this.RALLY_RESUME_GAME = 0;
            this.resumeRallyGame();
        }
        if (this.RALLY_LIFE_COMPLETE) {
            this.RALLY_LIFE_COMPLETE = 0;
            if (!this.rallyGameOverFlag) {
                this.clearRallyGame();
                this.startRallyGame();
            }
        }
        if (this.RALLY_LEFT) {
            this.RALLY_LEFT = 0;
            this.rallyLeft();
        }
        if (this.RALLY_RIGHT) {
            this.RALLY_RIGHT = 0;
            this.rallyRight();
        }
    }
    NarrRally.prototype.load = function () {
        for (var i in this.settings.images) {
            this.settings.images[i].v = this.settings.maxSpeed ? this.settings.maxSpeed : 10;
            this.settings.images[i].a = 10;
            this.settings.images[i].aq = this.settings.angle / 45;
            this.settings.images[i].rq = (this.settings.roadSize - this.settings.perspective) * 0.5;
            this.settings.images[i].roadSize = this.settings.roadSize;
            this.settings.images[i].perspective = this.settings.perspective;
            this.settings.images[i].angle = this.settings.angle;
            this.settings.images[i].place = {x: this.x, y: this.y, width: this.width, height: this.height};
            this.settings.images[i].qy = this.settings.images.lines.size.y * 1.8;
        }

        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.width = this.width + 'px';
        this.container.style.height = this.height + 'px';

        if (this.settings.images.bg && this.settings.images.bg.src != '') {
            this.container.style['background-image'] = 'url(' + this.settings.images.bg.src + ')';
            this.container.style['background-size'] = this.settings.images.bg.size.x + 'px ' + this.settings.images.bg.size.y + 'px';
            this.container.style['background-position'] = this.settings.images.bg.position.x + 'px ' + this.settings.images.bg.position.y + 'px';
            this.container.style['background-repeat'] = 'repeat';
        }
        if (this.settings.images.sun && this.settings.images.sun.src != '') {
            var sun = new Image();
            sun.style.position = 'absolute';
            sun.src = this.settings.images.sun.src;
            sun.style.width = this.settings.images.sun.size.x + 'px';
            sun.style.height = this.settings.images.sun.size.y + 'px';
            sun.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.settings.images.sun.position.x, this.settings.images.sun.position.y);
            this.container.appendChild(sun);
        }

        this.lines = new NarrRallyLinesObject(this.settings.images.lines, this.settings.lines);
        this.lines.init();
        this.container.appendChild(this.lines.container);

        this.rallyRoadsideObjects = new NarrRallyRoadsideObjects([this.settings.images.object_0, this.settings.images.object_1], {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyRoadsideObjects.init();
        this.container.appendChild(this.rallyRoadsideObjects.container);

        this.rallyPit = new NarrRallyPitObject(this.settings.images.pit, this.settings.lines[0].angle, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyPit.init();
        this.container.appendChild(this.rallyPit.container);

        this.rallyBarrier = new NarrRallyBarrierObject(this.settings.images.barrier, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyBarrier.init();
        this.container.appendChild(this.rallyBarrier.container);
        bradapter.applyZIndex(this.container, this.rallyBarrier.container, 100);

        this.rallyGold = new NarrRallyGoldObject(this.settings.images.gold, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyGold.container = this.rallyBarrier.container;
        this.rallyGold.init();

        this.rallyCar = new NarrRallyCar([this.settings.images.carLeft, this.settings.images.carCenter, this.settings.images.carRight]);
        this.rallyCar.init();
        this.container.appendChild(this.rallyCar.container);
        bradapter.applyZIndex(this.container, this.rallyCar.container, 101);

        this.rallyStart = new NarrRallyStartObject(this.settings.images.start, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyStart.container = this.rallyCar.container;
        this.rallyStart.init();

        this.rallyFinish = new NarrRallyFinishObject(this.settings.images.finish, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyFinish.container = this.rallyCar.container;
        this.rallyFinish.init();

        this.rallyCheckpoint = new NarrRallyCheckpointObject(this.settings.images.finish, {x: this.settings.images.lines.position.x, y: this.settings.images.lines.position.y});
        this.rallyCheckpoint.container = this.rallyCar.container;
        this.rallyCheckpoint.init();

        this.view.appendChild(this.container);
    }
    NarrRally.prototype.unload = function () {
        this.delegate.removeEventListener('timer', this.timerRally, this);
        this.clearRallyGame();
        this.lines = null;
        this.rallyRoadsideObjects = null;
        this.rallyPit = null;
        this.rallyBarrier = null;
        this.rallyGold = null;
        this.rallyCar = null;
        this.rallyStart = null;
        this.rallyFinish = null;
        this.rallyCheckpoint = null;
        this.view.removeChild(this.container);
        this.container = null;
    }

///////////////////////////////////////////////////////////////
//////////////--------  Управление игрой --------//////////////
///////////////////////////////////////////////////////////////

    NarrRally.prototype.restartRallyGame = function () {
        this.clearRallyGame();
        this.livesCounter = this.settings.livesCounter;
        this.rallyTimeCounter = 0;
        this.rallyClockTimeCounter = 0;
        this.rallyGoldCounter = this.settings.goldCounter;
        this.checkPointCounter = 0;
        this.rallyS = 0;
        this.rallySCounter = 0;
        this.save100m = 0;
        this.rally100mCounter = 0;
        this.rally1kmCounter = 0;
        this.rallyStart.start();
        this.rallyGameOverFlag = false;
        this.startRallyGame();
    }
    NarrRally.prototype.startRallyGame = function () {
        this.generatorTimer = 0;
        if (this.RALLY_START)
            this.delegate.fireEvent("performAnimation", [this.RALLY_START]);

        if (this.settings.distance * 100 - this.rallyS > 10 || (this.settings.checkPoints[this.checkPointCounter] && this.settings.checkPoints[this.checkPointCounter] * 100 - this.rallyS > 10))
            this.rallyGeneratorFlag = true;

        this.rallyA = 0.001;
        this.status = 'speedUp';
        this.rallyCar.setStatus(1);
        this.delegate.addEventListener('timer', this.timerRally, this);
    }
    NarrRally.prototype.pauseRallyGame = function () {
        this.delegate.removeEventListener('timer', this.timerRally, this);
        this.status = 'pause';
    }
    NarrRally.prototype.resumeRallyGame = function () {
        if (this.settings.distance * 100 - this.rallyS > 10 || (this.settings.checkPoints[this.checkPointCounter] && this.settings.checkPoints[this.checkPointCounter] * 100 - this.rallyS > 10))
            this.rallyGeneratorFlag = true;
        this.status = 'speedUp';
        this.delegate.addEventListener('timer', this.timerRally, this);
    }
    NarrRally.prototype.clearRallyGame = function () {
        this.delegate.removeEventListener('timer', this.timerRally, this);
        this.rallyPit.clear();
        this.rallyBarrier.clear();
        this.rallyGold.clear();
        this.rallyRoadsideObjects.clear();
    }

///////////////////////////////////////////////////////////////
//////////////-------  Общая логика игры  -------//////////////
///////////////////////////////////////////////////////////////

    NarrRally.prototype.timerRally = function (event) {
        this.animationCounter++;
        if (this.animationCounter == 2) {
            this.animationCounter = 0;

            if (this.status == 'speedUp') {
                if (this.rallyA < this.settings.maxSpeed * 0.00025) this.rallyA += Math.ceil(this.rallyA * 200) / 1000;
                else if (this.rallyA < this.settings.maxSpeed * 0.0007) this.rallyA += Math.ceil(this.rallyA * 10) / 1000;
                else if (this.rallyA < this.settings.maxSpeed * 0.001) this.rallyA += Math.ceil(this.rallyA * 5) / 1000;
                else {
                    this.status = 'run';
                    this.rallyA = this.settings.maxSpeed / 1000;
                }
            }
            else if (this.status == 'speedDown') {
                if (this.rallyA >= this.settings.maxSpeed * 0.0002)
                    this.rallyA -= this.rallyA * 0.02 * this.speedDownQ;
            }
            this.rallyS += this.rallyA;

            if (this.rallyS - this.save100m > 10) {
                this.rally100mCounter++;
                this.save100m = this.rallyS = this.rally1kmCounter * 100 + this.rally100mCounter * 10;
                if (this.RALLY_100M)
                    this.delegate.fireEvent("performAnimation", [this.RALLY_100M]);
            }

            if (this.rally100mCounter == 10) {
                this.rally100mCounter = 0;
                this.rally1kmCounter++;
                if (this.RALLY_1KM)
                    this.delegate.fireEvent("performAnimation", [this.RALLY_1KM]);
            }

            if (this.rally1kmCounter == this.settings.distance) {
                this.status = 'pause';
                this.rallyA = 0.04;
                this.rallyCongratulations();
            }
            else if (this.status != 'speedDown' &&
                this.settings.distance * 100 - this.rallyS < this.settings.maxSpeed * 0.02) {
                this.rallyFinish.start();
                this.speedDownQ = this.rallyA * 1000 / this.settings.maxSpeed;
                this.status = 'speedDown'
            }
            else if (this.settings.distance * 100 - this.rallyS < this.settings.maxSpeed * 0.09)
                this.rallyGeneratorFlag = false;
            else {
                if (this.settings.checkPoints[this.checkPointCounter]) {
                    if (this.rally1kmCounter == this.settings.checkPoints[this.checkPointCounter]) {
                        this.status = 'pause';
                        this.rallyA = 0.04;
                        this.pauseRallyGame();
                        if (this['RALLY_CHECK_POINT_' + this.checkPointCounter])
                            this.delegate.fireEvent("performAnimation", [this['RALLY_CHECK_POINT_' + this.checkPointCounter]]);
                        this.checkPointCounter++;
                    }
                    else if (this.rally1kmCounter == this.settings.checkPoints[this.checkPointCounter] - 1) {
                        if (!this.rallyCheckpoint.action &&
                            this.status != 'speedDown' &&
                            this.settings.checkPoints[this.checkPointCounter] * 100 - this.rallyS < this.settings.maxSpeed * 0.02) {
                            this.rallyCheckpoint.start();
                            this.speedDownQ = this.rallyA * 1000 / this.settings.maxSpeed;
                            this.status = 'speedDown'
                        }
                        else if (this.settings.checkPoints[this.checkPointCounter] * 100 - this.rallyS < this.settings.maxSpeed * 0.09)
                            this.rallyGeneratorFlag = false;
                    }
                }
            }

            if (Math.floor(this.rallyS * this.settings.levels / 10) != this.rallySCounter) {
                this.rallySCounter = Math.floor(this.rallyS * this.settings.levels / 10);

                if (this.rallyGeneratorFlag) {
                    this.rallyElementsGenerator('gold');
                    this.rallyElementsGenerator('barrier');
                    this.rallyElementsGenerator('pit');
                    this.rallyElementsGenerator('object');
                }
            }
            this.redrawAnimationRally();
            this.rallyHitTest();
        }
        this.rallyClockTimeCounter++;
        if (this.rallyClockTimeCounter > 61) {
            this.rallyClockTimeCounter = 0;
            this.rallyChangeTime();
        }
    }
    NarrRally.prototype.rallyLifeComplete = function () {
        this.pauseRallyGame();
        if (this.RALLY_CRACH)
            this.delegate.fireEvent("performAnimation", [this.RALLY_CRACH]);

        if (this.livesCounter > 0) {
            this.livesCounter--;
            if (this.RALLY_LIFE)
                this.delegate.fireEvent("performAnimation", [this.RALLY_LIFE]);
        }
        else
            this.rallyGameOver();
    }
    NarrRally.prototype.rallyGameOver = function () {
        this.rallyGameOverFlag = true;
        if (this.RALLY_GAME_OVER)
            this.delegate.fireEvent("performAnimation", [this.RALLY_GAME_OVER]);
    }
    NarrRally.prototype.rallyElementsGenerator = function (type) {
        switch (type) {
            case 'barrier':
                if (Math.random() < 0.05 * this.settings.levels)
                    this.rallyBarrier.start();
                break;
            case 'pit':
                if (Math.random() < 0.05 * this.settings.levels)
                    this.rallyPit.start();
                break;
            case 'object':
                if (Math.random() < 0.05 * this.settings.levels)
                    this.rallyRoadsideObjects.start();
                break;
            case 'gold':
                if (this.rallyGoldCounter && Math.random() < 0.5) {
                    this.rallyGoldSaver = 2 + Math.floor(Math.random() * 4);
                    if (this.rallyGoldSaver > this.rallyGoldCounter)
                        this.rallyGoldSaver = this.rallyGoldCounter;
                    this.rallyGoldCounter -= this.rallyGoldSaver;
                    this.rallyGold.start(this.rallyGoldSaver);
                }
                break;
        }
    }
    NarrRally.prototype.rallyChangeTime = function () {
        this.rallyTimeCounter++;
        if (this.SECOND)
            this.delegate.fireEvent("performAnimation", [this.SECOND]);
    }
    NarrRally.prototype.rallyHitTest = function () {
        if (this.status != 'pause') {
            for (this.rallyJ = 0; this.rallyJ < this.rallyPit.elements.length; this.rallyJ++)
                if (this.rallyPit.elements[this.rallyJ].action && this.rallyPit.elements[this.rallyJ].status && this.rallyPit.elements[this.rallyJ].line == this.rallyCar.status &&
                    this.rallyPit.elements[this.rallyJ].position.y >= this.settings.hittest) {
                    this.rallyPit.elements[this.rallyJ].status = false;
                    this.rallyA *= 0.3;
                    this.status = 'speedUp';
                }
            for (this.rallyJ = 0; this.rallyJ < this.rallyBarrier.elements.length; this.rallyJ++)
                if (this.rallyBarrier.elements[this.rallyJ].action &&
                    this.rallyBarrier.elements[this.rallyJ].line == this.rallyCar.status &&
                    this.rallyBarrier.elements[this.rallyJ].position.y + this.rallyBarrier.elements[this.rallyJ].size.y >= this.settings.hittest)
                    this.rallyLifeComplete();
            for (this.rallyJ = 0; this.rallyJ < this.rallyGold.elements.length; this.rallyJ++)
                if (this.rallyGold.elements[this.rallyJ].action &&
                    this.rallyGold.elements[this.rallyJ].line == this.rallyCar.status &&
                    this.rallyGold.elements[this.rallyJ].position.y + this.rallyGold.settings.size.y * this.rallyGold.elements[this.rallyJ].seek >= this.settings.hittest)
                    this.rallyGoldCaught(this.rallyGold.elements[this.rallyJ]);
        }
    }
    NarrRally.prototype.rallyCongratulations = function () {
        this.pauseRallyGame();
        if (this.RALLY_CONGRATULATIONS)
            this.delegate.fireEvent("performAnimation", [this.RALLY_CONGRATULATIONS]);
    }
    NarrRally.prototype.rallyGoldCaught = function (element) {
        this.rallyGold.off(element);
        if (this.RALLY_GOLD)
            this.delegate.fireEvent("performAnimation", [this.RALLY_GOLD]);
    }
    NarrRally.prototype.rallyLeft = function () {
        if (this.status != 'pause' && this.rallyCar.status > 0) {
            this.rallyI = 0;
            for (this.rallyI = 0; this.rallyI < this.rallyBarrier.elements.length; this.rallyI++)
                if (this.rallyBarrier.elements[this.rallyI].action &&
                    this.rallyBarrier.elements[this.rallyI].line == this.rallyCar.status - 1 &&
                    this.rallyBarrier.elements[this.rallyI].position.y + this.rallyBarrier.settings.size.y * this.rallyBarrier.elements[this.rallyI].seek >= this.settings.hittest)
                    break;
            if (this.rallyI == this.rallyBarrier.elements.length)
                this.rallyCar.setStatus(this.rallyCar.status - 1);
        }
    }
    NarrRally.prototype.rallyRight = function () {
        if (this.status != 'pause' && this.rallyCar.status < 2) {
            this.rallyI = 0;
            for (this.rallyI = 0; this.rallyI < this.rallyBarrier.elements.length; this.rallyI++)
                if (this.rallyBarrier.elements[this.rallyI].action &&
                    this.rallyBarrier.elements[this.rallyI].line == this.rallyCar.status + 1 &&
                    this.rallyBarrier.elements[this.rallyI].position.y + this.rallyBarrier.settings.size.y * this.rallyBarrier.elements[this.rallyI].seek >= this.settings.hittest)
                    break;
            if (this.rallyI == this.rallyBarrier.elements.length)
                this.rallyCar.setStatus(this.rallyCar.status + 1);
        }
    }

///////////////////////////////////////////////////////////////
//////////////-------  Отрисовка анимации  ------//////////////
///////////////////////////////////////////////////////////////

    NarrRally.prototype.redrawAnimationRally = function () {
        this.lines.update(this.rallyA);
        this.lines.redraw();
        this.rallyPit.update(this.rallyA);
        this.rallyPit.redraw();
        this.rallyBarrier.update(this.rallyA);
        this.rallyBarrier.redraw();
        this.rallyGold.update(this.rallyA);
        this.rallyGold.redraw();
        this.rallyRoadsideObjects.update(this.rallyA);
        if (this.rallyStart.action) {
            this.rallyStart.update(this.rallyA);
            this.rallyStart.redraw();

        }
        if (this.rallyFinish.action) {
            this.rallyFinish.update(this.rallyA);
            this.rallyFinish.redraw();

        }
        if (this.rallyCheckpoint.action) {
            this.rallyCheckpoint.update(this.rallyA);
            this.rallyCheckpoint.redraw();
        }
    }

///////////////////////////////////////////////////////////////
//////////////------  Анимируемые объекты  ------//////////////
///////////////////////////////////////////////////////////////

    var NarrRallyAnimationObject = function () {
        this.name = 'NarrRallyAnimationObject'
        this.action = false;
        this.settings = false;
        this.place = false;
        this.elements = [];
        this.angle = 0;
        this.action = false;
        var i, j, l, scale;
        this.init = function () {
            this.default();
            for (j = 0; j < 4; j++)
                this.elements[j] = this.createElement(j);
        }
        this.update = function (seek) {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].action) {
                    this.elements[i].seek += seek * (0.1 + this.elements[i].seek * 0.9);

                    if (this.elements[i].seek > 2.5) {
                        this.elements[i].action = false;
                        this.elements[i].image.style.opacity = 0.001;
                        this.complete();
                    }
                    else {
                        this.elements[i].size.x = Math.ceil(this.elements[i].start.size.x + (this.elements[i].end.size.x - this.elements[i].start.size.x) * this.elements[i].seek);
                        this.elements[i].size.y = Math.ceil(this.elements[i].start.size.y + (this.elements[i].end.size.y - this.elements[i].start.size.y) * this.elements[i].seek);
                        this.elements[i].position.x = Math.ceil(this.elements[i].start.position.x + (this.elements[i].end.position.x - this.elements[i].start.position.x) * this.elements[i].seek);
                        this.elements[i].position.y = Math.ceil(this.elements[i].start.position.y + (this.elements[i].end.position.y - this.elements[i].start.position.y) * this.elements[i].seek - this.elements[i].size.y);
                        this.elements[i].position.z = Math.ceil(this.elements[i].seek * 100);
                    }
                }
            }
        }
        this.redraw = function () {
            for (l = 0; l < this.elements.length; l++) {
                if (this.elements[l].action && this.elements[l].seek >= 0) {
                    scale = Math.floor((0.1 + this.elements[l].seek * 0.7) * 1000) / 1000
                    this.elements[l].image.style[brprefix + 'transform'] = 'translate(' + this.elements[l].position.x + 'px,' + this.elements[l].position.y + 'px) ' +
                        'scale(' + scale + ')';
                    bradapter.applyZIndex(this.container, this.elements[l].image, this.elements[l].position.z)
                    this.elements[l].image.style.opacity = 1;
                    if (this.elements[l].position.x < -this.elements[l].size.x ||
                        this.elements[l].position.x > this.settings.place.width ||
                        this.elements[l].position.y - this.elements[l].size.y > this.settings.place.height) {
                        this.elements[l].action = false;
                        this.elements[l].image.style.opacity = 0.01;
                        this.complete();
                    }
                }
            }
        }
        this.default = function () {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.style.position = 'absolute';
                this.container.style.width = this.settings.place.width + 'px';
                this.container.style.height = this.settings.place.height + 'px';
            }
            this.place.x += this.settings.position.x;
            this.place.y += this.settings.position.y;
        }
        this.createElement = function (id) {
            var e = {
                image: new Image(),
                size: {x: this.settings.size.x, y: this.settings.size.y},
                position: {x: 0, y: 0, z: 0},
                start: {position: {x: 0, y: 0}, size: {x: 0, y: 0}},
                end: {position: {x: 0, y: 0}, size: {x: 0, y: 0}},
                action: false,
                seek: 0,
                line: false,
                draw: false,
                qx: 0,
                id: id
            };
            e.image.style.position = 'absolute';
            e.image.style.opacity = 0.001;
            e.image.style.width = this.settings.size.x + 'px';
            e.image.style.height = this.settings.size.y + 'px';
            e.image.style[brprefix + 'transform-origin'] = '0 0';
            e.image.src = this.settings.src;
            this.container.appendChild(e.image);
            return e;
        }
        this.pause = function () {
            for (j = 0; j < this.elements.length; j++) {
                this.elements[j].saveAction = this.elements[j].action;
                this.elements[j].action = false;
            }
        }
        this.resume = function () {
            for (j = 0; j < this.elements.length; j++)
                this.elements[j].action = this.elements[j].saveAction;
        }
        this.clear = function () {
            if (this.action) this.action = false;
            for (j = 0; j < this.elements.length; j++)
                this.off(this.elements[j]);
        }
        this.off = function (element) {
            element.draw = false;
            element.action = false;
            element.image.style.opacity = 0.001;
        }
        this.complete = function () {
            this.action = false;
        };
    }
    var NarrRallyLinesObject = function (settings, positions) {
        this.positions = positions;
        this.settings = settings;
        this.angle = 0;
        var i, j, l;

        this.init = function () {
            this.default();
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.settings.position.y);
            var length = 4;
            var count = 0;

            for (i = 0; i < 2; i++) {
                for (j = 0; j < length; j++) {
                    this.elements[count] = this.createElement(count);
                    this.elements[count].position.x = this.settings.position.x + this.positions[count].position.x - Math.sin(this.positions[count].angle / 180 * Math.PI);
                    this.elements[count].position.y = this.positions[count].position.y;
                    this.elements[count].action = true;
                    this.elements[count].image.style.size.x = this.settings.size.x + 'px';
                    this.elements[count].image.style.size.y = this.settings.size.y + 'px';
                    this.elements[count].image.style.opacity = 1;
                    this.elements[count].image.style[brprefix + 'transform-origin'] = '0 0';
                    count++;
                }
            }

            count = 0;
            for (i = 0; i < 2; i++) {
                for (j = 0; j < length; j++) {
                    this.elements[count].start.position.x = this.elements[i ? length : 0].position.x;
                    this.elements[count].start.position.y = this.elements[i ? length : 0].position.y;
                    this.elements[count].end.position.x = this.elements[i ? this.elements.length - 1 : length - 1].position.x;
                    this.elements[count].end.position.y = this.elements[i ? this.elements.length - 1 : length - 1].position.y;
                    this.elements[count].seek = (this.elements[count].position.y - this.elements[count].start.position.y) / (this.elements[count].end.position.y - this.elements[count].start.position.y);
                    count++;
                }
            }
            this.update(0);
            this.redraw();
        }
        this.update = function (seek) {
            for (i = 0; i < this.elements.length; i++) {
                this.elements[i].seek += seek * (0.1 + this.elements[i].seek * 0.9);
                if (this.elements[i].seek > 2.5) {
                    if ((i == this.elements.length * 0.5 - 1 ? this.elements[0] : i == this.elements.length - 1 ? this.elements[this.elements.length * 0.5] : this.elements[i + 1]).seek > 1) {
                        this.elements[i].action = true;
                        this.elements[i].seek = 0.01;
                    }
                }
                else if (this.elements[i].action) {
                    this.elements[i].position.x = Math.ceil(this.elements[i].start.position.x + (this.elements[i].end.position.x - this.elements[i].start.position.x) * this.elements[i].seek);
                    this.elements[i].position.y = Math.ceil(this.elements[i].start.position.y + (this.elements[i].end.position.y - this.elements[i].start.position.y) * this.elements[i].seek);
                    if (this.elements[i].position.y > this.settings.place.height)
                        this.elements[i].action = false;
                }
            }
        }
        this.redraw = function () {
            for (l = 0; l < this.elements.length; l++) {
                if (this.elements[l].action) {
                    this.elements[l].image.style[brprefix + 'transform'] = 'translate(' + this.elements[l].position.x + 'px,' + this.elements[l].position.y + 'px) ' +
                        'skewX(' + this.positions[l].angle * (l < this.elements.length * 0.5 ? 1 : -1) + 'deg) ' +
                        'scale3d(' + (0.1 + this.elements[l].seek * 0.8) + ',' + (this.settings.aq * (0.1 + this.elements[l].seek * 0.8)) + ',1)';
                }
            }
        }
    }
    NarrRallyLinesObject.prototype = new NarrRallyAnimationObject();
    var NarrRallyPitObject = function (settings, angle, place) {
        this.angle = angle;
        this.settings = settings;
        this.place = place;
        this.angle = 0;
        this.status = false;
        this.arr = [0, 1, 2];
        var j, i;

        this.start = function () {
            for (j = 0; j < this.elements.length; j++)
                if (!this.elements[j].action) break;
            if (j == this.elements.length) return;

            this.arr.sort(rallyRandomSortArray);
            this.elements[j].line = this.arr[Math.round(Math.random() * (this.arr.length - 1))];
            switch (this.elements[j].line) {
                case 0:
                    this.elements[j].qx = -0.5;
                    break;
                case 1:
                    this.elements[j].qx = 0;
                    break;
                case 2:
                    this.elements[j].qx = 0.5;
                    break;
            }
            this.elements[j].start.position.x = this.place.x + this.settings.perspective * this.elements[j].qx * 1.4;
            this.elements[j].start.position.y = this.place.y + this.elements[j].start.size.y;
            this.elements[j].end.position.x = this.place.x + this.settings.roadSize * this.elements[j].qx - this.elements[j].end.size.x * 0.5;
            this.elements[j].end.position.y = this.place.y + Math.round(this.settings.qy * this.settings.aq) + this.elements[j].end.size.y;
            this.elements[j].seek = 0;
            this.elements[j].action = true;
            this.elements[j].status = true;
        }
        this.redraw = function () {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].action) {
                    this.elements[i].image.style[brprefix + 'transform'] = 'translate(' + (this.elements[i].position.x - this.settings.size.x * 0.5 * (0.1 + this.elements[i].seek * 0.6)) + 'px,' + this.elements[i].position.y + 'px) ' +
                        'scale3d(' + (0.1 + this.elements[i].seek * 0.6) + ',' + (this.settings.aq * (0.1 + this.elements[i].seek * 0.6)) + ',1)' +
                        'skewX(' + this.angle * (i < this.elements[i].qx < 0 ? -1 : this.elements[i].qx > 0.01 ? 1 : 0) + 'deg)';
                    this.elements[i].image.style.opacity = 1;
                }
            }
        }
    }
    NarrRallyPitObject.prototype = new NarrRallyAnimationObject();
    var NarrRallyBarrierObject = function (settings, place) {
        this.settings = settings;
        this.place = place;
        this.angle = 0;
        this.arr = [0, 1, 2];
        var i, j;
        this.start = function () {
            for (j = 0; j < this.elements.length; j++)
                if (!this.elements[j].action) break;
            if (j == this.elements.length) return;

            this.arr.sort(rallyRandomSortArray)
            this.elements[j].line = this.arr[Math.round(Math.random() * (this.arr.length - 1))];
            switch (this.elements[j].line) {
                case 0:
                    this.elements[j].qx = -0.45;
                    break;
                case 1:
                    this.elements[j].qx = 0;
                    break;
                case 2:
                    this.elements[j].qx = 0.45;
                    break;
            }
            this.elements[j].start.size.x = this.settings.size.x * 0.1;
            this.elements[j].start.size.y = this.settings.size.y * 0.1;
            this.elements[j].end.size.x = this.settings.size.x * 0.8;
            this.elements[j].end.size.y = this.settings.size.y * 0.8;
            this.elements[j].start.position.x = this.place.x + this.settings.perspective * this.elements[j].qx * 1.4 - this.elements[j].start.size.x * 0.5;
            this.elements[j].start.position.y = this.place.y;
            this.elements[j].end.position.x = this.place.x + this.settings.roadSize * this.elements[j].qx - this.elements[j].end.size.x * 0.5;
            this.elements[j].end.position.y = this.place.y + Math.round(this.settings.qy * this.settings.aq);
            this.elements[j].seek = 0;
            this.elements[j].action = true;
        }
    }
    NarrRallyBarrierObject.prototype = new NarrRallyAnimationObject();
    var NarrRallyGoldObject = function (settings, place) {
        this.settings = settings;
        this.place = place;
        this.angle = 0;
        this.arr = [0, 1, 2];
        this.groups = [];
        var i, j, l;
        this.start = function (num) {
            this.arr.sort(rallyRandomSortArray)
            l = this.arr[Math.round(Math.random() * (this.arr.length - 1))]
            for (i = 0; i < num; i++) {
                for (j = 0; j < this.elements.length; j++)
                    if (!this.elements[j].action) break;
                if (j == this.elements.length)
                    this.elements[j] = this.createElement(this.elements.length);

                this.elements[j].line = l;
                switch (this.elements[j].line) {
                    case 0:
                        this.elements[j].qx = -0.45;
                        break;
                    case 1:
                        this.elements[j].qx = 0;
                        break;
                    case 2:
                        this.elements[j].qx = 0.45;
                        break;
                }
                this.elements[j].start.size.x = this.settings.size.x * 0.1;
                this.elements[j].start.size.y = this.settings.size.y * 0.1;
                this.elements[j].end.size.x = this.settings.size.x * 0.8;
                this.elements[j].end.size.y = this.settings.size.y * 0.8;
                this.elements[j].start.position.x = this.place.x + this.settings.perspective * this.elements[j].qx * 1.4 - this.elements[j].start.size.x * 0.5;
                this.elements[j].start.position.y = this.place.y;
                this.elements[j].end.position.x = this.place.x + this.settings.roadSize * this.elements[j].qx - this.elements[j].end.size.x * 0.5;
                this.elements[j].end.position.y = this.place.y + Math.round(this.settings.qy * this.settings.aq);
                this.elements[j].seek = 0.02 * (num - i);
                this.elements[j].action = true;
            }
        }
    }
    NarrRallyGoldObject.prototype = new NarrRallyAnimationObject();

    var NarrRallySimpleObject = function () {
        this.settings = false;
        this.place = false;
        this.action = false;
        this.init = function () {
            this.default();
            this.elements[0] = this.createElement(0);
            this.elements[0].image.style.left = this.elements[0].position.x + 'px';
        }
        this.start = function () {
            this.action = true;
            this.elements[0].qx = 0;
            this.elements[0].start.size.x = this.settings.size.x * 0.1;
            this.elements[0].start.size.y = this.settings.size.y * 0.1;
            this.elements[0].end.size.x = this.settings.size.x * 0.8;
            this.elements[0].end.size.y = this.settings.size.y * 0.8;
            this.elements[0].start.position.x = this.place.x - this.elements[0].start.size.x * 0.5;
            this.elements[0].start.position.y = this.place.y;
            this.elements[0].end.position.x = this.place.x - this.elements[0].end.size.x * 0.5;
            this.elements[0].end.position.y = this.place.y + Math.round(this.settings.qy * this.settings.aq);
            this.elements[0].seek = 0.1;
            this.elements[0].action = true;
        }
    }
    NarrRallySimpleObject.prototype = new NarrRallyAnimationObject();
    var NarrRallyStartObject = function (settings, place) {
        this.settings = settings;
        this.place = place;
    }
    NarrRallyStartObject.prototype = new NarrRallySimpleObject();
    var NarrRallyFinishObject = function (settings, place) {
        this.settings = settings;
        this.place = place;
    }
    NarrRallyFinishObject.prototype = new NarrRallySimpleObject();
    var NarrRallyCheckpointObject = function (settings, place) {
        this.settings = settings;
        this.place = place;
        this.name = 'NarrRallyCheckpointObject';
    }
    NarrRallyCheckpointObject.prototype = new NarrRallySimpleObject();

    var NarrRallyRoadsideObjects = function (settings, place) {
        this.settings = settings;
        this.place = place;
        this.objects = [];
        var j, rselement, ccc;

        this.init = function () {

            this.objects[0] = new NarrRallyRoadsideObject_0(this.settings[0], this.place);
            this.objects[1] = new NarrRallyRoadsideObject_1(this.settings[1], this.place);
            for (j = 0; j < this.objects.length; j++) {
                if (j) {
                    this.objects[j].container = this.container;
                }
                this.objects[j].init();
                if (!j)this.container = this.objects[j].container;
            }
        }
        this.start = function () {
            j = Math.round(Math.random());
            rselement = this.objects[j].start();
            if (!rselement)
                rselement = this.objects[Math.abs(j - 1)].start();
            if (!rselement) return;
        }
        this.update = function (seek) {
            for (j = 0; j < this.objects.length; j++) {
                this.objects[j].update(seek);
                this.objects[j].redraw();
            }
        }
        this.clear = function () {
            for (var j = 0; j < this.objects.length; j++)
                this.objects[j].clear();
        }
    }
    var NarrRallyRoadsideObject_0 = function (settings, place) {
        this.settings = settings;
        this.place = place;
        var j = 0;
        this.start = function () {
            for (j = 0; j < this.elements.length; j++)
                if (!this.elements[j].action) break;
            if (j == this.elements.length) return false;

            switch (Math.round(Math.random())) {
                case 0:
                    this.elements[j].qx = 1.2;
                    break;
                case 1:
                    this.elements[j].qx = -1.2;
                    break;
            }
            this.elements[j].start.size.x = this.settings.size.x * 0.1;
            this.elements[j].start.size.y = this.settings.size.y * 0.1;
            this.elements[j].end.size.x = this.settings.size.x;
            this.elements[j].end.size.y = this.settings.size.y;
            this.elements[j].start.position.x = this.place.x + Math.ceil(this.settings.perspective * this.elements[j].qx * 1.5 - this.elements[j].start.size.x * 0.5);
            this.elements[j].start.position.y = this.place.y;
            this.elements[j].end.position.x = this.place.x + Math.ceil(this.settings.roadSize * this.elements[j].qx - this.elements[j].end.size.x * 0.5);
            this.elements[j].end.position.y = this.place.y + Math.ceil(this.settings.qy * this.settings.aq);
            this.elements[j].seek = 0.01;
            this.elements[j].action = true;
            return true;
        }
    }
    NarrRallyRoadsideObject_0.prototype = new NarrRallyAnimationObject();
    var NarrRallyRoadsideObject_1 = function (settings, place) {
        this.settings = settings;
        this.place = place;
        var j = 0;
        this.start = function () {
            for (j = 0; j < this.elements.length; j++)
                if (!this.elements[j].action) break;
            if (j == this.elements.length) return false;

            switch (Math.round(Math.random())) {
                case 0:
                    this.elements[j].qx = -1;
                    break;
                case 1:
                    this.elements[j].qx = 1;
                    break;
            }
            this.elements[j].start.size.x = this.settings.size.x * 0.1;
            this.elements[j].start.size.y = this.settings.size.y * 0.1;
            this.elements[j].end.size.x = this.settings.size.x;
            this.elements[j].end.size.y = this.settings.size.y;
            this.elements[j].start.position.x = this.place.x + this.settings.perspective * this.elements[j].qx * 1.5 - this.elements[j].start.size.x * 0.5;
            this.elements[j].start.position.y = this.place.y;
            this.elements[j].end.position.x = this.place.x + this.settings.roadSize * this.elements[j].qx - this.elements[j].end.size.x * 0.5;
            this.elements[j].end.position.y = this.place.y + Math.round(this.settings.qy * this.settings.aq);
            this.elements[j].seek = 0.01;
            this.elements[j].action = true;
            return true;
        }
    }
    NarrRallyRoadsideObject_1.prototype = new NarrRallyAnimationObject();

///////////////////////////////////////////////////////////////
//////////////------        Машина         ------//////////////
///////////////////////////////////////////////////////////////

    var NarrRallyCar = function (settings) {
        this.settings = settings;
        this.status = 1;
        var i;
        this.init = function () {
            this.container = document.createElement('div');
            this.container.style.position = 'absolute';
            this.container.style.width = this.settings[0].place.width + 'px';
            this.container.style.height = this.settings[0].place.height + 'px';
            for (i = 0; i < this.settings.length; i++) {
                this.settings[i].image = new Image();
                this.settings[i].image.src = this.settings[i].src;
                if (i != 1)this.settings[i].image.style.opacity = 0.001;
                this.settings[i].image.style.position = 'absolute';
                this.settings[i].image.style[brprefix + 'transform'] = bradapter.buildTranslateString(
                        this.settings[i].position.x + (!i ? 0 : i < 2 ? ((this.settings[i].place.width - this.settings[i].size.x) * 0.5) : (this.settings[i].place.width - this.settings[i].size.x)),
                        this.settings[i].position.y + (!i ? (this.settings[i].place.height - this.settings[i].size.y) : i < 2 ? (this.settings[i].place.height - this.settings[i].size.y) : (this.settings[i].place.height - this.settings[i].size.y))
                );
                this.settings[i].image.style.width = this.settings[i].size.x + 'px';
                this.settings[i].image.style.height = this.settings[i].size.y + 'px';
                this.container.appendChild(this.settings[i].image);
            }
        }
        this.setStatus = function (status) {
            this.settings[this.status].image.style.opacity = 0.001;
            this.status = status;
            this.settings[this.status].image.style.opacity = 1;
        }
    }

///////////////////////////////////////////////////////////////
//////////////------        Утиллиты       ------//////////////
///////////////////////////////////////////////////////////////
    var rallyRandomSortArray = function () {
        return Math.random() < 0.5 ? 1 : -1;
    }

///////////////////////////////////////////////////////////////
//////////////------      Мышиные дела     ------//////////////
///////////////////////////////////////////////////////////////
    NarrRally.prototype.rallyEventHandlerPan = function (event) {
        switch (event.status) {
            case 'end':
                this.rallyMove = false;
                break;
            case 'move':
                if (this.rallyMove) return;
                if (event.vectorX < -5) {
                    this.rallyMove = true;
                    this.rallyLeft();
                }
                else if (event.vectorX > 5) {
                    this.rallyMove = true;
                    this.rallyRight();
                }
        }
    }
    Utils.addBehaviour('pan', 'NarrRally', 'NarrRallyPan',
        {
            start: function (g) {
                return true;
            },
            end: function (g, obj) {
                this.rallyEventHandlerPan(g);
            },
            swipe: function (g) {
                g.stopPropagation();
            },
            move: function (g, obj) {
                this.rallyEventHandlerPan(g);
            }
        }, false);

    return NarrRally;
});
