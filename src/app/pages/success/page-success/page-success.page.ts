import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';

// Standalone Components
import { IonContent, IonIcon } from "@ionic/angular/standalone";

// Iconos
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, mapOutline } from 'ionicons/icons';

import { TranslateModule } from '@ngx-translate/core';

/**
 * @description
 * Template de pantalla de confirmación exitosa genérica e inert que redirige a distintas transacciones de finalización.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-page-success',
  templateUrl: './page-success.page.html',
  styleUrls: ['./page-success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, TranslateModule]
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