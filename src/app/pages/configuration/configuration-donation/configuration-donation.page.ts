import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from '../../../core/utils/Geolocation';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton, IonMenuButton, IonMenu, IonCardSubtitle } from "@ionic/angular/standalone";

/**
 * @description
 * Pantalla genérica para donaciones. Redirige a enlaces y procesa links utilizando el router nativo, sin dependencias complejas a nivel de bases de datos.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-donation.page.html',
  styleUrls: ['./configuration-donation.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonButton, IonCardTitle, IonCardHeader, IonCard, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader, CommonModule, FormsModule, ConfigurationTabPage, IonMenu, IonMenuButton],

})
export class ConfigurationDonationPage implements OnInit {

  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  img_ref_config: any = null

  constructor(
    public NavCtrl: NavController,
    public GeolocationService: GeolocationService
  ) {
    addIcons({ arrowBack });
  }


  ngOnInit() {
  }

  Update(event: any) {

  }


}
