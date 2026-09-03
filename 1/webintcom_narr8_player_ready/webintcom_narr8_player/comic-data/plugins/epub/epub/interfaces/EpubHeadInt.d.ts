/// <reference path="./EpubInt" />

interface EpubHeadInt {

    next():void;
    prev():void;
    jumpTo(page:number):void
    getActiveIndex():number;
    hasNext():boolean;
    hasPrev():boolean;
    has(slide:number):boolean;
    hide(direction?:number):void;
    show(direction?:number):void;
    getEpub():EpubInt;
    setSingePageMode(mode:boolean):void;
    getProgress(step:number):number;
    jumpByPercent(percent:number):void;

}