define(["utils/Utils"], function (Utils) {

    var NarrTest = Utils.newObjectType(NarrTest, "NarrTest"); // обязательно, функция из API

    NarrTest.prototype.init = function (description) {
        this.counter = 0;
        this.questions = [];

        if (description.settings.popup)
            this.popup = description.settings.popup;

        for (var i = 0; i < description.settings.questions.length; i++) {
            var question = this.questions[i] = {
                container: document.createElement('div'),
                title: description.settings.title ? {container: document.createElement('div'), position: {x: 0, y: 0}, size: {x: 0, y: 0}} : false,
                question: {container: document.createElement('div'), position: {x: 0, y: 0}, size: {x: 0, y: 0}},
                answers: new Array(description.settings.questions[i].answers.length),
                bg: description.settings.questions[i].bg ? {container: new Image, position: {x: 0, y: 0}, size: {x: 0, y: 0}} : false,
                areas: new Array(description.settings.questions[i].answers.length)
            };

            if (question.bg) {
                question.bg.container.src = description.settings.questions[i].bg.src;
                question.bg.position.x = description.settings.questions[i].bg.position.x;
                question.bg.position.y = description.settings.questions[i].bg.position.y;
                question.bg.size.x = description.settings.questions[i].bg.size.x;
                question.bg.size.y = description.settings.questions[i].bg.size.y;
                question.bg.name = 'question_bg_' + i;
            }
            if (question.title) {
                question.title.container.innerHTML = description.settings.questions[i].title.save;
                question.title.position.x = description.settings.questions[i].title.position.x;
                question.title.position.y = description.settings.questions[i].title.position.y;
                question.title.size.x = description.settings.questions[i].title.size.x;
                question.title.size.y = description.settings.questions[i].title.size.y;
                question.title.name = 'question_title_' + i;
            }

            question.question.container.innerHTML = description.settings.questions[i].question.save;
            question.question.position.x = description.settings.questions[i].question.position.x;
            question.question.position.y = description.settings.questions[i].question.position.y;
            question.question.size.x = description.settings.questions[i].question.size.x;
            question.question.size.y = description.settings.questions[i].question.size.y;

            for (var j = 0; j < question.answers.length; j++) {
                var answer = question.answers[j] = {
                    container: document.createElement('div'),
                    position: {x: description.settings.questions[i].answers[j].position.x, y: description.settings.questions[i].answers[j].position.y},
                    size: {x: description.settings.questions[i].answers[j].size.x, y: description.settings.questions[i].answers[j].size.y},
                    value: description.settings.questions[i].answers[j].value
                };

                answer.container.innerHTML = description.settings.questions[i].answers[j].save;
            }
        }
    }
    NarrTest.prototype.draw = function () {
        console.log('testRestart = ' + this.testRestart)
        if (this.testRestart != 0) {
            this.testRestart = 0;
            this.testStart();
        }
    }
    NarrTest.prototype.load = function () {
        this.container = document.createElement('div');

        for (var i = 0; i < this.questions.length; i++) {
            var question = this.questions[i];
            if (question.bg) {
                question.bg.container.style.position = 'absolute';
                question.bg.container.style.left = question.bg.position.x + 'px';
                question.bg.container.style.top = question.bg.position.y + 'px';
                question.bg.container.style.width = question.bg.size.x + 'px';
                question.bg.container.style.height = question.bg.size.y + 'px';
                question.container.appendChild(question.bg.container);
            }
            if (question.title) {
                question.title.container.style.position = 'absolute';
                question.title.container.style.left = question.title.position.x + 'px';
                question.title.container.style.top = question.title.position.y + 'px';
                question.title.container.style.width = question.title.size.x + 'px';
                question.title.container.style.height = question.title.size.y + 'px';
                question.container.appendChild(question.title.container);
            }
            question.question.container.style.position = 'absolute';
            question.question.container.style.left = question.question.position.x + 'px';
            question.question.container.style.top = question.question.position.y + 'px';
            question.question.container.style.width = question.question.size.x + 'px';
            question.question.container.style.height = question.question.size.y + 'px';
            question.container.appendChild(question.question.container);
            for (var j = 0; j < question.answers.length; j++) {
                var answer = question.answers[j];
                answer.container.style.position = 'absolute';
                answer.container.style.width = answer.size.x + 'px';
                answer.container.style.height = answer.size.y + 'px';
                answer.container.style.left = answer.position.x + 'px';
                answer.container.style.top = answer.position.y + 'px';
                question.container.appendChild(answer.container);
            }
            question.container.style.height = this.height + 'px';
            question.container.style.display = 'none';
            this.container.appendChild(question.container);
        }
        this.view.appendChild(this.container);
        this.testStart();
    }
    NarrTest.prototype.unload = function () {
        this.view.removeChild(this.container);
        this.container = null;
    }
    NarrTest.prototype.testOpen = function (id) {
        if (this.current != undefined) this.testClose(this.current);
        this.questions[id].container.style.display = 'block';
        for (var i = 0; i < this.questions[id].areas.length; i++) {
            this.questions[id].areas[i] = this.addArea({
                event_type: 'tap',
                behaviour: 'NarrTestTap',
                left: this.questions[id].answers[i].position.x,
                top: this.questions[id].answers[i].position.y,
                width: this.questions[id].answers[i].size.x,
                height: this.questions[id].answers[i].size.y,
                visible: true,
                propagation: 0,
                params: {id: i}
            });
        }

        this.current = id;
    }
    NarrTest.prototype.testClose = function (id) {
        this.questions[id].container.style.display = 'none';
        for (var i = 0; i < this.questions[id].areas.length; i++)
            this.removeArea(this.questions[id].areas[i])
    }
    NarrTest.prototype.testAnswerEvent = function (value) {
        this.answerValue = value;
        if (parseInt(value) < 0) {
            this.answerNoCounter += value;
            if (this.ANSWER_NO)
                this.delegate.fireEvent("performAnimation", [this.ANSWER_NO]);
        }
        else if (parseInt(value) > 0) {
            this.answerYesCounter += value;
            if (this.ANSWER_YES)
                this.delegate.fireEvent("performAnimation", [this.ANSWER_YES]);
        }
        if (this.ANSWER)
            this.delegate.fireEvent("performAnimation", [this.ANSWER]);
        this.counter += value;
    }
    NarrTest.prototype.testResultEvent = function () {

        console.log(this.RESULT)
        if (this.RESULT) {
            this.resultValue = this.counter;
            if (this.RESULT)
                this.delegate.fireEvent("performAnimation", [this.RESULT]);
        }
    }
    NarrTest.prototype.testStart = function () {
        console.log('test restart');

        this.answerNoCounter = 0;
        this.answerYesCounter = 0;
        this.counter = 0;
        this.testOpen(0);
    }
    NarrTest.prototype.testTapHandler = function (event, area) {
        switch (event.status) {
            case 'end':
                this.testAnswerEvent(this.questions[this.current].answers[area.params.id].value);
                if (this.current == this.questions.length - 1) {
                    this.testClose(this.current);
                    this.testResultEvent();
                    if (this.popup)
                        this.openPopup();
                    else if (this.COMPLETE)
                        this.delegate.fireEvent("performAnimation", [this.COMPLETE]);
                }
                else
                    this.testOpen(this.current + 1)
                break;
        }
    }
    NarrTest.prototype.openPopup = function () {
        if (!this.popup.node) {
            this.popup.node = document.createElement('div');
            this.popup.t_0 = document.createElement('div');
            this.popup.t_1 = document.createElement('div');
            this.popup.t_0.innerHTML = this.popup.text_0;
            this.popup.t_1.innerHTML = this.popup.text_1;
            this.popup.t_1.childNodes[0].innerHTML = this.answerYesCounter + '/' + Math.abs(this.answerNoCounter);
            this.popup.t_0.style.position = 'absolute';
            this.popup.t_1.style.position = 'absolute';
            this.popup.bg = new Image();
            this.popup.bg.src = this.popup.image;
            this.popup.bg.style.position = 'absolute';
            this.popup.bg.style.width = this.popup.size.x + 'px';
            this.popup.bg.style.height = this.popup.size.y + 'px';
            this.popup.node.appendChild(this.popup.bg);
            this.popup.node.appendChild(this.popup.t_0);
            this.popup.node.appendChild(this.popup.t_1);
            this.view.appendChild(this.popup.node);
            this.popup.node.style.position = 'absolute';
            this.popup.node.style.left = this.popup.position.x + 'px';
            this.popup.node.style.top = this.popup.position.y + 'px';
            this.popup.node.style.width = this.popup.size.x + 'px';
            this.popup.node.style.height = this.popup.size.y + 'px';
            this.popup.node.style.opacity = 0;
        }
        this.popup.node.style.display = 'block';
        this.seek = 0;
        this.delegate.addEventListener('timer', this.animatePopup, this);
        this.popup.animation = this.animateTo('seek', 1, 500, 'easeOutQuad', this.completeAnimatePopup);
        this.popup.area = this.addArea({
            event_type: 'tap',
            behaviour: 'NarrTestPopupTap',
            left: this.popup.position.x,
            top: this.popup.position.y,
            width: this.popup.size.x,
            height: this.popup.size.y,
            visible: false,
            propagation: 0
        });
    }
    NarrTest.prototype.closePopup = function () {
        if (this.popup.area)
            this.removeArea(this.popup.area);
        this.cancelAnimation(this.popup.animation);
        this.animateTo('seek', 0, 500, 'easeOutQuad', this.completeAnimatePopup);
        this.delegate.addEventListener('timer', this.animatePopup, this);
    }
    NarrTest.prototype.animatePopup = function () {
        this.popup.node.style.opacity = this.seek;
    }
    NarrTest.prototype.completeAnimatePopup = function () {
        this.delegate.removeEventListener('timer', this.animatePopup, this);
        if (this.seek == 0) {
            this.popup.node.style.display = 'none';
            if (this.COMPLETE)
                this.delegate.fireEvent("performAnimation", [this.COMPLETE]);
        }
        else {
            this.seek = 1;
            this.animatePopup();
        }
    }
    Utils.addBehaviour('tap', 'NarrTest', 'NarrTestTap',
        {
            end: function (g, obj) {
                g.stopPropagation();
                this.testTapHandler(g, obj);
            },
            start: function (g, obj) {
                return true;
            }
        }, false);
    Utils.addBehaviour('tap', 'NarrTest', 'NarrTestPopupTap',
        {
            end: function (g, obj) {
                g.stopPropagation();
                this.closePopup(g, obj);
            },
            start: function (g, obj) {
                return true;
            }
        }, false);

    return NarrTest;
});