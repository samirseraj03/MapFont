import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
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
    private translate: TranslateService,
    private alertController: AlertController
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
    console.log('[LoginPage] login triggered. Email:', this.email, 'Password:', this.password);
    if (!this.email || this.email.trim() === '') {
      console.log('Early return: email is empty');
      return; 
    }
    if (!this.password || this.password.trim() === '') {
      console.log('Early return: password is empty');
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

  async forgotPassword() {
    const alertEmail = await this.alertController.create({
      header: this.translate.instant('recover_password_title'),
      message: this.translate.instant('recover_password_msg'),
      inputs: [{ name: 'email', type: 'email', placeholder: this.translate.instant('email_ph'), value: this.email || '' }],
      buttons: [
        { text: this.translate.instant('cancel'), role: 'cancel' },
        { 
          text: this.translate.instant('send_pin'), 
          handler: async (data) => {
            if (!data.email) return false;
            const sent = await this.authFacade.requestPasswordRecovery(data.email);
            if (sent) this.promptForCode(data.email);
            return true;
          }
        }
      ]
    });
    await alertEmail.present();
  }

  async promptForCode(email: string) {
    const alertCode = await this.alertController.create({
      header: this.translate.instant('verification_code'),
      message: this.translate.instant('code_sent_to') + email,
      inputs: [{ name: 'token', type: 'text', placeholder: '123456', attributes: { maxlength: 6 } }],
      buttons: [
        { text: this.translate.instant('cancel'), role: 'cancel' },
        {
          text: this.translate.instant('verify'),
          handler: async (data) => {
            if (!data.token) return false;
            const verified = await this.authFacade.verifyRecoveryCode(email, data.token);
            if (verified) this.promptForNewPassword();
            return true;
          }
        }
      ]
    });
    await alertCode.present();
  }

  async promptForNewPassword() {
    const alertPwd = await this.alertController.create({
      header: this.translate.instant('new_password_title'),
      message: this.translate.instant('new_password_msg'),
      inputs: [{ name: 'password', type: 'password', placeholder: this.translate.instant('new_password_title') }],
      buttons: [
        {
          text: this.translate.instant('save_and_enter'),
          handler: async (data) => {
            if (!data.password || data.password.length < 6) return false;
            await this.authFacade.updateRecoveredPassword(data.password);
            return true;
          }
        }
      ]
    });
    await alertPwd.present();
  }
}