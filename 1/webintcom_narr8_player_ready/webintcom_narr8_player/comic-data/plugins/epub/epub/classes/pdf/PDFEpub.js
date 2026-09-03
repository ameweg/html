/// <reference path="../../interfaces/EpubHeadInt" />
/// <reference path="../../interfaces/EpubInt" />
/// <reference path="../../interfaces/EpubSlideInt" />
/// <reference path="../../base/Collection" />
/// <reference path="./PDFSlide" />
/// <reference path="../../../../../utils/domLite/DomLite.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./PDFSlide", "../../base/Collection"], function(require, exports, PDFSlide, Collection) {
    var PDFEpub = (function (_super) {
        __extends(PDFEpub, _super);
        function PDFEpub(parent, content, node, singlePage, changeOptions) {
            _super.call(this);
            this.active = 0;
            this.parent = parent;
            this.node = $(node);
            this.collection = [];

            this.init(content, singlePage, changeOptions);
        }
        PDFEpub.prototype.next = function () {
            this.jumpTo(this.active + 1);
        };

        PDFEpub.prototype.prev = function () {
            this.jumpTo(this.active - 1);
        };

        PDFEpub.prototype.jumpTo = function (page) {
            if (page !== this.active && this.has(page)) {
                var direction = page - this.active;
                this.getActive().hide(direction);
                this.active = page;
                this.getActive().show(direction);
                this.getEpub().change();
            }
        };

        PDFEpub.prototype.getProgress = function (step) {
            return this.getStep(step) * this.active;
        };

        PDFEpub.prototype.getStep = function (step) {
            return (step / (this.collection.length - 1));
        };

        PDFEpub.prototype.hide = function (direction) {
            this.getActive().hide(direction);
        };

        PDFEpub.prototype.show = function (direction) {
            this.getActive().show(direction);
        };

        PDFEpub.prototype.jumpByPercent = function (percent) {
            var step = this.getStep(100);
            this.active = Math.floor(percent / step);
        };

        PDFEpub.prototype.getEpub = function () {
            return this.parent;
        };

        PDFEpub.prototype.setSingePageMode = function (mode) {
            var newCollection = [];
            if (mode) {
                this.active = Math.max(this.active * 2 - 1, 0);
                this.collection.forEach(function (slide) {
                    newCollection.push(slide);
                    if (slide.hesTwoPage()) {
                        newCollection.push(new PDFSlide(this, this.node, $.createElement("div", "slide", true).append(slide.getTwoPage()), slide.getChangeOptions()));
                    }
                }.bind(this));
            } else {
                this.active = Math.floor(this.active / 2);
                var slide;
                for (var i = 0; i < this.collection.length; i += 2) {
                    slide = this.collection[i];
                    newCollection.push(slide);
                    if (this.collection[i + 1]) {
                        slide.setTwoPage(this.collection[i + 1].getTwoPage());
                    }
                }
            }
            this.collection = newCollection;
            this.collection.forEach(function (slide) {
                slide.currentNodeWidth();
            });
        };

        PDFEpub.prototype.init = function (content, singlePage, changeOptions) {
            var slides = singlePage ? PDFEpub.getSingleSlides(content) : PDFEpub.getMultiSlides(content);

            slides.forEach(function (slideElement) {
                this.collection.push(new PDFSlide(this, this.node, slideElement, changeOptions));
            }.bind(this));
        };

        PDFEpub.getSingleSlides = function (content) {
            var result = [];
            content.forEach(function (slide) {
                result.push($.createElement("div", "slide", true).append($.parseHTML(slide, true).addClass("slide-wrapper")));
            });
            return result;
        };

        PDFEpub.getMultiSlides = function (content) {
            var result = [];
            var slide;

            for (var i = 0; i < content.length; i += 2) {
                slide = $.createElement("div", "slide", true).append($.createElement("div", "slide-wrapper", true).append(content[i]));
                if (content[i + 1]) {
                    slide.append($.createElement("div", "slide-wrapper", true).append(content[i + 1]));
                }
                result.push(slide);
            }

            return result;
        };
        return PDFEpub;
    })(Collection);

    
    return PDFEpub;
});
//# sourceMappingURL=PDFEpub.js.map
