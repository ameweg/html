/// <reference path="./PDFEpub" />
/// <reference path="../../interfaces/EpubSlideInt" />
/// <reference path="../../interfaces/EpubHeadInt" />
/// <reference path="../../../../../utils/domLite/DomLite.d.ts" />

class PDFSlide implements EpubSlideInt {

    private parent:EpubHeadInt;
    private targetNode:$;
    private node:$;
    private changeOptions:any;
    private default_width:number;
    private default_height:number;
    private coff:number;

    constructor(parent:EpubHeadInt, targetNode:$, node:$, changeOptions:any) {
        this.parent = parent;
        this.targetNode = targetNode;
        this.node = node;
        this.changeOptions = changeOptions;
        this.default_width = 703;
        this.default_height = 1024;

        this.init();
    }

    private  init() {
        this.currentNodeWidth();
        this.targetNode.append(this.node);
    }

    public currentNodeWidth():void {
        this.node.css("width", Math.floor((this.default_width * this.node.find(".slide-wrapper").length) + 1) + "px");
        this.dropScale();
    }

    private dropScale():void {
        this.coff = 0;
    }

    public show() {
        this.node.addClass("active");
        PDFSlide.setWidth(this.node);
        this.scale(this.node.node.clientWidth, this.node.node.clientHeight);
    }

    public hide() {
        this.node.removeClass("active");
    }

    public hesTwoPage() {
        return this.node.find(".slide-wrapper").length == 2;
    }

    public getTwoPage() {
        var pages:$$ = this.node.find(".slide-wrapper");
        if (pages.length === 1) {
            this.node.remove();
            return pages[0];
        } else {
            return pages[1];
        }
    }

    public setTwoPage(page:$):void {
        this.node.append(page);
    }

    public getChangeOptions() {
        return this.changeOptions;
    }

    private scale(width, height) {

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
    }

    private getEpub() {
        return this.parent.getEpub();
    }

    static setWidth(slide:$):void {
        var width:number = 0;
        var wrappers = slide.find(".slide-wrapper");
        for (var i = 0; i < wrappers.length; i++) width += wrappers[i].node.clientWidth;
        slide.css("width", width + "px");
    }
}

export = PDFSlide;