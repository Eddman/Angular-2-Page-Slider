import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NDotIndicatorComponent} from './components/dotindicator.component';
import {NgNavButtonComponent} from './components/navbutton.component';
import {NgPageSliderComponent} from './components/pageslider.component';
import {KBPagesRendererDirective} from './components/render.directive';

@NgModule({
    imports     : [
        CommonModule
    ],
    declarations: [
        NgPageSliderComponent,
        KBPagesRendererDirective,
        NDotIndicatorComponent,
        NgNavButtonComponent
    ],
    exports     : [
        NgPageSliderComponent,
        KBPagesRendererDirective
    ]
})
export class NgPageSliderModule {
}
