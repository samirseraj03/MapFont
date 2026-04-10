import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Servicios
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from 'src/app/Types/SupabaseService';
import { Forms } from 'src/app/Types/SupabaseService';
import { Services } from 'src/app/services.service';

// Ionic Standalone Imports actualizados
import {
  IonContent, IonIcon, IonInput, IonTextarea, IonToggle, IonSelect, IonSelectOption
} from "@ionic/angular/standalone";

// Iconos para el nuevo diseño AquaPath
import { addIcons } from 'ionicons';
import { arrowBackOutline, createOutline, waterOutline, calendarOutline, earthOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-insert-infromation',
  templateUrl: './form-insert-infromation.page.html',
  styleUrls: ['./form-insert-infromation.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSelect,
    IonSelectOption,
    TranslateModule
  ]
})
export class FormInsertInfromationPage implements OnInit {

  @ViewChild('myForm') myForm!: NgForm;

  // Al inicializar predefinimos booleanos para los Toggles
  formData: any = {
    is_potable: false,
    enabled: true
  };

  lnglat: any;
  image: any;
  Adress: any;

  GeolocationService = new GeolocationService();

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private Service: Services,
    private Supabase: DatabaseService
  ) {
    // Registrar los iconos del diseño
    addIcons({ arrowBackOutline, createOutline, waterOutline, calendarOutline, earthOutline, checkmarkDoneOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.image = await params['image'];
      this.lnglat = await params['lnglat'];
      this.Adress = await params['Adress'];
    });
  }

  // Método para recopilar la información del formulario
  async onSubmit() {
    this.ToDataBase();
    this.GoSuccess();
  }

  async ToDataBase() {
    // preparamos las variables a insertar para el formulario
    let user_id = await this.GeolocationService.getUserID();
    let data_user = await this.Supabase.getUser(user_id);

    this.lnglat = {
      "latitude": this.lnglat[1],
      "longitude": this.lnglat[0],
    };

    let image = await this.Supabase.InsertToStoarge(this.image);

    let form: Forms = {
      username: data_user[0].username,
      watersourcesname: this.formData.watersourcesname,
      created_at: new Date(),
      location: this.lnglat,
      photo: image,
      address: this.Adress,
      description: this.formData.description,
      is_potable: this.formData.is_potable, // Ahora se pasa como boolean directamente (true/false) gracias al Toggle
      watersourcetype: this.formData.watersourcetype,
      approved: null,
      autencationUserID: user_id
    };

    // insertamos los datos a la base de datos
    this.Supabase.insertForm(form);
  }

  // para mostrar al usuario pagina completada e ir al inicio
  GoSuccess() {
    // eliminamos la variable imgRef service y la ponemos a null
    this.Service.img_ref = null;

    this.NavCtrl.navigateForward('/Success', {
      queryParams: {
        page: 'form',
        Success: true,
      },
    });
  }
}