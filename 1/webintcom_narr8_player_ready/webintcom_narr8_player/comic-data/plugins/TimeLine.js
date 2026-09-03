define(["utils/Utils"], function (Utils) {

    var TimeLine;
    TimeLine = function (delegate) {
        this.delegate = delegate;
        this.settings = this.delegate.settings.timeline;
        this.initTimeLine();
        this.initTimeLineSlide();
    };

    Utils.appendToBootSequence(function (delegate) {
        new TimeLine(delegate);
    });

    TimeLine.prototype.initTimeLine = function () {

        this.delegate.addEventListener("playingForward", this.refresh, this);
        this.delegate.addEventListener("timer", this.refresh, this);
        var tag_css = document.createElement('link');
        tag_css.rel = 'stylesheet';
        tag_css.href = window.engineAdditionalURL + 'plugins/TimeLine.css'; // здесь указывается URL стилевого файла
        tag_css.type = 'text/css';
        var tag_head = document.getElementsByTagName('head');
        tag_head[0].appendChild(tag_css);

        this.maindiv = document.createElement("div");
        this.maindiv.style.width = this.delegate.settings.width + "px";
        this.maindiv.style.height = this.delegate.settings.height + "px";
        bradapter.applyZIndex(this.delegate.content, this.maindiv, 100040);
        this.maindiv.style.zIndex = 100040;
        this.delegate.content.appendChild(this.maindiv);

        // основной контейнер для таймлайна
        this.tmldiv = document.createElement("div");
        this.tmldiv.id = "timeline";
        this.tmldiv.style.width = this.delegate.settings.width + 'px';
        this.tmldiv.style.height = this.settings.height + 'px';
        this.tmldiv.style.position = 'absolute';
        this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.height);

        this.tmldiv.style.top = 0;
        this.tmldiv.style.left = 0;
        this.tmldiv.style.borderBottomWidth = this.settings.borderWidth + 'px';
        this.tmldiv.style.borderBottomStyle = 'solid';
        this.tmldiv.style.borderBottomColor = this.settings.borderColor;
        this.tmldiv.style.borderTopWidth = this.settings.borderWidth + 'px';
        this.tmldiv.style.borderTopStyle = 'solid';
        this.tmldiv.style.borderTopColor = this.settings.borderColor;
        this.tmldiv.style.backgroundColor = this.settings.backgroundColor;
        this.tmldiv.style.overflow = 'visible';
        this.tmldiv.style.zIndex = 100001;

        // слой с линейкой
        this.tmldates = document.createElement("div");
        this.tmldates.style.width = this.delegate.settings.width + 'px';
        this.tmldates.style.height = this.settings.height + 'px';
        this.tmldates.style.position = 'absolute';
        this.tmldates.style.top = 0;
        this.tmldates.style.left = 0;
        this.tmldates.style.backgroundImage = "url('" + this.settings.imgs.dates.src + "')";
        this.tmldates.style.backgroundSize = "100%";
        this.tmldates.style.backgroundPosition = 'left center';
        this.tmldates.style.zIndex = 100010;
        this.tmldiv.appendChild(this.tmldates);

        this.maindiv.appendChild(this.tmldiv);
        // кнопка закрытия таймлайна
        this.tmlclose = document.createElement("div");
        this.tmlclose.style.position = 'absolute';
        this.tmlclose.style.top = 0;
        this.tmlclose.style.left = (this.delegate.settings.width - this.settings.imgs.close.width) + 'px';
        this.tmlclose.style.height = this.settings.height + 'px';
        this.tmlclose.style.width = this.settings.imgs.close.width + 'px';
        this.tmlclose.style.backgroundImage = "url('" + this.settings.imgs.close.src + "')";
        this.tmlclose.style.backgroundSize = "100%";
        this.tmlclose.style.opacity = 0.0;
        this.tmlclose.style.zIndex = 100010;
        this.tmldiv.appendChild(this.tmlclose);


        // добавляем элементы с датами и размечаем интервалы их влияния
        var i;
        if ((this.settings.dates !== undefined) && (this.settings.dates.length !== 0)) {
            this.settings.dates.sort(TimeLine.compareDates);
            this.settings.dates[0].bounds = {};
            this.settings.dates[0].bounds.b = 0;
            for (i = 0; i < this.settings.dates.length; i++) {

                this.settings.dates[i].pr = document.createElement("p");
                this.settings.dates[i].pr.style.left = this.settings.dates[i].pos + 'px';
                this.settings.dates[i].pr.style.opacity = 0;
                this.settings.dates[i].pr.className = "red";
                this.settings.dates[i].pr.style.backgroundSize = "100% 100%";
                this.settings.dates[i].pr.style.position = "absolute";
                this.settings.dates[i].pr.innerHTML = this.settings.dates[i].date;
                this.tmldiv.appendChild(this.settings.dates[i].pr);
                if (i < (this.settings.dates.length - 1)) {
                    this.settings.dates[i].bounds.e = (this.settings.dates[i].pos + this.settings.dates[i + 1].pos + 34) / 2;
                    this.settings.dates[i + 1].bounds = {};
                    this.settings.dates[i + 1].bounds.b = this.settings.dates[i].bounds.e;
                }
            }
            this.settings.dates[this.settings.dates.length - 1].bounds.e = this.delegate.settings.width;
        }

        this.maindiv.appendChild(this.tmldiv);


        // добавляем штуку с надписями о датах (бегунок)
        this.caption = document.createElement("div");
        this.caption.style.width = '192px';
        this.caption.style.height = 198 + 'px';
        this.caption.style.left = 0;
        this.caption.style.top = (this.delegate.settings.height - 198 - this.settings.height - 2 * this.settings.borderWidth) + 'px';
        this.caption.style.position = 'absolute';
        this.caption.style.overflow = 'visible';
        this.caption.style.opacity = 0;
        this.caption.style.zIndex = 100000;

        this.button = document.createElement("div");
        this.button.className = "tmlbutton";
        this.button.style.position = 'absolute';
        this.button.style.backgroundImage = "url('img/elements/button.png')";
        this.button.style.width = '31px';
        this.button.style.height = '19px';
        this.button.style.left = '81px';
        this.button.style.top = 0;
        this.button.style.zIndex = 100001;

        this.caption.appendChild(this.button);

        this.text = document.createElement("div");
        this.text.id = "tmlCaptionText";
        this.text.style.boxShadow = '0px 0px 15px 0px rgba(0,0,0,0.5)';
        this.text.style.position = 'absolute';
        this.text.style.width = '192px';
        this.text.style.height = '188px';
        this.text.style.left = 0;
        this.text.style.top = '10px';
        this.text.style.borderTop = '1px solid #EF4123';
        this.text.style.backgroundColor = 'white';
        this.text.className = "withBoxShadow2";
        this.button.style.zIndex = 100000;
        this.caption.appendChild(this.text);

        this.runner = document.createElement("div");
        this.runner.style.position = 'absolute';
        this.runner.style.width = '12px';
        this.runner.style.height = (this.settings.height + this.settings.borderWidth + 6) + 'px';
        this.runner.style.left = '90px';
        this.runner.style.top = '-6px';
        this.runner.style.backgroundColor = '#EF4123';
        this.runner.style.borderRadius = '6px 6px 0px 0px';
        this.runner.style.opacity = 0;
        this.runner.style.zIndex = 100004;
        this.tmldiv.appendChild(this.runner);

        this.maindiv.appendChild(this.caption);

        //позиция (по высоте) и размеры окошка (caption) - для ловли тачей
        this.areaY = this.delegate.settings.height - 198 - this.settings.height - 2 * this.settings.borderWidth;
        this.areaW = 192;
        this.areaH = 198;

        // граница самого таймлайна - для ловли тачей
        this.top = this.delegate.settings.height - this.settings.height - 2 * this.settings.borderWidth;
        this.state = 0;
        this.fadetimer = 0;
        this.activeSlide = 0
        var that = this;
        var timeLineControllerForTap = {spc: true, tap: true};
        var timeLineControllerForPan = {spc: true, pan: true};
        this.delegate.interactionController.addGestureRecognizer("tap", 1 << 21, function (g) {
            that.touchstart(g);
        }, timeLineControllerForTap);
        this.delegate.interactionController.addGestureRecognizer("pan", 1 << 21, function (g) {
            return that.scrollstart(g);
        }, timeLineControllerForPan);

        this.scroll = 0;
        var that = this;
        var timeLineControllerForSwipe = {spc: true, swipe: true};
        this.delegate.interactionController.addGestureRecognizer("swipe", 1 << 21, function (g) {
            return that.scrollstart(g);
        }, timeLineControllerForSwipe);
    };


    TimeLine.prototype.touchstart = function (e) {
        if (this.delegate.scene != 0 && this.delegate.scene != this.delegate.scenes.length - 1) {
            if (e.status = "start") {
                if (this.tmlState != -3) {
                    e.stopPropagation();

                    if ((this.tmlState == 4) && (e.y <= 192)) { // остановка прокрутки меню
                        this.tmlState = 3;

                    }
                    this.tbegin = {x: e.x, y: e.y};
                    this.tprev = {x: e.x, y: e.y};
                    this.ttmp = {x: e.x, y: e.y};


                    this.delegate.addEventListener("timer2", this.draw, this);


                } else {
                    var i;

                    if ((e.x >= 96) && (e.x <= this.delegate.settings.width - 96)) {
                        if (this.state === 1 && (e.y >= 768 - this.settings.height || (e.x >= this.areaX && e.x <= this.areaX + this.areaW && e.y >= this.areaY && e.y <= this.areaY + this.areaH ))) {
                            clearTimeout(this.fadetimer);
                            this.setOpacity(1);
                            if (e.x >= this.areaX && e.x <= this.areaX + this.areaW && e.y >= this.areaY && e.y <= this.areaY + this.areaH) {
                                this.area = 1;
                                this.state = 2;
                            }
                        }
                        else if (this.state != 1 && e.y >= 768 - this.settings.height)
                            this.state = 1;
                        if (e.y >= 768 - this.settings.height && this.tmlState == -3) {
                            for (i = this.settings.dates.length - 1; i >= 0; i--) {
                                if ((Array.inArray(this.settings.slides[this.delegate.scene].marks, this.settings.dates[i].id) == 1) && (e.x >= this.settings.dates[i].pos) && (e.x <= (this.settings.dates[i].pos + 48))) {
                                    this.area = 0;
                                    this.state = 2;
                                    this.activeDate = i;
                                    this.date = true;
                                }
                            }
                            if (!this.date) {
                                if (i < 0) {
                                    for (i = this.settings.dates.length - 1; i >= 0; i--) {
                                        // заполнение таблички с надписью
                                        if ((this.settings.dates[i].bounds.b <= e.x) && (this.settings.dates[i].bounds.e > e.x)) {
                                            this.text.innerHTML = this.settings.dates[i].text;
                                            this.activeDate = i;
                                        }
                                        // сброс класса у всех неактивных дат (по дефолту - активный стиль, для анимации)
                                        if (!(Array.inArray(this.settings.slides[this.delegate.scene].marks, this.settings.dates[i].id) == 1)) {
                                            this.settings.dates[i].pr.className = "";
                                        }
                                        if ((e.x >= 96) && (e.x <= this.delegate.settings.width - 96)) {
                                            this.caption.style.left = (e.x - 96) + 'px';
                                            this.runner.style.left = (e.x - 6) + 'px';
                                        } else if (e.x < 96) {
                                            this.caption.style.left = '0px';
                                            this.runner.style.left = '90px';
                                        } else {
                                            this.caption.style.left = (this.delegate.settings.width - 192) + 'px';
                                            this.runner.style.left = (this.delegate.settings.width - 102) + 'px';
                                        }
                                        // показываем все
                                        this.settings.dates[i].pr.style.opacity = 1;
                                        this.caption.style.opacity = 1;
                                        this.runner.style.opacity = 1;
                                    }
                                    this.lastTouch = e.x;
                                }
                            }
                        }
                    }

                }
            }
            if (e.status = "end") {
                if (this.tmlState != -3 && this.tbegin) {
                    this.date = false;
                    e.stopPropagation();
                    // проверяем попадание в 4 служебные области - если попали, прекращаем обработку события
                    if ((e.x <= 60) && (e.y <= 60)) {
                        this.delegate.navigation.showSettings();
                        // играем звук таймлайна
                        return;
                    }

                    if ((e.x >= this.delegate.settings.width - 60) && (e.y <= 60)) {
                        this.delegate.navigation.showNavigation();
                        return;
                    }

                    if ((e.x >= 0) && (e.x <= this.leftArr.width + 50)
                        && (e.y >= this.delegate.settings.height - this.leftArr.height - 50)) {
                        if ((this.tmlState === 0) && (this.activeDate > 0)) {

                            this.autoAn.v = -(this.maxp + this.minp) / 2;
                            this.autoAn.pp = 0;
                            this.autoAn.endp = -1;
                            this.autoAn.endt = Date.now() + this.time;
                            this.autoAn.chsl = -1;
                            this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                            this.tmlState = 2;

                        }
                        return;
                    }

                    if ((e.x >= this.delegate.settings.width - this.rightArr.width - 50)
                        && (e.y >= this.delegate.settings.height - this.rightArr.height - 50)) {
                        if ((this.tmlState === 0) && (this.activeDate < (this.slideNum - 1))) {

                            this.autoAn.v = (this.maxp + this.minp) / 2;
                            this.autoAn.pp = 0;
                            this.autoAn.endp = 1;
                            this.autoAn.endt = Date.now() + this.time;
                            this.autoAn.chsl = 1;
                            this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                            this.tmlState = 2;

                        }
                        return;
                    }

                    if ((this.tbegin.x >= (this.delegate.settings.width - this.settings.imgs.close.width)) && (this.tbegin.y >= 192) && (this.tbegin.y <= (192 + this.settings.height + 2 * this.settings.borderWidth)) && (this.tmlState == 0)) {
                        this.tmlState = -3;
                        this.goToCanvas();
                    }

                    if (this.tmlState === 3) { // отпустили остановленное меню
                        this.mpv = 0;
                        this.tmlState = 4;
                        this.countMenuAutoAnimation();

                    }

                    if ((this.tmlState === 0) && (e.y <= 192)) { // тач на кадр для перехода
                        if ((e.x >= this.maxpos) && (e.x <= (this.maxpos + 264))) {
                            this.tmlState = -3;
                            this.goToCanvas(this.menuSl[this.activeSlide].slide);
                        } else {
                            this.menuAuto.targetSlide = Math.floor((-this.pos + e.x - 33) / 199);
                            if ((this.menuAuto.targetSlide >= 0) && (this.menuAuto.targetSlide < this.menuSlCnt)) {
                                this.menuAuto.begin = this.pos;
                                this.menuAuto.end = this.maxpos - this.menuAuto.targetSlide * 199;
                                this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
                                this.menuAuto.pt = this.pt;
                                this.tmlState = 4;
                            }
                        }
                    }
                    this.tbegin = undefined;
                    this.tprev = undefined;
                    this.ttmp = undefined;

                } else {
                    var that = this;
                    if (this.state == 1 && e.y >= 768 - this.settings.height && e.x >= 96) {
                        this.calpha = 1;

                        // вычисляем позиция окна - для тача
                        if ((this.lastTouch >= 96) && (this.lastTouch <= this.delegate.settings.width - 96)) {
                            this.areaX = this.lastTouch - 96;
                        } else if (this.lastTouch < 96) {
                            this.areaX = 0;
                        } else {
                            this.areaX = this.delegate.settings.width - 192;
                        }
                        // ставим на таймер фейд
                        this.timeout = 3000;
                        //this.canvas.controlObj = this.canvas;
                    } else if (this.state != 1 && this.state != 0) {
                        // ставим все на паузу
                        // меняем в таймлайне все, что надо
                        e.stopPropagation();
                        this.goToTimeline(this.activeDate);
                        // запоминаем текущие положения стрелок
                        this.delegate.settings.leftArrow.lastPosition = this.delegate.settings.leftArrow.currentPosition;
                        this.delegate.settings.rightArrow.lastPosition = this.delegate.settings.rightArrow.currentPosition;
                        this.settings.dates[this.activeDate].pr.className = "red";
                        this.makeActiveDate(this.menuSl[this.activeSlide].slide, this.activeDate);
                        this.tmlState = 0;
                        this.timer = setTimeout(function () {
                            var i;
                            for (i = that.settings.dates.length - 1; i >= 0; i--) {
                                that.settings.dates[i].pr.className = "red";
                                that.tmlState = 0;
                                if (i != that.activeDate)  that.settings.dates[i].pr.style.opacity = 0;
                            }
                        }, 500);

                    }
                }
            }
        }
    };

    TimeLine.prototype.compareDates = function (a, b) {
        if (a.pos < b.pos) return -1;
        return 1;
    };

    TimeLine.prototype.scrollstart = function (e) {
        var i;
        this.scroll = 1;

        if (e.status == "start") {

            if (this.tmlState == -3 && e.y >= this.delegate.settings.height - this.settings.height) {
                if ((this.state === 2) && (e.dir == 1)) {
                    var that = this;
                    // переход в таймлай

                    // ставим все на паузу
                    this.state = 13;
                    // меняем в таймлайне все, что надо
                    this.goToTimeline(this.activeDate);
                    // запоминаем текущие положения стрелок
                    this.delegate.settings.leftArrow.lastPosition = this.delegate.settings.leftArrow.currentPosition;
                    this.delegate.settings.rightArrow.lastPosition = this.delegate.settings.rightArrow.currentPosition;
                    // если на пэде, то ждем готовности

                    this.settings.dates[this.activeDate].pr.className = "red";
                    this.makeActiveDate(this.menuSl[this.activeSlide].slide, this.activeDate);
                    this.tmlState = 0;
                    this.timer = setTimeout(function () {
                        var i;
                        for (i = that.settings.dates.length - 1; i >= 0; i--) {
                            that.settings.dates[i].pr.className = "red";
                            that.tmlState = 0;
                        }
                    }, 500);

                } else if (this.state == 2) {
                    this.state = 1;
                    for (i = this.settings.dates.length - 1; i >= 0; i--) {
                        // заполнение таблички с надписью
                        if ((this.settings.dates[i].bounds.b <= e.x) && (this.settings.dates[i].bounds.e > e.x)) {
                            this.text.innerHTML = this.settings.dates[i].text;
                            this.activeDate = i;
                        }
                        // сброс класса у всех неактивных дат (по дефолту - активный стиль, для анимации)
                        if (!(Array.inArray(this.settings.slides[this.delegate.scene].marks, this.settings.dates[i].id) == 1)) {
                            this.settings.dates[i].pr.className = "";
                        }
                        // передвижение таблички
                        if ((e.x >= 96) && (e.x <= this.delegate.settings.width - 96)) {
                            this.caption.style.left = (e.x - 96) + 'px';
                            this.runner.style.left = (e.x - 6) + 'px';
                        } else if (e.x < 96) {
                            this.caption.style.left = '0px';
                            this.runner.style.left = '90px';
                        } else {
                            this.caption.style.left = (this.delegate.settings.width - 192) + 'px';
                            this.runner.style.left = (this.delegate.settings.width - 102) + 'px';
                        }
                        // показываем все
                        this.settings.dates[i].pr.style.opacity = 1;
                        this.caption.style.opacity = 1;
                        this.runner.style.opacity = 1;
                    }
                    this.lastTouch = e.x;
                } else {
                    for (i = this.settings.dates.length - 1; i >= 0; i--) {
                        // заполнение таблички с надписью
                        if ((this.settings.dates[i].bounds.b <= e.x) && (this.settings.dates[i].bounds.e > e.x)) {
                            this.text.innerHTML = this.settings.dates[i].text;
                            this.activeDate = i;
                        }
                        // передвижение таблички
                        if ((e.x >= 96) && (e.x <= this.delegate.settings.width - 96)) {
                            this.caption.style.left = (e.x - 96) + 'px';
                            this.runner.style.left = (e.x - 6) + 'px';
                        } else if (e.x < 96) {
                            this.caption.style.left = '0px';
                            this.runner.style.left = '90px';
                        } else {
                            this.caption.style.left = (this.delegate.settings.width - 192) + 'px';
                            this.runner.style.left = (this.delegate.settings.width - 102) + 'px';
                        }
                        // показываем все
                    }
                    this.lastTouch = e.x;
                }
                return true;
            }
            else {
                // e.stopPropagation();
                this.ttmp = {x: e.x, y: e.y};
                this.tprev = {x: e.x, y: e.y};
                if (this.tmlState == 0) {
                    this.changed = 1;
                    if (e.y > (192 + this.settings.height + 2 * this.settings.borderWidth)) {
                        this.tmlState = 1;
                    } else if (e.y <= 192) {
                        this.tmlState = 3;
                    } else if (e.dir == 1) {
                        this.goToCanvas();
                    }

                }
                this.delegate.addEventListener("timer2", this.draw, this);
                return true;
            }
        }
        if (e.status == "move") {
            if (this.tmlState == -3) {
                var i;
                if (this.state == 1) {
                    this.timeout = 3000;
                    if (this.calpha != 1) this.setOpacity(1);
                    this.calpha = 1;
                    for (i = this.settings.dates.length - 1; i >= 0; i--) {
                        // заполнение таблички с надписью
                        if ((this.settings.dates[i].bounds.b <= e.x) && (this.settings.dates[i].bounds.e > e.x)) {
                            this.text.innerHTML = this.settings.dates[i].text;
                            this.activeDate = i;
                        }
                        // передвижение таблички
                        if ((e.x >= 96) && (e.x <= this.delegate.settings.width - 96)) {
                            this.caption.style.left = (e.x - 96) + 'px';
                            this.runner.style.left = (e.x - 6) + 'px';
                        } else if (e.x < 96) {
                            this.caption.style.left = '0px';
                            this.runner.style.left = '90px';
                        } else {
                            this.caption.style.left = (this.delegate.settings.width - 192) + 'px';
                            this.runner.style.left = (this.delegate.settings.width - 102) + 'px';
                        }
                        // показываем все
                    }
                    this.lastTouch = e.x;
                    e.stopPropagation();
                } else {
                    return;
                }
                return true;
            }
            else {
                e.stopPropagation();
                this.tprev = this.ttmp;
                this.ttmp = {x: e.x, y: e.y};
                this.changed = 1;
                return true;
            }
        }
        if (e.status == "end") {
            if (this.tmlState == -3) {
                if (this.state == 1) {
                    var that = this;
                    this.calpha = 1;

                    // вычисляем позиция окна - для тача
                    if ((this.lastTouch >= 96) && (this.lastTouch <= this.delegate.settings.width - 96)) {
                        this.areaX = this.lastTouch - 96;
                    } else if (this.lastTouch < 96) {
                        this.areaX = 0;
                    } else {
                        this.areaX = this.delegate.settings.width - 192;
                    }
                    // ставим на таймер фейд
                    this.timeout = 3000;
                } else {
                    return;
                }
                this.scroll = 0;
            }
            else {
                e.stopPropagation();
                if (this.tmlState === 1) { // находимся в межслайдовом переходе

                    if (this.countAutoAnimation() && e.name == "pan") { // если нужна автодоводка, расчитываем и запускаем ее, иначе переходим в статическое состояние
                        this.tmlState = 2; // автоанимация
                    } else if (e.name == "swipe") {
                        if (e.vectorX > 0 && this.activeDate != 0) {
                            this.autoAn.v = -(this.maxp + this.minp) / 2;
                            this.autoAn.pp = 0;
                            this.autoAn.endp = -1;
                            this.autoAn.endt = Date.now() + this.time;
                            this.autoAn.chsl = -1;
                            this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                        }
                        else if (e.vectorX < 0 && this.slides.length != this.activeDate) {
                            this.autoAn.v = (this.maxp + this.minp) / 2;
                            this.autoAn.pp = 0;
                            this.autoAn.endp = 1;
                            this.autoAn.endt = Date.now() + this.time;
                            this.autoAn.chsl = 1;
                            this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                        }
                        this.countAutoAnimation();
                        this.tmlState = 2;

                        this.delegate.addEventListener("timer2", this.draw, this);
                    }
                } else if (this.tmlState === 3) {
                    this.tmlState = 4;
                    this.countMenuAutoAnimation();

                }
                this.tbegin = undefined;
                this.tprev = undefined;
                this.ttmp = undefined;

                return true;
            }
        }
        if ((e.status == "swipe") && ( this.tmlState != -3)) {
            e.stopPropagation();
            this.tprev = this.ttmp;
            this.ttmp = {x: e.x, y: e.y};
            this.changed = 1;
            return true;
        }
    };

    TimeLine.prototype.setOpacity = function (p) {
        var i;
        for (i = this.settings.dates.length - 1; i >= 0; i--) {
            if (!(Array.inArray(this.settings.slides[this.delegate.scene].marks, this.settings.dates[i].id))) {
                this.settings.dates[i].pr.style.opacity = p;
            }
        }
        this.caption.style.opacity = p;
        this.runner.style.opacity = p;
    };

    TimeLine.prototype.reset = function () {
        var i;

        for (i = this.settings.dates.length - 1; i >= 0; i--) {
            if (!(Array.inArray(this.settings.slides[this.delegate.scene].marks, this.settings.dates[i].id))) {
                this.settings.dates[i].pr.style.opacity = 0;
                this.settings.dates[i].pr.className = "red";
            }
        }
        this.caption.style.opacity = 0;
        this.runner.style.opacity = 0;
        clearTimeout(this.fadetimer);
    };

    TimeLine.prototype.refresh = function (sn, p) {
        if (this.refresh_locked) {
            this.refresh_locked = false;
            return;
        }
        var k;
        var tp1, tp2;

        if (!sn.pageNumber) {
            var s = this.delegate.scene;
            var sl = this.delegate.scenes.length;
            var p = this.delegate.scenes[s].lastTiming;
            sn = {pageNumber: s};
        }

        if (this.runner.style.opacity > 0) {
            if (p > 0) {
                this.setOpacity(0);
                this.calpha = 0;
                this.timeout = 0;
            } else if (this.timeout > 0) {
                this.timeout -= this.delegate.timeout;
                this.calpha = 1;
            } else if (this.calpha != 0) {
                this.calpha = Math.max(0, this.calpha - 0.05);
                this.setOpacity(this.calpha);
                if (this.calpha == 0) {
                    this.reset();
                    this.state = 0;
                    this.area = 0;
                }
            }
        }

        if (p > 0.99 || this.delegate.scenes[sn.pageNumber].currentPause) return;

        // выезжание на первом слайде и уползание на последнем (таймлайн и стрелки)
        if (sn.pageNumber == 0) {
            if (p >= this.settings.pEnd) {
                k = 1;
            } else if (this.settings.pBegin > p) {
                k = 0;
            } else {
                k = (p - this.settings.pBegin) / (this.settings.pEnd - this.settings.pBegin);
            }

            this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.height - k * (this.settings.height + 2 + 2 * this.settings.borderWidth));

        } else if (((sn.pageNumber == (this.delegate.scenes.length - 2)) && (this.settings.pBegin <= p)) || (sn.pageNumber == (this.delegate.scenes.length - 1))) {
            if (p >= this.settings.pEnd) {
                k = 1;
            } else {
                k = (p - this.settings.pBegin) / (this.settings.pEnd - this.settings.pBegin);
            }
            if (sn.pageNumber == (this.delegate.scenes.length - 1)) k = 1;
            this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.height - (1 - k) * (this.settings.height + 2 + this.settings.borderWidth));
            return;
        } else if (this.tmlState == -3) {
            this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.height - (this.settings.height + 2 * this.settings.borderWidth));
        }

        // меняем прозрачность дат
        if (p < 0.1) {
            tp1 = p / 0.1;
        } else {
            tp1 = 1;
        }

        if (p > 0.1) {
            tp2 = (p - 0.9) / 0.1;
        } else {
            tp2 = 0;
        }
        if (sn.pageNumber == 0 || sn.pageNumber == sl - 1) return;

        for (k = this.settings.dates.length - 1; k >= 0; k--) {
            if (Array.inArray(this.settings.slides[sn.pageNumber].marks, this.settings.dates[k].id)) {
                this.slides[k].pr.style.opacity = Math.min(1 - tp1, 0.999);
                if (Array.inArray(this.settings.slides[sn.pageNumber + 1].marks, this.settings.dates[k].id)) {
                    this.settings.dates[k].pr.style.opacity = 0.999;
                }
            } else if (Array.inArray(this.settings.slides[sn.pageNumber + 1].marks, this.settings.dates[k].id)) {
                this.slides[k].pr.style.opacity = Math.min(tp2, 0.999);

            } else if (this.settings.dates[k].pr.style.opacity != 0) {
                this.settings.dates[k].pr.style.opacity = 0;
            }
        }


    };

    TimeLine.prototype.initTimeLineSlide = function () {

        this.slides = this.settings.dates;
        this.tmlState = -3;

        // создаем контейнер для меню
        this.menu = document.createElement("div");
        this.menu.className = "tmlmenu";
        this.menu.style.border = this.settings.borderWidth + 'px, solid, ' + this.settings.borderColor;
        this.menu.style.top = 0;
        this.menu.style.left = 0;
        this.menu.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, -192);

        this.maindiv.appendChild(this.menu);

        this.inmenu = document.createElement("div");
        this.inmenu.className = "tmlmenu";

        this.inmenu.style.top = '0px';
        this.inmenu.style.left = '0px';
        this.inmenu.style.overflow = 'visible';
        this.inmenu.style[brprefix + 'transform'] = bradapter.buildTranslateString(-16, 0);
        this.menu.appendChild(this.inmenu);

        // создаем контейнеры для содержимого таймлайна
        this.content = document.createElement("div");
        this.content.className = 'tmlcontent';
        this.content.style.backgroundImage = "url('img/elements/map.png')";
        this.content.style.top = 0;
        this.content.style.left = 0;
        this.content.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.width);
        this.maindiv.appendChild(this.content);

        this.left = document.createElement("div");
        this.left.className = 'tmlleft';
        this.content.appendChild(this.left);

        this.right = document.createElement("div");
        this.right.className = 'tmlright';
        this.content.appendChild(this.right);

        this.center = document.createElement("div");
        this.center.className = 'tmlcenter';
        this.content.appendChild(this.center);
        // белая подложка
        this.white = document.createElement("div");
        this.white.className = 'tmlwhite';
        this.content.appendChild(this.white);
        //линия
        this.line = document.createElement("div");
        this.line.className = 'tmlline';
        this.content.appendChild(this.line);

        this.bottom = document.createElement("div");
        this.bottom.className = 'tmlbottom';
        this.bottom.style.height = "540px";
        this.content.appendChild(this.bottom);


        var i;
        var that = this;
        for (i = this.slides.length - 1; i >= 0; i--) {
            this.slides[i].leftCol = document.createElement("div");
            this.slides[i].leftCol.className = "tmlcolumn";
            this.slides[i].leftCol.style.left = "-304px";
            this.slides[i].leftCol.innerHTML = "<img src = '" + this.slides[i].leftImg + "' />" + this.slides[i].leftText;
            //this.left.appendChild(this.slides[i].leftCol);

            this.slides[i].rightCol = document.createElement("div");
            this.slides[i].rightCol.className = "tmlcolumn";
            this.slides[i].rightCol.style.left = "-304px";
            this.slides[i].rightCol.innerHTML = "<img src = '" + this.slides[i].rightImg + "' />" + this.slides[i].rightText;
            //this.right.appendChild(this.slides[i].rightCol);

            this.slides[i].centerCol = document.createElement("div");
            this.slides[i].centerCol.className = "tmlCcolumn";
            this.slides[i].centerCol.style.left = "-268px";
            this.slides[i].centerCol.innerHTML = this.slides[i].centerText;
            //this.center.appendChild(this.slides[i].centerCol);
            this.slides[i].centerColHeight = this.slides[i].centerCol.clientHeight;

        }
        // настройка ширин
        this.col = 304;
        this.cen = 268;
        // разные координаты тачей
        this.tbegin = undefined;
        this.tprev = undefined;
        this.ttmp = undefined;
        //флаг измения во время скролла
        this.changed = 0;
        // предыдущее значение параметра
        this.pp = 0;
        // предыдущая скорость
        this.pv = 0;
        // константы прокрутки
        this.time = 340;
        this.maxv = this.delegate.scenes.length / this.time;
        this.minv = this.maxv / 5;
        this.tminv = this.maxv / 15;
        this.tmaxv = this.maxv / 3;
        this.maxp = 1 / this.time;
        this.minp = this.maxp / 5;
        this.A = 1 / this.delegate.scenes.length;
        this.pbound = 0.5;
        // сумма геом прогрессии
        this.sum = this.delegate.timeout * 10;
        // примерно нулевая скорость (для замедления перемотки слайдов)
        this.eps = 0.0000347;
        // скорость снижения скорости при замедлении перемотки слайда
        this.ds = 0.9;
        // максимальная позиция меню
        this.maxpos = 378;
        // высота контента
        this.contentHeight = 540;
        // количество слайдов
        this.slideNum = this.slides.length;
        // структура для автоанимации
        this.autoAn = {};
        // флаг сброшенности активного слайда
        this.reseted = 0;
        // время быстрого перехода
        this.trTime = 300;
        // объект для автоанимации меню
        this.menuAuto = {};

        this.pageSwitchDirection = 0;

        // заполняем меню
        this.menuSlCnt = 0; // количество слайдов в меню
        this.menuSl = [];
        for (i = 0; i < this.delegate.scenes.length; i++) {
            this.menuSl[this.menuSlCnt] = {};
            this.menuSl[this.menuSlCnt].slide = i;
            this.menuSl[this.menuSlCnt].xBegin = 33 + this.menuSlCnt * 199;
            this.menuSl[this.menuSlCnt].xEnd = 33 + (this.menuSlCnt + 1) * 199;
            this.menuSl[this.menuSlCnt].div = document.createElement("div");
            this.menuSl[this.menuSlCnt].div.style.width = '266px';
            this.menuSl[this.menuSlCnt].div.style.height = '192px';
            this.menuSl[this.menuSlCnt].div.style.overflow = 'visible';
            this.menuSl[this.menuSlCnt].shadow = document.createElement("div");
            this.menuSl[this.menuSlCnt].shadow.className = 'shadow';
            this.menuSl[this.menuSlCnt].shadow.style.backgroundImage = "url('img/elements/ten.png')";
            this.menuSl[this.menuSlCnt].shadow.style.zIndex = '0';
            this.menuSl[this.menuSlCnt].shadow.style.left = '-57px';
            this.menuSl[this.menuSlCnt].shadow.style.top = '-60px';
            this.menuSl[this.menuSlCnt].shadow.style.width = '380px';
            this.menuSl[this.menuSlCnt].shadow.style.height = '311px';
            this.menuSl[this.menuSlCnt].shadow.style.opacity = 0;

            this.menuSl[this.menuSlCnt].div.appendChild(this.menuSl[this.menuSlCnt].shadow);
            this.menuSl[this.menuSlCnt].img = document.createElement("img");
            this.menuSl[this.menuSlCnt].img.src = this.delegate.scenes[i].preview;
            this.menuSl[this.menuSlCnt].img.style.width = "268px";
            this.menuSl[this.menuSlCnt].img.style.position = 'absolute';
            this.menuSl[this.menuSlCnt].img.style.zIndex = '1';
            this.menuSl[this.menuSlCnt].div.appendChild(this.menuSl[this.menuSlCnt].img);

            this.menuSl[this.menuSlCnt].div.style.position = 'absolute';
            this.menuSl[this.menuSlCnt].div.style[brprefix + "transform-origin"] = "50% 50%";
            this.menuSl[this.menuSlCnt].div.style[brprefix + "transform"] = bradapter.buildTranslateString(this.menuSlCnt * 199, 0) + ' ' + bradapter.buildScaleString(0.50, 0.50);
            this.inmenu.appendChild(this.menuSl[this.menuSlCnt].div);
            this.menuSlCnt++;
        }
        // минимальная позиция меню
        this.minpos = 580 - this.menuSlCnt * 199;
        // проставляем датам слайды
        var j;
        for (j = 0; j < this.slideNum; j++) {
            for (i = 0; i < this.menuSlCnt; i++) {
                if (Array.inArray(this.settings.slides[this.menuSl[i].slide].marks, this.slides[j].id)) {
                    this.slides[j].sl = i;
                    break;
                }
            }
        }
        this.inmenu.style.width = (this.menuSlCnt * 199 + 66) + 'px';

        this.leftArr = document.createElement("div");
        this.leftArr.className = "leftArr";
        this.leftArr.style.backgroundImage = "url(" + this.delegate.settings.leftArrow.img + ")";
        this.leftArr.style.backgroundSize = "100% 100%";
        this.leftArr.style.bottom = 0;
        this.leftArr.style.position = "absolute";
        bradapter.applyZIndex(this.delegate.content, this.leftArr, 0);
        this.leftArr.style.left = 0;
        this.leftArr.style.opacity = 1;
        this.leftArr.style.height = this.delegate.settings.leftArrow.height + "px";
        this.leftArr.style.width = this.delegate.settings.leftArrow.width + "px";
        this.leftArr.height = this.delegate.settings.leftArrow.height;
        this.leftArr.width = this.delegate.settings.leftArrow.width;
        this.delegate.content.appendChild(this.leftArr);


        this.rightArr = document.createElement("div");
        this.rightArr.className = "rigthArr";
        this.rightArr.style.position = "absolute";
        this.rightArr.style.backgroundImage = "url(" + this.delegate.settings.rightArrow.img + ")";
        this.rightArr.style.backgroundSize = "100% 100%";
        this.rightArr.style.bottom = 0;
        this.rightArr.style.right = 0;
        this.rightArr.style.opacity = 1;
        bradapter.applyZIndex(this.delegate.content, this.rightArr, 0);
        this.rightArr.height = this.delegate.settings.rightArrow.height;
        this.rightArr.width = this.delegate.settings.rightArrow.width;
        this.rightArr.style.height = this.delegate.settings.rightArrow.height + "px";
        this.rightArr.style.width = this.delegate.settings.rightArrow.width + "px";

        this.leftArr.currentPosition = this.delegate.settings.leftArrow.currentPosition;
        this.rightArr.currentPosition = this.delegate.settings.rightArrow.currentPosition;
        this.leftArr.lastPosition = 0;
        this.rightArr.lastPosition = 0;

        this.delegate.content.appendChild(this.rightArr);
    }

    TimeLine.prototype.goToTimeline = function (date) {
        var i;
        this.delegate.controlController.hideArrows(true);

        this.scaleimg();
        bradapter.applyZIndex(this.delegate.content, this.leftArr, 100040);
        bradapter.applyZIndex(this.delegate.content, this.rightArr, 100040);

        this.settings.slides[this.delegate.scene].state = -3; // ставим на паузу основные слайды

        if (!this.slides[date].leftCol.parentNode) {
            this.left.appendChild(this.slides[date].leftCol);
            this.right.appendChild(this.slides[date].rightCol);
            this.center.appendChild(this.slides[date].centerCol);
            this.slides[date].centerColHeight = this.slides[date].centerCol.clientHeight;
        }
        this.slides[date].leftCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.col, 0);
        this.slides[date].rightCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.col, 0);
        this.slides[date].centerCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.cen, 0);
        this.white.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.slides[date].centerColHeight - this.contentHeight);
        this.center.style.height = this.slides[date].centerColHeight + "px";
        this.line.style.top = this.slides[date].centerColHeight + "px";
        bradapter.applyZIndex(this.content, this.line, 100010);
        this.bottom.style.backgroundImage = 'url("' + this.slides[date].arrowImg + '")';
        this.bottom.style.opacity = 0.999;

        for (i = (this.slideNum - 1); i >= 0; i--) {
            if (i !== date) {
                this.slides[i].leftCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
                this.slides[i].rightCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
                this.slides[i].centerCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
            }
        }

        for (i = (this.menuSlCnt - 1); i >= 0; i--) {
            if (this.menuSl[i].slide == this.delegate.scene) {
                this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(this.menuSl[i].xBegin - 33, 0);
                this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(this.maxpos - 199 * i, 0);
                this.menuSl[i].img.className = "active";
                bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                this.menuSl[i].shadow.style.opacity = 0.999;

                this.activeSlide = i;
                this.pos = this.maxpos - 199 * i;
                break;
            }
        }

        // текущая дата
        this.activeDate = date;

    };


    TimeLine.prototype.makeActiveDate = function (slide, date) {

        var that = this, i;
        this.tmlclose.style.opacity = parseFloat(this.tmlclose.style.opacity) + 0.047;
        if (this.tmlclose.style.opacity > 1) this.tmlclose.style.opacity = 1;
        var p = Easing.easeOutQuad(null, this.tmlclose.style.opacity, 0, 1, 1);
        if (this.caption.style.opacity > 0.2) {
            this.caption.style.opacity = Math.max(this.caption.style.opacity - 0.2, 0.001);
            this.runner.style.opacity = Math.max(this.runner.style.opacity - 0.2, 0.001);
        } else {
            this.caption.style.opacity = "0";
            this.runner.style.opacity = "0";
        }

        for (i = (this.settings.dates.length - 1); i >= 0; i--) {
            if (i === date) {
            } else if (Array.inArray(this.settings.slides[slide].marks, this.settings.dates[i].id)) {

                if (this.settings.dates[i].pr.style.opacity > 0) {
                    this.settings.dates[i].pr.style.opacity = 1 - this.tmlclose.style.opacity;
                    if (this.settings.dates[i].pr.style.opacity < 0) this.settings.dates[i].pr.style.opacity = 0;
                }

            } else {
                if (this.settings.dates[i].pr.style.opacity > 0) {
                    this.settings.dates[i].pr.style.opacity = 1 - this.tmlclose.style.opacity;
                    if (this.settings.dates[i].pr.style.opacity < 0) this.settings.dates[i].pr.style.opacity = 0;
                }
            }
        }

        // сдвиг элементов таймлайна
        this.menu.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, (p - 1) * 192);
        this.content.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 228 + (1 - p) * 796);
        this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 192 + (1 - p) * 796);


        if ((this.activeDate == 0)) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.leftArr.height);
        } else if ((this.activeDate != 0)) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, 0);
        }
        if ((this.activeDate == (this.settings.dates.length - 1))) {
            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.rightArr.height);
        } else if ((this.activeDate != (this.settings.dates.length - 1))) {
            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, 0);
        }

        if (this.tmlclose.style.opacity < 1) this.colortimer = setTimeout(function () {
            that.makeActiveDate(slide, date);
        }, this.delegate.timeout);
        else {
            this.menu.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
            this.content.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 228);
            this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 192);
            if (this.activeDate == 0) {
                this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height);
            }

            if (this.activeDate == (this.settings.dates.length - 1)) {
                this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height);
            }
            this.state = 0;
            if (p == 1) {
                this.tempState = this.delegate.state;
                this.delegate.state = 2;
            }
        }
    };


