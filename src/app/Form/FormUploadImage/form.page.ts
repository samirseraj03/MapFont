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
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FormSelectLocationPage } from '../FormSelectLocation/formselectlocation.page';
import { Dialog } from '@capacitor/dialog';

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
  img_ref: any = null;
  image_push: any;
  GeolocationService = new GeolocationService();

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }

  // para hacer click al input cuando se hace click al boton
  SelectInput() {
    const fileInput = document.getElementById('fileItem') as HTMLInputElement;
    fileInput.click();
  }

  // para obtener el archivo del input
  async handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    this.image_push = event.target.files[0];
    if (selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.img_ref = imgReader.result as string; // Asigna la URL de datos de la imagen a imgUrl
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
    if (this.img_ref) {
      this.NavCtrl.navigateForward( '/location', {
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
    this.img_ref = null;
  }
}
