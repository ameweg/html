define(["utils/Utils"], function (Utils) {

    var NarrPauseTrigger = Utils.newObjectType(NarrPauseTrigger, "NarrPauseTrigger");

    NarrPauseTrigger.prototype.init = function (description) {
        this.NPTDelay = description.delay;
    };

    NarrPauseTrigger.prototype.load = function () {
        this.delegate.addEventListener('touchAnimationReady', this.NPTCheck, this);
        this.delegate.addEventListener('pauseStop', this.NPTPauseStop, this)
    };

    NarrPauseTrigger.prototype.unload = function () {
        this.delegate.removeEventListener('touchAnimationReady', this.NPTCheck, this);
        this.delegate.removeEventListener('pauseStop', this.NPTPauseStop, this)
    };

    NarrPauseTrigger.prototype.NPTPauseStop = function () {
        this.delegate.removeEventListener('timer', this.NPTTimer, this);
    };

    NarrPauseTrigger.prototype.NPTCheck = function (scene, pause) {
        if (this.NPTDelay > 0) {
            this.NPTTimerCount = 0;
            this.NPTScene = scene;
            this.NPTPause = pause;
            this.delegate.addEventListener('timer', this.NPTTimer, this);
        } else {
            this.NTPRun(scene, pause);
        }
    };

    NarrPauseTrigger.prototype.NPTTimer = function (dt) {
        this.NPTTimerCount += dt;
        if (this.NPTDelay < this.NPTTimerCount) {
            this.delegate.removeEventListener('timer', this.NPTTimer, this);
            this.NTPRun(this.NPTScene, this.NPTPause);
        }
    };

    NarrPauseTrigger.prototype.NTPRun = function (scene, pause) {
        if (this.pause) this.delegate.fireEvent("performAnimation", [this.pause, pause.index]);
        if (this['pause_' + this.state]) this.delegate.fireEvent("performAnimation", [this['pause_' + this.state], pause.index]);
    };

    return NarrPauseTrigger;
});