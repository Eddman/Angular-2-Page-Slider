import {ChangeDetectionStrategy, Component} from '@angular/core';
import {of} from 'rxjs';

@Component({
    selector   : 'example-component',
    templateUrl: 'app.component.html',
    styleUrls  : ['app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public keysEnabled: boolean = true;
    public pages = of({
        duration : 700,
        autoSlide: 2000,
        images   : [
            {
                title   : 'Page 1',
                imageURL: 'assets/notsureif.png'
            },
            {
                title   : 'Page 2',
                imageURL: 'assets/homer.png'
            }
        ]
    });
}
