import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { AuthFacade } from '../../../core/facades/auth.facade';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  IonContent, IonButton, IonInput, IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';

@Injectable({
  providedIn: 'root',
})
/**
 * @description
 * Pantalla que renderiza el formulario de inicio de sesión visual. Cede el control de sesiones y recuperación OAuth a AuthFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonContent, IonInput, IonIcon, TranslateModule],
})
export class LoginPage implements OnInit {

  public errorMessage: string | undefined;
  email: any;
  password: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authFacade: AuthFacade,
    private authState: AuthStateService,
    private translate: TranslateService
  ) {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
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

  async login() {
    if (!this.email || this.email.trim() === '') {
      return; 
    }
    if (!this.password || this.password.trim() === '') {
      return;
    }
    await this.authFacade.login(this.email, this.password);
  }

  async Logout() {
    await this.authFacade.logout();
  }

  GoRegister() {
    this.NavCtrl.navigateForward('/tabs/register', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async loginWithGoogle() {
    await this.authFacade.loginWithGoogle();
  }

  ContinueAsGuest() {
    this.authState.isLogin = false;
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }
}