var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./Collection"], function(require, exports, Collection) {
    var CollectionControl = (function (_super) {
        __extends(CollectionControl, _super);
        function CollectionControl() {
            _super.apply(this, arguments);
        }
        CollectionControl.prototype.next = function () {
            if (this.getActive().hasNext()) {
                this.getActive().next();
            } else {
                this.jumpTo(this.active + 1);
            }
        };

        CollectionControl.prototype.prev = function () {
            if (this.getActive().hasPrev()) {
                this.getActive().prev();
            } else {
                this.jumpTo(this.active - 1);
            }
        };

        CollectionControl.prototype.jumpTo = function (index) {
            alert(this);
            alert("Метод не переопределен!" + index);
        };
        return CollectionControl;
    })(Collection);
    
    return CollectionControl;
});
//# sourceMappingURL=CollectionControl.js.map
