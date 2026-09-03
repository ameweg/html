class Collection {

    public active:number;
    public collection:Array<any>;

    public getActive() {
        return this.getByIndex(this.active);
    }

    public getActiveIndex() {
        return this.active;
    }

    public getByIndex(index:number) {
        return this.collection[index];
    }

    public has(index:number) {
        return !!this.getByIndex(index);
    }

    public hasNext() {
        return this.has(this.active + 1);
    }

    public hasPrev() {
        return this.has(this.active - 1);
    }

}
export = Collection;