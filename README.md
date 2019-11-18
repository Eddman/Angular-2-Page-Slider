**Fork of [KeatonTech/Angular-2-Page-Slider](https://github.com/KeatonTech/Angular-2-Page-Slider).**
---

**Mimicks the functionality of UIPageViewController in pure HTML for mobile web apps, using
DOM recycling and CSS3 transitions for near-native performance. Built with Angular 8, and
designed to work seamlessly in normal NG2 templates.**

*Designed for Angular 8.2.0+*

### Live Demo
http://samuel.netocny.com

# Example Usage

### Installation
```
npm install --save @netocny/ng-page-slider
```

### Typescript

```typescript
import {Component, NgModule} from '@angular/core';
import {NgPageSliderModule}    from '@netocny/ng-page-slider';

@Component({
	selector: 'example-component',
	template: `
		<ng-page-slider *ngIf="sliderConfiguration && (sliderConfiguration | async) as loadedPages"
                        [enableArrowKeys]="keysEnabled"
                        [transitionDuration]="loadedPages.duration"
                        [autoScrollInterval]="loadedPages.autoSlide">
        
            <!-- Pages -->
            <div *ngSliderPages="let page of loadedPages.images" class="page">
                <img [src]="page.imageURL">
                <span class="title">{{page.title}}</span>
            </div>
        </ng-page-slider>
	`
})
export class ExampleComponent {    
    public keysEnabled: boolean = true;
	public pages = {   
        duration: 700,
        autoSlide: 2000,
        images: [
		    { title: "Page 1", imageURL: 'some/image.png' },
		    { title: "Page 2", imageURL: 'some/other_image.png' }
	    ] 
    }
} 

@NgModule({
	imports: [
		NgPageSliderModule
	],
	declarations: [
		ExampleComponent
	]
})
export class ExampleModule {
}
```

# API

## NgPageSliderComponent (ng-page-slider)
Container component for pages. Handles touch events, resizing and animation.

### Input Properties
* **page:** Current page number, zero-based index.
	* Allows two-way data binding
	* Must be a number 0 <= page < pageCount
	* Defaults to 0
* **transitionDuration:** In the absence of scrolling momentum, how long should a transition take?
	* Expressed as an integer number of milliseconds >= 0
	* Defaults to 250ms
* **locked:** When true, page scrolling is disabled 
	* Boolean, defaults to false
* **showIndicator:** When true, includes a dot indicator at the bottom.
	* Boolean, defaults to true
* **overlayIndicator:** When true, renders indicator above the page content.
	* Boolean, defaults to true
* **dotColor:** Color of the active page dot (other dots are the same color but more transparent)
	* CSS Color string (color name, hex, rgb, or rgba)
	* Defaults to white
* **enableOverscroll:** When true, user can scroll slightly past the first and last page.
	* Boolean, defaults to true
* **enableArrowKeys:** When true, the left and right arrow keys will cause page navigation.
	* Boolean, defaults to true

## NgPagesRendererDirective (ngSliderPages)
Renders pages using DOM recycling, so only at most 3 exist on the DOM at any given time
(previous, current, next). Modeled on ngFor, uses the exact same looping syntax.

### Provided Loop Variables
These variables are available inside of ngSliderPages, similar to ngFor loop items.

* **index:** *number* Zero-based index of the current page.
* **isFirst:** *boolean* True when the page is the first page.
* **isLast:** *boolean* True when the page is the last page.
* **isActive:** *boolean* True when the page is currently being viewed by the user.
