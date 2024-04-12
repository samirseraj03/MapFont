import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
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

  
  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack , arrowForward });
  }
  GeolocationService = new GeolocationService();

  // para mostarar al usuario pagina completada y ir al inicio
  navigateTo(event: any){
    switch (event){
      case 'formularios':
        this.NavCtrl.navigateRoot( '/lookforms');
        break;
      case 'configuracion':
        this.NavCtrl.navigateRoot( '/tabs/configuration');


        break;
      case 'seguridad':
        this.NavCtrl.navigateRoot( '/security');


        break;
      case 'donaciones':
        this.NavCtrl.navigateRoot( '/donation');


        break;
      case 'guardados':
        this.NavCtrl.navigateRoot( '/favorites');

        break
      default:
        this.NavCtrl.navigateRoot( '/configuration');

        break;
    }
  }

}
