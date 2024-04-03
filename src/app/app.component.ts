import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon, IonButton, IonButtons } from '@ionic/angular/standalone';
import { LoadingController, AlertController, NavController } from "@ionic/angular";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(public NavCtrl : NavController) {}

 
}
