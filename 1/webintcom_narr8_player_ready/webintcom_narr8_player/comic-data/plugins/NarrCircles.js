define(["utils/Utils"], function (Utils) {
    var NarrCircles = Utils.newObjectType(NarrCircles, "NarrCircles"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.


    NarrCircles.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        this.SnapMode = parseInt(description.snapMode);
        this.errAngle = description.err_ang;
        this.circlesSize = description.size;
        this.center = description.size / 2;

        this.randomStart = description.randomStart;

        this.allImgs = description.imgs;


    };

    NarrCircles.prototype.load = function () {
        // this.view.classList.add(description.css_selector);
        for (this.j = 0; this.j < this.allImgs.length; this.j++) {
            this.tempNode = document.createElement('div');
            this.tempNode.style.backgroundImage = 'url("' + this.allImgs[this.j].src + '")';
            this.tempNode.style.backgroundSize = "100% 100%";
            this.tempNode.style.width = this.tempNode.style.height = this.allImgs[this.j].size + "px";

            bradapter.applyZIndex(this.view, this.tempNode, this.j + 1); //images comes ordered from the editor

            // this.tempNode.err_ang = this.allImgs[this.j].err_ang;
            this.tempNode.params = {
                curAngle: this.allImgs[this.j].cur_ang,
                defAngle: this.allImgs[this.j].cur_ang,
                finAngle: this.allImgs[this.j].fin_ang,
                finAngle_next: (this.j != this.allImgs.length - 1) ? (((this.allImgs[this.j + 1].fin_ang - this.allImgs[this.j].fin_ang) + 360) % 360) : undefined,
                // finAngle_next: (i!=0) ? ((this.allImgs[this.j-1].fin_ang - this.allImgs[this.j].fin_ang)+360%360) : undefined,
                size: this.allImgs[this.j].size,
                indent: (this.circlesSize - this.allImgs[this.j].size) / 2, //indention from top left angle
            };
            if (this.randomStart)
                this.tempNode.params.curAngle = this.tempNode.params.defAngle = Math.random() * 360;

            this.tempNode.style.position = "absolute";
            this.tempNode.style[brprefix + "transform"] = "translate3d(" + this.tempNode.params.indent + "px," + this.tempNode.params.indent + "px,0px)" +
                'rotateZ(' + this.tempNode.params.curAngle + 'deg) ';

            this.tempNode.start = {};
            this.tempNode.eStart = {};
            this.tempNode.eEnd = {};

            this.tempNode.place = false;
            this.view.appendChild(this.tempNode);
        }
        this.view.place = 0;
        this.allFinished = false;
    };


    NarrCircles.prototype.unload = function () {
        delete this.tempNode;

        this.firstStart = true;
        this.deleteDomElements(this.view);
    };

    NarrCircles.prototype.deleteDomElements = function (node) {
        for (var i = node.childNodes.length - 1; i >= 0; i--) {
            this.deleteDomElements(node.childNodes[i]);
            node.removeChild(node.childNodes[i]);
        }
    }

    NarrCircles.prototype.draw = function () { // необязательно
        //this.view.innerHTML=parseInt(this.value);
        if (this.moveObj && this.moveObj.startAnim) {
            this.moveObj.style[brprefix + "transform"] = 'translate3d(' + this.moveObj.params.indent + 'px, ' + this.moveObj.params.indent + 'px, 0px) ' +
                'rotateZ(' + this.tmpAngle + 'deg) ';
            if (this.tmpAngle === this.moveObj.params.finAngle) {
                this.moveObj.params.curAngle = this.moveObj.params.finAngle;

                this.view.place++;
                this.moveObj.place = true;
                this.moveObj.params.finAngle = (this.moveObj.params.finAngle + 360) % 360; //reset for abs snapped
                this.moveObj = false;

                if (this.checkAllCircles()) {//circles complete
                    if (this.prize) {
                        this.allFinished = true;
                        this.delegate.fireEvent("performAnimation", [this.prize]);
                    }
                }
            }
            ;
        }
        ;
    };


    NarrCircles.prototype.circlesStart = function (e, obj) {
        e.stopPropagation();
        if (!obj || this.moveObj) return false;
        this.moveObj = obj;
        this.moveObj.start.ang = obj.params.curAngle; // init from editor, later
        this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        return true;
    };

    NarrCircles.prototype.circlesMove = function (e, obj) {
        e.stopPropagation();
        this.moveObj.eEnd = this.getInternalCoordinatesForPoint(e);
        // if (this.circlesSize.x < this.moveObj.eEnd.x || this.circlesSize.y < this.moveObj.eEnd.y || this.moveObj.eEnd.x < 0 || this.moveObj.eEnd.y < 0)
        //     return true;
        // else
        {
            this.x1 = this.moveObj.eEnd.x - this.center;
            this.y1 = -(this.moveObj.eEnd.y - this.center);
            this.angEnd = Math.acos(this.y1 / (Math.sqrt(this.x1 * this.x1 + this.y1 * this.y1) + 0.01)) * 180 / Math.PI;

            this.x2 = this.moveObj.eStart.x - this.center;
            this.y2 = -(this.moveObj.eStart.y - this.center);
            this.angStart = Math.acos(this.y2 / (Math.sqrt(this.x2 * this.x2 + this.y2 * this.y2) + 0.01)) * 180 / Math.PI;

            if (this.x1 > 0)
                this.moveObj.start.ang += this.angEnd - this.angStart;
            else
                this.moveObj.start.ang -= this.angEnd - this.angStart;

            this.moveObj.style[brprefix + "transform"] = 'translate3d(' + this.moveObj.params.indent + 'px, ' + this.moveObj.params.indent + 'px, 0px) ' +
                'rotateZ(' + this.moveObj.start.ang + 'deg) ';

            this.moveObj.params.curAngle = (this.moveObj.start.ang + 360) % 360;
            this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
        }
    };

    NarrCircles.prototype.circlesEnd = function (e) {
        e.stopPropagation();
        if (!this.moveObj) return false;

        if (this.checkAng()) {
            this.moveObj.startAnim = true;
            this.tmpAngle = this.moveObj.params.curAngle;
            this.animateTo("tmpAngle", this.moveObj.params.finAngle, 350, 'easeOutCubic');
        }
        else
            this.moveObj = false;
    };

    NarrCircles.prototype.checkAng = function () {
        if (!this.moveObj) return false;

        switch (this.SnapMode) {
            case 0/*free*/
            :
                return false;

            case 1/*abs*/
            :
                this.diff = (this.moveObj.params.finAngle - this.moveObj.params.curAngle + 360) % 360;
                if (this.diff > 180)
                    this.diff = (Math.abs(this.diff - 360)); // 0 % 180

                if (this.diff < this.errAngle) {
                    if (this.moveObj.params.finAngle - this.moveObj.params.curAngle > 180)
                        this.moveObj.params.finAngle = (this.moveObj.params.finAngle - 360);
                    if (this.moveObj.params.finAngle - this.moveObj.params.curAngle < -180)
                        this.moveObj.params.finAngle = (this.moveObj.params.finAngle + 360);

                    return true;
                }
                return false;

            case 2/*rel*/
            :
// наверное тут можно сделать и попрощще...
                for (this.i = 0; this.i < this.view.childNodes.length; this.i++) {
                    if (this.view.childNodes[this.i] == this.moveObj) {
// у каждого круга изначально рассчитан угол относительно другого. 
// Проверяем предыдуший и текущий, затем текущий и следующий, привязываемя в первому совпавшему
                        this.tempCirc = [this.view.childNodes[this.i - 1], this.view.childNodes[this.i + 1]];
                        for (j = 0; j < 2; j++) {
                            if (this.tempCirc[j] == undefined)
                                continue;

                            this.curNode;
                            this.compareTo;
                            if (this.tempCirc[j] == this.view.childNodes[this.i - 1]) {
                                this.curNode = this.view.childNodes[this.i - 1];
                                this.compareTo = this.view.childNodes[this.i];
                            }
                            else {
                                this.curNode = this.view.childNodes[this.i];
                                this.compareTo = this.view.childNodes[this.i + 1];
                            }

                            this.difference = this.compareTo.params.curAngle - this.curNode.params.curAngle; // -360 % 360
                            this.difference = (this.difference + 360) % 360; // 0 % 360

                            this.error = this.difference - this.curNode.params.finAngle_next; // -360 % 360
                            this.error = ((this.error) + 360) % 360; // 0 % 360
                            if (this.error > 180)
                                this.error = (Math.abs(this.error - 360)); // 0 % 180

                            if (this.error < this.errAngle) {
                                if (this.tempCirc[j] == this.view.childNodes[this.i - 1])
                                    this.view.childNodes[this.i].params.finAngle = (this.curNode.params.curAngle + this.curNode.params.finAngle_next);
                                else
                                    this.view.childNodes[this.i].params.finAngle = this.compareTo.params.curAngle - this.curNode.params.finAngle_next;

                                this.view.childNodes[this.i].params.finAngle = (this.view.childNodes[this.i].params.finAngle + 360) % 360;
                                // для корректной работы анимации, иначе она начнет прокручивать круг по длинной дуге
                                if (this.view.childNodes[this.i].params.finAngle - this.view.childNodes[this.i].params.curAngle > 180)
                                    this.view.childNodes[this.i].params.finAngle = (this.view.childNodes[this.i].params.finAngle - 360);
                                if (this.view.childNodes[this.i].params.finAngle - this.view.childNodes[this.i].params.curAngle < -180)
                                    this.view.childNodes[this.i].params.finAngle = (this.view.childNodes[this.i].params.finAngle + 360);

                                return true;
                            }
                        }
                    }
                }
                return false;
        }
    };
    NarrCircles.prototype.checkAllCircles = function () {
        switch (this.SnapMode) {
            case 0/*free*/
            :
                return false;
            case 1/*abs*/
            :
                return this.view.place == this.view.childNodes.length;
            case 2/*rel*/
            :
                for (this.i = 0; this.i < this.view.childNodes.length - 1; this.i++) {
                    // вообще это не нужно (если не нужно можно удалить)
                    // if (!this.view.childNodes[i].place) //проверка что круг не двигался (против ложного срабатывания при совпадении на старте)
                    //     return false;
                    if (((this.view.childNodes[this.i + 1].params.curAngle - this.view.childNodes[this.i].params.curAngle) + 360) % 360 != this.view.childNodes[this.i].params.finAngle_next)
                        return false;
                }
                return true;
        }
    };

    NarrCircles.prototype.customHittest = function (e, gesture) {
        if (this.allFinished)
            return;
        if (gesture == 'NarrCirclesPan') {
            // reversed, high z-indexes first
            for (this.i = this.view.childNodes.length - 1; this.i >= 0; this.i--) {
                if (this.hittestForCircle({pType: 0, left: this.view.childNodes[this.i].params.indent,
                    top: this.view.childNodes[this.i].params.indent, radius: this.view.childNodes[this.i].params.size / 2 }, e)) {
                    if (!(this.view.childNodes[this.i].place && this.SnapMode == 1/*abs*/))
                        return this.view.childNodes[this.i];
                    else
                        return false;
                }
            }
        }
        else
            return false;
    };

// Проверка попадания курсора в круг
// area.radius радиус
// area.top, area.left аналогично hittestForRect
    NarrCircles.prototype.hittestForCircle = function (area, e) {
        //преобразования координат так, чтобы прямоугольник был недеформирован и лежал в точке (0, 0)
        this.t = this.getInternalCoordinatesForPoint(e);
        this.xVec = this.t.x - area.radius - area.top;
        this.yVec = this.t.y - area.radius - area.left;

        if (area.visible == undefined) area.visible = 0;
        // проверка попадания (в зависимости от типа задания параметров)
        return (
            (((area.visible === 1) && (t.visible)) || (area.visible !== 1)) &&
            (
                ((area.entireObj) &&
                    (0 <= this.t.x) &&
                    (this.t.x <= this.w) &&
                    (0 <= this.t.y) &&
                    (this.t.y <= this.h)
                    ) ||
                ((!area.entireObj) &&
                    (area.radius * area.radius >= (this.xVec * this.xVec + this.yVec * this.yVec) )
                    )
                )
            );
    };


    Utils.addBehaviour('pan', 'NarrCircles', 'NarrCirclesPan', {start: function (e, obj) {
        return this.circlesStart(e, obj);
    }, move: function (e, obj) {
        this.circlesMove(e, obj);
    }, swipe: function (e) {
        e.stopPropagation();
        return false;
    }, end: function (e) {
        this.circlesEnd(e);
    }}, false);

    return NarrCircles;
});