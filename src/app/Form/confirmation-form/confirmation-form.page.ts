import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController , AlertController , LoadingController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import {WaterSources} from '../../Types/SupabaseService';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface
import { arrowBack, heartDislike, navigate ,checkmark , chevronForward , close} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Browser } from '@capacitor/browser';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCardHeader, IonCard, IonCardTitle, IonList, IonLabel, IonItem } from "@ionic/angular/standalone";
import { Dialog } from '@capacitor/dialog';

@Component({
  selector: 'app-confirmation-form',
  templateUrl: './confirmation-form.page.html',
  styleUrls: ['./confirmation-form.page.scss'],
  standalone: true,
  imports: [AgGridAngular ,IonItem, IonLabel, IonList, IonCardTitle, IonCard, IonCardHeader, IonContent, IonIcon, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class ConfirmationFormPage implements OnInit {

  results : any = []
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();


  loading : any 
  alert : any


  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: "username", headerName: "Usuario:" },
    { field: "watersourcesname", headerName: "Nombre fuente:" },
    { field: "created_at", headerName: "Creado:" },
    { field: "location.latitude", headerName: "latitude:" },
    { field: "location.longitude", headerName: "longitude:" },
    { field: "address", headerName: "adreça:" },
    {
      field: "",
      headerName: "",
      cellRenderer: (params: any) => {
        const rowData = params.data;
  
        const onSelectNavigate = () => this.OnSelectNavigate(rowData);
        const onConfirm = () => this.OnConfirm(rowData);
        const onSelect = () => this.OnSelect(rowData);
        const onReject = () => this.OnReject(rowData);
  
        const buttonsHTML = `
          <ion-buttons class="d-flex justify-content-end">
            <ion-button id="rejectBtn">
              <ion-icon name="close"></ion-icon>
            </ion-button>
            <ion-button id="navigateBtn">
              <ion-icon name="navigate"></ion-icon>
            </ion-button>
            <ion-button id="confirmBtn">
              <ion-icon name="checkmark"></ion-icon>
            </ion-button>
            <ion-button id="selectBtn">
              <ion-icon name="chevron-forward"></ion-icon>
            </ion-button>
          </ion-buttons>
        `;
  
        // Crear un elemento div temporal para contener los botones y registrar los eventos de clic
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buttonsHTML;
  
        // Agregar los eventos de clic a los botones solo si existen
        const navigateBtn = tempDiv.querySelector('#navigateBtn');
        const confirmBtn = tempDiv.querySelector('#confirmBtn');
        const selectBtn = tempDiv.querySelector('#selectBtn');
        const rejectBtn = tempDiv.querySelector('#rejectBtn');
  
        if (navigateBtn) {
          navigateBtn.addEventListener('click', onSelectNavigate);
        }
  
        if (confirmBtn) {
          confirmBtn.addEventListener('click', onConfirm);
        }
  
        if (selectBtn) {
          selectBtn.addEventListener('click', onSelect);
        }
        if ( rejectBtn) {
          rejectBtn.addEventListener('click', onReject);
        }
  
        return tempDiv;
      },
    },
  ];
  


  constructor(public NavCtrl: NavController , public alertController : AlertController ,  private loadingController: LoadingController,
  ) {
    addIcons({ arrowBack , heartDislike, navigate , checkmark ,chevronForward ,close });
  }

  ngOnInit() {
    this.GetFormsDataBase();
  }

  // cuando se confirma el formulario por
  async OnConfirm(result : any){



    this.loadingController.create({ message: 'Cargando' }).then(loading => {
      this.loading = loading;
      this.loading.present();
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
      watersourcetype : result.watersourcetype,
      updated_at : result.updated_at
    };
    // cambaiamos la variable y ponemos que se ha aprbado correctamente
    let ApprovedUpdated = {
      approved : true
    }
    try {
     
      let insert = await this.Supabase.insertWaterSource(waterSource)
      if (insert){
        let query = await this.Supabase.updateForm(result.id , ApprovedUpdated)

        if (query.length > 0){
          const indexToRemove = this.results.findIndex(
            (form: { id: any; }) => form.id === result.id
          );

          if (indexToRemove !== -1 ){
            console.log(indexToRemove)
            this.results.splice(indexToRemove , 1);
            this.results = [...this.results]
          }  
        }  else {
          throw Error
        }
      } 
      await Dialog.alert({
        title: 'Atencion',
        message: 'SE HA CREADO LA FUENTE CORRECTAMENTE A LA BASE DE DATOS'
      });

    }
    catch {
      await this.loading.dismiss();
      await Dialog.alert({
        title: 'Atencion',
        message: 'NO SE HA CREADO LA FUENTE'
      });
    }
    finally {
      await this.loading.dismiss();

    }
  }

  // lo llevamos para mirar el forumulario
  OnSelect(result : any){
    console.log("result" , result)
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

// para rechazar el formulario
  async OnReject(result : any){

  let ApprovedUpdated = {
    approved : false
  }

  let query = await this.Supabase.updateForm(result.id , ApprovedUpdated)

  if (query.length > 0){
    const indexToRemove = this.results.findIndex(
      (form: { id: any; }) => form.id === result.id
    );

    if (indexToRemove !== -1 ){
      this.results.splice(indexToRemove , 1);
      this.results = [...this.results]
    }  
  }
}

ViewForm(data : any){
  this.NavCtrl.navigateForward( '/viewForm', {
    queryParams: {
      id : data.id,
      data : JSON.stringify(data),
      username : data.username,
    },
  });
}




}
