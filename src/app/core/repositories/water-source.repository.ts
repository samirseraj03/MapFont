import { Injectable } from '@angular/core';
import { SupabaseClientService } from '../data/supabase.client';
import { WaterSources } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class WaterSourceRepository {
  constructor(private client: SupabaseClientService) {}

  private get supabase() {
    return this.client.supabase;
  }

  async insertWaterSource(newSource: WaterSources): Promise<any> {
    const { data, error } = await this.supabase.from('watersources').insert(newSource).select();
    if (error) { throw error; }
    return data[0].id;
  }

  async updateWaterSource(sourceId: number, updatedSource: Partial<WaterSources>): Promise<any> {
    const { data, error } = await this.supabase.from('watersources').update(updatedSource).eq('id', sourceId).select();
    if (error) { throw error; }
    return data;
  }

  async deleteWaterSource(sourceId: number): Promise<any> {
    const { data, error } = await this.supabase.from('watersources').delete().eq('id', sourceId).select();
    if (error) { throw error; }
    return data;
  }

  async getWaterSources() {
    const { data, error } = await this.supabase.from('watersources').select('*');
    if (error) { throw error; }
    return data;
  }

  async deleteSavedFountain(savedFountainId: number) {
    const { error } = await this.supabase.from('savedfountains').delete().eq('id', savedFountainId);
    if (error) return null;
    return 'Success';
  }

  async insertSavedFountain(userId: string, idFountain: number) {
    const savedFountain = {
      autencationUserID: userId,
      waterSource_id: idFountain,
      created_at: new Date()
    };
    const { data, error } = await this.supabase.from('savedfountains').insert(savedFountain).select();
    if (error) { throw error; }
    return data;
  }

  async getSavedFountainWithUser(userId: string, idFountain: number) {
    const { data, error } = await this.supabase.from('savedfountains').select('*').eq('autencationUserID', userId).eq('waterSource_id', idFountain);
    if (error) { throw error; }
    return data;
  }

  async getSavedFountains(userId: string) {
    const { data: savedFountainsData, error: fountainsError } = await this.supabase.from('savedfountains').select('*').eq('autencationUserID', userId);
    if (fountainsError) { throw fountainsError; }

    const fountains_id = savedFountainsData.map(f => f.waterSource_id);
    if (fountains_id.length === 0) return [];

    const { data: FountainsData, error: FountainsError } = await this.supabase.from('watersources').select('*').in('id', fountains_id);
    if (FountainsError) { throw FountainsError; }

    const matchedFountains = [];
    for (const fountain of savedFountainsData) {
      const matchedWaterSources = FountainsData.filter(ws => ws.id === fountain.waterSource_id);
      for (const matchedWaterSource of matchedWaterSources) {
        matchedFountains.push({
          savedFountain: fountain,
          matchedWaterSource: matchedWaterSource,
        });
      }
    }
    return matchedFountains;
  }

  async getUpdateDateFountains() {
    const { data, error } = await this.supabase.from('watersources').select('updated_at').order('updated_at', { ascending: false }).limit(1);
    if (error) { throw error; }
    return data;
  }

  async isZoneScanned(zoneId: string): Promise<boolean> {
    const { data, error } = await this.supabase.from('scraped_zones').select('zone_id').eq('zone_id', zoneId).limit(1);
    if (error) return false;
    return data && data.length > 0;
  }

  async markZoneAsScanned(zoneId: string) {
    const { error } = await this.supabase.from('scraped_zones').upsert([{ zone_id: zoneId }], { onConflict: 'zone_id' });
    if (error) { console.error('Error silencioso al guardar zona:', error); }
  }

  async insertMultipleForms(forms: any[]) {
    if (forms.length === 0) return null;
    const { data, error } = await this.supabase.from('watersources').insert(forms).select();
    if (error) return null;
    return data;
  }

  async unclaimZone(zoneId: string) {
    await this.supabase.from('scraped_zones').delete().eq('zone_id', zoneId);
  }
}
