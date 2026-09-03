/// <reference path="./Collection" />
import Collection = require("./Collection");
class CollectionControl extends Collection {

    public next():void {
        if (this.getActive().hasNext()) {
            this.getActive().next();
        } else {
            this.jumpTo(this.active + 1);
        }
    }

    public prev():void {
        if (this.getActive().hasPrev()) {
            this.getActive().prev();
        } else {
            this.jumpTo(this.active - 1);
        }
    }

    public jumpTo(index:number):void {

        alert(this);
        alert("Метод не переопределен!" + index );

    }
}
export = CollectionControl;