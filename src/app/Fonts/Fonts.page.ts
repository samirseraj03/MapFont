import { Component, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonButtons,
  IonModal,
  IonIcon
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../environments/environment';
import GeolocationService from '../Globals/Geolocation';
import DatabaseService from '../Types/SupabaseService';
import {
  LoadingController,
  AlertController,
  NavController,
  ActionSheetController,
} from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { setMapboxAccessToken } from './../../environments/environment';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
import { Preferences } from '@capacitor/preferences';
import { Services } from '../services.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { heart, logoApple, settingsSharp, star, refreshCircle } from 'ionicons/icons';
import { TranslateService, TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-fonts',
  templateUrl: 'Fonts.page.html',
  styleUrls: ['Fonts.page.scss'],
  standalone: true,
  imports: [
    IonModal,
    IonButtons,
    IonItem,
    IonInput,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
    CommonModule,
    IonIcon,
    TranslateModule
  ],
})
export class fontsPage {
  @ViewChild(IonModal) modal: IonModal | undefined;

  constructor(private navCtrl: NavController, public Service: Services, public actionSheetCtrl: ActionSheetController, public translate: TranslateService) {
    addIcons({ heart, settingsSharp, star, refreshCircle });
  }
  map: any;
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();
  marker: any;
  // se compruba el mapa si esta actualizada o no ..
  // por defecto esta en updated para no mostrar el boton
  UpdatedMap: boolean = true;
  // geojson global
  geojson: any

