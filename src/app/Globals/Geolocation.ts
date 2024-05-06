import {
  LoadingController,
  AlertController,
  NavController,
} from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';


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

      console.log(check)

    });
  }

  formatDate(isoString : any) {
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

async getUserID(){
 let  user_id = await this.getStorage('user')
 if (user_id) {
    return user_id.id
 }
 else{return null}

}

async getUserEmail(){
  let  user_email = await this.getStorage('user')
  if (user_email) {
     return user_email.email
  }
  else{return null}
 
 }


async getStorage(key : string ){
  const ret = await Preferences.get({ key: key });
  if (ret.value === null){
    return null
  }
  else{
    return JSON.parse(ret.value);
  }
}

async generateGoogleMapsLink(latitud: number, longitud: number) {
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
}

}
