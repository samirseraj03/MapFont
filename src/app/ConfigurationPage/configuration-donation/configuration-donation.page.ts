import { Component, OnInit , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {  NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton , IonMenuButton ,IonMenu  } from "@ionic/angular/standalone";

@Component({
  selector: 'app-configuration-security',
  templateUrl: './configuration-donation.page.html',
  styleUrls: ['./configuration-donation.page.scss'],
  standalone: true,
  imports: [IonButton, IonCardTitle, IonCardHeader, IonCard, IonContent, IonButtons, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule ,  ConfigurationTabPage , IonMenu , IonMenuButton],
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
