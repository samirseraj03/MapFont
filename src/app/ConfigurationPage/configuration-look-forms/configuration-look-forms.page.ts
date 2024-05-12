import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ConfigurationTabPage } from '../configuration-tab/configuration-tab.page';
import { arrowBack, chevronForward } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import GeolocationService from 'src/app/Globals/Geolocation';
import { TabsPage } from 'src/app/tabs/tabs.page';
import DatabaseService from '../../Types/SupabaseService';
import { LoginPage } from '../../authentication/login/login.page';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonMenu,
  IonMenuButton,
  IonContent,
  IonCard,
  IonCardTitle,
  IonCardHeader,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { AgGridAngular } from 'ag-grid-angular'; // Angular Data Grid Component
import { ColDef } from 'ag-grid-community'; // Column Definition Type Interface
import { TranslateModule , TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-configuration-look-forms',
  templateUrl: './configuration-look-forms.page.html',
  styleUrls: ['./configuration-look-forms.page.scss'],
  standalone: true,
  imports: [
    AgGridAngular,
    IonButton,
    IonIcon,
    IonButtons,
    IonLabel,
    IonItem,
    IonList,
    IonSearchbar,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
    ConfigurationTabPage,
    TabsPage,
    IonMenu,
    IonMenuButton,
    TranslateModule
  ],
})
export class ConfigurationLookFormsPage implements OnInit {
  data: any[] = [];
  GeolocationService = new GeolocationService();
  Supabase = new DatabaseService();
  user_data: any;
  username: any;

  constructor(public NavCtrl: NavController, private AuthService: LoginPage , private Transalte : TranslateService) {
    addIcons({ arrowBack, chevronForward });
  }

  // para ponerlo en el html
  public results = [...this.data];
  // imports

  // Column Definitions: Defines the columns to be displayed.
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'id:' },
    { field: 'watersourcesname', headerName: 'Nombre:' },
    {
      field: 'approved',
      headerName: 'Estado:',

      cellRenderer: (params: any) => {
        const rowData = params.data;
        var buttonsHTML;

        if (rowData.approved == true) {
          buttonsHTML = `
        <ion-label " class="text-success text-center">${this.Transalte.instant('approved')}</ion-label>
     `;
        } else if (rowData.approved == false) {
          buttonsHTML = `
         <ion-label  class="text-danger text-center">${this.Transalte.instant('rejected')}</ion-label>
     `;
        } else if (rowData.approved == null) {
          buttonsHTML = `
         <ion-label  class="text-danger text-center">${this.Transalte.instant('pending')}</ion-label>
     `;
        }
        return buttonsHTML;
      },
    },
    { field: 'created_at', headerName: 'Creado:' },
    {
      field: '',
      headerName: '',
      cellRenderer: (params: any) => {
        const rowData = params.data;

        const onSelect = () => this.OnSelect(rowData);

        const buttonsHTML = `
          <ion-buttons class="d-flex justify-content-end">
            <ion-button id="selectBtn">
              <ion-icon name="chevron-forward"></ion-icon>
            </ion-button>
          </ion-buttons>
        `;

        // Crear un elemento div temporal para contener los botones y registrar los eventos de clic
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buttonsHTML;

        // Agregar los eventos de clic a los botones solo si existen
        const selectBtn = tempDiv.querySelector('#selectBtn');

        if (selectBtn) {
          selectBtn.addEventListener('click', onSelect);
        }

        return tempDiv;
      },
    },
  ];

  async ngOnInit() {
    // cogemos el user_id del usuario
    this.user_data = await this.GeolocationService.getUserID();
    this.username = await this.Supabase.getUserName(this.user_data);
    // cogemos lo datos
    this.data = (await this.Supabase.getFormsUser(this.user_data)) as any[];
    // aseguramos que se importen los datos a la tabla
    this.results = [...this.data];
  }

  ToSearch() {}

  // llevamos
  OnSelect(result: any) {
    this.NavCtrl.navigateForward('/viewForm', {
      queryParams: {
        id: result.id,
        data: JSON.stringify(result),
        username: this.username[0].username,
      },
    });
  }

  // para buscar de la lista que estara creada
  SearchElement(event: any) {
    const query = event.target.value.trim().toLocaleLowerCase();
    this.results = this.data.filter((item) => {
      const values = Object.values(item).map((value) => {
        if (typeof value === 'string') {
          return value.trim().toLocaleLowerCase();
        } else if (typeof value === 'number') {
          return value.toString(); // Convertir el número a string
        } else if (typeof value === 'boolean') {
          return value ? 'aprobado' : 'rechazado'; // Convertir booleano a texto
        }
        return ''; // Otros tipos de datos
      });
      return values.some((value) => value.includes(query));
    });
  }
}
