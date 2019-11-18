// INTERACTIVITY - TOUCH EVENTS =============================================================
// Handles HTML touch events and formats it nicely for

import {NgZone} from '@angular/core';
import {Destroyable, PageSliderControlAPI} from '../types';

// Snap back if user has moved less than 10% of the page
const kDistanceThreshold = 0.1;

// If the user has moved less than 50% of the page, snap back
// unless that are moving at more than 30% the page width every second
const kMomentumThreshold = 0.3;
const kDistanceMomentumThreshold = 0.5;

// Ignore scrolls until they have moved at least 3% along X. If, during that time, they
// move more than 20px on Y, they will be rejected and interpreted instead as a vertical
// scroll gesture
const kAcceptAtX = 0.03;
const kRejectAtY = 20;

export class TouchEventHandler implements Destroyable {

    // Touch tracking state
    private startX: number = 0;
    private currentX: number = 0;
    private startYpx: number = 0;

    private currentScroll: number = 1;
    private tracking: number | null = null;
    private accepted: boolean = false;

    // MOMENTUM HIGH PASS

    private diffsX = [0, 0, 0];
    private timesX = [20, 20, 20];
    private lastSampleTime: number = 0;
    private diffsIndex = 0;

    // Event listeners
    private readonly touchStartListener = (e: TouchEvent) => this.touchStart(e);
    private readonly touchMoveListener = (e: TouchEvent) => this.touchMove(e);
    private readonly touchEndListener = (e: TouchEvent) => this.touchEnd(e);

    public constructor(private readonly delegate: PageSliderControlAPI,
                       private readonly element: HTMLElement,
                       private readonly ngZone: NgZone) {
        this.ngZone.runOutsideAngular(() => {
            // Add touch event listeners
            this.element.addEventListener('touchstart', this.touchStartListener);
            this.element.addEventListener('touchmove', this.touchMoveListener);
            this.element.addEventListener('touchend', this.touchEndListener);
            this.element.addEventListener('touchcancel', this.touchEndListener);
        });
    }

    public destroy(): void {
        this.ngZone.runOutsideAngular(() => {
            // Remove touch event listeners
            this.element.removeEventListener('touchstart', this.touchStartListener);
            this.element.removeEventListener('touchmove', this.touchMoveListener);
            this.element.removeEventListener('touchend', this.touchEndListener);
            this.element.removeEventListener('touchcancel', this.touchEndListener);
        });
    }

    private captureXDiff(diff: number) {
        this.diffsX[this.diffsIndex] = diff;

        const ctime = new Date().getTime();
        this.timesX[this.diffsIndex] = ctime - this.lastSampleTime;
        this.lastSampleTime = ctime;

        if (++this.diffsIndex === this.diffsX.length) {
            this.diffsIndex = 0;
        }
    }

    // Returns the scroll momentum in fractional page widths per second.
    // (fpw/s * page width = px/s)
    private get momentumX(): number {
        let acc = 0;
        for (let i = 0; i < this.diffsX.length; i++) {
            acc += (this.diffsX[i] / this.timesX[i]) * 1000 / 3;
        }
        return acc;
    }

    // DOM EVENT HANDLERS ===================================================================

    private touchStart(event: TouchEvent) {
        if (this.tracking) {
            return;
        }
        if (event.touches.length > 1) {
            return;
        }

        const touch = event.touches.item(0);
        if (touch != null) {
            this.tracking = touch.identifier;
            this.startX = touch.clientX / this.delegate.pageWidth;
            this.currentX = this.startX;
            this.startYpx = touch.clientY;
            this.lastSampleTime = new Date().getTime();
            this.accepted = false;
        }
    }

    private touchMove(event: TouchEvent) {
        const touch = this.getTrackingTouch(event.changedTouches);
        if (touch == null) {
            return;
        }

        const newX = touch.clientX / this.delegate.pageWidth;
        const diffX = newX - this.currentX;

        if (!this.accepted) {
            if (Math.abs(newX - this.startX) >= kAcceptAtX) {
                if (Math.abs(touch.clientY - this.startYpx) > kRejectAtY) {
                    this.tracking = null;
                    return;
                } else {
                    this.accepted = true;
                    this.delegate.emitHumanInteraction();
                }
            } else {
                return;
            }
        }

        event.preventDefault();
        this.captureXDiff(diffX);
        this.currentScroll -= diffX;
        this.delegate.scrollTo(this.currentScroll);
        this.currentX = newX;
    }

    private touchEnd(event: TouchEvent) {
        const touch = this.getTrackingTouch(event.changedTouches);
        if (touch == null) {
            return;
        }

        this.tracking = null;
        if (this.startX === this.currentX) {
            return;
        }
        if (!this.accepted) {
            return;
        }
        event.preventDefault();

        this.currentScroll = 1;
        const endingMomentumX = this.momentumX;

        if (this.currentX + kDistanceThreshold < this.startX) {
            if (
                this.currentX + kDistanceMomentumThreshold < this.startX ||
                -endingMomentumX > kMomentumThreshold
            ) {
                this.delegate.animateToNextPage(endingMomentumX);
            } else {
                this.delegate.animateToX(1, endingMomentumX);
            }
        } else if (this.currentX - kDistanceThreshold > this.startX) {
            if (
                this.currentX - kDistanceMomentumThreshold > this.startX ||
                endingMomentumX > kMomentumThreshold
            ) {
                this.delegate.animateToPreviousPage(endingMomentumX);
            } else {
                this.delegate.animateToX(1, endingMomentumX);
            }
        } else {
            this.delegate.animateToX(1, endingMomentumX);
        }
    }

    // HELPERS

    private getTrackingTouch(list: TouchList) {
        if (this.tracking === null) {
            return null;
        }
        for (let i = 0; i < list.length; i++) {
            const touch = list.item(i);
            if (touch != null && touch.identifier === this.tracking) {
                return touch;
            }
        }
        return null;
    }
}
