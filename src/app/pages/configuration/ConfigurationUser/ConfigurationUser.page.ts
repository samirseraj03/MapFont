import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';

// Standalone Components (Incluye IonModal)
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonIcon, IonButton, IonInput, IonSelect, IonSelectOption,
  IonModal
} from '@ionic/angular/standalone';

// Lógica y Servicios
import GeolocationService from '../../../core/utils/Geolocation';
import DatabaseService from '../../../core/data/SupabaseService';
import { Services } from '../../../core/services/services.service';
import { AuthenticationService } from '../../../core/services/authentication.service';

import { Dialog } from '@capacitor/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Iconos completos para el diseño AquaPath
import { addIcons } from 'ionicons';
import {
  waterOutline, saveOutline, cameraOutline, personOutline,
  atOutline, languageOutline, documentTextOutline, bookmarkOutline,
  lockClosedOutline, heartOutline, trashOutline, logOutOutline,
  qrCodeOutline, closeOutline, expandOutline,
  mailOutline
} from 'ionicons/icons';
import { LoginPage } from '../../auth/login/login.page';

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

  // Referencias a los dos modales para poder cerrarlos desde el código
  @ViewChild('avatarModal') avatarModal!: IonModal;
  @ViewChild('qrModal') qrModal!: IonModal;

  formData: any = {};
  img_ref_config: any = null;
  data: any;
  loading: any;
  image_ref_name_config: any;
  image_ref_upload_config: any;
  isAdmin: boolean = false; // <-- Controla la vista de administración

  constructor(
    public NavCtrl: NavController,
    private loadingController: LoadingController,
    private cdr: ChangeDetectorRef,
    private TranslateService: TranslateService,
    private authService: AuthenticationService,
    private Service: Services,
    private Supabase: DatabaseService,
    public GeolocationService: GeolocationService
  ) {
    // Registramos todos los iconos utilizados en la UI
    addIcons({
      waterOutline, saveOutline, cameraOutline, personOutline,
      atOutline, languageOutline, documentTextOutline, bookmarkOutline,
      lockClosedOutline, heartOutline, trashOutline, logOutOutline,
      qrCodeOutline, closeOutline, expandOutline, mailOutline
    });
  }

  async ionViewWillEnter() {
    // 1. Limpiar el estado anterior para asegurar que no se "dibujen" datos del usuario viejo
    this.isAdmin = false;
    this.formData = {};
    this.data = null;
    this.img_ref_config = null;

    // 2. Cargar directamente el user_id de storage
    let user_id = await this.GeolocationService.getUserID();
    if (!user_id) {
       this.cdr.detectChanges();
       return;
    }

    this.data = await this.Supabase.getUser(user_id);

    if (this.data && this.data.length > 0) {
      this.formData = {
        name: this.data[0].name || '',
        email: this.data[0].email,
        language: this.data[0].language,
        username: this.data[0].username,
      };

      if (this.data[0].photo == null) {
        this.img_ref_config = null;
      } else {
        this.img_ref_config = this.Supabase.GetStorage(this.data[0].photo) || null;
      }

      try {
        let myType = await this.Supabase.getUserType(user_id);
        if (myType && myType.length > 0 && myType[0].admin_role) {
           this.isAdmin = true;
        } else if (this.data[0].role === 'admin' || this.data[0].type === 'admin') {
           this.isAdmin = true;
        }
      } catch(e) {
        console.log('Error checking admin user_type:', e);
      }
    }

    this.cdr.detectChanges();
  }

  // --- CONTROL DE MODALES ---

  // Cierra el modal de la foto de perfil programáticamente
  closeAvatarModal() {
    if (this.avatarModal) {
      this.avatarModal.dismiss();
    }
  }

  // Cierra el modal del código QR programáticamente
  closeQrModal() {
    if (this.qrModal) {
      this.qrModal.dismiss();
    }
  }

  // --- LÓGICA DE ACTUALIZACIÓN DE USUARIO ---

  async Update() {
    this.loadingController.create({ message: this.TranslateService.instant('loading') }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });

    try {
      await this.ToDataBase();
      this.onLanguageChange(this.formData.language ? this.formData.language : 'es');
    } catch {
      this.loading.dismiss();
    } finally {
      this.NavCtrl.navigateForward('/Success', {
        state: { PageSucces: 'configuration' },
      });
      this.loading.dismiss();
    }
  }

  onLanguageChange(language: any) {
    this.TranslateService.use(language);
  }

  async ToDataBase() {
    // Si hay una nueva imagen subida, actualizamos el storage primero
    if (this.image_ref_upload_config) {
      this.formData.photo = await this.Supabase.InsertToStoarge(this.image_ref_upload_config);
      await this.Supabase.updateUser(await this.GeolocationService.getUserID(), this.formData);
    } else {
      await this.Supabase.updateUser(await this.GeolocationService.getUserID(), this.formData);
    }
  }

  // --- LÓGICA DE GESTIÓN DE IMÁGENES ---

  SelectInput() {
    const fileInput = document.getElementById('fileItemConfig') as HTMLInputElement;
    fileInput.click();
  }

  async handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.img_ref_config = imgReader.result as string;
        this.image_ref_upload_config = event.target.files[0];

        // Cerramos el modal cuando termine de elegir foto para volver al perfil
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

    // Cerramos el modal al eliminar la foto
    this.closeAvatarModal();
  }

  // --- NAVEGACIÓN Y CIERRE DE SESIÓN ---

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
        // Cierre de sesión nativo e independiente
        try {
          await this.authService.signOut();
        } catch (e) {
          console.error("Error al cerrar sesión", e);
        }

        this.NavCtrl.navigateRoot('tabs/fonts');
        break;
      default:
        break;
    }
  }
}