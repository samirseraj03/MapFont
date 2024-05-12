import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon, IonButton, IonButtons } from '@ionic/angular/standalone';
import { LoadingController, AlertController, NavController } from "@ionic/angular";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(public NavCtrl : NavController , private transalte : TranslateService) {
    this.transalte.setDefaultLang('es');
    this.transalte.addLangs(['es' , 'ca' , 'en'])
  }
}
