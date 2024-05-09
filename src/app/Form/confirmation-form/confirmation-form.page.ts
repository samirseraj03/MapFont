import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController , AlertController , LoadingController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import {WaterSources} from '../../Types/SupabaseService';

import { arrowBack, heartDislike, navigate ,checkmark , chevronForward} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Browser } from '@capacitor/browser';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCardHeader, IonCard, IonCardTitle, IonList, IonLabel, IonItem } from "@ionic/angular/standalone";

@Component({
  selector: 'app-confirmation-form',
  templateUrl: './confirmation-form.page.html',
  styleUrls: ['./confirmation-form.page.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, IonList, IonCardTitle, IonCard, IonCardHeader, IonContent, IonIcon, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class ConfirmationFormPage implements OnInit {

  results : any = []
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();


  loading : any 
  alert : any



  constructor(public NavCtrl: NavController , public alertController : AlertController ,  private loadingController: LoadingController,
  ) {
    addIcons({ arrowBack , heartDislike, navigate , checkmark ,chevronForward });
  }

  ngOnInit() {
    this.GetFormsDataBase();
  }

  // cuando se confirma el formulario por
  async OnConfirm(result : any){

    console.log(result)


    this.loading = await this.loadingController.create({
      message: '',
    });

    this.alert = await this.alertController.create({
      header: 'SE HA CREADO LA FUENTE CORRECTAMENTE A LA BASE DE DATOS',
      buttons: [
        {
          text: 'Exit',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
      ],
    });
    const waterSource: WaterSources = {
      location: { // Ejemplo de objeto anidado, asegúrate de que el tipo sea correcto
        latitude: result.location.latitude,
        longitude: result.location.longitude,
      },
      name: result.watersourcesname,
      address: result.address,
      ispotable: result.is_potable,
      available: result.available,
      created_at: new Date(),
      photo: result.photo,
      description: result.description,
      watersourcetype : result.watersourcetype
    };
    // cambaiamos la variable y ponemos que se ha aprbado correctamente
    result.approved = true
    try {
      this.loading.present()
      let insert = await this.Supabase.insertWaterSource(waterSource)
      if (insert){
        let query = await this.Supabase.updateForm(result.id , result.approved)

        if (query){
          const indexToRemove = this.results.findIndex(
            (form: { id: any; }) => form.id === result.id
          );
          if (indexToRemove !== -1 ){
            console.log(indexToRemove)
            this.results.splice(indexToRemove , 1);
          }  
        }  
      } 
    }
    catch {
      await this.loading.dismiss();
      this.alert = await this.alertController.create({
        header: 'NO SE HA CREADO LA FUENTE',
        buttons: [
          {
            text: 'Exit',
            htmlAttributes: {
              'aria-label': 'close',
            },
          },
        ],
      });
      this.alert.present();
    }
    finally {
      await this.loading.dismiss();
      await this.alert.present();
    }
  }

  // lo llevamos para mirar el forumulario
  OnSelect(result : any){
    this.ViewForm(result);
  }
 // obtener todos los elementos de forms
 async GetFormsDataBase(){
   this.results = await this.Supabase.getForms();
}

async OnSelectNavigate(result: any) {

  let latitude = await result.location.latitude
  let longitude = await result.location.longitude

  // preparamos el enalce de google maps
  let link = await this.GeolocationService.generateGoogleMapsLink(latitude , longitude) as string
  // abrimos el enlace desde capacitor
  await Browser.open({ url: link });
}

ViewForm(data : any){
  console.log(data);
  this.NavCtrl.navigateForward( '/viewForm', {
    queryParams: {
      id : data.id,
      data : JSON.stringify(data),
      username : data.username,
    },
  });
}




}
