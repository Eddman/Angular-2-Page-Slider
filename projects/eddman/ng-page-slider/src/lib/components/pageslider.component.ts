import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {SlideAnimation} from '../functionality/animation';
import {ArrowKeysHandler} from '../functionality/arrowkeys';
import {SideClickHandler} from '../functionality/sideclick';
import {TouchEventHandler} from '../functionality/touchevents';
import {PageSliderControlAPI} from '../types';
import {KBNavButtonComponent} from './navbutton.component';
import {KBPagesRendererDirective} from './render.component';

@Component({
    selector           : 'kb-page-slider',
    templateUrl        : 'pageslider.component.html',
    styleUrls          : [
        'pageslider.component.scss'
    ],
    host               : {
        '[class.kb-page-slider]': 'true'
    },
    changeDetection    : ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class KBPageSliderComponent implements PageSliderControlAPI, OnDestroy {

    @ContentChild('innerContainer', {static: true})
    private innerContainer: ElementRef | undefined;

    private readonly touchEventHandler: TouchEventHandler;
    private readonly sideClickHandler: SideClickHandler;
    private readonly arrowKeysHandler: ArrowKeysHandler;

    // Get the page renderer loop and keep its size up to date
    @ContentChild(KBPagesRendererDirective, {static: true})
    public renderer: KBPagesRendererDirective | undefined;

    private _pageChange = new EventEmitter<number>();
    private _pageSizeChange = new EventEmitter<[number, number]>();
    private _pageCountChange = new EventEmitter<number>();

    // Dot Indicator
    @Input()
    public showIndicator: boolean = true;
    private _overlayIndicator: boolean = true;
    @Input()
    public dotColor: string = 'white';

    // Interactivity
    private _locked: boolean = false;
    private _enableOverscroll: boolean = true;

    private _scrollStateChange = new EventEmitter<boolean>();

    private destroyed = new EventEmitter<void>();

    private _pageOffset: number = 1;

    private firstImage: HTMLImageElement | null = null;

    @ContentChildren(KBNavButtonComponent)
    public buttons: QueryList<KBNavButtonComponent> | undefined;

    private readonly resizeListener = (() => {
        this.resize();
        if (this.renderer != null) {
            this.renderer.resize(this.pageWidth, this.pageHeight);
        }
        this._pageSizeChange.emit([this.pageWidth, this.pageHeight]);
    });

    public constructor(private element: ElementRef) { // ,
        // private readonly changeDetectorRef: ChangeDetectorRef) {
        const htmlElement = this.element.nativeElement;

        this.touchEventHandler = new TouchEventHandler(this, htmlElement);
        this.sideClickHandler = new SideClickHandler(this, htmlElement);
        this.arrowKeysHandler = new ArrowKeysHandler(this);
    }

    // PUBLIC INTERFACE =====================================================================

    @Input()
    public set page(pn: number) {
        if (pn < 0 || pn >= this.pageCount) {
            return;
        }
        if (this.renderer) {
            if (pn === this.renderer.page) {
                return;
            }

            if (pn === this.renderer.page + 1) {
                if (this.blockInteraction) {
                    this._pageChange.emit(this.page);
                    return;
                }
                this.animateToNextPage();
            } else if (pn === this.renderer.page - 1) {
                if (this.blockInteraction) {
                    this._pageChange.emit(this.page);
                    return;
                }
                this.animateToPreviousPage();
            } else {
                if (this.blockInteraction) {
                    this._pageChange.emit(this.page);
                    return;
                }
                this.renderer.page = pn;
                this._pageChange.emit(pn);
            }
        }
    }

    public get page() {
        return (this.renderer) ? this.renderer.page : 0;
    }

    @Output()
    public get pageChange(): EventEmitter<number> {
        return this._pageChange;
    }

    @Output()
    public get pageSizeChange(): EventEmitter<[number, number]> {
        return this._pageSizeChange;
    }

    public get pageCount() {
        return (this.renderer) ? this.renderer.pageCount : 0;
    }

    @Output()
    public get pageCountChange(): EventEmitter<number> {
        return this._pageCountChange;
    }

    // Dot Indicator

    @Input()
    public set overlayIndicator(value: boolean) {
        this._overlayIndicator = value;
    }

    // Interactivity
    @Input()
    public set locked(value: boolean) {
        this._locked = value;
    }

    @Input()
    public transitionDuration: number = 250;

    @Input()
    public set enableOverscroll(value: boolean) {
        this._enableOverscroll = value;
    }

    @Input()
    public set enableSideClicks(enabled: boolean) {
        this.sideClickHandler.enabled = enabled;
    }

    @Input()
    public set enableArrowKeys(enabled: boolean) {
        this.arrowKeysHandler.enabled = enabled;
    }

    @Output()
    public get scrollStateChange(): EventEmitter<boolean> {
        return this._scrollStateChange;
    }

    // INTERNAL STATE =======================================================================

    private get pageOffset() {
        return this._pageOffset;
    }

    private set pageOffset(v: number) {
        this._pageOffset = v;
        if (!this.blockInteraction && this.innerContainer != null) {
            this.innerContainer.nativeElement.style.left = this.pxOffset;
        }
    }

    private get pxOffset() {
        return -this.pageOffset * this.pageWidth + 'px';
    }

    // NAV BUTTONS

    public get buttonTop() {
        if (this.buttons == null) {
            return 0;
        }
        return this.pageHeight / 2 - this.buttons.first.size / 2 + 'px';
    }

    // SIZING

    public get pageWidth() {
        return this.element.nativeElement.offsetWidth;
    }

    public get pageHeight() {
        let fullHeight = this.element.nativeElement.offsetHeight;
        const chin = (this.showIndicator && !this.overlayIndicator) ? 20 : 0;
        if (this.renderer == null) {
            return fullHeight - chin;
        }

        if (!this.firstImage && this.renderer.collection) {
            this.firstImage = new Image();
            this.firstImage.onload = () => {
                this.resize();
                if (this.renderer) {
                    this.renderer.resize(this.pageWidth, this.pageHeight);
                }
            };
            this.firstImage.src = this.renderer.collection[0].url;
        } else if (this.firstImage) {
            if (this.firstImage.width > this.element.nativeElement.offsetWidth) {
                this.element.nativeElement.style.height = (this.firstImage.height
                                                           * this.element.nativeElement.offsetWidth)
                                                          / this.firstImage.width + 'px';
            } else {
                this.element.nativeElement.style.height = this.firstImage.height + 'px';
            }
            fullHeight = this.element.nativeElement.offsetHeight;
        }
        return fullHeight - chin;
    }

    public get containerWidth() {
        return this.pageWidth * 3 + 'px';
    }

    public get containerHeight() {
        return this.pageHeight + 'px';
    }

    public get dotBottom() {
        return (this._overlayIndicator) ? '16px' : '0px';
    }

    public ngOnInit() {
        if (!this.renderer) {
            console.log(`
				The *kbPages directive is used to render pages efficiently, such that only
				pages that are visible are in the DOM. Without this directive, the page
				slider will not display anything.
			`);
            throw new Error('No *kbPages directive found inside kb-page-slider');
        }

        this.renderer.pageCountChange.pipe(
            takeUntil(this.destroyed)
        ).subscribe((count: number) => {
            this._pageCountChange.emit(count);
        });

        this.resize();
        this.renderer.resize(this.pageWidth, this.pageHeight);
        window.addEventListener('resize', this.resizeListener);
    }

    public ngOnDestroy(): void {
        this.touchEventHandler.destroy();
        this.sideClickHandler.destroy();
        this.arrowKeysHandler.destroy();

        window.removeEventListener('resize', this.resizeListener);

        // Unsubscribe others
        this.destroyed.emit();
        this.destroyed.complete();
    }

    private resize() {
        if (this.innerContainer != null) {
            this.innerContainer.nativeElement.style.left = -this.pageWidth + 'px';
        }
    }

    // INTERACTIVE NAVIGATION ===============================================================

    private blockInteraction: boolean = false;

    public scrollTo(x: number) {
        if (this._locked || this.blockInteraction) {
            return;
        }
        this.pageOffset = this.clampX(x);
    }

    public animateToNextPage(momentum?: number): SlideAnimation | null {
        if (this._locked || this.blockInteraction) {
            return null;
        }

        let animation: SlideAnimation | null;

        if (this.renderer != null && this.page === this.renderer.pageCount - 1) {
            animation = this.animateToX(1, 0);
            if (animation != null) {
                animation.completed.pipe(
                    takeUntil(this.destroyed)
                ).subscribe(() => {
                    this.pageOffset = 1;
                });
            }
            return animation;
        }
        if (momentum == null) {
            momentum = 0;
        }

        animation = this.animateToX(2, momentum);
        if (animation != null) {
            animation.completed.pipe(
                takeUntil(this.destroyed)
            ).subscribe(() => {
                if (this.renderer != null) {
                    this.renderer.page++;
                    this._pageChange.emit(this.renderer.page);
                    this.pageOffset = 1;
                }
            });
        }
        return animation;
    }

    public animateToPreviousPage(momentum?: number): SlideAnimation | null {
        if (this._locked || this.blockInteraction) {
            return null;
        }

        let animation: SlideAnimation | null;

        if (this.page === 0) {
            animation = this.animateToX(1, 0);
            if (animation != null) {
                animation.completed.pipe(
                    takeUntil(this.destroyed)
                ).subscribe(() => {
                    this.pageOffset = 1;
                });
            }
            return animation;
        }

        if (momentum == null) {
            momentum = 0;
        }

        animation = this.animateToX(0, momentum);
        if (animation != null) {
            animation.completed.pipe(
                takeUntil(this.destroyed)
            ).subscribe(() => {
                if (this.renderer != null) {
                    this.renderer.page--;
                    this._pageChange.emit(this.renderer.page);
                    this.pageOffset = 1;
                }
            });
        }
        return animation;
    }

    public animateToX(x: number, momentum: number): SlideAnimation | null {
        if (this._locked || this.blockInteraction) {
            return null;
        }
        this.blockInteraction = true;

        const w = this.pageWidth;
        const animation = new SlideAnimation(
            this.innerContainer!.nativeElement,	 	// Element to animate
            -this.pageOffset * w,		// Current position (px)
            -x * w,	 					// Destination position (px)
            momentum * w,			 	// User scroll momentum (px/s)
            this.transitionDuration		// Default duration, when momentum = 0
        );
        animation.completed.pipe(
            takeUntil(this.destroyed)
        ).subscribe(() => {
            this.blockInteraction = false;
        });
        return animation;
    }

    public startScroll() {
        this._scrollStateChange.emit(true);
    }

    public endScroll() {
        this._scrollStateChange.emit(false);
    }

    // OVERSCROLL (iOS STYLE) ===============================================================

    // Get X to a reasonable range, taking into account page boundaries
    private clampX(x: number) {
        if (x < 0) {
            x = 0;
        }
        if (x > 2) {
            x = 2;
        }

        // Allow some overscrolling on the first and last page
        if (this.page === 0 && x < 1) {
            if (this._enableOverscroll) {
                x = 1 - this.overscrollRamp(1 - x);
            } else {
                x = 1;
            }
        }
        if (this.renderer != null && this.page === this.renderer.pageCount - 1 && x > 1) {
            if (this._enableOverscroll) {
                x = 1 + this.overscrollRamp(x - 1);
            } else {
                x = 1;
            }
        }
        return x;
    }

    // Exponential ramp to simulate elastic pressure on overscrolling
    private overscrollRamp(input: number): number {
        return Math.pow(input, 0.5) / 5;
    }
}
