import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClientService } from '../data/supabase.client'; // Cambiado a client

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  
  constructor(
    private router: Router,
    private client: SupabaseClientService
  ) { }

  private get supabase() {
    return this.client.supabase;
  }

  async signIn(email: string, password: string) {
    try {
       const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
       if (error) throw error;
       return data;
    } catch (error) {
       console.error('Error al iniciar sesión:', error);
       throw error;
    }
  }

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({ email, password });
      if (error) {
        console.log(error);
        return undefined;
      }
      return data;
    } catch (error) {
      console.error('Error al registrar:', error);
      return undefined;
    }
  }

  async signOut() {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  async updateUser(data: any) {
    const { error: updateError } = await this.supabase.auth.updateUser(data);
    if (updateError) {
      console.error(updateError);
      return null;
    } else {
      return 'Success';
    }
  }

  async signInWithGoogle() {
    return this.supabase.auth.signInWithOAuth({
      provider: 'google'
    });
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async getSession() {
    return this.supabase.auth.getSession();
  }
}