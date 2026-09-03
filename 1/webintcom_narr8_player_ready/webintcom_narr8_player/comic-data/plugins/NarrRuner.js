define(["utils/Utils"], function (Utils) {

    var NarrRuner = Utils.newObjectType(NarrRuner, "NarrRuner");

    NarrRuner.prototype.init = function (description) {
        this.settings = description.settings;
        this.animationTimeCounter = 0;
        this.clockTimeCounter = 0;
        this.runerTimeCounter = 0;
        this.place = {x: this.width, y: this.height};
        this.heroSeek = 0;
        this.livesCounter = 0;
        this.goldCounter = 0;
        this.checkPointCounter = 0;
        this.runerGoldSteck = [];
        this.pauseFlag = false;
    }
    NarrRuner.prototype.draw = function () {
        if (this.RUNER_RESTART_GAME) {
            this.RUNER_RESTART_GAME = 0;
            this.restartRunerGame();
        }
        if (this.RUNER_PAUSE_GAME) {
            this.RUNER_PAUSE_GAME = 0;
            this.pauseRunerGame();
        }
        if (this.RUNER_RESUME_GAME) {
            this.RUNER_RESUME_GAME = 0;
            this.resumeRunerGame();
        }
    }
    NarrRuner.prototype.load = function () {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.style.position = 'absolute';
            this.container.style.width = this.width + 'px';
            this.container.style.height = this.height + 'px';

            for (var i in this.settings.images)
                this.settings.images[i].speed = this.settings.speed;

            if (this.settings.images.bg && this.settings.images.bg.image != '') {
                this.container.style['background-image'] = 'url(' + this.settings.images.bg.image + ')';
                this.container.style['background-size'] = this.settings.images.bg.size.x + 'px ' + this.settings.images.bg.size.y + 'px';
                this.container.style['background-repeat'] = 'repeat';
            }
            if (this.settings.images.sun && this.settings.images.sun.image != '') {
                var sun = new Image();
                sun.src = this.settings.images.sun.image;
                sun.style.position = 'absolute';
                sun.style[brprefix + "transform"] = bradapter.buildTranslateString(this.width - this.width / 6 - this.settings.images.sun.size.x, this.height / 6);
                sun.style.width = this.settings.images.sun.size.x + 'px';
                sun.style.height = this.settings.images.sun.size.y + 'px';
                this.container.appendChild(sun);
            }
            if (this.settings.images.cloud && this.settings.images.cloud.image != '') {
                this.runerCloud = new NarrRunerCloudObject(this.settings.images.cloud, this.place);
                this.runerCloud.init(3);
                this.container.appendChild(this.runerCloud.container);
            }
            this.runerLand = new NarrRunerLandObject(this.settings.images.land, this.place);
            this.runerLand.init(Math.round((this.width + this.settings.images.land.size.x * 2) / this.settings.images.land.size.x));
            this.container.appendChild(this.runerLand.container);

            if (this.settings.images.start && this.settings.images.start.image != '') {
                this.runerStart = new NarrRunerStartObject(this.settings.images.start, this.place, this.runerLand.y - this.settings.images.start.size.y);
                this.runerStart.init(1);
                this.container.appendChild(this.runerStart.container);
            }

            if (this.settings.images.finish && this.settings.images.finish.image != '') {
                this.runerFinish = new NarrRunerFinishObject(this.settings.images.finish, this.place, this.runerLand.y - this.settings.images.finish.size.y);
                this.runerFinish.init(1);
                this.container.appendChild(this.runerFinish.container);
            }

            this.runerPit = new NarrRunerPitObject(this.settings.images.pit, this.place, this.runerLand.y);
            this.runerPit.init(3);
            this.container.appendChild(this.runerPit.container);

            this.runerWall = new NarrRunerWallObject(this.settings.images.wall, this.place, this.runerLand.y - this.settings.images.wall.size.y);
            this.runerWall.init(3);
            this.container.appendChild(this.runerWall.container);

            this.runerGold = new NarrRunerGoldObject(this.settings.images.gold, this.place, [this.runerLand.y, this.runerLand.y - this.settings.images.wall.size.y, this.runerLand.y - this.settings.images.wall.size.y * 2]);
            this.runerGold.init(20);
            this.container.appendChild(this.runerGold.container);

            if (this.settings.images.checkPoint && this.settings.images.checkPoint.image != '') {
                this.runerCheckPoint = new NarrRunerCheckPointObject(this.settings.images.checkPoint, this.place, this.runerLand.y);
                this.runerCheckPoint.init(1);
                this.container.appendChild(this.runerCheckPoint.container);
            }

            if (this.settings.images.enemy_0 && this.settings.images.enemy_1 && this.settings.images.enemy_0.image != '' && this.settings.images.enemy_1.image != '') {
                this.runerEnemy = new NarrRunerEnemyObject(
                    [this.settings.images.enemy_0, this.settings.images.enemy_1],
                    {x: this.x, y: this.y, width: this.width, height: this.height},
                    this.runerLand.y,
                    this.runerWall.settings.size.y
                );
                this.runerEnemy.init();
                this.container.appendChild(this.runerEnemy.container);
            }

            this.runerHero = new NarrRunerHeroObject(
                [this.settings.images.hStands, this.settings.images.hRun_0, this.settings.images.hRun_1, this.settings.images.hUp],
                {x: this.x, y: this.y, width: this.width, height: this.height},
                this.runerLand.y,
                this.runerWall.settings.size.y
            );
            this.runerHero.init();
            this.container.appendChild(this.runerHero.container);

            if (this.runerWall.settings.size.y >= this.runerHero.size.y)
                this.heroWallHittestY = this.runerHero.size.y / 2;
            else
                this.heroWallHittestY = this.runerWall.settings.size.y / 2;
        }
        this.pauseFlag = true;
        this.view.appendChild(this.container);
        this.runerStart.start((this.width - this.settings.images.start.size.x) * 0.5, this.runerLand.y - this.settings.images.start.size.y);

    }
    NarrRuner.prototype.unload = function () {
        this.delegate.removeEventListener('timer', this.timerRuner, this);
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        this.delegate.removeEventListener('timer', this.runerGoldSteckTimer, this);
        this.clearRunerGame();
        this.view.removeChild(this.container);
        this.removeArea(this.runerArea);
    }

///////////////////////////////////////////////////////////////
//////////////--------  Управление игрой --------//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.restartRunerGame = function () {
        if (this.status == 'play') {
            this.delegate.removeEventListener('timer', this.timerRuner, this);
            this.clearRunerGame();
        }
        if (!this.pauseFlag)return;
        this.pauseFlag = false;
        this.livesCounter = this.settings.livesCounter;
        this.runerTimeCounter = 0;
        this.clockTimeCounter = 0;
        this.goldCounter = 0;
        this.checkPointCounter = 0;
//    this.runerStart.start();
//    this.runerStart.update(0);
//    this.runerStart.redraw();
        this.startRunerGame();
    }
    NarrRuner.prototype.startRunerGame = function () {
        this.status = 'play';
        this.generatorTimer = 0;
        if (this.RUNER_START)
            this.delegate.fireEvent("performAnimation", [this.RUNER_START]);
        if (this.runerTimeCounter < this.settings.gameTime - Math.round(20 / this.settings.speed) &&
            (this.settings.checkPoints[this.checkPointCounter] ?
                this.runerTimeCounter < this.settings.checkPoints[this.checkPointCounter] - Math.round(20 / this.settings.speed) : true)) {
            this.runerObjectGeneratorFlag = true;
        }
        if (this.runerCloud)
            this.runerCloud.start();
        this.runerHero.resume();
        this.runerHeroShow();
    }
    NarrRuner.prototype.pauseRunerGame = function () {
        if (this.status == 'play') {
            this.status = 'pause';
            this.delegate.removeEventListener('timer', this.timerRuner, this);
            this.runerHero.pause();
            this.runerGold.pause();
            if (this.runerHero.status != 'up' && this.runerHero.status != 'return')
                this.runerGold.pause();
        }
    }
    NarrRuner.prototype.resumeRunerGame = function () {
        if (this.status == 'pause') {
            this.status = 'play';
            this.runerHero.resume();
            if (this.runerTimeCounter < this.settings.gameTime - Math.round(20 / this.settings.speed) &&
                (this.settings.checkPoints[this.checkPointCounter] ?
                    this.runerTimeCounter < this.settings.checkPoints[this.checkPointCounter] - Math.round(20 / this.settings.speed) : true)) {
                this.runerObjectGeneratorFlag = true;
            }
            this.delegate.addEventListener('timer', this.timerRuner, this);
        }
    }
    NarrRuner.prototype.clearRunerGame = function () {
        if (this.runerHeroAnimation || this.runerHeroAnimation == 0)
            this.cancelAnimation(this.runerHeroAnimation)
        this.runerHero.clear();
        this.runerWall.clear();
        this.runerPit.clear();
        this.runerGold.clear();
        if (this.runerStart)
            this.runerStart.clear();
        if (this.runerFinish)
            this.runerFinish.clear();
        if (this.runerCheckPoint)
            this.runerCheckPoint.clear();
        if (this.runerEnemy)
            this.runerEnemy.clear();
        if (this.runerCloud)
            this.runerCloud.clear();
    }

