define([], function () {

    /**
     * Конструктор класса
     * @param size {object}
     * @constructor
     */
    var NarrColoringClass = function (size) {

        this.w = size.w; //Ширина
        this.h = size.h; //Высота

        /**
         * Объект текущих настроек рабочего инструмента
         */

        this.curentTool = {
            "tooltype": "brush", //Тип инструмента
            "toolsize":  30, //Размер кисти
            "toolcolor": [255, 55, 55, 255], //цвет RGBA для рисования или заливки
            "toolopacity": 0.1, //Прозрачность кисти
            "toolsoft": 0.4, //Мягкость кисти
            "toolcomposite": "source-over", //Режим наложения
            "pos": [0, 0], //Последние координаты мыши/тапа
            "action": false, // текущий режим кисти ( в режиме рисования или нет )
            "img": false //В разработке штампик
        };

        /**
         * Настройки для обработки изображения в прозрачное
         */

        this.bgColor = [255, 255, 255, 255]; //цвет фона заливки
        this.strokeColor = [0, 0, 0, 0]; //цвет бордера для FILL
        this.toleranceForBw = 100; //сумма цветов для черного
        this.deltacolor = 8; //срезаем прозрачный градиент у контура - по альфа каналу

        /**
         *  Шаблон для создания канваса
         * @param canvasWidth
         * @param canvasHeight
         * @returns {HTMLElement}
         */
        var createCanvas = function (canvasWidth, canvasHeight) {
            var ca = document.createElement('canvas');
            ca.context = ca.getContext("2d");
            ca.style.position = "absolute";
            ca.width = canvasWidth;
            ca.height = canvasHeight;
            return ca;
        };

        this.paintCanvas = createCanvas(this.w, this.h); //канвас для рисования
        this.mainCanvas = createCanvas(this.w, this.h); //канвас для прозрачного контура
        this.fillCanvas = createCanvas(this.w, this.h); //канвас  для контура заливки

        this.tapDelay = false; //задержка между

    };
    /**
     * Обработка изображения для последующей работы раскраски
     * @param img
     * @param posX
     * @param posY
     * @param sizeWidth
     * @param sizeHeight
     */

    NarrColoringClass.prototype.parseImg = function (img, posX, posY, sizeWidth, sizeHeight) {
        var pix, tmpcolor, x, width = this.w, height = this.h;

        posX = posX || 0;
        posY = posY || 0;
        sizeWidth = sizeWidth || img.width;
        sizeHeight = sizeHeight || img.height;

		if(img.width < sizeWidth) img.width = img.width * 2;
		if(img.height < sizeHeight) img.height = img.height * 2;
		
        if(posX < 0 ) posX = 0;
        if(posY < 0 ) posY = 0;

        if(img.width < posX + sizeWidth) sizeWidth = img.width - posX;
        if(img.height < posY + sizeHeight) sizeHeight = img.height - posY;

        this.clearcanvas(); //очистка канваса   -  заливка белым
        
        var tmp = document.createElement("canvas");
        tmp.ctx = tmp.getContext("2d");
        tmp.width = img.width;
        tmp.height = img.height;
        tmp.ctx.drawImage(img,0,0,img.width,img.height);
        //console.log( img.width, img.height)
        
        this.mainCanvas.context.drawImage(tmp, posX, posY, sizeWidth, sizeHeight, 0, 0, width, height);
		this.mainCanvas.context.drawImage(tmp, posX, posY, sizeWidth, sizeHeight, 0, 0, width, height);
        //Рисуем обводку
        this.mainCanvas.context.lineWidth = 4;
        this.mainCanvas.context.beginPath();
        this.mainCanvas.context.moveTo(0, 0);
        this.mainCanvas.context.lineTo(width, 0);
        this.mainCanvas.context.lineTo(width, height);
        this.mainCanvas.context.lineTo(0, height);
        this.mainCanvas.context.lineTo(0, 0);
        this.mainCanvas.context.stroke();

        //Делаем изображение прозрачным
       
        pix = this.mainCanvas.context.getImageData(0, 0, width, height);
        
         var len = pix.data.length;
        
        for (x = 0; x < len;) { //Создаем прозрачный контур для верхней картинки
            tmpcolor = (0.34 * pix.data[x] + 0.5 * pix.data[x + 1] + 0.16 * pix.data[x + 2]); //перевод в оттнки серого
            var col = 255 - tmpcolor + this.deltacolor;
            pix.data[x] = 0;
            pix.data[x + 1] = 0;
            pix.data[x + 2] = 0;
            pix.data[x + 3] = col > 255 ? 255 : col;
            x = x + 4;
        }
        this.mainCanvas.context.putImageData(pix, 0, 0);
        
        for (x = 0; x < len;) { //Создаем прозрачный контур для верхней картинк
            pix.data[x + 3] += this.deltacolor*4;
            x = x + 4;
        }
        //Создание маски для заливок
        
        for (x = 0; x < len;) {
            if (pix.data[x + 3] > this.toleranceForBw) { //альфакана прозрачность > this.toleranceForBw - черный цвет
                pix.data[x] = this.strokeColor[0];
                pix.data[x + 1] = this.strokeColor[1];
                pix.data[x + 2] = this.strokeColor[2];
                pix.data[x + 3] = this.strokeColor[3];
            } else {
                pix.data[x] = this.bgColor[0];
                pix.data[x + 1] = this.bgColor[1];
                pix.data[x + 2] = this.bgColor[2];
                pix.data[x + 3] = this.bgColor[3];
            }
            x = x + 4;
        }

        //все что получилось пихаем сюды
        this.fillCanvas.context.putImageData(pix, 0, 0);
    };

    /**
     * Очистка раскраски
     */
    NarrColoringClass.prototype.clearcanvas = function () { //очистка раскраски
        this.paintCanvas.context.globalAlpha = 1;
        this.paintCanvas.context.fillStyle = "white";
        this.paintCanvas.context.rect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
        this.paintCanvas.context.fill();
        this.paintCanvas.context.globalAlpha = this.curentTool.toolopacity;
    };

    /**
     * изменение красок и инструмента
     * @param tool {object}
     */
    NarrColoringClass.prototype.setTool = function (tool) {
        for (var i in tool) {
            if (tool.hasOwnProperty(i) && tool[i]) {
                this.curentTool[i] = tool[i];
            }
        }
    };

    /**
     * инструмент заливка
     * @param posX
     * @param posY
     * @returns {boolean}
     */
    NarrColoringClass.prototype.floodFill = function (posX, posY) { //Заливка
        if (this.tapDelay) return false; //задержка между заливками

        //var tolerance = 1;
        var fillcolor = this.curentTool.toolcolor;
        var img = this.fillCanvas.context.getImageData(0, 0, this.w, this.h);
        var img2 = this.paintCanvas.context.getImageData(0, 0, this.w, this.h);
        var data = img.data;
        var data2 = img2.data;
        var length = data.length;
        var Q = []; //массив линий
        var i = (posX + posY * this.w) * 4;
        var e = i, w = i, me, mw, w2 = this.w * 4;
        var targetcolor = [data[i], data[i + 1], data[i + 2], data[i + 3]];

        //console.log("go")

        if (!pixelCompare(i, targetcolor, data, length)) {
            return false;
        }

        Q.push(i);
        while (Q.length) {
            i = Q.pop();
            if (pixelCompareAndSet(i, targetcolor, fillcolor, data, length, data2)) {
                e = i;
                w = i;
                mw = ((i / w2) | 0) * w2; //left bound
                me = mw + w2;	//right bound
                while (mw < (w -= 4) && pixelCompareAndSet(w, targetcolor, fillcolor, data, length, data2)) {
                } //влево до края
                while (me > (e += 4) && pixelCompareAndSet(e, targetcolor, fillcolor, data, length, data2)) {
                } //вправо до края
                for (var j = w; j < e; j += 4) {
                    if (j - w2 >= 0 && pixelCompare(j - w2, targetcolor, data, length)) Q.push(j - w2); //вверх на 1
                    if (j + w2 < length && pixelCompare(j + w2, targetcolor, data, length)) Q.push(j + w2); //вниз на 1
                }
            }
        }

        this.paintCanvas.context.putImageData(img2, 0, 0); //отрисовываем результат
        this.tapDelay = true;
        var self = this;
        setTimeout(function () {
            self.tapDelay = false
        }, 300);

        /**
         * Сравнение пикселей на попадание
         * @param indexInPixelsArray
         * @param targetcolor
         * @param pixelsArray
         * @param lengthOfPixelsArray
         * @returns {boolean}
         */
        function pixelCompare(indexInPixelsArray, targetcolor, pixelsArray, lengthOfPixelsArray) {	//Сравнение пикселей на попадание
            if (indexInPixelsArray < 0 || indexInPixelsArray >= lengthOfPixelsArray) return false; //вне пределов

            if (
                (pixelsArray[indexInPixelsArray + 3] === 255) &&
                (targetcolor[0] === pixelsArray[indexInPixelsArray]  ) &&
                (targetcolor[1] === pixelsArray[indexInPixelsArray + 1]) &&
                (targetcolor[2] === pixelsArray[indexInPixelsArray + 2])
                ) return true; //попали в цвет

            return false; //нет совпадений
        }

        /**
         * Сравнение пикселей и присвоение цвета
         * @param indexInPixelsArray
         * @param targetcolor
         * @param fillcolor
         * @param pixelsArray
         * @param lengthOfPixelsArray
         * @param data2
         * @returns {boolean}
         */
        function pixelCompareAndSet(indexInPixelsArray, targetcolor, fillcolor, pixelsArray, lengthOfPixelsArray, data2) { //Сравнение пикселей и присвоение цвета
            if (pixelCompare(indexInPixelsArray, targetcolor, pixelsArray, lengthOfPixelsArray)) {
            
                pixelsArray[indexInPixelsArray] = fillcolor[0];
                pixelsArray[indexInPixelsArray + 1] = fillcolor[1];
                pixelsArray[indexInPixelsArray + 2] = fillcolor[2];
                pixelsArray[indexInPixelsArray + 3] = fillcolor[3];
                
                data2[indexInPixelsArray] = fillcolor[0];
                data2[indexInPixelsArray + 1] = fillcolor[1];
                data2[indexInPixelsArray + 2] = fillcolor[2];
                data2[indexInPixelsArray + 3] = fillcolor[3];
                return true;
            }
            return false;
        }
    };

    /**
     * рисуем круг с градиентной заливкой c цветом color и центром posX posY
     * @param posX
     * @param posY
     * @param color
     * @constructor
     */
    NarrColoringClass.prototype.NewDraw = function (posX, posY, color) { //рисуем круг с градиентной заливкой
        color = color || this.curentTool.toolcolor;
        var toolColor = this.getColor(color);
        var toolSoft = this.curentTool.toolsoft;
        var gradient = this.paintCanvas.context.createRadialGradient(posX, posY, 0, posX, posY, this.curentTool.toolsize);
		
        gradient.addColorStop(0, toolColor);
        gradient.addColorStop(toolSoft, toolColor);
        gradient.addColorStop(1, 'rgba(' + color[0] +","+ color[1] +","+ color[2] + ', 0)');
        this.paintCanvas.context.beginPath();
        this.paintCanvas.context.arc(posX, posY, this.curentTool.toolsize, 0, 2 * Math.PI);
        this.paintCanvas.context.fillStyle = gradient;
        this.paintCanvas.context.fill();
        this.paintCanvas.context.closePath();
    };


    /**
     * инструмент кисточка
     * @param posX
     * @param posY
     * @param isDrawing
     * @param color
     */
    NarrColoringClass.prototype.brushDraw = function (posX, posY, isDrawing, color) { //Кисточка
    
    	switch( isDrawing ){
    		case 1:
	            this.paintCanvas.context.globalAlpha = this.curentTool.toolopacity;
	            this.curentTool.pos = [posX, posY];
	            this.NewDraw(posX, posY, color);
	            this.curentTool.action = true;    		
    			break;
    		case 2:
	        	var dx = this.curentTool.pos[0] - posX;
	        	var dy = this.curentTool.pos[1] - posY;
	            var dis = Math.sqrt(dx*dx + dy*dy);
	            for (var i = 0; i < dis; i += this.curentTool.toolsize / 4) {
	                var s = i / dis;
	                this.NewDraw(this.curentTool.pos[0] * s + posX * (1 - s), this.curentTool.pos[1] * s + posY * (1 - s), color);
	            }
	            this.curentTool.pos = [posX, posY];    		
    			break;		
    		case 3:
    	        this.curentTool.action = false;
            	this.paintCanvas.context.globalAlpha = 1;
    	}  
    };

    /**
     * Получение RGBA цвета
     * @param color {array}
     * @returns {string}
     */
    NarrColoringClass.prototype.getColor = function (color) { //Получение RGBA цвета
        return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
    };

    /**
     * жест тап старт или пан старт
     * @param posX
     * @param posY
     * @returns {boolean}
     */
    NarrColoringClass.prototype.coloringStart = function (posX, posY) {

        switch (this.curentTool.tooltype) {
            case "brush":
                this.brushDraw(posX, posY, 1, false);
                break;
            case "erase":
                this.brushDraw(posX, posY, 1, [255, 255, 255, 255]);
                break;
            case "fill":
                if (posX < 0 || posY < 0 || posX > this.paintCanvas.width || posY > this.paintCanvas.height) return true;
                this.floodFill(posX, posY);
                break;
            case "stamp":
                //this.stampDraw(x, y);
                break;
            case "clear":
                this.clearcanvas();
                break;
            case "save":
                //this.saveImage();
                break;
        }

        return true;
    };

    /**
     * жест пан - движение
     * @param posX
     * @param posY
     * @returns {boolean}
     */
    NarrColoringClass.prototype.coloringMove = function (posX, posY) {

        if (!this.curentTool.action) return false; //кисть не поддерживает пан

/*
        posX = Math.floor(posX);
        posY = Math.floor(posY);
*/
        switch (this.curentTool.tooltype) {
            case "brush":
                this.brushDraw(posX, posY, 2, false);
                break;
            case "erase":
                this.brushDraw(posX, posY, 2, [255, 255, 255, 255]);
                break;
        }
        return true;
    };

    /**
     * жест конец пана
     * @param posX
     * @param posY
     * @returns {boolean}
     */
    NarrColoringClass.prototype.coloringEnd = function (posX, posY) {
/*
        posX = Math.floor(posX);
        posY = Math.floor(posY);
*/

        switch (this.curentTool.tooltype) {
            case "brush":
                this.brushDraw(posX, posY, 3, false);
                break;
            case "erase":
                this.brushDraw(posX, posY, 3, [255, 255, 255, 255]);
                break;

        }
        return false;
    };


    return NarrColoringClass;
});