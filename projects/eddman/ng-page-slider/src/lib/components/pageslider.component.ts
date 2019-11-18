import {
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {SlideAnimation} from '../functionality/animation';
import {ArrowKeysHandler} from '../functionality/arrowkeys';
import {AutoscrollHandler} from '../functionality/autoscroll';
import {TouchEventHandler} from '../functionality/touchevents';
import {PageSliderControlAPI, SliderPage} from '../types';
import {NgNavButtonComponent} from './navbutton.component';
import {KBPagesRendererDirective} from './render.directive';

@Component({
    selector           : 'ng-page-slider',
    templateUrl        : 'pageslider.component.html',
    host               : {
        '[class.ng-page-slider]': 'true'
    },
    changeDetection    : ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class NgPageSliderComponent implements PageSliderControlAPI, OnInit, AfterViewChecked, OnDestroy {

    @ViewChild('innerContainer', {static: true})
    private innerContainer: ElementRef | undefined;

    private readonly touchEventHandler: TouchEventHandler;
    private readonly arrowKeysHandler: ArrowKeysHandler;
    private readonly autoScrollHandler: AutoscrollHandler;

    // Get the page renderer loop and keep its size up to date
    @ContentChild(KBPagesRendererDirective, {static: true})
    public renderer: KBPagesRendererDirective<SliderPage> | undefined;

    private readonly _pageChange = new EventEmitter<number>();
    private readonly _pageSizeChange = new EventEmitter<[number, number]>();

    // Dot Indicator
    @Input()
    public showIndicator: boolean = true;
    private _overlayIndicator: boolean = true;

    // Interactivity
    private _locked: boolean = false;
    private _enableOverscroll: boolean = true;

    private readonly destroyed = new EventEmitter<void>();

    private _pageOffset: number = 1;

    private firstImage: HTMLImageElement | undefined;

    @ViewChildren(NgNavButtonComponent, {read: ElementRef})
    public buttons: QueryList<ElementRef> | undefined;

    public constructor(private readonly element: ElementRef,
                       private readonly changeDetectorRef: ChangeDetectorRef,
                       private readonly ngZone: NgZone) {
        const htmlElement = this.element.nativeElement;

        this.touchEventHandler = new TouchEventHandler(this, htmlElement, ngZone);
        this.arrowKeysHandler = new ArrowKeysHandler(this, ngZone);
        this.autoScrollHandler = new AutoscrollHandler(this, this.ngZone);
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
    public set enableArrowKeys(enabled: boolean) {
        this.arrowKeysHandler.enabled = enabled;
    }

    @Input()
    public set autoScrollInterval(value: number | undefined) {
        this.autoScrollHandler.autoScrollInterval = value;
    }

    // INTERNAL STATE =======================================================================

    private get pageOffset() {
        return this._pageOffset;
    }

    private set pageOffset(v: number) {
        this._pageOffset = v;
        if (!this.blockInteraction && this.innerContainer != null) {
            this.innerContainer.nativeElement.style.left = -this.pageOffset * this.pageWidth + 'px';
        }
    }

    // NAV BUTTONS

    public get buttonTop() {
        if (this.buttons == null || this.buttons.length === 0) {
            return 0;
        }
        return this.pageHeight / 2 - (this.buttons.first.nativeElement.offsetHeight / 2) + 'px';
    }

    // SIZING

    public get pageWidth() {
        return this.element.nativeElement.offsetWidth;
    }

    public get pageHeight() {
        const chin = (this.showIndicator && !this._overlayIndicator) ? 20 : 0;
        if (this.firstImage != null) {
            if (this.firstImage.width > this.element.nativeElement.offsetWidth) {
                this.element.nativeElement.style.height =
                    `${((this.firstImage.height * this.element.nativeElement.offsetWidth) / this.firstImage.width)
                       + chin}px`;
            } else {
                this.element.nativeElement.style.height = `${this.firstImage.height + chin}px`;
            }
        }
        const fullHeight = this.element.nativeElement.offsetHeight;
        return fullHeight - chin;
    }

    public get containerWidth() {
        return this.pageWidth * 3 + 'px';
    }

    public get containerHeight() {
        return this.pageHeight + 'px';
    }

    public get dotBottom() {
        return (this._overlayIndicator) ? null : '0px';
    }

    public ngOnInit() {
        if (!this.renderer) {
            console.log(`
				The *ngSliderPages directive is used to render pages efficiently, such that only
				pages that are visible are in the DOM. Without this directive, the page
				slider will not display anything.
			`);
            throw new Error('No *ngSliderPages directive found inside ng-page-slider');
        }

        // Resize based on size of the first image (if provided)
        this.renderer.pagesChange.pipe(
            takeUntil(this.destroyed)
        ).subscribe(
            (pages) => {
                if (pages.length > 0 && pages[0].imageURL) {
                    const firstImage = new Image();
                    this.firstImage = undefined;
                    firstImage.onload = () => {
                        this.firstImage = firstImage;
                        this.resize();
                    };
                    firstImage.src = pages[0].imageURL;
                }
            }
        );

        this.resize();
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('resize', this.resizeListener);
        });
    }

    public ngAfterViewChecked() {
        //  console.log('Change detection triggered!');
    }

    public ngOnDestroy(): void {
        this.touchEventHandler.destroy();
        this.arrowKeysHandler.destroy();
        this.autoScrollHandler.destroy();

        this.ngZone.runOutsideAngular(() => {
            window.removeEventListener('resize', this.resizeListener);
        });

        // Unsubscribe others
        this.destroyed.emit();
        this.destroyed.complete();
    }

    private readonly resizeListener = () => this.ngZone.run(() => this.resize());

    private resize() {
        if (this.innerContainer != null) {
            this.innerContainer.nativeElement.style.left = -this.pageWidth + 'px';
        }
        if (this.renderer != null) {
            this.renderer.resize(this.pageWidth, this.pageHeight);
        }
        this.changeDetectorRef.markForCheck();
    }

    /**
     * Called anytime user interacts with the slider to disable the autoscroll.
     */
    public emitHumanInteraction(): void {
        this.autoScrollHandler.enabled = false;
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
                    this.changeDetectorRef.markForCheck();
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
                    this.changeDetectorRef.markForCheck();
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
                    this.changeDetectorRef.markForCheck();
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
                    this.changeDetectorRef.markForCheck();
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
            this.transitionDuration,		// Default duration, when momentum = 0
            this.ngZone
        );
        animation.completed.pipe(
            takeUntil(this.destroyed)
        ).subscribe(() => {
            this.blockInteraction = false;
            this.changeDetectorRef.markForCheck();
        });
        return animation;
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
                clampX = 1 - NgPageSliderComponent.overscrollRamp(1 - clampX);
            } else {
                clampX = 1;
            }
        }
        if (this.renderer != null && this.page === this.renderer.pageCount - 1 && clampX > 1) {
            if (this._enableOverscroll) {
                clampX = 1 + NgPageSliderComponent.overscrollRamp(clampX - 1);
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
