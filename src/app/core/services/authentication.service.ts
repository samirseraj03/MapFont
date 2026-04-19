import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import DatabaseService from '../data/SupabaseService';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  constructor(
    private router: Router,
    private db: DatabaseService
  ) { }

  /**
   * Inicia sesión con email y contraseña.
   * Usa el método encapsulado de DatabaseService.
   */
  async signIn(email: string, password: string) {
    try {
      const { data: { user, session }, error } = await this.db.signIn(email, password);
      if (error) {
        throw error;
      }
      return { user, session };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  /**
   * Registra un nuevo usuario.
   */
  async signUp(email: string, password: string) {
    try {
      const { data: { user, session }, error } = await this.db.signUp(email, password);
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

  /**
   * Cierra la sesión del usuario actual.
   */
  async signOut() {
    try {
      await this.db.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Actualiza datos del usuario autenticado (ej: contraseña, metadata).
   */
  async updateUser(data: any) {
    const { error: updateError } = await this.db.updateAuthUser(data);
    if (updateError) {
      console.error(updateError);
      return null;
    } else {
      return 'Success';
    }
  }
}