import {NgZone} from '@angular/core';
import {Destroyable, PageSliderControlAPI} from '../types';

export class AutoscrollHandler implements Destroyable {

    private _enabled: boolean = true;
    private _intervalRef: number | undefined;
    private _autoScrollInterval: number | undefined;

    public constructor(private readonly delegate: PageSliderControlAPI,
                       private readonly ngZone: NgZone) {
        this.startAutoScroll();
    }

    public set autoScrollInterval(value: number | undefined) {
        this._autoScrollInterval = value;
        if (this._autoScrollInterval == null) {
            this.stopAutoScroll();
        } else {
            this.startAutoScroll();
        }
    }

    public set enabled(value: boolean) {
        if (this._enabled && !value) {
            this._enabled = value;
            this.stopAutoScroll();
        } else if (!this._enabled && value) {
            this._enabled = value;
            this.startAutoScroll();
        } else {
            this._enabled = value;
        }
    }

    public destroy(): void {
        this.stopAutoScroll();
    }

    private startAutoScroll(): void {
        this.stopAutoScroll();

        if (this._autoScrollInterval != null) {
            this.ngZone.runOutsideAngular(() => {
                this._intervalRef = setInterval(
                    () => this.scrollToNext(),
                    this._autoScrollInterval! + this.delegate.transitionDuration
                );
            });
        }
    }

    private stopAutoScroll(): void {
        if (this._intervalRef != null) {
            this.ngZone.runOutsideAngular(() => {
                clearInterval(this._intervalRef);
                this._intervalRef = undefined;
            });
        }
    }

    private scrollToNext(): void {
        if (!this._enabled) {
            return;
        }
        if (this.delegate.page < this.delegate.pageCount - 1) {
            // Move one slide forward
            this.ngZone.run(() => {
                this.delegate.animateToNextPage(0);
            });
        } else {
            // Move to front
            this.ngZone.run(() => {
                this.moveToFirst();
            });
        }
    }

    private moveToFirst() {
        this.stopAutoScroll();

        if (this.delegate.page > 0) {
            this.delegate.animateToPreviousPage(10);
            this.ngZone.runOutsideAngular(() => {
                setTimeout(() => {
                    this.ngZone.run(() => {
                        this.moveToFirst();
                    });
                }, 10);
            });
        } else {
            this.startAutoScroll();
        }
    }
}
