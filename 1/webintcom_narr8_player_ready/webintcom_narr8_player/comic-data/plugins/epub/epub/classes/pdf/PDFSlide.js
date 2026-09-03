/// <reference path="./PDFEpub" />
/// <reference path="../../interfaces/EpubSlideInt" />
/// <reference path="../../interfaces/EpubHeadInt" />
/// <reference path="../../../../../utils/domLite/DomLite.d.ts" />
define(["require", "exports"], function(require, exports) {
    var PDFSlide = (function () {
        function PDFSlide(parent, targetNode, node, changeOptions) {
            this.parent = parent;
            this.targetNode = targetNode;
            this.node = node;
            this.changeOptions = changeOptions;
            this.default_width = 703;
            this.default_height = 1024;

            this.init();
        }
        PDFSlide.prototype.init = function () {
            this.currentNodeWidth();
            this.targetNode.append(this.node);
        };

        PDFSlide.prototype.currentNodeWidth = function () {
            this.node.css("width", Math.floor((this.default_width * this.node.find(".slide-wrapper").length) + 1) + "px");
            this.dropScale();
        };

        PDFSlide.prototype.dropScale = function () {
            this.coff = 0;
        };

        PDFSlide.prototype.show = function () {
            this.node.addClass("active");
            PDFSlide.setWidth(this.node);
            this.scale(this.node.node.clientWidth, this.node.node.clientHeight);
        };

        PDFSlide.prototype.hide = function () {
            this.node.removeClass("active");
        };

        PDFSlide.prototype.hesTwoPage = function () {
            return this.node.find(".slide-wrapper").length == 2;
        };

        PDFSlide.prototype.getTwoPage = function () {
            var pages = this.node.find(".slide-wrapper");
            if (pages.length === 1) {
                this.node.remove();
                return pages[0];
            } else {
                return pages[1];
            }
        };

        PDFSlide.prototype.setTwoPage = function (page) {
            this.node.append(page);
        };

        PDFSlide.prototype.getChangeOptions = function () {
            return this.changeOptions;
        };

        PDFSlide.prototype.scale = function (width, height) {
            var realWidth = this.targetNode.node.clientWidth;
            var realHeight = this.targetNode.node.clientHeight;
            var coff = Math.min(realWidth / width, realHeight / height);
            var newWidth = width * coff;
            var newHeight = height * coff;
            var delta = Math.min(width - newWidth, height - newHeight) / 2;

            if (!this.coff || this.coff != coff) {
                this.coff = coff;
                this.node.css({
                    transform: "scale(" + coff + "," + coff + ")",
                    position: "absolute",
                    left: ((realWidth - width) / 2) + "px",
                    top: ((realHeight - height) / 2) + "px"
                });
            }
        };

        PDFSlide.prototype.getEpub = function () {
            return this.parent.getEpub();
        };

        PDFSlide.setWidth = function (slide) {
            var width = 0;
            var wrappers = slide.find(".slide-wrapper");
            for (var i = 0; i < wrappers.length; i++)
                width += wrappers[i].node.clientWidth;
            slide.css("width", width + "px");
        };
        return PDFSlide;
    })();

    
    return PDFSlide;
});
//# sourceMappingURL=PDFSlide.js.map
