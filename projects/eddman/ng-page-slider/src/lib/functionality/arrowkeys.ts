/**
 * When the user clicks very close to the edge of a page, move in that direction.
 */

import {NgZone} from '@angular/core';
import {Destroyable, PageSliderControlAPI} from '../types';

export class ArrowKeysHandler implements Destroyable {

    private _enabled: boolean = true;

    private readonly keyDownListener = (e: KeyboardEvent) => this.keyHandler(e);

    public constructor(private readonly delegate: PageSliderControlAPI,
                       private readonly ngZone: NgZone) {
        this.ngZone.runOutsideAngular(() => {
            document.addEventListener('keydown', this.keyDownListener);
        });
    }

    public destroy(): void {
        this.ngZone.runOutsideAngular(() => {
            document.removeEventListener('keydown', this.keyDownListener);
        });
    }

    public set enabled(value: boolean) {
        this._enabled = value;
    }

    private keyHandler(e: KeyboardEvent) {
        if (!this._enabled) {
            return;
        }
        switch (true) {
            case e.key === 'ArrowLeft':
                this.delegate.animateToPreviousPage(0);
                return;
            case e.key === 'ArrowRight':
                this.delegate.animateToNextPage(0);
                return;
            case e.keyCode === 37:
                this.delegate.animateToPreviousPage(0);
                return;
            case e.keyCode === 39:
                this.delegate.animateToNextPage(0);
                return;
        }
    }
}
