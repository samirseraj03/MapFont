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

  data: any[] = [
    {
      id: 1,
      fecha: '2024-04-12',
      nombre: 'Juan',
      aprobacion: true,
      ultimo: 'Iglesia'
    },
    {
      id: 2,
      fecha: '2024-04-11',
      nombre: 'María',
      aprobacion: false,
      ultimo: 'Trabajo'
    },
    {
      id: 3,
      fecha: '2024-04-10',
      nombre: 'Carlos',
      aprobacion: true,
      ultimo: 'Casa'
    },
    {
      id: 4,
      fecha: '2024-04-09',
      nombre: 'Ana',
      aprobacion: true,
      ultimo: 'Supermercado'
    },
    {
      id: 5,
      fecha: '2024-04-08',
      nombre: 'Luis',
      aprobacion: false,
      ultimo: 'Parque'
    },
    {
      id: 6,
      fecha: '2024-04-07',
      nombre: 'Sofía',
      aprobacion: true,
      ultimo: 'Gimnasio'
    },
    {
      id: 7,
      fecha: '2024-04-06',
      nombre: 'Pedro',
      aprobacion: false,
      ultimo: 'Cine'
    },
    {
      id: 8,
      fecha: '2024-04-05',
      nombre: 'Laura',
      aprobacion: true,
      ultimo: 'Restaurante'
    },
    {
      id: 9,
      fecha: '2024-04-04',
      nombre: 'Pablo',
      aprobacion: false,
      ultimo: 'Biblioteca'
    },
    {
      id: 10,
      fecha: '2024-04-03',
      nombre: 'Elena',
      aprobacion: true,
      ultimo: 'Playa'
    }
  ];

  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack });
  }
  GeolocationService = new GeolocationService();

  ngOnInit() {
  }


  ToSearch(){

  }

  OnSelect(result : any){

  }

  public results = [...this.data];


  // para buscar de la lista que estara creada
  SearchElement(event: any) {
    const query = event.target.value.trim().toLocaleLowerCase();
    this.results = this.data.filter(item => {
      const values = Object.values(item).map(value => {
        if (typeof value === 'string') {
          return value.trim().toLocaleLowerCase();
        } else if (typeof value === 'number') {
          return value.toString(); // Convertir el número a string
        } else if (typeof value === 'boolean') {
          return value ? 'aprobado' : 'rechazado'; // Convertir booleano a texto
        }
        return ''; // Otros tipos de datos
      });
      return values.some(value => value.includes(query));
    });
  }
  
}
