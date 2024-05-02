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

  constructor(public loginPage: LoginPage) {
    addIcons({ triangle, ellipse, square, home, water, person, push });
  }

  
  async ngOnInit() {
    this.isLogin = await this.loginPage.checkLoggedIn()
    console.log( this.isLogin )
  }

  

  

}
