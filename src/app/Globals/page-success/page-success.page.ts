import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {   NavController} from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonButton, IonContent, IonLabel, IonText } from "@ionic/angular/standalone";

@Component({
  selector: 'app-page-success',
  templateUrl: './page-success.page.html',
  styleUrls: ['./page-success.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule , IonHeader , IonToolbar , IonTitle , IonContent , IonLabel , IonButton , IonText ]
})
export class PageSuccessPage implements OnInit {

  constructor( public NavCtrl : NavController) { }

  ngOnInit() {
  }


  

  GoToMap(){

    this.NavCtrl.navigateRoot( '/', {
      queryParams: {
        Success: true,
      },
    });

  }

}
