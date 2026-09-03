define(["utils/Utils"], function (Utils) {

    var NarrViralTrigger = Utils.newObjectType(NarrViralTrigger, "NarrViralTrigger");

    NarrViralTrigger.prototype.init = function (description) {
        this.timer = description;
        this.dt = 0;
        this.delegate.addEventListener('sceneIsLoaded', this.sceneIsLoaded, this);
    };

    NarrViralTrigger.prototype.unload = function () {
        this.dt = 0;
        this.delegate.removeEventListener('timer', this.narrTimer, this);
    }

    NarrViralTrigger.prototype.narrTimer = function (dt) {
        this.dt += dt;
        if (this.dt > this.timer) {
            this.delegate.removeEventListener('timer', this.narrTimer, this);
            this.delegate.continueToNextScene();
        }
    }

    NarrViralTrigger.prototype.sceneIsLoaded = function (scene) {
        if (this.delegate.scenes.length - 1 == scene.index) {
            this.delegate.addEventListener('timer', this.narrTimer, this);
        }
    }
    return NarrViralTrigger;
});