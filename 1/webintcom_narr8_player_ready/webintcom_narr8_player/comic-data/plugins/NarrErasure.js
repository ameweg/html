define(["utils/Utils"], function (Utils) {
    var NarrErasure = Utils.newObjectType(NarrErasure, "NarrErasure"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrErasure.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        this.desc = description.settings;
    };

    NarrErasure.prototype.load = function () {
        var node = document.createElement('canvas');
        node.ctx = node.getContext('2d');
        node.style.position = "absolute";
        var img = new Image();
        node.style.width = this.desc.size.x + "px ";
        node.style.height = this.desc.size.y + "px";
        node.width = this.desc.size.x;
        node.height = this.desc.size.y;
        img.node = node;
        img.onload = function (e) {
            this.node.ctx.drawImage(this, 0, 0);
            this.node.ctx.globalCompositeOperation = "destination-out";
            delete this;
        };
        // img.crossOrigin = 'http://profile.ak.fbcdn.net/crossdomain.xml';
        img.src = this.desc.background;
        this.view.appendChild(node);
        this.view.eStart = {};
        this.view.r = this.desc.radius;
        this.view.percent = this.desc.percent;
        this.view.erasePer = 0;
        this.op = this.desc.op / 100;
        this.view.e = {};
    };

    NarrErasure.prototype.unload = function () {
        this.view.innerHTML = '';
    };

    NarrErasure.prototype.draw = function () { // необязательно
        //this.view.innerHTML=parseInt(this.value);
    };

    NarrErasure.prototype.erasureStart = function (e) {
        e.stopPropagation();
        this.view.e = this.getInternalCoordinatesForPoint(e);
        this.view.eStart.x = this.view.e.x;
        this.view.eStart.y = this.view.e.y;
        return true;
    };

    NarrErasure.prototype.erasureMove = function (e) {
        e.stopPropagation();
        //console.log("move");
        this.view.e = this.getInternalCoordinatesForPoint(e);
        this.view.childNodes[0].ctx.beginPath();
        //this.view.childNodes[0].ctx.arc(e.x, e.y, radius, 0, Math.PI*2,true);
        this.view.childNodes[0].ctx.moveTo(this.view.eStart.x, this.view.eStart.y);
        this.view.childNodes[0].ctx.lineTo(this.view.e.x, this.view.e.y);
        this.view.childNodes[0].ctx.lineWidth = this.view.r * 2;
        this.view.childNodes[0].ctx.lineCap = "round";
        this.view.childNodes[0].ctx.strokeStyle = "rgba(255, 127, 80," + this.op + " )";
        this.view.childNodes[0].ctx.stroke();
        //this.view.childNodes[0].ctx.fill();
        this.view.eStart.x = this.view.e.x;
        this.view.eStart.y = this.view.e.y;
    };

    NarrErasure.prototype.erasureEnd = function (e) {
        e.stopPropagation();

        var data = this.view.childNodes[0].ctx.getImageData(0, 0, this.view.childNodes[0].width, this.view.childNodes[0].height);
        for (var i = 0; i < data.data.length; i += 4) if (data.data[i + 3] == 0) this.view.erasePer++;
        if ((((this.view.erasePer) / (this.width * this.height)) * 100) >= this.view.percent) {
            if (this.prize) {
                //this.view.display = 'none';
                //this.view.childNodes[0].ctx.clearRect(0, 0, this.view.childNodes[0].width, this.view.childNodes[0].height);
                this.delegate.fireEvent("performAnimation", [this.prize]);
            }
        }
        this.view.erasePer = 0;
    };

    Utils.addBehaviour('pan', 'NarrErasure', 'NarrErasurePan', {start: function (e) {
        return this.erasureStart(e);
    }, move: function (e) {
        this.erasureMove(e);
    }, swipe: function (e) {
        e.stopPropagation();
        return true;
    }, end: function (e) {
        e.stopPropagation();
        this.erasureEnd(e);
    }}, false);

    return NarrErasure;
});