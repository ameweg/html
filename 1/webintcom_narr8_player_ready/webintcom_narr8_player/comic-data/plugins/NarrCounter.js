define(["utils/Utils"], function (Utils) {
var NarrCounter = Utils.newObjectType(NarrCounter, "NarrCounter"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

NarrCounter.prototype.init = function(description) { // вызывается автоматически при создании объекта этого класса
    this.view.classList.add(description);
};

NarrCounter.prototype.draw = function () { // необязательно
  this.view.innerHTML=Math.round(this.value);
};

    return NarrCounter;
});