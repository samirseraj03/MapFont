import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// Importamos tu DatabaseService (asegúrate de que la ruta es correcta según tus carpetas)
import DatabaseService from '../Types/SupabaseService';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  // Ya no creamos la conexión aquí, inyectamos el DatabaseService
  constructor(
    private router: Router,
    private db: DatabaseService
  ) { }

  async signIn(email: string, password: string) {
    try {
      // Usamos this.db.supabase en lugar de this.supabase
      const {
        data: { user, session },
        error,
      } = await this.db.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return { user, session };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      const { data: { user, session }, error } = await this.db.supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        console.log(error);
        return undefined;
      }
      return { user, session };
    } catch (error) {
      console.error('Error al registrar:', error);
      return undefined;
    }
  }

  async signOut() {
    try {
      await this.db.supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  async updateUser(data: any) {
    const { error: updateError } = await this.db.supabase.auth.updateUser(data);
    if (updateError) {
      console.error(updateError);
      return null;
    } else {
      return 'Success';
    }
  }
}