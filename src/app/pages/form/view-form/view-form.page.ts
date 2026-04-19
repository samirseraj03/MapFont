import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';

// Ionic Standalone
import {
  IonHeader, IonToolbar, IonButtons, IonTitle, IonIcon,
  IonButton, IonContent, IonFooter
} from '@ionic/angular/standalone';

import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import GeolocationService from '../../../core/utils/Geolocation';
import DatabaseService from '../../../core/data/SupabaseService';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline, personOutline, calendarOutline, locationOutline,
  water, checkmarkCircleOutline, closeCircleOutline, navigateOutline, bookmarkOutline, pin
} from 'ionicons/icons';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-view-form',
  templateUrl: './view-form.page.html',
  styleUrls: ['./view-form.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonButton, IonIcon, IonTitle, IonButtons, IonToolbar, IonHeader, IonFooter,
    CommonModule, FormsModule, TranslateModule
  ],
})
export class ViewFormPage implements OnInit {

  data: any;
  img_ref_view_form: any = null;
  map_view_form: any;
  id_form: any;
  username: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private ChangeDetectorRef: ChangeDetectorRef,
    private actionSheetCtrl: ActionSheetController,
    public GeolocationService: GeolocationService,
    private Supabase: DatabaseService
  ) {
    addIcons({
      arrowBackOutline, personOutline, calendarOutline, locationOutline,
      water, checkmarkCircleOutline, closeCircleOutline, navigateOutline, bookmarkOutline, pin
    });
  }

  async ngOnInit() {
    const params = await firstValueFrom(this.route.queryParams);

    this.id_form = params['id'] || null;
    this.data = JSON.parse(params['data']) || null;
    this.username = params['username'] || '';

    if (this.data && this.data.photo) {
      this.img_ref_view_form = this.Supabase.GetStorage(this.data.photo);
    }

    this.ChangeDetectorRef.detectChanges();
  }

  // ionViewDidEnter asegura que el HTML ya está pintado antes de cargar Mapbox
  ionViewDidEnter() {
    if (this.data && this.data.location) {
      this.getMap(this.data);
    }
  }

  getMap(data: any) {
    if (this.map_view_form) return;

    this.map_view_form = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'mapViewForm',
      style: 'mapbox://styles/mapbox/outdoors-v12', // Estilo 'outdoors' queda mejor para fuentes
      center: [data.location.longitude, data.location.latitude],
      zoom: 14,
      interactive: false // Hacemos que sea solo una vista previa no arrastrable
    });

    // Añadir el marcador de la fuente
    new mapboxgl.Marker({ color: '#0084ff' })
      .setLngLat([data.location.longitude, data.location.latitude])
      .addTo(this.map_view_form);

    // Ocultar logo de mapbox para un diseño más limpio
    setTimeout(() => {
      const mapboxControls = document.querySelectorAll('.mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right');
      mapboxControls.forEach(el => (el as HTMLElement).style.display = 'none');
    }, 300);
  }

  // --- ACCIONES INFERIORES ---

  async NavigateTo() {
    if (!this.data || !this.data.location) return;

    const lat = this.data.location.latitude;
    const lng = this.data.location.longitude;

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Navegar con',
      buttons: [
        { text: 'Google Maps', handler: async () => { await Browser.open({ url: await this.GeolocationService.generateGoogleMapsLink(lat, lng) as string }); } },
        { text: 'Apple Maps', handler: async () => { await Browser.open({ url: await this.GeolocationService.generateAppleMapsLink(lat, lng) as string }); } },
        { text: 'Waze', handler: async () => { await Browser.open({ url: await this.GeolocationService.generateWazeLink(lat, lng) as string }); } },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async SaveFountain() {
    if (!this.id_form) return;

    const userId = await this.GeolocationService.getUserID();

    if (!userId) {
      // Redirigir al login si no hay usuario
      this.NavCtrl.navigateForward('/tabs/login');
      return;
    }

    const savedData = await this.Supabase.getSavedFoutainWithUser(userId, this.id_form) as any[];

    if (savedData.length === 0) {
      await this.Supabase.insertSavedFoutainWithUser(userId, this.id_form);
      await Dialog.alert({ title: '¡Guardado!', message: 'La fuente se ha añadido a tus favoritos.' });
    } else {
      await Dialog.alert({ title: 'Aviso', message: 'Ya tienes esta fuente en tus favoritos.' });
    }
  }
}