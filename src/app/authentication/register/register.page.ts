import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import DatabaseService from '../../Types/SupabaseService';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage implements OnInit {
  email: any;
  password: any;
  username: any;
  loading : any
  data : any
  Supabase = new DatabaseService();


  constructor(
    private loadingController: LoadingController,
    public NavCtrl: NavController,
    private route: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    // verficamos si el usuario ha escrito antes el email para no hacer que lo escriba otra vez
    this.route.queryParams.subscribe(async (params) => {
      this.email = await params['email'];
    });
    if (this.email === undefined) {
      this.email = '';
    }
  }

  async Register() {

    this.loading = await this.loadingController.create({
      message: '',
      duration: 3000,
    });

    try {
      this.loading.present()
      this.data = this.authService.signUp(this.email , this.password)
      console.log(this.data.user)
      console.log(this.data.session)

     // this.Supabase.insertUser()

    }
    catch {

    }

    finally {
      this.loading.dismiss()
    }

  }

  OnSucces (){

  }

  GoLogin() {
    this.NavCtrl.navigateForward('/tabs/login', {
      queryParams: {
        email: this.email,
      },
    });
  }
}
