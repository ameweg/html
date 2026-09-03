define(["utils/Utils"], function (Utils) {

    var VIDEOArrow = Utils.newObjectType(VIDEOArrow, "VIDEOArrow");

    VIDEOArrow.prototype.init = function (description) {

    };

    VIDEOArrow.prototype.VArrowSwipe = function (e) {
        var dir = this.delegate.scenes[this.delegate.scene].currentPause.swipe ? this.delegate.scenes[this.delegate.scene].currentPause.swipe : 'left';
        if (((dir === 'left') && (!e.vertical) && (e.vectorX < 0)) ||
            ((dir === 'right') && (!e.vertical) && (e.vectorX > 0)) ||
            ((dir === 'up') && (e.vertical) && (e.vectorY < 0)) ||
            ((dir === 'down') && (e.vertical) && (e.vectorY > 0))) {
            this.o = 0;
            this._redraw = true;
        }
    };

    VIDEOArrow.prototype.VArrowTap = function (e) {
        this.o = 0;
        this._redraw = true;
    };

    Utils.addBehaviour('swipe', 'VIDEOArrow', 'VIDEOArrowSwipe', {end: function (e) {
        this.VArrowSwipe(e);
    }}, 1);
    Utils.addBehaviour('tap', 'VIDEOArrow', 'VIDEOArrowTap', {end: function (e) {
        this.VArrowTap(e);
    }}, 1);

    return VIDEOArrow;
});