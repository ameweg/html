define(["utils/Utils"], function (Utils) {

    var NarrTrigger = Utils.newObjectType(NarrTrigger, "NarrTrigger"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrTrigger.prototype.init = function (description) { // вызывается автоматически при создании объекта этого класса
        this.crit_value = description.crit_value;
        this.compare = description.compare;
    };

    NarrTrigger.prototype.load = function (description) {
        this.done = false;
    }

    NarrTrigger.prototype.draw = function () { // необязательно
        if (this.prize && !this.done) switch (this.compare) {
            case "0":
            case 0:
                if (this.value == this.crit_value) {
                    this.delegate.fireEvent("performAnimation", [this.prize]);
                    this.done = true;
                }
                break;
            case "1":
            case 1:
                if (this.value >= this.crit_value) {
                    this.delegate.fireEvent("performAnimation", [this.prize]);
                    this.done = true;
                }
                break;
            case "2":
            case 2:
                if (this.value <= this.crit_value) {
                    this.delegate.fireEvent("performAnimation", [this.prize]);
                    this.done = true;
                }
                break;
        }
    };

    return NarrTrigger;
});