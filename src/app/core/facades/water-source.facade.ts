import { Injectable } from '@angular/core';
import { WaterSourceRepository } from '../repositories/water-source.repository';
import { StorageRepository } from '../repositories/storage.repository';
import { AuthFacade } from './auth.facade';
import { Services } from '../services/services.service';

@Injectable({
  providedIn: 'root'
})
export class WaterSourceFacade {
  constructor(
    private waterSourceRepository: WaterSourceRepository,
    private storageRepository: StorageRepository,
    private authFacade: AuthFacade,
    private services: Services
  ) {}

  async loadAllWaterSources() {
    return await this.waterSourceRepository.getWaterSources();
  }

  async loadSavedFountains() {
    const userId = await this.authFacade.getCurrentUserId();
    if (!userId) return [];
    return await this.waterSourceRepository.getSavedFountains(userId);
  }

  async getSavedFountainWithUser(idFountain: number) {
    const userId = await this.authFacade.getCurrentUserId();
    if (!userId) return [];
    return await this.waterSourceRepository.getSavedFountainWithUser(userId, idFountain);
  }

  async getCurrentUserId() {
    return await this.authFacade.getCurrentUserId();
  }

  async toggleSavedFountain(fountainId: number, isCurrentlySaved: boolean, savedFountainRecordId?: number | null) {
    const userId = await this.authFacade.getCurrentUserId();
    if (!userId) throw new Error("No user ID");

    if (isCurrentlySaved && savedFountainRecordId) {
      await this.waterSourceRepository.deleteSavedFountain(savedFountainRecordId);
      return { isSaved: false, savedRecordId: null };
    } else {
      const result: any = await this.waterSourceRepository.insertSavedFountain(userId, fountainId);
      let newRecordId = null;
      if (result && result.length > 0) {
        newRecordId = result[0].id;
      } else if (result && result.id) {
        newRecordId = result.id;
      } else {
        const data: any = await this.waterSourceRepository.getSavedFountainWithUser(userId, fountainId);
        if (data && data.length > 0) newRecordId = data[0].id;
      }
      return { isSaved: true, savedRecordId: newRecordId };
    }
  }

  async getLastUpdateDate() {
    return await this.waterSourceRepository.getUpdateDateFountains();
  }

  getPhotoUrl(photo: string) {
    return this.storageRepository.getStorageUrl(photo);
  }

  async checkLatestUpdateFountains(): Promise<boolean> {
    let localdateGeoJson: any = await this.services.getStorage('dateGeoJson');
    let supabseUpdateFountains: any = await this.getLastUpdateDate();

    if (!Array.isArray(supabseUpdateFountains) || supabseUpdateFountains.length === 0) return false;

    if (Array.isArray(localdateGeoJson) && localdateGeoJson.length > 0) {
      if (supabseUpdateFountains[0].updated_at === localdateGeoJson[0].updated_at) {
        return true;
      }
      return false;
    } else {
      await this.services.setStorage('dateGeoJson', supabseUpdateFountains);
      return false;
    }
  }

  // --- Delegación de Gestión de Zonas Mapeables OSM --- //
  async insertNewWaterSource(waterSource: any) {
    return await this.waterSourceRepository.insertWaterSource(waterSource);
  }

  async isZoneScanned(zoneId: string) {
    return await this.waterSourceRepository.isZoneScanned(zoneId);
  }

  async markZoneAsScanned(zoneId: string) {
    return await this.waterSourceRepository.markZoneAsScanned(zoneId);
  }

  async unclaimZone(zoneId: string) {
    return await this.waterSourceRepository.unclaimZone(zoneId);
  }

  async insertMultipleForms(forms: any[]) {
    return await this.waterSourceRepository.insertMultipleForms(forms);
  }
}
