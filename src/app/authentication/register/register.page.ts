import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Tus servicios
import { AuthenticationService } from '../../authentication.service';
import DatabaseService from '../../Types/SupabaseService';
import { LoginPage } from '../login/login.page';
import GeolocationService from '../../Globals/Geolocation';
import { TabsPage } from 'src/app/tabs/tabs.page';
import { Services } from 'src/app/services.service';

// Ionic Standalone & Translate
import { IonContent, IonInput, IonButton, IonIcon, IonToggle } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';

// Importar iconos necesarios para el registro
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, logoGoogle, logoApple } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonIcon, IonToggle, CommonModule, FormsModule, TranslateModule],
})
export class RegisterPage implements OnInit {
  email: any;
  password: any;
  username: any;
  loading: any;
  data: any;
  Supabase = new DatabaseService();
  GeolocationService: any = new GeolocationService();

  constructor(
    private loadingController: LoadingController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private loginService: LoginPage,
    private TabsPage: TabsPage,
    private Service: Services
  ) {
    // Registrar los iconos para la UI
    addIcons({ personOutline, mailOutline, lockClosedOutline, logoGoogle, logoApple });
  }

  ngOnInit() {
    let email: string | undefined = "";

    this.route.queryParams.subscribe(async (params) => {
      email = await params['email'];

      if (email !== null && email !== undefined) {
        this.email = email;
      } else {
        this.email = "";
      }
    });
  }

  async Register() {
    // abrimos el popoup
    try {
      // cogemos la localizacion del usuario previa
      let location = await this.GeolocationService.getGeolocation()
      // registramos el usuario con la funcion de supabase y obtenemos los datos
      this.data = await this.authService.signUp(this.email, this.password)

      // si hay datos en el supabase y se inserto correctamente
      if (this.data) {
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
          photo: null,
          password: this.password,
          autencationUserID: this.data.user.id,
          language: "es"
        })

        // ponemos el storage de capacitor 
        let user = await this.Service.setStorage('session', this.data.session);
        let session = await this.Service.setStorage('user', this.data.user);

        this.loginService.data_user = user;
        this.loginService.access_token = session;
        this.TabsPage.isLogin = true
      }
    }
    catch (error) {
      console.error("se ha producido un error: ", error);
    }
    finally {
      // si el usuario se ha registrado correctamente , lo llevamos al inicio
      if (this.data) {
        this.OnSucces()
      }
    }
  }

  OnSucces() {
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