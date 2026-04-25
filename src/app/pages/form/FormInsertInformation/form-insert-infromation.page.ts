import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

// Fachada de formulario
import { FormFacade } from '../../../core/facades/form.facade';

import {
  IonContent, IonIcon, IonInput, IonTextarea, IonToggle, IonSelect, IonSelectOption
} from "@ionic/angular/standalone";

import { addIcons } from 'ionicons';
import { arrowBackOutline, createOutline, waterOutline, calendarOutline, earthOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';

/**
 * @description
 * Paso 3 del Wizard de creación de fuentes. Captura metadatos visuales y somete los resultados de imágenes e información de base a FormFacade para su subida.
 *
 * @architecture
 * PATRÓN CLIENTE-CAMARERO-CHEF (Vista -> Fachada -> Repositorio)
 * - [CÓMO FUNCIONA]: Esta página actúa únicamente como CLIENTE visual. Su responsabilidad exclusiva es renderizar componentes HTML y capturar las interacciones con el usuario, delegando absolutamente la manipulación de base de datos a su respectivo "Camarero" (Fachada).
 * - [✔️ QUÉ SE DEBE HACER]: Inyectar la Fachada designada, suscribirse/llamar a los métodos de dicha Fachada y controlar flujos de navegación (NavCtrl).
 * - [❌ QUÉ ESTÁ PROHIBIDO HACER]: Inyectar capas arquitectónicas de Acceso a Datos nativo (como `UserRepository` o `SupabaseClientService`). Usar servicios de Background para consultar IDs de base de datos eludiendo a la Fachada competente.
 */
@Component({
  selector: 'app-form-insert-infromation',
  templateUrl: './form-insert-infromation.page.html',
  styleUrls: ['./form-insert-infromation.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonIcon, IonInput, IonTextarea, IonToggle, IonSelect, IonSelectOption, TranslateModule
  ]
})
export class FormInsertInfromationPage implements OnInit {
  @ViewChild('myForm') myForm!: NgForm;

  formData: any = {
    is_potable: false,
    enabled: true
  };

  lnglat: any;
  image: string = '';
  Adress: any;

  constructor(
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private formFacade: FormFacade
  ) {
    addIcons({ arrowBackOutline, createOutline, waterOutline, calendarOutline, earthOutline, checkmarkDoneOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.image = await params['image'];
      this.lnglat = await params['lnglat'];
      this.Adress = await params['Adress'];
    });
  }

  async onSubmit() {
    await this.formFacade.submitNewForm(this.formData, this.image, this.lnglat, this.Adress);
  }
}