///////////////////////////////////////////////////////////////
//////////////-------  Общая логика игры  -------//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.runerLiveComplete = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (this.livesCounter > 0) {
            this.livesCounter--;
            if (this.RUNER_LIFE)
                this.delegate.fireEvent("performAnimation", [this.RUNER_LIFE]);
            this.clearRunerGame();
            this.startRunerGame();
        }
        else
            this.runerGameOver();
    }
    NarrRuner.prototype.runerGameOver = function () {
        if (this.RUNER_GAME_OVER)
            this.delegate.fireEvent("performAnimation", [this.RUNER_GAME_OVER]);
        this.status = 'game over';
    }
    NarrRuner.prototype.runerElementsGenerator = function (type) {
        switch (type) {
            case 'enemy':
                if (this.runerEnemy && !this.runerEnemy.action && Math.random() < 0.01 * this.settings.levels)
                    this.runerEnemy.start();
                break;
            case 'wall':
                if (Math.random() < 0.02 * this.settings.levels) {
                    for (var i = 0; i < this.runerPit.elements.length; i++)
                        if (this.runerPit.elements[i].action && this.runerPit.elements[i].position.x > this.width - this.runerPit.settings.size.x)
                            return;
                    this.runerWall.start();
                }
                break;
            case 'pit':
                if (Math.random() < 0.02 * this.settings.levels) {
                    for (var i = 0; i < this.runerWall.elements.length; i++)
                        if (this.runerWall.elements[i].action && this.runerWall.elements[i].position.x > this.width - this.runerWall.settings.size.x)
                            return;
                    this.runerPit.start();
                }
                break;
            case 'gold':
                if (Math.random() < 0.5) {
                    var level = Math.floor(Math.random() * 3);
                    if (!this.runerGold.levelsFlags[level]) {
                        if (!level) {
                            for (var j = 0; j < this.runerWall.elements.length; j++)
                                if (this.runerWall.elements[j].action && this.runerWall.elements[j].position.x > this.width - this.runerWall.settings.size.x)
                                    return;
                            for (j = 0; j < this.runerPit.elements.length; j++)
                                if (this.runerPit.elements[j].action && this.runerPit.elements[j].position.x > this.width - this.runerPit.settings.size.x)
                                    return;
                        }

                        for (var i = 0; i < (this.settings.goldCounter - this.goldCounter >= 5 ? 2 + Math.floor(Math.random() * 5) : Math.ceil(Math.random() * (this.settings.goldCounter % 5))); i++)
                            this.runerGold.start(level, i);
                    }
                }
                break;
        }
    }
    NarrRuner.prototype.timerRuner = function (event) {
        this.redrawAnimationRuner();
        if (this.runerEnemy)
            this.hitTestEnemy();

        this.animationTimeCounter++;
        this.clockTimeCounter++;
        if (this.clockTimeCounter > 61) {
            this.clockTimeCounter = 0;
            this.changeTimeRuner();
        }
        if (this.runerObjectGeneratorFlag) {
            this.generatorTimer++;
            if (this.generatorTimer > 50) {
                this.generatorTimer = 0;
                this.runerElementsGenerator('wall');
                this.runerElementsGenerator('pit');
                this.runerElementsGenerator('gold');
                this.runerElementsGenerator('enemy');
            }
        }
    }
    NarrRuner.prototype.changeTimeRuner = function () {
        this.runerTimeCounter++;
        if (this.SECOND)
            this.delegate.fireEvent("performAnimation", [this.SECOND]);

        if (this.runerTimeCounter == this.settings.gameTime - Math.round(20 / this.settings.speed)) {
            this.runerObjectGeneratorFlag = false;
        }
        else if (this.runerTimeCounter == this.settings.gameTime - Math.round(7 / this.settings.speed)) {
            if (this.runerFinish)
                this.runerFinish.start(this.width, this.runerLand.y - this.settings.images.finish.size.y);
        }
        else if (this.runerTimeCounter == this.settings.gameTime) {
            this.pauseRunerGame();
            this.runerHero.resume();
            this.runerHeroHide();
        }
        else if (this.settings.checkPoints[this.checkPointCounter]) {
            if (this.runerTimeCounter == this.settings.checkPoints[this.checkPointCounter]) {
                this.pauseRunerGame();
                if (this['RUNER_CHECK_POINT_' + this.checkPointCounter])
                    this.delegate.fireEvent("performAnimation", [this['RUNER_CHECK_POINT_' + this.checkPointCounter]]);
                this.checkPointCounter++;
            }
            else if (this.runerTimeCounter == this.settings.checkPoints[this.checkPointCounter] - Math.round(20 / this.settings.speed)) {
                this.runerObjectGeneratorFlag = false;
            }
            else if (this.runerTimeCounter == this.settings.checkPoints[this.checkPointCounter] - Math.round(7 / this.settings.speed)) {
                this.runerCheckPoint.start(this.width, this.runerLand.y - this.settings.images.checkPoint.size.y);
            }
        }
    }
    NarrRuner.prototype.hitTestRuner = function () {
        if (this.runerHero.status == 'run' || this.runerHero.status == 'walls' || this.runerHero.status == 'up') {
            if (this.runerEnemy && this.runerEnemy.action) {
                if (this.hittestForRect({
                    left: this.runerEnemy.position.x,
                    top: this.runerEnemy.position.y,
                    width: this.runerEnemy.images[0].size.x,
                    height: this.runerEnemy.images[0].size.y
                }, {
                    x: this.runerHero.position.x + this.runerHero.images[1].size.x * 0.5 + this.x,
                    y: this.runerHero.position.y + this.runerHero.images[1].size.y * 0.8 + 1 + this.y
                })) {
                    this.runerHeroDied();
                    return true;
                }
            }
        }
        else if (this.runerHero.status == 'return') {
            if (this.runerEnemy && this.runerEnemy.action) {
                if (this.hittestForRect({
                    left: this.runerEnemy.position.x,
                    top: this.runerEnemy.position.y,
                    width: this.runerEnemy.images[0].size.x,
                    height: this.runerEnemy.images[0].size.y
                }, {
                    x: this.runerHero.position.x + this.runerHero.images[1].size.x * 0.5 + this.x,
                    y: this.runerHero.position.y + this.runerHero.images[1].size.y * 0.8 + 1 + this.y
                })) {
                    this.runerHeroUp();
                    this.runerEnemyDied();
                    return true;
                }
            }
        }
        if (this.runerHero.status != 'died' && this.runerHero.status != 'down') {
            for (var h = 0; h < this.runerGold.elements.length; h++) {
                if (this.runerGold.elements[h].action && this.runerGold.elements[h].status == 'live') {
                    if (this.hittestForRect({
                        left: this.runerHero.position.x,
                        top: this.runerHero.position.y,
                        width: this.runerHero.size.x,
                        height: this.runerHero.size.y
                    }, {
                        x: this.runerGold.elements[h].position.x + this.runerGold.elements[h].size.x / 2 + this.x,
                        y: this.runerGold.elements[h].position.y + this.runerGold.elements[h].size.y / 2 + this.y
                    })) {
                        this.runerMoneCaught(this.runerGold.elements[h]);
                    }
                }
            }
        }
        if (this.runerHero.status == 'run' || this.runerHero.status == 'up') {
            for (var i = 0; i < this.runerWall.elements.length; i++) {
                if (this.runerWall.elements[i].action) {
                    if (this.hittestForRect({
                        left: this.runerWall.elements[i].position.x,
                        top: this.runerWall.elements[i].position.y + this.runerWall.elements[i].size.y * 0.2,
                        width: this.runerWall.elements[i].size.x,
                        height: this.runerWall.elements[i].size.y
                    }, {
                        x: this.runerHero.position.x + this.runerHero.size.x * 0.8 + this.x,
                        y: this.runerHero.position.y + this.runerHero.size.y - this.heroWallHittestY + this.y
                    })) {
                        this.runerHeroDied();
                        this.runerHero.update(0);
                        return true;
                    }
                }
            }
            if (this.runerHero.status == 'up')return;
            for (i = 0; i < this.runerPit.elements.length; i++) {
                if (this.runerPit.elements[i].action) {
                    if (!this.hittestForRect({
                        left: this.runerPit.elements[i].position.x + this.runerHero.images[2].size.x * 0.4,
                        top: this.runerPit.elements[i].position.y,
                        width: this.runerPit.elements[i].size.x - this.runerHero.images[2].size.x * 0.8,
                        height: 2
                    }, {
                        x: this.runerHero.position.x + this.runerHero.images[1].size.x * 0.5 + this.x,
                        y: this.runerPit.elements[i].position.y + 1 + this.y
                    })) {
                        return false;
                    }
                    this.runerHeroDown();
                    return true;
                }
            }
        }
        else if (this.runerHero.status == 'return') {
            for (var i = 0; i < this.runerWall.elements.length; i++) {
                if (this.runerWall.elements[i].action) {
                    if (this.hittestForRect({
                        left: this.runerWall.elements[i].position.x,
                        top: this.runerWall.elements[i].position.y,
                        width: this.runerWall.elements[i].size.x,
                        height: this.runerWall.elements[i].size.y
                    }, {
                        x: this.runerHero.position.x + this.runerHero.size.x * 0.5 + this.x,
                        y: this.runerHero.position.y + this.runerHero.size.y + 1 + this.x
                    })) {
                        if (this.runerHero.position.y < this.runerWall.elements[i].position.y - this.runerHero.images[0].size.y * 0.8)
                            this.runerHeroRunWalls();
                        else
                            this.runerHeroDied();
                        this.runerHero.update(0);
                        return true;
                    }
                }
            }
        }
        else if (this.runerHero.status == 'walls') {
            for (var l = 0; l < this.runerWall.elements.length; l++) {
                if (this.runerWall.elements[l].action) {
                    if (this.hittestForRect({
                        left: this.runerWall.elements[l].position.x,
                        top: this.runerWall.elements[l].position.y,
                        width: this.runerWall.elements[l].size.x,
                        height: this.runerWall.elements[l].size.y
                    }, {
                        x: this.runerHero.position.x + this.runerHero.size.x * 0.5 + this.x,
                        y: this.runerWall.elements[l].position.y + 1 + this.y
                    })) {
                        return false;
                    }
                }
            }
            this.runerHeroReturn();
            this.runerHero.update(0);
            return true;
        }
        return false;
    }
    NarrRuner.prototype.hitTestEnemy = function () {
        var i = 0;
        if (this.runerEnemy.status == 'run' || this.runerEnemy.status == 'return') {
            for (i = 0; i < this.runerWall.elements.length; i++) {
                if (this.runerWall.elements[i].action) {
                    if (this.hittestForRect({
                        left: this.runerWall.elements[i].position.x - this.runerEnemy.images[0].size.x * 0.5,
                        top: this.runerWall.elements[i].position.y,
                        width: this.runerWall.elements[i].size.x + this.runerEnemy.images[0].size.x,
                        height: this.runerWall.elements[i].size.y
                    }, {
                        x: this.runerEnemy.position.x + this.runerEnemy.images[0].size.x * 0.5 + this.x,
                        y: this.runerWall.elements[i].position.y + 1 + this.y
                    })) {
                        this.runerEnemyUp();
                        this.runerEnemy.update(0);
                        return;
                    }
                }
                else if (this.runerPit.elements[i] && this.runerPit.elements[i].action) {
                    if (this.hittestForRect({
                        left: this.runerPit.elements[i].position.x,
                        top: this.runerPit.elements[i].position.y,
                        width: this.runerPit.elements[i].size.x,
                        height: 2
                    }, {
                        x: this.runerEnemy.position.x + this.x,
                        y: this.runerPit.elements[i].position.y + 1 + this.y
                    })) {
                        this.runerEnemyUpReturn();
                        this.runerEnemy.update(0);
                        return;
                    }
                }
            }
        }
        else if (this.runerEnemy.status == 'walls') {
            for (i = 0; i < this.runerWall.elements.length; i++) {
                if (this.runerWall.elements[i].action) {
                    for (var j = 0; j < this.runerWall.elements.length; j++) {
                        if (this.hittestForRect({
                            left: this.runerWall.elements[i].position.x,
                            top: this.runerWall.elements[i].position.y,
                            width: this.runerWall.elements[i].size.x + this.runerEnemy.images[0].size.x * 0.5,
                            height: 2
                        }, {
                            x: this.runerEnemy.position.x + (j ? this.runerEnemy.images[0].size.x : 0) + this.x,
                            y: this.runerWall.elements[i].position.y + 1 + this.y
                        })) {
                            return;
                        }
                    }
                }
            }
            this.runerEnemyReturn();
            this.runerEnemy.update(0);
        }
    }

