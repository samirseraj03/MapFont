import { Component , Output ,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-buttons-confirmation-form',
  templateUrl: './buttons-confirmation-form.component.html',
  styleUrls: ['./buttons-confirmation-form.component.scss'],
  standalone: true,
  template: `<ion-buttons class="d-flex justify-content-end">
  <ion-button (click)="OnSelectNavigate()">
    <ion-icon name="navigate"></ion-icon>
  </ion-button>
  <ion-button (click)="OnConfirm()">
    <ion-icon name="checkmark"></ion-icon>
  </ion-button>
  <ion-button (click)="OnSelect()">
    <ion-icon name="chevron-forward"></ion-icon>
  </ion-button>
</ion-buttons>`,
})
export class ButtonsConfirmationFormComponent  {


  @Output() selectNavigate = new EventEmitter();
  @Output() confirm = new EventEmitter();
  @Output() select = new EventEmitter();

  constructor() { }

  OnSelectNavigate(data: any) {
    // Emitir los datos al componente padre
    this.selectNavigate.emit(data);
  }

  OnConfirm(data : any) {
    this.confirm.emit(data);
  }

  OnSelect(data : any) {
    this.select.emit(data);
  }

}
