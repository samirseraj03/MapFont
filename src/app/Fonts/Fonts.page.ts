import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonContent, IonButton, IonIcon, IonModal, IonFooter
} from '@ionic/angular/standalone';
import { NavController, ActionSheetController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
import { Preferences } from '@capacitor/preferences';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../environments/environment';
import GeolocationService from '../Globals/Geolocation';
import DatabaseService from '../Types/SupabaseService';
import { Services } from '../services.service';

import { addIcons } from 'ionicons';
import { waterOutline, refreshOutline, locationOutline, navigateOutline, bookmarkOutline, bookmark, water, checkmark, chevronForward } from 'ionicons/icons';

@Component({
  selector: 'app-fonts',
  templateUrl: 'Fonts.page.html',
  styleUrls: ['Fonts.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonButton, IonIcon, IonModal, IonFooter, CommonModule, TranslateModule
  ],
})
export class fontsPage {

  map: any;
  UpdatedMap: boolean = true;
  geojson: any;

  isSaved: boolean = false;
  savedRecordId: string | null = null;

  isModalOpen: boolean = false;
  selectedFountain: any = null;

  GeolocationService = new GeolocationService();

  geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  });

  constructor(
    private navCtrl: NavController,
    public Service: Services,
    public actionSheetCtrl: ActionSheetController,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private Supabase: DatabaseService
  ) {
    addIcons({ waterOutline, refreshOutline, locationOutline, navigateOutline, bookmarkOutline, bookmark, water, checkmark, chevronForward });
  }

  ionViewDidEnter() {
    this.insertMap();
  }

  async insertMap() {
    if (this.map) {
      const container = this.map.getContainer();
      if (container && document.body.contains(container)) {
        this.map.resize();
        this.UpdatedMap = await this.Service.CheckLatestUpdateFontains();
        return;
      } else {
        this.map.remove();
        this.map = null;
      }
    }

    this.UpdatedMap = await this.Service.CheckLatestUpdateFontains();
    await this.GeolocationService.getGeolocation();
    this.getWatersourcesToMap();
  }

  getMap() {
    if (this.map) return;

    this.map = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'Mapa-de-box',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [this.GeolocationService.longitude, this.GeolocationService.latitude],
      zoom: 15.15,
    });

    this.map.addControl(this.geolocate);
  }

  async getWatersourcesToMap() {
    try {
      this.geojson = await this.getStorageCache();

      if (!this.geojson) {
        this.geojson = await this.setStorageIfnotExsit(this.geojson);
        this.UpdatedMap = true;
      }

      this.getMap();

      this.map.on('load', () => {
        this.geolocate.trigger();

        this.map.addSource('watersources', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.geojson.features },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 80,
        });

        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'watersources',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
          },
        });

        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'watersources',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
        });

        this.map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'watersources',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 12,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
          },
        });

        this.map.on('click', 'clusters', (e: any) => {
          const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = features[0].properties.cluster_id;
          this.map.getSource('watersources').getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
            if (err) return;
            this.map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
          });
        });

        // --- SOLUCIÓN APLICADA AQUÍ: Todo se gestiona en el clic nativo ---
        this.map.on('click', 'unclustered-point', async (e: any) => {
          const feature = e.features[0];
          const props = feature.properties;

          this.selectedFountain = {
            ...props,
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            photo_url: props.photo ? this.Supabase.GetStorage(props.photo) : 'assets/icon/agua-potable.png'
          };

          // 1. Reseteamos TODAS las variables y abrimos el modal
          this.isSaved = false;
          this.savedRecordId = null;
          this.isModalOpen = true;
          this.cdr.detectChanges();

          // 2. Comprobamos la base de datos
          const userId = await this.GeolocationService.getUserID();
          if (userId) {
            const data = await this.Supabase.getSavedFoutainWithUser(userId, props.id) as any[];
            if (data && data.length > 0) {
              this.isSaved = true;
              this.savedRecordId = data[0].id; // AQUÍ ATRAPAMOS EL TICKET
            }
            this.cdr.detectChanges();
          }
        });

        this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
        this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });
      });
    } catch (error) {
      console.log(error);
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  async NavigateToFountain() {
    if (!this.selectedFountain) return;
    const { lat, lng } = this.selectedFountain;

    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('navigate_with'),
      buttons: [
        { text: this.translate.instant('google_maps'), handler: async () => { await Browser.open({ url: await this.GeolocationService.generateGoogleMapsLink(lat, lng) as string }); } },
        { text: this.translate.instant('apple_maps'), handler: async () => { await Browser.open({ url: await this.GeolocationService.generateAppleMapsLink(lat, lng) as string }); } },
        { text: this.translate.instant('waze'), handler: async () => { await Browser.open({ url: await this.GeolocationService.generateWazeLink(lat, lng) as string }); } },
        { text: this.translate.instant('cancel'), role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async SaveFountain() {
    if (!this.selectedFountain) return;
    const userId = await this.GeolocationService.getUserID();

    if (!userId) {
      this.navCtrl.navigateForward('/tabs/login');
      this.closeModal();
      return;
    }

    if (this.isSaved && this.savedRecordId) {
      // ELIMINAR TICKET
      try {
        await this.Supabase.deleteSavedFoutain(this.savedRecordId);
        this.isSaved = false;
        this.savedRecordId = null;
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    } else {
      // GUARDAR:
      try {
        // SOLUCIÓN AQUÍ: Añadimos ": any" a result
        const result: any = await this.Supabase.insertSavedFoutainWithUser(userId, this.selectedFountain.id);
        this.isSaved = true;

        // Ahora TypeScript sabe que puede haber un 'id' y ya no dará error
        if (result && result.id) {
          this.savedRecordId = result.id;
        } else {
          // Si Supabase no devolvió el objeto insertado, hacemos una consulta rápida para obtener el ID
          const data = await this.Supabase.getSavedFoutainWithUser(userId, this.selectedFountain.id) as any[];
          if (data && data.length > 0) {
            this.savedRecordId = data[0].id;
          }
        }
      } catch (error) {
        console.error("Error al guardar", error);
      }
    }

    // Actualizamos la UI
    this.cdr.detectChanges();
  }

  async setStorageIfnotExsit(geojson: any) {
    let watersources = await this.Supabase.getWaterSources();
    if (Array.isArray(watersources) && watersources.length > 0) {
      geojson = { type: 'FeatureCollection', features: [] };
      watersources.forEach((element) => {
        geojson.features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [element.location.longitude, element.location.latitude] },
          properties: {
            id: element.id, name: element.name, available: element.available,
            description: element.description, ispotable: element.ispotable,
            photo: element.photo, address: element.address,
          },
        });
      });
      this.setStorageCache(geojson);
    }
    return geojson;
  }

  async UpdateMap() {
    await this.Service.removeStorage('geojson');
    await this.Service.removeStorage('dateGeoJson');

    this.geojson = await this.setStorageIfnotExsit(null);

    if (this.map && this.map.getSource('watersources')) {
      (this.map.getSource('watersources') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: this.geojson.features
      });
    } else {
      this.getWatersourcesToMap();
    }
    this.UpdatedMap = true;
  }

  async getStorageCache() {
    const ret = await Preferences.get({ key: 'geojson' });
    return ret.value ? JSON.parse(ret.value) : null;
  }

  async setStorageCache(geojson: any) {
    await Preferences.set({ key: 'geojson', value: JSON.stringify(geojson) });
  }
}