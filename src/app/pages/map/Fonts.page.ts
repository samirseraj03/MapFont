import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonContent, IonButton, IonIcon, IonModal, IonFooter, IonSpinner
} from '@ionic/angular/standalone';
import { NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { StorageService } from '../../core/services/storage.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../../environments/environment';
import GeolocationService from '../../core/utils/Geolocation';
import { WaterSourceFacade } from '../../core/facades/water-source.facade';
import { Services } from '../../core/services/services.service';
import { OsmService } from '../../core/services/osm.service';

import { addIcons } from 'ionicons';
import { waterOutline, refreshOutline, locationOutline, navigateOutline, bookmarkOutline, bookmark, water, checkmark, chevronForward } from 'ionicons/icons';

/**
 * @description
 * Vista central cartográfica core de la aplicación. Renderiza MapBox y clusteriza masivamente pines cartográficos de manantiales descargados a través de WaterSourceFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-fonts',
  templateUrl: 'Fonts.page.html',
  styleUrls: ['Fonts.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonButton, IonIcon, IonModal, IonFooter, IonSpinner, CommonModule, TranslateModule
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
  isFetchingOSM: boolean = false;
  moveTimeout: any;
  isMapMoving: boolean = false;

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
    private waterSourceFacade: WaterSourceFacade,
    private osmService: OsmService,
    private toastCtrl: ToastController,
    public GeolocationService: GeolocationService,
    private storage: StorageService
  ) {
    addIcons({ waterOutline, refreshOutline, locationOutline, navigateOutline, bookmarkOutline, bookmark, water, checkmark, chevronForward });
  }

  // 🚀 Función Helper para los mensajes Toast
  async showFeedback(message: string, color: 'success' | 'warning' | 'danger' | 'dark' = 'dark') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom',
      color: color,
      cssClass: 'custom-map-toast'
    });
    await toast.present();
  }

  ionViewDidEnter() {
    this.insertMap();
  }

  async insertMap() {
    this.UpdatedMap = await this.waterSourceFacade.checkLatestUpdateFountains();

    if (this.map) {
      const container = this.map.getContainer();
      if (container && document.body.contains(container)) {
        this.map.resize();

        if (!this.UpdatedMap) {
          await this.UpdateMap();
        }
        return;
      } else {
        this.map.remove();
        this.map = null;
      }
    }

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

      // Si no existe el caché o si hay actualización en BD, descargamos datos frescos
      if (!this.geojson || !this.UpdatedMap) {
        await this.UpdateMap();
      }

      this.getMap();

      this.map.on('load', () => {
        setTimeout(() => {
          if (this.map) this.map.resize();
        }, 300);

        this.map.addSource('watersources', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: this.geojson?.features || [] },
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
            photo_url: props.photo ? this.waterSourceFacade.getPhotoUrl(props.photo) : 'assets/icon/agua-potable.png'
          };

          this.isSaved = false;
          this.savedRecordId = null;
          this.isModalOpen = true;
          this.cdr.detectChanges();

          const data = await this.waterSourceFacade.getSavedFountainWithUser(props.id) as any[];
          if (data && data.length > 0) {
            this.isSaved = true;
            this.savedRecordId = data[0].id;
          }
          this.cdr.detectChanges();
        });

        this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
        this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
        this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });

        this.map.on('movestart', () => {
          this.isMapMoving = true;
          clearTimeout(this.moveTimeout);
        });

        this.map.on('zoomstart', () => {
          this.isMapMoving = true;
          clearTimeout(this.moveTimeout);
        });

        this.map.on('moveend', () => {
          this.isMapMoving = false;
          clearTimeout(this.moveTimeout);

          if (this.map.getZoom() < 13) return;

          this.moveTimeout = setTimeout(() => {
            if (!this.isMapMoving && !this.isFetchingOSM) {
              this.checkAndFetchOSM();
            }
          }, 1500);
        });

      });
    } catch (error) {
      console.log(error);
    }
  }

  async checkAndFetchOSM() {
    if (!this.map || !this.geojson) return;

    if (this.isOSMBlocked || this.isFetchingOSM) return;
    if (this.map.getZoom() < 13) return;

    this.isFetchingOSM = true;

    try {
      const center = this.map.getCenter();

      const latZone = center.lat.toFixed(2);
      const lngZone = center.lng.toFixed(2);
      const zoneId = `${latZone}_${lngZone}`;

      const alreadyScanned = await this.waterSourceFacade.isZoneScanned(zoneId);
      if (alreadyScanned) {
        return;
      }

      await this.waterSourceFacade.markZoneAsScanned(zoneId);

      const offset = 0.01;
      const south = center.lat - offset;
      const north = center.lat + offset;
      const west = center.lng - offset;
      const east = center.lng + offset;

      const rawOsmFountains = await this.osmService.fetchFountainsInBounds(south, west, north, east);

      if (rawOsmFountains === null) {
        await this.waterSourceFacade.unclaimZone(zoneId);
        this.isOSMBlocked = true;

        this.showFeedback('Servidores de mapa ocupados. Pausa temporal.', 'danger');

        setTimeout(() => {
          this.isOSMBlocked = false;
        }, 10000);
        return;
      }

      if (rawOsmFountains.length === 0) {
        this.showFeedback('No se encontraron fuentes nuevas en esta zona', 'warning');
        return;
      }

      const uniqueFountains = rawOsmFountains.filter((osmFountain: any) => {
        const isDuplicate = this.geojson.features.some((localFeature: any) => {
          const localLng = localFeature.geometry.coordinates[0];
          const localLat = localFeature.geometry.coordinates[1];

          const diffLat = Math.abs(localLat - osmFountain.location.latitude);
          const diffLng = Math.abs(localLng - osmFountain.location.longitude);

          return diffLat < 0.00002 && diffLng < 0.00002;
        });
        return !isDuplicate;
      });

      if (uniqueFountains.length > 0) {
        const insertedFountains = await this.waterSourceFacade.insertMultipleForms(uniqueFountains);

        if (!insertedFountains) {
          await this.waterSourceFacade.unclaimZone(zoneId);
          this.showFeedback('Error al guardar las fuentes encontradas', 'danger');
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

        this.geojson = {
          type: 'FeatureCollection',
          features: [...this.geojson.features, ...newFeatures]
        };

        if (this.map.getSource('watersources')) {
          (this.map.getSource('watersources') as mapboxgl.GeoJSONSource).setData(this.geojson);
        }

        this.setStorageCache(this.geojson);
        this.showFeedback(`¡${uniqueFountains.length} fuentes nuevas añadidas!`, 'success');

      } else {
        this.showFeedback('Las fuentes de esta zona ya están en tu mapa', 'dark');
      }

    } catch (error) {
      console.error("Error inesperado al buscar fuentes en OSM:", error);
      this.showFeedback('Ocurrió un error inesperado al buscar', 'danger');
    } finally {
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

    const userId = await this.waterSourceFacade.getCurrentUserId();

    if (!userId) {
      this.navCtrl.navigateForward('/tabs/login');
      this.closeModal();
      return;
    }

    try {
      const parsedId = this.savedRecordId ? parseInt(this.savedRecordId) : null;
      const result = await this.waterSourceFacade.toggleSavedFountain(this.selectedFountain.id, this.isSaved, parsedId);
      this.isSaved = result.isSaved;
      this.savedRecordId = result.savedRecordId;
    } catch (error) {
      console.error("Error al guardar/eliminar fuente:", error);
    }
    this.cdr.detectChanges();
  }

  async UpdateMap() {
    try {
      console.log("Actualizando/Descargando mapa desde Supabase...");
      let watersources = await this.waterSourceFacade.loadAllWaterSources();

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
        console.log("¡Mapa guardado y actualizado en Filesystem con éxito!");
      }
    } catch (error) {
      console.error("Error al actualizar el mapa", error);
    }
  }

  async getStorageCache() {
    return await this.storage.get('geojson');
  }

  async setStorageCache(geojson: any) {
    await this.storage.set('geojson', geojson);
  }
}