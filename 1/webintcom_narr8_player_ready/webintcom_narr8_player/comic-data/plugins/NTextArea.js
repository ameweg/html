define(["utils/Utils"], function (Utils) {

    var NTextArea = Utils.newObjectType(NTextArea, "NTextArea");
    NTextArea.prototype.init = function (description) {
        var i;
        switch (description.type) {
            case 0:
                this.orient = "vertical";
                this.move = this.moveVertical;
                break;
            case 1:
                this.orient = "horizontal";
                this.move = this.moveHorizontal;
                break;
            case 2:
                this.orient = "both";
                this.move = this.moveBoth;
                break;
        }

        if (description.scrollbars !== undefined) {
            // скроллбары
            this.scrollbarsCount = description.scrollbars.length;
            this.scrollbarDiv = [];
            this.underArrowForward = [];
            this.arrowForward = [];
            this.underArrowBack = [];
            this.arrowBack = [];
            this.line = [];
            this.slider = [];
            this.sliderStart = [];
            this.sliderEnd = [];
            this.xSliderMove = [];
            this.ySliderMove = [];
            this.sliderType = [];
        }
        else this.scrollbarsCount = 0;

        this.pVert = 0;
        this.pHor = 0;
        this.animating = false;
        this.overflowArea = description.overflow || 0;
        this.friction = description.friction || 0;
        if (this.friction > 0.97) this.friction = 0.97;
        if (this.friction < 0) this.friction = 0;
        this.scrollLimitX = (((description.scrollLimit === undefined) || (description.scrollLimit.x === undefined)) ? 1 : description.scrollLimit.x);
        this.scrollLimitY = (((description.scrollLimit === undefined) || (description.scrollLimit.y === undefined)) ? 1 : description.scrollLimit.y);
        this.description = description;
        for (i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (description.scrollbars[i].slider !== undefined) {
                this.sliderStart[i] = parseFloat(description.scrollbars[i].slider.start);
                this.sliderEnd[i] = parseFloat(description.scrollbars[i].slider.end);
                this.xSliderMove[i] = 0;
                this.ySliderMove[i] = 0;
                if (description.scrollbars[i].type === 0) {
                    this.sliderType[i] = "vertical";
                } else {
                    this.sliderType[i] = "horizontal";
                }
            }
        }

        this.textTop = parseFloat(description.text.y) || 0;
        this.textLeft = parseFloat(description.text.x) || 0;
        this.textHeight = parseFloat(description.text.h);
        this.textWidth = parseFloat(description.text.w);
        this.moveStartX = undefined;
        this.moveStartY = undefined;
        if (window.innerWidth != undefined) {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
        } else {
            this.windowWidth = window.eWidth;
            this.windowHeight = window.eHeight;

        }
        this.viewHeight = parseFloat(this.height);
        this.viewWidth = parseFloat(this.width);
        this.vertParam = this.textHeight / this.viewHeight;
        this.horParam = this.textWidth / this.viewWidth;

        // Вводим дополнительный слой для маски
        this.subview = document.createElement("div");
        this.subview.style.cssText = "position: absolute;" +
            "z-index: 0;" +
            "overflow: hidden;" +
            "width: " + this.viewWidth + "px;" +
            "height: " + this.viewHeight + "px;" +
            "top: 0;" +
            "left: 0;";
        this.view.appendChild(this.subview);

        // Создание скроллбаров

        for (i = this.scrollbarsCount - 1; i >= 0; i--) {
            // Див под скроллбар
            this.scrollbarDiv[i] = document.createElement("div");
            this.scrollbarDiv[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i], 2);
            this.view.appendChild(this.scrollbarDiv[i]);
            // верхняя подложка под стрелку
            if (description.scrollbars[i].underarrow_forward !== undefined) {
                this.underArrowForward[i] = document.createElement("div");
                this.underArrowForward[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i].underarrow_forward, 2);
                this.scrollbarDiv[i].appendChild(this.underArrowForward[i]);
            }
            // нижняя подложка под стрелку
            if (description.scrollbars[i].arrow_forward !== undefined) {
                this.arrowForward[i] = document.createElement("div");
                this.arrowForward[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i].arrow_forward, 4);
                this.scrollbarDiv[i].appendChild(this.arrowForward[i]);
            }
            // полоса скроллбара
            if (description.scrollbars[i].line !== undefined) {
                this.line[i] = document.createElement("div");
                this.line[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i].line, 3);
                this.scrollbarDiv[i].appendChild(this.line[i]);
            }
            // верхняя стрелка
            if (description.scrollbars[i].underarrow_back !== undefined) {
                this.underArrowBack[i] = document.createElement("div");
                this.underArrowBack[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i].underarrow_back, 2);
                this.scrollbarDiv[i].appendChild(this.underArrowBack[i]);
            }
            // нижняя стрелка
            if (description.scrollbars[i].arrow_back !== undefined) {
                this.arrowBack[i] = document.createElement("div");
                this.arrowBack[i].style.cssText = this.buildCSSStringScrollBar(description.scrollbars[i].arrow_back, 4);
                this.scrollbarDiv[i].appendChild(this.arrowBack[i]);
            }
            // ползунок
            if (description.scrollbars[i].slider !== undefined) {
                this.slider[i] = document.createElement("div");
                if (description.scrollbars[i].type === 0) {
                    this.slider[i].style.cssText = "position: absolute;" +
                        "z-index: 10;" +
                        "overflow: hidden;" +
                        "background-size: 100% 100%;" +
                        "background-image: url(" + description.scrollbars[i].slider.src + ");" +
                        "width: " + description.scrollbars[i].slider.w + "px;" +
                        "height: " + description.scrollbars[i].slider.h + "px;" +
                        "top: " + description.scrollbars[i].slider.start + "px;" +
                        "left: " + description.scrollbars[i].slider.offset + "px;";
                } else if (description.scrollbars[i].type === 1) {
                    this.slider[i].style.cssText = "position: absolute;" +
                        "z-index: 10;" +
                        "overflow: hidden;" +
                        "background-size: 100% 100%;" +
                        "background-image: url(" + description.scrollbars[i].slider.src + ");" +
                        "width: " + description.scrollbars[i].slider.w + "px;" +
                        "height: " + description.scrollbars[i].slider.h + "px;" +
                        "top: " + description.scrollbars[i].slider.offset + "px;" +
                        "left: " + description.scrollbars[i].slider.start + "px;";
                }
                this.scrollbarDiv[i].appendChild(this.slider[i]);
            } else {
                this.slider[i] = undefined;
            }
        }
        // текст
        this.text = document.createElement("div");
        if (description.text.x === undefined) description.text.x = 0;
        if (description.text.y === undefined) description.text.y = 0;
        this.text.style.cssText = this.buildCSSStringView(description.text, 1);
        this.subview.appendChild(this.text);
        if (this.description.text.content !== undefined) {
            this.text.innerHTML = this.description.text.content;
        }

        if (navigator.userAgent.toLowerCase().search("android") <= -1) {
            var maskImageString = "";
            var maskSizeString = "";
            var maskPositionString = "";
            var maskRepeatString = "";
            var counter = 0;
            var l = 0, t = 0, w = this.viewWidth, h = this.viewHeight;
            if (description.fade_top !== undefined) {
                maskImageString += "url(" + description.fade_top.src + ")";
                if (description.fade_top.w === undefined) {
                    maskSizeString += "auto " + description.fade_top.size + "px";
                    t += description.fade_top.size;
                    h -= description.fade_top.size;
                } else {
                    maskSizeString += description.fade_top.w + "px " + description.fade_top.h + "px;";
                    t += description.fade_top.h;
                    h -= description.fade_top.h;
                }
                maskPositionString += "top";
                maskRepeatString += "repeat no-repeat";
                counter++;
            }

            if (description.fade_bottom !== undefined) {
                if (counter !== 0) {
                    maskImageString += ", ";
                    maskSizeString += ", ";
                    maskPositionString += ", ";
                    maskRepeatString += ", ";
                }
                maskImageString += "url(" + description.fade_bottom.src + ")";

                if (description.fade_bottom.w === undefined) {
                    maskSizeString += "auto " + description.fade_bottom.size + "px";
                    h -= description.fade_bottom.size;
                } else {
                    maskSizeString += description.fade_bottom.w + "px " + description.fade_bottom.h + "px;";
                    h -= description.fade_bottom.h;
                }
                maskPositionString += "bottom";
                maskRepeatString += "repeat no-repeat";
                counter++;
            }

            if (description.fade_left !== undefined) {
                if (counter !== 0) {
                    maskImageString += ", ";
                    maskSizeString += ", ";
                    maskPositionString += ", ";
                    maskRepeatString += ", ";
                }
                maskImageString += "url(" + description.fade_left.src + ")";

                if (description.fade_left.w === undefined) {
                    maskSizeString += description.fade_left.size + "px auto";
                    l += description.fade_left.size;
                    w -= description.fade_left.size;
                } else {
                    maskSizeString += description.fade_left.w + "px " + description.fade_left.h + "px;";
                    l += description.fade_left.w;
                    w -= description.fade_left.w;
                }
                maskPositionString += "left";
                maskRepeatString += "no-repeat repeat";
                counter++;
            }


            if (description.fade_right !== undefined) {
                if (counter !== 0) {
                    maskImageString += ", ";
                    maskSizeString += ", ";
                    maskPositionString += ", ";
                    maskRepeatString += ", ";
                }
                maskImageString += "url(" + description.fade_right.src + ")";

                if (description.fade_right.w === undefined) {
                    maskSizeString += description.fade_right.size + "px auto";
                    w -= description.fade_right.size;
                } else {
                    maskSizeString += description.fade_right.w + "px " + description.fade_right.h + "px;";
                    w -= description.fade_right.w;
                }
                maskPositionString += "right";
                maskRepeatString += "no-repeat repeat";
                counter++;
            }

            if (counter !== 0) {
                this.subview.style[brprefix + 'mask-image'] = maskImageString + ", url(" + window.engineAdditionalURL + "utils/img/black.png)";
                this.subview.style[brprefix + 'mask-repeat'] = maskRepeatString + ", no-repeat";
                this.subview.style[brprefix + 'mask-position'] = maskPositionString + ", " + l + "px " + t + "px";
                this.subview.style[brprefix + 'mask-size'] = maskSizeString + ", " + w + "px " + h + "px";
            }
        }

        this.xMove = 0;
        this.yMove = 0;

        // рассчет р (Внимание! стартовое р должно попадать в [0,1])
        switch (description.type) {
            case 0:
                this.pVert = -this.textTop / (this.textHeight - this.viewHeight);
                this.text.style.top = "0px";
                this.textTop = 0;
                this.move(this.pVert);
                break;
            case 1:
                this.pHor = -this.textLeft / (this.textWidth - this.viewWidth);
                this.text.style.left = "0px";
                this.textLeft = 0;
                this.move(this.pHor);
                break;
            case 2:
                this.pVert = -this.textTop / (this.textHeight - this.viewHeight);
                this.pHor = -this.textLeft / (this.textWidth - this.viewWidth);
                this.text.style.top = "0px";
                this.textLeft = 0;
                this.text.style.left = "0px";
                this.textTop = 0;
                this.move(this.pVert, this.pHor);
                break;
        }
    };

    NTextArea.prototype.load = function () {
        if (this.overflowArea === 1) {
            this.view.style.overflow = "visible";
            this.subview.style.overflow = "visible";
            this.text.style.overflow = "visible";
        }
    };

    NTextArea.prototype.buildCSSStringScrollBar = function (elementDesc, zIndex) {
        return (
            "position: absolute;" +
            "z-index:" + zIndex + ";" +
            "overflow: hidden;" +
            "background-size: " + ((elementDesc.img_w === undefined) ? "100% 100%;" : (elementDesc.img_w + "px " + elementDesc.img_h + "px;")) +
            "background-repeat: repeat;" +
            (( elementDesc.src != undefined ) ? "background-image: url(" + elementDesc.src + ");" : "") +
            "width: " + elementDesc.w + "px;" +
            "height: " + elementDesc.h + "px;" +
            "top:" + elementDesc.y + "px;" +
            "left:" + elementDesc.x + "px;"
            );
    };

    NTextArea.prototype.buildCSSStringView = function (elementDesc, zIndex) {
        return (
            "position: absolute;" +
            "z-index:" + zIndex + ";" +
            "overflow: hidden;" +
            "background-size: 100% 100%;" +
            (( elementDesc.src != undefined ) ? "background-image: url(" + elementDesc.src + ");" : "") +
            "width: " + elementDesc.w + "px;" +
            "height: " + elementDesc.h + "px;" +
            "top: " + elementDesc.y + "px;" +
            "left: " + elementDesc.x + "px;"
            );
    };


    NTextArea.prototype.moveVertical = function (p) {
        var a = p;
        //позиционирование окна
        if (p < 0) {
            if (this.vertParam < 2) {
                this.yMove = -Math.round(this.scrollLimitY * p * (this.textHeight - this.viewHeight) / (this.windowHeight / this.viewHeight))
            } else {
                this.yMove = Math.round(this.scrollLimitY * (1 - Math.exp((1.5 * this.textHeight * p) / (this.windowHeight))) * this.viewHeight);
            }
        }
        if (p > 1) {
            if (this.vertParam < 2) {
                this.yMove = Math.round(-this.textHeight + this.viewHeight + this.scrollLimitY * (1 - p) * (this.textHeight - this.viewHeight) / (this.windowHeight / this.viewHeight));
            } else {
                this.yMove = Math.round(-this.textHeight + (1 - this.scrollLimitY * (1 - Math.exp((1.5 * this.textHeight * (1 - p)) / (this.windowHeight)))) * this.viewHeight);
            }
        }
        if (p >= 0 && p <= 1) {
            this.yMove = Math.round(-p * (this.textHeight - this.viewHeight));
        }

        //позиционирование скролла
        if (a > 1) {
            a = 1;
        } else if (a < 0) {
            a = 0;
        }
        for (var i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (this.slider[i] !== undefined) this.ySliderMove[i] = Math.round(a * (this.sliderEnd[i] - this.sliderStart[i]));
        }
        this.redraw();
    };

    NTextArea.prototype.moveHorizontal = function (p) {
        var a = p;
        if (p < 0) {
            if (this.horParam < 2) {
                this.xMove = -Math.round(this.scrollLimitX * p * (this.textWidth - this.viewWidth) / (this.windowWidth / this.viewWidth))
            } else {
                this.xMove = Math.round(this.scrollLimitX * (1 - Math.exp((1.5 * this.textWidth * p) / (this.windowWidth))) * this.viewWidth);
            }
        }
        if (p > 1) {
            if (this.horParam < 2) {
                this.xMove = Math.round(-this.textWidth + this.viewWidth + this.scrollLimitX * (1 - p) * (this.textWidth - this.viewWidth) / (this.windowWidth / this.viewWidth));
            } else {
                this.xMove = Math.round(-this.textWidth + (1 - this.scrollLimitX * (1 - Math.exp((1.5 * this.textWidth * (1 - p)) / (this.windowWidth)))) * this.viewWidth);
            }
        }
        if (p >= 0 && p <= 1) {
            this.xMove = Math.round(-p * (this.textWidth - this.viewWidth));
        }

        //позиционирование скролла
        if (a > 1) {
            a = 1;
        } else if (a < 0) {
            a = 0;
        }
        for (var i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (this.slider[i] !== undefined) this.xSliderMove[i] = Math.round(a * (this.sliderEnd[i] - this.sliderStart[i]));
        }
        this.redraw();
    };

    NTextArea.prototype.moveBoth = function (pVert, pHor) {
        var a = pVert;
        var b = pHor;
        if (pVert < 0) {
            if (this.vertParam < 2) {
                this.yMove = -Math.round(this.scrollLimitY * pVert * (this.textHeight - this.viewHeight) / (this.windowHeight / this.viewHeight))
            } else {
                this.yMove = Math.round(this.scrollLimitY * (1 - Math.exp((1.5 * this.textHeight * pVert) / (this.windowHeight))) * this.viewHeight);
            }
        }
        if (pVert > 1) {
            if (this.vertParam < 2) {
                this.yMove = Math.round(-this.textHeight + this.viewHeight + this.scrollLimitY * (1 - pVert) * (this.textHeight - this.viewHeight) / (this.windowHeight / this.viewHeight));
            } else {
                this.yMove = Math.round(-this.textHeight + (1 - this.scrollLimitY * (1 - Math.exp((1.5 * this.textHeight * (1 - pVert)) / (this.windowHeight)))) * this.viewHeight);
            }
        }
        if (pVert >= 0 && pVert <= 1) {
            this.yMove = Math.round(-pVert * (this.textHeight - this.viewHeight));
        }

        if (pHor < 0) {
            if (this.horParam < 2) {
                this.xMove = -Math.round(this.scrollLimitX * pHor * (this.textWidth - this.viewWidth) / (this.windowWidth / this.viewWidth))
            } else {
                this.xMove = Math.round(this.scrollLimitX * (1 - Math.exp((1.5 * this.textWidth * pHor) / (this.windowWidth))) * this.viewWidth);
            }
        }
        if (pHor > 1) {
            if (this.horParam < 2) {
                this.xMove = Math.round(-this.textWidth + this.viewWidth + this.scrollLimitX * (1 - pHor) * (this.textWidth - this.viewWidth) / (this.windowWidth / this.viewWidth));
            } else {
                this.xMove = Math.round(-this.textWidth + (1 - this.scrollLimitX * (1 - Math.exp((1.5 * this.textWidth * (1 - pHor)) / (this.windowWidth)))) * this.viewWidth);
            }
        }
        if (pHor >= 0 && pHor <= 1) {
            this.xMove = Math.round(-pHor * (this.textWidth - this.viewWidth));
        }


        if (a > 1) {
            a = 1;
        } else if (a < 0) {
            a = 0;
        }
        if (b > 1) {
            b = 1;
        } else if (b < 0) {
            b = 0;
        }
        for (var i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (this.slider[i] !== undefined) {
                if (this.sliderType[i] === "vertical") {
                    this.ySliderMove[i] = Math.round(a * (this.sliderEnd[i] - this.sliderStart[i]));
                } else {
                    this.xSliderMove[i] = Math.round(b * (this.sliderEnd[i] - this.sliderStart[i]));
                }
            }
        }
        this.redraw();
    };


    NTextArea.prototype.redraw = function () {
        if (this._subscribtions !== undefined) {
            this.fireEvent("scroll", [this, "scroll"]);
        }
        this.text.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.xMove, this.yMove);
        for (var i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (this.slider[i] !== undefined) this.slider[i].style[brprefix + 'transform'] = bradapter.buildTranslateString(this.xSliderMove[i], this.ySliderMove[i]);
        }
    };


    NTextArea.prototype.getCoordinatesForPoint = function (e) {
        this.countViewCoordinatesForPoint(e);
        var x = this.sX;
        var y = this.sY;
        var result = {
            x: undefined,
            y: undefined,
            visible: this._lastCountedPoint.visible
        };
        result.x = this._lastCountedPoint.x + x - this.xMove - this.textLeft;
        result.y = this._lastCountedPoint.y + y - this.yMove - this.textTop;
        return result;
    };


    NTextArea.prototype.panStart = function (g, obj) {
//    var moveStart = this.getViewCoordinatesForPoint(g);
        var moveStart = g;
        if (this.animating === true) {
            this.delegate.removeEventListener("timer", this.animate, this);
            this.delegate.removeEventListener("timer", this.inertTimer, this);
            this.animating = false;
        }
        this.moveStartX = moveStart.x;
        this.moveStartY = moveStart.y;
        this.staticX = this.pHor;
        this.staticY = this.pVert;
        return true;
    };

    NTextArea.prototype.panMove = function (g, obj) {
        if (this.orient === "vertical") {
            this.pVert = this.staticY - ((g.y - this.moveStartY)) / (this.textHeight - this.viewHeight);
            this.move(this.pVert);
        } else if (this.orient === "horizontal") {
            this.pHor = this.staticX - ((g.x - this.moveStartX)) / (this.textWidth - this.viewWidth);
            this.move(this.pHor);
        } else if (this.orient === "both") {
            this.pVert = this.staticY - ((g.y - this.moveStartY)) / (this.textHeight - this.viewHeight);
            this.pHor = this.staticX - ((g.x - this.moveStartX)) / (this.textWidth - this.viewWidth);
            this.move(this.pVert, this.pHor);
        }
    };

    NTextArea.prototype.panEnd = function (g, obj) {
        this.inert(g.speedX, g.speedY);
    };

    NTextArea.prototype.inert = function (speedX, speedY) {
        this.speedX = this.delegate.timeout * speedX;
        this.speedY = this.delegate.timeout * speedY;
        if (this.animating === false) {
            this.delegate.addEventListener("timer", this.inertTimer, this);
            this.animating = true;
        }
    };

    NTextArea.prototype.inertTimer = function (dt) {
        if (Math.abs(this.speedX) > 1 || Math.abs(this.speedY) > 1) {
            this.speedX = this.speedX * this.friction;
            this.speedY = this.speedY * this.friction;
            this.pVert = this.pVert - this.speedY / (this.textHeight - this.viewHeight);
            this.pHor = this.pHor - this.speedX / (this.textWidth - this.viewWidth);
            switch (this.orient) {
                case "vertical" :
                    this.move(this.pVert);
                    break;
                case "horizontal":
                    this.move(this.pHor);
                    break;
                case "both":
                    this.move(this.pVert, this.pHor);
                    break;
            }
            if (this.pVert > 1 || this.pVert < 0) {
                this.speedY = this.speedY * this.friction;
            }
            if (this.pHor > 1 || this.pHor < 0) {
                this.speedX = this.speedX * this.friction;
            }
        } else {
            if (this.animating === true) {
                this.delegate.removeEventListener("timer", this.inertTimer, this);
                this.animating = false;
                if (this.orient == "vertical") {
                    if ((this.pVert < 0) || (this.pVert > 1)) {
                        this.parametrVert = this.pVert;
                        this.moveBack();
                    }
                } else if (this.orient == "horizontal") {
                    if ((this.pHor < 0) || (this.pHor > 1)) {
                        this.parametrHor = this.pHor;
                        this.moveBack();
                    }
                } else if (this.orient === "both") {
                    if ((this.pVert < 0) || (this.pVert > 1)) {
                        this.parametrVert = this.pVert;
                        this.moveBack();
                    }
                    if ((this.pHor < 0) || (this.pHor > 1)) {
                        this.parametrHor = this.pHor;
                        this.moveBack();
                    }
                }
            }
        }
    };

    NTextArea.prototype.moveBack = function () {
        this.currentTime = 0;
        this.endTime = 300;
        if (this.animating === false) {
            this.delegate.addEventListener("timer", this.animate, this);
            this.animating = true;
        }
    };

    NTextArea.prototype.animate = function (dt) {
        this.currentTime += dt;
        switch (this.orient) {
            case "vertical":
                if (this.currentTime >= this.endTime) {
                    this.currentTime = this.endTime;
                    if (this.pVert < 0.5) {
                        this.pVert = 0;
                    }
                    if (this.pVert > 0.5) {
                        this.pVert = 1;
                    }
                    this.move(this.pVert);
                    this.delegate.removeEventListener("timer", this.animate, this);
                }
                if (this.pVert < 0) {
                    this.pVert = this.parametrVert * (this.endTime - this.currentTime) / this.endTime;
                }
                if (this.pVert > 1) {
                    this.pVert = 1 + (this.parametrVert - 1) * (this.endTime - this.currentTime) / this.endTime;
                }
                this.move(this.pVert);
                break;
            case "horizontal":
                if (this.currentTime >= this.endTime) {
                    this.currentTime = this.endTime;
                    if (this.pHor < 0.5) {
                        this.pHor = 0;
                    }
                    if (this.pHor > 0.5) {
                        this.pHor = 1;
                    }
                    this.move(this.pHor);
                    this.delegate.removeEventListener("timer", this.animate, this);
                }
                if (this.pHor < 0) {
                    this.pHor = this.parametrHor * (this.endTime - this.currentTime) / this.endTime;
                }
                if (this.pHor > 1) {
                    this.pHor = 1 + (this.parametrHor - 1) * (this.endTime - this.currentTime) / this.endTime;
                }
                this.move(this.pHor);
                break;
            case "both":
                if (this.currentTime >= this.endTime) {
                    this.currentTime = this.endTime;
                    if (this.pHor <= 0) {
                        this.pHor = 0;
                    }
                    if (this.pHor >= 1) {
                        this.pHor = 1;
                    }
                    if (this.pVert <= 0) {
                        this.pVert = 0;
                    }
                    if (this.pVert >= 1) {
                        this.pVert = 1;
                    }
                    this.move(this.pVert, this.pHor);
                    this.delegate.removeEventListener("timer", this.animate, this);
                }
                if (this.pVert < 0) {
                    this.pVert = this.parametrVert * (this.endTime - this.currentTime) / this.endTime;
                }
                if (this.pVert > 1) {
                    this.pVert = 1 + (this.parametrVert - 1) * (this.endTime - this.currentTime) / this.endTime;
                }

                if (this.pHor < 0) {
                    this.pHor = this.parametrHor * (this.endTime - this.currentTime) / this.endTime;
                }
                if (this.pHor > 1) {
                    this.pHor = 1 + (this.parametrHor - 1) * (this.endTime - this.currentTime) / this.endTime;
                }
                this.move(this.pVert, this.pHor);
                break;
        }
    };

    NTextArea.prototype.addSubview = function (arg) {
        if (arg.parentNode != this.text) {
            this.text.appendChild(arg);
        }
    };

    NTextArea.prototype.removeSubview = function (arg) {
        if (arg.parentNode == this.text) {
            this.text.removeChild(arg);
        }
    };

    Utils.addBehaviour('pan', 'NTextArea', 'NTextAreaPan', {
        start: function (g, obj) {
            return this.panStart(g, obj);
        },
        move: function (g, obj) {
            this.panMove(g, obj);
        },
        swipe: function (g, obj) {
            g.stopPropagation();
        },
        end: function (g, obj) {
            this.panEnd(g, obj);
        }
    }, false);

    return NTextArea
});