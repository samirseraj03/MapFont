import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-configuration-tab',
  templateUrl: './configuration-tab.page.html',
  styleUrls: ['./configuration-tab.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ConfigurationTabPage implements OnInit {

  
  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();

  ngOnInit() {
  }


  // para mostarar al usuario pagina completada y ir al inicio
  navigateTo(event: any){
    switch (event){
      case 'formularios':
        this.NavCtrl.navigateForward( '/formularios');
        break;
      case 'configuracion':
        this.NavCtrl.navigateForward( '/configuration');
        break;
      case 'seguridad':
        this.NavCtrl.navigateForward( '/seguridad');
        break;
      case 'donaciones':
        this.NavCtrl.navigateForward( '/donaciones');
        break;
      case 'guardados':
        this.NavCtrl.navigateForward( '/guardados');
        break
      default:
        this.NavCtrl.navigateForward( '/configuracion');
        break;
    }
  }

}
