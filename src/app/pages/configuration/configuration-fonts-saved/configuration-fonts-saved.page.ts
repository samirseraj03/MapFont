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
import GeolocationService from '../../../core/utils/Geolocation';
import { WaterSourceFacade } from '../../../core/facades/water-source.facade';
import { TranslateModule } from '@ngx-translate/core';

// Iconos
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, bookmark, searchOutline, waterOutline,
  water, locationOutline, calendarOutline, navigateOutline, heartDislikeOutline
} from 'ionicons/icons';

/**
 * @description
 * Lista paginada o vista enumerativa de las fuentes de agua favoritas guardadas por el usuario autenticado, consultadas uniformemente a WaterSourceFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-configuration-fonts-saved',
  templateUrl: './configuration-fonts-saved.page.html',
  styleUrls: ['./configuration-fonts-saved.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonIcon, CommonModule, FormsModule, TranslateModule
  ],
})
export class ConfigurationFontsSavedPage {

  data: any[] = [];
  public results: any[] = [];

  constructor(
    public NavCtrl: NavController,
    private waterSourceFacade: WaterSourceFacade,
    public GeolocationService: GeolocationService
  ) {
    // Registramos todos los iconos
    addIcons({
      arrowBackOutline, bookmark, searchOutline, waterOutline,
      water, locationOutline, calendarOutline, navigateOutline, heartDislikeOutline
    });
  }


  async ionViewWillEnter() {
    this.data = (await this.waterSourceFacade.loadSavedFountains()) as any[];
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
    try {
      await this.waterSourceFacade.toggleSavedFountain(result.matchedWaterSource.id, true, result.savedFountain.id);
      const indexToRemove = this.data.findIndex(
        (savedFountain) => savedFountain.savedFountain.id === result.savedFountain.id
      );

      if (indexToRemove !== -1) {
        this.data.splice(indexToRemove, 1);
        this.results = [...this.data]; // Actualiza la vista automáticamente
      }
    } catch(e) {}
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