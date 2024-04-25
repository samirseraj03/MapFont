import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonSpinner, IonContent, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square , home , water, person , push} from 'ionicons/icons';
import { ConfigurationTabPage } from '../ConfigurationPage/configuration-tab/configuration-tab.page';
 

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonButtons, IonContent, IonSpinner, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel ,ConfigurationTabPage],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);


  constructor() {
    addIcons({ triangle, ellipse, square ,home , water , person , push });
  }

}