///////////////////////////////////////////////////////////////
//////////////-------  Отрисовка анимации  ------//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.redrawAnimationRuner = function () {
        this.runerLand.redraw();
        this.runerPit.redraw();
        this.runerWall.redraw();
        if (this.runerHero.status == 'run' || this.runerHero.status == 'walls') {
            this.runerHero.update();
            this.hitTestRuner();
            this.runerHero.redraw();
        }
        if (this.runerEnemy && this.runerEnemy.action) {
            this.runerEnemy.seek = this.enemySeek;
            this.runerEnemy.update(this.enemySeek);
            this.runerEnemy.redraw();
        }
        if (this.runerCloud)
            this.runerCloud.redraw();
        if (this.runerStart && this.runerStart.action)
            this.runerStart.redraw();
        if (this.runerFinish && this.runerFinish.action)
            this.runerFinish.redraw();
        if (this.runerCheckPoint && this.runerCheckPoint.action)
            this.runerCheckPoint.redraw();
        this.runerGold.redraw();
    }
    NarrRuner.prototype.runerHeroRedraw = function () {
        if (this.runerHero.status == 'died' || this.runerHero.status == 'down' || this.runerHero.status == 'up' || this.runerHero.status == 'return' || this.runerHero.status == 'show' || this.runerHero.status == 'hide') {
            this.runerHero.seek = this.heroSeek;
            this.runerHero.update(this.heroSeek);
            if (this.runerHero.status != 'down' &&
                this.runerHero.status != 'start' &&
                this.runerHero.status != 'finish' &&
                this.runerHero.status != 'died')
                this.hitTestRuner();
            this.runerHero.redraw();
        }
        else
            this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroHideRedraw = function () {
        this.runerHero.hideSeek = this.heroHideSeek;
        this.runerHero.hideUpdate(this.heroHideSeek);
        this.runerHero.redraw();
    }

///////////////////////////////////////////////////////////////
//////////////-----  Создаем статусы  монет  ----//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.runerMoneCaught = function (element) {
        this.runerGold.caught(element);
        if (this.GOLD) {
            this.runerGoldSteckFlag = this.runerGoldSteck.length == 0;
            this.runerGoldSteck.push(1);
            if (this.runerGoldSteckFlag) {
                this.delegate.removeEventListener('timer', this.runerGoldSteckTimer, this);
                this.runerGoldSteckTimerCounter = 0;
                this.delegate.addEventListener('timer', this.runerGoldSteckTimer, this);
            }

        }
    }
    NarrRuner.prototype.runerGoldSteckTimer = function (event) {
        if (++this.runerGoldSteckTimerCounter == 20) {
            this.runerGoldSteckTimerCounter = 0;
            if (this.runerGoldSteck.length > 0) {
                this.runerGoldSteck.length -= 1;
                this.delegate.fireEvent("performAnimation", [this.GOLD]);
            }
            else if (this.runerGoldSteck.length == 0) {
                this.runerGoldSteckFlag = false;
                this.delegate.removeEventListener('timer', this.runerGoldSteckTimer, this);
            }
        }
    }

