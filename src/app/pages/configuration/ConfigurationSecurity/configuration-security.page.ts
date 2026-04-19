import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, LoadingController } from '@ionic/angular';

// Standalone Components
import {
  IonHeader, IonContent, IonIcon, IonInput
} from "@ionic/angular/standalone";

import { Dialog } from '@capacitor/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Servicios Propios
import GeolocationService from '../../../core/utils/Geolocation';
import DatabaseService from '../../../core/data/SupabaseService';
import { AuthenticationService } from '../../../core/services/authentication.service'; // Usamos este en lugar de LoginPage

// Iconos
import { addIcons } from 'ionicons';
import { arrowBackOutline, lockClosedOutline, shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-security.page.html',
  styleUrls: ['./configuration-security.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonContent, IonIcon, IonInput, TranslateModule
  ]
})
export class ConfigurationSecurityPage implements OnInit {

  OldPassword: any;
  NewPassword: any;
  NewConfirmPassword: any;
  loading: any;

  constructor(
    public NavCtrl: NavController,
    private loadingController: LoadingController,
    private authService: AuthenticationService, // <-- Inyectamos directamente el servicio
    private TranslateService: TranslateService,
    private Supabase: DatabaseService,
    public GeolocationService: GeolocationService
  ) {
    addIcons({ arrowBackOutline, lockClosedOutline, shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline });
  }

  ngOnInit() { }

  async Update() {
    this.loadingController.create({ message: this.TranslateService.instant('loading') || 'Cargando...' }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });

    // 1. Comprobamos que las contraseñas nuevas coinciden
    if (this.NewPassword === this.NewConfirmPassword) {
      try {
        let email = await this.GeolocationService.getUserEmail();

        // 2. Iniciamos sesión con la antigua para verificar (Reemplaza a this.LoginService.UpdatePassword)
        const response = await this.authService.signIn(email, this.OldPassword);

        if (response && response.user) {

          // 3. Si la vieja es correcta, actualizamos a la nueva
          const error = await this.authService.updateUser({
            password: this.NewPassword,
          });

          if (!error) {
            await this.ToDataBase();
            this.Success();
          } else {
            throw new Error("No se pudo actualizar la contraseña");
          }
        } else {
          throw new Error("Credenciales inválidas");
        }
      } catch (error) {
        await Dialog.alert({
          title: 'Atención',
          message: 'Tu contraseña actual es incorrecta o hubo un problema de red.'
        });
      } finally {
        if (this.loading) this.loading.dismiss();
      }
    } else {
      if (this.loading) this.loading.dismiss();
      await Dialog.alert({
        title: 'Atención',
        message: 'Las contraseñas nuevas no coinciden.'
      });
    }
  }

  async Success() {
    this.NavCtrl.navigateForward('/Success', {
      state: {
        PageSucces: 'security',
      },
    });
  }

  async ToDataBase() {
    let password = { password: this.NewPassword } as any;
    await this.Supabase.updateUser(
      await this.GeolocationService.getUserID(),
      password
    );
  }
}