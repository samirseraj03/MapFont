import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController , LoadingController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { LoginPage } from 'src/app/authentication/login/login.page';
import DatabaseService from 'src/app/Types/SupabaseService';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonButton, IonList, IonLabel ,  IonMenu , IonMenuButton, } from "@ionic/angular/standalone";

@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-security.page.html',
  styleUrls: ['./configuration-security.page.scss'],
  standalone: true,
  imports: [   IonMenu , IonMenuButton, IonLabel, IonList, IonButton, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule, ConfigurationTabPage],
  providers: [ConfigurationTabPage], // Agrega ConfigurationTabPage como un proveedor
})
export class ConfigurationSecurityPage implements OnInit {
  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
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

    this.loading = await this.loadingController.create({
      message: '',
      duration: 3000,
    });
    this.loading.present();
    // comprovamos que coindicen las nuevas contrasenyas :
    if (this.formData.NewPassword === this.formData.NewConfirmPassword) {
      // pasamos la funcion donde comprueba la antigua contrasenya y hace la nueva
      try {
        let email = await this.GeolocationService.getUserEmail();
        let data = await this.LoginService.UpdatePassword(
          email,
          this.formData.OldPassword,
          this.formData.NewPassword
        );
        console.log(data)
        if (data === 'Success') {
          await this.ToDataBase();
          this.Success();
        }
      } catch (error) {
        alert(
          'tu contrasenya no se ha podido cambiar , comporuba las credentciales'
        );
      }
      finally {
        this.loading.dismiss();
      }
    } else {
      await this.loading.dismiss();
      alert('las contrasenyas no coinciden');
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
    let password = { password: this.formData.NewPassword } as any;
    await this.Supabase.updateUser(
      await this.GeolocationService.getUserID(),
      password
    );
  }
}
