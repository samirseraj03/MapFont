import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

// Standalone Components
import { IonContent, IonIcon } from "@ionic/angular/standalone";

// Iconos
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, mapOutline } from 'ionicons/icons';

@Component({
  selector: 'app-page-success',
  templateUrl: './page-success.page.html',
  styleUrls: ['./page-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class PageSuccessPage implements OnInit {

  constructor(public NavCtrl: NavController) {
    // Registramos los iconos de éxito y mapa
    addIcons({ checkmarkCircleOutline, mapOutline });
  }

  ngOnInit() {
  }

  GoToMap() {
    // Te devuelve al inicio (mapa) reiniciando el historial de navegación
    this.NavCtrl.navigateRoot('/tabs/fonts', {
      queryParams: {
        Success: true,
      },
    });
  }

}