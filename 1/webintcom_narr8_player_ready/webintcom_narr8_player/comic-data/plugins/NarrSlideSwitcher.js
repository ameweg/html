define(["utils/Utils"], function (Utils) {

    var NarrSlideSwitcher = Utils.newObjectType(NarrSlideSwitcher, "NarrSlideSwitcher"); // обязательно, функция из API

// вызывается автоматически при создании объекта этого класса
    NarrSlideSwitcher.prototype.init = function (description) {
        for (var i = 0; i < description.settings.images.length; i++) {
            if (i == 2 && !description.settings.imageIcons) break;

            var node = document.createElement('div');
            var image = new Image();
            image.src = description.settings.images[i].src;
            node.style.position = "absolute";
            node.appendChild(image);
            this.view.appendChild(node);
            this.position = 0;

            if (i == 1) {
                this.todd = node;
                node.size = description.settings.images[i].size;
            }
        }

        if (description.settings.textIcons) {
            for (var i = 0; i < description.settings.icons.length; i++) {
                var text = document.createElement('div');
                text.innerHTML = description.settings.icons[i].export;
                text.style.position = 'absolute';
                text.style.left = description.settings.icons[i].x + 'px';
                text.style.top = description.settings.icons[i].y + 'px';
                this.view.appendChild(text);
            }
        }

        this.addArea({
            event_type: 'pan',
            behaviour: 'NarrSlideSwitcherPan',
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,
            visible: true,
            params: this
        });

        this.addArea({
            event_type: 'touch',
            behaviour: 'NarrSlideSwitcherTouch',
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,
            visible: true,
            params: this
        });

        this.POSITION_0 = description.settings.todd[0].pos;
        this.POSITION_1 = description.settings.todd[1].pos;
        this.horizontal = description.settings.horizontal;
        this.startMouseX = 0;
        this.startMouseY = 0;

        if (this.tood) {
            this.tood.style.left = this.POSITION_0.x + 'px';
            this.tood.style.top = this.POSITION_0.y + 'px';
        }
    }

    NarrSlideSwitcher.prototype.touchHandler = function (event, obj) {
        switch (event.status) {
            case 'start':
                this.moveFlag = false;
                this.startMouseX = event.x - this.position * this.width / 2;
                this.startMouseY = event.y - this.position * (this.height + this.todd.size.y) / 2;
                break;
            case 'end':
                if (!this.moveFlag)
                    this.move(!this.position);
                else {
                    if (this.horizontal) {
                        if (this.todd.offsetLeft > (this.width - this.todd.size.x) / 2)  this.move(1);
                        else                                                            this.move(0);
                    }
                    else {
                        if (this.todd.offsetTop > (this.height - this.todd.size.y) / 2)  this.move(1);
                        else                                                            this.move(0);
                    }
                }

                this.moveFlag = false;
        }
    }

    NarrSlideSwitcher.prototype.panHandler = function (event, obj) {
        switch (event.status) {
            case 'start':

                break;
            case 'end':

                break;
            case 'move':
                if (this.horizontal) {
                    if (event.x >= this.startMouseX && event.x - this.startMouseX <= this.width - this.todd.size.x) {
                        this.moveFlag = true;
                        this.todd.style.left = (event.x - this.startMouseX) + 'px';
                    }
                }
                else {
                    if (event.y >= this.startMouseY && event.y - this.startMouseY <= this.height - this.todd.size.y) {
                        this.moveFlag = true;
                        this.todd.style.top = (event.y - this.startMouseY) + 'px';
                    }
                }
        }
    }


    NarrSlideSwitcher.prototype.move = function (position) {
        if (this.action) return;

        if (this.position != position && this.position1 && this.position0) {
            this.delegate.fireEvent("performAnimation", [position ? this.position1 : this.position0]);
            this.position = position;
        }
        this.delegate.addEventListener('timer', this.moveAnimation, this);
    }


    NarrSlideSwitcher.prototype.moveAnimation = function () {
        if (this.horizontal) {
            if (this.position == 0) {
                if (this.todd.offsetLeft - 3 > this.POSITION_0.x)
                    this.todd.style.left = (this.todd.offsetLeft - 3) + 'px';
                else {
                    this.todd.style.left = this.POSITION_0.y + 'px';
                    this.complete();
                }
            }
            else {
                if (this.todd.offsetLeft + 3 < this.POSITION_1.x)
                    this.todd.style.left = (this.todd.offsetLeft + 3) + 'px';
                else {
                    this.todd.style.left = this.POSITION_1.x + 'px';
                    this.complete();
                }
            }
        }
        else {
            if (this.position == 0) {
                if (this.todd.offsetTop - 3 > this.POSITION_0.y)
                    this.todd.style.top = (this.todd.offsetTop - 3) + 'px';
                else {
                    this.todd.style.top = this.POSITION_0.y + 'px';
                    this.complete();
                }
            }
            else {
                if (this.todd.offsetTop + 3 < this.POSITION_1.y)
                    this.todd.style.top = (this.todd.offsetTop + 3) + 'px';
                else {
                    this.todd.style.top = this.POSITION_1.y + 'px';
                    this.complete();
                }
            }
        }
    }


    NarrSlideSwitcher.prototype.complete = function () {
//    this.action = false;
        this.delegate.removeEventListener('timer', this.moveAnimation, this);
    }

    Utils.addBehaviour('pan', 'NarrSlideSwitcher', 'NarrSlideSwitcherPan',
        {
            end: function (g, obj) {
            },
            start: function () {
                return true;
            },
            swipe: function (g) {
                g.stopPropagation();
            },
            move: function (g, obj) {
                this.panHandler(g, obj);
            }
        }, false);

    Utils.addBehaviour('touch', 'NarrSlideSwitcher', 'NarrSlideSwitcherTouch',
        {
            end: function (g, obj) {
                this.touchHandler(g, obj);
            },
            start: function (g, obj) {
                this.touchHandler(g, obj);
                return true;
            }
        }, false);

    return NarrSlideSwitcher;
});