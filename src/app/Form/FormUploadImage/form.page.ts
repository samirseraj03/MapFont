import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonCardContent,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
import { CommonModule } from '@angular/common';
import GeolocationService from '../../Globals/Geolocation';
import { NavController, ActionSheetController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FormSelectLocationPage } from '../FormSelectLocation/formselectlocation.page';
import { Dialog } from '@capacitor/dialog';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core';
import { Services } from 'src/app/services.service';

@Component({
  selector: 'app-form',
  templateUrl: 'form.page.html',
  styleUrls: ['form.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonIcon,
    IonButton,
    IonLabel,
    IonItem,
    IonCardContent,
    IonList,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    IonThumbnail,
    CommonModule,
    IonIcon,
    IonLabel,
  ],
})
export class FormPage {

  image_push: any;
  GeolocationService = new GeolocationService();

  constructor(public NavCtrl: NavController, private actionSheetController: ActionSheetController , public Service : Services) {
    addIcons({ arrowBack });
    this.Service.img_ref =  null;
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
    if (selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.Service.img_ref = imgReader.result as string; // Asigna la URL de datos de la imagen a imgUrl
      };
      imgReader.readAsDataURL(selectedFile);
    } else {
      await Dialog.alert({
        title: 'Atencion',
        message: 'el tipo de archivo no es valido'
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
        title: 'Atencion',
        message: 'Sube una foto para poder continuar'
      });
    }
  }
  // para eliminar la foto y poder subir otra
  Delete() {
    this.Service.img_ref = null;
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


    } catch (error) {
      console.error(error)
      await Dialog.alert({
        title: 'Atencion',
        message: 'el tipo de archivo no es valido , no se pudo subir el archivo'
      });


    }
  }



// dejar que decida el usuario si quiere tomar una foto o elegir desde su galeria 
  async SelectInput() {


    if (Capacitor.isNativePlatform() === true) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Selecciona una opción',
        buttons: [
          {
            text: 'Tomar Foto',
            handler: () => {
              this.takePicture();
            }
          },
          {
            text: 'Subir desde Galería',
            handler: () => {
              this.selectImage();
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    }
    else {

      const actionSheet = await this.actionSheetController.create({
        header: 'Selecciona una opción',
        buttons: [
          {
            text: 'Subir desde Galería',
            handler: () => {
              this.selectImage();
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();

    }
  }



}
