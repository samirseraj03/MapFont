import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController, ActionSheetController, LoadingController } from '@ionic/angular';

// Ionic Standalone & Modulos
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Lógica y Servicios
import GeolocationService from '../../../core/utils/Geolocation';
import { Dialog } from '@capacitor/dialog';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core';
import { Services } from '../../../core/services/services.service';
import { StorageRepository } from '../../../core/repositories/storage.repository';

// Iconos necesarios
import { addIcons } from 'ionicons';
import { arrowBackOutline, cameraOutline, cloudUploadOutline, trashOutline, arrowForwardOutline } from 'ionicons/icons';

/**
 * @description
 * Paso 1 del Wizard. Captura fotografía in-situ del manantial usando Camera Native Plugin de capacitor.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-form',
  templateUrl: 'form.page.html',
  styleUrls: ['form.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    CommonModule,
    TranslateModule
  ],
})
export class FormPage {

  image_push: any;
  constructor(
    public NavCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    public Service: Services,
    public translate: TranslateService,
    private storageRepository: StorageRepository,
    private cdr: ChangeDetectorRef,
    public GeolocationService: GeolocationService
  ) {
    addIcons({ arrowBackOutline, cameraOutline, cloudUploadOutline, trashOutline, arrowForwardOutline });
    this.Service.img_ref = null;
  }

  // FUNCIÓN NUEVA: Comprime la imagen usando Canvas (Solo para galería)
  compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height *= maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width *= maxHeight / height));
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('No se pudo comprimir la imagen'));
            }
          }, 'image/jpeg', quality);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  }

  selectImage() {
    const fileInput = document.getElementById('fileItem') as HTMLInputElement;
    fileInput.click();
  }

  async handleFileInput(event: any) {
    const selectedFile = event.target.files[0];

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      try {
        this.image_push = await this.compressImage(selectedFile, 800, 800, 0.7);

        const imgReader = new FileReader();
        imgReader.onload = () => {
          this.Service.img_ref = imgReader.result as string;
        };
        imgReader.readAsDataURL(this.image_push);
      } catch (error) {
        console.error('Error al comprimir:', error);
      }
    } else {
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('file_type_invalid')
      });
    }
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 60, // Nativo = Cero gasto extra de memoria
        width: 800,
        allowEditing: false, // <-- Ayuda a evitar cuelgues en Android
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      this.Service.img_ref = image.webPath;

      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        
        // Formamos un obj File de manera segura o simplemente pasamos el Blob a Supabase
        // Supabase acepta ambos (File | Blob) para su API de upload.
        // Pero en móviles, pasar el Blob directo suele evitar el TypeError del constructor `File`.
        // Aún así, le inyectamos `name` para que el Storage tenga un nombre por defecto:
        const filename = `camera_capture_${new Date().getTime()}.jpeg`;
        const fileObj = blob as any;
        fileObj.name = filename;
        fileObj.lastModified = new Date().getTime();

        this.image_push = fileObj;
      }

    } catch (error) {
      console.error(error);
      if (String(error).indexOf('User cancelled photos app') === -1) {
        await Dialog.alert({
          title: this.translate.instant('attention'),
          message: this.translate.instant('file_type_invalid_upload')
        });
      }
    }
  }

  async ImageSuccess() {
    (document.activeElement as HTMLElement)?.blur();

    if (!this.image_push) {
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('upload_photo_to_continue')
      });
      return;
    }

    // 1. Creamos una variable segura para el loader
    let loadingElement: HTMLIonLoadingElement | null = null;

    try {
      // 2. Creamos y mostramos el loader
      loadingElement = await this.loadingController.create({
        message: this.translate.instant('uploading_photo') || 'Subiendo imagen...',
        spinner: 'circles',
        backdropDismiss: false // Evita que el usuario lo cierre tocando fuera
      });
      await loadingElement.present();

      // 3. TRUCO VISUAL: Obligamos a la app a esperar medio segundo (500ms).
      // Esto asegura que la animación del loader termine y el usuario vea que está cargando.
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Subimos a Supabase
      const imagePath = await this.storageRepository.insertToStorage(this.image_push);

      if (imagePath) {
        // 5. CERRAMOS el loader ANTES de navegar
        if (loadingElement) {
          await loadingElement.dismiss();
          loadingElement = null; // Lo vaciamos por seguridad
        }

        // 6. Navegamos pasando el nombre
        this.NavCtrl.navigateForward('/location', {
          queryParams: {
            image: imagePath
          }
        });
      } else {
        throw new Error("No se pudo subir la imagen a Supabase");
      }

    } catch (error) {
      console.error("Error subiendo foto:", error);

      // Si hay error, también debemos cerrar el loader
      if (loadingElement) {
        await loadingElement.dismiss();
      }

      await Dialog.alert({
        title: 'Error',
        message: 'No se pudo subir la foto. Inténtalo de nuevo.'
      });
    }
    // Nota: He quitado el bloque "finally" porque a veces choca con la navegación de Ionic.
  }

  Delete() {
    this.Service.img_ref = null;
    this.image_push = null;
    const fileInput = document.getElementById('fileItem') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  async SelectInput() {
    if (Capacitor.isNativePlatform() === true) {
      const actionSheet = await this.actionSheetController.create({
        header: this.translate.instant('select_option'),
        buttons: [
          { text: this.translate.instant('take_photo'), handler: () => { this.takePicture(); } },
          { text: this.translate.instant('upload_from_gallery'), handler: () => { this.selectImage(); } },
          { text: this.translate.instant('cancel'), role: 'cancel' }
        ]
      });
      await actionSheet.present();
    } else {
      const actionSheet = await this.actionSheetController.create({
        header: this.translate.instant('select_option'),
        buttons: [
          { text: this.translate.instant('upload_from_gallery'), handler: () => { this.selectImage(); } },
          { text: this.translate.instant('cancel'), role: 'cancel' }
        ]
      });
      await actionSheet.present();
    }
  }
}