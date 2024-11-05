import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import * as mapboxgl from 'mapbox-gl';
import {
  environment,
  setMapboxAccessToken,
} from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonIcon,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.page.html',
  styleUrls: ['./view-form.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonButton,
    IonIcon,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
})
export class ViewFormPage implements OnInit {
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  data: any ;
  img_ref_view_form: any = null;
  map_view_form: any;
  LastMarker: any;
  email: any;
  id_form: any;
  username: any;
  longitude : any
  latitude : any

  constructor(public NavCtrl: NavController, private route: ActivatedRoute , private ChangeDetectorRef : ChangeDetectorRef) {
    addIcons({ arrowBack });
  }

  async ngOnInit() {
    // Usamos pipe, take(1) y toPromise() para obtener el primer valor emitido por el observable y desuscribirnos automáticamente
    const params = await firstValueFrom(this.route.queryParams);
  
    // Extraemos los valores de los parámetros
    this.id_form = params['id'] || null;
    this.data = JSON.parse(params['data']) || null;
    this.username = params['username'] || '';

    // Utilizamos this.data directamente sin necesidad de almacenar el resultado de la suscripción
    this.img_ref_view_form = this.Supabase.GetStorage(this.data.photo);
  
    console.log(this.img_ref_view_form)

    // desplegamos el mapa de mapBox
    this.getMap(this.data);

    this.ChangeDetectorRef.detectChanges()
  }
  

  getMap(data : any) {
    // desplegar el map
    this.map_view_form = new mapboxgl.Map({
      // importamos el accessTokenMapbox para desplegar el mapa
      accessToken: environment.accessToken,
      container: 'mapViewForm',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [data.location.longitude, data.location.latitude],

      zoom: 15.15,
    });
    // añadir el marcador del usuario
    this.LastMarker = new mapboxgl.Marker()
      .setLngLat([data.location.longitude, data.location.latitude])
      .addTo(this.map_view_form);
  }
}
