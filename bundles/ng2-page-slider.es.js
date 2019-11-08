import { Attribute, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, Input, NgModule, Output, TemplateRef, ViewContainerRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/*
    This file contains some helpful types that are used throughout the module
*/
/** @enum {number} */
var StackLocation = {
    Previous: 0,
    Current: 1,
    Next: 2,
};
StackLocation[StackLocation.Previous] = 'Previous';
StackLocation[StackLocation.Current] = 'Current';
StackLocation[StackLocation.Next] = 'Next';

/**
 * @record
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// PAGE CLASS ===============================================================================
// Stores information about each page that is accessible from the template
var KBPage = /** @class */ (function () {
    function KBPage($implicit, index, parent) {
        this.$implicit = $implicit;
        this.index = index;
        this.parent = parent;
    }
    
    Object.defineProperty(KBPage.prototype, "isActive", {
        get: /**
         * @return {?}
         */
        function () {
            return this.parent.page == this.index;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(KBPage.prototype, "isFirst", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index == 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPage.prototype, "isLast", {
        get: /**
         * @return {?}
         */
        function () {
            return this.index == this.parent.pageCount - 1;
        },
        enumerable: true,
        configurable: true
    });
    return KBPage;
}());
// PAGE RENDERER DIRECTIVE ==================================================================
// Similar to ngFor, but renders items as stacked full-screen pages
var KBPagesRendererDirective = /** @class */ (function () {
    // Angular Injection
    function KBPagesRendererDirective(viewContainer, template) {
        this.viewContainer = viewContainer;
        this.template = template;
        // Initialization
        this.isInitialized = false;
        this.pageCountChange = new EventEmitter();
        // Page access
        this._page = 0;
        // SIZING
        this.pageWidth = 0;
        this.pageHeight = 0;
        // DOM RENDERING ========================================================================
        this.views = [null, null, null];
    }
    Object.defineProperty(KBPagesRendererDirective.prototype, "kbPagesOf", {
        set: /**
         * @param {?} coll
         * @return {?}
         */
        function (coll) {
            this.collection = coll;
            if (this.isInitialized) {
                this.ClearDOM();
                this.CreateDOM();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    KBPagesRendererDirective.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        this.isInitialized = true;
        this.CreateDOM();
    };
    Object.defineProperty(KBPagesRendererDirective.prototype, "pageCount", {
        get: /**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var count = (this.collection) ? this.collection.length : 0;
            if (this._lastPageCount != count)
                this.pageCountChange.emit(count);
            return count;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPagesRendererDirective.prototype, "page", {
        get: /**
         * @return {?}
         */
        function () {
            return this._page;
        },
        set: /**
         * @param {?} page
         * @return {?}
         */
        function (page) {
            this.SetPage(page);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @param {?} page
     * @return {?}
     */
    KBPagesRendererDirective.prototype.SetPage = /**
     * @param {?} page
     * @return {?}
     */
    function (page) {
        if (page < 0 || page >= this.pageCount)
            return false;
        /** @type {?} */
        var oldPage = this._page;
        this._page = page;
        this.ChangePage(page, oldPage);
        return true;
    };
    /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    KBPagesRendererDirective.prototype.Resize = /**
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    function (width, height) {
        this.pageWidth = width;
        this.pageHeight = height;
        if (this.isInitialized) {
            this.ClearDOM();
            this.CreateDOM();
        }
    };
    // Renders 3 pages
    // Renders 3 pages
    /**
     * @private
     * @return {?}
     */
    KBPagesRendererDirective.prototype.CreateDOM = 
    // Renders 3 pages
    /**
     * @private
     * @return {?}
     */
    function () {
        if (this.pageCount == 0 || this.collection == undefined)
            return;
        if (this.page > 0)
            this.BuildPage(this.page - 1, StackLocation.Previous);
        this.BuildPage(this.page, StackLocation.Current);
        if (this.page < this.pageCount - 1)
            this.BuildPage(this.page + 1, StackLocation.Next);
    };
    // Clears all pages out of the DOM, useful for re-rendering
    // Clears all pages out of the DOM, useful for re-rendering
    /**
     * @private
     * @return {?}
     */
    KBPagesRendererDirective.prototype.ClearDOM = 
    // Clears all pages out of the DOM, useful for re-rendering
    /**
     * @private
     * @return {?}
     */
    function () {
        for (var _i = 0, _a = this.views; _i < _a.length; _i++) {
            var view = _a[_i];
            if (view)
                view.destroy();
        }
        this.views = [null, null, null];
    };
    // HTML CONSTRUCTION AND MANAGEMENT
    // HTML CONSTRUCTION AND MANAGEMENT
    /**
     * @private
     * @param {?} pageNumber
     * @param {?} loc
     * @return {?}
     */
    KBPagesRendererDirective.prototype.BuildPage = 
    // HTML CONSTRUCTION AND MANAGEMENT
    /**
     * @private
     * @param {?} pageNumber
     * @param {?} loc
     * @return {?}
     */
    function (pageNumber, loc) {
        if (pageNumber < 0 || pageNumber >= this.pageCount)
            throw new Error('Attempted to create non-existent page: ' + pageNumber);
        // Create the page given the template
        this.views[loc] = this.viewContainer.createEmbeddedView(this.template, new KBPage(this.collection[pageNumber], pageNumber, this));
        // Style the page accordingly
        for (var _i = 0, _a = this.views[loc].rootNodes; _i < _a.length; _i++) {
            var rootNode = _a[_i];
            this.StyleAsPage(rootNode);
            this.StyleAtStackLocation(rootNode, loc);
        }
    };
    // Styles a DOM element to be an absolute-positioned page-sized container
    // Styles a DOM element to be an absolute-positioned page-sized container
    /**
     * @protected
     * @param {?} pageElement
     * @return {?}
     */
    KBPagesRendererDirective.prototype.StyleAsPage = 
    // Styles a DOM element to be an absolute-positioned page-sized container
    /**
     * @protected
     * @param {?} pageElement
     * @return {?}
     */
    function (pageElement) {
        pageElement.style.display = 'block';
        pageElement.style.position = 'absolute';
        pageElement.style.width = this.pageWidth + 'px';
        pageElement.style.height = this.pageHeight + 'px';
    };
    // Styles a DOM element with an X location in the container
    // Styles a DOM element with an X location in the container
    /**
     * @protected
     * @param {?} pageElement
     * @param {?} loc
     * @return {?}
     */
    KBPagesRendererDirective.prototype.StyleAtStackLocation = 
    // Styles a DOM element with an X location in the container
    /**
     * @protected
     * @param {?} pageElement
     * @param {?} loc
     * @return {?}
     */
    function (pageElement, loc) {
        /** @type {?} */
        var xLocationInContainer = loc * this.pageWidth;
        pageElement.style.left = xLocationInContainer + 'px';
    };
    // Moves an existing page to a new stack location
    // Moves an existing page to a new stack location
    /**
     * @private
     * @param {?} curr
     * @param {?} to
     * @return {?}
     */
    KBPagesRendererDirective.prototype.ChangeStackLocationOfView = 
    // Moves an existing page to a new stack location
    /**
     * @private
     * @param {?} curr
     * @param {?} to
     * @return {?}
     */
    function (curr, to) {
        if (!this.views[curr])
            throw new Error('View does not exist at location: ' + curr);
        for (var _i = 0, _a = this.views[curr].rootNodes; _i < _a.length; _i++) {
            var rootNode = _a[_i];
            this.StyleAtStackLocation(rootNode, to);
        }
        this.views[to] = this.views[curr];
        this.views[curr] = null;
    };
    // NAVIGATION
    // Updates rendering to display a new page
    // NAVIGATION
    // Updates rendering to display a new page
    /**
     * @private
     * @param {?} newPage
     * @param {?} oldPage
     * @return {?}
     */
    KBPagesRendererDirective.prototype.ChangePage = 
    // NAVIGATION
    // Updates rendering to display a new page
    /**
     * @private
     * @param {?} newPage
     * @param {?} oldPage
     * @return {?}
     */
    function (newPage, oldPage) {
        // If the page is incrementing or decrementing, we can simply shift existing views
        if (newPage == oldPage + 1) {
            this.GoToNextPage();
        }
        else if (newPage == oldPage - 1) {
            this.GoToPreviousPage();
            // Otherwise, just rebuild the DOM around this new page
        }
        else {
            this.ClearDOM();
            this.CreateDOM();
        }
    };
    /**
     * @private
     * @return {?}
     */
    KBPagesRendererDirective.prototype.GoToNextPage = /**
     * @private
     * @return {?}
     */
    function () {
        // Remove the previous page from the DOM
        if (this.views[StackLocation.Previous]) {
            this.views[StackLocation.Previous].destroy();
            this.views[StackLocation.Previous] = null;
        }
        // Shift the Current and Next pages backwards
        this.ChangeStackLocationOfView(StackLocation.Current, StackLocation.Previous);
        this.ChangeStackLocationOfView(StackLocation.Next, StackLocation.Current);
        // Render a new page, if possible
        if (this.page < this.pageCount - 1) {
            this.BuildPage(this.page + 1, StackLocation.Next);
        }
    };
    /**
     * @private
     * @return {?}
     */
    KBPagesRendererDirective.prototype.GoToPreviousPage = /**
     * @private
     * @return {?}
     */
    function () {
        // Remove the previous page from the DOM
        if (this.views[StackLocation.Next]) {
            this.views[StackLocation.Next].destroy();
            this.views[StackLocation.Next] = null;
        }
        // Shift the Current and Next pages backwards
        this.ChangeStackLocationOfView(StackLocation.Current, StackLocation.Next);
        this.ChangeStackLocationOfView(StackLocation.Previous, StackLocation.Current);
        // Render a new page, if possible
        if (this.page > 0) {
            this.BuildPage(this.page - 1, StackLocation.Previous);
        }
    };
    KBPagesRendererDirective.decorators = [
        { type: Directive, args: [{ selector: '[kbPages]' },] },
    ];
    /** @nocollapse */
    KBPagesRendererDirective.ctorParameters = function () { return [
        { type: ViewContainerRef },
        { type: TemplateRef }
    ]; };
    KBPagesRendererDirective.propDecorators = {
        kbPagesOf: [{ type: Input }]
    };
    return KBPagesRendererDirective;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/*
    A special class that wraps CSS3 animations and also determines their ideal duration
    based on momentum and distance to travel.
*/
/** @type {?} */
var kEasingFunction = 'cubic-bezier(.35,.45,.5,1)';
/** @type {?} */
var kEasingStartSlope = 1.33;
/** @type {?} */
var kDefaultDuration = 250;
/** @type {?} */
var kMinDuration = 60;
/** @type {?} */
var kMaxDuration = 660;
var SlideAnimation = /** @class */ (function () {
    // The real meat of the animation code
    // Hard-coded to the 'left' property because that's all we use here
    // but certainly this code could be generalized if needed.
    function SlideAnimation(element, current_px, dest_px, momentum_px, default_duration) {
        var _this = this;
        this.current_px = current_px;
        this.dest_px = dest_px;
        this.momentum_px = momentum_px;
        this.default_duration = default_duration;
        // Pseudo-promise
        this.on_complete = [];
        if (default_duration === undefined) {
            this.default_duration = kDefaultDuration;
        }
        // Set up the CSS transition
        /** @type {?} */
        var duration = Math.round(this.CalculateDuration());
        /** @type {?} */
        var tProperty = "left " + duration + "ms " + kEasingFunction;
        element.style.transition = tProperty;
        element.style.webkitTransition = tProperty;
        // Wait for that to propogate
        setTimeout((/**
         * @return {?}
         */
        function () {
            // Move to the destination location
            element.style.left = dest_px + 'px';
            // Wait for that to finish and clean it up
            setTimeout((/**
             * @return {?}
             */
            function () {
                for (var _i = 0, _a = _this.on_complete; _i < _a.length; _i++) {
                    var f = _a[_i];
                    f();
                }
                element.style.transition = '';
                element.style.webkitTransition = '';
            }), duration + 10);
        }), 10);
    }
    /**
     * @template THIS
     * @this {THIS}
     * @param {?} on_complete
     * @return {THIS}
     */
    SlideAnimation.prototype.then = /**
     * @template THIS
     * @this {THIS}
     * @param {?} on_complete
     * @return {THIS}
     */
    function (on_complete) {
        (/** @type {?} */ (this)).on_complete.push(on_complete);
        return (/** @type {?} */ (this));
    };
    // HELPERS
    // First step is figuring out the duration such that the starting
    // momentum of the transition matches the user's scroll momentum.
    // We could do this with 100% accuracy by determining the slope
    // of the bezier easing curve but ... meh. It's about 1.5-ish.
    // HELPERS
    // First step is figuring out the duration such that the starting
    // momentum of the transition matches the user's scroll momentum.
    // We could do this with 100% accuracy by determining the slope
    // of the bezier easing curve but ... meh. It's about 1.5-ish.
    /**
     * @private
     * @return {?}
     */
    SlideAnimation.prototype.CalculateDuration = 
    // HELPERS
    // First step is figuring out the duration such that the starting
    // momentum of the transition matches the user's scroll momentum.
    // We could do this with 100% accuracy by determining the slope
    // of the bezier easing curve but ... meh. It's about 1.5-ish.
    /**
     * @private
     * @return {?}
     */
    function () {
        /** @type {?} */
        var travel_px = this.dest_px - this.current_px;
        // If the momentum is going the same direction as the movement, use it!
        if (this.momentum_px != 0 && (this.momentum_px < 0) == (travel_px < 0)) {
            /** @type {?} */
            var linear_duration = 1000 * Math.abs(travel_px) / Math.abs(this.momentum_px);
            /** @type {?} */
            var estimate = linear_duration * kEasingStartSlope;
            return Math.max(Math.min(estimate, kMaxDuration), kMinDuration);
            // Otherwise, throw it out and use our default duration
        }
        else {
            return this.default_duration;
        }
    };
    return SlideAnimation;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * When the user clicks very close to the edge of a page, move in that direction.
 */
var ArrowKeysHandler = /** @class */ (function () {
    function ArrowKeysHandler(delegate) {
        this.delegate = delegate;
        this.enabled = true;
        document.addEventListener('keydown', this.KeyHandler.bind(this));
    }
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    ArrowKeysHandler.prototype.KeyHandler = /**
     * @private
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (!this.enabled)
            return;
        if (e.keyCode == 37) {
            this.delegate.AnimateToPreviousPage(0);
        }
        else if (e.keyCode == 39) {
            this.delegate.AnimateToNextPage(0);
        }
    };
    return ArrowKeysHandler;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * When the user clicks very close to the edge of a page, move in that direction.
 */
var SideClickHandler = /** @class */ (function () {
    function SideClickHandler(delegate, element) {
        this.delegate = delegate;
        this.element = element;
        this.enabled = true;
        this.threshold = 20; // 20px from the edge of the screen
        element.addEventListener('click', this.ClickHandler.bind(this));
    }
    // 20px from the edge of the screen
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    SideClickHandler.prototype.ClickHandler = 
    // 20px from the edge of the screen
    /**
     * @private
     * @param {?} e
     * @return {?}
     */
    function (e) {
        if (!this.enabled)
            return;
        /** @type {?} */
        var elementX = e.clientX - this.element.getBoundingClientRect().left;
        if (elementX < this.threshold) {
            this.delegate.AnimateToPreviousPage(0);
        }
        else if (elementX > this.element.offsetWidth - this.threshold) {
            this.delegate.AnimateToNextPage(0);
        }
    };
    return SideClickHandler;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// INTERACTIVITY - TOUCH EVENTS =============================================================
// Handles HTML touch events and formats it nicely for
// Snap back if user has moved less than 10% of the page
/** @type {?} */
var kDistanceThreshold = 0.1;
// If the user has moved less than 50% of the page, snap back
// unless that are moving at more than 30% the page width every second
/** @type {?} */
var kMomentumThreshold = 0.3;
/** @type {?} */
var kDistanceMomentumThreshold = 0.5;
// Ignore scrolls until they have moved at least 3% along X. If, during that time, they
// move more than 20px on Y, they will be rejected and interpreted instead as a vertical
// scroll gesture
/** @type {?} */
var kAcceptAtX = 0.03;
/** @type {?} */
var kRejectAtY = 20;
var TouchEventHandler = /** @class */ (function () {
    function TouchEventHandler(delegate, element) {
        this.delegate = delegate;
        // Touch tracking state
        this.start_x = 0;
        this.current_x = 0;
        this.start_ypx = 0;
        this.current_scroll = 1;
        this.tracking = null;
        this.accepted = false;
        // MOMENTUM HIGH PASS
        this.diffs_x = [0, 0, 0];
        this.times_x = [20, 20, 20];
        this.diffs_index = 0;
        // Add touch event listeners
        element.addEventListener('touchstart', this.TouchStart.bind(this));
        element.addEventListener('touchmove', this.TouchMove.bind(this));
        element.addEventListener('touchend', this.TouchEnd.bind(this));
        element.addEventListener('touchcancel', this.TouchEnd.bind(this));
    }
    /**
     * @private
     * @param {?} diff
     * @return {?}
     */
    TouchEventHandler.prototype.CaptureXDiff = /**
     * @private
     * @param {?} diff
     * @return {?}
     */
    function (diff) {
        this.diffs_x[this.diffs_index] = diff;
        /** @type {?} */
        var ctime = new Date().getTime();
        this.times_x[this.diffs_index] = ctime - this.last_sample_time;
        this.last_sample_time = ctime;
        if (++this.diffs_index == this.diffs_x.length)
            this.diffs_index = 0;
    };
    Object.defineProperty(TouchEventHandler.prototype, "momentum_x", {
        // Returns the scroll momentum in fractional page widths per second.
        // (fpw/s * page width = px/s)
        get: 
        // Returns the scroll momentum in fractional page widths per second.
        // (fpw/s * page width = px/s)
        /**
         * @private
         * @return {?}
         */
        function () {
            /** @type {?} */
            var acc = 0;
            for (var i = 0; i < this.diffs_x.length; i++) {
                acc += (this.diffs_x[i] / this.times_x[i]) * 1000 / 3;
            }
            return acc;
        },
        enumerable: true,
        configurable: true
    });
    // DOM EVENT HANDLERS ===================================================================
    // DOM EVENT HANDLERS ===================================================================
    /**
     * @param {?} event
     * @return {?}
     */
    TouchEventHandler.prototype.TouchStart = 
    // DOM EVENT HANDLERS ===================================================================
    /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        if (this.tracking)
            return;
        if (event.touches.length > 1)
            return;
        this.tracking = event.touches.item(0).identifier;
        this.start_x = event.touches.item(0).clientX / this.delegate.pageWidth;
        this.current_x = this.start_x;
        this.start_ypx = event.touches.item(0).clientY;
        this.last_sample_time = new Date().getTime();
        this.accepted = false;
    };
    /**
     * @param {?} event
     * @return {?}
     */
    TouchEventHandler.prototype.TouchMove = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var touch = this.GetTrackingTouch(event.changedTouches);
        if (touch == null)
            return;
        /** @type {?} */
        var new_x = touch.clientX / this.delegate.pageWidth;
        /** @type {?} */
        var diff_x = new_x - this.current_x;
        if (!this.accepted) {
            if (Math.abs(new_x - this.start_x) >= kAcceptAtX) {
                if (Math.abs(touch.clientY - this.start_ypx) > kRejectAtY) {
                    this.tracking = null;
                    return;
                }
                else {
                    this.accepted = true;
                    this.delegate.StartScroll();
                }
            }
            else
                return;
        }
        event.preventDefault();
        this.CaptureXDiff(diff_x);
        this.current_scroll = this.current_scroll - diff_x;
        this.delegate.ScrollTo(this.current_scroll);
        this.current_x = new_x;
    };
    /**
     * @param {?} event
     * @return {?}
     */
    TouchEventHandler.prototype.TouchEnd = /**
     * @param {?} event
     * @return {?}
     */
    function (event) {
        /** @type {?} */
        var touch = this.GetTrackingTouch(event.changedTouches);
        if (touch == null)
            return;
        this.tracking = null;
        if (this.start_x == this.current_x)
            return;
        if (!this.accepted)
            return;
        event.preventDefault();
        this.delegate.EndScroll();
        this.current_scroll = 1;
        /** @type {?} */
        var ending_momentum_x = this.momentum_x;
        if (this.current_x + kDistanceThreshold < this.start_x) {
            if (this.current_x + kDistanceMomentumThreshold < this.start_x ||
                -ending_momentum_x > kMomentumThreshold) {
                this.delegate.AnimateToNextPage(ending_momentum_x);
            }
            else {
                this.delegate.AnimateToX(1, ending_momentum_x);
            }
        }
        else if (this.current_x - kDistanceThreshold > this.start_x) {
            if (this.current_x - kDistanceMomentumThreshold > this.start_x ||
                ending_momentum_x > kMomentumThreshold) {
                this.delegate.AnimateToPreviousPage(ending_momentum_x);
            }
            else {
                this.delegate.AnimateToX(1, ending_momentum_x);
            }
        }
        else {
            this.delegate.AnimateToX(1, ending_momentum_x);
        }
    };
    // HELPERS
    // HELPERS
    /**
     * @private
     * @param {?} list
     * @return {?}
     */
    TouchEventHandler.prototype.GetTrackingTouch = 
    // HELPERS
    /**
     * @private
     * @param {?} list
     * @return {?}
     */
    function (list) {
        if (this.tracking === null)
            return null;
        for (var i = 0; i < list.length; i++) {
            /** @type {?} */
            var touch = list.item(i);
            if (touch.identifier == this.tracking)
                return touch;
        }
        return null;
    };
    return TouchEventHandler;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var KBNavButtonComponent = /** @class */ (function () {
    function KBNavButtonComponent(forward, backward) {
        this.pageChange = new EventEmitter();
        this.size = 44;
        this.showBackground = false;
        this.backgroundColor = 'white';
        if (forward != undefined) {
            if (backward != undefined) {
                throw new Error('Nav Button cannot be both forward and backwards');
            }
            else {
                this.isForward = true;
            }
        }
        else if (backward != undefined) {
            this.isForward = false;
        }
        else {
            throw new Error('Must specify either \'forward\' or \'backward\' on nav button');
        }
    }
    Object.defineProperty(KBNavButtonComponent.prototype, "disabled", {
        // TEMPLATE FEATURES
        get: 
        // TEMPLATE FEATURES
        /**
         * @return {?}
         */
        function () {
            if (this.isForward) {
                return this.page >= this.pageCount - 1;
            }
            else {
                return this.page <= 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBNavButtonComponent.prototype, "derivedIconColor", {
        get: /**
         * @return {?}
         */
        function () {
            if (this.iconColor !== undefined)
                return this.iconColor;
            return (this.showBackground) ? 'black' : 'white';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBNavButtonComponent.prototype, "derivedBackgroundColor", {
        get: /**
         * @return {?}
         */
        function () {
            return (this.showBackground) ? this.backgroundColor : 'none';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBNavButtonComponent.prototype, "derivedSize", {
        get: /**
         * @return {?}
         */
        function () {
            return this.size + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBNavButtonComponent.prototype, "halfSize", {
        get: /**
         * @return {?}
         */
        function () {
            return this.size / 2 + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBNavButtonComponent.prototype, "symbol", {
        get: /**
         * @return {?}
         */
        function () {
            return (this.isForward) ? '&rsaquo;' : '&lsaquo;';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    KBNavButtonComponent.prototype.OnClick = /**
     * @return {?}
     */
    function () {
        if (this.disabled)
            return;
        this.pageChange.emit((this.isForward) ? ++this.page : --this.page);
    };
    KBNavButtonComponent.decorators = [
        { type: Component, args: [{
                    selector: 'kb-nav-button',
                    template: "\n        <a (click)=\"OnClick()\"\n           [innerHTML]=\"symbol\"\n           [class.circle]=\"showBackground\"\n           [class.disabled]=\"disabled\"\n           [style.width]=\"derivedSize\" [style.height]=\"derivedSize\"\n           [style.borderRadius]=\"halfSize\"\n           [style.fontSize]=\"derivedSize\"\n           [style.color]=\"derivedIconColor\"\n           [style.backgroundColor]=\"derivedBackgroundColor\"\n        ></a>\n\t",
                    styles: [
                        ":host {\n\t\t\tcursor: pointer;\n\t\t\t-webkit-touch-callout: none; /* iOS Safari */\n\t\t\t-webkit-user-select: none; /* Chrome/Safari/Opera */\n\t\t\t-khtml-user-select: none; /* Konqueror */\n\t\t\t-moz-user-select: none; /* Firefox */\n\t\t\t-ms-user-select: none; /* Internet Explorer/Edge */\n\t\t\tuser-select: none;\n\t\t}",
                        "a {\n\t\t\tdisplay: block;\n\t\t\ttext-align: center;\n\t\t\tline-height: 36px;\n\t\t}",
                        ":host[forward] a {\n\t\t\tpadding-left: 3px;\n\t\t}",
                        ":host[backward] a {\n\t\t\tpadding-right: 3px;\n\t\t}",
                        "a.circle {\n\t\t\tbox-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);\n\t\t}",
                        "a.disabled {\n\t\t\topacity: 0.33;\n\t\t}"
                    ]
                },] },
    ];
    /** @nocollapse */
    KBNavButtonComponent.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Attribute, args: ['forward',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['backward',] }] }
    ]; };
    KBNavButtonComponent.propDecorators = {
        page: [{ type: Input }],
        pageChange: [{ type: Output }],
        pageCount: [{ type: Input }],
        size: [{ type: Input }],
        showBackground: [{ type: Input }],
        iconColor: [{ type: Input }],
        backgroundColor: [{ type: Input }]
    };
    return KBNavButtonComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// PAGE CONTAINER DIRECTIVE =================================================================
// Handles fancy things like page animation and controls KBPagesRendererDirective
var KBPageSliderComponent = /** @class */ (function () {
    function KBPageSliderComponent(element) {
        this.element = element;
        this.pageChange = new EventEmitter();
        this.pageSizeChange = new EventEmitter();
        this.pageCountChange = new EventEmitter();
        // Dot Indicator
        this.showIndicator = true;
        this.overlayIndicator = true;
        this.dotColor = 'white';
        // Interactivity
        this.locked = false;
        this.enableOverscroll = true;
        this.scrollStateChange = new EventEmitter();
        // INTERNAL STATE =======================================================================
        this._pageOffset = 1;
        // INTERACTIVE NAVIGATION ===============================================================
        this.blockInteraction = false;
        /** @type {?} */
        var htmlElement = this.element.nativeElement;
        this.touchEventHandler = new TouchEventHandler(this, htmlElement);
        this.sideClickHandler = new SideClickHandler(this, htmlElement);
        this.arrowKeysHandler = new ArrowKeysHandler(this);
    }
    Object.defineProperty(KBPageSliderComponent.prototype, "page", {
        get: /**
         * @return {?}
         */
        function () {
            return (this.renderer) ? this.renderer.page : 0;
        },
        // PUBLIC INTERFACE =====================================================================
        set: 
        // PUBLIC INTERFACE =====================================================================
        /**
         * @param {?} pn
         * @return {?}
         */
        function (pn) {
            if (pn < 0 || pn >= this.pageCount)
                return;
            if (pn == this.renderer.page)
                return;
            if (this.renderer) {
                if (pn == this.renderer.page + 1) {
                    if (this.blockInteraction) {
                        this.pageChange.emit(this.page);
                        return;
                    }
                    this.AnimateToNextPage();
                }
                else if (pn == this.renderer.page - 1) {
                    if (this.blockInteraction) {
                        this.pageChange.emit(this.page);
                        return;
                    }
                    this.AnimateToPreviousPage();
                }
                else {
                    if (this.blockInteraction) {
                        this.pageChange.emit(this.page);
                        return;
                    }
                    this.renderer.page = pn;
                    this.pageChange.emit(pn);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "pageCount", {
        get: /**
         * @return {?}
         */
        function () {
            return (this.renderer) ? this.renderer.pageCount : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "enableSideClicks", {
        set: /**
         * @param {?} enabled
         * @return {?}
         */
        function (enabled) {
            (this.sideClickHandler) ? this.sideClickHandler.enabled = enabled : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "enableArrowKeys", {
        set: /**
         * @param {?} enabled
         * @return {?}
         */
        function (enabled) {
            (this.arrowKeysHandler) ? this.arrowKeysHandler.enabled = enabled : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "pageOffset", {
        get: /**
         * @protected
         * @return {?}
         */
        function () {
            return this._pageOffset;
        },
        set: /**
         * @protected
         * @param {?} v
         * @return {?}
         */
        function (v) {
            this._pageOffset = v;
            if (!this.blockInteraction) {
                this.innerContainer.style.left = this.pxOffset;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "pxOffset", {
        get: /**
         * @private
         * @return {?}
         */
        function () {
            return -this.pageOffset * this.pageWidth + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "buttonTop", {
        get: /**
         * @return {?}
         */
        function () {
            return this.pageHeight / 2 - this.buttons.first.size / 2 + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "pageWidth", {
        // SIZING
        get: 
        // SIZING
        /**
         * @return {?}
         */
        function () {
            return this.element.nativeElement.offsetWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "pageHeight", {
        get: /**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var fullHeight = this.element.nativeElement.offsetHeight;
            /** @type {?} */
            var chin = (this.showIndicator && !this.overlayIndicator) ? 20 : 0;
            return fullHeight - chin;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "containerWidth", {
        get: /**
         * @return {?}
         */
        function () {
            return this.pageWidth * 3 + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "containerHeight", {
        get: /**
         * @return {?}
         */
        function () {
            return this.pageHeight + 'px';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBPageSliderComponent.prototype, "dotBottom", {
        // @ts-ignore
        get: 
        // @ts-ignore
        /**
         * @private
         * @return {?}
         */
        function () {
            return (this.overlayIndicator) ? '16px' : '0px';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @return {?}
     */
    KBPageSliderComponent.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        var _this = this;
        if (!this.renderer) {
            console.log("\n\t\t\t\tThe *kbPages directive is used to render pages efficiently, such that only\n\t\t\t\tpages that are visible are in the DOM. Without this directive, the page\n\t\t\t\tslider will not display anything.\n\t\t\t");
            throw new Error('No *kbPages directive found inside kb-page-slider');
        }
        this.renderer.pageCountChange.subscribe((/**
         * @param {?} count
         * @return {?}
         */
        function (count) {
            _this.pageCountChange.emit(count);
        }));
        this.Resize();
        this.renderer.Resize(this.pageWidth, this.pageHeight);
        window.addEventListener('resize', (/**
         * @return {?}
         */
        function () {
            _this.Resize();
            _this.renderer.Resize(_this.pageWidth, _this.pageHeight);
            _this.pageSizeChange.emit([_this.pageWidth, _this.pageHeight]);
        }));
    };
    /**
     * @protected
     * @return {?}
     */
    KBPageSliderComponent.prototype.Resize = /**
     * @protected
     * @return {?}
     */
    function () {
        this.innerContainer = this.element.nativeElement.querySelector('.inner');
        this.innerContainer.style.left = -this.pageWidth + 'px';
    };
    /**
     * @param {?} x
     * @return {?}
     */
    KBPageSliderComponent.prototype.ScrollTo = /**
     * @param {?} x
     * @return {?}
     */
    function (x) {
        if (this.locked || this.blockInteraction)
            return;
        this.pageOffset = this.ClampX(x);
    };
    /**
     * @param {?=} momentum
     * @return {?}
     */
    KBPageSliderComponent.prototype.AnimateToNextPage = /**
     * @param {?=} momentum
     * @return {?}
     */
    function (momentum) {
        var _this = this;
        if (this.locked || this.blockInteraction)
            return null;
        if (this.page == this.renderer.pageCount - 1) {
            return this.AnimateToX(1, 0).then((/**
             * @return {?}
             */
            function () {
                _this.pageOffset = 1;
            }));
        }
        if (momentum === undefined)
            momentum = 0;
        return this.AnimateToX(2, momentum).then((/**
         * @return {?}
         */
        function () {
            _this.renderer.page++;
            _this.pageChange.emit(_this.renderer.page);
            _this.pageOffset = 1;
        }));
    };
    /**
     * @param {?=} momentum
     * @return {?}
     */
    KBPageSliderComponent.prototype.AnimateToPreviousPage = /**
     * @param {?=} momentum
     * @return {?}
     */
    function (momentum) {
        var _this = this;
        if (this.locked || this.blockInteraction)
            return null;
        if (this.page == 0) {
            return this.AnimateToX(1, 0).then((/**
             * @return {?}
             */
            function () {
                _this.pageOffset = 1;
            }));
        }
        if (momentum === undefined)
            momentum = 0;
        return this.AnimateToX(0, momentum).then((/**
         * @return {?}
         */
        function () {
            _this.renderer.page--;
            _this.pageChange.emit(_this.renderer.page);
            _this.pageOffset = 1;
        }));
    };
    /**
     * @param {?} x
     * @param {?} momentum
     * @return {?}
     */
    KBPageSliderComponent.prototype.AnimateToX = /**
     * @param {?} x
     * @param {?} momentum
     * @return {?}
     */
    function (x, momentum) {
        var _this = this;
        if (this.locked || this.blockInteraction)
            return null;
        this.blockInteraction = true;
        /** @type {?} */
        var w = this.pageWidth;
        return new SlideAnimation(this.innerContainer, // Element to animate
        -this.pageOffset * w, // Current position (px)
        -x * w, // Destination position (px)
        momentum * w, // User scroll momentum (px/s)
        this.transitionDuration // Default duration, when momentum = 0
        ).then((/**
         * @return {?}
         */
        function () {
            _this.blockInteraction = false;
        }));
    };
    /**
     * @return {?}
     */
    KBPageSliderComponent.prototype.StartScroll = /**
     * @return {?}
     */
    function () {
        this.scrollStateChange.emit(true);
    };
    /**
     * @return {?}
     */
    KBPageSliderComponent.prototype.EndScroll = /**
     * @return {?}
     */
    function () {
        this.scrollStateChange.emit(false);
    };
    // OVERSCROLL (iOS STYLE) ===============================================================
    // Get X to a reasonable range, taking into account page boundaries
    // OVERSCROLL (iOS STYLE) ===============================================================
    // Get X to a reasonable range, taking into account page boundaries
    /**
     * @protected
     * @param {?} x
     * @return {?}
     */
    KBPageSliderComponent.prototype.ClampX = 
    // OVERSCROLL (iOS STYLE) ===============================================================
    // Get X to a reasonable range, taking into account page boundaries
    /**
     * @protected
     * @param {?} x
     * @return {?}
     */
    function (x) {
        if (x < 0)
            x = 0;
        if (x > 2)
            x = 2;
        // Allow some overscrolling on the first and last page
        if (this.page == 0 && x < 1) {
            if (this.enableOverscroll)
                x = 1 - this.OverscrollRamp(1 - x);
            else
                x = 1;
        }
        if (this.page == this.renderer.pageCount - 1 && x > 1) {
            if (this.enableOverscroll)
                x = 1 + this.OverscrollRamp(x - 1);
            else
                x = 1;
        }
        return x;
    };
    // Exponential ramp to simulate elastic pressure on overscrolling
    // Exponential ramp to simulate elastic pressure on overscrolling
    /**
     * @protected
     * @param {?} input
     * @return {?}
     */
    KBPageSliderComponent.prototype.OverscrollRamp = 
    // Exponential ramp to simulate elastic pressure on overscrolling
    /**
     * @protected
     * @param {?} input
     * @return {?}
     */
    function (input) {
        return Math.pow(input, 0.5) / 5;
    };
    KBPageSliderComponent.decorators = [
        { type: Component, args: [{
                    selector: 'kb-page-slider',
                    template: "\n        <!-- Display the actual pages -->\n        <div class=\"inner\"\n             [style.width]=\"containerWidth\"\n             [style.height]=\"containerHeight\">\n            <ng-content></ng-content>\n        </div>\n\n        <div class=\"buttons\" *ngIf=\"buttons.length > 0\" [style.top]=\"buttonTop\">\n            <!-- Display navigation buttons -->\n            <ng-content select=\"kb-nav-button[forward]\"></ng-content>\n            <ng-content select=\"kb-nav-button[backward]\"></ng-content>\n        </div>\n\n        <!-- Display the page indicator -->\n        <kb-dot-indicator *ngIf=\"showIndicator\"\n                          [page]=\"page\"\n                          [pageCount]=\"pageCount\"\n                          [dotColor]=\"dotColor\"\n                          [style.bottom]=\"dotBottom\">\n        </kb-dot-indicator>\n\t",
                    styles: [
                        ":host {\n\t\t\toverflow: hidden;\n\t\t\tdisplay: block;\n\t\t\tposition: relative;\n\t\t}",
                        ".inner {\n\t\t\tposition: absolute;\n\t\t\ttop: 0;\n\t\t\twill-change: left;\n\t\t}",
                        "kb-dot-indicator {\n\t\t\tposition: absolute;\n\t\t\twidth: 100%;\n\t\t}",
                        ".buttons {\n\t\t\tposition: absolute;\n\t\t\tz-index: 100;\n\t\t\twidth: 100%;\n\t\t}",
                        ".buttons >>> kb-nav-button {\n\t\t\tposition: absolute;\n\t\t\ttop: 0;\n\t\t}",
                        ".buttons >>> kb-nav-button[backward] {\n\t\t\tleft: 15px;\n\t\t}",
                        ".buttons >>> kb-nav-button[forward] {\n\t\t\tright: 15px;\n\t\t}"
                    ]
                },] },
    ];
    /** @nocollapse */
    KBPageSliderComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    KBPageSliderComponent.propDecorators = {
        page: [{ type: Input }],
        pageChange: [{ type: Output }],
        pageSizeChange: [{ type: Output }],
        pageCountChange: [{ type: Output }],
        showIndicator: [{ type: Input }],
        overlayIndicator: [{ type: Input }],
        dotColor: [{ type: Input }],
        locked: [{ type: Input }],
        transitionDuration: [{ type: Input }],
        enableOverscroll: [{ type: Input }],
        enableSideClicks: [{ type: Input }],
        enableArrowKeys: [{ type: Input }],
        scrollStateChange: [{ type: Output }],
        buttons: [{ type: ContentChildren, args: [KBNavButtonComponent,] }],
        renderer: [{ type: ContentChild, args: [KBPagesRendererDirective, { static: true },] }]
    };
    return KBPageSliderComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var KBDotIndicatorComponent = /** @class */ (function () {
    function KBDotIndicatorComponent() {
        // PUBLIC PROPERTIES
        this._page = 0;
        this._pageCount = 0;
        this.dotColor = 'white';
        // DATA REPRESENTATION
        // An array of page dots, one of which (the active one) is true.
        this.items = [];
    }
    Object.defineProperty(KBDotIndicatorComponent.prototype, "page", {
        set: /**
         * @param {?} p
         * @return {?}
         */
        function (p) {
            this._page = p;
            this.updateSelected();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(KBDotIndicatorComponent.prototype, "pageCount", {
        set: /**
         * @param {?} p
         * @return {?}
         */
        function (p) {
            this._pageCount = p || 0;
            this.updateItems();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     * @return {?}
     */
    KBDotIndicatorComponent.prototype.updateItems = /**
     * @private
     * @return {?}
     */
    function () {
        this.items = new Array(this._pageCount);
        for (var i = 0; i < this._pageCount; i++) {
            this.items[i] = { active: i == this._page };
        }
    };
    /**
     * @private
     * @return {?}
     */
    KBDotIndicatorComponent.prototype.updateSelected = /**
     * @private
     * @return {?}
     */
    function () {
        if (this.items.length != this._pageCount)
            return this.updateItems();
        if (this.items.length == 0)
            return;
        for (var i = 0; i < this._pageCount; i++)
            this.items[i].active = false;
        this.items[this._page].active = true;
    };
    KBDotIndicatorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'kb-dot-indicator',
                    template: "\n        <div *ngFor=\"let item of items\" class=\"dot\"\n             [style.background]=\"dotColor\"\n             [class.active]=\"item.active\"></div>\n\t",
                    styles: [
                        ":host {\n\t\t\tdisplay: -webkit-box;\n\t\t\tdisplay: -ms-flexbox;\n\t\t\tdisplay: flex;\n\t\t\t-webkit-box-orient: horizontal;\n\t\t\t-webkit-box-direction: normal;\n\t\t\t-ms-flex-direction: row;\n\t\t\tflex-direction: row;\n\t\t\t-webkit-box-pack: center;\n\t\t\t-ms-flex-pack: center;\n\t\t\tjustify-content: center;\n\t\t}",
                        ".dot {\n\t\t\twidth: 6px;\n\t\t\theight: 6px;\n\t\t\tborder-radius: 3px;\n\t\t\tmargin: 0 2px;\n\t\t\topacity: 0.33;\n\n\t\t\ttransition: opacity 90ms linear;\n\t\t\t-webkit-transition: opacity 90ms linear;\n\t\t}",
                        ".dot.active {\n\t\t\topacity: 1.0;\n\t\t}"
                    ]
                },] },
    ];
    KBDotIndicatorComponent.propDecorators = {
        page: [{ type: Input }],
        pageCount: [{ type: Input }],
        dotColor: [{ type: Input }]
    };
    return KBDotIndicatorComponent;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/*

 ANGULAR 2 PAGE SLIDER COMPONENT
 with DOM recycling and caching
 designed for mobile devices

 Copyright (c) 2016 Keaton Brandt

 Permission is hereby granted, free of charge, to any person obtaining a copy of this
 software and associated documentation files (the "Software"), to deal in the Software
 without restriction, including without limitation the rights to use, copy, modify, merge,
 publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or
 substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 DEALINGS IN THE SOFTWARE.

 */
var PageSliderModule = /** @class */ (function () {
    function PageSliderModule() {
    }
    PageSliderModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        BrowserModule
                    ],
                    declarations: [
                        KBPageSliderComponent,
                        KBPagesRendererDirective,
                        KBDotIndicatorComponent,
                        KBNavButtonComponent
                    ],
                    exports: [
                        KBPageSliderComponent,
                        KBPagesRendererDirective,
                        KBDotIndicatorComponent,
                        KBNavButtonComponent
                    ]
                },] },
    ];
    return PageSliderModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * Generated bundle index. Do not edit.
 */

export { PageSliderModule, KBPagesRendererDirective, KBPage, KBPageSliderComponent, KBDotIndicatorComponent, KBNavButtonComponent };
