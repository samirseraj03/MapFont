import {
  LoadingController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';

export default class GeolocationService {
  constructor() {}

  latitude: any = 0;
  longitude: any = 0;

  // para obtener nuestra localizacion acutal
  // getGeolocation() {
  //   return new Promise((resolve, reject) => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           this.latitude = position.coords.latitude;
  //           this.longitude = position.coords.longitude;
  //           resolve(position); // Resolve with the position data
  //         },
  //         (error) => {
  //           reject(error); // Reject with the error message
  //         }
  //       );
  //     } else {
  //       reject('Geolocation not supported');
  //     }
  //   });
  // }

  // para volver atras
  GoBack(navCtrl: NavController) {
    navCtrl.back();
  }

  async checkLocationPermission() {
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
    });
  }
}
