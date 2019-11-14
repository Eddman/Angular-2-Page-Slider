import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChild
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {SlideAnimation} from '../functionality/animation';
import {ArrowKeysHandler} from '../functionality/arrowkeys';
import {SideClickHandler} from '../functionality/sideclick';
import {TouchEventHandler} from '../functionality/touchevents';
import {PageSliderControlAPI, SliderPage} from '../types';
import {KBNavButtonComponent} from './navbutton.component';
import {KBPagesRendererDirective} from './render.directive';

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

    @ViewChild('innerContainer', {static: true})
    private innerContainer: ElementRef | undefined;

    private readonly touchEventHandler: TouchEventHandler;
    private readonly sideClickHandler: SideClickHandler;
    private readonly arrowKeysHandler: ArrowKeysHandler;

    // Get the page renderer loop and keep its size up to date
    @ContentChild(KBPagesRendererDirective, {static: true})
    public renderer: KBPagesRendererDirective<SliderPage> | undefined;

    private readonly _pageChange = new EventEmitter<number>();
    private readonly _pageSizeChange = new EventEmitter<[number, number]>();

    // Dot Indicator
    @Input()
    public showIndicator: boolean = true;
    private _overlayIndicator: boolean = true;
    @Input()
    public dotColor: string = 'white';

    // Interactivity
    private _locked: boolean = false;
    private _enableOverscroll: boolean = true;

    private readonly _scrollStateChange = new EventEmitter<boolean>();

    private readonly destroyed = new EventEmitter<void>();

    private _pageOffset: number = 1;

    @ContentChildren(KBNavButtonComponent)
    public buttons: QueryList<KBNavButtonComponent> | undefined;

    public constructor(private readonly element: ElementRef,
                       private readonly changeDetectorRef: ChangeDetectorRef) {
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
        const fullHeight = this.element.nativeElement.offsetHeight;
        const chin = (this.showIndicator && !this._overlayIndicator) ? 20 : 0;
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

        // Resize based on size of the first image
        this.renderer.pagesChange.pipe(
            takeUntil(this.destroyed)
        ).subscribe(
            (pages) => {
                if (pages.length > 0) {
                    const firstImage = new Image();
                    firstImage.onload = () => {
                        const chin = (this.showIndicator && !this._overlayIndicator) ? 20 : 0;
                        if (firstImage.width > this.element.nativeElement.offsetWidth) {
                            this.element.nativeElement.style.height =
                                `${((firstImage.height * this.element.nativeElement.offsetWidth) / firstImage.width)
                                   + chin}px`;
                        } else {
                            this.element.nativeElement.style.height = `${firstImage.height + chin}px`;
                        }

                        this.resizeListener();
                    };
                    firstImage.src = pages[0].url;
                }
            }
        );

        this.resizeListener();
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

    private readonly resizeListener = () => this.resize();

    private resize() {
        if (this.innerContainer != null) {
            this.innerContainer.nativeElement.style.left = -this.pageWidth + 'px';
        }
        if (this.renderer != null) {
            this.renderer.resize(this.pageWidth, this.pageHeight);
        }
        this.changeDetectorRef.markForCheck();
    }

    // INTERACTIVE NAVIGATION ===============================================================

    private blockInteraction: boolean = false;

    public scrollTo(x: number) {
        if (this._locked || this.blockInteraction) {
            return;
        }
        this.pageOffset = this.clampX(x);
    }

    public animateToNextPage(momentum: number = 0): SlideAnimation | null {
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

    public animateToPreviousPage(momentum: number = 0): SlideAnimation | null {
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
        let clampX = x;
        if (clampX < 0) {
            clampX = 0;
        }
        if (clampX > 2) {
            clampX = 2;
        }

        // Allow some overscrolling on the first and last page
        if (this.page === 0 && clampX < 1) {
            if (this._enableOverscroll) {
                clampX = 1 - KBPageSliderComponent.overscrollRamp(1 - clampX);
            } else {
                clampX = 1;
            }
        }
        if (this.renderer != null && this.page === this.renderer.pageCount - 1 && clampX > 1) {
            if (this._enableOverscroll) {
                clampX = 1 + KBPageSliderComponent.overscrollRamp(clampX - 1);
            } else {
                clampX = 1;
            }
        }
        return clampX;
    }

    // Exponential ramp to simulate elastic pressure on overscrolling
    private static overscrollRamp(input: number): number {
        return Math.pow(input, 0.5) / 5;
    }
}