// меняем подстветки дат при переходе с таймлайна (на другой слайд)
    TimeLine.prototype.makeActiveSlide = function (slide) {

        var that = this, i, tmldelta;
        if ((slide == 0) || (slide == (this.delegate.scenes.length - 1))) {
            tmldelta = 540 + this.delegate.settings.height + 2 * this.settings.borderWidth;
        } else {
            tmldelta = 540;
        }
        this.tmlclose.style.opacity = parseFloat(this.tmlclose.style.opacity) - 0.047;
        if (this.tmlclose.style.opacity < 0) this.tmlclose.style.opacity = 0;

        var p = 1 - Easing.easeInQuad(null, (1 - this.tmlclose.style.opacity), 0, 1, 1);

        for (i = (this.settings.dates.length - 1); i >= 0; i--) {
            if ((this.settings.slides[slide].marks !== undefined) && (Array.inArray(this.settings.slides[slide].marks, this.settings.dates[i].id))) {
                if (this.settings.dates[i].pr.style.opacity < 1) {
                    this.settings.dates[i].pr.style.opacity = parseFloat(this.settings.dates[i].pr.style.opacity) + 0.047;
                    if (this.settings.dates[i].pr.style.opacity > 1)  this.settings.dates[i].pr.style.opacity = 1;
                }
            } else {
                if (this.settings.dates[i].pr.style.opacity > 0) {
                    this.settings.dates[i].pr.style.opacity -= 0.047;
                    if (this.settings.dates[i].pr.style.opacity < 0) this.settings.dates[i].pr.style.opacity = 0;
                }
            }
        }

        // сдвиг элементов таймлайна
        this.menu.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, (p - 1) * 192);
        this.content.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 228 + (1 - p) * 540);
        this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 192 + (1 - p) * tmldelta);

        //сдвиг стрелок (если надо)
        if ((this.activeDate == 0) && (slide !== 0)) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height - (1 - p) * this.leftArr.height);
        } else if ((this.activeDate != 0) && (slide == 0)) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height - p * this.leftArr.height);
        }

        if ((this.activeDate == (this.settings.dates.length - 1)) && (slide != (this.delegate.scenes.length - 1))) {
            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height - (1 - p) * this.rightArr.height);
        } else if ((this.activeDate != (this.settings.dates.length - 1)) && (slide == (this.delegate.scenes.length - 1))) {
            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height - p * this.rightArr.height);
        }

        if (this.tmlclose.style.opacity > 0) {
            this.colortimer = setTimeout(function () {
                that.makeActiveSlide(slide);
            }, this.delegate.timeout);
        } else {
            // сдвиг элементов таймлайна
            this.menu.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, -192);
            this.content.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, this.delegate.settings.height);
            this.tmldiv.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 192 + tmldelta);

            //сдвиг стрелок (если надо)
            if ((this.activeDate == 0) && (slide !== 0)) {
                this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height, this.leftArr.height);
            } else if ((this.activeDate != 0) && (slide == 0)) {
                this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height);
            }
            if ((this.activeDate == (this.settings.dates.length - 1)) && (slide != (this.delegate.scenes.length - 1))) {
                this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height - this.rightArr.height);
            } else if ((this.activeDate != (this.settings.dates.length - 1)) && (slide == (this.delegate.scenes.length - 1))) {
                this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, this.delegate.settings.height);
            }
        }
    };


