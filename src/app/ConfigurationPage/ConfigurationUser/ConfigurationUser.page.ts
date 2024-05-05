import { Component, OnInit, ViewChild } from '@angular/core';
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
import { IonicModule , LoadingController } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import DatabaseService from '../../Types/SupabaseService';

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
export class ConfigurationUserPage implements OnInit {
  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  img_ref_config: any = null;
  data: any;

  constructor(public NavCtrl: NavController ,  private loadingController: LoadingController, 
  ) {
    addIcons({ arrowBack });
  }
  // improts
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  // importamos los datos
  async ngOnInit() {
    let user_id = await this.GeolocationService.getUserID();
    this.data = await this.Supabase.getUser(user_id);
    this.formData = {
      name: this.data[0].name || '',
      email: this.data[0].email,
      language: this.data[0].language,
      username: this.data[0].username,
    };
    if (this.data[0].photo == null) {
      this.img_ref_config = null;
    } else {
      this.img_ref_config =
        this.Supabase.GetStorage(this.data[0].photo) || null;
    }
  }

  loading : any
  async Update() {
    // utilizamos el supabase

    this.loading = await this.loadingController.create({
      message: 'estamos actualizando',
    });   
    try {
      this.loading.present()
      await this.ToDataBase();

    }catch {
      this.loading.dismiss()
    }
    finally{
      this.loading.dismiss()
    }
    this.NavCtrl.navigateForward( '/Success', {
      state: {
        PageSucces: 'configuration',
      },
    });
  }

  async ToDataBase() {
    // si la imagen se ha cambiado , subimos la imagen despues el hacemos el update
    if (this.image_ref_upload_config) {
      this.formData.photo = await this.Supabase.InsertToStoarge(this.image_ref_upload_config);

      console.log(this.formData)
      await this.Supabase.updateUser(
        await this.GeolocationService.getUserID(),
        this.formData
      );
    } else {
      await this.Supabase.updateUser(
        await this.GeolocationService.getUserID(),
        this.formData
      );
    }
  }

  // para hacer click al input cuando se hace click al boton
  SelectInput() {
    const fileInput = document.getElementById(
      'fileItemConfig'
    ) as HTMLInputElement;
    fileInput.click();
  }
  image_ref_name_config: any;
  image_ref_upload_config: any;
  // para obtener el archivo del input
  handleFileInput(event: any) {
    const selectedFile = event.target.files[0];
    console.log();
    if (selectedFile.type.startsWith('image/')) {
      const imgReader = new FileReader();
      imgReader.onload = () => {
        this.img_ref_config = imgReader.result as string; // Asigna la URL de datos de la imagen a imgUrl
        this.image_ref_upload_config = event.target.files[0];
      };
      imgReader.readAsDataURL(selectedFile);
    } else {
      alert('el tipo de archivo no es valido');
    }
  }

  // para eliminar la foto y poder subir otra
  Delete() {
    this.img_ref_config = null;
    this.image_ref_upload_config = null;
    this.formData.photo = null

  }
}
