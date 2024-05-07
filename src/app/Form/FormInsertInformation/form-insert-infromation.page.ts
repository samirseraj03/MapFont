import { Component ,OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule ,NavController } from '@ionic/angular';
import GeolocationService from '../../Globals/Geolocation';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import DatabaseService from 'src/app/Types/SupabaseService';




@Component({
  selector: 'app-form-insert-infromation',
  templateUrl: './form-insert-infromation.page.html',
  styleUrls: ['./form-insert-infromation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class FormInsertInfromationPage implements OnInit  {

  @ViewChild('myForm') myForm!: NgForm; // Obtén una referencia al formulario usando ViewChild
  formData: any = {}; // Variable para almacenar los datos del formulario en formato JSON
  lnglat : any ;
  image : any;
  Adress: any;


  constructor(public NavCtrl: NavController , private route : ActivatedRoute) {
    addIcons({ arrowBack });
  }
  
  GeolocationService = new GeolocationService();
  DatabaseService = new DatabaseService()


  ngOnInit() {

    this.route.queryParams.subscribe(async (params) => {
      this.image = await params['image'];
      this.lnglat = await params['lnglat'];
      this.Adress = await params['Adress'];
    });
  }


  // Método para recopilar la información del formulario
  onSubmit() {
    if (this.myForm.valid) {
      this.formData = this.myForm.value;
      console.log(this.formData); // Aquí puedes hacer lo que quieras con los datos recolectados
      this.ToDataBase();
     // this.GoSuccess();
    }
    else {
      alert("completa los ultimos datos para continuar")
    }
  }

  ToDataBase(){

    // preparamos las variables a insertar para el forumulario
    

    console.log(this.lnglat)
    console.log(this.Adress)
    console.log(this.image)
    console.log(this.formData)
    this.DatabaseService.insertForm()
    
  }
  // para mostarar al usuario pagina completada y ir al inicio
  GoSuccess(){
    this.NavCtrl.navigateForward( '/Success', {
      queryParams: {
        page : 'form',
        Success: true,
      },
    });
  }


}
