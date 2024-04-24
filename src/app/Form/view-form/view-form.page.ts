import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.page.html',
  styleUrls: ['./view-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ViewFormPage implements OnInit {

  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  data : any = {}
  img_ref_view_form : any  = null
  map_view_form : any
  LastMarker : any

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }


  async ngOnInit() {

    await this.GeolocationService.getGeolocation();

    this.data.name = "alguna fuente";
    this.data.longitude = this.GeolocationService.longitude,
    this.data.latitude =   this.GeolocationService.latitude ,
   

       // importamos el accessTokenMapbox para desplegar el mapa
       (mapboxgl as any).accessToken = environment.accessToken;
       // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion

       // desplegamos el mapa de mapBox
       this.getMap();



  }

  getMap() {
    // desplegar el map
    this.map_view_form = new mapboxgl.Map({
      container: 'mapViewForm',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [
        this.data.longitude ,
        this.data.latitude ,
      ],

    
      
      zoom: 15.15,
    });
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker()
      .setLngLat([
        this.data.longitude ,
        this.data.latitude ,
      ])
      .addTo(this.map_view_form);
  }

}
