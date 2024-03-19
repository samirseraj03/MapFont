export default class GeolocationService {

    constructor() {} 
      
    latitude : number = 0 ;
    longitude : number = 0;   

  // para obtener nuestra localizacion acutal
  getGeolocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            resolve(position); // Resolve with the position data
          },
          error => {
            reject(error); // Reject with the error message
          }
        );
      } else {
        reject("Geolocation not supported");
      }
    });
  }






}