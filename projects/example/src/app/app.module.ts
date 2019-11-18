import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgPageSliderModule} from '@netocny/ng-page-slider';
import {AppComponent} from './app.component';

@NgModule({
    imports     : [
        BrowserModule,
        NgPageSliderModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap   : [
        AppComponent
    ]
})
export class AppModule {
}
