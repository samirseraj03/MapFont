import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, MenuController } from '@ionic/angular';
import { arrowBack, arrowForward } from 'ionicons/icons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { addIcons } from 'ionicons';
import { LoginPage } from 'src/app/authentication/login/login.page';
import {  IonMenu   ,IonButton , IonCardContent ,IonHeader , IonToolbar , IonButtons ,IonCardTitle , IonRow, IonCol ,IonItem , IonTitle , IonContent , IonCardHeader , IonInput, IonRouterOutlet, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-configuration-tab',
  templateUrl: './configuration-tab.page.html',
  styleUrls: ['./configuration-tab.page.scss'],
  standalone: true,
  imports: [IonList, IonRouterOutlet,  IonMenu , CommonModule, FormsModule , CommonModule, FormsModule ,IonButton , IonCardContent ,IonHeader , IonToolbar , IonButtons ,IonCardTitle , IonRow, IonCol ,IonItem , IonTitle , IonContent , IonCardHeader , IonInput],
})
export class ConfigurationTabPage {
  constructor(public NavCtrl: NavController, private menuCtrl: MenuController , private loginPage : LoginPage) {
    addIcons({ arrowBack, arrowForward });
  }

  ionViewWillEnter() {
    // Mostrar el menú al entrar en la página de los tabs
    //this.menuCtrl.enable(true, 'main-content');
  }

  GeolocationService = new GeolocationService();

  // para mostarar al usuario pagina completada y ir al inicio
  async navigateTo(event: any) {
    switch (event) {
      case 'formularios':
        this.NavCtrl.navigateForward('tabs/lookforms');

        break;
      case 'configuracion':
        this.NavCtrl.navigateForward('/tabs/configuration');
        break;
      case 'seguridad':
        this.NavCtrl.navigateForward('tabs/security');

        break;
      case 'donaciones':
        this.NavCtrl.navigateForward('tabs/donation');

        break;
      case 'guardados':
        this.NavCtrl.navigateForward('tabs/favorites');
        break;

      case 'Confirmacion':
        this.NavCtrl.navigateForward('confirmation');
        break;

      case 'CerrarSession':
        await this.loginPage.Logout()
        this.NavCtrl.navigateRoot('tabs/fonts');
        break;

      default:
        this.NavCtrl.navigateRoot('tabs/configuration');

        break;
    }

    //this.menuCtrl.close('main-content');
  }
}
