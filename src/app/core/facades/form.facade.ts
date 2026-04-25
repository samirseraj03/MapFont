import { Injectable } from '@angular/core';
import { FormRepository } from '../repositories/form.repository';
import { StorageRepository } from '../repositories/storage.repository';
import { AuthFacade } from './auth.facade';
import { LoadingController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UserRepository } from '../repositories/user.repository';

@Injectable({
  providedIn: 'root'
})
export class FormFacade {
  constructor(
    private formRepository: FormRepository,
    private storageRepository: StorageRepository,
    private userRepository: UserRepository,
    private authFacade: AuthFacade,
    private loadingController: LoadingController,
    private translateService: TranslateService,
    private navCtrl: NavController
  ) {}

  async submitNewForm(formData: any, imagePath: string, location: any, address: string) {
    let loading = await this.loadingController.create({ message: this.translateService.instant('loading') });
    await loading.present();

    try {
      const userId = await this.authFacade.getCurrentUserId();
      if (!userId) throw new Error("No user id");

      const userRecords = await this.userRepository.getUser(userId);
      const username = userRecords && userRecords.length > 0 ? userRecords[0].username : 'Unknown';

      const lnglat = {
        latitude: location[1],
        longitude: location[0],
      };

      const newForm = {
        username: username,
        watersourcesname: formData.watersourcesname,
        created_at: new Date(),
        location: lnglat,
        photo: imagePath,
        address: address,
        description: formData.description,
        is_potable: formData.is_potable === true || formData.is_potable === 'true',
        watersourcetype: formData.watersourcetype,
        approved: null,
        autencationUserID: userId
      };

      await this.formRepository.insertForm(newForm);
      this.navCtrl.navigateForward('/Success', { queryParams: { page: 'form', Success: true } });
      return true;

    } catch (e) {
      console.error(e);
      return false;
    } finally {
      loading.dismiss();
    }
  }

  async loadPendingForms() {
    return await this.formRepository.getFormsNotAproved();
  }

  async loadApprovedForms() {
    return await this.formRepository.getFormsAproved();
  }

  async getCurrentUserId() {
    return await this.authFacade.getCurrentUserId();
  }

  async loadUserForms() {
    const userId = await this.authFacade.getCurrentUserId();
    if (!userId) return [];
    return await this.formRepository.getFormsUser(userId);
  }

  async updateFormStatus(formId: number, isApproved: boolean) {
    return await this.formRepository.updateForm(formId, { approved: isApproved });
  }
}
