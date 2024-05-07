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
import {Forms} from 'src/app/Types/SupabaseService';





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
      this.ToDataBase();
      this.GoSuccess();
    }
    else {
      alert("completa los ultimos datos para continuar")
    }
  }

  async ToDataBase(){

    // preparamos las variables a insertar para el forumulario

    let user_id =  await this.GeolocationService.getUserID()
    let data_user = await this.DatabaseService.getUser(user_id)
    this.lnglat = {
      "latitude": this.lnglat[1],
      "longitude": this.lnglat[0],
    }
    let image = await this.DatabaseService.InsertToStoarge(this.image)
    let form : Forms = {
      username : data_user[0].username,
      watersourcesname: this.formData.watersourcesname ,
      created_at: new Date(),
      location: this.lnglat ,
      photo: image,
      address: this.Adress ,
      description: this.formData.description,
      is_potable: this.formData.is_potable,
      watersourcetype: this.formData.watersourcetype ,
      approved: null , 
      autencationUserID : user_id
    }

    // insertamos los datos a la base de datos
    this.DatabaseService.insertForm(form)
    
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
