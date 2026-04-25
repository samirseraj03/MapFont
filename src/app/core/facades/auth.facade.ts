import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../services/authentication.service';
import { AuthStateService } from '../services/auth-state.service';
import { Services } from '../services/services.service';
import { UserRepository } from '../repositories/user.repository';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private expirationTime: number | undefined;
  private timerId: any;
  private isOathListenerActive = false;

  constructor(
    private authService: AuthenticationService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private navCtrl: NavController,
    private authState: AuthStateService,
    private services: Services,
    private translate: TranslateService,
    private userRepository: UserRepository
  ) {}

  initOAuthListener() {
    if (this.isOathListenerActive) return;
    this.isOathListenerActive = true;

    this.authService.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        let loading = await this.loadingController.create({ message: this.translate.instant('loading') });
        await loading.present();

        try {
          const user = session.user;
          await this.services.setStorage('session', session);
          await this.services.setStorage('user', user);
          this.authState.isLogin = true;

          const existingUsers = await this.userRepository.getUser(user.id);
          if (!existingUsers || existingUsers.length === 0) {
            if (user.app_metadata?.provider === 'email') {
              return;
            }
            await this.userRepository.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id });
            await this.userRepository.insertUser({
              email: user.email || '',
              location: { latitude: 0, longitude: 0 },
              username: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              name: user.user_metadata?.full_name || '',
              lastname: '',
              number: 0,
              address: '',
              password: '',
              autencationUserID: user.id,
              language: this.translate.currentLang || this.translate.getDefaultLang() || 'es'
            });
          } else {
            const userProfile = existingUsers[0];
            if (userProfile.language) {
               this.translate.use(userProfile.language);
            } else {
               const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
               await this.userRepository.updateUser(user.id, { language: currentLang } as any);
            }

            const userTypeRecords = await this.userRepository.getUserType(user.id);
            if (!userTypeRecords || userTypeRecords.length === 0) {
               await this.userRepository.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id});
            }
          }
          const route = this.authState.intendedRoute || '/tabs/fonts';
          this.authState.intendedRoute = null;
          this.navCtrl.navigateRoot(route);
        } catch (e) {
          console.error(e);
        } finally {
          loading.dismiss();
        }
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    let loading = await this.loadingController.create({ message: this.translate.instant('loading') });
    await loading.present();

    try {
      const response = await this.authService.signIn(email, password);
      if (response && response.user) {
        const { user, session } = response;
        
        await this.services.setStorage('session', session);
        await this.services.setStorage('user', user);
        this.authState.isLogin = true;

        if (session) {
          this.expirationTime = Date.now() + session.expires_in * 1000;
          this.startTimer();
        }

        try {
          const existingUsers = await this.userRepository.getUser(user.id);
          if (existingUsers && existingUsers.length > 0) {
            const userProfile = existingUsers[0];
            if (userProfile.language) {
               this.translate.use(userProfile.language);
            } else {
               const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'es';
               await this.userRepository.updateUser(user.id, { language: currentLang } as any);
            }
          }

          const userTypeRecords = await this.userRepository.getUserType(user.id);
          if (!userTypeRecords || userTypeRecords.length === 0) {
            await this.userRepository.insertUserType({ admin_role: false, user_role: true, autencationUserID: user.id });
          }
        } catch(e) {}

        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      } else {
        throw new Error("Wrong credentials");
      }
    } catch (error) {
      this.showError(this.translate.instant('wrong_credentials'));
      return false;
    } finally {
      loading.dismiss();
    }
  }

  async loginWithGoogle() {
    try {
      const isWeb = Capacitor.getPlatform() === 'web';
      const redirectTo = isWeb 
        ? 'https://map-font.vercel.app' 
        : 'https://ionic.mapfont';

      const { data, error } = await this.authService.signInWithGoogle(redirectTo);
      if (error) {
        this.showError(this.translate.instant('wrong_credentials'));
      }
    } catch (error) {
      this.showError(this.translate.instant('wrong_credentials'));
    }
  }

  async register(email: string, password: string, username: string, location: any): Promise<boolean> {
    let loading = await this.loadingController.create({ message: this.translate.instant('loading') });
    await loading.present();

    try {
      const response = await this.authService.signUp(email, password);
      
      if (response && response.user) {
        await this.userRepository.insertUserType({
          admin_role: false,
          user_role: true,
          autencationUserID: response.user.id
        });

        await this.userRepository.insertUser({
          email: email,
          location: {
            "latitude": location.coords.latitude,
            "longitude": location.coords.longitude
          },
          username: username || '',
          name: '',
          lastname: '',
          number: 0,
          address: '',
          password: password,
          autencationUserID: response.user.id,
          language: this.translate.currentLang || this.translate.getDefaultLang() || 'es'
        });

        await this.services.setStorage('session', response.session);
        await this.services.setStorage('user', response.user);
        this.authState.isLogin = true;

        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      return false;
    } finally {
      loading.dismiss();
    }
    return false;
  }

  async requestPasswordRecovery(email: string): Promise<boolean> {
    let loading = await this.loadingController.create({ message: this.translate.instant('loading') || 'Enviando...' });
    await loading.present();

    try {
      await this.authService.requestOTP(email);
      return true;
    } catch (error) {
      this.showError("No se pudo enviar el código al correo.");
      return false;
    } finally {
      loading.dismiss();
    }
  }

  async verifyRecoveryCode(email: string, token: string): Promise<boolean> {
    let loading = await this.loadingController.create({ message: this.translate.instant('loading') || 'Verificando...' });
    await loading.present();

    try {
      const response = await this.authService.verifyOTP(email, token);
      if (response && response.user) {
        const { user, session } = response;
        await this.services.setStorage('session', session);
        await this.services.setStorage('user', user);
        this.authState.isLogin = true;
        return true;
      }
      return false;
    } catch (error) {
      this.showError("El código ingresado es incorrecto o ha caducado.");
      return false;
    } finally {
      loading.dismiss();
    }
  }

  async updateRecoveredPassword(newPassword: string): Promise<boolean> {
    let loading = await this.loadingController.create({ message: this.translate.instant('loading') || 'Actualizando...' });
    await loading.present();

    try {
      const response = await this.authService.updateUser({ password: newPassword });
      if (response === 'Success') {
        const userId = await this.getCurrentUserId();
        if (userId) {
           await this.userRepository.updateUser(userId, { password: newPassword } as any);
        }
        
        const route = this.authState.intendedRoute || '/tabs/fonts';
        this.authState.intendedRoute = null;
        this.navCtrl.navigateRoot(route);
        return true;
      }
      return false;
    } catch {
      this.showError("Hubo un error guardando tu contraseña.");
      return false;
    } finally {
      loading.dismiss();
    }
  }

  async logout() {
    try {
      await this.authService.signOut();
    } catch {}
    this.clearAccessToken();
    this.authState.isLogin = false;
  }

  private startTimer() {
    if (this.expirationTime) {
      const timeToExpiration = this.expirationTime - Date.now();
      if (timeToExpiration > 0) {
        this.timerId = setInterval(() => {
          if (this.expirationTime) {
            const remainingTime = this.expirationTime - Date.now();
            if (remainingTime <= 0) {
              this.logout();
            }
          }
        }, 1000);
      }
    }
  }

  public clearAccessToken() {
    this.expirationTime = undefined;
    this.services.removeStorage('user');
    this.services.removeStorage('session');
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  async getCurrentUserId() {
    const user = await this.services.getStorage('user');
    return user ? user.id : null;
  }

  async getCurrentUserEmail() {
    const user = await this.services.getStorage('user');
    return user ? user.email : null;
  }

  private async showError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
