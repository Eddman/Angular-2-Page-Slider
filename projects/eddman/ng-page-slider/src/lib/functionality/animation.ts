import {NgZone} from '@angular/core';
import {ReplaySubject} from 'rxjs';

/*
	A special class that wraps CSS3 animations and also determines their ideal duration
	based on momentum and distance to travel.
*/

const kEasingFunction = 'cubic-bezier(.35,.45,.5,1)';
const kEasingStartSlope = 1.33;
const kDefaultDuration = 250;
const kMinDuration = 60;
const kMaxDuration = 660;

export class SlideAnimation {

    private readonly _completed = new ReplaySubject<void>();

    // The real meat of the animation code
    // Hard-coded to the 'left' property because that's all we use here
    // but certainly this code could be generalized if needed.
    public constructor(element: HTMLElement,
                       private readonly currentPX: number,
                       private readonly destPX: number,
                       private readonly momentumPX: number,
                       private readonly defaultDuration: number = kDefaultDuration,
                       private readonly ngZone: NgZone) {
        // Set up the CSS transition
        const duration = Math.round(this.calculatedDuration);
        const tProperty = `left ${duration}ms ${kEasingFunction}`;
        element.style.transition = tProperty;
        element.style.webkitTransition = tProperty;

        this.ngZone.runOutsideAngular(() => {
            // Wait for that to propogate
            setTimeout(() => {

                // Move to the destination location
                element.style.left = destPX + 'px';

                this.ngZone.runOutsideAngular(() => {
                    // Wait for that to finish and clean it up
                    setTimeout(() => {
                        this.ngZone.run(() => {
                            this._completed.next();
                            this._completed.complete();
                        });

                        element.style.transition = '';
                        element.style.webkitTransition = '';
                    }, duration + 10);
                });

            }, 10);
        });
    }

    public get completed(): ReplaySubject<void> {
        return this._completed;
    }

    // HELPERS

    // First step is figuring out the duration such that the starting
    // momentum of the transition matches the user's scroll momentum.
    // We could do this with 100% accuracy by determining the slope
    // of the bezier easing curve but ... meh. It's about 1.5-ish.
    private get calculatedDuration(): number {
        const travelPX = this.destPX - this.currentPX;

        // If the momentum is going the same direction as the movement, use it!
        if (this.momentumPX !== 0 && (this.momentumPX < 0) === (travelPX < 0)) {
            const linearDuration = 1000 * Math.abs(travelPX) / Math.abs(this.momentumPX);
            const estimate = linearDuration * kEasingStartSlope;
            return Math.max(Math.min(estimate, kMaxDuration), kMinDuration);

            // Otherwise, throw it out and use our default duration
        } else {
            return this.defaultDuration;
        }
    }
}
