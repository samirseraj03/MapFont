import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { StorageService } from '../core/services/storage.service';
import { AuthStateService } from '../core/services/auth-state.service';
import { TranslateModule } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { mapOutline, addOutline, personOutline } from 'ionicons/icons';

/**
 * @description
 * Componente enrutador y conector principal a Bottom-Tab (barra inferior nativa).
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
    CommonModule, TranslateModule
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);

  /** Expone el estado de login desde AuthStateService */
  get isLogin(): boolean {
    return this.authState.isLogin;
  }
  set isLogin(val: boolean) {
    this.authState.isLogin = val;
  }

  constructor(
    private storage: StorageService,
    private authState: AuthStateService,
    private navCtrl: NavController
  ) {
    addIcons({ mapOutline, addOutline, personOutline });
  }

  async ngOnInit() {
    this.authState.isLogin = await this.checkLoggedIn();
  }

  async checkLoggedIn(): Promise<boolean> {
    const token = await this.storage.get('session');
    return !!token;
  }

  /**
   * Redirige a login guardando la ruta deseada para volver después del login.
   */
  goToLoginWithIntent(intendedRoute: string) {
    this.authState.intendedRoute = intendedRoute;
    this.navCtrl.navigateForward('/tabs/login');
  }
}