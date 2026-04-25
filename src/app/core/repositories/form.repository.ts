import { Injectable } from '@angular/core';
import { SupabaseClientService } from '../data/supabase.client';
import { Forms } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class FormRepository {
  constructor(private client: SupabaseClientService) {}

  private get supabase() {
    return this.client.supabase;
  }

  async insertForm(newForm: Forms): Promise<any> {
    const { data, error } = await this.supabase.from('forms').insert(newForm).select();
    if (error) { throw error; }
    return data[0].id;
  }

  async updateForm(formId: number, updatedForm: Partial<Forms>): Promise<any> {
    const { data, error } = await this.supabase.from('forms').update(updatedForm).eq('id', formId).select();
    if (error) { throw error; }
    return data;
  }

  async deleteForm(formId: number): Promise<any> {
    const { data, error } = await this.supabase.from('forms').delete().eq('id', formId).select();
    if (error) { throw error; }
    return data;
  }

  async getFormsNotAproved(): Promise<any[]> {
    const { data, error } = await this.supabase.from('forms').select('*').is('approved', null);
    if (error) { return []; }
    return data || [];
  }

  async getFormsAproved(): Promise<any[]> {
    const { data, error } = await this.supabase.from('forms').select('*').is('approved', true);
    if (error) { return []; }
    return data || [];
  }

  async getFormsUser(userId: string) {
    const { data, error } = await this.supabase.from('forms').select('*').eq('autencationUserID', userId);
    if (error) { throw error; }
    return data;
  }
}