///////////////////////////////////////////////////////////////
//////////////-----  Создаем статусы героя  -----//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.runerHeroRunWalls = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.runerHero.runWalls();
    }
    NarrRuner.prototype.runerHeroDown = function () {
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.runerHero.down();
        this.heroSeek = 0;
        this.runerHeroAnimation = this.animateTo('heroSeek', 1, 2000 / this.settings.speed, 'easeInQuad', this.runerHeroDied);
        this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroUp = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (this.runerHero.status == 'up' || this.runerHero.status == 'died' || this.runerHero.status == 'down') return;
        this.heroSeek = 0;
        this.runerHero.up(1);
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.runerHeroAnimation = this.animateTo('heroSeek', 1, 2000 / this.settings.speed, 'easeOutQuad', this.runerHeroReturn);
        this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroUp2 = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        this.heroSeek = 0;
        this.runerHero.up(2);
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.runerHeroAnimation = this.animateTo('heroSeek', 1, 4000 / this.settings.speed, 'easeOutQuad', this.runerHeroReturn);
        this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroDied = function () {
        this.pauseRunerGame();
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.runerHero.died();
        this.heroSeek = 0;
        this.runerHeroAnimation = this.animateTo('heroSeek', 1, 10000 / this.settings.speed, 'easeInBack', this.runerLiveComplete);
        this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroReturn = function () {
        if (this.runerHero.status == 'up' || this.runerHero.status == 'walls') {
            this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
            if (!isNaN(this.runerHeroAnimation))
                this.cancelAnimation(this.runerHeroAnimation);
            this.heroSeek = 0;
            this.runerHero.return();
            this.runerHeroAnimation = this.animateTo('heroSeek', 1, 4000 / this.settings.speed, 'easeInQuad', this.runerHeroReturnComplete);
            this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
        }
    }
    NarrRuner.prototype.runerHeroShow = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (!isNaN(this.runerHeroAnimation))
            this.cancelAnimation(this.runerHeroAnimation);
        this.heroSeek = 0;
        this.runerHero.show();
        this.runerHeroAnimation = this.animateTo('heroSeek', 1, 5000 / this.settings.speed, null, this.runerShowComplete);
        this.delegate.addEventListener('timer', this.runerHeroRedraw, this);
    }
    NarrRuner.prototype.runerHeroHide = function () {
        this.heroHideSeek = 0;
        this.runerHero.hide();
        this.animateTo('heroHideSeek', 1, 15000 / this.settings.speed, null, this.runerHideComplete);
        this.delegate.addEventListener('timer', this.runerHeroHideRedraw, this);
    }
    NarrRuner.prototype.runerHideComplete = function () {
        this.delegate.removeEventListener('timer', this.runerHeroHideRedraw, this);
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        this.status = 'win';
        if (this.RUNER_CONGRATULATIONS)
            this.delegate.fireEvent("performAnimation", [this.RUNER_CONGRATULATIONS]);
    }
    NarrRuner.prototype.runerShowComplete = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        this.delegate.addEventListener('timer', this.timerRuner, this);
        this.runerLand.start();
        this.runerHero.start();
    }
    NarrRuner.prototype.runerHeroReturnComplete = function () {
        this.delegate.removeEventListener('timer', this.runerHeroRedraw, this);
        if (this.status == 'pause' && !this.runerHero.finish)
            this.runerHero.pause();
        else {
            this.runerHero.start();
            this.hitTestRuner();
        }
    }

