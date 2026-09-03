define(["require", "exports"], function(require, exports) {
    var Collection = (function () {
        function Collection() {
        }
        Collection.prototype.getActive = function () {
            return this.getByIndex(this.active);
        };

        Collection.prototype.getActiveIndex = function () {
            return this.active;
        };

        Collection.prototype.getByIndex = function (index) {
            return this.collection[index];
        };

        Collection.prototype.has = function (index) {
            return !!this.getByIndex(index);
        };

        Collection.prototype.hasNext = function () {
            return this.has(this.active + 1);
        };

        Collection.prototype.hasPrev = function () {
            return this.has(this.active - 1);
        };
        return Collection;
    })();
    
    return Collection;
});
//# sourceMappingURL=Collection.js.map
