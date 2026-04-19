import { Component, ChangeDetectorRef } from '@angular/core'; // <-- Añadido ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import GeolocationService from '../../../core/utils/Geolocation';
import { environment } from '../../../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { ActivatedRoute } from '@angular/router';
import { Dialog } from '@capacitor/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// Imports limpios de Ionic Standalone
import { IonContent, IonIcon } from "@ionic/angular/standalone";

// Iconos necesarios para el diseño AquaPath
import { addIcons } from 'ionicons';
import { arrowBackOutline, searchOutline, locateOutline, locationOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-form-select-location',
  templateUrl: './formselectlocation.page.html',
  styleUrls: ['./formselectlocation.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, TranslateModule],
})
export class FormSelectLocationPage { // Quitamos el OnInit, usaremos la lógica de Ionic
  map_location: any;
  public data: any[] = [];
  public results = [...this.data];
  public query: string = "";
  LastMarker: any;
  LocationNotIsSelected: boolean = true;
  lnglat: any = [];
  image: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    public GeolocationService: GeolocationService
  ) {
    addIcons({ arrowBackOutline, searchOutline, locateOutline, locationOutline, arrowForwardOutline });
  }

  // ESTA ES LA CLAVE: Se ejecuta justo cuando la página ya es visible y tiene tamaño real
  async ionViewDidEnter() {
    this.route.queryParams.subscribe((params) => {
      this.image = params['image'];
    });

    // 1. Desplegamos el mapa INMEDIATAMENTE para no hacer esperar al usuario
    this.getMap();

    // 2. Forzamos un redibujado de Mapbox para evitar el "mapa invisible"
    setTimeout(() => {
      if (this.map_location) {
        this.map_location.resize();
      }
    }, 200);

    // 3. Obtenemos la ubicación y ponemos el marcador AUTOMÁTICAMENTE
    // Al no poner un 'await' delante de todo el bloque, la app no se congela
    await this.SerachWithGps();
  }

  // obtenemos el mapa
  getMap() {
    // Si el servicio no tiene coordenadas aún, le damos unas por defecto temporales (ej: [0,0])
    const startLng = this.GeolocationService.longitude || -3.703790; // Madrid por defecto, pon lo que quieras
    const startLat = this.GeolocationService.latitude || 40.416775;

    // desplegar el map
    this.map_location = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'MapaLocation',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [startLng, startLat],
      zoom: 15.15,
    });
  }

  // serach place with result
  async SerachPlace(event: any) {
    // Sugerir resultados
    const suggestions: any = await this.suggestPlaces(this.handleInput(event));
    this.data = suggestions;
  }

  // filtramos por input y lo convertimos a lowercase
  handleInput(event: any) {
    this.LocationNotIsSelected = true;
    this.query = event.target.value.toLowerCase();
    return this.query;
  }

  ToSearch() {
    return this.query;
  }

  // Función para sugerir resultados
  async suggestPlaces(query: string): Promise<string[]> {
    if (!query) return []; // Prevención de errores si el input está vacío

    const response: AxiosResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${environment.accessToken}`
    );
    return response.data.features.map(
      (feature: { place_name: any; id: any; center: any }) => ({
        place_name: feature.place_name,
        id: feature.id,
        center: feature.center,
      })
    );
  }

  async OnSelect(event: any) {
    this.query = event.place_name;
    this.map_location.flyTo({ center: [event.center[0], event.center[1]], essential: true }); // flyTo queda más bonito que setCenter

    //Guardamos lnglat
    this.lnglat = [event.center[0], event.center[1]];

    // elimnamos el marcador anterior:
    if (this.LastMarker) {
      this.LastMarker.remove();
    }
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker({ color: '#22d3ee' }) // Mismo color cyan que tus botones
      .setLngLat([event.center[0], event.center[1]])
      .addTo(this.map_location);

    // habiltamos el boton que esta confiramado la dirrecion
    this.LocationNotIsSelected = false;
    this.data = [];
    this.cdr.detectChanges(); // <-- Forzamos a Angular a actualizar la UI
  }

  // busacar por Gps La dirrecion (AHORA SE LLAMA AUTOMÁTICAMENTE AL INICIO)
  async SerachWithGps() {
    this.data = [];
    try {
      await this.GeolocationService.getGeolocation();

      const lng = this.GeolocationService.longitude;
      const lat = this.GeolocationService.latitude;

      const response: AxiosResponse = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${environment.accessToken}`
      );

      this.query = response.data.features[0].place_name;

      // Movemos el mapa a tu ubicación real
      this.map_location.flyTo({ center: [lng, lat], essential: true });

      //Guardamos lnglat
      this.lnglat = [lng, lat];

      // elimnamos el marcador anterior:
      if (this.LastMarker) {
        this.LastMarker.remove();
      }
      this.LastMarker = new mapboxgl.Marker({ color: '#22d3ee' }) // Color bonito
        .setLngLat([lng, lat])
        .addTo(this.map_location);

      // habiltamos el boton que esta confiramado la dirrecion
      this.LocationNotIsSelected = false;
      this.cdr.detectChanges(); // <-- Actualizamos el input con tu calle real

    } catch (error) {
      console.log("Error de GPS:", error);
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('location_error_gps')
      });
    }
  }

  // pasamos a la siguente para completar el forumulario
  LocationSuccess() {
    (document.activeElement as HTMLElement)?.blur(); // Limpiamos el foco fantasma

    this.NavCtrl.navigateForward('/FormInformation', {
      queryParams: {
        Adress: this.query,
        lnglat: this.lnglat,
        image: this.image
      },
    });
  }
}