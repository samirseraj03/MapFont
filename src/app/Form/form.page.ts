import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardHeader, IonCard, IonCardTitle, IonCardSubtitle, IonList, IonCardContent, IonItem , IonLabel , IonThumbnail} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-form',
  templateUrl: 'form.page.html',
  styleUrls: ['form.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonCardContent, IonList, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent ,IonThumbnail]
})
export class FormPage {

  constructor() {}


  










}
