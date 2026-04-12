import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, LoadingController, ToastController } from '@ionic/angular'; // <-- Añadido ToastController
import { AuthenticationService } from '../../Services/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { TabsPage } from 'src/app/tabs/tabs.page';
import { Services } from 'src/app/Services/services.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import {
  IonContent, IonButton, IonInput, IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';

@Injectable({
  providedIn: 'root',
})
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
  data_user: any;
  public access_token: any;
  expirationTime: number | undefined;
  timerId: any;
  loading: any;

  constructor(
    private authService: AuthenticationService,
    public loadingController: LoadingController,
    private toastController: ToastController, // <-- Inyectamos el ToastController
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private TabsPage: TabsPage,
    private Service: Services,
    public translate: TranslateService
  ) {
    addIcons({ mailOutline, lockClosedOutline });
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
  }

  // --- NUEVA FUNCIÓN PARA MOSTRAR ERRORES ---
  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async login() {
    // 1. VALIDACIÓN: Comprobar que los campos no estén vacíos
    if (!this.email || this.email.trim() === '') {
      this.mostrarError('Por favor, introduce tu correo electrónico.');
      return; // Detiene la ejecución aquí
    }

    if (!this.password || this.password.trim() === '') {
      this.mostrarError('Por favor, introduce tu contraseña.');
      return; // Detiene la ejecución aquí
    }

    try {
      this.loading = await this.loadingController.create({
        message: this.translate.instant('loading')
      });
      await this.loading.present();

      // 2. Intento de inicio de sesión
      const response = await this.authService.signIn(this.email, this.password);

      // Supabase suele devolver { data, error }. Evaluamos si fue exitoso.
      if (response && response.user) {

        const { user, session } = response;

        this.data_user = user;
        this.access_token = session;
        await this.Service.setStorage('session', session);
        await this.Service.setStorage('user', user);
        this.TabsPage.isLogin = true;

        if (session) {
          this.setExpirationTime(session.expires_in * 1000);
        }

        if (this.access_token) {
          this.startTimer();
        }

        // 3. ÉXITO: Solo navegamos a fuentes si todo salió bien
        this.OnSuccess();

      } else {
        // Fallo de credenciales
        this.mostrarError('Correo o contraseña incorrectos.');
      }
    } catch (error: any) {
      // Fallo de red o error devuelto por Supabase
      console.error(error);
      this.mostrarError('Correo o contraseña incorrectos.');
    } finally {
      // 4. LIMPIEZA: Solo ocultamos el loading, YA NO navegamos desde aquí
      if (this.loading) {
        await this.loading.dismiss();
      }
    }
  }

  async checkLoggedIn() {
    const token = await this.Service.getStorage('session');
    if (token && token) {
      return true;
    } else {
      return false;
    }
  }

  private startTimer() {
    if (this.expirationTime) {
      const timeToExpiration = this.expirationTime - Date.now();

      if (timeToExpiration > 0) {
        this.timerId = setInterval(() => {
          if (this.expirationTime) {
            const remainingTime = this.expirationTime - Date.now();
            if (remainingTime <= 0) {
              this.authService.signOut();
              this.clearAccessToken();
            }
          }
        }, 1000);
      }
    }
  }

  private setExpirationTime(expiresIn: number) {
    this.expirationTime = Date.now() + expiresIn;
  }

  public clearAccessToken() {
    this.access_token = null;
    this.expirationTime = undefined;
    this.data_user = null;
    this.Service.removeStorage('user');
    this.Service.removeStorage('session');
  }

  async Logout() {
    try {
      await this.authService.signOut();
    } catch { }
    this.clearAccessToken();
    this.TabsPage.isLogin = false;
  }

  OnSuccess() {
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }

  GoRegister() {
    this.NavCtrl.navigateForward('/tabs/register', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async UpdatePassword(email: any, password: any, new_password: any) {
    const response = await this.authService.signIn(email, password);

    if (response) {
      const error = await this.authService.updateUser({
        password: new_password,
      });

      if (error == null) {
        return null;
      } else {
        return 'Success';
      }
    }
    else return null;
  }

  // Función para entrar sin iniciar sesión
  ContinueAsGuest() {
    // Nos aseguramos de que la app sepa que NO hay nadie logueado
    this.TabsPage.isLogin = false;

    // Navegamos a la pantalla principal
    // Usamos navigateRoot para que el usuario no pueda darle al botón "Atrás" y volver al login
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }
}