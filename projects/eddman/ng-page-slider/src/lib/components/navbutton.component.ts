import {
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ElementRef
} from '@angular/core';

@Component({
    selector           : 'kb-nav-button',
    templateUrl        : 'navbutton.component.html',
    styleUrls          : [
        './navbutton.component.scss'
    ],
    host               : {
        '[class.kb-nav-button]': 'true'
    },
    changeDetection    : ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class KBNavButtonComponent {

    private readonly isForward: boolean;

    private _page: number = 0;
    private readonly _pageChange = new EventEmitter<number>();
    private _pageCount: number = 0;

    private _size: number;
    private _showBackground: boolean = false;
    private _iconColor: string | undefined;
    private _backgroundColor: string = 'white';

    public constructor(@Attribute('forward') forward: string,
                       @Attribute('backward') backward: string,
                       private readonly element: ElementRef,
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

        this._size = this.element.nativeElement.offsetHeight || 44;
    }

    @Input()
    public set backgroundColor(value: string) {
        this._backgroundColor = value;
    }

    @Input()
    public set iconColor(value: string | undefined) {
        this._iconColor = value;
    }

    @Input()
    public set showBackground(value: boolean) {
        this._showBackground = value;
    }

    @Input()
    public set size(value: number) {
        this._size = value;
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

    public get derivedIconColor() {
        if (this._iconColor != null) {
            return this._iconColor;
        }
        return (this._showBackground) ? 'black' : 'white';
    }

    public get derivedBackgroundColor() {
        return (this._showBackground) ? this._backgroundColor : 'none';
    }

    public get derivedSize() {
        return this._size + 'px';
    }

    public get halfSize() {
        return this._size / 2 + 'px';
    }

    public get symbol() {
        return (this.isForward) ? '&rsaquo;' : '&lsaquo;';
    }

    public handleClick() {
        if (this.disabled) {
            return;
        }
        this._pageChange.emit(this._page);
        if (this.isForward) {

            ++this._page;
        } else {
            --this._page;
        }

        this.changeDetectorRef.markForCheck();
    }
}
