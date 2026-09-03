/// <reference path="../../../../utils/domLite/DomLite.d.ts" />

interface EpubSlideInt {

    hide(direction?:number):void;
    show(direction?:number):void;

    hesTwoPage():boolean;

    getTwoPage():$;
    setTwoPage(page:$):void;

    getChangeOptions():any;
    currentNodeWidth():void;

}