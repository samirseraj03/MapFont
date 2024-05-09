import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack, heartDislike, navigate } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import DatabaseService from 'src/app/Types/SupabaseService';
import { Browser } from '@capacitor/browser';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCardTitle, IonCard, IonCardHeader, IonSearchbar, IonList, IonItem, IonLabel, IonButton, IonIcon ,IonMenu , IonMenuButton } from "@ionic/angular/standalone";

@Component({
  selector: 'app-configuration-fonts-saved',
  templateUrl: './configuration-fonts-saved.page.html',
  styleUrls: ['./configuration-fonts-saved.page.scss'],
  standalone: true,
  imports: [IonIcon, IonMenu , IonMenuButton , IonButton, IonLabel, IonItem, IonList, IonSearchbar, IonCardHeader, IonCard, IonCardTitle, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule, ConfigurationTabPage],
})
export class ConfigurationFontsSavedPage implements OnInit {
  data: any[] = []

  public results = [...this.data];

  constructor(public NavCtrl: NavController ) {
    addIcons({ arrowBack, navigate, heartDislike });
  }
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();


  async ngOnInit() {
    let userid = await this.GeolocationService.getUserID()
    this.data = await this.Supabase.getSavedFoutains(userid) as any[];
    this.results = [...this.data];

    
  }

  OnSelect(result : any){
    this.NavCtrl.navigateForward('viewForm' , {
      queryParams: {
        id : result.matchedWaterSource.id,
        data: result.matchedWaterSource,
      },
    })
  }

 async OnSelectNavigate(result: any) {

    let latitude = await result.matchedWaterSource.location.latitude
    let longitude = await result.matchedWaterSource.location.longitude

    // preparamos el enalce de google maps
    let link = await this.GeolocationService.generateGoogleMapsLink(latitude , longitude) as string
    // abrimos el enlace desde capacitor
    await Browser.open({ url: link });
  }

  async OnSelectDislike(result: any) {

    let query = await this.Supabase.deleteSavedFoutain(result.savedFountain.id)

    if (query === 'Success'){

      const indexToRemove = this.data.findIndex(
        (savedFountain) => savedFountain.savedFountain.id === result.savedFountain.id
      );

      if (indexToRemove !== -1 ){
        console.log(indexToRemove)
        this.data.splice(indexToRemove , 1);
        this.results = [...this.data];
      }  
    }
  
  }

  ToSearch() {}

  SearchElement(event: any) {
    const query = event.target.value.toLocaleLowerCase();
    this.results = this.data.filter((item) => {
      const values = Object.values(item).map((value) => {
        if (typeof value === 'string') {
          // Verificación de tipo
          return value.toLocaleLowerCase();
        }
        return ''; // O cualquier otro valor predeterminado para tipos no string
      });
      return values.some((value) => value.includes(query));
    });
  }
}
