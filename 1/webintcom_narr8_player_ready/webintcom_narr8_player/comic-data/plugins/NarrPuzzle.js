define(["utils/Utils", "plugins/skiner"], function (Utils, skin) {

    /**
     * Класс плагина NarrPuzzle
     * @class NarrPuzzle
     */
    var NarrPuzzle = Utils.newObjectType(NarrPuzzle, "NarrPuzzle");

    /**
     * Инициализация модуля
     * @param {Object} description
     */
    NarrPuzzle.prototype.init = function (description) {
        this.prize = this.prize || false;
        this.firstStart = true;
        
        if("stickers" in description){
        	this.puzzleImgSize = description.stickers.size;
        	this.puzzleImgPos = description.stickers.pos;
        }
        
        this.puzzleEnable = false;
        this.resizePuzzle = description.resize || 0.4;
        this.positionPuzzle = description.puzzlePosition || [0, 0, 0, 0];
        this.puzzleBox = [];
        this.realPieces = 0;
        this.puzzleRunBack = description.runBack;
        this.docWidth = parseInt(document.getElementById("elements").style.width);
        this.docHeight = parseInt(document.getElementById("elements").style.height);
        this.puzzleSize = description.size;
        this.puzzleSize.x = Math.floor(this.puzzleSize.x);
        this.puzzleSize.y = Math.floor(this.puzzleSize.y);
        this.view.place = 0;
        this.description = description;
        if (!description.skin) { //поправить
            this.initPuzzle();
            return;
        }
        this.loadSkin();
    };

    /**
     * Загрузка скина
     */
    NarrPuzzle.prototype.loadSkin = function () {
        var _this = this;
        requirejs(["img/tpl/puzzletpl.js"],
            function (params) {
                _this.skinTree = new skin(_this.view, params);
                var el = _this.skinTree.getActs();
                for (var i = el.length; i--;) {
                    if (el[i].act.value == "recreate") {
                        _this._rndbutton = el[i];
                        break;
                    }
                }
                _this.description.stickers.dim = _this.skinTree.acts.dim || _this.description.stickers.dim;
                _this.initPuzzle();
            });
    };

    /**
     * Выбор типа пазлов
     */
    NarrPuzzle.prototype.initPuzzle = function () {
        if (this.description.imgs.length) {
            this.loadImg(this.description);
            this.puzzleEnable = true;
        } else {
            this.puzzleSize.y = Math.floor(this.docHeight);
            this.loadStickers(this.description);
        }
    };


    /**
     * Создание Div и загрузка в них изображений
     * @param {Object} description
     */
    NarrPuzzle.prototype.loadImg = function (description) {
        var retinaParam = description.retina ? 0.5 : 1;
        for (var i = 0; i < description.imgs.length; i++) {

            var node = document.createElement('div');

            node.style.backgroundImage = 'url("' + description.imgs[i].src + '")';
            node.style.backgroundSize = description.imgs[i].size.x * retinaParam + "px " + description.imgs[i].size.y * retinaParam + "px";
            node.style.width = description.imgs[i].size.x * retinaParam + "px ";
            node.style.height = description.imgs[i].size.y * retinaParam + "px";

            node.params = {
                pos: {
                    x: description.imgs[i].pos.x,
                    y: description.imgs[i].pos.y
                },
                width: description.imgs[i].size.x * retinaParam,
                height: description.imgs[i].size.y * retinaParam
            };

            node.style.position = "absolute";
            node.style[brprefix + "transform"] = "translate3d(" + description.imgs[i].pos.x + "px," + description.imgs[i].pos.y + "px,0px)";

            if ("point" in description.imgs[i]) {
                this.realPieces++;
                node.point = description.imgs[i].point;
            }

            node.start = {};
            node.eStart = {};
            node.eEnd = {};
            node.defpos = {
                x: description.imgs[i].pos.x,
                y: description.imgs[i].pos.y
            };

            node.place = false;

            this.view.appendChild(node);
        }
        return true;
    };

    /**
     * Автопазл
     * @param {Object} description
     */
    NarrPuzzle.prototype.loadStickers = function (description) {
        if (!description.stickers.src) return false;

        this.dim = description.stickers.dim;
        this.stickerSrc = description.stickers.src;
        this.stickerHeight = description.stickers.size.y;
        this.stickerWidth = description.stickers.size.x;
        this.stickerPos = description.stickers.pos;
        this.img = new Image();

        var self = this;
        this.img.onload = function () {
            self.stickersInit(this);
        };
        this.img.src = this.stickerSrc;

        this.imgs = [];
        return true;
    };

    /**
     * Генерим пазлы заново, предварительно удалив старые канвасы из вьюхи
     */
    NarrPuzzle.prototype.updateCut = function () {

        var elements = this.view.getElementsByTagName("canvas");
        for (var i = elements.length; i--;) {
            elements[i].parentNode.removeChild(elements[i]);
        }

        this.dim = this.description.stickers.dim;
        this.cut(this._ForCut[0], this._ForCut[1], this.dim);
        this.go();
        this.skinTree.elementOn(this._rndbutton);

    };


    /**
     * Готова картинка для создания пазлов
     * @param {HTMLImageElement} img
     */
    NarrPuzzle.prototype.stickersInit = function (img) {
    
        var a = document.createElement("canvas");
        var ctx = a.getContext("2d");
        a.width = this.puzzleImgSize.x;
        a.height = this.puzzleImgSize.y;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, a.width, a.height);
        this._ForCut = [a, {'x': img.width, 'y': img.height}];

        this.cut(a, {'x': img.width, 'y': img.height}, this.dim);
        this.go();
    };

    /**
     *
     * @param {HTMLImageElement} img
     * @param {Object} vsize
     * @param {Array} dim
     */
    NarrPuzzle.prototype.cut = function (img, vsize, dim) {
        this.bigCanvas = document.createElement("canvas").getContext("2d");
        this.bigCanvas.canvas.width = img.width;
        this.bigCanvas.canvas.height = img.height;

        //var dim = [3,5];  //строки , колонки
        var w = ( img.width / dim[1] );     //Ширина пазла
        var h = (  img.height / dim[0] ); //Высота пазла


        var parts = []; //содержит объекты типа {ctx: canvas, size:[w,h], pos:[x,y], toch : [x,y,w1,h1], path : [-1,0,1,-1], delta : [0,0,0,0] } (path = -1 линия 0 внутрь 1 внешний)
        var i = 0;
        var j = 0;
        var n = 0;
        var s = (h > w ? w : h); //Задает размер выступающих и внутренних элементов

        var delta = s * 0.31; //Отступ рисования
        var dx = this.stickerPos.x + delta; //Отступ размещения на экране по x
        var dy = this.stickerPos.y + delta; //Отступ размещения на экране по y
        this.s = [w + delta * 2, h + delta * 2];
        this.s1 = [w, h];
        this.delta = delta;

        /**
         *
         * @param {Number} i //позиция элемениа по горизонтали
         * @param {Number} j //позиция элемениа по вертикали
         * @param {Number} n //Номер в массиве
         * @param {HTMLElement} bigCanvas //Вся картинка на одном канвасе
         * @returns {{ctx: CanvasRenderingContext2D, size: *[], pos: *[], path: number[], toch: *[]}}
         */
        var newcanvas = function (i, j, n, bigCanvas) { //создание канваса
            var path = [0, 0, 0, 0]; //линия у пазла
            var size = [w + delta * 2, h + delta * 2]; // размер полный пазла
            var pos = [i * w - delta , j * h - delta]; //позиция
            var toch = [i * w, j * h, w, h]; // область тача

            path[1] = Math.random() > 0.5 ? 1 : 0;
            path[2] = Math.random() > 0.5 ? 1 : 0;

            if (j == 0) path[0] = -1;
            if (i == 0) path[3] = -1;
            if (i == dim[1] - 1) path[1] = -1;
            if (j == dim[0] - 1) path[2] = -1;

            if (j) path[0] = parts[n - 1].path[2] == 0 ? 1 : 0;
            if (i) path[3] = parts[n - dim[0]].path[1] == 0 ? 1 : 0;


            var ctx = document.createElement("canvas").getContext("2d");
            ctx.canvas.style.border = 0;
            ctx.canvas.style.margin = 0;
            ctx.canvas.style.padding = 0;
            ctx.canvas.style.position = "absolute";
            ctx.canvas.style.top = -delta + "px";   //Или top left или margin
            ctx.canvas.style.left = -delta + "px";
            //ctx.canvas.style.margin = 0-delta +"px ";
            ctx.canvas.width = size[0];
            ctx.canvas.height = size[1];
            draw(ctx, path, i, j, pos);
            drawOut(bigCanvas, path, i, j, pos);
            //document.body.appendChild(ctx.canvas); //Для тестов
            return {'ctx': ctx, 'size': size, 'pos': pos, 'path': path, 'toch': toch};
        };

        /**
         * Отрисовка одного элемента в пазлине
         * @param {CanvasRenderingContext2D} ctx
         * @param {Array} path //Вид пазла
         * @param {Number} i
         * @param {Number} j
         * @param {Array} pos //Координаты
         */
        var draw = function (ctx, path, i, j, pos) { //Отрисовка одного пазла
            ctx.translate(delta, delta);
            ctx.beginPath();
            ctx.lineWidth = 3;
            draw[path[0]](ctx, w, s, 0);
            ctx.translate(w, 0);
            rotate(ctx);
            draw[path[1]](ctx, h, s, 0);
            ctx.translate(h, 0);
            rotate(ctx);
            draw[path[2]](ctx, w, s, 0);
            ctx.translate(w, 0);
            rotate(ctx);
            draw[path[3]](ctx, h, s, 0);
            ctx.translate(h, 0);
            rotate(ctx);
            ctx.fill();
            ctx.clip();
            ctx.fillStyle = 'rgba(250,250,250,0)';
            ctx.shadowColor = 'rgba(50,50,50,255)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.drawImage(img, -pos[0] - delta, -pos[1] - delta);
            ctx.shadowColor = 'rgba(240,240,240,155)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = -2;
            ctx.strokeStyle = 'rgba(50,50,50,150)';
            ctx.fill();


            ctx.stroke();
            ctx.closePath();

        };

        /**
         * Отрисовка одного пазла
         * @param {CanvasRenderingContext2D} ctx
         * @param {Array} path //Вид пазла
         * @param {Number} i
         * @param {Number} j
         * @param {Array} pos //Координаты
         */
        var drawOut = function (ctx, path, i, j, pos) { //Отрисовка одного пазла
            ctx.translate(pos[0] + delta, pos[1] + delta);
            ctx.beginPath();
            ctx.lineWidth = 1;
            draw[path[0]](ctx, w, s, 0);
            ctx.translate(w, 0);
            rotate(ctx);
            draw[path[1]](ctx, h, s, 0);
            ctx.translate(h, 0);
            rotate(ctx);
            draw[path[2]](ctx, w, s, 0);
            ctx.translate(w, 0);
            rotate(ctx);
            draw[path[3]](ctx, h, s, 0);
            ctx.translate(h, 0);
            rotate(ctx);
            ctx.fillStyle = 'rgba(250,250,250,255)';
            ctx.shadowColor = 'rgba(250,250,250,255)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fill();
            ctx.shadowColor = 'rgba(200,200,200,55)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = -2;
            ctx.shadowOffsetY = -2;
            ctx.strokeStyle = 'rgba(50,50,50,50)';
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.translate(-pos[0] - delta, -pos[1] - delta);
        };

        /**
         * Рисуем внешний элемент
         * @param ctx
         * @param w
         * @param s
         * @param cx
         */
        draw[0] = function (ctx, w, s, cx) { //Рисуем внешний элемент
            var p = (w - s) / 2;
            cx = cx + p;
            ctx.lineTo(0, 0);
            ctx.lineTo(p, 0);
            ctx.lineTo(s * .34 + cx, 0);
            ctx.bezierCurveTo(cx + s * .5, 0, cx + s * .4, s * -.15, cx + s * .4, s * -.15);
            ctx.bezierCurveTo(cx + s * .3, s * -.3, cx + s * .5, s * -.3, cx + s * .5, s * -.3);
            ctx.bezierCurveTo(cx + s * .7, s * -.3, cx + s * .6, s * -.15, cx + s * .6, s * -.15);
            ctx.bezierCurveTo(cx + s * .5, 0, cx + s * .65, 0, cx + s * .65, 0);
            ctx.lineTo(w, 0);
        };

        /**
         * Рисуем внутренний элемент
         * @param ctx
         * @param w
         * @param s
         * @param cx
         */
        draw[1] = function (ctx, w, s, cx) { //Рисуем внутренний элемент
            var p = (w - s) / 2;
            cx = cx + p;
            ctx.lineTo(0, 0);
            ctx.lineTo(p, 0);
            ctx.lineTo(cx + s * .34, 0);
            ctx.bezierCurveTo(cx + s * .5, 0, cx + s * .4, s * .155, cx + s * .4, s * .1505);
            ctx.bezierCurveTo(cx + s * .3, s * .3, cx + s * .5, s * .29, cx + s * .5, s * .29);
            ctx.bezierCurveTo(cx + s * .7, s * .29, cx + s * .6, s * .15, cx + s * .6, s * .15);
            ctx.bezierCurveTo(cx + s * .5, 0, cx + s * .65, 0, cx + s * .65, 0);
            ctx.lineTo(w, 0);
        };

        /**
         * Рисуем линию
         * @param ctx
         * @param w
         */
        draw[-1] = function (ctx, w) { //Рисуем линию
            ctx.lineTo(0, 0);
            ctx.lineTo(w, 0);
        };

        /**
         * поворот на 90градусов
         * @param ctx
         */
        var rotate = function (ctx) { //поворот на 90градусов
            ctx.rotate(Math.PI / 2);
        };

        /**
         *
         * @param {Array} parts
         * @param {Number} dx //расположение по x
         * @param {Number} dy //расположение по y
         * @param {Number} s
         * @param {Number} w //Ширина
         * @param {Number} h //Высота
         * @returns {Array}
         */
        var makeJSON = function (parts, dx, dy, s, w, h) {

            var tmp = [];
            for (i = 0; i < parts.length; i++) {
                tmp[i] = {
                    'point': { 'x': dx + parts[i].pos[0], 'y': dy + parts[i].pos[1], 'r': s / 2},
                    'size': {'x': w, 'y': h},
                    'src': parts[i].ctx.canvas,
                    'zind': i
                };
            }
            return tmp;
        };

        for (i = 0; i < dim[1]; i++) {
            for (j = 0; j < dim[0]; j++) {
                n = i * dim[0] + j;
                parts[n] = newcanvas(i, j, n, this.bigCanvas);
            }
        }

        this.bigCanvas.globalAlpha = 0.1;
        this.bigCanvas.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        this.imgs = makeJSON(parts, dx, dy, s, w, h);
    };

    /**
     * Готовые вырезанные пазлы вставляем в DOM в рандомную позицию
     */
    NarrPuzzle.prototype.go = function () {
        if (!this.imgs) return false;
        var a = this.bigCanvas.canvas;
        a.style.background = "grey";
        a.style.opacity = 1;
        a.style.width = this.stickerWidth + "px";
        a.style.height = this.stickerHeight + "px";
        a.style.position = "absolute";
        a.style.left = this.stickerPos.x + "px";
        a.style.top = this.stickerPos.y + "px";

        this.view.appendChild(a);

        var shotScene = window.location.search.match(/shotScene=([0-9]+)/);

        for (var i = this.imgs.length; i--;) {
            //this.randomPos(this.imgs[i], i);
            this.view.appendChild(this.imgs[i].src);
            this.imgs[i].pos = {'x': this.imgs[i].point.x, 'y': this.imgs[i].point.y, z: 50};
            this.imgs[i]._size = {'x': this.imgs[i].size.x, 'y': this.imgs[i].size.y};
            this.imgs[i].src.style[brprefix + "transition"] = "all 0.5s";
            this.imgs[i].src.style[brprefix + "transform"] = "translate(" + this.imgs[i].point.x + 'px,' + this.imgs[i].point.y + 'px) scale(1)';
            bradapter.applyZIndex(this.view, this.imgs[i].src, 50);
            if(shotScene) this.imgs[i].src.style.display = "none";
        }
    };

    /**
     * Постановка элемента автопазла в рандомную позицию
     * @param {Object} data
     * @param {Number} index
     * @returns {*}
     */
    NarrPuzzle.prototype.randomPos = function (data, index) { ///ПЕРЕПИСАТЬ

        var a = 0,
            n = -1,
            boxSize = this.dim[0] * this.dim[1],
            places = (this.positionPuzzle[0] ? 1 : 0) + (this.positionPuzzle[1] ? 1 : 0) + (this.positionPuzzle[2] ? 1 : 0) + (this.positionPuzzle[3] ? 1 : 0),
            sizeOnePlace = Math.floor((boxSize) / places);
        if (boxSize > sizeOnePlace * places) sizeOnePlace++;

        while (1) {
            a = Math.floor(Math.random() * boxSize);
            if (!this.puzzleBox[a]) break;
        }
        this.puzzleBox[a] = true;


        for (var b = 0; b < this.positionPuzzle.length; b++) {
            if (this.positionPuzzle[b]) {
                n++;
            } else {
                continue;
            }

            if ((a - n * sizeOnePlace) > -1 && (a - n * sizeOnePlace) < sizeOnePlace) {
                var tmp = getPos((a - n * sizeOnePlace), b, sizeOnePlace, data, this);
                data.pos = {'x': tmp.x, 'y': tmp.y, z: index};
                data.src.style[brprefix + "transform"] = "translate(" + data.pos.x + 'px,' + data.pos.y + 'px) scale(' + this.resizePuzzle + ')';
                bradapter.applyZIndex(this.view, data.src, 50);

                return;
            }
        }

        if (n < 0) {
            data.pos = {'x': Math.random() * (this.docWidth - data.src.width * this.resizePuzzle), 'y': Math.random() * (this.docHeight - data.src.height * this.resizePuzzle), z: index};
            data.defPos = {x: data.pos.x, y: data.pos.y};
            data.src.style[brprefix + "transform"] = "translate(" + data.pos.x + 'px,' + data.pos.y + 'px) scale(' + this.resizePuzzle + ')';
            bradapter.applyZIndex(this.view, data.src, 50);
        }

        /**
         * Получение координатов пазлиной
         * @param pos
         * @param place
         * @param max
         * @param data
         * @param module
         * @returns {*}
         */
        function getPos(pos, place, max, data, module) {
            if (place === 0) {
                return {x: (module.docWidth) / max * pos, y: 0};
            } else if (place === 1) {
                return {x: module.docWidth - data.src.width * module.resizePuzzle, y: (module.docHeight) * pos / max};
            } else if (place === 2) {

                var _x = (module.puzzleImgSize.x - data.src.width * module.resizePuzzle / 3.5) / max * pos + module.puzzleImgPos.x - data.src.width * module.resizePuzzle / 3.5 - data.src.width * module.resizePuzzle/3*Math.random()+ data.src.width * module.resizePuzzle/3*Math.random();
                var _y = module.puzzleImgSize.y + module.puzzleImgPos.y - Math.random()*100;
                var _yDelta = (module.docHeight - (module.puzzleImgSize.y + module.puzzleImgPos.y)) / 2 - data.src.height * module.resizePuzzle / 2;

                if (_yDelta < 0) _yDelta = 0;
                _y = _y + _yDelta;

                return {x: _x, y: _y}; //bottom
            } else if (place === 3) {
                return {x: 0, y: (module.docHeight) * pos / max };
            }
            return {x: 0, y: 0};
        }
    };

    /**
     * Че-то связанное с первоначальной позицией пазла
     */
    NarrPuzzle.prototype.draw = function () { // необязательно
        if (this.moveObj && this.puzzleRunBack) {
            this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.tmpX + "px," + this.tmpY + "px,0px)";
            if ((this.tmpX === this.moveObj.defpos.x) && (this.tmpY === this.moveObj.defpos.y)) {
                this.moveObj.params.pos.x = this.moveObj.defpos.x;
                this.moveObj.params.pos.y = this.moveObj.defpos.y;
                this.moveObj = false;
            }
        }
    };

    /**
     * Смена сцены
     */
    NarrPuzzle.prototype.load = function () { // необязательно
        var i;


        if (!this.description.imgs.length) {

            if (this.firstStart /* && !this.skinTree */) {
                this.firstStart = false;
                this.resetPuzzle();
/*
                this.puzzleEnable = true;
                this.ready = 0;
                this.puzzleBox = [];
                for (i = this.imgs.length; i--;) {
                    this.imgs[i].size.x = this.imgs[i]._size.x;
                    this.imgs[i].size.y = this.imgs[i]._size.y;
                    this.randomPos(this.imgs[i], i);
                }
*/
            }

            if (this.ready != this.imgs.length) return false;

        } else {
            for (i = 0; i < this.view.childNodes.length; i++) {
                this.view.childNodes[i].style[brprefix + "transform"] = "translate3d(" + this.view.childNodes[i].defpos.x + "px," + this.view.childNodes[i].defpos.y + "px,0px)";
                this.view.childNodes[i].params.pos.x = this.view.childNodes[i].defpos.x;
                this.view.childNodes[i].params.pos.y = this.view.childNodes[i].defpos.y;
                this.view.childNodes[i].place = false;
                this.view.place = 0;
                this.puzzleEnable = true;
            }
        }
    };

    /**
     * Тап или начало движения пазла
     * @param {Object} e
     * @param {Object} obj
     * @returns {boolean}
     */
    NarrPuzzle.prototype.puzzleStart = function (e, obj) {


        if (!obj || this.moveObj) return false;


        this.moveObj = obj;
        if (!this.description.imgs.length) {
            this.moveObj.startPos = this.getInternalCoordinatesForPoint(e);
            this.moveObj.src.style[brprefix + "transition"] = "all 0.3s";
            this.moveObj.src.style[brprefix + "transform"] = "translate3d(" + this.moveObj.pos.x + 'px,' + this.moveObj.pos.y + "px,0px)";
            bradapter.applyZIndex(this.view, this.moveObj.src, 100);
        } else {
            this.moveObj.start.x = obj.params.pos.x;
            this.moveObj.start.y = obj.params.pos.y;
            //this.moveObj.style[brprefix + "transition"] = "all 0s";
            //this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.point.x + "px," + this.moveObj.point.y + "px,0px)";
            this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
            bradapter.applyZIndex(this.view, this.moveObj, this.view.childNodes.length + 1);
        }

        return true;
    };

    /**
     * Движение пазла
     * @param {Object} e
     * @returns {boolean}
     */
    NarrPuzzle.prototype.puzzleMove = function (e) {
        e.stopPropagation();
       if (!this.description.imgs.length) {
            this.moveObj.eEnd = this.getInternalCoordinatesForPoint(e);
            if (this.moveObj.pos.x < 0 || this.moveObj.eEnd.x < 0) {
                this.moveObj.pos.x = 0;
            }
            else if (this.puzzleSize.x < this.moveObj.pos.x + this.s1[0] || this.moveObj.eEnd.x > this.puzzleSize.x) {
                this.moveObj.pos.x = this.puzzleSize.x - this.s1[0];
            } else {
                this.moveObj.pos.x = this.moveObj.eEnd.x - this.moveObj.startPos.x + this.moveObj.pos.x;
            }
            if (this.moveObj.pos.y < 0 || this.moveObj.eEnd.y < 0) {
                this.moveObj.pos.y = 0;
            }
            else if (this.puzzleSize.y < this.moveObj.pos.y + this.s1[1] || this.moveObj.eEnd.y > this.puzzleSize.y) {
                this.moveObj.pos.y = this.puzzleSize.y - this.s1[1];
            } else {
                this.moveObj.pos.y = this.moveObj.eEnd.y - this.moveObj.startPos.y + this.moveObj.pos.y;
            }

            this.moveObj.startPos.x = this.moveObj.eEnd.x;
            this.moveObj.startPos.y = this.moveObj.eEnd.y;
            this.moveObj.src.style[brprefix + "transition"] = "none";
            this.moveObj.src.style[brprefix + "transform"] = "translate(" + this.moveObj.pos.x + 'px,' + this.moveObj.pos.y + 'px)';

            bradapter.applyZIndex(this.view, this.moveObj.src, 100);


        } else {
            this.moveObj.eEnd = this.getInternalCoordinatesForPoint(e);
            if (this.puzzleSize.x < this.moveObj.eEnd.x || this.puzzleSize.y < this.moveObj.eEnd.y || this.moveObj.eEnd.x < 0 || this.moveObj.eEnd.y < 0) {
                return true;
            }
            else {
                this.moveObj.start.x += this.moveObj.eEnd.x - this.moveObj.eStart.x;
                this.moveObj.start.y += this.moveObj.eEnd.y - this.moveObj.eStart.y;
                if (this.moveObj.start.x < 0) {
                    this.moveObj.start.x = 0;
                }
                if (this.moveObj.start.x + this.moveObj.params.width > this.puzzleSize.x) {
                    this.moveObj.start.x = this.puzzleSize.x - this.moveObj.params.width;
                }
                if (this.moveObj.start.y < 0) {
                    this.moveObj.start.y = 0;
                }
                if (this.moveObj.start.y + this.moveObj.params.height > this.puzzleSize.y) {
                    this.moveObj.start.y = this.puzzleSize.y - this.moveObj.params.height;
                }
                this.moveObj.style[brprefix + "transition"] = "all 0s";
                this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.start.x + "px," + this.moveObj.start.y + "px,0px) ";
                this.moveObj.params.pos.x = this.moveObj.start.x;
                this.moveObj.params.pos.y = this.moveObj.start.y;
                this.moveObj.eStart = this.getInternalCoordinatesForPoint(e);
            }
        }
    };

    /**
     * Окончание действия
     * @param {Object} e
     * @returns {boolean}
     */
    NarrPuzzle.prototype.puzzleEnd = function (e) {
        e.stopPropagation();
        if (!this.moveObj) return false;
        if (!this.description.imgs.length) {
            this.moveObj.src.style[brprefix + "transition"] = "all 0.5s";
            this.moveObj.src.style[brprefix + "transform"] = "translate(" + this.moveObj.pos.x + 'px,' + this.moveObj.pos.y + 'px) scale(' + this.resizePuzzle + ')';
            bradapter.applyZIndex(this.view, this.moveObj.src, 50);
            if (Math.abs(this.moveObj.pos.x - this.moveObj.point.x) < this.moveObj.point.r && (this.moveObj.pos.y - this.moveObj.point.y ) < this.moveObj.point.r) {
                this.moveObj.src.style[brprefix + "transform"] = "translate(" + this.moveObj.point.x + 'px,' + this.moveObj.point.y + 'px) scale(1)';
                bradapter.applyZIndex(this.view, this.moveObj.src, 1);
                this.moveObj._size = {x: this.moveObj.size.x, y: this.moveObj.size.y};
                this.moveObj.size = {x: 0, y: 0};
                this.moveObj = undefined;
                if (this.ready === undefined) this.ready = 0;
                this.ready++;
                if (this.ready == this.imgs.length) { //stickers complete
                    this.puzzleEnable = false;
                    this.skinTree.elementOn(this._rndbutton);
                    if (this.prize)
                        this.puzzleEnable = false;
                    this.delegate.fireEvent("performAnimation", [this.prize]);
                }
            }
            this.moveObj = false;


        } else {
            bradapter.applyZIndex(this.view, this.moveObj, 1);

            if (this.moveObj.point &&
                (this.moveObj.params.pos.x - this.moveObj.point.x) *
                (this.moveObj.params.pos.x - this.moveObj.point.x) +
                (this.moveObj.params.pos.y - this.moveObj.point.y) *
                (this.moveObj.params.pos.y - this.moveObj.point.y) <=
                this.moveObj.point.r * this.moveObj.point.r
                ) {

                this.moveObj.style[brprefix + "transition"] = "all 0.35s";
                this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.point.x + "px," + this.moveObj.point.y + "px,0px)";
                this.view.place++;
                this.moveObj.place = true;
                this.moveObj = false;
            } else if (this.puzzleRunBack) {
                this.moveObj.style[brprefix + "transition"] = "all 1s";
                this.moveObj.style[brprefix + "transform"] = "translate3d(" + this.moveObj.defpos.x + "px," + this.moveObj.defpos.y + "px,0px)";
                this.moveObj.params.pos.x = this.moveObj.defpos.x;
                this.moveObj.params.pos.y = this.moveObj.defpos.y;
                this.moveObj = false;
/*
                this.animateTo("tmpX", this.moveObj.defpos.x, 350, 'easeOutCubic');
                this.animateTo("tmpY", this.moveObj.defpos.y, 350, 'easeOutCubic');
*/
            } else this.moveObj = false;

            if (this.view.place == this.realPieces) {//puzzle complete
                this.puzzleEnable = false;
                if (this.prize)

                    this.delegate.fireEvent("performAnimation", [this.prize]);
            }
        }

    };

    /**
     * Заново играть
     */
    NarrPuzzle.prototype.resetPuzzle = function () {

        this.puzzleEnable = true;
        this.ready = 0;
        this.skinTree.elementOff(this._rndbutton);
        this.puzzleBox = [];
        for (var i = this.imgs.length; i--;) {
            this.imgs[i].size.x = this.imgs[i]._size.x;
            this.imgs[i].size.y = this.imgs[i]._size.y;
            this.randomPos(this.imgs[i], i);
        }
    };


    /**
     * Обработка события - поиск области попадания
     * @param {Object} e
     * @param {String} gesture
     * @returns {*}
     */
    NarrPuzzle.prototype.customHittest = function (e, gesture) {
    
    
	if (!this.description.imgs.length) {

        if (gesture == 'touch') {

            var tmp = this.getInternalCoordinatesForPoint(e),
                _x = tmp.x,
                _y = tmp.y;

            if (this.skinTree) {
                var el = this.skinTree.hitTest(_x, _y);

                if (el) {
                    this.skinTree.toggleElements(el);
                    if (el.act.name == "dim" && !(this.description.stickers.dim[0] == el.act.value[0] && this.description.stickers.dim[1] == el.act.value[1] )) {
                        this.description.stickers.dim = el.act.value;
                        this.updateCut();
                        this.resetPuzzle();
                        return false;
                    }
                    if (el.act.name == "act" && el.act.value && this.puzzleEnable == false) {
                    	this.updateCut();
                        this.resetPuzzle();
                        return false;
                    }
                }
            } else {
                if (!this.skinTree && !this.puzzleEnable) {

                    if (
                        _x > this.puzzleImgPos.x &&
                        _y > this.puzzleImgPos.y &&
                        _x < this.puzzleImgSize.x + this.puzzleImgPos.x &&
                        _y < this.puzzleImgSize.y + this.puzzleImgPos.y
                        ) {

                        this.puzzleEnable = true;
                        this.ready = 0;
                        this.puzzleBox = [];
                        for (i = this.imgs.length; i--;) {
                            this.imgs[i].size.x = this.imgs[i]._size.x;
                            this.imgs[i].size.y = this.imgs[i]._size.y;
                            this.randomPos(this.imgs[i], i);
                        }
                        return false;
                    }
                }
            }
			}

        }
        if (this.puzzleEnable && (gesture == 'NarrPuzzlePan' || gesture == 'NarrPuzzleTap')) {
                var i;
            	if (!this.description.imgs.length) {
                if (this.moveObj) return this.moveObj;
                var zind = this.imgs.length;
                var ind = -1;
                tmp = this.getInternalCoordinatesForPoint(e);
                _x = tmp.x;
                _y = tmp.y;
                for (i = this.imgs.length; i--;) {
                    if (this.smallHittTest(_x, _y, this.imgs[i]) && zind > this.imgs[i].zind) {
                        zind = this.imgs[i].zind;
                        ind = i;
                    }
                }
                if (ind != -1) return this.imgs[ind];
            } else {
                for (i = 0; i < this.view.childNodes.length; i++) {
                    if (!this.view.childNodes[i].place && this.hittestForRect({pType: 0, left: this.view.childNodes[i].params.pos.x, top: this.view.childNodes[i].params.pos.y, width: this.view.childNodes[i].params.width, height: this.view.childNodes[i].params.height}, e)) return this.view.childNodes[i];
                }
            }
        }
        else
            return false;
    };

    /**
     * Провекрка на попадание в маленький пазл
     * @param {Number} _x
     * @param {Number} _y
     * @param {Object} obj
     * @returns {boolean}
     */
    NarrPuzzle.prototype.smallHittTest = function (_x, _y, obj) {
        if (!obj) return false;
        var sx = obj.size.x * this.resizePuzzle;
        var sy = obj.size.y * this.resizePuzzle;
        var x = obj.pos.x + obj.size.x * (1 - this.resizePuzzle) / 2;
        var y = obj.pos.y + obj.size.y * (1 - this.resizePuzzle) / 2;

        return !!((_x > x) && (_x < x + sx) && (_y > y) && (_y < y + sy));
    };

    /**
     * Подписка на прикосновение
     */
    Utils.addBehaviour('touch', 'NarrPuzzle', 'NarrPuzzleTap',
        {
            start: function (e, obj) {
                e.stopPropagation();
                this.puzzleStart(e, obj);
                return true;
            },
            end: function (e) {
                e.stopPropagation();
                this.puzzleEnd(e);
            }
        }, false);

    /**
     * Подписка на pan
     */
    Utils.addBehaviour('pan', 'NarrPuzzle', 'NarrPuzzlePan', {
        start: function (e, obj) {
            e.stopPropagation();
            this.moveObj ? this.puzzleMove(e, obj) : this.puzzleStart(e, obj);
            return true;
        }, move: function (e, obj) {
            this.puzzleMove(e, obj);
        }, swipe: function (e) {
            e.stopPropagation();
            return true;
        }, end: function (e) {
            e.stopPropagation();
            this.puzzleEnd(e);
        }}, false);


    return NarrPuzzle;
});