import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';
import { TranslateModule } from '@ngx-translate/core';

// Iconos minimalistas para la navegación
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
  public isLogin: boolean = false; // Tipado correcto

  constructor() {
    // Solo cargamos los iconos que realmente usamos
    addIcons({ mapOutline, addOutline, personOutline });
  }

  async ngOnInit() {
    this.isLogin = await this.checkLoggedIn();
  }

  async checkLoggedIn(): Promise<boolean> {
    const token = await this.getStorage('session');
    // Si hay token devuelve true, si no, false. Mucho más limpio.
    return !!token;
  }

  async getStorage(key: string) {
    const ret = await Preferences.get({ key: key });
    if (ret.value === null) {
      return null;
    } else {
      return JSON.parse(ret.value);
    }
  }
}