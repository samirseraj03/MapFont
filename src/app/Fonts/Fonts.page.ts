import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonContent, IonButton, IonIcon, IonModal, IonFooter
} from '@ionic/angular/standalone';
import { NavController, ActionSheetController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../environments/environment';
import GeolocationService from '../Globals/Geolocation';
import DatabaseService from '../Types/SupabaseService';
import { Services } from '../Services/services.service';
import { OsmService } from '../Services/osm.service';

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
  isOSMBlocked: boolean = false;
  isFetchingOSM: boolean = false; // 👈 NUEVO: Evita que se solapen las peticiones

  // Variable para el freno de mano del mapa
  moveTimeout: any;

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
    private Supabase: DatabaseService,
    private osmService: OsmService
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
    await this.getWatersourcesToMap();

    this.GeolocationService.getGeolocation().then(() => {
      if (this.map && this.GeolocationService.longitude) {
        this.map.flyTo({
          center: [this.GeolocationService.longitude, this.GeolocationService.latitude],
          zoom: 15.15,
          essential: true
        });
        this.geolocate.trigger();
      }
    }).catch(err => {
      console.log("Error de GPS, usando coordenadas por defecto", err);
    });
  }

  getMap() {
    if (this.map) return;

    const startLng = this.GeolocationService.longitude || -3.703790;
    const startLat = this.GeolocationService.latitude || 40.416775;

    this.map = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'Mapa-de-box',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [startLng, startLat],
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
        setTimeout(() => {
          if (this.map) this.map.resize();
        }, 300);

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

        this.map.on('click', 'unclustered-point', async (e: any) => {
          const feature = e.features[0];
          const props = feature.properties;

          this.selectedFountain = {
            ...props,
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
            photo_url: props.photo ? this.Supabase.GetStorage(props.photo) : 'assets/icon/agua-potable.png'
          };

          this.isSaved = false;
          this.savedRecordId = null;
          this.isModalOpen = true;
          this.cdr.detectChanges();

          const userId = await this.GeolocationService.getUserID();
          if (userId) {
            const data = await this.Supabase.getSavedFoutainWithUser(userId, props.id) as any[];
            if (data && data.length > 0) {
              this.isSaved = true;
              this.savedRecordId = data[0].id;
            }
            this.cdr.detectChanges();
          }
        });

        this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
        this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });

        // ESCUCHADOR CON FRENO DE MANO (1 SEGUNDO DE ESPERA)
        this.map.on('moveend', () => {
          clearTimeout(this.moveTimeout);
          this.moveTimeout = setTimeout(() => {
            this.checkAndFetchOSM();
          }, 1000);
        });

      });
    } catch (error) {
      console.log(error);
    }
  }

  // EL CEREBRO DEFINITIVO
  async checkAndFetchOSM() {
    if (!this.map || !this.geojson) return;

    // 🚨 1. FRENO DOBLE: Si estamos castigados, o si ya está buscando, abortamos.
    if (this.isOSMBlocked || this.isFetchingOSM) {
      return;
    }

    if (this.map.getZoom() < 14.5) return;

    // Ponemos el candado para que no entren más peticiones si movemos el mapa rápido
    this.isFetchingOSM = true;

    try {
      const center = this.map.getCenter();

      // 🚨 2. VOLVEMOS A 2 DECIMALES (Cuadrículas de 1.1km que encajan con tu red de 500m)
      const latZone = center.lat.toFixed(2);
      const lngZone = center.lng.toFixed(2);
      const zoneId = `${latZone}_${lngZone}`;

      // 🚨 3. EL GUARDIA DE SEGURIDAD
      const alreadyScanned = await this.Supabase.isZoneScanned(zoneId);
      if (alreadyScanned) {
        console.log(`Zona ${zoneId} ya visitada hace poco. Saltando...`);
        return;
      }

      // Si es nueva, la anotamos
      await this.Supabase.markZoneAsScanned(zoneId);

      console.log(`¡Zona ${zoneId} reservada con éxito! Buscando en OSM (Radio 500m)...`);

      const offset = 0.0045; // 500 metros
      const south = center.lat - offset;
      const north = center.lat + offset;
      const west = center.lng - offset;
      const east = center.lng + offset;

      const rawOsmFountains = await this.osmService.fetchFountainsInBounds(south, west, north, east);

      if (rawOsmFountains === null) {
        console.log("OSM falló (Posible Bloqueo 429). Liberando zona y aplicando castigo de 1 minuto.");
        await this.Supabase.unclaimZone(zoneId);

        this.isOSMBlocked = true;
        setTimeout(() => {
          this.isOSMBlocked = false;
          console.log("✅ Castigo levantado. OSM vuelve a estar disponible.");
        }, 60000);
        return;
      }

      if (rawOsmFountains.length === 0) {
        console.log("La consulta fue un éxito, pero no hay fuentes en esta zona (Desierto).");
        return;
      }

      if (rawOsmFountains.length > 0) {
        const uniqueFountains = rawOsmFountains.filter((osmFountain: any) => {
          const isDuplicate = this.geojson.features.some((localFeature: any) => {
            const localLng = localFeature.geometry.coordinates[0];
            const localLat = localFeature.geometry.coordinates[1];

            const diffLat = Math.abs(localLat - osmFountain.location.latitude);
            const diffLng = Math.abs(localLng - osmFountain.location.longitude);

            return diffLat < 0.00002 && diffLng < 0.00002; // Radar a 2 metros
          });
          return !isDuplicate;
        });

        if (uniqueFountains.length > 0) {
          console.log(`Guardando ${uniqueFountains.length} fuentes únicas nuevas...`);

          const insertedFountains = await this.Supabase.insertMultipleForms(uniqueFountains);

          if (!insertedFountains) {
            console.log("Supabase falló al insertar. Liberando zona...");
            await this.Supabase.unclaimZone(zoneId);
            return;
          }

          const newFeatures = insertedFountains.map((element: any) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [element.location.longitude, element.location.latitude] },
            properties: {
              id: element.id,
              name: element.name,
              available: element.available,
              description: element.description,
              ispotable: element.ispotable,
              photo: element.photo,
              address: element.address,
            }
          }));

          const updatedFeatures = [...this.geojson.features, ...newFeatures];

          this.geojson = {
            type: 'FeatureCollection',
            features: updatedFeatures
          };

          if (this.map.getSource('watersources')) {
            (this.map.getSource('watersources') as mapboxgl.GeoJSONSource).setData(this.geojson);
          }

          this.setStorageCache(this.geojson);
        } else {
          console.log("Todas las fuentes de OSM ya estaban registradas (El radar funcionó).");
        }
      }
    } finally {
      // 🚨 IMPORTANTE: Esto se ejecuta SIEMPRE al final, haya éxito o haya error.
      // Quita el candado para permitir que la app escanee la siguiente zona.
      this.isFetchingOSM = false;
    }
  }

  closeModal() {
    (document.activeElement as HTMLElement)?.blur();
    this.isModalOpen = false;
  }

  async NavigateToFountain() {
    if (!this.selectedFountain) return;
    (document.activeElement as HTMLElement)?.blur();

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
    (document.activeElement as HTMLElement)?.blur();

    const userId = await this.GeolocationService.getUserID();

    if (!userId) {
      this.navCtrl.navigateForward('/tabs/login');
      this.closeModal();
      return;
    }

    if (this.isSaved && this.savedRecordId) {
      try {
        await this.Supabase.deleteSavedFoutain(this.savedRecordId);
        this.isSaved = false;
        this.savedRecordId = null;
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    } else {
      try {
        const result: any = await this.Supabase.insertSavedFoutainWithUser(userId, this.selectedFountain.id);
        this.isSaved = true;

        if (result && result.id) {
          this.savedRecordId = result.id;
        } else {
          const data = await this.Supabase.getSavedFoutainWithUser(userId, this.selectedFountain.id) as any[];
          if (data && data.length > 0) {
            this.savedRecordId = data[0].id;
          }
        }
      } catch (error) {
        console.error("Error al guardar", error);
      }
    }
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

  // RECARGA SEGURA (No borra caché a lo bruto, no cierra sesión)
  async UpdateMap() {
    try {
      console.log("Actualizando mapa manualmente...");

      let watersources = await this.Supabase.getWaterSources();

      if (Array.isArray(watersources) && watersources.length > 0) {

        const freshGeojson = { type: 'FeatureCollection', features: [] as any[] };

        watersources.forEach((element) => {
          freshGeojson.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [element.location.longitude, element.location.latitude] },
            properties: {
              id: element.id, name: element.name, available: element.available,
              description: element.description, ispotable: element.ispotable,
              photo: element.photo, address: element.address,
            },
          });
        });

        this.geojson = freshGeojson;

        if (this.map && this.map.getSource('watersources')) {
          (this.map.getSource('watersources') as mapboxgl.GeoJSONSource).setData(this.geojson);
        }

        await this.setStorageCache(this.geojson);

        this.UpdatedMap = true;
        console.log("¡Mapa actualizado con éxito!");
      }
    } catch (error) {
      console.error("Error al actualizar el mapa", error);
    }
  }

  async getStorageCache() {
    const ret = await Preferences.get({ key: 'geojson' });
    return ret.value ? JSON.parse(ret.value) : null;
  }

  async setStorageCache(geojson: any) {
    await Preferences.set({ key: 'geojson', value: JSON.stringify(geojson) });
  }
}