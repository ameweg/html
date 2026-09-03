define(["dom", "base", "./EpubManager", "underscore", "../utils/modules/columinizer", "../utils/modules/ImageLoader", "utils/Utils"], function ($, Base, EpubManager, _, Columinizer, ImageLoader, Utils) {
    /**
     * @class NarrEpub
     * @extends {AnimateObject}
     */
    var NarrEpub = Utils.newObjectType(NarrEpub, "NarrEpub", {withCss: true});

    /**
     * Проверяем наше ли это событие
     * @param {Object} e
     * @param {String} gesture
     * @returns {Object|Boolean}
     */
    NarrEpub.prototype.customHittest = function (e, gesture) {
        if (gesture == "NarrEpubTap" ||
            gesture == "NarrEpubPan") {
            return e;
        } else {
            return false;
        }
    };

    /**
     * Инициализация экземпляров книгочиталки
     * @param {Object} description
     * @param {string} description.content
     * @param {string} description.src
     * @param {boolean} description.hasToolBar
     * @param {string} [description.path]
     * @param {string|Array} [description.styleName]
     */
    NarrEpub.prototype.init = function (description) {

        this.activeSlide = 0;
        this.rulerLengt = 320;

        this.description = description;

        this.description.size = {
            x: this.delegate.width,
            y: this.delegate.height
        };

        this.path = this.description.path || "epub/out";

        /**
         * @type {$}
         */
        this.$ = $(this.view);

        this.setHandlers();

        EpubManager.setEngine(this.delegate);

        EpubManager.registerScenes(this);

        if (this.hasToolBar()) {

            this.initDom()
                .addToolBar()
                .downloadImages()
                .addStyle("NarrEpub.css")
                .addColiminizer(Columinizer);

        } else {

            setTimeout(function () {
                if (!EpubManager.sorted) {
                    EpubManager.reformatNarrIndex();
                    EpubManager.sorted = true;
                    EpubManager.removeArrows();
                }
                this.defaultInit();
            }.bind(this), 0);
        }

        this.addStyle(this.description.styleName, this.path);

    };

    /**
     * Очищаем контент сцены (разбитый колуминайзером)
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.clearSlides = function () {
        if (this.hasToolBar()) {
            this.slideContainer.empty();
            this.slides = $();
        } else {
            this.$.empty();
        }
        return this;
    };

    NarrEpub.prototype.hasSceneContent = function () {
        return this.$.html() != "";
    };

    /**
     * Получает размеры картинки из атрибутов, которые были записаны при скачивании картинки
     * @param {HTMLElement} image
     * @returns {{width: Number, height: Number}}
     */
    NarrEpub.prototype.getImageSize = function (image) {
        var img = $(image);
        return {
            width: parseInt(img.attr("data-width")),
            height: parseInt(img.attr("data-height"))
        };
    };

    /**
     * Устанавливает размер картинки в текущем слайде или во всей сцене (елемент - тег с текущим слайдом)
     * @param {Number} size размер в процентах ( + 100%)
     * @param {$} [element] Если указан то увеличиваем картинки тут
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.setImageSize = function (size, element) {

        if (!this.coliminizer) {
            return this;
        }

        var maxSize = this.coliminizer.getSize();

        maxSize.width = parseInt(maxSize.width - (maxSize.width * 0.1));
        maxSize.height = parseInt(maxSize.height - (maxSize.height * 0.1));

        var images;

        if (element) {
            images = element.find("img");
        } else {
            images = this.content.find("img");
        }

        $.Each(images, function (image) {

            var newSize = {},
                oldSize = this.getImageSize(image),
                coff;

            newSize.width = oldSize.width * ((size + 100) / 100);
            newSize.height = oldSize.height * ((size + 100) / 100);

            if (this.isImagePlaced(newSize, maxSize)) {
                $(image).css({
                    "width": parseInt(newSize.width) + "px",
                    "height": parseInt(newSize.height) + "px"
                });
            } else {
                coff = this.currentScaleCoff(newSize, maxSize);

                $(image).css({
                    "width": parseInt(newSize.width * coff) + "px",
                    "height": parseInt(newSize.height * coff) + "px"
                });
            }

        }.bind(this));

        if (!element) {
            this.coliminizer.setContent(this.content);
        }

        return this;
    };

    /**
     * Запускаем подключение стилевых файлов
     * @param {String|Array} fileName
     * @param {String} [path]
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.addStyle = function (fileName, path) {

        if ($.isArray(fileName)) {
            fileName.forEach(function (fileName) {
                EpubManager.addStyle(fileName, path);
            });
            return this;
        }

        if (fileName) {
            EpubManager.addStyle(fileName, path);
        }

        return this;
    };

    /**
     * Добавляем колуминайзер
     * @params {Columinizer} Columinizer
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.addColiminizer = function (Columinizer) {

        if (this.hasContent()) {

            this.coliminizer = new Columinizer({
                width: this.description.size.x - 20,
                height: this.description.size.y - 70
            }, this.content, this.slideContainer);
        }

        if (this.hasContent()) {
            this.coliminizer.bind({
                "Columinizer:finish": function () {

                    if (this.narrIndex < EpubManager.getActiveScene()) {
                        this.activeSlide = this.slides.length - 1;
                    }
                    EpubManager.trigger("NarrEpub: kibble finished", this);

                }.bind(this),
                "Columinizer:column ready": function () {

                    this.slides = this.slideContainer.children();

                }.bind(this)
            });
        }

        return this;
    };

    /**
     * Увеличиваем текст в отображаемом блоке
     * @param {Number} size в процентах
     * @returns {boolean}
     */
    NarrEpub.prototype.showTextSize = function (size) {

        this.size = size;

        if (!this.contentNode) {
            return false;
        }

        this.setImageSize(size, this.contentNode);

        this.contentNode.css("font-size", 100 + size + "%");
    };

    /**
     * Передвигаем скроллер размера текста
     * @param {Number} left px
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.moveSizeControl = function (left) {
        this.sizeControl.css("left", left + "px");
        return this;
    };

    /**
     * Возвращает размер скроллбара для изменения размера текста в px
     * @returns {number}
     */
    NarrEpub.prototype.getRulerLength = function () {
        return this.rulerLengt - 70;
    };

    /**
     * Получаем сдвиг скроллера размера текста в процентах
     * @param {Number} left
     * @returns {number}
     */
    NarrEpub.prototype.getPercentByLeft = function (left) {
        return left * 100 / this.getRulerLength();
    };

    /**
     * Метод выбирает действие при клике
     * 1) скрыть/показать зум бар
     * 2) Показать предыдущий слайд
     * 3) показать следующий слайд
     * @param event
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.currentRect = function (event) {

        var clickToButton;

        $.iterationObj(this.buttons,
            /**
             * @param {$} button
             * @param {String} buttonName
             */
            function (button, buttonName) {
                if (this.hittestForRect({
                    left: button.offset().left - EpubManager.forTach.width,
                    top: button.parent().offset().top - EpubManager.forTach.height,//для тач
                    width: button.width() + EpubManager.forTach.width * 2,//для тач
                    height: button.height() + EpubManager.forTach.height * 2//для тач
                }, event)) {
                    clickToButton = buttonName;
                }
            }.bind(this)
        );

        if (clickToButton) {
            this.handlers[clickToButton].call(this);
        } else {

            if (this.clickToPlatform(event)) {
                return this;
            }

            if (event.x > this.$.width() / 2) {
                this.setActiveSlide(this.activeSlide + 1);
            } else {
                this.setActiveSlide(this.activeSlide - 1);
            }
        }

        return this;
    };

    NarrEpub.prototype.clickToPlatform = function (event) {

        if (event.x <= 150 && event.y <= 70) {
            this.delegate.navigation.showSettings();
            return true
        }
        if (event.x >= this.delegate.width - 150 && event.y <= 70) {
            this.delegate.navigation.showNavigation();
            return true
        }
        return false;
    };

    NarrEpub.prototype.handlers = {
        /**
         * Обработчик клика по кнопке изменения размера текста
         * @this NarrEpub
         * @returns {NarrEpub}
         */
        "size-button": function () {
            if (!this.isSizeBarVisible()) {
                this.sizeBar.show();
            } else {
                this.sizeBar.hide();
            }
            return this;
        },
        /**
         * Обработчик клика по кнопке share
         * @this NarrEpub
         * @return NarrEpub
         */
        "share-button": function () {
            return this;
        },
        /**
         * Обработчик начала движения
         * @param event
         * @returns {boolean}
         */
        dragStart: function (event) {

            if (!this.description.hasToolBar) {
                return false;
            }

            if (!this.isSizeBarVisible()) {
                return false;
            }

            EpubManager.trigger("NarrEpub: stop coliminizer", this);

            var left = this.sizeControl.css("left");

            if (left != "") {
                left = parseInt(left);
            } else {
                left = 0;
            }

            var offsetLeft = this.sizeRulers.offset().left + this.sizeBar.offset().left + 40 + left;
            var offsetTop = this.sizeBar.offset().top;

            return this.hittestForRect({
                left: offsetLeft - EpubManager.forTach.width,
                top: offsetTop - EpubManager.forTach.height,
                width: this.sizeControl.width() + EpubManager.forTach.width * 2,
                height: this.sizeControl.height() + EpubManager.forTach.height * 2
            }, event);
        },
        /**
         * Изменение размера текста
         * @this NarrEpub
         * @param {Object} event
         * @returns {NarrEpub}
         */
        move: function (event) {

            var left = (event.x - this.sizeRulers.offset().left - 30);

            if (left >= 0 && left <= this.getRulerLength()) {
                this.moveSizeControl(left);
                this.showTextSize(this.getPercentByLeft(left));
            } else {
                if (left > 0) {
                    this.sizeControl.css("left", this.getRulerLength() + "px");
                } else {
                    this.sizeControl.css("left", "0px");
                }
            }

            return this;
        },
        /**
         * Метод обрабатывает конец перемещения скроллера изменения размера текста
         * @this NarrEpub
         * @returns {NarrEpub}
         */
        dragEnd: function () {

            this.handlers["size-button"].call(this);
            EpubManager.trigger("NarrEpub:fontSize changed", [this, this.size, parseInt(this.sizeControl.css("left") || 0)]);

            return this;
        }
    };

    /**
     * Назначаем обработчики
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.setHandlers = function () {

        Utils.addBehaviour('pan', 'NarrEpub', 'NarrEpubPan', {
            start: function (event) {
                event.stopPropagation();
                return this.handlers.dragStart.call(this, event);
            },
            move: function (event) {
                this.handlers.move.call(this, event);
                event.stopPropagation();
            },
            swipe: function (event) {
                event.stopPropagation();
            },
            end: function (event) {
                this.handlers.dragEnd.call(this, event);
                event.stopPropagation();
            }
        }, false);

        Utils.addBehaviour('tap', 'NarrEpub', 'NarrEpubTap', {
            end: function (event) {
                this.currentRect(event);
            }
        }, false);

        return this;
    };

    /**
     * Проверяем видимый ли сейчас бар с изменением размера текста
     * @returns {boolean}
     */
    NarrEpub.prototype.isSizeBarVisible = function () {
        return this.sizeBar.css("display") == "block";
    };

    /**
     * Скачивает все картинки, после чего запускает разбивку по слайдам
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.downloadImages = function () {

        var imgs = this.content.find("img"),
            srcs = [],
            map = {};

        imgs.forEach(function (image) {
            map[image.src] = image;
            srcs.push(image.src);
        });

        if (!imgs.length) {
            EpubManager.trigger("NarrEpub: scene ready", this);
            return this;
        }

        this.imageLoader = new ImageLoader(srcs, this);

        this.imageLoader.bind(this.imageLoader.events.loaded, function (imageData, image, progress) {
            $(map[image.src]).css({
                "width": image.width + "px",
                "height": image.height + "px"
            }).attr({
                "data-width": image.width + "px",
                "data-height": image.height + "px"
            });
        }.bind(this));

        this.imageLoader.bind(this.imageLoader.events.allLoaded, function () {
            EpubManager.trigger("NarrEpub: scene ready", this);
            this.imageLoader.destroy();
            delete  this.imageLoader;
        }.bind(this));

        return this;
    };

    /**
     * Добавляем управляющие элементы
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.addToolBar = function () {

        var template =
                '<div class="tool-bar top">' +
                '    <div class="button settings"></div>' +
                '    <div class="button to-platform"></div>' +
                '</div>' +
                '    <div class="size-bar">' +
                '       <div class="size-ruler" style="width: <%= width %>px">' +
                '           <div class="size-control"></div>' +
                '       </div>' +
                '    </div>' +
                '<div class="tool-bar bottom">' +
                '    <div class="button prev-slide"></div>' +
                '    <div class="button size-button"></div>' +
                '    <div class="button next-slide"></div>' +
                '</div>',
            div, nodes;

        div = document.createElement("div");
        div.innerHTML = _.template(template)({width: this.rulerLengt});
        nodes = div.childNodes;

        do {

            this.$.append(nodes[0]);

        } while (0 in nodes);

        this.buttons = {
            "size-button": this.$.find(".size-button:first")
        };

        this.sizeBar = this.$.find(".size-bar:first");
        this.sizeControl = this.$.find(".size-control:first");
        this.sizeRulers = this.$.find(".size-ruler:first");

        return this;
    };

    /**
     * Метод инициализирует dom страницы и рассталяет стартовые стили
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.initDom = function () {

        this.description.content = this.description.content.replace(/class=.cover./g, "");

        this.content = $.createElement("DIV", "", "", this.fixImagePath(this.description.content));

        /**
         * Сюда будет вставляться слайд книги
         * @type {$}
         */
        this.contentNode = $.createElement("DIV", "epub-content scene" + EpubManager.getNarrIndex(this), {
            "width": this.description.size.x - 20 + "px",
            "height": this.description.size.y - 136 + "px"
        });

        /**
         * Хранит слайды сцены
         * @type {$}
         */
        this.slideContainer = $.createElement("DIV", "scenes scene" + EpubManager.getNarrIndex(this), "", "");

        this.$.empty();

        this.$.append(this.contentNode);

        return this;
    };

    /**
     * Разбиваем контент на слайды
     * @param {Boolean} [param] Разбиваем на слайды одним потоком или сначала только первый слайд
     */
    NarrEpub.prototype.kibbleContent = function (param) {

        var oldLength;

        if (this.slides) {
            oldLength = this.slides.length;
        }

        var ready = function (firstSlide) {

                this.contentNode.html(firstSlide.innerHTML);
                this.activeSlide = 0;

                this.coliminizer.unbind("Columinizer:column ready", ready);

            }.bind(this),
            finish = function () {

                var length = this.slides.length, diff = oldLength - length, newIndex;

                if (isNaN(diff) || diff == 0) {
                    this.addSlide(this.activeSlide);
                } else if (diff > 0) {

                    newIndex = parseInt(this.activeSlide / (oldLength / length));

                    if (this.hasSlide(newIndex)) {
                        this.setActiveSlide(newIndex);
                    } else {
                        console.error("Ошибочный индекс", newIndex);
                    }

                } else if (diff < 0) {

                    newIndex = parseInt(this.activeSlide * (length / oldLength));

                    if (this.hasSlide(newIndex)) {
                        this.setActiveSlide(newIndex);
                    } else {
                        console.error("Ошибочный индекс", newIndex);
                    }

                }

                this.coliminizer.unbind("Columinizer:finish", finish);

            }.bind(this);

        if (!param) {
            this.coliminizer.bind("Columinizer:column ready", ready);
        } else {
            this.coliminizer.bind("Columinizer:finish", finish);
        }

        if (this.coliminizer.getState() == "worked") {
            this.coliminizer.kibbleContent(true);
        } else {
            this.coliminizer.initKibble().kibbleContent(param);
        }

    };

    NarrEpub.prototype.getViewSize = function () {
        return {
            width: this.$.width(),
            height: this.$.height()
        };
    };

    /**
     * Рассчитывает коэфицент масштабирования
     * @param {Object} realSize
     * @property {Number} width
     * @property {Number} height
     * @param {Object} targetSize
     * @property {Number} width
     * @property {Number} height
     * @returns {number}
     */
    NarrEpub.prototype.currentScaleCoff = function (realSize, targetSize) {

        var coffX = targetSize.width / realSize.width,
            coffY = targetSize.height / realSize.height,
            coff = coffX > coffY ? coffY : coffX;

        return ((coff) - (coff * 0.02));
    };

    /**
     * Проверяем влезает ли картинка в блок
     * @param realSize размер картинки
     * @param maxSize размер блока
     * @returns {boolean}
     */
    NarrEpub.prototype.isImagePlaced = function (realSize, maxSize) {
        return (realSize.width <= maxSize.width && realSize.height <= maxSize.height);
    };

    /**
     * Масштабируем контент
     * @param content
     */
    NarrEpub.prototype.scaleContent = function (content) {

        content.css("position", "static");

        var size = this.getViewSize(),
            realSize = {
                width: content.width(),
                height: content.height()
            },
            coff = this.currentScaleCoff(realSize, size),
            delta = {
                x: size.width - realSize.width,
                y: size.height - realSize.height
            };

        content.parent().css({
            "left": delta.x / 2 + "px",
            "top": (delta.y / 2) - 3 + "px",
            "position": "absolute"
        }).css(brprefix + "transform", "scale3d(" + coff + "," + coff + ",1)");

    };

    /**
     * Функция переопределяет методы если нельзя менять размер текста
     */
    NarrEpub.prototype.defaultInit = function () {

        this.$.empty();

        if (!(EpubManager.firstComplit)) {
            EpubManager.setEngineHandlers();
            EpubManager.notToolBar();
            EpubManager.firstComplit = true;
            this.addContent();
        }

        this.hasSlide = function () {
            return false;
        };

        this.isSizeBarVisible = function () {
            return false;
        };

        this.buttons = {};

    };

    NarrEpub.prototype.addContent = function () {
        this.$.append($.createElement("DIV", "", "", this.fixImagePath(this.description.content)));
        this.scaleContent(this.$.firstChildren().firstChildren());
    };

    /**
     * Проверяет наличие туллбара
     * @returns {boolean}
     */
    NarrEpub.prototype.hasToolBar = function () {
        return !!this.description.hasToolBar;
    };

    /**
     * Проверяет наличие контента
     * @returns {*|boolean}
     */
    NarrEpub.prototype.hasContent = function () {
        return this.description.content && this.description.content.indexOf("<svg") == -1;
    };

    /**
     * Дописывает урл картинкам на папку epub/out/
     * @param {String} stringContent
     * @returns {string}
     */
    NarrEpub.prototype.fixImagePath = function (stringContent) {
        return stringContent
            .replace(/src="/g, "src=\"" + this.path + "/")
            .replace(/href="/g, "href=\"" + this.path + "/")
            .replace(/(url\(\W{0,1})/g, "$1" + this.path + "/")
            .replace(/\/\//g, "/")
            .replace(/\/\.\./g, "");
    };

    /**
     * Проыеряет наличие слайда
     * @params index
     * @returns {Boolean}
     */
    NarrEpub.prototype.hasSlide = function (index) {
        return this.slides && this.slides[index] && this.slides[index].childNodes.length != 0;
    };

    /**
     * Переключает на заданный слайд
     * если слайд не задан - на первый
     * @param {Number} index
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.setActiveSlide = function (index) {

        if (this.isSizeBarVisible()) {
            this.handlers["size-button"].call(this);
        }

        if (this.hasSlide(index)) {
            this.addSlide(index);
        } else {

            if (index < this.activeSlide) {
                EpubManager.trigger("NarrEpub: need prevScene", this);
                return this;
            }

            if (this.coliminizer && this.coliminizer.getState() == "worked") {

                this.waitLoadSlide(index);

            } else {

                EpubManager.trigger("NarrEpub: all slide readed", this);

            }
        }
        return this;
    };

    /**
     * Добавляем слайд в видимый контейнер
     * @param {Number} index
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.addSlide = function (index) {

        this.contentNode.empty();
        this.contentNode.append(this.slides.eq(index).clone());
        this.activeSlide = index;
        var elem = $(document.querySelector(".texts.simple.text_class_6"));
        if (elem.length) {
            $(elem).html(EpubManager.getNarrIndex(this) + "-" + (index + 1));
        }
        return this;
    };

    /**
     * Ожидаем загрузку слайда
     * @param index
     * @returns {NarrEpub}
     */
    NarrEpub.prototype.waitLoadSlide = function (index) {

        var ready = function () {
                if (this.hasSlide(index)) {

                    this.addSlide(index);

                    this.coliminizer.unbind("Columinizer:column ready", ready);
                    this.coliminizer.unbind("Columinizer:finish", finish);

                }
            }.bind(this),
            finish = function () {

                this.coliminizer.unbind("Columinizer:column ready", ready);
                this.coliminizer.unbind("Columinizer:finish", finish);

                EpubManager.trigger("NarrEpub: all slide readed", this);

            }.bind(this);

        this.coliminizer.bind({
            "Columinizer:column ready": ready,
            "Columinizer:finish": finish
        });

        return this;
    };

    return NarrEpub;
});