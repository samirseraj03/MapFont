import { Component, OnInit, ViewChild , ChangeDetectorRef  } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  NavController,
  IonButtons,
  IonIcon,
  IonButton, IonCard, IonCardHeader, IonCardTitle, IonList, IonLabel , IonMenu , IonMenuButton , IonSelect , IonSelectOption, IonInput } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import {   LoadingController } from '@ionic/angular';
import { FormsModule, NgForm   } from '@angular/forms';
import { CommonModule } from '@angular/common';
import DatabaseService from '../../Types/SupabaseService';
import { Dialog } from '@capacitor/dialog';


@Component({
  selector: 'app-configuration-user',
  templateUrl: 'ConfigurationUser.page.html',
  styleUrls: ['ConfigurationUser.page.scss'],
  standalone: true,
  imports: [IonInput, IonLabel, IonList, IonCardTitle, IonCardHeader, IonCard,  
    FormsModule,
    ExploreContainerComponent,
    ConfigurationTabPage,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonIcon,
    IonButton, IonMenu , IonMenuButton , IonSelect ,IonSelectOption
  ],
})
export class ConfigurationUserPage implements OnInit {
  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  img_ref_config: any = null;
  data: any;

  constructor(public NavCtrl: NavController ,  private loadingController: LoadingController, private cdr: ChangeDetectorRef
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
    this.cdr.detectChanges();

  }

  loading : any
  async Update() {
    // utilizamos el supabase

    this.loadingController.create({ message: 'Cargando' }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });

    try {
      await this.ToDataBase();

    }catch {
      this.loading.dismiss()
    }
    finally{
      this.NavCtrl.navigateForward( '/Success', {
        state: {
          PageSucces: 'configuration',
        },
      });
      this.loading.dismiss()
    }

  }

  async ToDataBase() {
    // si la imagen se ha cambiado , subimos la imagen despues el hacemos el update
    if (this.image_ref_upload_config) {
      this.formData.photo = await this.Supabase.InsertToStoarge(this.image_ref_upload_config);

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
  async handleFileInput(event: any) {
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
      await Dialog.alert({
        title: 'Atencion',
        message: 'el tipo de archivo no es valido'
      });
    }
  }

  // para eliminar la foto y poder subir otra
  Delete() {
    this.img_ref_config = null;
    this.image_ref_upload_config = null;
    this.formData.photo = null

  }
}
