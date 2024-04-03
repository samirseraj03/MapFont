import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import GeolocationService from 'src/app/Globals/Geolocation';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { ExploreContainerComponent } from '../../explore-container/explore-container.component';


@Component({
  selector: 'app-form-select-location',
  templateUrl: './formselectlocation.page.html',
  styleUrls: ['./formselectlocation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule , ExploreContainerComponent],
})
export class FormSelectLocationPage implements OnInit {
  map_location: any;
  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();
  async ngOnInit() {
    // importamos el accessTokenMapbox para desplegar el mapa
    (mapboxgl as any).accessToken = environment.accessToken;
    // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
    await this.GeolocationService.getGeolocation();
    // desplegamos el mapa de mapBox

    console.log(    this.GeolocationService.longitude,    this.GeolocationService.latitude,
      )

    this.getMap();
  }

  getMap() {
    // desplegar el map
    this.map_location = new mapboxgl.Map({
      container: 'MapaLocation',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ],
      zoom: 15.15,
    });
    // añadir el marcador del usuario
    new mapboxgl.Marker()
    .setLngLat([
      this.GeolocationService.longitude,
      this.GeolocationService.latitude,
    ])
    .addTo(this.map_location);

         
  }

}
