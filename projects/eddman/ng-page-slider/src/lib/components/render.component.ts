import {Directive, EmbeddedViewRef, EventEmitter, Input, TemplateRef, ViewContainerRef} from '@angular/core';

import {SliderPage, StackLocation} from '../types';

// PAGE CLASS ===============================================================================
// Stores information about each page that is accessible from the template

export class KBPage {
    public constructor(_: any,
                       public index: number,
                       private parent: KBPagesRendererDirective) {
    }

    public get isActive() {
        return this.parent.page === this.index;
    }

    public get isFirst() {
        return this.index === 0;
    }

    public get isLast() {
        return this.index === this.parent.pageCount - 1;
    }
}

// PAGE RENDERER DIRECTIVE ==================================================================
// Similar to ngFor, but renders items as stacked full-screen pages

@Directive({selector: '[kbPages]'})
export class KBPagesRendererDirective {

    // Angular Injection
    public constructor(private viewContainer: ViewContainerRef,
                       private template: TemplateRef<KBPage>) {
    }

    // LOOP TEMPLATING

    // Get the input data (using loop syntax)
    public collection: SliderPage[] | undefined;

    @Input()
    public set kbPagesOf(coll: any[]) {
        this.collection = coll;

        if (this.isInitialized) {
            this.clearDOM();
            this.createDOM();
        }
    }

    // Initialization
    private isInitialized: boolean = false;

    public ngOnInit() {
        this.isInitialized = true;
        this.createDOM();
    }

    // PAGINATION

    // Calculate page count from the loop
    private _lastPageCount: number = -1;

    public get pageCount() {
        const count = (this.collection) ? this.collection.length : 0;
        if (this._lastPageCount !== count) {
            this.pageCountChange.emit(count);
        }
        return count;
    }

    public pageCountChange = new EventEmitter<number>();

    // Page access
    private _page: number = 0;

    private setPage(page: number): boolean {
        if (page < 0 || page >= this.pageCount) {
            return false;
        }
        const oldPage = this._page;
        this._page = page;
        this.changePage(page, oldPage);
        return true;
    }

    public get page(): number {
        return this._page;
    }

    public set page(page: number) {
        this.setPage(page);
    }

    // SIZING

    private pageWidth: number = 0;
    private pageHeight: number = 0;

    public resize(width: number, height: number) {
        this.pageWidth = width;
        this.pageHeight = height;

        if (this.isInitialized) {
            this.clearDOM();
            this.createDOM();
        }
    }

    // DOM RENDERING ========================================================================
    private views: Array<EmbeddedViewRef<any> | null> = [null, null, null];

    // Renders 3 pages
    private createDOM() {
        if (this.pageCount === 0 || this.collection == null) {
            return;
        }
        if (this.page > 0) {
            this.buildPage(this.page - 1, StackLocation.Previous);
        }
        this.buildPage(this.page, StackLocation.Current);
        if (this.page < this.pageCount - 1) {
            this.buildPage(this.page + 1, StackLocation.Next);
        }
    }

    // Clears all pages out of the DOM, useful for re-rendering
    private clearDOM() {
        for (const view of this.views) {
            if (view) {
                view.destroy();
            }
        }
        this.views = [null, null, null];
    }

    // HTML CONSTRUCTION AND MANAGEMENT

    private buildPage(pageNumber: number, loc: StackLocation) {
        if (pageNumber < 0 || pageNumber >= this.pageCount) {
            throw new Error('Attempted to create non-existent page: ' + pageNumber);
        }

        if (this.collection == null) {
            return;
        }

        // Create the page given the template
        this.views[loc] = this.viewContainer.createEmbeddedView(
            this.template,
            new KBPage(this.collection[pageNumber], pageNumber, this));

        // Style the page accordingly
        for (const rootNode of this.views[loc]!.rootNodes) {
            this.styleAsPage(rootNode);
            this.styleAtStackLocation(rootNode, loc);
        }
    }

    // Styles a DOM element to be an absolute-positioned page-sized container
    private styleAsPage(pageElement: HTMLElement) {
        pageElement.style.display = 'block';
        pageElement.style.position = 'absolute';
        pageElement.style.width = this.pageWidth + 'px';
        pageElement.style.height = this.pageHeight + 'px';
    }

    // Styles a DOM element with an X location in the container
    private styleAtStackLocation(pageElement: HTMLElement, loc: StackLocation) {
        const xLocationInContainer = loc * this.pageWidth;
        pageElement.style.left = xLocationInContainer + 'px';
    }

    // Moves an existing page to a new stack location
    private changeStackLocationOfView(curr: StackLocation, to: StackLocation) {
        if (!this.views[curr]) {
            throw new Error('View does not exist at location: ' + curr);
        }
        for (const rootNode of this.views[curr]!.rootNodes) {
            this.styleAtStackLocation(rootNode, to);
        }
        this.views[to] = this.views[curr];
        this.views[curr] = null;
    }

    // NAVIGATION

    // Updates rendering to display a new page
    private changePage(newPage: number, oldPage: number) {

        // If the page is incrementing or decrementing, we can simply shift existing views
        if (newPage === oldPage + 1) {
            this.goToNextPage();
        } else if (newPage === oldPage - 1) {
            this.goToPreviousPage();

            // Otherwise, just rebuild the DOM around this new page
        } else {
            this.clearDOM();
            this.createDOM();
        }
    }

    private goToNextPage() {
        // Remove the previous page from the DOM
        if (this.views[StackLocation.Previous]) {
            this.views[StackLocation.Previous]!.destroy();
            this.views[StackLocation.Previous] = null;
        }

        // Shift the Current and Next pages backwards
        this.changeStackLocationOfView(StackLocation.Current, StackLocation.Previous);
        this.changeStackLocationOfView(StackLocation.Next, StackLocation.Current);

        // Render a new page, if possible
        if (this.page < this.pageCount - 1) {
            this.buildPage(this.page + 1, StackLocation.Next);
        }
    }

    private goToPreviousPage() {
        // Remove the previous page from the DOM
        if (this.views[StackLocation.Next]) {
            this.views[StackLocation.Next]!.destroy();
            this.views[StackLocation.Next] = null;
        }

        // Shift the Current and Next pages backwards
        this.changeStackLocationOfView(StackLocation.Current, StackLocation.Next);
        this.changeStackLocationOfView(StackLocation.Previous, StackLocation.Current);

        // Render a new page, if possible
        if (this.page > 0) {
            this.buildPage(this.page - 1, StackLocation.Previous);
        }
    }
}
