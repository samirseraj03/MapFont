import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Standalone Components
import {
  IonHeader, IonContent, IonIcon, IonInput
} from "@ionic/angular/standalone";

import { Dialog } from '@capacitor/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';

// Fachada (Nuestra nueva puerta lógica)
import { SecurityFacade } from '../../../core/facades/security.facade';

// Iconos
import { addIcons } from 'ionicons';
import { arrowBackOutline, lockClosedOutline, shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline } from 'ionicons/icons';

/**
 * @description
 * Vista de configuración de seguridad y contraseña. Actúa como cliente requiriendo autenticaciones para cambiar credenciales, orquestada por SecurityFacade.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
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

  constructor(
    private securityFacade: SecurityFacade,
    public NavCtrl: NavController
  ) {
    addIcons({ arrowBackOutline, lockClosedOutline, shieldCheckmarkOutline, keyOutline, saveOutline, checkmarkDoneOutline });
  }

  ngOnInit() { }

  async Update() {
    // La página SÓLO comprueba lógica de presentación rápida (si los campos coinciden visualmente)
    if (this.NewPassword === this.NewConfirmPassword) {
      // Y delega el 100% de la lógica asíncrona y compleja al "camarero" (La Fachada)
      await this.securityFacade.updatePassword(this.OldPassword, this.NewPassword);
    } else {
      await Dialog.alert({
        title: 'Atención',
        message: 'Las contraseñas nuevas no coinciden.'
      });
    }
  }
}