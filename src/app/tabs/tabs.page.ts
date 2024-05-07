import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonContent,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  triangle,
  ellipse,
  square,
  home,
  water,
  person,
  push,
} from 'ionicons/icons';
import { ConfigurationTabPage } from '../ConfigurationPage/configuration-tab/configuration-tab.page';
import { LoginPage } from '../authentication/login/login.page';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonButtons,
    IonContent,
    IonSpinner,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    ConfigurationTabPage,
    CommonModule,  
  ],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  public isLogin : any

  constructor() {
    addIcons({ triangle, ellipse, square, home, water, person, push });
  }

  
  async ngOnInit() {
    this.isLogin = await this.checkLoggedIn()
  }

  async checkLoggedIn() {
    const token = await this.getStorage('session');
    if (token && token) {
      return true;
    } else {
      return false;
    }
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