// расчет доводки меню
    TimeLine.prototype.countMenuAutoAnimation = function () {
        if (this.pos < this.minpos) { // меню "оттянуто" влево
            this.menuAuto.begin = this.pos;
            this.menuAuto.end = this.minpos;
            this.menuAuto.pt = this.pt;
            this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
            this.menuAuto.targetSlide = this.menuSlCnt - 1;
        } else if (this.pos > this.maxpos) { // меню "оттянуто" влево
            this.menuAuto.begin = this.pos;
            this.menuAuto.end = this.maxpos;
            this.menuAuto.pt = this.pt;
            this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
            this.menuAuto.targetSlide = 0;
        } else {
            if (this.mpv >= 0) { //прокрутка вниз
                if (this.mpv < this.minv) {
                    this.menuAuto.targetSlide = Math.floor((-this.pos + 512 - 33) / 199);
                    this.menuAuto.begin = this.pos;
                    this.menuAuto.end = this.maxpos - this.menuAuto.targetSlide * 199;
                    this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
                    this.menuAuto.pt = this.pt;
                } else {
                    this.menuAuto.targetSlide = Math.floor((-(this.pos + this.sum * this.mpv) + 512 - 33) / 199);
                    if (this.menuAuto.targetSlide < 0) this.menuAuto.targetSlide = 0;
                    this.menuAuto.begin = this.pos;
                    this.menuAuto.end = this.maxpos - this.menuAuto.targetSlide * 199;
                    this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
                    this.menuAuto.pt = this.pt;
                }
            } else if (this.mpv < 0) { // прокрутка вверх
                if (this.mpv > -this.minv) {
                    this.menuAuto.targetSlide = Math.floor((-this.pos + 512 - 33) / 199);
                    this.menuAuto.begin = this.pos;
                    this.menuAuto.end = this.maxpos - this.menuAuto.targetSlide * 199;
                    this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
                    this.menuAuto.pt = this.pt;
                } else {
                    this.menuAuto.targetSlide = Math.floor((-(this.pos + this.sum * this.mpv) + 512 - 33) / 199);
                    if (this.menuAuto.targetSlide >= this.menuSlCnt) this.menuAuto.targetSlide = this.menuSlCnt - 1;
                    this.menuAuto.begin = this.pos;
                    this.menuAuto.end = this.maxpos - this.menuAuto.targetSlide * 199;
                    this.menuAuto.pv = (this.menuAuto.end - this.menuAuto.begin) / this.sum;
                    this.menuAuto.pt = this.pt;
                }
            }
        }

    };

    TimeLine.prototype.goToCanvas = function (slide) {
        bradapter.applyZIndex(this.delegate.content, this.leftArr, 0);
        bradapter.applyZIndex(this.delegate.content, this.rightArr, 0);

        var that = this;
        this.pageSwitchDirection = 1;
        this.delegate.state = this.tempState;
        this.delegate.controlController.showArrows();
        this.switchPageNumber(true);


        if ((slide !== undefined) && (slide !== this.delegate.scene)) {

            this.delegate.viewCreator.createSpinner(this.maxpos + 1, 0, 268, 192, 0.95);
            this.slide = slide;
            this.delegate.addEventListener("sceneIsLoaded", this.isLoaded, this);
            this.delegate.removeEventListener('timer', this.refresh, this);
            this.refresh_locked = true;
            this.delegate.jumpToScene(this.slide, true);
            this.pageSwitchDirection = 0;
        } else {
            this.makeActiveSlide(this.delegate.scene);
            var tmp = this.activeSlide;

            this.timer = setTimeout(
                function () {
                    that.state = 0;
                    that.tmlState = -3;
                    var i;

                    that.menuSl[tmp].div.style[brprefix + "transform"] = bradapter.buildTranslateString(that.menuSl[tmp].xBegin - 33, 0) + ' ' + bradapter.buildScaleString(0.5, 0.5);
                    bradapter.applyZIndex(that.inmenu, that.menuSl[that.activeSlide].div, 100001);
                    that.menuSl[tmp].img.className = "";
                    that.menuSl[tmp].shadow.style.opacity = 0;
                },
                700
            );
            if (!slide)  this.activeSlide = this.delegate.scene;
        }

    };
    TimeLine.prototype.isLoaded = function () {

        var that = this;

        this.delegate.viewCreator.removeSpinner();
        this.delegate.removeEventListener("sceneIsLoaded", this.isLoaded, this);
        this.delegate.addEventListener('timer', this.refresh, this);
        this.makeActiveSlide(this.delegate.scene);
        this.activeSlide = this.delegate.scene;
        var tmp = this.activeSlide;
    };
    TimeLine.prototype.countAutoAnimation = function () {
        var p = this.pp;
        var d = new Date();
        var t = d.valueOf();

        if ((this.activeDate < (this.slideNum - 1)) && (p > 0)) {
            // в зависимости от положения параметра и скорости, заполняем параметры автоанимации или переходим на нужный слайд
            if (p >= 1) {
                this.nextSlide();
                return 0;
            } else if (p >= this.pbound) {
                if (this.pv < -this.tmaxv) {
                    this.autoAn.pp = p;
                    this.autoAn.endp = 0;
                    this.autoAn.v = -this.maxp;
                    this.autoAn.endt = t + Math.round(p * this.time);
                    this.autoAn.chsl = 0;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                } else {
                    if (this.pv > this.tmaxv) this.autoAn.v = this.maxp;
                    else if (this.pv > this.tminv) this.autoAn.v = this.pv / 400;   //400-this.canvas.slideLength
                    else if (this.pv >= 0) this.autoAn.v = this.minp;
                    else this.autoAn.v = this.maxp;

                    this.autoAn.pp = p;
                    this.autoAn.endp = 1;
                    this.autoAn.endt = t + Math.round((1 - p) * this.time);
                    this.autoAn.chsl = 1;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                }
            } else if (p < this.pbound) {
                if (this.pv > this.tmaxv) {
                    this.autoAn.v = this.maxp;
                    this.autoAn.pp = p;
                    this.autoAn.endp = 1;
                    this.autoAn.endt = t + Math.round((1 - p) * this.time);
                    this.autoAn.chsl = 1;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                } else {
                    if (this.pv < -this.tmaxv) this.autoAn.v = -this.maxp;
                    else if (this.pv < -this.tminv) this.autoAn.v = this.pv / 400;
                    else if (this.pv <= 0) this.autoAn.v = -this.minp;
                    else this.autoAn.v = -this.maxp;

                    this.autoAn.pp = p;
                    this.autoAn.endp = 0;
                    this.autoAn.endt = t + Math.round(p * this.time);
                    this.autoAn.chsl = 0;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                }
            }
        } else if ((this.activeDate !== 0) && (p < 0)) {
            if (p <= -1) {
                this.prevSlide();
                return 0;
            } else if (p <= -this.pbound) {
                if (this.pv > this.tmaxv) {
                    this.autoAn.v = this.maxp;
                    this.autoAn.pp = p;
                    this.autoAn.endp = 0;
                    this.autoAn.endt = t + Math.round((-p) * this.time);
                    this.autoAn.chsl = 0;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                } else {

                    if (this.pv < -this.tmaxv) this.autoAn.v = -this.maxp;
                    else if (this.pv < -this.tminv) this.autoAn.v = this.pv / 400;
                    else this.autoAn.v = -this.minp;

                    this.autoAn.pp = p;
                    this.autoAn.endp = -1;
                    this.autoAn.endt = t + Math.round((1 + p) * this.time);
                    this.autoAn.chsl = -1;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                }
            } else if (p > -this.pbound) {
                if (this.pv < -this.tmaxv) {
                    this.autoAn.v = -this.maxp;
                    this.autoAn.pp = p;
                    this.autoAn.endp = -1;
                    this.autoAn.endt = t + Math.round((1 + p) * this.time);
                    this.autoAn.chsl = -1;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                } else {

                    if (this.pv > this.tmaxv) this.autoAn.v = this.maxp;
                    else if (this.pv > this.tminv) this.autoAn.v = this.pv / 400;
                    else this.autoAn.v = this.maxp;

                    this.autoAn.pp = p;
                    this.autoAn.endp = 0;
                    this.autoAn.endt = t + Math.round((-p) * this.time);
                    this.autoAn.chsl = 0;
                    this.autoAn.k = Math.log(this.eps / Math.abs(this.autoAn.v)) / Math.log(this.ds);
                    return 1;
                }
            }
        } else {
            this.pp = 0;
            this.animate2(0);
            this.tmlState = 0;
            return 0;
        }
    };

    TimeLine.prototype.nextSlide = function () {
        //this.activeDate += 1;

        if (!this.slides[this.activeDate + 1]) {
            this.tmlState = 0;
            return;
        }
        if (this.slides[this.activeDate + 1].sl !== this.activeSlide) {
            this.activeDate += 1;
            this.menuAuto.psl = this.activeSlide;
            this.activeSlide = this.slides[this.activeDate].sl;
            this.menuSl[this.activeSlide].img.className = "active";
            this.menuAuto.begin = this.pos;
            this.menuAuto.end = this.maxpos - this.activeSlide * 199;
            this.menuAuto.bt = Date.now();
            this.tmlState = 5;
        } else {
            this.activeDate += 1;
            this.tmlState = 0;
        }
        this.pp = 0;
        this.animate2(0);
    };
    TimeLine.prototype.prevSlide = function () {
        //this.activeDate -= 1;
        if (!this.slides[this.activeDate - 1]) {
            this.tmlState = 0;
            return;
        }
        if (this.slides[this.activeDate - 1].sl !== this.activeSlide) {
            this.activeDate -= 1;
            this.menuAuto.psl = this.activeSlide;
            this.activeSlide = this.slides[this.activeDate].sl;
            this.menuSl[this.activeSlide].img.className = "active";
            this.menuAuto.begin = this.pos;
            this.menuAuto.end = this.maxpos - this.activeSlide * 199;
            this.menuAuto.bt = Date.now();
            this.tmlState = 5;
        } else {
            this.activeDate -= 1;
            this.tmlState = 0;
        }
        this.pp = 0;
        this.animate2(0);
    };

    TimeLine.prototype.scaleimg = function () {
        var tmp = this.activeSlide;
        var tmp2 = this.delegate.scene;

        var i;

        this.menuSl[tmp].div.style[brprefix + "transform"] = bradapter.buildTranslateString(this.menuSl[tmp].xBegin - 33, 0) + ' ' + bradapter.buildScaleString(0.5, 0.5);
        bradapter.applyZIndex(this.inmenu, this.menuSl[this.activeSlide].div, 100001);
        this.menuSl[tmp].img.className = "";
        this.menuSl[tmp].shadow.style.opacity = 0;
        this.menuSl[tmp2].div.style[brprefix + "transform"] = bradapter.buildTranslateString(this.menuSl[tmp2].xBegin - 33, 0) + ' ' + bradapter.buildScaleString(0.5, 0.5);
        this.menuSl[tmp2].img.className = "";
        this.menuSl[tmp2].shadow.style.opacity = 0;

    };