///////////////////////////////////////////////////////////////
//////////////-----  Создаем статусы злодея  -----////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.runerEnemyRunLand = function () {
        this.runerEnemy.runLand();
    }
    NarrRuner.prototype.runerEnemyDied = function () {
        if (!isNaN(this.runerEnemyAnimation))
            this.cancelAnimation(this.runerEnemyAnimation);
        this.runerEnemy.died();
        this.enemySeek = 0;
        this.runerEnemyAnimation = this.animateTo('enemySeek', 1, 10000 / this.settings.speed, 'easeInBack', this.runerDiedComplete);
    }
    NarrRuner.prototype.runerDiedComplete = function () {
        this.runerEnemy.clear();
    }
    NarrRuner.prototype.runerEnemyReturn = function () {
        if (!isNaN(this.runerEnemyAnimation))
            this.cancelAnimation(this.runerEnemyAnimation);
        this.enemySeek = 0;
        this.runerEnemy.return();
        this.runerEnemyAnimation = this.animateTo('enemySeek', 1, 2000 / this.settings.speed, 'easeInQuad', this.runerEnemyRunLand);
    }
    NarrRuner.prototype.runerEnemyUp = function () {
        if (!isNaN(this.runerEnemyAnimation))
            this.cancelAnimation(this.runerEnemyAnimation);
        this.enemySeek = 0;
        this.runerEnemy.up(1);
        this.runerEnemyAnimation = this.animateTo('enemySeek', 1, 1000 / this.settings.speed, 'easeOutQuad', this.runerEnemyWalls);
    }
    NarrRuner.prototype.runerEnemyUpReturn = function () {
        if (!isNaN(this.runerEnemyAnimation))
            this.cancelAnimation(this.runerEnemyAnimation);
        this.enemySeek = 0;
        this.runerEnemy.upReturn();
        this.runerEnemyAnimation = this.animateTo('enemySeek', 1, 1000 / this.settings.speed, 'easeOutQuad', this.runerEnemyReturn);
    }
    NarrRuner.prototype.runerEnemyWalls = function () {
        this.runerEnemy.runWalls();
    }

