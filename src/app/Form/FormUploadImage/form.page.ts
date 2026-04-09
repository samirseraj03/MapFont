import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController, ActionSheetController } from '@ionic/angular';

// Ionic Standalone & Modulos
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Lógica y Servicios
import GeolocationService from '../../Globals/Geolocation';
import { Dialog } from '@capacitor/dialog';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core';
import { Services } from 'src/app/services.service';

// Iconos necesarios para el nuevo diseño
import { addIcons } from 'ionicons';
import { arrowBackOutline, cameraOutline, cloudUploadOutline, trashOutline, arrowForwardOutline } from 'ionicons/icons';

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
  GeolocationService = new GeolocationService();

  constructor(
    public NavCtrl: NavController,
    private actionSheetController: ActionSheetController,
    public Service: Services,
    public translate: TranslateService
  ) {
    // Registramos los iconos para la UI
    addIcons({ arrowBackOutline, cameraOutline, cloudUploadOutline, trashOutline, arrowForwardOutline });
    this.Service.img_ref = null;
  }

  // para hacer click al input cuando se hace click al boton
  selectImage() {
    const fileInput = document.getElementById('fileItem') as HTMLInputElement;
    // cuando se clicka el boton se haga click al inputfile
    fileInput.click();
  }

  // para obtener el archivo del input
  async handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    this.image_push = event.target.files[0];

    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.Service.img_ref = imgReader.result as string; // Asigna la URL de datos de la imagen a imgUrl
      };
      imgReader.readAsDataURL(selectedFile);
    } else {
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('file_type_invalid')
      });
    }
  }

  // cunado la imagen esta succesed , ya se puede subir
  async ImageSuccess() {
    if (this.Service.img_ref) {
      this.NavCtrl.navigateForward('/location', {
        queryParams: {
          image: this.image_push,
        },
      });
    } else {
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('upload_photo_to_continue')
      });
    }
  }

  // para eliminar la foto y poder subir otra
  Delete() {
    this.Service.img_ref = null;
    this.image_push = null; // También limpiamos el archivo a subir por seguridad

    // Limpiamos el valor del input para que permita subir la misma foto de nuevo si el usuario quiere
    const fileInput = document.getElementById('fileItem') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }


  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, // Abrir la cámara
      });

      // Crear una URL de la imagen
      this.Service.img_ref = image.webPath; // Usar webPath para mostrar en el navegador

      // Fix: Convertir la imagen capturada a un objeto File para subirlo
      if (image.webPath) {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const filename = `camera_capture_${new Date().getTime()}.${image.format}`;
        this.image_push = new File([blob], filename, { type: blob.type });
      }

    } catch (error) {
      console.error(error);
      // Solo mostramos el error si el usuario NO canceló la cámara
      if (String(error).indexOf('User cancelled photos app') === -1) {
        await Dialog.alert({
          title: this.translate.instant('attention'),
          message: this.translate.instant('file_type_invalid_upload')
        });
      }
    }
  }

  // dejar que decida el usuario si quiere tomar una foto o elegir desde su galeria 
  async SelectInput() {
    if (Capacitor.isNativePlatform() === true) {
      const actionSheet = await this.actionSheetController.create({
        header: this.translate.instant('select_option'),
        buttons: [
          {
            text: this.translate.instant('take_photo'),
            handler: () => {
              this.takePicture();
            }
          },
          {
            text: this.translate.instant('upload_from_gallery'),
            handler: () => {
              this.selectImage();
            }
          },
          {
            text: this.translate.instant('cancel'),
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
    else {
      const actionSheet = await this.actionSheetController.create({
        header: this.translate.instant('select_option'),
        buttons: [
          {
            text: this.translate.instant('upload_from_gallery'),
            handler: () => {
              this.selectImage();
            }
          },
          {
            text: this.translate.instant('cancel'),
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
  }
}