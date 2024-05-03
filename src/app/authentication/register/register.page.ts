import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import DatabaseService from '../../Types/SupabaseService';
import { LoginPage } from '../login/login.page';
import GeolocationService from '../../Globals/Geolocation';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
    private loginService : LoginPage
  ) {}

  ngOnInit() {
    // verficamos si el usuario ha escrito antes el email para no hacer que lo escriba otra vez
    this.route.queryParams.subscribe(async (params) => {
      this.email = await params['email'];
    });
    if (!this.email  && this.email === undefined && this.email == 'undefined') {
      this.email = '';
    }
  }

  async Register() {
    // abrimos el popoup
    this.loading = await this.loadingController.create({
      message: '',
      duration: 3000,
    });

    try {
      // presentamos el popoup
      this.loading.present()
      // cogemos la localizacion del usuario previa
      let location = await this.GeolocationService.getGeolocation()
      // registramos el usuario con la funcion de supabase y obtenemos los datos
      this.data = this.authService.signUp(this.email , this.password)
      console.log(this.data)
      console.log(this.data.user.id)
      // insertamos los primeros passos para el usuario
      this.Supabase.insertUser({
        email: this.email,
        location: {
          "latitude": location.coords.latitude,
          "longitude": location.coords.longitude
        },
        username: this.username || '',
        name: '',
        lastNname: '',
        number: 0,
        address: '',
        photo: '',
        created_at: this.data.user.created_at,
        password: this.password ,
        autencationUserID :  this.data.user.id
      } )
      // si hay datos en el supabase y se inserto correctamente
      if (this.data){
        // ponemos el storage de capacitor 
        await this.loginService.setStorage('session' , this.data.session );
        await this.loginService.setStorage('user' , this.data.user );
        // si el usuario se ha registrado correctamente , lo llevamos al inicio
        this.OnSucces()
      }
    }
    catch (error) {
      throw console.error("se ha producido un error: " ,  error );
    }
    finally {
      this.loading.dismiss()
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
