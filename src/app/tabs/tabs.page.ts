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