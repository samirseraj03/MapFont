import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {   NavController  } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from '../../authentication.service';
import { Preferences } from '@capacitor/preferences';
import { ActivatedRoute } from '@angular/router';
import { TabsPage } from 'src/app/tabs/tabs.page';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent, IonButton, IonInput, IonItem, IonButtons, IonCardContent, IonCard ,IonCardTitle , IonRow , IonCol , IonCardHeader} from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonCard, CommonModule, FormsModule ,IonButton , IonCardContent ,IonHeader , IonToolbar , IonButtons ,IonCardTitle , IonRow, IonCol ,IonItem , IonTitle , IonContent , IonCardHeader , IonInput],
})
export class LoginPage implements OnInit {

  //@ViewChild(IonInput) ionInput: IonInput | undefined;


  public errorMessage: string | undefined;
  email: any;
  password: any;
  data_user: any;
  public access_token: any;
  expirationTime: number | undefined;
  timerId: any;
  loading: any;

  constructor(
    private authService: AuthenticationService,
    public loadingController: LoadingController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private TabsPage : TabsPage
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.email = await params['email'];
    });
    if (!this.email && this.email === undefined && this.email == 'undefined') {
      this.email = '';
    }
  }

  // para guardar en storage y en andoroid y ios informacion temportal
  async setStorage(key: string, value: any) {
    await Preferences.set({ key: key, value: JSON.stringify(value) });
  }
  // para obtener en storage y en andoroid y ios informacion temportal
  async getStorage(key: string) {
    const ret = await Preferences.get({ key: key });
    if (ret.value === null) {
      return null;
    } else {
      return JSON.parse(ret.value);
    }
  }

  // para eliminar en storage y en andoroid y ios informacion temportal
  async removeStorage(key: string) {
    await Preferences.remove({ key: key });
    return 0;
  }

  // sistema de login
  // chekea supabase si el usuario existe o no y luego guarda el acceso en el storage de capacitor
  //
  async login() {
    try {


      this.loadingController.create({ message: 'Cargando' }).then(loading => {
        this.loading = loading;
        this.loading.present();
      });

      console.log("loading" , this.loading )


      const response = await this.authService.signIn(this.email, this.password);

      console.log(response)
      if (response) {

        // Check if response exists
        const { user = null, session } = response;

        this.data_user = user;
        this.access_token = session;
        await this.setStorage('session', session);
        await this.setStorage('user', user);
        this.TabsPage.isLogin = true


        if (session) {
          this.setExpirationTime(session.expires_in * 1000); // Convert to milliseconds
        }

        if (this.access_token) {
          this.startTimer();
        }
        // Aquí puedes hacer algo con el usuario y la sesión, como guardarlos en el almacenamiento local o redirigir a otra página.
      } else {
        // Handle the case where the response is undefined or null
        this.loading.dismiss();
        console.error('Unexpected response from authService.signIn');
      }
    } catch (error) {
      this.loading.dismiss();
      // Manejar el error, por ejemplo, mostrar un mensaje de error al usuario.
    } finally {
      this.OnSuccess();
      this.loading.dismiss();

    }
  }

  // para chekear el login
  async checkLoggedIn() {
    const token = await this.getStorage('session');
    if (token && token) {
      return true;
    } else {
      return false;
    }
  }

  private startTimer() {
    if (this.expirationTime) {
      const timeToExpiration = this.expirationTime - Date.now();

      if (timeToExpiration > 0) {
        this.timerId = setInterval(() => {
          if (this.expirationTime) {
            const remainingTime = this.expirationTime - Date.now();
            if (remainingTime <= 0) {
              this.authService.signOut();
              this.clearAccessToken();
              // Optionally log out the user or notify them
            }
          }
        }, 1000); // Check every second
      }
    }
  }

  private setExpirationTime(expiresIn: number) {
    this.expirationTime = Date.now() + expiresIn;
  }

  // para borrar los datos del usuario ya sea dentro de la aplicacion o del storage
  private clearAccessToken() {
    this.access_token = null;
    this.expirationTime = undefined;
    // Optionally clear user data as well
    this.data_user = null;
    // eliminamos el storage del capacitor
    this.removeStorage('user');
    this.removeStorage('session');

  }

  // para salir de la session
  async Logout() {
    try {
      await this.authService.signOut();
    } catch {}
    this.clearAccessToken();
    this.TabsPage.isLogin = false
  }

  // para restear la pagina y ir a las fuentes
  OnSuccess() {
    this.NavCtrl.navigateRoot('/tabs/fonts');
  }

  // para ir a la pagina de register
  GoRegister() {
    this.NavCtrl.navigateForward('/register', {
      queryParams: {
        email: this.email,
      },
    });
  }

  async UpdatePassword(email: any, password: any, new_password: any) {
    const response = await this.authService.signIn(email, password);

    if (response) {
      const error = await this.authService.updateUser({
        password: new_password,
      });

      if (error == null) {
        console.log(error)
        return null
      } else {
        return 'Success'
      }
    }
    else return null
  }
}
