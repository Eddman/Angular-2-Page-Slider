/**
 * When the user clicks very close to the edge of a page, move in that direction.
 */

import {Destroyable, PageSliderControlAPI} from '../types';

export class SideClickHandler implements Destroyable {

    private _enabled: boolean = true;
    private _threshold: number = 20; // 20px from the edge of the screen

    // Event listeners
    private readonly clickListener = (e: MouseEvent) => this.clickHandler(e);

    public constructor(private readonly delegate: PageSliderControlAPI,
                       private readonly element: HTMLElement) {
        this.element.addEventListener('click', this.clickListener);
    }

    public destroy(): void {
        this.element.removeEventListener('click', this.clickListener);
    }

    public set enabled(value: boolean) {
        this._enabled = value;
    }

    private clickHandler(e: MouseEvent) {
        if (!this._enabled) {
            return;
        }

        const elementX = e.clientX - this.element.getBoundingClientRect().left;
        if (elementX < this._threshold) {
            this.delegate.animateToPreviousPage(0);
        } else if (elementX > this.element.offsetWidth - this._threshold) {
            this.delegate.animateToNextPage(0);
        }
    }
}
