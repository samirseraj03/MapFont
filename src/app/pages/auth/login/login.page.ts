import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Services } from '../../../core/services/services.service';
import DatabaseService from '../../../core/data/SupabaseService';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import {
  IonContent, IonButton, IonInput, IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';

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
  private _navigating = false;

  constructor(
    private authService: AuthenticationService,
    public loadingController: LoadingController,
    private toastController: ToastController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authState: AuthStateService,
    private Service: Services,
    public translate: TranslateService,
    private db: DatabaseService
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

    // Escuchar retorno de OAuth (Google Sign-In)
    this.db.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session && !this._navigating) {
        this._navigating = true;
        const user = session.user;

        try {
          await this.Service.setStorage('session', session);
          await this.Service.setStorage('user', user);
          this.authState.isLogin = true;

          const existingUsers = await this.db.getUser(user.id);
          if (!existingUsers || existingUsers.length === 0) {
            // New User via Google OAuth
            await this.db.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id });
            await this.db.insertUser({
              email: user.email || '',
              location: { latitude: 0, longitude: 0 },
              username: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              name: user.user_metadata?.full_name || '',
              lastname: '',
              number: 0,
              address: '',
              photo: user.user_metadata?.avatar_url || null,
              password: '',
              autencationUserID: user.id,
              language: 'es'
            });
          } else {
            // Existing user, ensure they have a user_type assigned
            const userTypeRecords = await this.db.getUserType(user.id);
            if (!userTypeRecords || userTypeRecords.length === 0) {
               await this.db.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id});
            }
          }
        } catch (e) {
          console.error('[onAuthStateChange] Error:', e);
        }

        await this.dismissLoading();
        this.navigateAfterLogin();
      }
    });
  }

  /** Cierra el loading de forma segura */
  private async dismissLoading() {
    if (this.loading) {
      try { await this.loading.dismiss(); } catch (_) { }
      this.loading = null;
    }
  }

  /** Navega a la ruta deseada tras login (o a /tabs/fonts por defecto) */
  private navigateAfterLogin() {
    const route = this.authState.intendedRoute || '/tabs/fonts';
    this.authState.intendedRoute = null;
    this.NavCtrl.navigateRoot(route);
  }

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
    if (!this.email || this.email.trim() === '') {
      this.mostrarError(this.translate.instant('enter_email_error'));
      return;
    }
    if (!this.password || this.password.trim() === '') {
      this.mostrarError(this.translate.instant('enter_password_error'));
      return;
    }

    try {
      this.loading = await this.loadingController.create({
        message: this.translate.instant('loading')
      });
      await this.loading.present();

      const response = await this.authService.signIn(this.email, this.password);

      if (response && response.user) {
        this._navigating = true;

        const { user, session } = response;
        this.data_user = user;
        this.access_token = session;

        await this.Service.setStorage('session', session);
        await this.Service.setStorage('user', user);
        this.authState.isLogin = true;

        if (session) {
          this.setExpirationTime(session.expires_in * 1000);
        }
        if (this.access_token) {
          this.startTimer();
        }

        // Verify user_type for standard login users
        try {
          const userTypeRecords = await this.db.getUserType(user.id);
          if (!userTypeRecords || userTypeRecords.length === 0) {
             await this.db.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id });
          }
        } catch(e) {}

        await this.dismissLoading();
        this.navigateAfterLogin();
      } else {
        await this.dismissLoading();
        this.mostrarError(this.translate.instant('wrong_credentials'));
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      await this.dismissLoading();
      this.mostrarError(this.translate.instant('wrong_credentials'));
    }
  }

  async checkLoggedIn() {
    const token = await this.Service.getStorage('session');
    return !!token;
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
    this.authState.isLogin = false;
  }

  OnSuccess() {
    this.navigateAfterLogin();
  }

  GoRegister() {
    this.NavCtrl.navigateForward('/tabs/register', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async loginWithGoogle() {
    try {
      const { data, error } = await this.db.signInWithGoogle();
      if (error) {
        this.mostrarError(this.translate.instant('wrong_credentials'));
        console.error('[Google OAuth] Error:', error);
      }
    } catch (error) {
      console.error('[Google OAuth] Error:', error);
      this.mostrarError(this.translate.instant('wrong_credentials'));
    }
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

  ContinueAsGuest() {
    this.authState.isLogin = false;
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }
}