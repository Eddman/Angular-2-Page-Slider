import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';

@Component({
    selector           : 'ng-dot-indicator',
    templateUrl        : 'dotindicator.component.html',
    host               : {
        '[class.ng-dot-indicator]': 'true'
    },
    changeDetection    : ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class NDotIndicatorComponent {

    private _page: number = 0;
    private _pageCount: number = 0;

    private _items: Array<{ active: boolean }> = [];

    public constructor(private readonly changeDetectorRef: ChangeDetectorRef) {
    }

    @Input()
    public set page(p: number) {
        this._page = p;
        this.updateSelected();
    }

    @Input()
    public set pageCount(p: number) {
        this._pageCount = p || 0;
        this.updateItems();
    }

    public get items(): Array<{ active: boolean }> {
        return this._items;
    }

    private updateItems() {
        this._items = new Array(this._pageCount);
        for (let i = 0; i < this._pageCount; i++) {
            this._items[i] = {active: i === this._page};
        }
        this.changeDetectorRef.markForCheck();
    }

    private updateSelected() {
        if (this._items.length !== this._pageCount) {
            return this.updateItems();
        }
        if (this._items.length === 0) {
            return;
        }
        for (let i = 0; i < this._pageCount; i++) {
            this._items[i].active = false;
        }
        this._items[this._page].active = true;

        this.changeDetectorRef.markForCheck();
    }
}
