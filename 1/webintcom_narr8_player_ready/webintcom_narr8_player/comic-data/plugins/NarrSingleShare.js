define(["utils/Utils"], function (Utils) {

    var NarrSingleShare = Utils.newObjectType(NarrSingleShare, "NarrSingleShare"); // обязательно, функция из API
// Если модуль с именем ClassName уже существует, то в ClassName запишется undefined.

    NarrSingleShare.prototype.init = function (description) {
    } // вызывается автоматически при создании объекта этого класса};

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppRate', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appRate', {});
        }}, false);

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppFullVersion', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appFullVersion', {});
        }}, false);

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppShareVK', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appShareVK', {});
        }}, false);

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppShareFB', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appShareFB', {});
        }}, false);

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppShareTW', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appShareTW', {});
        }}, false);

    Utils.addBehaviour('tap', 'NarrSingleShare', 'NarrSsAppInviteByMailWithForm', {
        end: function (e) {
            e.stopPropagation();
            this.delegate.navigation.anyAction('appInviteByMailWithForm', {});
        }}, false);

    return NarrSingleShare;
});