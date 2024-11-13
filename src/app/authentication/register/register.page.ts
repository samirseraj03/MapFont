import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import DatabaseService from '../../Types/SupabaseService';
import { LoginPage } from '../login/login.page';
import GeolocationService from '../../Globals/Geolocation';
import { IonHeader, IonRow, IonToolbar, IonTitle, IonCard, IonContent, IonCardTitle, IonCol, IonCardHeader, IonItem, IonCardContent, IonButton } from "@ionic/angular/standalone";
import { TabsPage } from 'src/app/tabs/tabs.page';
import { Services } from 'src/app/services.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardContent, IonItem, IonCardHeader, IonCol, IonCardTitle, IonContent, IonCard, IonTitle, IonToolbar, IonRow, IonHeader,  CommonModule, FormsModule],
})
export class RegisterPage implements OnInit {
  email: any;
  password: any;
  username: any;
  loading : any
  data : any
  Supabase = new DatabaseService();
  GeolocationService : any = new GeolocationService()



  constructor(
    private loadingController: LoadingController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private loginService : LoginPage ,
    private TabsPage : TabsPage,
    private Service : Services

  ) {}

  ngOnInit() {
    let email: string | undefined = ""; // Declara 'email' como string o undefined

    this.route.queryParams.subscribe(async (params) => {
      email = await params['email'];

      // Comprueba si 'email' no es null o undefined
      if (email !== null && email !== undefined) {
        this.email = email; // Establece 'this.email' al valor recuperado
      } else {
        this.email = ""; // Establece 'this.email' a una cadena vacía
      }
    });
  }

  async Register() {

    // abrimos el popoup
    try {

      // cogemos la localizacion del usuario previa
      let location = await this.GeolocationService.getGeolocation()
      // registramos el usuario con la funcion de supabase y obtenemos los datos
      this.data = await this.authService.signUp(this.email , this.password)

      // si hay datos en el supabase y se inserto correctamente
      if (this.data){
      // insertamos los primeros passos para el usuario
      this.Supabase.insertUser({
        email: this.email,
        location: {
          "latitude": location.coords.latitude,
          "longitude": location.coords.longitude
        },
        username: this.username || '',
        name: '',
        lastname: '',
        number: 0,
        address: '',
        photo : null,
        password: this.password ,
        autencationUserID :  this.data.user.id,
        language : "es"
      } )

        // ponemos el storage de capacitor 
        let user = await this.Service.setStorage('session' , this.data.session );
        let session = await this.Service.setStorage('user' , this.data.user );      

        this.loginService.data_user = user; 
        this.loginService.access_token = session;
        this.TabsPage.isLogin = true

    
      }
    }
    catch (error) {
      throw console.error("se ha producido un error: " ,  error );
    }
    finally {
       // si el usuario se ha registrado correctamente , lo llevamos al inicio
      this.OnSucces()
    }
  }

  OnSucces(){
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }

  GoLogin() {
    this.NavCtrl.navigateForward('/tabs/login', {
      queryParams: {
        email: this.email,
      },
    });
  }
}
