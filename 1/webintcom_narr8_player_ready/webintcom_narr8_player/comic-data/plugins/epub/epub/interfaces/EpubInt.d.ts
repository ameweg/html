interface StateInt {

    activeHead:number;
    activeSlide:number;
    fontSize:number;

}

interface EpubInt {

    next():void;
    prev():void;
    jumpTo(page:number):void;
    onChange(callback:(StateInt, progress:number) => void):void;
    getState():StateInt;
    getProgress():number;
    change():void;
    loadByState(state:StateInt):void;
    setSingePageMode(mode:boolean):void;
    jumpByPercent(prercent:number):void
    start():void;

}