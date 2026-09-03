define(["utils/Utils"], function (Utils) {
    var KIDSeqPlayer = Utils.newObjectType(KIDSeqPlayer, "KIDSeqPlayer");

    KIDSeqPlayer.prototype.init = function (description) {
        this._settings = description;

        /* Создание канваса */
        this._canvas = document.createElement("canvas");
        this.view.appendChild(this._canvas);
        this._canvas.width = this._settings.size.width;
        this._canvas.height = this._settings.size.height;

        var SequencePlayer = function (settings) {
            var _obj = this;

            // From ZeptoJS
            function extend(target) {
                Array.prototype.slice.call(arguments, 1).forEach(function (source) {
                    for (var key in source) {
                        if (source[key] !== undefined) {
                            target[key] = source[key];
                        }
                    }
                });
                return target
            }

            /**
             * Получение числа в заданном пределе. При непоподании в предел вернет значение близжайшего предела
             * @param {number} num Значение числа
             * @param {number} lowerLimit Нижний предел
             * @param {number} upperLimit Верхний предел
             * @return {number}
             */
            function numberInRange(num, lowerLimit, upperLimit) {
                return Math.max(Math.min(num, upperLimit), lowerLimit);
            }

            var canvas = settings.canvas;
            var ctx = canvas.getContext("2d");
            var canvasWidth = canvas.width;

            var curFrameIndex = 0,
                isIdle = true;
            var frameDim = {};
            var _settings = extend({
                extension: "jpg",
                folder: null,
                numberOfFrames: 0,
                bufferSize: 5,
                fps: 10
            }, settings);

            _settings.frameWidth = settings.frameWidth || canvas.width;
            _settings.frameHeight = settings.frameHeight || canvas.height;
            _settings.poster = settings.poster || 0;

            frameDim.x = (canvas.width - _settings.frameWidth) / 2;
            frameDim.y = (canvas.height - _settings.frameHeight) / 2;

            var callbacks = {
                play: [],
                pause: [],
                end: [],
                frameChange: []
            };

            var Buffer = (function () {
                var queue = [];

                function getFrameByKey(key) {
                    for (var i = 0, j = queue.length; i < j; i++) {
                        if (queue[i].key == key) {
                            return queue[i];
                        }
                    }
                    return undefined;
                }

                return {
                    add: function (key) {
                        if (getFrameByKey(key)) {
                            return;
                        }
                        // Удаление фрейма, превышающего буфер
                        if (queue.length >= _settings.bufferSize) {
                            queue.shift();
                        }
                        var frame = new Image();
                        frame.key = key;
                        frame.onload = function () {
                            frame.ready = true;
                            if (Buffer.onChange) {
                                Buffer.onChange();
                            }
                        };
                        frame.src = _settings.folder + "/" + (key + 1) + "." + _settings.extension;
                        queue.push(frame);
                    },
                    isFrameInQueue: function (key) {
                        return getFrameByKey(key);
                    },
                    get: function (key) {
                        if (getFrameByKey(key) && getFrameByKey(key).ready) {
                            return getFrameByKey(key);
                        }
                    },
                    /*clear: function(){
                     // Очистка массива
                     queue.length = 0;
                     },
                     size: function(){
                     return queue.length;
                     },*/
                    onChange: null,
                    queue: function () {
                        return queue;
                    },
                    update: function () {
                        var from = Math.max(curFrameIndex - Math.floor(_settings.bufferSize / 2), 0),
                            to = Math.min(curFrameIndex + Math.ceil(_settings.bufferSize / 2), _settings.numberOfFrames);

                        for (from; from < to; from++) {
                            if (!Buffer.isFrameInQueue(from)) {
                                Buffer.add(from);
                            }
                        }
                        //console.log(Buffer.queue().map(function(img){ return img.src.split("/")[8] }));
                    }
                };

            })();

            Buffer.update();

            function setPoster(poster) {
                if (typeof(poster) === "number") {
                    curFrameIndex = poster;
                    waitAndDrawFrame();
                } else {
                    var img = new Image();
                    img.onload = function () {
                        drawFrame(img);
                    };
                    img.src = poster;
                }
            }

            setPoster(_settings.poster);

            function drawFrame(frame) {
                // Аналог clearRect. На Андройде это работает быстрее и не падает
                canvas.width = canvasWidth;
                ctx.drawImage(frame, frameDim.x, frameDim.y, _settings.frameWidth, _settings.frameHeight);
            }

            function waitAndDrawFrame() {
                if (Buffer.get(curFrameIndex)) {
                    drawFrame(Buffer.get(curFrameIndex));
                } else {
                    Buffer.onChange = waitAndDrawFrame;
                    Buffer.update();
                    return;
                }
                Buffer.onChange = null;
                for (var i = 0; i < callbacks.frameChange.length; i++) {
                    callbacks.frameChange[i](curFrameIndex);
                }
            }

            this.play = function () {
                if (!isIdle) {
                    return;
                }
                isIdle = false;

                function drawNextFrame() {
                    if (isIdle) {
                        return;
                    }
                    var nextFrameIndex = curFrameIndex + 1;
                    if (nextFrameIndex < _settings.numberOfFrames) {
                        curFrameIndex = nextFrameIndex;
                        waitAndDrawFrame();
                        setTimeout(drawNextFrame, 1000 / _settings.fps);
                    } else {
                        _obj.stop();
                    }
                }

                if (curFrameIndex == _settings.numberOfFrames - 1) {
                    curFrameIndex = 0;
                }

                drawNextFrame();
                for (var i = 0; i < callbacks.play.length; i++) {
                    callbacks.play[i]();
                }
            };

            this.pause = function () {
                isIdle = true;
                for (var i = 0; i < callbacks.pause.length; i++) {
                    callbacks.pause[i]();
                }
            };

            this.stop = function () {
                isIdle = true;
                curFrameIndex = _settings.numberOfFrames - 1;
                waitAndDrawFrame();
                for (var i = 0; i < callbacks.end.length; i++) {
                    callbacks.end[i]();
                }
            };

            /**
             * Получить номер кадра
             * @return {number}
             */
            this.getCurrentFrame = function () {
                return curFrameIndex;
            };

            /**
             * Получить прогресс-позицию кадра
             * @return {number}
             */
            this.getCurrentProgress = function () {
                return curFrameIndex / (_settings.numberOfFrames - 1);
            };

            /**
             * Перейти на дельту кадров
             * @param {number} pos
             */
            this.seek = function (pos) {
                curFrameIndex = numberInRange(curFrameIndex + pos, 0, _settings.numberOfFrames - 1);
                waitAndDrawFrame();
            };

            /**
             * Перейти на номер кадра
             * @param {number} pos
             */
            this.seekTo = function (pos) {
                var newFrameIndex = numberInRange(pos, 0, _settings.numberOfFrames - 1);
                if (newFrameIndex != curFrameIndex) {
                    //console.log(pos);
                    curFrameIndex = newFrameIndex;
                    waitAndDrawFrame();
                }
            };

            /**
             * Перейти на прогресс-позицию
             * @param {number} pos Значение от 0 до 1
             */
            this.seekToProgress = function (pos) {
                var _pos = numberInRange(pos, 0, 1);
                var newFrameIndex = Math.ceil(_pos * (_settings.numberOfFrames - 1));
                if (newFrameIndex != curFrameIndex) {
                    curFrameIndex = newFrameIndex;
                    waitAndDrawFrame();
                }
            };
        };

        this.player = new SequencePlayer({
            canvas: this._canvas,
            folder: this._settings.folder,
            extension: this._settings.extension,
            fps: this._settings.fps,
            numberOfFrames: this._settings.numberOfFrames,
            bufferSize: 5/*,
             poster: null*/
        });
    };

    KIDSeqPlayer.prototype.KIDSeqPlayerOnTouchStart = function (e, obj) {
        e.stopPropagation();

        if (!this.area) {
            this.area = {
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height
            };

            /*document.getElementsByClassName("object")[0].style.overflow = "visible";
             var div = document.createElement("div");
             div.style.position = "absolute";
             div.style.left = this.area.left + "px";
             div.style.top = this.area.top + "px";
             div.style.width = this.area.width + "px";
             div.style.height = this.area.height + "px";
             div.style.backgroundColor = "rgba(255, 0, 0, .2)";
             this.view.appendChild(div);*/
        }

        this.touchX = this.getInternalCoordinatesForPoint(e).x - this.area.left;
        this.curFramePos = this.player.getCurrentProgress();
        return true;
    };

    KIDSeqPlayer.prototype.KIDSeqPlayerOnTouchMove = function (e) {
        e.stopPropagation();
        var cursorPosInObj = this.getInternalCoordinatesForPoint(e).x - this.area.left;
        var progress = this.curFramePos + (cursorPosInObj - this.touchX) / this.area.width;
        var cycleProgress = (progress + 1) % 1;
        this.animateTo("currentFrame", cycleProgress * this._settings.numberOfFrames, 0);
    };

    KIDSeqPlayer.prototype.KIDSeqPlayerOnTouchEnd = function (e, obj) {
        e.stopPropagation();
    };

    Utils.addBehaviour("pan", "KIDSeqPlayer", "KIDSeqPlayerPan", {
        start: function (e, obj) {
            return this.KIDSeqPlayerOnTouchStart(e, obj);
        },
        move: function (e) {
            this.KIDSeqPlayerOnTouchMove(e)
        },
        swipe: function (e) {
            e.stopPropagation();
            return true;
        },
        end: function (e, obj) {
            this.KIDSeqPlayerOnTouchEnd(e, obj)
        }
    }, false);

    KIDSeqPlayer.prototype.draw = function () {
        this.player.seekTo(Math.round(this.currentFrame - 1));
    };

    return KIDSeqPlayer;
});