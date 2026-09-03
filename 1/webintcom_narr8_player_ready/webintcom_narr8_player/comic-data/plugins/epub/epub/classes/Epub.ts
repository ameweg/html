/// <reference path="../interfaces/EpubInt" />
/// <reference path="../interfaces/EpubHeadInt" />
/// <reference path="../base/CollectionControl" />

import CollectionControl = require("../base/CollectionControl");
import PDFEpub = require("./pdf/PDFEpub");

class Epub extends CollectionControl implements EpubInt {

    public active:number;
    public collection:Array<EpubHeadInt>;
    private fontSize:number;
    private changeCallbacks:Array<(state:StateInt, progress:number) => any>;
    private pageMode:boolean;

    constructor(content:Array<string>, node:HTMLElement, pdfMode:boolean, singlePageMode:boolean, changeOptions:any) {
        super();
        this.active = 0;
        this.collection = [];
        this.fontSize = 50;
        this.changeCallbacks = [];
        this.pageMode = singlePageMode;

        this.init(content, node, pdfMode, singlePageMode, changeOptions);
    }

    public start():void {

        if (this.has(this.active)) {
            this.getActive().show();
            this.change();
        }

    }

    public jumpTo(page:number):void {
        if (page !== this.active && this.has(page)) {
            var direction:number = page - this.active;
            this.getActive().hide(direction);
            this.active = page;
            this.getActive().show(direction);
        }
    }

    public jumpByPercent(percent:number):void {
        this.getActive().hide();
        var step:number = this.getStep();
        if (step === 100) {
            this.getActive().jumpByPercent(percent);
        }
        this.getActive().show();
    }

    public onChange(callback:(state:StateInt, progress:number) => void):void {
        this.changeCallbacks.push(callback);
    }

    public getProgress() {
        return (this.getStep() * this.active) + this.getActive().getProgress(this.getStep());
    }

    public getState() {
        return {
            activeHead: this.active,
            activeSlide: this.getActive().getActiveIndex(),
            fontSize: this.fontSize,
            singlePageMode: this.pageMode
        }
    }

    public change():void {
        var state:StateInt = this.getState();
        var progress:number = this.getProgress();
        this.changeCallbacks.forEach(function (callback:(state:StateInt, progress:number) => void) {
            callback(state, progress);
        });
    }

    public loadByState(state:StateInt):void {
        var direction = state.activeHead - this.active;
        this.getActive().hide(direction);
        this.active = state.activeHead;
        this.getActive().jumpTo(state.activeSlide);
    }

    public setSingePageMode(mode:boolean) {
        if (mode != this.pageMode) {
            this.pageMode = mode;
            this.getActive().hide();
            this.collection.forEach(function (head:EpubHeadInt) {
                head.setSingePageMode(mode);
            });
            this.change();
            this.getActive().show();
        }
    }

    private getStep() {
        return this.collection.length <= 1 ? 100 : (100 / (this.collection.length - 1));
    }

    private init(content:Array<string>, node:HTMLElement, pdfMode:boolean, singlePageMode:boolean, changeOptions:any):void {

        if (pdfMode) {
            this.collection.push(new PDFEpub(this, content, node, singlePageMode, changeOptions));
        } else {
            content.forEach(function (headText:string) {
//                this.collection.push(new EpubHead(this, headText, node, singlePageMode, changeOptions));
            }.bind(this));
        }

    }

}
export = Epub;