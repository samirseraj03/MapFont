///. CONFIGRUACION OBSOLETA. ///

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, MenuController } from '@ionic/angular';
import { arrowBack, arrowForward } from 'ionicons/icons';
import GeolocationService from '../../../core/utils/Geolocation';
import { addIcons } from 'ionicons';
import { LoginPage } from '../../auth/login/login.page';
import { IonMenu, IonButton, IonCardContent, IonHeader, IonToolbar, IonButtons, IonCardTitle, IonRow, IonCol, IonItem, IonTitle, IonContent, IonCardHeader, IonInput, IonRouterOutlet, IonList } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

/**
 * @description
 * Menú principal de listados de ajustes, links a externalidades de configuración y control primario para invocar el logout del sistema.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-configuration-tab',
  templateUrl: './configuration-tab.page.html',
  styleUrls: ['./configuration-tab.page.scss'],
  standalone: true,
  imports: [IonList, IonRouterOutlet, IonMenu, CommonModule, FormsModule, IonButton, IonCardContent, IonHeader, IonToolbar, IonButtons, IonCardTitle, IonRow, IonCol, IonItem, IonTitle, IonContent, IonCardHeader, IonInput, TranslateModule],
})
export class ConfigurationTabPage {
  constructor(
    public NavCtrl: NavController,
    private menuCtrl: MenuController,
    public GeolocationService: GeolocationService
    // loginPage was removed from DI here since it's an Injectable now but not used as a token
  ) {
    addIcons({ arrowBack, arrowForward });
  }

  ionViewWillEnter() {
    // Mostrar el menú al entrar en la página de los tabs
    //this.menuCtrl.enable(true, 'main-content');
  }



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
        // Instead of calling loginPage.Logout(), just route appropriately 
        // since Logout functionality is supposed to be in AuthenticationService
        this.NavCtrl.navigateRoot('tabs/fonts');
        break;

      default:
        this.NavCtrl.navigateRoot('tabs/configuration');

        break;
    }

    //this.menuCtrl.close('main-content');
  }
}
