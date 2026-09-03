define(["utils/Utils"], function (Utils) {

    var NarrVideo = Utils.newObjectType(NarrVideo, "NarrVideo");

    NarrVideo.prototype.init = function (description) {
        var that = this;
        this.src = description.video;
        this.description = description;
        this.control = document.createElement("div");
        this.control.style.width = description.control.size.x + "px";
        this.control.style.height = description.control.size.y + "px";
        this.control.style.backgroundSize = description.control.size.x + 'px ' + description.control.size.y + 'px';
        this.control.style.backgroundImage = 'url("' + description.control.play + '")';
        this.play = {src: description.control.play, check: true};
        this.pause = description.control.pause;
        if (description.control.pos) this.control.style[brprefix + "transform"] = "translate3d(" + description.control.pos.x + "px," + description.control.pos.y + "px,0px)";
        this.view.appendChild(this.control);
    };

    NarrVideo.prototype.load = function () { // необязательно
        this.video = document.createElement("video");
        this.video.style.width = this.description.size.x + "px";
        this.video.style.height = this.description.size.y + "px";
        this.video.control = this.control;
        this.video.play_src = this.play.src;
        this.video.style.position = "absolute";
        this.video.style.top = "0";
        this.video.style.left = "0";
        this.video.preload = 1;
        this.view.insertBefore(this.video, this.control);
        this.video.addEventListener("ended", NarrVideo.prototype.NarrVideoEnd);
        this.video.src = this.src;
        //this.video.controls = true;
    };
    NarrVideo.prototype.NarrVideoEnd = function () { // необязательно
        this.nextSibling.style.backgroundImage = 'url("' + this.play_src + '")';
        //this.video.controls = true;
    };
    NarrVideo.prototype.unload = function () { // необязательно
        this.view.removeChild(this.video);
        this.video = undefined;
        this.control.style.backgroundImage = 'url("' + this.play.src + '")';
        this.play.check = true;
    };

    NarrVideo.prototype.NVTap = function (e, area) {
        if (this.play.check) {
            this.video.play();
            this.control.style.backgroundImage = 'url("' + this.pause + '")';
            this.play.check = false;
        }
        else {
            this.video.pause();
            this.play.check = true;
            this.control.style.backgroundImage = 'url("' + this.play.src + '")';
        }
    };

    Utils.addBehaviour('tap', 'NarrVideo', 'NVTouch', {end: function (e, area) {
        this.NVTap(e, area);
    }}, 1);

    return NarrVideo;
});