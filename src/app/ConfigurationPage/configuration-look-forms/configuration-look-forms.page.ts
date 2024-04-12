import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';


@Component({
  selector: 'app-configuration-look-forms',
  templateUrl: './configuration-look-forms.page.html',
  styleUrls: ['./configuration-look-forms.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule ,ConfigurationTabPage]
})
export class ConfigurationLookFormsPage implements OnInit {

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();

  ngOnInit() {
  }

}
