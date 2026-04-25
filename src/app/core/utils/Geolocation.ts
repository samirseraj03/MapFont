import {
  LoadingController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { StorageService } from '../services/storage.service';
import { Capacitor } from '@capacitor/core';
import { Injectable } from '@angular/core';

/**
 * Servicio global de geolocalización y utilidades.
 * Ahora es @Injectable para poder inyectarlo correctamente con DI de Angular
 * en lugar de usar 'new GeolocationService()'.
 */
@Injectable({
  providedIn: 'root'
})
export default class GeolocationService {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  latitude: any = 0;
  longitude: any = 0;

  // para obtener nuestra localizacion acutal
  getGeolocationWeb() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            resolve(position); // Resolve with the position data
          },
          (error) => {
            reject(error); // Reject with the error message
          }
        );
      } else {
        reject('Geolocation not supported');
      }
    });
  }

  // para volver atras
  GoBack(navCtrl: NavController) {
    navCtrl.back();
  }

  async checkLocationPermission() {
    console.log("is native platform", Capacitor.isNativePlatform())

    if (Capacitor.isNativePlatform() === true) {
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location === 'granted' || permissionStatus.coarseLocation === 'granted') {
        return 'granted';
      } else if (
        permissionStatus.location === 'prompt' ||
        permissionStatus.location === 'prompt-with-rationale'
      ) {
        return await this.requestLocationPermission();
      } else {
        return 'denied';
      }
    }
    else {
      return 'web'
    }
  }

  // solictamos el acceso si no esta disponible
  async requestLocationPermission() {
    const requestResult = await Geolocation.requestPermissions();
    if (requestResult.location === 'granted' || requestResult.coarseLocation === 'granted') {
      return 'granted';
    } else {
      return 'denied';
    }
  }

  // para obtener nuestra localizacion acutal con capacitor
  async getGeolocation() {
    return new Promise(async (resolve, reject) => {
      // checkeamos los permisos de los dispostivos
      let check = await this.checkLocationPermission();

      console.log("check", check)

      if (check === 'web') {

        let data = await this.getGeolocationWeb()
        if (data) {
          resolve(data);
        }
        else {
          reject('Geolocation not supported');
        }

      }
      else {
        if (check == 'granted') {
          let coordinates = await Geolocation.getCurrentPosition();
          console.log('Current position:', coordinates);
          // para insertar las cordenadas como variable global
          this.latitude = coordinates.coords.latitude;
          this.longitude = coordinates.coords.longitude;
          resolve(coordinates);
        } else if (check == 'denied') {
          reject('Geolocation not supported');
        }
      }
    });
  }

  formatDate(isoString: any) {
    // Crear un objeto de fecha a partir de la cadena ISO 8601
    const date = new Date(isoString);

    // Obtener día, mes y año
    const day = date.getDate().toString().padStart(2, '0'); // Asegurar que tenga 2 dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
    const year = date.getFullYear();

    // Crear la cadena de fecha en el formato dd/mm/yyyy
    const dateString = `${day}/${month}/${year}`;

    return dateString;
  }

  async getStorage(key: string) {
    return await this.storage.get(key);
  }

  async generateGoogleMapsLink(latitud: number, longitud: number) {
    return `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
  }

  async generateAppleMapsLink(latitud: number, longitud: number) {
    return `http://maps.apple.com/?q=${latitud},${longitud}`;
  }

  async generateWazeLink(latitud: number, longitud: number) {
    return `https://waze.com/ul?ll=${latitud},${longitud}&navigate=yes`;
  }

}
