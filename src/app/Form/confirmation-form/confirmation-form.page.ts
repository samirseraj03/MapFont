import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

// Standalone Components limpios
import {
  IonHeader, IonContent, IonIcon
} from "@ionic/angular/standalone";

import { Dialog } from '@capacitor/dialog';

// Servicios
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import { WaterSources } from '../../Types/SupabaseService';

// Iconos
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, timeOutline, checkmarkDoneOutline, shieldCheckmarkOutline,
  waterOutline, locationOutline, navigateOutline, checkmarkOutline, closeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-confirmation-form',
  templateUrl: './confirmation-form.page.html',
  styleUrls: ['./confirmation-form.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonIcon, CommonModule, FormsModule
  ]
})
export class ConfirmationFormPage implements OnInit {

  resultsNotAproved: any[] = []; // Array nativo, sin ag-grid
  resultsAproved: any[] = []; // Array nativo, sin ag-grid

  loading: any;

  GeolocationService = new GeolocationService();

  constructor(
    public NavCtrl: NavController,
    public alertController: AlertController,
    private loadingController: LoadingController,
    private Supabase: DatabaseService
  ) {
    // Registramos iconos
    addIcons({
      arrowBackOutline, timeOutline, checkmarkDoneOutline, shieldCheckmarkOutline,
      waterOutline, locationOutline, navigateOutline, checkmarkOutline, closeOutline
    });
  }

  async ngOnInit() {
    // Lanza ambas peticiones al mismo tiempo y espera a que las dos terminen
    await Promise.all([
      this.getFormsNotAproved(),
      this.getFormsAproved()
    ]);
  }

  async getFormsNotAproved() {
    // Supabase devuelve el array, nosotros solo lo guardamos en la variable local
    this.resultsNotAproved = await this.Supabase.getFormsNotAproved();
  }


  async getFormsAproved() {
    // Supabase devuelve el array, nosotros solo lo guardamos en la variable local
    this.resultsAproved = await this.Supabase.getFormsAproved();
  }



  // --- NAVEGACIÓN ---

  // Para ver el formulario antes de aprobar/rechazar
  OnSelect(result: any) {
    this.ViewForm(result);
  }

  ViewForm(data: any) {
    this.NavCtrl.navigateForward('/viewForm', {
      queryParams: {
        id: data.id,
        data: JSON.stringify(data),
        username: data.username,
      },
    });
  }

  // Ver en Google Maps
  async OnSelectNavigate(result: any) {
    let latitude = await result.location.latitude;
    let longitude = await result.location.longitude;

    let link = await this.GeolocationService.generateGoogleMapsLink(latitude, longitude) as string;
    await Browser.open({ url: link });
  }

  // --- ADMINISTRACIÓN ---

  // Aprobar
  async OnConfirm(result: any) {
    this.loadingController.create({ message: 'Aprobando fuente...' }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });

    const waterSource: WaterSources = {
      location: {
        latitude: result.location.latitude,
        longitude: result.location.longitude,
      },
      name: result.watersourcesname,
      address: result.address,
      ispotable: result.is_potable,
      available: result.available,
      created_at: new Date(),
      photo: result.photo,
      description: result.description,
      watersourcetype: result.watersourcetype,
      updated_at: result.updated_at
    };

    let ApprovedUpdated = { approved: true };

    try {
      let insert = await this.Supabase.insertWaterSource(waterSource);

      if (insert) {
        let query = await this.Supabase.updateForm(result.id, ApprovedUpdated);

        if (query && query.length > 0) {
          // 1. Lo quitamos de la lista de PENDIENTES
          this.resultsNotAproved = this.resultsNotAproved.filter(form => form.id !== result.id);

          // 2. Actualizamos su estado localmente para que la interfaz sepa que ya está aprobado
          result.approved = true;

          // 3. Lo AÑADIMOS a la lista de APROBADOS (unshift lo pone al principio de la lista)
          this.resultsAproved.unshift(result);
        } else {
          throw new Error("Fallo al actualizar el estado");
        }
      }

      await Dialog.alert({
        title: 'Éxito',
        message: 'La fuente ha sido aprobada y publicada en la base de datos oficial.'
      });

    } catch (error) {
      await Dialog.alert({
        title: 'Atención',
        message: 'Hubo un error de conexión, no se ha podido aprobar la fuente.'
      });
    } finally {
      if (this.loading) this.loading.dismiss();
    }
  }

  // Rechazar
  async OnReject(result: any) {
    this.loadingController.create({ message: 'Rechazando fuente...' }).then(loading => {
      this.loading = loading;
      this.loading.present();
    });

    try {
      let ApprovedUpdated = { approved: false };
      let query = await this.Supabase.updateForm(result.id, ApprovedUpdated);

      if (query && query.length > 0) {
        // Removemos de la lista local
        this.resultsNotAproved = this.resultsNotAproved.filter(form => form.id !== result.id);
      }
    } catch (error) {
      await Dialog.alert({
        title: 'Atención',
        message: 'No se pudo actualizar el estado a rechazado.'
      });
    } finally {
      if (this.loading) this.loading.dismiss();
    }
  }
}