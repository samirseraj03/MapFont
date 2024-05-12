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
} from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { setMapboxAccessToken } from './../../environments/environment';
import { Browser } from '@capacitor/browser';
import { Dialog } from '@capacitor/dialog';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-fonts',
  templateUrl: 'fonts.page.html',
  styleUrls: ['fonts.page.scss'],
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
  ],
})
export class fontsPage {
  @ViewChild(IonModal) modal: IonModal | undefined;

  constructor(private navCtrl: NavController) {}
  map: any;
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();
  marker: any;

  async ionViewWillEnter() {
    this.cargarScript();
    // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
    await this.GeolocationService.getGeolocation();
    // desplegamos el mapa de mapBox
    this.getMap();
    // obtenemos los fountains
    this.getWatersourcesToMap();
  }

  getMap() {
    // desplegar el map
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
    // añadir el marcador del usuario
    new mapboxgl.Marker()
      .setLngLat([
        this.GeolocationService.longitude,
        this.GeolocationService.latitude,
      ])
      .addTo(this.map);
  }

  async getWatersourcesToMap() {
 

    try {
      let geojson = await this.getStorageCache();
      if (!geojson) {
        // ponemos el storage
        geojson = await this.setStorageIfnotExsit(geojson);
      }
      // Añade el GeoJSON al mapa de Mapbox
      this.map.on('load', () => {
        const center_init = this.map.getCenter();
        const zoom_init = this.map.getZoom();

        const filterFeatures = (feature: any) => {
          // Aquí definimos los criterios de filtrado
          // Filtramos las características que están dentro de un área específica alrededor del centro inicial
          // y tienen un zoom mayor o igual a 13
          return (
            this.map.getBounds().contains(feature.geometry.coordinates) &&
            zoom_init >= 9
          );
        };
        const filteredFeatures = geojson.features.filter(filterFeatures);
        // habilitamos el cluster y subimos el contendido
        this.map.addSource('watersources', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: filteredFeatures,
          },
          cluster: true, // Habilita el clustering
          clusterMaxZoom: 14, // Zoom máximo para agrupar
          clusterRadius: 15, // Radio del cluster
        });


        this.map.on('moveend', () => {
          const center = this.map.getCenter();
          const zoom = this.map.getZoom();
    
          // console.log(
          //   'Nueva ubicación después del zoom:',
          //   center,
          //   'Nivel de zoom:',
          //   zoom
          // );
    
          // Definir la función de filtrado
          const filterFeatures = (feature: any) => {
            // Aquí definimos los criterios de filtrado
            // Filtramos las características que están dentro de un área específica alrededor del centro actual
            // y tienen un zoom mayor o igual a 13
            return (
              this.map.getBounds().contains(feature.geometry.coordinates) &&
              zoom >= 9
            );
          };
    
          // Filtrar el GeoJSON según la función de filtrado
          const filteredFeatures = geojson.features.filter(filterFeatures);

          // Obtener la fuente existente
          const existingSource = this.map.getSource('watersources');

          // Verificar si la fuente ya existe y si hay capas asociadas a ella
          if (existingSource) {
              // Actualizar los datos de la fuente existente
              existingSource.setData({
                  type: 'FeatureCollection',
                  features: filteredFeatures
              });
          } else {
              console.error('La fuente "watersources" no existe en el mapa.');
          }
        });

        // Añade una capa de puntos para representar las fuentes de agua en el mapa
        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'watersources',
          filter: ['has', 'point_count'],
          paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1',
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
    // buscamos si hay foto o no
    let photo_url = photo
      ? this.Supabase.GetStorage(photo)
      : './assets/icon/agua-potable.png';

    // miramos si esta disponible la fuente:
    const availableText = available ? 'Disponible' : 'No disponible';
    const isPotableText = ispotable ? 'Potable' : 'No potable';
    // create the popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      className: 'MarkersMapBox',
    })
      .setLngLat(coordinates)
      .setHTML(
        `
      <p class="mt-3 mb-0"><strong>Nombre de la fuente:</strong> ${name}</p>
      <p class="mb-0" ><strong>Información de la fuente:</strong></p>
      <ul>
          <li>${availableText}</li>
          <li>${isPotableText}</li>
          <li>${description}</li>
      </ul>
      <ion-button id="open-modal" expand="block">Open</ion-button>

      <ion-modal trigger="open-modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
          <ion-button onclick="cancel()">Cancel</ion-button>
          </ion-buttons>
          <ion-title>${name}</ion-title>
          <ion-buttons slot="end">
            <ion-button onclick="confirm()" strong="true">Confirm</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
    
        <ion-img
          src="${photo_url}"
          alt="fuente de agua"
        ></ion-img>
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
            <ion-button class="w-100 mt-2" onclick="OnNavigate(${lng} , ${lat})">Navegar</ion-button>
            <ion-button class="w-100 mt-2" onclick="OnSaveFountain(${id})">Guardar fuente</ion-button>
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
    console.log(watersources);

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

  // cargamos los scripts a los marcadores
  cargarScript(): void {
    document.addEventListener('DOMContentLoaded', () => {
      var modal = document.querySelector('ion-modal');
    });

    (window as any).OnNavigate = async (lng: any, lat: any) => {
      let link = await this.GeolocationService.generateGoogleMapsLink(lat, lng);
      console.log();
      await Browser.open({ url: link });
    };

    (window as any).OnSaveFountain = async (id: any) => {
      let data: any[] = [];
      data = (await this.Supabase.getSavedFoutainWithUser(
        await this.GeolocationService.getUserID(),
        id
      )) as any;
      if (data.length === 0) {
        console.log(data);
        await this.Supabase.insertSavedFoutainWithUser(
          await this.GeolocationService.getUserID(),
          id
        );

        await Dialog.alert({
          title: 'fuente guardada',
          message: 'la fuente ha sido guardada',
        });
      } else {
        await Dialog.alert({
          title: 'fuente no guardada',
          message: 'la fuente ha sido guardada anteriormente',
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

// async getWatersourcesToMap() {
//   try {
//     // llamamos a supabase
//     let watersources = await this.Supabase.getWaterSources();
//     if (Array.isArray(watersources) && watersources.length > 0) {
//       // recorremos la lista que obtenemos de la base de datos
//       console.log(watersources.length)
//       watersources.forEach((element) => {
//         this.UploadPopup(
//           element.id ,
//           element.name,
//           element.available,
//           element.description,
//           element.ispotable,
//           element.location.latitude,
//           element.location.longitude,
//           element.photo ,
//           element.address
//         );
//       });
//     }

//   } catch (error) {
//     console.log(error);
//   }
// }
