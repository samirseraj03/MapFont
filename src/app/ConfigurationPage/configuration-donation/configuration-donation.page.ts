import { Component, OnInit , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';


@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-donation.page.html',
  styleUrls: ['./configuration-donation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule ,  ConfigurationTabPage],
  providers: [ConfigurationTabPage], // Agrega ConfigurationTabPage como un proveedor

})
export class ConfigurationDonationPage implements OnInit {

  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  img_ref_config : any = null

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();


  ngOnInit() {
  }

  Update(event : any){

  }
 

}
