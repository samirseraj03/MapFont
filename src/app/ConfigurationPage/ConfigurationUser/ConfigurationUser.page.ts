import { Component, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  NavController,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { IonicModule } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuration-user',
  templateUrl: 'ConfigurationUser.page.html',
  styleUrls: ['ConfigurationUser.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonicModule,
    ExploreContainerComponent,
    ConfigurationTabPage,
    CommonModule,
  ],
})
export class ConfigurationUserPage {
  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  img_ref_config: any = null;

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();

  Update() {

    // utilizamos el supabase
    this.ToDataBase()

    this.NavCtrl.navigateForward( '/Success', {
      state: {
        PageSucces: 'configuration',
      },
    });
  }

  ToDataBase(){

  }

  // para hacer click al input cuando se hace click al boton
  SelectInput() {
    const fileInput = document.getElementById('fileItemConfig') as HTMLInputElement;
    fileInput.click();
  }

  // para obtener el archivo del input
  handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.img_ref_config = imgReader.result as string; // Asigna la URL de datos de la imagen a imgUrl
      };
      imgReader.readAsDataURL(selectedFile);
    } else {
      alert('el tipo de archivo no es valido');
    }
  }

  // para eliminar la foto y poder subir otra
  Delete() {
    this.img_ref_config = null;
  }
}
