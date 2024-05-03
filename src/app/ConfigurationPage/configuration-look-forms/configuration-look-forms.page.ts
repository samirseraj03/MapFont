import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { TabsPage } from 'src/app/tabs/tabs.page';
import DatabaseService from '../../Types/SupabaseService';
import { LoginPage } from '../../authentication/login/login.page';



@Component({
  selector: 'app-configuration-look-forms',
  templateUrl: './configuration-look-forms.page.html',
  styleUrls: ['./configuration-look-forms.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule ,ConfigurationTabPage ,TabsPage]
})
export class ConfigurationLookFormsPage implements OnInit {

  
  data: any[] = [ ]
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();
  user_data : any  
  
  constructor(public NavCtrl: NavController , private AuthService : LoginPage) {
    addIcons({ arrowBack });
  }

  // para ponerlo en el html
  public results = [...this.data];
  // imports
  

 async ngOnInit() {
    // cogemos el user_id del usuario 
    this.user_data = await this.GeolocationService.getUserID()
    // cogemos lo datos
    this.data = await this.Supabase.getFormsUser(this.user_data) as any[];
    // aseguramos que se importen los datos a la tabla
    this.results = [...this.data]
  }


  ToSearch(){

  }

  // llevamos 
  OnSelect(result : any){
    this.NavCtrl.navigateForward('viewForm' , {
      queryParams: {
        id : result.id,
        data: result,
      },
    })
  }

  

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
