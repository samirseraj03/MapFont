import { Injectable } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { Dialog } from '@capacitor/dialog';

// Servicios
import GeolocationService from '../utils/Geolocation';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticationService } from '../services/authentication.service';
import { AuthFacade } from './auth.facade';

@Injectable({
  providedIn: 'root'
})
export class SecurityFacade {

  constructor(
    private loadingController: LoadingController,
    private authService: AuthenticationService,
    private translateService: TranslateService,
    private userRepository: UserRepository,
    private geolocationService: GeolocationService,
    private authFacade: AuthFacade,
    private navCtrl: NavController
  ) { }

  /**
   * Encapsula toda la lógica de cambio de contraseña, loading, validación contra db y redirección.
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    let loading: any;
    try {
      const loadingMsg = this.translateService.instant('loading') || 'Cargando...';
      loading = await this.loadingController.create({ message: loadingMsg });
      await loading.present();

      const email = await this.authFacade.getCurrentUserEmail();

      // 1. Iniciamos sesión con la antigua para verificar
      const response = await this.authService.signIn(email, oldPassword);

      if (response && response.user) {

        // 2. Si la vieja es correcta, actualizamos a la nueva
        const error = await this.authService.updateUser({
          password: newPassword,
        });

        if (!error) {
          // 3. Actualizamos en base de datos
          const userId = await this.authFacade.getCurrentUserId();
          await this.userRepository.updateUser(userId, { password: newPassword } as any);

          // 4. Redirigimos al éxito
          this.navCtrl.navigateForward('/Success', {
            state: { PageSucces: 'security' },
          });

          return true;
        } else {
          throw new Error("No se pudo actualizar la contraseña");
        }
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error) {
      await Dialog.alert({
        title: 'Atención',
        message: 'Tu contraseña actual es incorrecta o hubo un problema de red.'
      });
      return false;
    } finally {
      if (loading) {
        await loading.dismiss();
      }
    }
  }
}
