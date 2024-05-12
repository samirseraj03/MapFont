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

  async getStorageCache() {
    const ret = await Preferences.get({ key: 'geojson' });
    if (ret.value === null) {
      return null;
    } else {
      return JSON.parse(ret.value);
    }
  }

  async setStorageCache(geojson : any) {
    await Preferences.set({ key: 'geojson', value: JSON.stringify(geojson) });
  }

  async getWatersourcesToMap() {
    try {
      let geojson = await this.getStorageCache();
      console.log(geojson)

      if (!geojson) {
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

          this.setStorageCache(geojson)
        }
        // Escucha el evento 'cluster' del mapa
        this.map.on('cluster', (event: any) => {
          const clusterId = event.clusterId; // ID del cluster
          const clusterFeatures = event.features; // Características del cluster

          if (clusterId && clusterFeatures.length > 1) {
            this.map
              .getSource('watersources')
              .getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
                if (err) return;
                const clusterCount = clusterFeatures.length;
                this.map.setFeatureState(
                  {
                    source: 'watersources',
                    clusterId: clusterId,
                  },
                  {
                    clusterCount: clusterCount,
                  }
                );
              });
          }
        });
      }
        // Añade el GeoJSON al mapa de Mapbox
        this.map.on('load', () => {
          // // Carga la imagen del icono personalizado
          const img = new Image();
          img.onload = () => {
            // Una vez que la imagen esté cargada, agrégala al mapa como un icono
            this.map.addImage('custom-marker', img);
          };
          img.src = './assets/icon/agua-potable.png';
          img.width = 50;
          img.height = 50;

          this.map.addSource('watersources', {
            type: 'geojson',
            data: geojson,
            cluster: true, // Habilita el clustering
            clusterMaxZoom: 14, // Zoom máximo para agrupar
            clusterRadius: 15, // Radio del cluster
          });
          // Añade una capa de puntos para representar las fuentes de agua en el mapa
          this.map.addLayer({
            id: 'watersources-layer',
            type: 'symbol',
            source: 'watersources',
            layout: {
              'icon-image': ['concat', 'custom-marker-', ['get', 'id']], // Utiliza una imagen personalizada para cada marcador
              'icon-size': 1.2,
              'icon-allow-overlap': true,
            },
            //this.UploadPopup(geojson.features[0])
          });

          geojson.features.forEach((feature: any) => {
            const id = feature.properties.id;
            const img = new Image();
            img.onload = () => {
              this.map.addImage('custom-marker-' + id, img);
            };
            img.src = './assets/icon/agua-potable.png'; // Puedes personalizar el icono aquí
            img.width = 50;
            img.height = 50;
          });

          // Añadir un evento de clic a cada marcador para mostrar información adicional
          this.map.on('click', 'watersources-layer', async (e: any) => {
            const feature = e.features[0];
            const properties = feature.properties;
            const coordinates = feature.geometry.coordinates.slice();

            await this.UploadPopup(
              properties.id,
              properties.name,
              properties.available,
              properties.description,
              properties.ispotable,
              coordinates[1], // latitud
              coordinates[0], // longitud
              properties.photo,
              properties.address
            );
            // Simular un clic adicional en el marcador
            if (this.marker) {
              this.marker.getElement().click();
            }
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
    address: string
  ) {
    console.log(photo);
    // buscamos si hay foto o no
    let photo_url = photo
      ? this.Supabase.GetStorage(photo)
      : './assets/icon/agua-potable.png';

    console.log(photo_url);

    // miramos si esta disponible la fuente:
    const availableText = available ? 'Disponible' : 'No disponible';
    const isPotableText = ispotable ? 'Potable' : 'No potable';

    // create the popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      className: 'MarkersMapBox',
    }).setHTML(`
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
  


  `);

    // create DOM element for the marker
    const el = document.createElement('div');
    // create id
    el.id = 'marker';
    // create style
    el.style.cssText = `background-image: url();
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-size: cover;`;

    // create the marker
    this.marker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map); // sets a popup on this marker

    // esperamos que se crea el doom para cambiar los estilos,
    // no lo cambiamos antes porque queremos cambiar el cierre y el color.
    popup.on('open', () => {
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
  }

  // // desplegamos los popups para las fuentes
  // UploadPopup(
  //   id : any ,
  //   name: any,
  //   available: any,
  //   description: string,
  //   ispotable: any,
  //   lat: any,
  //   lng: any,
  //   photo: string,
  //   address : string
  // ) {

  //   // preparamos la localizacion

  //    // buscamos si hay foto o no
  //    if (!photo){
  //     photo = './assets/icon/agua-potable.png'
  //   }
  //   else{
  //     photo = this.Supabase.GetStorage(photo)
  //   }

  //   // miramos si esta disponible la fuente :
  //   const availableText = available ? 'Disponible' : 'No disponible';
  //   const isPotableText = ispotable ? 'Potable' : 'No potable';

  //   // create the popup
  //   const popup = new mapboxgl.Popup({
  //     offset: 25,
  //     className: 'MarkersMapBox',
  //   }).setHTML(`
  //     <p class="mt-3 mb-0"><strong>Nombre de la fuente:</strong> ${name}</p>
  //     <p class="mb-0" ><strong>Información de la fuente:</strong></p>
  //   <ul>
  //     <li>${availableText}</li>
  //     <li>${isPotableText}</li>
  //     <li>${description}</li>
  //   </ul>
  //   <ion-button id="open-modal" expand="block">Open</ion-button>

  //   <ion-modal trigger="open-modal">
  //   <ion-header>
  //     <ion-toolbar>
  //       <ion-buttons slot="start">
  //       <ion-button onclick="cancel()">Cancel</ion-button>
  //       </ion-buttons>
  //       <ion-title>${name}</ion-title>
  //       <ion-buttons slot="end">
  //         <ion-button onclick="confirm()" strong="true">Confirm</ion-button>
  //       </ion-buttons>
  //     </ion-toolbar>
  //   </ion-header>
  //   <ion-content class="ion-padding">

  //     <ion-img
  //       src="${photo}"
  //       alt="fuente de agua"
  //     ></ion-img>
  //     <div class="mt-3">
  //       <ion-item>

  //         <ion-text class="mt-3" color="primary">
  //           <h1>${name}</h1>
  //           <p class="ms-3">  ${description} </p>
  //           <p class="ms-3">  ${address} </p>

  //           <p class="ms-3">  ${availableText} </p>
  //           <p class="ms-3">  ${isPotableText} </p>
  //         </ion-text>
  //       </ion-item>
  //       <div class="d-block mt-2">
  //         <ion-button class="w-100 mt-2" onclick="OnNavigate(${lng} , ${lat})">Navegar</ion-button>
  //         <ion-button class="w-100 mt-2" onclick="OnSaveFountain(${id})">Guardar fuente</ion-button>
  //       </div>
  //     </div>
  //   </ion-content>
  // </ion-modal>

  //  `
  // );

  //   console.log("mapboxgl.LngLat" , `${lng} , ${lat}`)

  //   // create DOM element for the marker
  //   const el = document.createElement('div');
  //   // create id
  //   el.id = 'marker';
  //   // create style
  //   el.style.cssText = `background-image: url(${photo});
  //   width: 50px;
  //   height: 50px;
  //   border-radius: 50%;
  //   background-size: cover;`;
  //   // create the marker
  //   new mapboxgl.Marker(el)
  //     .setLngLat([lng, lat])
  //     .setPopup(popup)
  //     .addTo(this.map); // sets a popup on this marker

  //   // esperamos que se crea el doom para cambiar los estilos ,
  //   // no lo cambiamos antes porque queremos cambiar el cierre y el color.
  //   popup.on('open', () => {
  //     const popupContent = popup.getElement(); // Obtener el elemento del contenido del popup
  //     popup.getElement().style.color = '#000000'; // Set text color to black for text popoup

  //     const closeButton = popupContent.querySelector(
  //       '.mapboxgl-popup-close-button'
  //     ); // Obtener el botón de cierre
  //     // Aplicar estilos al botón de cierre
  //     if (closeButton instanceof HTMLElement) {
  //       closeButton.style.color = '#ff0000'; // Cambiar color del texto del botón
  //       closeButton.style.background = '#ffffff'; // Cambiar color de fondo del botón
  //       closeButton.style.width = '20px';
  //       // Aquí puedes agregar más estilos según tus necesidades
  //     }
  //   });

  // }

  isHTMLElement(element: Element): element is HTMLElement {
    return element instanceof HTMLElement;
  }

  cargarScript(): void {
    document.addEventListener('DOMContentLoaded', () => {
      var modal = document.querySelector('ion-modal');
    });

    // Función para eliminar el marcador
    const removeMarker = () => {
      this.marker.remove(); // Elimina el marcador del mapa
    };

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
      removeMarker();
    };

    // Definir la función confirm() en el ámbito global
    (window as any).confirm = () => {
      var modal = document.querySelector('ion-modal');
      if (modal) modal.dismiss(null, 'cancel');
      removeMarker();
    };
  }

  message: any;
  onWillDismiss(event: any) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}
