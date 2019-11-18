import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NDotIndicatorComponent} from './components/dotindicator.component';
import {NgNavButtonComponent} from './components/navbutton.component';
import {NgPageSliderComponent} from './components/pageslider.component';
import {NgPagesRendererDirective} from './components/render.directive';

@NgModule({
    imports     : [
        CommonModule
    ],
    declarations: [
        NgPageSliderComponent,
        NgPagesRendererDirective,
        NDotIndicatorComponent,
        NgNavButtonComponent
    ],
    exports     : [
        NgPageSliderComponent,
        NgPagesRendererDirective
    ]
})
export class NgPageSliderModule {
}
