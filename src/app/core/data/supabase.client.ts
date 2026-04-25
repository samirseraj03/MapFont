import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  public supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = environment.SUPABASE_URL;
    const supabaseKey = environment.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: true }
    });
  }
}
