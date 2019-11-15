import {
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

@Component({
    selector           : 'ng-slider-nav-button',
    templateUrl        : 'navbutton.component.html',
    host               : {
        '[class.ng-slider-nav-button]': 'true'
    },
    changeDetection    : ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class NgNavButtonComponent {

    private readonly isForward: boolean;

    private _page: number = 0;
    private readonly _pageChange = new EventEmitter<number>();
    private _pageCount: number = 0;

    public constructor(@Attribute('forward') forward: string,
                       @Attribute('backward') backward: string,
                       private readonly changeDetectorRef: ChangeDetectorRef) {
        if (forward != null) {
            if (backward == null) {
                this.isForward = true;
            } else {
                throw new Error('Nav Button cannot be both forward and backwards');
            }
        } else if (backward != null) {
            this.isForward = false;
        } else {
            throw new Error('Must specify either \'forward\' or \'backward\' on nav button');
        }
    }

    @Input()
    public set pageCount(value: number) {
        this._pageCount = value;
    }

    @Output()
    public get pageChange(): EventEmitter<number> {
        return this._pageChange;
    }

    @Input()
    public set page(value: number) {
        this._page = value;
    }

    public get disabled() {
        if (this.isForward) {
            return this._page >= this._pageCount - 1;
        } else {
            return this._page <= 0;
        }
    }

    public get symbol() {
        return (this.isForward) ? '&rsaquo;' : '&lsaquo;';
    }

    public handleClick() {
        if (this.disabled) {
            return;
        }
        if (this.isForward) {
            this._page++;
        } else {
            this._page--;
        }
        this._pageChange.emit(this._page);
        this.changeDetectorRef.markForCheck();
    }
}