  // añadir control al mapa , la localizacion actulizada del Gps
  geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true
  });

  ionViewWillEnter() {
    this.insertMap();
  }

  // Removed redundant ionViewWillLeave to keep map instance alive if possible
  // If memory is an issue, we can destroy it, but for performance, keeping it is better in Tabs.

  async insertMap() {
    // Check if map is initialized
    if (this.map) {
      const container = this.map.getContainer();
      // Check if the map's container is still part of the document
      // If Ionic navigated away and back, the old container might be detached
      if (container && document.body.contains(container)) {
        this.map.resize();
        await this.checkAndPerformUpdate();
        return;
      } else {
        // Map instance exists but container is invalid/detached. 
        // Cleanup and re-init.
        this.map.remove();
        this.map = null;
      }
    }

    // Si no existe, inicializamos
    this.UpdatedMap = await this.Service.CheckLatestUpdateFontains();
    this.cargarScript();
    await this.GeolocationService.getGeolocation();
    this.getWatersourcesToMap();
  }

  async checkAndPerformUpdate() {
    // Check background update
    const isUpdated = await this.Service.CheckLatestUpdateFontains();
    this.UpdatedMap = isUpdated;
    // Si no estaba actualizado (false), el template mostrará el botón de actualizar
    // No forzamos actualización automática para no bloquear UI, el usuario lo hará manual o
    // podemos hacerlo silencioso:
    if (!isUpdated) {
      // Opcional: Auto-update silencioso
      // console.log("Silent update available");
    }
  }

  getMap() {
    if (this.map) return; // Prevent duplicate initialization

    this.map = new mapboxgl.Map({
      accessToken: environment.accessToken,
      container: 'Mapa-de-box',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ],
      zoom: 15.15,
    });

    this.map.addControl(this.geolocate);
    this.HideMapboxBottomRight();
  }

  HideMapboxBottomRight() {
    // Es posible que los elementos no existan aún si el mapa no cargó, intentar con timeout o en load
    setTimeout(() => {
      let HideMapboxBottomRight = document.getElementsByClassName('mapboxgl-ctrl-bottom-right');
      for (const element of Array.from(HideMapboxBottomRight)) {
        (element as HTMLElement).style.display = 'none';
      }
    }, 500);
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

        // Agregamos la fuente con TODOS los datos. 
        // Mapbox maneja perfectamente 12k puntos con clustering.
        // NO filtramos manualmente en moveend.
        this.map.addSource('watersources', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.geojson.features, // Carga todo de una vez
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 80,
        });

        // Capas (Layers) - Sin cambios significativos, solo eliminamos el filtro manual de moveend
        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'watersources',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100, //blue
              '#f1f075',
              750, // yellow
              '#f28cb1', // pink
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40,
            ],
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

        // Eventos de Click (Cluster expansión)
        this.map.on('click', 'clusters', (e: any) => {
          const features = this.map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId = features[0].properties.cluster_id;
          this.map
            .getSource('watersources')
            .getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
              if (err) return;
              this.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        this.map.on('click', 'unclustered-point', async (e: any) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const feature = e.features[0];
          const properties = feature.properties;

          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }
          let popup: any;
          popup = await this.UploadPopup(
            properties.id,
            properties.name,
            properties.available,
            properties.description,
            properties.ispotable,
            coordinates[1], // latitud
            coordinates[0], // longitud
            properties.photo,
            properties.address,
            coordinates
          );

          // esperamos que se crea el doom para cambiar los estilos,
          // no lo cambiamos antes porque queremos cambiar el cierre y el color.

          const popupContent = popup.getElement(); // Obtener el elemento del contenido del popup

          popup.getElement().style.color = '#000000'; // Set text color to black for text popup

          const closeButton = popupContent.querySelector(
            '.mapboxgl-popup-close-button'
          ); // Obtener el botón de cierre
          // Aplicar estilos al botón de cierre
          if (closeButton instanceof HTMLElement) {
            closeButton.style.color = '#ff0000'; // Cambiar color del texto del botón
            closeButton.style.background = '#ffffff'; // Cambiar color de fondo del botón
            closeButton.style.width = '20px';
            // Aquí puedes agregar más estilos según tus necesidades
          }
        });

        this.map.on('mouseenter', 'clusters', () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', 'clusters', () => {
          this.map.getCanvas().style.cursor = '';
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  async UploadPopup(
    id: any,
    name: any,
    available: any,
    description: string,
    ispotable: any,
    lat: any,
    lng: any,
    photo: string,
    address: string,
    coordinates: any
  ) {

    // definimos la classe de foto si existe o no
    let class_photo = photo
      ? "w-100" : "w-50";

    // buscamos si hay foto o no
    let photo_url = photo
      ? this.Supabase.GetStorage(photo)
      : '../assets/icon/agua-potable.png';

    // miramos si esta disponible la fuente:
    const availableText = available ? this.translate.instant('available') : this.translate.instant('not_available');
    const isPotableText = ispotable ? this.translate.instant('potable') : this.translate.instant('not_potable');

    // create the popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      className: 'MarkersMapBox',
    })
      .setLngLat(coordinates)
      .setHTML(
        `
      <p class="mt-3 mb-0"><strong>${this.translate.instant('font_name')}</strong> ${name}</p>
      <p class="mb-0" ><strong>${this.translate.instant('font_info')}</strong></p>
      <ul>
          <li>${availableText}</li>
          <li>${isPotableText}</li>
          <li>${description}</li>
      </ul>
      <ion-button id="open-modal" expand="block">${this.translate.instant('open')}</ion-button>

      <ion-modal trigger="open-modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
          <ion-button onclick="cancel()">${this.translate.instant('cancel')}</ion-button>
          </ion-buttons>
          <ion-title>${name}</ion-title>
          <ion-buttons slot="end">
            <ion-button onclick="confirm()" strong="true">${this.translate.instant('confirm')}</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
    


      <div class=" d-flex justify-content-center">
        <img class="${class_photo}" src="${photo_url}" alt="">
      </div>

        <div class="mt-3"> 
          <ion-item>
  
            <ion-text class="mt-3" color="primary">
              <h1>${name}</h1>
              <p class="ms-3">  ${description} </p>
              <p class="ms-3">  ${address} </p>
  
              <p class="ms-3">  ${availableText} </p>
              <p class="ms-3">  ${isPotableText} </p>
            </ion-text>
          </ion-item>
          <div class="d-block mt-2"> 
            <ion-button class="w-100 mt-2" onclick="OnNavigate(${lng} , ${lat})">${this.translate.instant('navigate')}</ion-button>
            <ion-button class="w-100 mt-2" onclick="OnSaveFountain(${id})">${this.translate.instant('save_font')}</ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  `
      )
      .addTo(this.map);
    return popup;
  }

  // chkeamos si hay cahche y devolcemos el geojson
  async setStorageIfnotExsit(geojson: any) {
    // Llama a Supabase para obtener los datos de las fuentes de agua
    let watersources = await this.Supabase.getWaterSources();

    if (Array.isArray(watersources) && watersources.length > 0) {
      // Crea un objeto GeoJSON
      geojson = {
        type: 'FeatureCollection',
        features: [],
      };
      // Itera sobre los datos de las fuentes de agua y añade cada punto al GeoJSON
      watersources.forEach((element) => {
        const feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              element.location.longitude,
              element.location.latitude,
            ],
          },
          properties: {
            id: element.id,
            name: element.name,
            available: element.available,
            description: element.description,
            ispotable: element.ispotable,
            photo: element.photo,
            address: element.address,
          },
        };
        geojson.features.push(feature);
      });

      this.setStorageCache(geojson);
    }
    return geojson;
  }

  // la base de datos tiene un trigger para hacer actulizacion automaticamente a la hora de cambiar un dato al mapa
  // hacer el update al mapa cuando haya nueva actulizacion. 
  // comapramos el cache con una solicitud de base de datos , si los 2 coindicen , es false por lo contrario se actauliza en la funcion de this.Service.CheckLatestUpdateFontains();
  async UpdateMap() {
    // quitamos el antiguo cache geojson
    await this.Service.removeStorage('geojson')
    // quitamos el cache dategeojson para el date
    await this.Service.removeStorage('dateGeoJson')

    // Obtenemos nuevos datos
    this.geojson = await this.setStorageIfnotExsit(null); // Force fetch

    // Actualizamos la fuente del mapa en lugar de destruirlo
    if (this.map && this.map.getSource('watersources')) {
      (this.map.getSource('watersources') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: this.geojson.features
      });
    } else {
      // Fallback si algo falló
      this.getWatersourcesToMap();
    }

    this.UpdatedMap = true;
  }


  // cargamos los scripts a los marcadores
  cargarScript(): void {
    document.addEventListener('DOMContentLoaded', () => {
      var modal = document.querySelector('ion-modal');
    });

    (window as any).OnNavigate = async (lng: any, lat: any) => {

      const actionSheet = await this.actionSheetCtrl.create({
        header: this.translate.instant('navigate_with'),
        buttons: [
          {
            text: this.translate.instant('google_maps'),
            handler: async () => {
              let link = await this.GeolocationService.generateGoogleMapsLink(lat, lng);
              await Browser.open({ url: link });
            }
          },
          {
            text: this.translate.instant('apple_maps'),
            handler: async () => {
              let link = await this.GeolocationService.generateAppleMapsLink(lat, lng);
              await Browser.open({ url: link });
            }
          },
          {
            text: this.translate.instant('waze'),
            handler: async () => {
              let link = await this.GeolocationService.generateWazeLink(lat, lng);
              await Browser.open({ url: link });
            }
          },
          {
            text: this.translate.instant('cancel'),
            role: 'cancel',
            data: {
              action: 'cancel',
            },
          },
        ],
      });

      await actionSheet.present();
    };

    (window as any).OnSaveFountain = async (id: any) => {
      let data: any[] = [];
      data = (await this.Supabase.getSavedFoutainWithUser(
        await this.GeolocationService.getUserID(),
        id
      )) as any;
      if (data.length === 0) {
        await this.Supabase.insertSavedFoutainWithUser(
          await this.GeolocationService.getUserID(),
          id
        );

        await Dialog.alert({
          title: this.translate.instant('fountain_saved'),
          message: this.translate.instant('fountain_has_been_saved'),
        });
      } else {
        await Dialog.alert({
          title: this.translate.instant('fountain_not_saved'),
          message: this.translate.instant('fountain_already_saved'),
        });
      }
    };

    // Definir la función cancel() en el ámbito global
    (window as any).cancel = () => {
      var modal = document.querySelector('ion-modal');
      if (modal) modal.dismiss(null, 'cancel');
    };

    // Definir la función confirm() en el ámbito global
    (window as any).confirm = () => {
      var modal = document.querySelector('ion-modal');
      if (modal) modal.dismiss(null, 'cancel');
    };
  }

  message: any;
  onWillDismiss(event: any) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  async getStorageCache() {
    const ret = await Preferences.get({ key: 'geojson' });
    if (ret.value === null) {
      return null;
    } else {
      return JSON.parse(ret.value);
    }
  }

  async setStorageCache(geojson: any) {
    await Preferences.set({ key: 'geojson', value: JSON.stringify(geojson) });
  }
}
