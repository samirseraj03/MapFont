import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent , NavController, IonButtons, IonIcon, IonButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { ConfigurationTabPage } from "../configuration-tab/configuration-tab.page";
import { IonicModule } from '@ionic/angular';


@Component({
    selector: 'app-configuration-user',
    templateUrl: 'ConfigurationUser.page.html',
    styleUrls: ['ConfigurationUser.page.scss'],
    standalone: true,
    imports: [ IonicModule ,IonButton, IonIcon, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, ConfigurationTabPage]
})
export class ConfigurationUserPage {
  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();
}
