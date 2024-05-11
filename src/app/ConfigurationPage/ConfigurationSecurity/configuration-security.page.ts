import { Component, OnInit, ViewChild , NgModule    } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm , ReactiveFormsModule } from '@angular/forms';
import { NavController , LoadingController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { LoginPage } from 'src/app/authentication/login/login.page';
import DatabaseService from 'src/app/Types/SupabaseService';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonButton, IonList, IonLabel ,  IonMenu , IonMenuButton, IonInput } from "@ionic/angular/standalone";
import { Dialog } from '@capacitor/dialog';

@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-security.page.html',
  styleUrls: ['./configuration-security.page.scss'],
  standalone: true,
  imports: [IonInput, ReactiveFormsModule , CommonModule, FormsModule,  IonMenu , IonMenuButton, IonLabel, IonList, IonButton, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader,  ConfigurationTabPage],
  providers: [ConfigurationTabPage], // Agrega ConfigurationTabPage como un proveedor
})

export class ConfigurationSecurityPage implements OnInit {
  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild

  OldPassword : any 
  NewPassword : any 
  NewConfirmPassword : any 


  img_ref_config: any = null;
  loading: any;

  constructor(public NavCtrl: NavController, private LoginService: LoginPage ,     private loadingController: LoadingController,
  ) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();

  ngOnInit() {}

  // para hacer el update
  async Update() {


    this.loadingController.create({ message: 'Cargando' }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });


    // comprovamos que coindicen las nuevas contrasenyas :
    if (this.NewPassword === this.NewConfirmPassword) {
      // pasamos la funcion donde comprueba la antigua contrasenya y hace la nueva
      try {
        let email = await this.GeolocationService.getUserEmail();
        let data = await this.LoginService.UpdatePassword(
          email,
          this.OldPassword,
          this.NewPassword
        );
        console.log(data)
        if (data === 'Success') {
          await this.ToDataBase();
          this.Success();
        }
      } catch (error) {
        await Dialog.alert({
          title: 'Atencion',
          message: 'tu contrasenya no se ha podido cambiar , comporuba las credentciales'
        });
      
      }
      finally {
        this.loading.dismiss();
      }
    } else {
      await this.loading.dismiss();
      await Dialog.alert({
        title: 'Atencion',
        message: 'las contrasenyas no coinciden'
      });
    }
  }
  // llevamos el guardado a succes
  async Success() {
    this.NavCtrl.navigateForward('/Success', {
      state: {
        PageSucces: 'security',
      },
    });
  }

  // subimos la contrsenya a la base de datos del usuario
  async ToDataBase() {
    let password = { password: this.NewPassword } as any;
    await this.Supabase.updateUser(
      await this.GeolocationService.getUserID(),
      password
    );
  }
}
