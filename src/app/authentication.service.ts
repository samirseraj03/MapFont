import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private supabase: SupabaseClient | undefined;

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_KEY
    );
  }

  async signIn(email: string, password: string) {
    try {
      if (this.supabase) {
        const {
          data: { user, session },
          error,
        } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw error;
        }
        return { user, session };
      } else {
        // Explicitly return void or undefined here (depending on your logic)
        return undefined; // Or return void;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string ) {
    try {
      if (this.supabase) {
        const {  data: { user, session } ,  error, } = await this.supabase.auth.signUp({
          email : email,
          password : password,
        });
        if (error) {
          console.log(error)
          return undefined
        }
        return { user , session };
      }
      else {
        // Explicitly return void or undefined here (depending on your logic)
        return undefined; // Or return void;
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      return undefined
    }
  }

  async signOut() {
    try {
      if (this.supabase) {
        await this.supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  async updateUser(data : any){

    if (this.supabase){
      const { error: updateError } = await this.supabase.auth.updateUser(data) 
      if (updateError){
        console.error(updateError)
        return null
      }
      else {
        return 
      }
    }
    else {
      return null
    }


  }



}
