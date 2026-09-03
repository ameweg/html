/**
 * Created by daniil on 08.07.14.
 */
define(["dom", "base"], function ($, Base) {

    /**
     * @class EpubManager
     * @extends Base
     */
    var EpubManager = Base.extend({
        /**
         * @constructor
         */
        constructor: function EpubManager() {

            this.styleList = {};
            this.narrScenes = {};
            this.activeScene = 0;

            this.defaultFontSize = 50;
            this.forTach = {
                width: 100, height: 70
            };

            this.setHandlers();
        },

        /**
         * Добавляем ссылку на движок
         * @param {Engine} engine
         * @returns {EpubManager}
         */
        setEngine: function (engine) {
            if (!this.engine) {
                this.engine = engine;
            }
            return this;
        },

        /**
         * Устанавливаем размер рабочей области и размер для колуминайзера
         * @returns {EpubManager}
         */
        setNarrSize: function () {

            var width = this.narrScenes[0].scene.view.clientWidth - 20,
                height = this.narrScenes[0].scene.view.clientHeight - 152;

            $.iterationObj(this.narrScenes,
                /**
                 * @param item
                 */
                    function (item) {

                    item.scene.contentNode.css({
                        width: width + "px",
                        height: height + "px"
                    });

                    if (item.scene.coliminizer) {
                        item.scene.coliminizer.setSize({
                            width: width,
                            height: height
                        });
                    }

                });

            return this;

        },

        /**
         * Устанавливаем всем сценам слайдехранилище, которое не меняется при переходе по сценам
         * @returns {EpubManager}
         */
        setSlideContainer: function () {

            var scenes = this.getScenesWithColiminizer(),
                container;

            if (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPad") != -1) {
                container = document.body;
            } else {
                container = this.narrScenes[0].scene.view.parentNode.parentNode;
            }

            scenes.forEach(function (scene) {

                container.appendChild(scene.slideContainer.get(0));

            });

            return this;
        },

        /**
         * Устанавливает размер текста и положение скроллера
         * @param {Number} size
         * @param {Number} [left]
         * @returns {EpubManager}
         */
        setFontSize: function (size, left) {

            $.iterationObj(this.narrScenes,
                /**
                 * @param {{scene: NarrEpub}} item
                 */
                 function (item) {

                    if (!left) {
                        left = item.scene.getRulerLength() * (size / 100);
                    }

                    item.scene.setImageSize(size);

                    item.scene.moveSizeControl(left);
                    item.scene.slideContainer.css("font-size", 100 + size + "%");
                    item.scene.contentNode.css("font-size", 100 + size + "%");

                });

            return this;
        },

        /**
         * Ищем зарегистрированный NarrEpub
         * @param {NarrEpub} narr
         * @returns {Object}
         */
        findNarr: function (narr) {

            var NarrObject;
            for (var narrIndex in this.narrScenes) {
                if (this.narrScenes.hasOwnProperty(narrIndex)) {
                    if (narr === this.narrScenes[narrIndex].scene) {
                        NarrObject = this.narrScenes[narrIndex];
                        delete this.narrScenes[narrIndex];
                        return NarrObject;
                    }
                }
            }

            return false;
        },

        removeArrows: function () {
            this.engine.fireEvent('pauseLock');
        },

        /**
         * Сортируем ключи (циферные) narrScenes в порядке сцен в Engine
         * @returns {EpubManager}
         */
        reformatNarrIndex: function () {

            var narrObjects = [];

            this.engine.scenes.forEach(function (scene) {

                for (var objName in scene.objects) {

                    if (scene.objects.hasOwnProperty(objName)) {
                        var obj = this.findNarr(scene.objects[objName].anObj);
                        if (obj) {
                            obj.scene.narrIndex = narrObjects.length;
                            narrObjects.push(obj);
                            break;
                        }
                    }

                }

            }.bind(this));

            this.narrScenes = narrObjects;

            return this;
        },

        /**
         * Назначаем обработчики
         * @returns EpubManager
         */
        setHandlers: function () {

            this.bind({
                /**
                 * Все сцены проинициализированны
                 * Картинуи всех книг загружены
                 */
                "Manager: All scenes ready": function () {

                    setTimeout(function () {

                        this.removeArrows();

                        this.reformatNarrIndex()
                            .setSlideContainer()
                            .setNarrSize()
                            .setFontSize(this.defaultFontSize)
                            .startKibbleScenes()
                            .unbind("Manager: All scenes ready")
                            .setEngineHandlers();

                    }.bind(this), 0);

                }.bind(this),

                /**
                 * Закончена разбивка контента одной из книг
                 * Запускаем разбивку следующей, если она есть
                 */
                "NarrEpub: kibble finished": function (epub) {

                    this.narrScenes[this.getNarrIndex(epub)].kibbleDone = true;
                    this.startKibbleScenes();

                }.bind(this),

                /**
                 * Изменён размер текста в книге
                 * Останавливаем разбивку всех контенов и запускаем её заново
                 */
                "NarrEpub:fontSize changed": function (epub, size, left) {

                    this.dropKibble().setFontSize(size, left).startKibbleScenes();

                }.bind(this),

                /**
                 * Сцена прочитана, переходим к следующей
                 */
                "NarrEpub: all slide readed": function () {

                    if (this.hasNextScene()) {
                        this.setNextScene();
                    }

                }.bind(this),

                /**
                 * Сцена готова
                 */
                "NarrEpub: scene ready": function (epub) {

                    var allReady = true;

                    this.narrScenes[this.getNarrIndex(epub)].imgLoaded = true;

                    $.iterationObj(this.narrScenes, function (item) {
                        if (!item.imgLoaded) {
                            allReady = false;
                        }
                    });

                    if (allReady && this.getNarrLength()) {
                        this.trigger("Manager: All scenes ready");
                        this.unbind("NarrEpub: scene ready");
                    }

                }.bind(this),

                /**
                 * Предыдущая сцена
                 */
                "NarrEpub: need prevScene": function () {

                    if (this.hasPrevScene()) {
                        this.setPrevScene();
                    }

                }.bind(this),

                /**
                 * Приостонавливаем разбивку на слайды
                 */
                "NarrEpub: payse coliminizer": function () {

                    this.kibblePause();

                }.bind(this),

                /**
                 * Запускаем разбивку на слайды
                 */
                "NarrEpub: play coliminizer": function () {

                    this.kibblePlay();

                }.bind(this),

                /**
                 * Останавливаем разбивку на слайды
                 * Обнуляем статус разбивки
                 */
                "NarrEpub: stop coliminizer": function () {

                    this.dropKibble();

                }.bind(this)

            });

            return this;
        },

        /**
         * Устанавливаем обработчики на события движка
         */
        setEngineHandlers: function () {

            this.engine.addEventListener("jumpToScene", function () {
                this.clearScenes();
                this.trigger("EpubManager: SceneChanged");
                this.startKibbleScenes();
            }.bind(this), this);

        },

        notToolBar: function () {

            this.bind("EpubManager: SceneChanged", function () {

                var activeScene;

                activeScene = this.getEpubBySceneNumber(this.getActiveScene());

                if (!activeScene.hasSceneContent()) {
                    activeScene.addContent();
                }
            });
        },

        getEpubBySceneNumber: function (sceneNumber) {
            if (this.narrScenes[sceneNumber]) {
                return this.narrScenes[sceneNumber].scene;
            }
        },

        clearScenes: function () {

            $.iterationObj(this.narrScenes,
                /**
                 * @param {{scene: NarrEpub, kibbleDone: Boolean, imgLoaded: Boolean}} item
                 * @param {String} index
                 */
                function (item, index) {

                    index = parseInt(index);

                    if (!item.kibbleDone) {
                        return false;
                    }

                    if (item.scene.hasToolBar()) {
                        if (!item.scene.coliminizer) {
                            return false;
                        }
                    }

                    if (Math.abs(this.getActiveScene() - index) > 1) {
                        item.scene.clearSlides();
                        if (item.scene.hasToolBar()) {
                            item.kibbleDone = false;
                        }
                    }

                }.bind(this));

        },

        /**
         * Приостонавливаем разбивку на слайды
         * @returns {EpubManager}
         */
        kibblePause: function () {

            var scenes = this.getSceneForKibble();

            scenes.forEach(function (scene) {
                scene.coliminizer.pause();
            });

            return this;
        },

        /**
         * Запускаем разбивку на слайды
         * @returns {EpubManager}
         */
        kibblePlay: function () {

            var scenes = this.getSceneForKibble();

            scenes.forEach(function (scene) {
                scene.coliminizer.play();
            });

            return this;

        },

        /**
         * Получаем количество ключей объекта
         * @param {Object} object
         * @returns {Number}
         */
        getObjNameCount: function (object) {
            return Object.getOwnPropertyNames(object).length
        },

        /**
         * Получаем количество зарегистрированных сцен
         * @returns {Number}
         */
        getNarrLength: function () {
            return this.getObjNameCount(this.narrScenes);
        },

        /**
         * Проверяем наличие сл. сцены
         * @returns {boolean}
         */
        hasNextScene: function () {
            return ((this.activeScene + 1) in this.narrScenes);
        },

        /**
         * Проверяем наличие предыдущей сцены
         * @returns {boolean}
         */
        hasPrevScene: function () {
            return ((this.activeScene - 1) in this.narrScenes);
        },

        /**
         * Устанавливает предыдущую сцену
         * @returns {EpubManager}
         */
        setNextScene: function () {
            return this.setScene(this.activeScene + 1);
        },

        /**
         * Устанавливает следующую сцену
         * @returns {EpubManager}
         */
        setPrevScene: function () {
            return this.setScene(this.activeScene - 1);
        },

        /**
         * Устанавливает сцену
         * @param index
         * @returns {EpubManager}
         */
        setScene: function (index) {

            index = index || 0;

            this.activeScene = index;
            this.engine.jumpToScene(index);

            return this;
        },

        /**
         * Проверяем является ли сцена активной
         * @param epub
         * @returns {boolean}
         */
        isActive: function (epub) {
            return this.getNarrIndex(epub) === this.activeScene;
        },

        /**
         * Добавляем стилевой файл
         * Добавляется только 1 файл с 1 именем
         * @param {String} fileName
         * @param {String} [path]
         * @returns {EpubManager}
         */
        addStyle: function (fileName, path) {

            var href;

            if (!(fileName in this.styleList)) {

                var time = new Date().getTime();
                this.styleList[fileName] = document.createElement('link');
                this.styleList[fileName].rel = 'stylesheet';

                if (path) {
                    href = path + "/" + fileName + "?" + time;
                    href = href.replace(/\/\//g, "/");
                    this.styleList[fileName].href = href;
                } else {
                    this.styleList[fileName].href = window.engineAdditionalURL + 'plugins/' + fileName + "?" + time;
                }

                document.head.appendChild(this.styleList[fileName]);
            }
            return this;
        },

        /**
         * Останавливаем разбивку контента во всех сценах
         * @returns {EpubManager}
         */
        dropKibble: function () {

            $.iterationObj(this.narrScenes, function (item) {

                if (!item.scene.coliminizer) {
                    return false;
                }

                if (item.scene.coliminizer.getState() == "worked") {
                    item.scene.coliminizer.close();
                }

                item.kibbleDone = false;

            });

            return this;
        },

        /**
         * Получаем объект сцен для переразбивки контента
         * @returns {[NarrEpub]}
         */
        getSceneForKibble: function () {

            var scenes = [];

            $.iterationObj(this.narrScenes, function (item, index) {
                if (!item.kibbleDone && item.scene.coliminizer.getState() != "worked") {
                    scenes[index] = item.scene;
                }
            });

            return scenes;
        },

        /**
         * Получаем массив сцен в которых есть колуминайзер
         * @returns {[NarrEpub]}
         */
        getScenesWithColiminizer: function () {

            var scenes = [];

            $.iterationObj(this.narrScenes,
                /**
                 * @param {{scene: NarrEpub}} item
                 */
                    function (item) {
                    if (item.scene.hasContent()) {
                        scenes.push(item.scene);
                    }
                });

            return scenes;
        },

        /**
         * Регистрируем объекты управления сценами
         * @param {NarrEpub} narrEpub
         * @returns {EpubManager}
         */
        registerScenes: function (narrEpub) {

            var length = this.getNarrLength();
            this.narrScenes[length] = {
                kibbleDone: this.needKibble(narrEpub),
                scene: narrEpub,
                imgLoaded: !narrEpub.hasContent()
            };

            return this;
        },

        /**
         * Проверяет необходимость разбивки контента на слайды
         * @param {NarrEpub} epub
         * @returns {boolean}
         */
        needKibble: function (epub) {
            if (!epub.description.hasToolBar) {
                return true;
            } else {
                return !epub.hasContent();
            }
        },

        /**
         * Возвращает номер сцены движка
         * @returns {number}
         */
        getActiveScene: function () {
            return this.engine.scene;
        },

        /**
         * Выбираем следующаю сцену для разбивки
         * Сцена выбирается:
         *   Следующая от активной
         *   Предыдущая от активной
         *     Через одну вперед от активной
         *     Через одну назад от активной
         */
        startKibbleScenes: function () {

            this.activeScene = this.getActiveScene();

            var scenes = this.getSceneForKibble(),
                indexFront = this.activeScene + 1,
                indexBack = this.activeScene - 1;

            if (this.getObjNameCount(scenes)) {
                if (this.activeScene in scenes) {
                    scenes[this.activeScene].kibbleContent(true);
                    return this;
                } else {
                    if (indexFront in scenes) {
                        scenes[indexFront].kibbleContent();
                        return this
                    }
                    if (indexBack in scenes) {
                        scenes[indexBack].kibbleContent();
                        return this
                    }
                }

            }

            return this;
        },

        /**
         * Получаем номер epub
         * @param narrEpub
         * @returns {Number}
         */
        getNarrIndex: function (narrEpub) {
            for (var index in this.narrScenes) {

                if (!this.narrScenes.hasOwnProperty(index)) {
                    continue;
                }

                if (this.narrScenes[index].scene === narrEpub) {
                    return parseInt(index);
                }
            }
        }
    });

    return new EpubManager();
});