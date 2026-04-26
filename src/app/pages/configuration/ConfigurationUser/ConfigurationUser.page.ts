import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';

import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonIcon, IonButton, IonInput, IonSelect, IonSelectOption,
  IonModal
} from '@ionic/angular/standalone';

import { UserFacade } from '../../../core/facades/user.facade';
import { AuthFacade } from '../../../core/facades/auth.facade';

import { Dialog } from '@capacitor/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { addIcons } from 'ionicons';
import {
  waterOutline, saveOutline, cameraOutline, personOutline,
  atOutline, languageOutline, documentTextOutline, bookmarkOutline,
  lockClosedOutline, heartOutline, trashOutline, logOutOutline,
  qrCodeOutline, closeOutline, expandOutline, mailOutline, scanOutline, personCircleOutline
} from 'ionicons/icons';

/**
 * @description
 * Vista de Perfil y configuración de los detalles del usuario, incluyendo foto de perfil y actualización de metadatos, consumiendo el UserFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-configuration-user',
  templateUrl: 'ConfigurationUser.page.html',
  styleUrls: ['ConfigurationUser.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonIcon, IonButton, IonInput,
    IonSelect, IonSelectOption, IonModal, TranslateModule
  ],
})
export class ConfigurationUserPage {

  @ViewChild('myForm') myForm!: NgForm;
  @ViewChild('avatarModal') avatarModal!: IonModal;
  @ViewChild('qrModal') qrModal!: IonModal;

  formData: any = {};
  img_ref_config: any = null;
  image_ref_upload_config: any;
  isAdmin: boolean = false;

  originalData: any = {};
  originalPhoto: any = null;

  constructor(
    public NavCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private TranslateService: TranslateService,
    private userFacade: UserFacade,
    private authFacade: AuthFacade
  ) {
    addIcons({
      waterOutline, saveOutline, cameraOutline, personOutline,
      atOutline, languageOutline, documentTextOutline, bookmarkOutline,
      lockClosedOutline, heartOutline, trashOutline, logOutOutline,
      qrCodeOutline, closeOutline, expandOutline, mailOutline, scanOutline, personCircleOutline
    });
  }

  async ionViewWillEnter() {
    this.isAdmin = false;
    this.formData = {};
    this.img_ref_config = null;
    this.originalData = {}; // Resetear
    this.originalPhoto = null; // Resetear

    const result = await this.userFacade.loadUserProfile();
    if (result) {
      this.formData = {
        name: result.profile.name || '',
        email: result.profile.email,
        language: result.profile.language,
        username: result.profile.username,
      };

      // Hacemos una copia exacta de los datos originales
      this.originalData = { ...this.formData };

      this.img_ref_config = result.photoUrl;
      this.originalPhoto = result.photoUrl; // Guardamos la foto original
      this.isAdmin = result.isAdmin;
    }
    this.cdr.detectChanges();
  }

  closeAvatarModal() {
    if (this.avatarModal) {
      this.avatarModal.dismiss();
    }
  }

  closeQrModal() {
    if (this.qrModal) {
      this.qrModal.dismiss();
    }
  }


  async Update() {
    await this.userFacade.updateUserProfile(this.formData, this.image_ref_upload_config);

    // Una vez guardado con éxito, los datos actuales pasan a ser los nuevos "originales"
    this.originalData = { ...this.formData };
    this.originalPhoto = this.img_ref_config;
    this.image_ref_upload_config = null; // Vaciamos el archivo pendiente de subir

    this.cdr.detectChanges();
  }

  SelectInput() {
    const fileInput = document.getElementById('fileItemConfig') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Reset para que el evento change siempre se dispare
      fileInput.click();
    }
  }

  async handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.img_ref_config = imgReader.result as string;
        this.image_ref_upload_config = selectedFile;
        this.cdr.detectChanges(); // Forzar actualización visual
        this.closeAvatarModal();
      };
      imgReader.readAsDataURL(selectedFile);
    } else {
      await Dialog.alert({
        title: this.TranslateService.instant('attention'),
        message: this.TranslateService.instant('file_type_invalid')
      });
    }
  }

  Delete() {
    this.img_ref_config = null;
    this.image_ref_upload_config = null;
    this.formData.photo = null;
    // Reset del input para permitir re-selección
    const fileInput = document.getElementById('fileItemConfig') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.cdr.detectChanges();
    this.closeAvatarModal();
  }


  // 1. Detecta SOLO si la foto ha cambiado
  get hasPhotoChanges(): boolean {
    return !!this.image_ref_upload_config ||
      (this.img_ref_config === null && this.originalPhoto !== null);
  }

  // 2. Detecta SOLO si los textos han cambiado
  get hasDataChanges(): boolean {
    // Verificamos que originalData no sea null antes de comparar
    if (!this.originalData) return false;

    return (
      this.formData.name !== this.originalData.name ||
      this.formData.username !== this.originalData.username ||
      this.formData.language !== this.originalData.language
    );
  }

  async navigateTo(event: any) {
    switch (event) {
      case 'formularios':
        this.NavCtrl.navigateForward('tabs/lookforms');
        break;
      case 'seguridad':
        this.NavCtrl.navigateForward('tabs/security');
        break;
      case 'donaciones':
        this.NavCtrl.navigateForward('tabs/donation');
        break;
      case 'guardados':
        this.NavCtrl.navigateForward('tabs/favorites');
        break;
      case 'Confirmacion':
        this.NavCtrl.navigateForward('confirmation');
        break;
      case 'CerrarSession':
        await this.authFacade.logout();
        this.NavCtrl.navigateRoot('tabs/fonts');
        break;
      default:
        break;
    }
  }
}