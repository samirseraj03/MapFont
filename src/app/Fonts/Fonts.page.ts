import { Component , ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent, IonButton, IonInput, IonItem, IonButtons, IonModal } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import * as mapboxgl from 'mapbox-gl';
import { environment } from './../../environments/environment';
import GeolocationService from '../Globals/Geolocation';
import DatabaseService from '../Types/SupabaseService';
import { LoadingController, AlertController, NavController } from "@ionic/angular";
import { OverlayEventDetail } from '@ionic/core/components';



@Component({
  selector: 'app-fonts',
  templateUrl: 'fonts.page.html',
  styleUrls: ['fonts.page.scss'],
  standalone: true,
  imports: [IonModal, IonButtons, IonItem, IonInput, IonButton, 
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    ExploreContainerComponent,
  ],
})
export class fontsPage {

  @ViewChild(IonModal) modal: IonModal | undefined;

 
  constructor(private navCtrl: NavController  ) {

    // if (this.navCtrl.get()?.extras.state) {
    //   this.image = this.navCtrl.getCurrentNavigation()?.extras.state.image;
    // }


  }
  map: any;
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  async ionViewWillEnter() {

    console.log("---------------------");
    // importamos el accessTokenMapbox para desplegar el mapa
    (mapboxgl as any).accessToken = environment.accessToken;
    // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
   // await this.GeolocationService.getGeolocationCapacitor();
    await this.GeolocationService.getGeolocation();
    // desplegamos el mapa de mapBox
    this.getMap();

    // test
    this.test();

  }

  async ngOnInit() {
  //   console.log("---------------------");
  //   // importamos el accessTokenMapbox para desplegar el mapa
  //   (mapboxgl as any).accessToken = environment.accessToken;
  //   // cogemos las primeras localizacion para poder desplegar el mapa y obtener posicion
  //  // await this.GeolocationService.getGeolocationCapacitor();
  //   await this.GeolocationService.getGeolocation();
  //   // desplegamos el mapa de mapBox
  //   this.getMap();

  //   // test
  //   this.test();
  }

  getMap() {
    // desplegar el map
    this.map = new mapboxgl.Map({
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

  test() {
    this.getWatersourcesToMap();
  }

  async getWatersourcesToMap() {
    try {
      // llamamos a supabase
      let watersources = await this.Supabase.getWaterSources();
      if (Array.isArray(watersources) && watersources.length > 0) {
        // recorremos la lista que obtenemos de la base de datos
        watersources.forEach((element) => {
          this.UploadPopup(
            element.name,
            element.available,
            element.description,
            element.ispotable,
            element.location.latitude,
            element.location.longitude,
            element.photo
          );
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // desplegamos los popups para las fuentes
  UploadPopup(
    name: any,
    available: any,
    description: string,
    ispotable: any,
    lat: any,
    lng: any,
    photo: string
  ) {
    // miramos si esta disponible la fuente :
    if (available) {
      available = 'Esta disponible la fuente';
    } else {
      available = 'No esta disponible la fuente';
    }
    // miramos si es potable la fuente :
    if (ispotable) {
      ispotable = 'La fuente es potable';
    } else {
      ispotable = 'La fuente no es potable';
    }
    // create the popup
    const popup = new mapboxgl.Popup({
      offset: 25,
      className: 'MarkersMapBox',
    }).setHTML(`
      <p class="mt-3 mb-0"><strong>Nombre de la fuente:</strong> ${name}</p>
      <p class="mb-0" ><strong>Información de la fuente:</strong></p>
    <ul>
      <li>${available}</li>
      <li>${ispotable}</li>
      <li>${description}</li>
    </ul>`
    );

    // create DOM element for the marker
    const el = document.createElement('div');
    // create id
    el.id = 'marker';
    // create style
    el.style.cssText = `background-image: url(${photo});
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-size: cover;`;
    // create the marker
    new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(this.map); // sets a popup on this marker

    // esperamos que se crea el doom para cambiar los estilos ,
    // no lo cambiamos antes porque queremos cambiar el cierre y el color.
    popup.on('open', () => {
      const popupContent = popup.getElement(); // Obtener el elemento del contenido del popup
      popup.getElement().style.color = '#000000'; // Set text color to black for text popoup

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

  isHTMLElement(element: Element): element is HTMLElement {
    return element instanceof HTMLElement;
  }

  // para abir el popup
  cancel(){
    if (this.modal)
      this.modal.dismiss(null, 'cancel');

  }

  confirm(){
    if (this.modal)
    this.modal.dismiss("thisname", 'confirm');
  }

  message : any;
  onWillDismiss(event : any){

    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  }

