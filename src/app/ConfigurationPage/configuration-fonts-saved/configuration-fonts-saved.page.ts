import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack, heartDislike, navigate } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';

@Component({
  selector: 'app-configuration-fonts-saved',
  templateUrl: './configuration-fonts-saved.page.html',
  styleUrls: ['./configuration-fonts-saved.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule ,ConfigurationTabPage]
})
export class ConfigurationFontsSavedPage implements OnInit {

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

  public results = [...this.data];


  constructor(public NavCtrl: NavController) {
    addIcons({ arrowBack , navigate , heartDislike });
  }
  GeolocationService = new GeolocationService();

  ngOnInit() {
  }


  OnSelect(result : any){

  }

  ToSearch(){

  }

  SearchElement(event: any) {
    const query = event.target.value.toLocaleLowerCase();
    this.results = this.data.filter(item => {
      const values = Object.values(item).map(value => {
        if (typeof value === 'string') { // Verificación de tipo
          return value.toLocaleLowerCase();
        }
        return ''; // O cualquier otro valor predeterminado para tipos no string
      });
      return values.some(value => value.includes(query));
    });
  }
}
