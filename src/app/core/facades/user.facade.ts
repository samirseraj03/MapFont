import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, NavController } from '@ionic/angular/standalone';
import { UserRepository } from '../repositories/user.repository';
import { StorageRepository } from '../repositories/storage.repository';
import GeolocationService from '../utils/Geolocation';
import { AuthFacade } from './auth.facade';

@Injectable({
  providedIn: 'root'
})
export class UserFacade {
  constructor(
    private userRepository: UserRepository,
    private storageRepository: StorageRepository,
    private geolocationService: GeolocationService,
    private authFacade: AuthFacade,
    private translateService: TranslateService,
    private loadingController: LoadingController,
    private navCtrl: NavController
  ) { }

  /**
   * Obtiene y combina la información base del perfil, el rol administrativo y la foto validada en Cloud Storage.
   */
  async loadUserProfile() {
    let user_id = await this.authFacade.getCurrentUserId();
    if (!user_id) return null;

    const data = await this.userRepository.getUser(user_id);
    if (!data || data.length === 0) return null;

    let profile = data[0];
    let isAdmin = false;

    // Validación de roles nativos en supabase 
    try {
      const myType = await this.userRepository.getUserType(user_id);
      if (myType && myType.length > 0 && myType[0].admin_role) {
        isAdmin = true;
      } else if (profile.role === 'admin' || profile.type === 'admin') {
        isAdmin = true;
      }
    } catch (e) { }

    let photoUrl = profile.photo ? this.storageRepository.getStorageUrl(profile.photo) : null;

    return { profile, isAdmin, photoUrl };
  }

  /**
   * Actualiza el perfíl del usuario enviando la foto al Storage si corresponde.
   */
  async updateUserProfile(formData: any, imageFile: any) {
    let loading = await this.loadingController.create({ message: this.translateService.instant('loading') });
    await loading.present();

    try {
      const userId = await this.authFacade.getCurrentUserId();
      if (imageFile) {
        formData.photo = await this.storageRepository.insertToStorage(imageFile);
      }
      await this.userRepository.updateUser(userId, formData);

      this.translateService.use(formData.language || 'es');

      this.navCtrl.navigateForward('/Success', {
        state: { PageSucces: 'configuration' },
      });
      return true;
    } catch (e) {
      return false;
    } finally {
      loading.dismiss();
    }
  }
}
