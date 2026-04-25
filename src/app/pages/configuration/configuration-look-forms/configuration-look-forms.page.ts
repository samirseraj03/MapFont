import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';

// Standalone Components limpios
import {
  IonHeader, IonContent, IonIcon
} from '@ionic/angular/standalone';

// Lógica y Servicios
import GeolocationService from '../../../core/utils/Geolocation';
import { FormFacade } from '../../../core/facades/form.facade';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Iconos necesarios para el nuevo diseño de tarjetas
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, searchOutline, documentText, water,
  locationOutline, calendarClearOutline, chevronForwardOutline,
  checkmarkCircle, closeCircle, time, documentOutline
} from 'ionicons/icons';

/**
 * @description
 * Lista las fuentes sometidas y los estatus de contribución (Formularios pendientes/aprobados). Actúa como cliente del FormFacade que absorbe ambos listados.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-configuration-look-forms',
  templateUrl: './configuration-look-forms.page.html',
  styleUrls: ['./configuration-look-forms.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, IonIcon, CommonModule, FormsModule, TranslateModule
  ],
})
export class ConfigurationLookFormsPage implements OnInit {

  data: any[] = [];
  public results: any[] = [];

  user_data: any;
  username: any;

  constructor(
    public NavCtrl: NavController,
    private Transalte: TranslateService,
    private formFacade: FormFacade,
    public GeolocationService: GeolocationService
  ) {
    // Registramos todos los iconos utilizados
    addIcons({
      arrowBackOutline, searchOutline, documentText, water,
      locationOutline, calendarClearOutline, chevronForwardOutline,
      checkmarkCircle, closeCircle, time, documentOutline
    });
  }

  async ngOnInit() {
    // Obtenemos la ID 
    this.user_data = await this.formFacade.getCurrentUserId();
    this.username = [{username: "Autor"}]; 

    // Obtenemos los formularios de la base de datos
    this.data = (await this.formFacade.loadUserForms()) as any[];

    // Asignamos a la variable que se muestra en el HTML
    this.results = [...this.data];
  }

  // Navegación al seleccionar una tarjeta
  OnSelect(result: any) {
    this.NavCtrl.navigateForward('/viewForm', {
      queryParams: {
        id: result.id,
        data: JSON.stringify(result),
        username: this.username[0].username,
      },
    });
  }

  // Buscador local
  SearchElement(event: any) {
    const query = event.target.value.trim().toLocaleLowerCase();

    if (!query) {
      this.results = [...this.data];
      return;
    }

    this.results = this.data.filter((item) => {
      const values = Object.values(item).map((value) => {
        if (typeof value === 'string') {
          return value.trim().toLocaleLowerCase();
        } else if (typeof value === 'number') {
          return value.toString();
        } else if (typeof value === 'boolean') {
          // Si el usuario busca "aprobado" o "rechazado", lo filtramos también
          return value ? 'aprobado' : 'rechazado';
        }
        return '';
      });
      return values.some((value) => value.includes(query));
    });
  }
}