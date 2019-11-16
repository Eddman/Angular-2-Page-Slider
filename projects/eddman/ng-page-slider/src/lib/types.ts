/*
	This file contains some helpful types that are used throughout the module
*/

// The slider renders 3 pages to DOM at once, as follows
export enum StackLocation {
    Previous,
    Current,
    Next
}

// Internal API for event handlers to control the page slider
export interface PageSliderControlAPI {
    scrollTo(x: number): void;

    animateToX(x: number, momentum: number): void;

    animateToNextPage(momentum: number): void;

    animateToPreviousPage(momentum: number): void;

    startScroll(): void;

    endScroll(): void;

    readonly page: number;
    readonly pageCount: number;
    readonly transitionDuration: number;
    readonly pageWidth: number;
}

export interface Destroyable {
    destroy(): void;
}

export interface SliderPage {
    imageURL?: string;
}
