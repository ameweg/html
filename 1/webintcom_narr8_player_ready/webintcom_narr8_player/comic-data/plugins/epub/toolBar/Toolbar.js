/// <reference path="../epub/interfaces/EpubInt" />
/// <reference path="../../../utils/domLite/DomLite.d" />
define(["require", "exports"], function(require, exports) {
    

    var Toolbar = (function () {
        function Toolbar(epub, search) {
            this.epub = epub;
            this.epubDom = $("#epub");
        }
        return Toolbar;
    })();
    
    return Toolbar;
});
//# sourceMappingURL=Toolbar.js.map
