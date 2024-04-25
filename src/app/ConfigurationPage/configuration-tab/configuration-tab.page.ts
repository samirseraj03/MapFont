import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController , MenuController } from '@ionic/angular';
import { arrowBack, arrowForward } from 'ionicons/icons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { addIcons } from 'ionicons';



@Component({
  selector: 'app-configuration-tab',
  templateUrl: './configuration-tab.page.html',
  styleUrls: ['./configuration-tab.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
  
})
export class ConfigurationTabPage {

  
  constructor(public NavCtrl: NavController , private menuCtrl: MenuController) {
    addIcons({ arrowBack , arrowForward });
  }

  ionViewWillEnter() {
    // Mostrar el menú al entrar en la página de los tabs
    this.menuCtrl.enable(true, 'main-content');
  }

  GeolocationService = new GeolocationService();

  // para mostarar al usuario pagina completada y ir al inicio
  async navigateTo(event: any){
    switch (event){
      case 'formularios':
        this.NavCtrl.navigateForward( 'tabs/lookforms');

        break;
      case 'configuracion':
        this.NavCtrl.navigateForward( '/tabs/configuration');
        break;
      case 'seguridad':
        this.NavCtrl.navigateForward( 'tabs/security');


        break;
      case 'donaciones':
        this.NavCtrl.navigateForward( 'tabs/donation');


        break;
      case 'guardados':
        this.NavCtrl.navigateForward( 'tabs/favorites');
        break

      case 'Confirmacion':
        this.NavCtrl.navigateForward( 'confirmation');
        break

      default:
        this.NavCtrl.navigateRoot( 'tabs/configuration');

        break;
    }

      this.menuCtrl.close('main-content');
  }

}
