/// <reference path="../../interfaces/EpubHeadInt" />
/// <reference path="../../interfaces/EpubInt" />
/// <reference path="../../interfaces/EpubSlideInt" />
/// <reference path="../../base/Collection" />
/// <reference path="./PDFSlide" />
/// <reference path="../../../../../utils/domLite/DomLite.d.ts" />

import PDFSlide = require("./PDFSlide");
import Collection = require("../../base/Collection");

class PDFEpub extends Collection implements EpubHeadInt {

    private parent:EpubInt;
    private node:$;
    public collection:Array<EpubSlideInt>;
    public active:number;

    constructor(parent:EpubInt, content:Array<string>, node:HTMLElement, singlePage:boolean, changeOptions:any) {
        super();
        this.active = 0;
        this.parent = parent;
        this.node = $(node);
        this.collection = [];

        this.init(content, singlePage, changeOptions);
    }

    public next():void {
        this.jumpTo(this.active + 1);
    }

    public prev():void {
        this.jumpTo(this.active - 1);
    }

    public jumpTo(page:number):void {
        if (page !== this.active && this.has(page)) {
            var direction:number = page - this.active;
            this.getActive().hide(direction);
            this.active = page;
            this.getActive().show(direction);
            this.getEpub().change();
        }
    }

    public getProgress(step:number) {
        return this.getStep(step) * this.active;
    }

    private getStep(step:number) {
        return (step / (this.collection.length - 1));
    }

    public hide(direction?:number) {
        this.getActive().hide(direction);
    }

    public show(direction?:number) {
        this.getActive().show(direction);
    }

    public jumpByPercent(percent:number):void {
        var step:number = this.getStep(100);
        this.active = Math.floor(percent/step);
    }

    public getEpub() {
        return this.parent;
    }

    public setSingePageMode(mode:boolean):void {
        var newCollection:Array<EpubSlideInt> = [];
        if (mode) {
            this.active = Math.max(this.active * 2 - 1, 0);
            this.collection.forEach(function (slide:EpubSlideInt) {
                newCollection.push(slide);
                if (slide.hesTwoPage()) {
                    newCollection.push(new PDFSlide(this, this.node, $.createElement("div", "slide", true).append(slide.getTwoPage()), slide.getChangeOptions()));
                }
            }.bind(this));
        } else {
            this.active = Math.floor(this.active / 2);
            var slide:EpubSlideInt;
            for (var i = 0; i < this.collection.length; i+=2) {
                slide = this.collection[i];
                newCollection.push(slide);
                if (this.collection[i + 1]) {
                    slide.setTwoPage(this.collection[i+1].getTwoPage());
                }
            }
        }
        this.collection = newCollection;
        this.collection.forEach(function (slide:EpubSlideInt) {
            slide.currentNodeWidth();
        });
    }

    private init(content:Array<string>, singlePage:boolean, changeOptions:any):void {

        var slides:Array<$> = singlePage ? PDFEpub.getSingleSlides(content) : PDFEpub.getMultiSlides(content);

        slides.forEach(function (slideElement:$) {

            this.collection.push(new PDFSlide(this, this.node, slideElement, changeOptions));

        }.bind(this));

    }

    static getSingleSlides(content:Array<string>) {
        var result:Array<$> = [];
        content.forEach(function (slide:string) {
            result.push($.createElement("div", "slide", true).append($.parseHTML(slide, true).addClass("slide-wrapper")));
        });
        return result;
    }

    static getMultiSlides(content:Array<string>) {
        var result:Array<$> = [];
        var slide:$;

        for (var i = 0; i < content.length; i+=2) {
            slide = $.createElement("div", "slide", true).append($.createElement("div", "slide-wrapper", true).append(content[i]));
            if (content[i+1]) {
                slide.append($.createElement("div", "slide-wrapper", true).append(content[i + 1]));
            }
            result.push(slide);
        }

        return result;
    }

}

export = PDFEpub;