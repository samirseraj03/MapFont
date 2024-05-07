import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule , NavController} from '@ionic/angular';

@Component({
  selector: 'app-page-success',
  templateUrl: './page-success.page.html',
  styleUrls: ['./page-success.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PageSuccessPage implements OnInit {

  constructor( public NavCtrl : NavController) { }

  ngOnInit() {
  }


  

  GoToMap(){

    this.NavCtrl.navigateRoot( '/', {
      queryParams: {
        Success: true,
      },
    });

  }

}
