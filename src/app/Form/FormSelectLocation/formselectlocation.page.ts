import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import { environment } from './../../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
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
  imports: [IonContent, IonIcon, CommonModule, FormsModule, ExploreContainerComponent, TranslateModule],
})
export class FormSelectLocationPage implements OnInit {
  map_location: any;
  public data = [];
  public results = [...this.data];
  public query: string = "";
  LastMarker: any;
  LocationNotIsSelected: boolean = true;
  lnglat: any = [];
  image: any;

  GeolocationService = new GeolocationService();

  constructor(public NavCtrl: NavController, private route: ActivatedRoute, public translate: TranslateService) {
    // Registramos los iconos para el HTML
    addIcons({ arrowBackOutline, searchOutline, locateOutline, locationOutline, arrowForwardOutline });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.image = await params['image'];
    });

    // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
    await this.GeolocationService.getGeolocation();
    // desplegamos el mapa de mapBox
    this.getMap();
  }

  // obtenemos el mapa
  getMap() {
    // desplegar el map
    this.map_location = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'MapaLocation',
      style: 'mapbox://styles/mapbox/dark-v11', // Mantenemos tu estilo dark
      center: [
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ],
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
    this.map_location.setCenter([event.center[0], event.center[1]]);

    //Guardamos lnglat
    this.lnglat = [event.center[0], event.center[1]];

    // elimnamos el marcador anterior:
    if (this.LastMarker) {
      this.LastMarker.remove();
    }
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker()
      .setLngLat([event.center[0], event.center[1]])
      .addTo(this.map_location);

    // habiltamos el boton que esta confiramado la dirrecion
    this.LocationNotIsSelected = false;
    this.data = [];
  }

  // busacar por Gps La dirrecion
  async SerachWithGps() {
    this.data = [];
    await this.GeolocationService.getGeolocation();
    try {
      const response: AxiosResponse = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${this.GeolocationService.longitude},${this.GeolocationService.latitude}.json?access_token=${environment.accessToken}`
      );

      this.query = await response.data.features[0].place_name;
      this.map_location.setCenter([
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ]);

      //Guardamos lnglat
      this.lnglat = [this.GeolocationService.longitude, this.GeolocationService.latitude];

      // elimnamos el marcador anterior:
      if (this.LastMarker) {
        this.LastMarker.remove();
      }
      this.LastMarker = new mapboxgl.Marker()
        .setLngLat([
          this.GeolocationService.longitude,
          this.GeolocationService.latitude,
        ])
        .addTo(this.map_location);

      // habiltamos el boton que esta confiramado la dirrecion
      this.LocationNotIsSelected = false;
    } catch (error) {
      await Dialog.alert({
        title: this.translate.instant('attention'),
        message: this.translate.instant('location_error_gps')
      });
    }
  }

  // pasamos a la siguente para completar el forumulario
  LocationSuccess() {
    this.NavCtrl.navigateForward('/FormInformation', {
      queryParams: {
        Adress: this.query,
        lnglat: this.lnglat,
        image: this.image
      },
    });
  }
}