// анимация в нижней области во время слайда
    TimeLine.prototype.animate = function () {
        //вычисляем параметр p
        if (this.ttmp) {
            if (this.dt !== 0) {
                this.pv = (this.tprev.x - this.ttmp.x) / this.dt;
                if (this.pv > this.maxv) {
                    this.pp += this.dt * this.maxp; //ограничение константой
                } else if (this.pv < -this.maxv) {
                    this.pp -= this.dt * this.maxp; //ограничение константой
                } else {
                    this.pp += this.dt * this.pv * this.A;
                }
            }
        }
        if (((this.activeDate === 0) && (this.pp < 0)) || ((this.activeDate === (this.slideNum - 1)) && (this.pp > 0))) this.pp = 0;
        if (this.pp > 1) this.pp = 1;
        if (this.pp < -1) this.pp = -1;

        this.animate2(this.pp);
    };

// функция анимации по конкретному значению параметра
    TimeLine.prototype.animate2 = function (p) {
        if ((p < 0) && (p >= -1) && (this.activeDate > 0)) { //обрабатываем сдвиг вправо
            this.drawTransition(this.activeDate - 1, this.activeDate, 1 + p, true);
        }
        if ((p >= 0) && (p <= 1) && (this.activeDate < this.slideNum - 1)) { //обрабатываем сдвиг влево
            this.drawTransition(this.activeDate, this.activeDate + 1, p, false);
        } else if ((p == 0) && (this.activeDate == (this.slideNum - 1)) && (this.slideNum > 1)) {
            this.drawTransition(this.activeDate - 1, this.activeDate, 1, true);
        }
    };
    TimeLine.prototype.drawTransition = function (n, m, p, reversed) { //Переписать к ебеням это говно.
        if (p < 0.5) {
            if (this.bottom.changed || this.bottom.changed === undefined) {
                this.bottom.style.backgroundImage = 'url("' + this.slides[n].arrowImg + '")';
                this.bottom.changed = false;
            }
            this.bottom.style.opacity = 1 - p * 2;
        }
        if (p >= 0.5) {
            if (!this.bottom.changed) {
                this.bottom.style.backgroundImage = 'url("' + this.slides[m].arrowImg + '")';
                this.bottom.changed = true;
            }
            this.bottom.style.opacity = (p - 0.5) * 2;
        }

        var i;
        var tp1 = (p < 0.4) ? Math.max(p / 0.4, 0.001) : 1;
        var tp2 = (p > 0.6) ? Math.min((p - 0.6) / 0.4, 0.999) : 0;

        var p1 = (p - 0.1) / 0.8;
        p1 = Math.max(Math.min(p1, 1), 0);

        this.slides[m].leftCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.col * (2 - p1)), 0);
        this.slides[n].leftCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.col * (1 - p1)), 0);

        this.slides[m].rightCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.col * (2 - p1)), 0);
        this.slides[n].rightCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.col * (1 - p1)), 0);

        this.slides[m].centerCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.cen * ( 2 - p1)), 0);
        this.slides[n].centerCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(Math.round(this.cen * (1 - p1)), 0);

        if (p >= 0.9) {
            if (this.slides[n].leftCol.parentNode) {
                this.left.removeChild(this.slides[n].leftCol);
                this.right.removeChild(this.slides[n].rightCol);
                this.center.removeChild(this.slides[n].centerCol);
            }
        } else if (this.slides[n].leftCol.parentNode == undefined) {
            this.left.appendChild(this.slides[n].leftCol);
            this.right.appendChild(this.slides[n].rightCol);
            this.center.appendChild(this.slides[n].centerCol);
            this.slides[n].centerColHeight = this.slides[n].centerCol.clientHeight;
        }
        if (p <= 0.1) {
            if (this.slides[m].leftCol.parentNode) {
                this.left.removeChild(this.slides[m].leftCol);
                this.right.removeChild(this.slides[m].rightCol);
                this.center.removeChild(this.slides[m].centerCol);
            }
        } else if (this.slides[m].leftCol.parentNode == undefined) {
            this.left.appendChild(this.slides[m].leftCol);
            this.right.appendChild(this.slides[m].rightCol);
            this.center.appendChild(this.slides[m].centerCol);
            this.slides[m].centerColHeight = this.slides[m].centerCol.clientHeight;
        }

        this.white.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, (((1 - p1) * this.slides[n].centerColHeight + p1 * this.slides[m].centerColHeight)) - this.contentHeight);
        this.center.style.height = (((1 - p1) * this.slides[n].centerColHeight + p1 * this.slides[m].centerColHeight)) + 'px';
        this.line.style.top = (((1 - p1) * this.slides[n].centerColHeight + p1 * this.slides[m].centerColHeight)) + 'px';

        // даты
        this.slides[n].pr.style.opacity = 1 - tp1;
        this.slides[m].pr.style.opacity = tp2;

        var k;
        if (n == 0) {
            if (p >= this.pEnd) {
                k = 1;
            } else if (this.pBegin >= p) {
                k = 0;
            } else {
                k = (p - this.pBegin) / (this.pEnd - this.pBegin);
            }
        }
        if (m == (this.slideNum - 1)) {
            if (p >= this.pEnd) {
                k = 1;
            } else if (this.pBegin >= p) {
                k = 0;
            } else {
                k = (p - this.pBegin) / (this.pEnd - this.pBegin);
            }
        }

        if (p == 0) {
            for (i = (this.slideNum - 1); i >= 0; i--) {
                if ((i != m) && (i != n)) {
                    this.slides[i].leftCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
                    this.slides[i].rightCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
                    this.slides[i].centerCol.style[brprefix + 'transform'] = bradapter.buildTranslateString(0, 0);
                }
            }
        }

        if ((this.activeDate == 0 && m == 1 && p != 0)) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, (1 - p) * this.leftArr.height);
        } else if ((this.activeDate != 0 && m == 1 && p != 0 )) {
            this.leftArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, (1.05 - p) * (this.leftArr.height));
        }

        if ((this.activeDate != (this.settings.dates.length - 1) && m == (this.settings.dates.length - 1) && p != 0)) {

            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, (p) * this.rightArr.height);

        } else if ((this.activeDate == (this.settings.dates.length - 1)) && m == (this.settings.dates.length - 1 ) && p != 0) {
            this.rightArr.style[brprefix + "transform"] = bradapter.buildTranslateString(0, (p) * (this.rightArr.height));

        }
    };


    TimeLine.prototype.draw = function () {


        this.dt = this.delegate.dt;
        this.pt = Date.now();
        if (this.pageSwitchDirection !== 0) {
            this.switchPageNumber();
        }
        this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(Math.round(this.pos), 0);

        if (this.tmlState == 0 || this.tmlState == -3) {
            this.delegate.removeEventListener("timer2", this.draw, this);
            return;
        }
        switch (this.tmlState) {
            case 1: // слайд контента
                if (this.changed === 1) {
                    this.animate();
                    this.changed = 0;
                }
                break;
            case 2: // автодоводка контента
                var p = this.autoAn.pp + this.autoAn.v * this.dt;

                if ((p - this.autoAn.endp) * (this.autoAn.pp - this.autoAn.endp) <= 0) { //окончание автоанимации
                    this.animate2(this.autoAn.endp);

                    switch (this.autoAn.chsl) {
                        case -1:
                            this.prevSlide();
                            break;
                        case 1:
                            this.nextSlide();
                            break;
                        case 0:
                            this.tmlState = 0;
                            this.pp = 0;
                            this.animate2(0);
                            break;
                    }

                } else { // шаг автоанимации
                    this.animate2(p);
                    this.autoAn.pp = p;
                    this.pp = p;
                    this.pv = this.autoAn.v;
                }
                break;
            case 3: // слайд меню
                if (this.changed == 1) {
                    this.slideMenu();
                    this.changed = 0;
                }
                break;
            case 4: // автодоводка меню
                var i;
                if ((Math.abs(this.menuAuto.pv) < this.eps) || ((this.menuAuto.pv > 0) && (this.menuAuto.end <= this.pos)) || ((this.menuAuto.pv < 0) && (this.menuAuto.end >= this.pos))) { // доводка закончилась
                    this.pos = this.menuAuto.end;
                    // определяем новый активный кадр и новую активную дату, заполняем информацию для анимации
                    if (this.activeSlide != this.menuAuto.targetSlide) {
                        if ((this.settings.slides[this.menuSl[this.menuAuto.targetSlide].slide].marks !== undefined) && (this.settings.slides[this.menuSl[this.menuAuto.targetSlide].slide].marks.length !== 0)) {
                            this.autoAn.bSlide = this.activeDate;
                            this.autoAn.eSlide = Array.getById(this.slides, this.settings.slides[this.menuSl[this.menuAuto.targetSlide].slide].marks[0]);
                            if (this.autoAn.bSlide == this.autoAn.eSlide) {
                                this.autoAn.bSlide = this.autoAn.eSlide = undefined;
                            }
                            this.autoAn.prevSlide = this.activeSlide;
                            this.autoAn.bt = this.pt;
                            this.activeSlide = this.menuAuto.targetSlide;
                            this.menuSl[this.activeSlide].img.className = "active";
                            this.tmlState = 6;
                        } else {
                            this.activeSlide = this.menuAuto.targetSlide;
                            this.menuSl[this.activeSlide].img.className = "active";
                            this.tmlState = 0;
                        }
                        this.pageSwitchDirection = 1;
                    } else if (this.reseted == 1) {
                        this.autoAn.bSlide = undefined;
                        this.autoAn.eSlide = undefined;
                        this.autoAn.bt = this.pt;
                        this.menuSl[this.activeSlide].img.className = "active";
                        this.tmlState = 6;
                    } else {
                        this.tmlState = 0;
                    }
                } else {

                    this.pos = this.pos + this.menuAuto.pv * this.dt;
                    this.menuAuto.pv *= this.ds;

                }
                this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(Math.round(this.pos), 0);

                // если надо, меняем размер и стили активного слайда
                for (i = (this.menuSlCnt - 1); i >= 0; i--) {
                    if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) > 178) {
                        this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(0.50, 0.50);
                        this.menuSl[i].shadow.style.opacity = 0;
                        this.menuSl[i].img.className = '';
                        bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100001);
                        this.reseted = 1;
                    } else if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 3) {
                        this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0);
                        this.menuSl[i].shadow.style.opacity = 0.999;
                        bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                    } else {
                        this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178), 1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178));
                        this.menuSl[i].shadow.style.opacity = Math.min(1 - (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178), 0.999);
                        if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 89) {
                            bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                        } else {
                            bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100001);
                        }
                    }
                }
                break;
            case 5: // перемотка меню после перехода с одного слайда на другой
                if ((this.pt - this.menuAuto.bt) >= this.trTime) {
                    this.pos = this.menuAuto.end;
                    this.menuSl[this.menuAuto.psl].img.className = '';

                    this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(this.pos, 0);

                    for (i = (this.menuSlCnt - 1); i >= 0; i--) {
                        if (i == this.activeSlide) {
                            this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0);
                            this.menuSl[i].shadow.style.opacity = 0.999;
                            bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                            this.menuSl[i].img.className = "active";
                        } else {
                            this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(0.50, 0.50);
                            this.menuSl[i].shadow.style.opacity = 0;
                            bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100001);
                        }
                    }
                    this.tmlState = 0;
                    this.pageSwitchDirection = 1;
                } else {
                    this.p = Easing.easeOutQuad(null, (this.pt - this.menuAuto.bt) / this.trTime, 0, 1, 1);
                    this.pos = (this.menuAuto.end - this.menuAuto.begin) * this.p + this.menuAuto.begin;

                    this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(this.pos, 0);

                    // если надо, меняем размер и стили слайдов
                    for (i = (this.menuSlCnt - 1); i >= 0; i--) {
                        if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) > 178) {
                            this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(0.50, 0.50);
                            this.menuSl[i].shadow.style.opacity = 0;
                            this.menuSl[i].img.className = '';
                            this.reseted = 1;
                        } else if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 3) {
                            this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0);
                            this.menuSl[i].shadow.style.opacity = 0.999;
                        } else {
                            this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178), 1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178));
                            this.menuSl[i].shadow.style.opacity = Math.min(1 - (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178), 0.999);
                            if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 89) {
                                bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                            } else {
                                bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100001);
                            }
                        }
                    }
                }
                break;
            case 6: // выделение активного кадра + перемотка на его первую дату
                if ((this.pt - this.autoAn.bt) >= this.trTime) {
                    // приводим в надлежащий вид активный кадр меню
                    this.menuSl[this.activeSlide].div.style[brprefix + "transform"] = bradapter.buildTranslateString(this.activeSlide * 199, 0);
                    this.menuSl[this.activeSlide].shadow.style.opacity = 0.999;
                    bradapter.applyZIndex(this.inmenu, this.menuSl[this.activeSlide].div, 100002);
                    if (this.autoAn.eSlide !== undefined) {
                        this.activeDate = this.autoAn.eSlide;
                        if (this.autoAn.bSlide < this.autoAn.eSlide) {
                            this.drawTransition(this.autoAn.bSlide, this.autoAn.eSlide, 1);
                        } else {
                            this.drawTransition(this.autoAn.eSlide, this.autoAn.bSlide, 0);
                        }

                    }
                    this.reseted = 0;
                    this.tmlState = 0;
                } else {
                    this.p = Easing.easeOutQuad(null, (this.pt - this.autoAn.bt) / this.trTime, 0, 1, 1);

                    if (this.autoAn.eSlide !== undefined) {
                        if (this.autoAn.bSlide < this.autoAn.eSlide) {
                            this.drawTransition(this.autoAn.bSlide, this.autoAn.eSlide, this.p);
                        } else {
                            this.drawTransition(this.autoAn.eSlide, this.autoAn.bSlide, 1 - this.p);
                        }
                    }

                }

                break;
        }
    };

