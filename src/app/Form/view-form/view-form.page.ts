import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.page.html',
  styleUrls: ['./view-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ViewFormPage implements OnInit {
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  data: any = {};
  img_ref_view_form: any = null;
  map_view_form: any;
  LastMarker: any;
  email: any;
  id_form: any;
  username: any;

  constructor(public NavCtrl: NavController, private route: ActivatedRoute) {
    addIcons({ arrowBack });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      console.log(params);
      this.id_form = params['id'] || null;
      this.data = JSON.parse(params['data']) || null;
      this.username = params['username'] || '';
    });
    this.img_ref_view_form = this.Supabase.GetStorage(this.data.photo);

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
      center: [this.data.location.longitude, this.data.location.latitude],

      zoom: 15.15,
    });
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker()
      .setLngLat([this.data.location.longitude, this.data.location.latitude])
      .addTo(this.map_view_form);
  }
}