///////////////////////////////////////////////////////////////
//////////////------  Анимируемые объекты  ------//////////////
///////////////////////////////////////////////////////////////
    var NarrRunerAnimationObject = function () {
        this.action = false;
        var i, j, l, e;
        this.init = function (num) {
            this.default();

            for (var i = 0; i < num; i++) {
                this.elements[i] = this.createElement();

                this.elements[i].position.x = this.startPosition.x;
                this.elements[i].position.y = this.startPosition.y;
                this.elements[i].image.style.position = 'absolute';
                this.elements[i].image.style.width = this.settings.size.x + 'px';
                this.elements[i].image.style.height = this.settings.size.y + 'px';
                this.elements[i].image.style.opacity = 0.001;
            }
        }
        this.redraw = function () {
            for (l = 0; l < this.elements.length; l++) {
                if (this.elements[l].action || this.action) {
                    this.elements[l].position.x -= this.settings.speed;
                    if (this.elements[l].position.x <= -this.elements[l].size.x)
                        this.complete(this.elements[l]);
                    this.elements[l].image.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.elements[l].position.x, this.elements[l].position.y);
                    this.elements[l].image.style.opacity = 1;
                }
            }
        }
        this.default = function () {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.style.position = 'absolute';
                this.container.style.width = this.place.x + 'px';
                this.container.style.height = this.place.y + 'px';
            }
        }
        this.createElement = function (id) {
            e = {
                image: new Image(),
                size: {x: this.settings.size.x, y: this.settings.size.y},
                position: {x: 0, y: 0, z: 0},
                start: {position: {x: 0, y: 0}, size: {x: 0, y: 0}},
                end: {position: {x: 0, y: 0}, size: {x: 0, y: 0}},
                action: false,
                seek: 0,
                level: false,
                draw: false,
                id: this.name + id
            };
            e.image.style.position = 'absolute';
            e.image.style.opacity = 0.001;
            e.image.src = this.settings.image;
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
        this.complete = function (element) {
            element.action = false;
            element.image.style.opacity = 0.001;

        };
    }

    var NarrRunerWallObject = function (settings, place, y) {
        this.elements = [];
        this.place = place;
        this.settings = settings;
        this.startPosition = {x: this.place.x, y: y};
        this.name = 'NarrRunerWallObject';
        var i, j;
        this.start = function () {
            for (i = 0; i < this.elements.length; i++)
                if (!this.elements[i].action)
                    break;

            if (!this.elements[i]) return;
            this.elements[i].position.x = this.startPosition.x;
            for (j = 0; j < this.elements.length; j++) {
                if (this.elements[j].action &&
                    this.elements[i].position.x < this.elements[j].position.x + this.settings.size.x)
                    this.elements[i].position.x = this.elements[j].position.x + this.settings.size.x;
            }
            this.elements[i].action = true;
        }
    }
    NarrRunerWallObject.prototype = new NarrRunerAnimationObject();
    var NarrRunerPitObject = function (settings, place, y) {
        this.elements = [];
        this.place = place;
        this.settings = settings;
        this.startPosition = {x: this.place.x, y: y};
        this.name = 'NarrRunerPitObject';
        var i, j;

        this.start = function () {
            for (i = 0; i < this.elements.length; i++)
                if (!this.elements[i].action)
                    break;
            if (!this.elements[i]) return;
            this.elements[i].position.x = this.startPosition.x;
            this.elements[i].position.y = this.startPosition.y;
            for (j = 0; j < this.elements.length; j++) {
                if (this.elements[j].action &&
                    this.elements[i].position.x < this.elements[j].position.x + this.settings.size.x * 2)
                    this.elements[i].position.x = this.elements[j].position.x + this.settings.size.x * 2;
            }
            this.elements[i].action = true;
        }
    }
    NarrRunerPitObject.prototype = new NarrRunerAnimationObject();
    var NarrRunerGoldObject = function (settings, place, levels) {
        this.elements = [];
        this.place = place;
        this.settings = settings;
        this.levels = levels;
        this.levelsFlags = new Array(levels.length);
        this.startPosition = {x: this.place.x, y: this.levels[0]};
        this.name = 'NarrRunerGoldObject';
        var i, j;

        this.start = function (level, id) {
            this.levelsFlags[level] = true;
            for (i = 0; i < this.elements.length; i++)
                if (!this.elements[i].action)
                    break;

            if (!this.elements[i])
                this.elements[i] = this.createElement();
            this.elements[i].position.x = this.startPosition.x + this.elements[i].size.x * id;
            this.elements[i].position.y = this.levels[level] - this.elements[i].size.y;
            this.elements[i].alpha = 1;
            this.elements[i].image.style.opacity = 1;
            this.elements[i].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[i].position.x, this.elements[i].position.y);
            this.elements[i].image.style.opacity = this.elements[i].alpha;
            this.elements[i].level = level;
            this.elements[i].status = 'live';
            this.elements[i].action = true;
        }
        this.clear = function () {
            for (i = 0; i < this.elements.length; i++) {
                this.off(this.elements[i]);
                this.levelsFlags[this.elements[i].level] = false;
            }
        }
        this.redraw = function () {
            for (j = 0; j < this.elements.length; j++) {
                if (this.elements[j].action) {
                    switch (this.elements[j].status) {
                        case 'live':
                            this.elements[j].position.x -= this.settings.speed;
                            this.elements[j].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[j].position.x, this.elements[j].position.y);
                            if (this.elements[j].position.x < -this.settings.size.x) {
                                this.elements[j].action = false;
                                this.elements[j].image.style.opacity = 0.001;
                                this.levelsFlags[this.elements[i].level] = false;
                            }
                            break;
                    }
                }
            }
        }
        this.caught = function (element) {
            element.action = false;
            element.image.style.opacity = 0.001;
            this.levelsFlags[element.level] = false;
        }
    }
    NarrRunerGoldObject.prototype = new NarrRunerAnimationObject();

    var NarrRunerCloudObject = function (settings, place) {
        this.elements = [];
        this.place = place;
        this.settings = settings;
        this.y = 0;
        this.startPosition = {x: this.place.x, y: 0};
        var i, l;
        this.name = 'NarrRunerCloudObject';

        this.start = function () {
            for (i = 0; i < this.elements.length; i++) {
                this.restartElement(this.elements[i]);
                this.elements[i].position.x = this.place.x / 6 + this.place.x / 3 * i;
                this.elements[i].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[i].position.x, this.elements[i].position.y);
            }
        }
        this.restartElement = function (element) {
            element.position.x = this.place.x + this.settings.size.x;
            element.position.y = 0.2 + Math.round(Math.random() * this.place.y * 0.4);
            element.alpha = 0.3 + Math.random() * 0.4;
            element.scale = 0.5 + Math.random() * 0.5;
            element.image.style.opacity = element.alpha;
            element.image.style[brprefix + "transform"] = bradapter.buildTranslateString(element.position.x, element.position.y);
            element.image.style.width = Math.ceil(this.settings.size.x * element.scale) + 'px';
            element.image.style.height = Math.ceil(this.settings.size.y * element.scale) + 'px';
        }
        this.redraw = function () {
            for (l = 0; l < this.elements.length; l++) {
                this.elements[l].position.x -= this.settings.speed * 0.1;
                if (this.elements[l].position.x < -this.settings.size.x)
                    this.restartElement(this.elements[l]);
                this.elements[l].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[l].position.x, this.elements[l].position.y);
            }
        }
    }
    NarrRunerCloudObject.prototype = new NarrRunerAnimationObject();
    var NarrRunerLandObject = function (settings, place) {
        this.elements = [];
        this.place = place;
        this.settings = settings;
        this.y = this.place.y - this.settings.size.y;
        var i, l;

        this.init = function () {
            this.default();
            for (i = 0; i < Math.round((this.place.x + this.settings.size.x * 2) / this.settings.size.x); i++) {
                this.elements[i] = {
                    image: new Image(),
                    size: this.settings.size,
                    startPosition: {x: Math.ceil(-this.settings.size.x + (this.settings.size.x - 1) * i), y: Math.ceil(this.y)},
                    position: {x: -this.settings.size.x + (this.settings.size.x - 1) * i, y: this.y}
                }

                this.elements[i].image.src = this.settings.image;
                this.elements[i].image.style.position = 'absolute';
                this.elements[i].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[i].position.x, this.elements[i].position.y);
                this.elements[i].image.style.width = this.settings.size.x + 'px';
                this.elements[i].image.style.height = this.settings.size.y + 'px';
                this.container.appendChild(this.elements[i].image);
            }
        }
        this.start = function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].position.x = this.elements[i].startPosition.x;
                this.elements[i].position.y = this.elements[i].startPosition.y;
            }
        }
        this.redraw = function () {
            for (l = 0; l < this.elements.length; l++) {
                this.elements[l].position.x -= this.settings.speed;
                if (this.elements[l].position.x < this.elements[0].startPosition.x) {
                    if (l > 0)
                        this.elements[l].position.x = this.elements[l - 1].position.x + this.elements[l - 1].size.x - 1;
                    else
                        this.elements[l].position.x = this.elements[this.elements.length - 1].position.x + this.elements[this.elements.length - 1].size.x - this.settings.speed - 1;
                }
                this.elements[l].image.style[brprefix + "transform"] = bradapter.buildTranslateString(this.elements[l].position.x, this.elements[l].position.y);
            }
        }
    }
    NarrRunerLandObject.prototype = new NarrRunerAnimationObject();

    var NarrRunerSimpleObject = function () {
        this.elements = [];
        this.startPosition = {x: 0, y: 0};
        this.name = 'NarrRunnerSimpleObject';

        this.start = function (x, y) {
            this.elements[0].position.x = x;
            this.elements[0].position.y = y;
            this.action = true;
            this.redraw();
        }
    }
    NarrRunerSimpleObject.prototype = new NarrRunerAnimationObject();
    var NarrRunerStartObject = function (settings, place, y) {
        this.place = place;
        this.settings = settings;
        this.y = y
        this.name = 'NarrRunerStartObject';
    }
    NarrRunerStartObject.prototype = new NarrRunerSimpleObject();
    var NarrRunerFinishObject = function (settings, place, y) {
        this.place = place;
        this.settings = settings;
        this.y = y;
        this.name = 'NarrRunerFinishObject';
    }
    NarrRunerFinishObject.prototype = new NarrRunerSimpleObject();
    var NarrRunerCheckPointObject = function (settings, place, y) {
        this.place = place;
        this.settings = settings;
        this.y = y;
        this.name = 'NarrRunerCheckPointObject';
    }
    NarrRunerCheckPointObject.prototype = new NarrRunerSimpleObject();

    var NarrRunerHeroObject = function (images, place, y, upHeight) {
        this.elements = [];
        this.place = place;
        this.images = [];
        for (var j = 0; j < images.length; j++)
            this.images[j] = images[j];
        this.y = y;
        this.upHeight = upHeight;
        this.run = false;
        this.animationCounter = 0;
        this.position = {x: 0, y: 0};
        this.size = {x: 0, y: 0};
        this.seek = 0;
        this.hideSeek = 0;
        this.finish = false;
        var i;

        this.init = function () {
            this.runPosition = {x: ((this.place.width - this.images[0].size.x) / 2), y: (this.y - this.images[0].size.y)};
            this.container = document.createElement('div');
            this.container.style.width = this.place.width + 'px';
            this.container.style.height = this.place.width + 'px';
            this.container.style.position = 'absolute';
            this.container.style.opacity = 0.001;

            for (i = 0; i < this.images.length; i++) {
                this.images[i].container = new Image();
                this.images[i].container.style.opacity = 0.001;
                this.images[i].container.style.position = 'absolute';
                this.images[i].container.src = this.images[i].image;
                this.images[i].container.style.width = this.images[i].size.x + 'px';
                this.images[i].container.style.height = this.images[i].size.y + 'px';
                this.container.appendChild(this.images[i].container);
            }
            this.status = 'stands';
        }
        this.start = function () {
            if (!this.finish)
                this.position.x = (this.place.width * 0.5 - this.images[this.run ? 1 : 2].size.x) / 2;
            this.position.y = this.y - this.images[this.run ? 1 : 2].size.y;
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            this.container.style.opacity = 1;
            this.images[1].container.style.opacity = 1;
            this.status = 'run';
        }
        this.update = function (seek) {
            switch (this.status) {
                case 'show':
                    this.size.x = this.images[1].size.x;
                    this.size.y = this.images[1].size.y;
                    this.position.x = this.startX + (this.endX - this.startX) * seek;
                    this.position.y = this.y - this.images[1].size.y;
                    break;
                case 'run':
                case 'walls':
                    this.size.x = this.images[1].size.x;
                    this.size.y = this.images[1].size.y;
                    this.position.x = (this.place.width * 0.5 - this.images[1].size.x) / 2;
                    this.position.y = this.y - this.images[1].size.y - (this.status == 'run' ? 0 : this.upHeight);
                    break;
                case 'return':
                case 'up':
                case 'died':
                    if (seek == undefined) seek = this.seek;
                    this.position.y = Math.ceil(this.startY + (this.endY - this.startY) * seek);
                    break;
                case 'down':
                    if (seek == undefined) seek = this.seek;
                    this.position.x -= this.images[0].speed;
                    this.position.y = Math.ceil(this.startY + (this.endY - this.startY) * seek);
            }
        }
        this.hideUpdate = function (seek) {
            if (!seek)seek = this.hideSeek;
            this.position.x = this.startX + (this.endX - this.startX) * seek;
        }
        this.redraw = function () {
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            switch (this.status) {
                case 'show':
                case 'run':
                case 'walls':
                    this.animationCounter++;
                    if (this.animationCounter > 4) {
                        this.animationCounter = 0;
                        this.images[this.run ? 1 : 2].container.style.opacity = 1;
                        this.images[this.run ? 2 : 1].container.style.opacity = 0.001;
                    }
                    this.run = !this.run;
                    break;
                case 'died':
                    this.images[0].container.style.opacity = 1;
            }
        }
        this.died = function () {
            this.startY = this.status == 'down' ? this.position.y : this.endY;
            this.status = 'died';
            this.endY = this.place.height * 1.3;
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
        }
        this.down = function () {
            this.status = 'down';
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.images[0].container.style.opacity = 1;
            this.startY = this.position.y;
            this.endY = this.y;
        }
        this.runWalls = function () {
            this.status = 'walls';
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.position.y = this.y - this.images[this.run ? 1 : 2].size.y;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            this.images[this.run ? 1 : 2].container.style.opacity = 1;
        }
        this.return = function () {
            this.status = 'return';
            this.startY = this.position.y
            this.endY = this.runPosition.y;
        }
        this.show = function () {
            this.finish = false;
            this.status = 'show';
            this.startX = -this.images[0].size.x;
            this.endX = (this.place.width * 0.5 - this.images[1].size.x) / 2;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.startX, this.position.y);
            this.container.style.opacity = 1;
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.images[this.run ? 1 : 2].container.style.opacity = 1;
        }
        this.hide = function () {
            this.finish = true;
            this.startX = this.position.x;
            this.endX = this.place.width + this.images[1].size.x * 2;
        }
        this.up = function (force) {
            this.startY = this.position.y - 30;
            this.endY = this.position.y - this.upHeight * 1.2 * force;
            this.status = 'up';
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.images[3].container.style.opacity = 1;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
        }
        this.pause = function () {
            if (this.status != 'up' && this.status != 'return') {
                this.status = 'stands';
                for (var i = 0; i < this.images.length; i++)
                    this.images[i].container.style.opacity = i > 0 ? 0.001 : 1;
                this.position.y = this.y - this.images[0].size.y;
                this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            }
        }
        this.resume = function () {
            if (this.status == 'stands')
                this.start();
        }
        this.clear = function () {
            this.action = false;
            this.status = 'false';
            this.container.style.opacity = 0.001;
        }
    }
    var NarrRunerEnemyObject = function (images, place, y, upHeight) {
        this.elements = [];
        this.place = place;
        this.images = [];
        for (var j = 0; j < images.length; j++)
            this.images[j] = images[j];
        this.y = y;
        this.upHeight = upHeight;
        this.run = false;
        this.animationCounter = 0;
        this.position = {x: 0, y: 0};
        this.size = {x: 0, y: 0};
        this.seek = 0;
        var i;

        this.init = function () {
            this.runPosition = {x: this.place.width + this.images[0].size.x, y: this.y - this.images[0].size.y};
            this.container = document.createElement('div');
            this.container.style.width = this.place.width + 'px';
            this.container.style.height = this.place.width + 'px';
            this.container.style.position = 'absolute';
            this.container.style.opacity = 0.001;

            for (i = 0; i < this.images.length; i++) {
                this.images[i].container = new Image();
                this.images[i].container.style.opacity = i > 0 ? 0.001 : 1;
                this.images[i].container.style.position = 'absolute';
                this.images[i].container.src = this.images[i].image;
                this.images[i].container.style.width = this.images[i].size.x + 'px';
                this.images[i].container.style.height = this.images[i].size.y + 'px';
                this.container.appendChild(this.images[i].container);
            }
            this.status = 'false';
        }
        this.start = function () {
            for (i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.position.x = this.runPosition.x;
            this.position.y = this.runPosition.y;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            this.container.style.opacity = 1;
            this.images[this.run ? 0 : 1].container.style.opacity = 1;
            this.status = 'run';
            this.action = true;
        }
        this.update = function (seek) {
            this.position.x -= this.images[0].speed * 1.5;
            if (this.position.x < -this.images[0].size.x)
                this.status = 'false';

            switch (this.status) {
                case 'run':
                case 'walls':

                    break;
                case 'return':
                case 'up':
                case 'died':
                    if (seek == undefined) seek = this.seek;
                    this.position.y = Math.ceil(this.startY + (this.endY - this.startY) * seek);


            }
        }
        this.redraw = function () {
            if (!this.action) return;
            this.container.style[brprefix + "transform"] = bradapter.buildTranslateString(this.position.x, this.position.y);
            switch (this.status) {
                case 'run':
                case 'walls':
                    this.animationCounter++;
                    if (this.animationCounter > 4) {
                        this.animationCounter = 0;
                        this.images[this.run ? 0 : 1].container.style.opacity = 1;
                        this.images[this.run ? 1 : 0].container.style.opacity = 0.001;
                    }
                    this.run = !this.run;
                    break;
                case 'return':
                case 'up':
                case 'died':

                    break;
                case 'false':
                    this.action = false;
                    this.container.style.opacity = 0.001;
            }
        }
        this.died = function () {
            this.status = 'died';
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.images[0].container.style.opacity = 1;

            this.startY = this.position.y;
            this.endY = this.place.width;
        }
        this.down = function () {
            this.status = 'down';
            for (var i = 0; i < this.images.length; i++)
                this.images[i].container.style.opacity = 0.001;
            this.images[0].container.style.opacity = 1;
            this.startY = this.position.y;
            this.endY = this.y;
        }
        this.runWalls = function () {
            this.status = 'walls';
            this.images[this.run ? 1 : 0].container.style.opacity = 1;
            this.images[this.run ? 0 : 1].container.style.opacity = 0.001;
            this.position.y = this.runPosition.y - this.upHeight;
        }
        this.runLand = function () {
            this.status = 'run';
            this.images[this.run ? 1 : 0].container.style.opacity = 1;
            this.images[this.run ? 0 : 1].container.style.opacity = 0.001;
            this.position.y = this.runPosition.y;
        }
        this.return = function () {
            this.startY = this.position.y
            this.endY = this.runPosition.y;
            this.status = 'return';
        }
        this.upReturn = function () {
            this.startY = this.position.y;
            this.endY = this.runPosition.y - this.upHeight / 2;
            this.status = 'up';
        }
        this.up = function (force) {
            this.startY = this.position.y;
            this.endY = this.runPosition.y - this.upHeight * force;
            this.status = 'up';
        }
        this.pause = function () {
            if (this.status != 'up') {
                for (var i = 0; i < this.images.length; i++)
                    this.images[i].container.style.opacity = i > 0 ? 0.001 : 1;
                this.status = 'stands';
            }
        }
        this.resume = function () {
            if (this.status == 'stands')
                this.start();
        }
        this.clear = function () {
            this.action = false;
            this.status = 'false';
            this.container.style.opacity = 0.001;
        }
    }

///////////////////////////////////////////////////////////////
//////////////---------  Мышиные дела  ----------//////////////
///////////////////////////////////////////////////////////////
    NarrRuner.prototype.runerTouchHandler = function () {
        if (this.status == 'play' && (this.runerHero.status == 'stands' || this.runerHero.status == 'run' || this.runerHero.status == 'walls')) {
            if (this.runerTouchFlag) {
                this.runerTouchFlag = false;
                this.delegate.removeEventListener('timer', this.runerTouchTimer, this);
                this.runerHeroUp2();
            }
            else {
                this.runerTouchFlag = true;
                this.runerTouchCounter = 0;
                this.delegate.removeEventListener('timer', this.runerTouchTimer, this);
                this.delegate.addEventListener('timer', this.runerTouchTimer, this);
            }
        }
    }
    NarrRuner.prototype.runerTouchTimer = function (event) {
        if (this.status == 'play' && (this.runerHero.status == 'stands' || this.runerHero.status == 'run' || this.runerHero.status == 'walls')) {
            this.runerTouchCounter++;
            if (this.runerTouchCounter > 10 && this.runerTouchFlag) {
                this.runerTouchFlag = false;
                this.delegate.removeEventListener('timer', this.runerTouchTimer, this);
                this.runerHeroUp();
            }
        }
        else {
            this.runerTouchCounter = 0;
            this.runerTouchFlag = false;
            this.delegate.removeEventListener('timer', this.runerTouchTimer, this);
        }
    }
    Utils.addBehaviour('touch', 'NarrRuner', 'NarrRunerTouch',
        {
            start: function (g) {
                this.runerTouchHandler(g);
                return true;
            },
            end: function (g, obj) {
                g.stopPropagation();
            },
            swipe: function (g) {
                g.stopPropagation();
            }
        }, false);

    return NarrRuner;
});