define(["utils/Utils"], function (Utils) {

    var NTextAreaReader = Utils.newObjectType(NTextAreaReader, "NTextAreaReader");
    NTextAreaReader.prototype.init = function (description) {

        //debugger;
        this.textNode = document.createElement('div');
        this.textNode.id = 'textReader';
        var div = document.createElement('div');
        if (this.delegate._scenes[this.delegate.scene].textNode) {
            div.innerHTML = (this.delegate._scenes[this.delegate.scene].textNode);
            this.textNode.appendChild(div);
        }
        else
            this.textNode = false;
        var tag_css = document.createElement('link');
        tag_css.rel = 'stylesheet';
        tag_css.href = window.engineAdditionalURL + 'plugins/NTextAreaReader.css'; // здесь указывается URL стилевого файла
        tag_css.type = 'text/css';
        var tag_head = document.getElementsByTagName('head');
        tag_head[0].appendChild(tag_css);


        this.imagesSrc = description.settings.imagesSrc;
        this.imagesSize = description.settings.imagesSize;
        this.imagesPos = description.settings.imagesPos;

        this.TOUCH_STATE = (function () {
            var private = {
                'ZOOMING': '1',
                'SCROLLING': '2'
            };

            return {
                get: function (name) {
                    return private[name];
                }
            };
        })();

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

        // настройка размера шрифта
        this.footer = document.createElement('div');
        this.footerLine1 = document.createElement('div');
        this.footerLine2 = document.createElement('div');
        this.gripWrapper = document.createElement('div');
        this.grip = document.createElement('div');
        this.aa = document.createElement('div');
        this.share = document.createElement('div');

        this.view.appendChild(this.footerLine1);
        this.footerLine1.appendChild(this.aa);
        this.footerLine1.appendChild(this.share);

        this.view.appendChild(this.footerLine2);
        this.footerLine2.appendChild(this.gripWrapper);
        this.gripWrapper.appendChild(this.grip);

        this.footerLine1.size = this.imagesSize.footerLine1;
        this.footerLine1.style.width = this.footerLine1.size.x + "px";
        this.footerLine1.style.height = this.footerLine1.size.y + "px";
        this.footerLine1.pos = this.imagesPos.footerLine1;
        this.footerLine1.style.background = '#cccccc';
        this.footerLine1.style.position = "absolute";
        this.footerLine1.style.overflow = "visible";
        this.footerLine1.style[brprefix + "transform"] = "translate3d(" + this.footerLine1.pos.x + "px, " + this.footerLine1.pos.y + "px,0px)";

        this.footerLine2.size = this.imagesSize.footerLine2;
        this.footerLine2.style.width = this.footerLine2.size.x + "px";
        this.footerLine2.style.height = this.footerLine2.size.y + "px";
        this.footerLine2.pos = this.imagesPos.footerLine2;
        this.footerLine2.style.background = '#999999';
        this.footerLine2.style.position = "absolute";
        this.footerLine2.style.overflow = "visible";
        this.footerLine2.style[brprefix + "transform"] = "translate3d(" + this.footerLine2.pos.x + "px, " + this.footerLine2.pos.y + "px,0px)";
        this.setTextScaling = function (state) {
            this.textScaling = state;
            this.footerLine2.style.display = state ? 'block' : 'none';
        }

        this.gripWrapper.size = this.imagesSize.gripWrapper;
        this.gripWrapper.style.width = this.gripWrapper.size.x + "px";
        this.gripWrapper.style.height = this.gripWrapper.size.y + "px";
        this.gripWrapper.pos = this.imagesPos.gripWrapper;
        this.gripWrapper.style.backgroundImage = 'url("' + this.imagesSrc.gripWrapper + '")';
        this.gripWrapper.style.backgroundSize = "100% 100%";
        this.gripWrapper.style.position = "absolute";
        this.gripWrapper.style.overflow = "visible";
        this.gripWrapper.style[brprefix + "transform"] = "translate3d(" + this.gripWrapper.pos.x + "px, " + this.gripWrapper.pos.y + "px,0px)";

        this.grip.relativePos = 0;
        this.grip.minPosX = 20;
        this.grip.maxPosX = 259;

        this.grip.setPos = function (relPos) {
            this.pos = {x: this.minPosX + (this.maxPosX - this.minPosX) * this.relativePos, y: 0};
            this.style[brprefix + "transform"] = "translate3d(" + this.pos.x + "px, " + this.pos.y + "px,0px)";
        }
        this.grip.move = function (offset) {
            this.relativePos += offset / (this.maxPosX - this.minPosX);
            this.relativePos = Math.max(0, Math.min(1, this.relativePos));
            this.setPos(this.relativePos);
        }
        this.grip.size = this.imagesSize.grip;
        this.grip.style.width = this.grip.size.x + "px";
        this.grip.style.height = this.grip.size.y + "px";
        this.grip.style.backgroundImage = 'url("' + this.imagesSrc.grip + '")';
        this.grip.style.backgroundSize = "100% 100%";
        this.grip.style.position = "absolute";
        this.grip.style.overflow = "visible";
        this.grip.setPos(this.grip.relativePos);


        this.aa.size = this.imagesSize.aa;
        this.aa.style.width = this.aa.size.x + "px";
        this.aa.style.height = this.aa.size.y + "px";
        this.aa.pos = this.imagesPos.aa;
        this.aa.style.backgroundImage = 'url("' + this.imagesSrc.aa + '")';
        this.aa.style.backgroundSize = "100% 100%";
        this.aa.style.position = "absolute";
        this.aa.style.overflow = "visible";
        this.aa.style[brprefix + "transform"] = "translate3d(" + this.aa.pos.x + "px, " + this.aa.pos.y + "px,0px)";

        this.share.size = this.imagesSize.share;
        this.share.style.width = this.share.size.x + "px";
        this.share.style.height = this.share.size.y + "px";
        this.share.pos = this.imagesPos.share;
        this.share.style.backgroundImage = 'url("' + this.imagesSrc.share + '")';
        this.share.style.backgroundSize = "100% 100%";
        this.share.style.position = "absolute";
        this.share.style.overflow = "visible";
        this.share.style[brprefix + "transform"] = "translate3d(" + this.share.pos.x + "px, " + this.share.pos.y + "px,0px)";

        this.scaleFonts = function (scale, node) {
            for (var i = node.childNodes.length - 1; i >= 0; i--) {
                this.curNode = node.childNodes[i];
                if (this.curNode.style) {
                    if (!this.curNode.initedFontSize) {
                        this.curNode.initedLineHeight = window.getComputedStyle(this.curNode, null).getPropertyValue("line-height");
                        this.curNode.initedFontSize = window.getComputedStyle(this.curNode, null).getPropertyValue("font-size");
                    }

                    this.initedFontSizePx = parseInt(this.curNode.initedFontSize);
                    this.initedLineHeightPx = parseInt(this.curNode.initedLineHeight);
                    this.curNode.style.fontSize = ~~(this.initedFontSizePx * scale) + "px";
                    this.curNode.style.lineHeight = ~~(this.initedLineHeightPx * scale) + "px";

                }

                this.scaleFonts(scale, this.curNode);
            }
            ;
        }


        // текст
        this.text = document.createElement("div");
        if (this.textNode)
            this.text.appendChild(this.textNode);
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

    NTextAreaReader.prototype.load = function () {
        if (this.overflowArea === 1) {
            this.view.style.overflow = "visible";
            this.subview.style.overflow = "visible";
            this.text.style.overflow = "visible";
        }
        this.setTextScaling(false);
        if (this.delegate.scenes[this.delegate.scene].textNode) {
            this.textNode.childNodes[0].innerHTML = (this.delegate.scenes[this.delegate.scene].textNode);
        } else
            this.textNode = false;


    };

    NTextAreaReader.prototype.buildCSSStringScrollBar = function (elementDesc, zIndex) {
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

    NTextAreaReader.prototype.buildCSSStringView = function (elementDesc, zIndex) {
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


    NTextAreaReader.prototype.moveVertical = function (p) {
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

    NTextAreaReader.prototype.moveHorizontal = function (p) {
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

    NTextAreaReader.prototype.moveBoth = function (pVert, pHor) {
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


    NTextAreaReader.prototype.redraw = function () {
        if (this._subscribtions !== undefined) {
            this.fireEvent("scroll", [this, "scroll"]);
        }
        this.text.style[brprefix + 'transform'] = bradapter.buildTranslateString(this.xMove, this.yMove);
        for (var i = this.scrollbarsCount - 1; i >= 0; i--) {
            if (this.slider[i] !== undefined) this.slider[i].style[brprefix + 'transform'] = bradapter.buildTranslateString(this.xSliderMove[i], this.ySliderMove[i]);
        }
    };


    NTextAreaReader.prototype.getCoordinatesForPoint = function (e) {
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


    NTextAreaReader.prototype.panStart = function (g, obj) {
        var moveStart = g;
        // kinda hack for processing scroller gui (it turned out we can't add customHittest method in this module...)
        if (this.textScaling && this.hittestForRect({  pType: 0,
                left: this.footerLine2.pos.x + this.gripWrapper.pos.x + this.grip.pos.x - 30, // кнопка маленька, 30 - запас на тач
                top: this.footerLine2.pos.y + this.gripWrapper.pos.y + this.grip.pos.y,
                width: this.grip.size.x + 60,
                height: this.grip.size.y},
            g)) {
            this.panState = this.TOUCH_STATE.get('ZOOMING');
            this.lastX = moveStart.x;
            return true;
        } else {
            this.setTextScaling(false);
            this.panState = this.TOUCH_STATE.get('SCROLLING');
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
        }
    };

    NTextAreaReader.prototype.panMove = function (g, obj) {
        if (this.panState == this.TOUCH_STATE.get('ZOOMING')) {
            this.offset = g.x - this.lastX;
            this.grip.move(this.offset);

            this.scaleFonts(this.grip.relativePos * 2 + 1, this.subview.childNodes[0].childNodes[0].childNodes[0]);
            this.textHeight = this.subview.childNodes[0].childNodes[0].childNodes[0].clientHeight;
            this.subview.childNodes[0].style.height = this.textHeight + "px";
            this.vertParam = this.textHeight / this.viewHeight;
            this.pVert = -this.textTop / (this.textHeight - this.viewHeight);
            this.lastX = g.x;
            return true;
        } else {
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
        }
    };

    NTextAreaReader.prototype.panEnd = function (g, obj) {

        this.inert(g.speedX, g.speedY);
    };

    NTextAreaReader.prototype.tapEnd = function (g, obj) {
        if (this.hittestForRect({  pType: 0,
                left: this.footerLine1.pos.x + this.aa.pos.x - 20, // маленька кнопка. 20 - запас на тач
                top: this.footerLine1.pos.y + this.aa.pos.y,
                width: this.aa.size.x + 40,
                height: this.aa.size.y},
            g)) {
            this.setTextScaling(!this.textScaling);
            return true;
        }
        if (this.hittestForRect({  pType: 0,
                left: this.footerLine1.pos.x + this.share.pos.x - 20, // маленька кнопка. 20 - запас на тач
                top: this.footerLine1.pos.y + this.share.pos.y,
                width: this.share.size.x + 40,
                height: this.share.size.y},
            g)) {
            console.log("SHARE"); //
            return true;
        }
    };

    NTextAreaReader.prototype.inert = function (speedX, speedY) {
        this.speedX = this.delegate.timeout * speedX;
        this.speedY = this.delegate.timeout * speedY;
        if (this.animating === false) {
            this.delegate.addEventListener("timer", this.inertTimer, this);
            this.animating = true;
        }
    };

    NTextAreaReader.prototype.inertTimer = function (dt) {
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

    NTextAreaReader.prototype.moveBack = function () {
        this.currentTime = 0;
        this.endTime = 300;
        if (this.animating === false) {
            this.delegate.addEventListener("timer", this.animate, this);
            this.animating = true;
        }
    };

    NTextAreaReader.prototype.animate = function (dt) {
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

    NTextAreaReader.prototype.addSubview = function (arg) {
        if (arg.parentNode != this.text) {
            this.text.appendChild(arg);
        }
    };

    NTextAreaReader.prototype.removeSubview = function (arg) {
        if (arg.parentNode == this.text) {
            this.text.removeChild(arg);
        }
    };


    NTextAreaReader.prototype.restartStart = function (e, obj) {
        e.stopPropagation();
        return true;
    };

    NTextAreaReader.prototype.restartEnd = function (e) {
        return true;
    };


    Utils.addBehaviour('pan', 'NTextAreaReader', 'NTextAreaPan', {
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

    Utils.addBehaviour('tap', 'NTextAreaReader', 'NTextAreaTap', {
        end: function (e, obj) {
            this.tapEnd(e, obj);
        }}, false);

    return NTextAreaReader;
});



