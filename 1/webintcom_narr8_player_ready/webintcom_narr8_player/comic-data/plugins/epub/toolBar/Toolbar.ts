/// <reference path="../epub/interfaces/EpubInt" />
/// <reference path="../../../utils/domLite/DomLite.d" />

interface SearchI {
    lang: string;
    webview_width: string;
    webview_height: string;
}

class Toolbar {

    private epubDom:$;
    private epub: EpubInt;

    constructor(epub:EpubInt, search) {

        this.epub = epub;
        this.epubDom = $("#epub");

    }
}
export = Toolbar;