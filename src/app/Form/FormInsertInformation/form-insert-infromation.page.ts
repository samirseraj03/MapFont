import { Component ,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule ,NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NgForm } from '@angular/forms';



@Component({
  selector: 'app-form-insert-infromation',
  templateUrl: './form-insert-infromation.page.html',
  styleUrls: ['./form-insert-infromation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FormInsertInfromationPage  {

  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON


  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();

  // Método para recopilar la información del formulario
  onSubmit() {
    if (this.myForm.valid) {
      this.formData = this.myForm.value;
      console.log(this.formData); // Aquí puedes hacer lo que quieras con los datos recolectados
      this.ToDataBase();
      this.GoSuccess();
    }
    else {
      alert("completa los ultimos datos para continuar")
    }
  }

  ToDataBase(){
    
  }
  // para mostarar al usuario pagina completada y ir al inicio
  GoSuccess(){
    this.NavCtrl.navigateForward( '/Success', {
      state: {
        Success: true,
      },
    });
  }


}
