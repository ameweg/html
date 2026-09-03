/// <reference path="../interfaces/EpubInt" />
/// <reference path="../interfaces/EpubHeadInt" />
/// <reference path="../base/CollectionControl" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../base/CollectionControl", "./pdf/PDFEpub"], function(require, exports, CollectionControl, PDFEpub) {
    var Epub = (function (_super) {
        __extends(Epub, _super);
        function Epub(content, node, pdfMode, singlePageMode, changeOptions) {
            _super.call(this);
            this.active = 0;
            this.collection = [];
            this.fontSize = 50;
            this.changeCallbacks = [];
            this.pageMode = singlePageMode;

            this.init(content, node, pdfMode, singlePageMode, changeOptions);
        }
        Epub.prototype.start = function () {
            if (this.has(this.active)) {
                this.getActive().show();
                this.change();
            }
        };

        Epub.prototype.jumpTo = function (page) {
            if (page !== this.active && this.has(page)) {
                var direction = page - this.active;
                this.getActive().hide(direction);
                this.active = page;
                this.getActive().show(direction);
            }
        };

        Epub.prototype.jumpByPercent = function (percent) {
            this.getActive().hide();
            var step = this.getStep();
            if (step === 100) {
                this.getActive().jumpByPercent(percent);
            }
            this.getActive().show();
        };

        Epub.prototype.onChange = function (callback) {
            this.changeCallbacks.push(callback);
        };

        Epub.prototype.getProgress = function () {
            return (this.getStep() * this.active) + this.getActive().getProgress(this.getStep());
        };

        Epub.prototype.getState = function () {
            return {
                activeHead: this.active,
                activeSlide: this.getActive().getActiveIndex(),
                fontSize: this.fontSize,
                singlePageMode: this.pageMode
            };
        };

        Epub.prototype.change = function () {
            var state = this.getState();
            var progress = this.getProgress();
            this.changeCallbacks.forEach(function (callback) {
                callback(state, progress);
            });
        };

        Epub.prototype.loadByState = function (state) {
            var direction = state.activeHead - this.active;
            this.getActive().hide(direction);
            this.active = state.activeHead;
            this.getActive().jumpTo(state.activeSlide);
        };

        Epub.prototype.setSingePageMode = function (mode) {
            if (mode != this.pageMode) {
                this.pageMode = mode;
                this.getActive().hide();
                this.collection.forEach(function (head) {
                    head.setSingePageMode(mode);
                });
                this.change();
                this.getActive().show();
            }
        };

        Epub.prototype.getStep = function () {
            return this.collection.length <= 1 ? 100 : (100 / (this.collection.length - 1));
        };

        Epub.prototype.init = function (content, node, pdfMode, singlePageMode, changeOptions) {
            if (pdfMode) {
                this.collection.push(new PDFEpub(this, content, node, singlePageMode, changeOptions));
            } else {
                content.forEach(function (headText) {
                    //                this.collection.push(new EpubHead(this, headText, node, singlePageMode, changeOptions));
                }.bind(this));
            }
        };
        return Epub;
    })(CollectionControl);
    
    return Epub;
});
//# sourceMappingURL=Epub.js.map
