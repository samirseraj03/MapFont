import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Servicios
import { AuthenticationService } from '../../../core/services/authentication.service';
import DatabaseService from '../../../core/data/SupabaseService';
import { LoginPage } from '../login/login.page';
import GeolocationService from '../../../core/utils/Geolocation';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { Services } from '../../../core/services/services.service';

// Ionic Standalone & Translate
import { IonContent, IonInput, IonButton, IonIcon, IonToggle } from "@ionic/angular/standalone";
import { TranslateModule } from '@ngx-translate/core';

// Iconos
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

  constructor(
    private loadingController: LoadingController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private loginService: LoginPage,
    private authState: AuthStateService,
    private Service: Services,
    private Supabase: DatabaseService,
    public GeolocationService: GeolocationService
  ) {
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
    try {
      let location: any = await this.GeolocationService.getGeolocation()
      this.data = await this.authService.signUp(this.email, this.password)

      if (this.data) {
        
        // 1. Create the default UserType role (admin: false, user: true)
        await this.Supabase.insertUserType({
          admin_role: false,
          user_role: true,
          autencationUserID: this.data.user.id
        });

        // 2. Pass it down to insertUser
        await this.Supabase.insertUser({
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
        });

        let user = await this.Service.setStorage('session', this.data.session);
        let session = await this.Service.setStorage('user', this.data.user);

        this.loginService.data_user = user;
        this.loginService.access_token = session;
        this.authState.isLogin = true;
      }
    }
    catch (error) {
      console.error("se ha producido un error: ", error);
    }
    finally {
      if (this.data) {
        this.OnSucces()
      }
    }
  }

  OnSucces() {
    const route = this.authState.intendedRoute || '/tabs/fonts';
    this.authState.intendedRoute = null;
    this.NavCtrl.navigateRoot(route);
  }

  GoLogin() {
    this.NavCtrl.navigateForward('/tabs/login', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async loginWithGoogle() {
    await this.loginService.loginWithGoogle();
  }
}