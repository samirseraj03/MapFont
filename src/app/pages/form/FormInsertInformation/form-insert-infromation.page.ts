import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Servicios
import GeolocationService from '../../../core/utils/Geolocation';
import DatabaseService from '../../../core/data/SupabaseService';
import { Forms } from '../../../core/data/SupabaseService';
import { Services } from '../../../core/services/services.service';

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

  formData: any = {
    is_potable: false,
    enabled: true
  };

  lnglat: any;
  image: string = ''; // <-- Ahora es un string (el path devuelto por Supabase)
  Adress: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private Service: Services,
    private Supabase: DatabaseService,
    public GeolocationService: GeolocationService
  ) {
    addIcons({ arrowBackOutline, createOutline, waterOutline, calendarOutline, earthOutline, checkmarkDoneOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      // Recogemos el texto con el path/nombre de la imagen
      this.image = await params['image'];
      this.lnglat = await params['lnglat'];
      this.Adress = await params['Adress'];
    });
  }

  async onSubmit() {
    await this.ToDataBase();
    this.GoSuccess();
  }

  async ToDataBase() {
    let user_id = await this.GeolocationService.getUserID();
    let data_user = await this.Supabase.getUser(user_id);

    this.lnglat = {
      "latitude": this.lnglat[1],
      "longitude": this.lnglat[0],
    };

    // 👇 LA IMAGEN YA ESTÁ EN STORAGE, SOLO GUARDAMOS LOS DATOS 👇
    let form: Forms = {
      username: data_user[0].username,
      watersourcesname: this.formData.watersourcesname,
      created_at: new Date(),
      location: this.lnglat,
      photo: this.image, // Asignamos directamente la ruta/nombre
      address: this.Adress,
      description: this.formData.description,
      is_potable: this.formData.is_potable === true || this.formData.is_potable === 'true',
      watersourcetype: this.formData.watersourcetype,
      approved: null,
      autencationUserID: user_id
    };

    await this.Supabase.insertForm(form);
  }

  GoSuccess() {
    // Si tenías variables en el servicio, las limpias
    this.Service.img_ref = null;

    this.NavCtrl.navigateForward('/Success', {
      queryParams: {
        page: 'form',
        Success: true,
      },
    });
  }
}