// смена номера страницы
    TimeLine.prototype.switchPageNumber = function (p) {
        if (p)
            this.delegate.controlController.updatePageNumber(this.delegate.scenes[this.delegate.scene]);
        else
            this.delegate.controlController.updatePageNumber(this.delegate.scenes[this.activeSlide]);
    };

// обработка сдвига меню руками
    TimeLine.prototype.slideMenu = function () {
        var i;
        var delta = this.ttmp.x - this.tprev.x;
        this.mpv = (this.ttmp.x - this.tprev.x) / this.dt;
        //вычисляем новую позицию меню
        this.pos += delta;
        if ((this.pos > this.maxpos) || (this.pos < this.minpos)) {
            this.pos = this.pos - delta + delta / 2;

        }

        this.inmenu.style[brprefix + "transform"] = bradapter.buildTranslateString(Math.round(this.pos), 0);

        for (i = (this.menuSlCnt - 1); i >= 0; i--) {

            if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) > 178) {
                this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString(0.50, 0.50);
                this.menuSl[i].shadow.style.opacity = 0;
                this.menuSl[i].img.className = '';
                this.reseted = 1;
            } else if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 3) {
                this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0);
                this.menuSl[i].shadow.style.opacity = 0.999;
            } else {
                this.menuSl[i].div.style[brprefix + "transform"] = bradapter.buildTranslateString(i * 199, 0) + ' ' + bradapter.buildScaleString((1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178)), 1 - 0.5 * (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178));
                this.menuSl[i].shadow.style.opacity = Math.min(1 - (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) / 178), 0.999);
                if (Math.abs(this.maxpos - (this.pos + this.menuSl[i].xBegin - 33)) < 89) {
                    bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100002);
                } else {
                    bradapter.applyZIndex(this.inmenu, this.menuSl[i].div, 100001);
                }
            }
        }

    };

    return TimeLine;
});