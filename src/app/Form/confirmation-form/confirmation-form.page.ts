import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import DatabaseService from '../../Types/SupabaseService';
import { arrowBack, heartDislike, navigate ,checkmark , chevronForward} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-confirmation-form',
  templateUrl: './confirmation-form.page.html',
  styleUrls: ['./confirmation-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ConfirmationFormPage implements OnInit {

  results : any = []
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();


  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack , heartDislike, navigate , checkmark ,chevronForward });
  }

  ngOnInit() {
    this.GetFormsDataBase();
  }

  OnSelect(result : any){

  }


  timestampToDateString(timestamp: number): string {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses comienzan en 0
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }


 // obtener todos los elementos de forms
 async GetFormsDataBase(){
   this.results = await this.Supabase.getForms();
}



ViewForm(){
  this.NavCtrl.navigateForward( '/viewForm', {
    state: {
      id : this.results.id,
      data : this.results,
    },
  });
}




}
