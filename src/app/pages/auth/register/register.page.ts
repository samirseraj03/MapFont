import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Servicios
import { AuthFacade } from '../../../core/facades/auth.facade';
import GeolocationService from '../../../core/utils/Geolocation';

// Ionic Standalone & Translate
import { IonContent, IonInput, IonButton, IonIcon, IonToggle } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';

// Iconos
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, logoGoogle, logoApple } from 'ionicons/icons';

/**
 * @description
 * Pantalla de registro del sistema. Captura información pura y envía el flujo de validación de usuarios y bases de datos a AuthFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonIcon, IonToggle, CommonModule, FormsModule, TranslateModule],
})
export class RegisterPage implements OnInit {
  email: any;
  password: any;
  username: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authFacade: AuthFacade,
    private GeolocationService: GeolocationService
  ) {
    addIcons({ personOutline, mailOutline, lockClosedOutline, logoGoogle, logoApple });
  }

  ngOnInit() {
    let email: string | undefined = "";

    this.route.queryParams.subscribe(async (params) => {
      email = await params['email'];
      if (email !== null && email !== undefined) {
        this.email = email;
      } else {
        this.email = "";
      }
    });

    this.authFacade.initOAuthListener();
  }

  async Register() {
    let location: any = await this.GeolocationService.getGeolocation();
    await this.authFacade.register(this.email, this.password, this.username, location);
  }

  GoLogin() {
    this.NavCtrl.navigateForward('/tabs/login', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async loginWithGoogle() {
    await this.authFacade.loginWithGoogle();
  }
}