import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from './../../../environments/environment';

import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  public supabase: SupabaseClient;

  constructor(private storageService: StorageService) {
    const supabaseUrl = environment.SUPABASE_URL;
    const supabaseKey = environment.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Las variables de entorno SUPABASE_URL y SUPABASE_KEY deben estar definidas en el archivo .env'
      );
    }

    const customStorage = {
      getItem: (key: string) => this.storageService.get(key),
      setItem: (key: string, value: string) => this.storageService.set(key, value),
      removeItem: (key: string) => this.storageService.remove(key),
    };

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: customStorage as any,
        lock: (name: string, acquireTimeout: number, fn: () => Promise<any>) => fn()
      }
    });
  }
}
