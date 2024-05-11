import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { environment, setMapboxAccessToken } from './../../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';
import { AxiosResponse } from 'axios';
import axios from 'axios';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonIcon, IonButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonSearchbar, IonItem, IonLabel, IonList } from "@ionic/angular/standalone";
import { Dialog } from '@capacitor/dialog';

@Component({
  selector: 'app-form-select-location',
  templateUrl: './formselectlocation.page.html',
  styleUrls: ['./formselectlocation.page.scss'],
  standalone: true,
  imports: [IonList, IonLabel, IonItem, IonSearchbar, IonCardTitle, IonCardHeader, IonCard, IonContent, IonTitle, IonButton, IonIcon, IonButtons, IonToolbar, IonHeader,  CommonModule, FormsModule, ExploreContainerComponent],
})
export class FormSelectLocationPage implements OnInit {
  map_location: any;
  public data = [];
  public results = [...this.data];
  public query: any;
  LastMarker: any;
  LocationNotIsSelected : boolean = true;
  lnglat : any = []
  image : any

  constructor(public NavCtrl: NavController , private route : ActivatedRoute) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();
  async ngOnInit() {

    this.route.queryParams.subscribe(async (params) => {
      this.image = await params['image'];
    });
    // importamos el accessTokenMapbox para desplegar el mapa
    //setMapboxAccessToken(environment.accessToken);
    // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
    await this.GeolocationService.getGeolocation();
    // desplegamos el mapa de mapBox
    this.getMap();
  }
  // obtenemos el mapa
  getMap() {
    // desplegar el map
    this.map_location = new mapboxgl.Map({
      accessToken : environment.accessToken,
      container: 'MapaLocation',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ],
      zoom: 15.15,
    });
    // añadir el marcador del usuario
    // this.LastMarker = new mapboxgl.Marker()
    //   .setLngLat([
    //     this.GeolocationService.longitude,
    //     this.GeolocationService.latitude,
    //   ])
    //   .addTo(this.map_location);
  }
  // serach place with result
  async SerachPlace(event: any) {
    // Sugerir resultados
    const suggestions: any = await this.suggestPlaces(this.handleInput(event));
    this.data = suggestions;
  }
  // filtramos por input y lo convertimos a lowercase
  handleInput(event: any) {
    this.LocationNotIsSelected = true
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
    this.lnglat = [event.center[0], event.center[1]]

    // elimnamos el marcador anterior:
    if (this.LastMarker) {
      this.LastMarker.remove();
    }
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker()
      .setLngLat([event.center[0], event.center[1]])
      .addTo(this.map_location);
    // habiltamos el boton que esta confiramado la dirrecion
    this.LocationNotIsSelected = false
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
      // para manejar los datos
      // para ponerlo en el buscador y el mapa
      this.query = await response.data.features[0].place_name;
      this.map_location.setCenter([
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ]);

      //Guardamos lnglat
      this.lnglat = [this.GeolocationService.longitude, this.GeolocationService.latitude]

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
    this.LocationNotIsSelected = false
    } catch (error) {
      await Dialog.alert({
        title: 'Atencion',
        message: 'ha sucedido un error , intentalo manualmente o mas tarde !'
      });
    }
  }
  // pasamos a la siguente para completar el forumulario
  LocationSuccess() {
      this.NavCtrl.navigateForward( '/FormInformation', {
        queryParams: {
          Adress: this.query,
          lnglat : this.lnglat,
          image : this.image
        },
    });
  }




}
