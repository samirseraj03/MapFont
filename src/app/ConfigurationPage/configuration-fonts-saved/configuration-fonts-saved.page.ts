import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

// Standalone Components (Limpios, sin Menús ni AgGrid)
import {
  IonHeader, IonContent, IonIcon
} from '@ionic/angular/standalone';

// Lógica y Servicios
import GeolocationService from 'src/app/Globals/Geolocation';
import DatabaseService from 'src/app/Types/SupabaseService';

// Iconos
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, bookmark, searchOutline, waterOutline,
  water, locationOutline, calendarOutline, navigateOutline, heartDislikeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-configuration-fonts-saved',
  templateUrl: './configuration-fonts-saved.page.html',
  styleUrls: ['./configuration-fonts-saved.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonIcon, CommonModule, FormsModule
  ],
})
export class ConfigurationFontsSavedPage {

  data: any[] = [];
  public results: any[] = [];

  GeolocationService = new GeolocationService();

  constructor(public NavCtrl: NavController, private Supabase: DatabaseService) {
    // Registramos todos los iconos
    addIcons({
      arrowBackOutline, bookmark, searchOutline, waterOutline,
      water, locationOutline, calendarOutline, navigateOutline, heartDislikeOutline
    });
  }


  async ionViewWillEnter() {
    let userid = await this.GeolocationService.getUserID();
    this.data = (await this.Supabase.getSavedFoutains(userid)) as any[];
    this.results = [...this.data];
  }

  // 1. Ver detalles de la fuente
  OnSelect(result: any) {
    this.NavCtrl.navigateForward('/viewForm', {
      queryParams: {
        id: result.matchedWaterSource.id,
        data: JSON.stringify(result.matchedWaterSource),
      },
    });
  }

  // 2. Abrir en Google Maps
  async OnSelectNavigate(result: any) {
    let latitude = await result.matchedWaterSource.location.latitude;
    let longitude = await result.matchedWaterSource.location.longitude;

    let link = (await this.GeolocationService.generateGoogleMapsLink(
      latitude,
      longitude
    )) as string;

    await Browser.open({ url: link });
  }

  // 3. Eliminar de Favoritos
  async OnSelectDislike(result: any) {
    let query = await this.Supabase.deleteSavedFoutain(result.savedFountain.id);

    if (query === 'Success') {
      const indexToRemove = this.data.findIndex(
        (savedFountain) => savedFountain.savedFountain.id === result.savedFountain.id
      );

      if (indexToRemove !== -1) {
        this.data.splice(indexToRemove, 1);
        this.results = [...this.data]; // Actualiza la vista automáticamente
      }
    }
  }

  // 4. Buscador
  SearchElement(event: any) {
    const query = event.target.value.toLocaleLowerCase();

    // Si la búsqueda está vacía, restauramos todos los datos
    if (!query || query.trim() === '') {
      this.results = [...this.data];
      return;
    }

    // Filtramos buscando en todos los valores del objeto
    this.results = this.data.filter((item) => {
      const name = item.matchedWaterSource.name?.toLocaleLowerCase() || '';
      const address = item.matchedWaterSource.address?.toLocaleLowerCase() || '';

      return name.includes(query) || address.includes(query);
    });
  }
}