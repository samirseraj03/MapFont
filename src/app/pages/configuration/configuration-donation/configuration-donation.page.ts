import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

// Standalone Components
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

// Iconos
import { addIcons } from 'ionicons';
import { arrowBackOutline, heartOutline, waterOutline, scanOutline } from 'ionicons/icons';

/**
 * @description
 * Pantalla de donaciones con diseño premium. Muestra QR de PayPal y texto de apoyo a MapFont.
 */
@Component({
  selector: 'app-configuration-donation',
  templateUrl: './configuration-donation.page.html',
  styleUrls: ['./configuration-donation.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, TranslateModule],
})
export class ConfigurationDonationPage {

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBackOutline, heartOutline, waterOutline, scanOutline });
  }
}
