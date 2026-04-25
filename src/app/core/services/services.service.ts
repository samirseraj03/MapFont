import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { WaterSourceRepository } from '../repositories/water-source.repository';

@Injectable({
  providedIn: 'root'
})
export class Services {

  constructor(
    private waterSourceRepository: WaterSourceRepository,
    private storage: StorageService
  ) { }

  // para obtener img ref y poder eliminarla en otras paginas
  public img_ref: any = null;
  public file_to_upload: any = null;

  // Guardar en filesystem (reemplaza Preferences)
  async setStorage(key: string, value: any) {
    await this.storage.set(key, value);
  }

  public clearUploadData() {
    this.img_ref = null;
    this.file_to_upload = null;
  }

  // Leer del filesystem (reemplaza Preferences)
  async getStorage(key: string) {
    return await this.storage.get(key);
  }

  // Eliminar del filesystem (reemplaza Preferences)
  async removeStorage(key: string) {
    await this.storage.remove(key);
    return 0;
  }

  // comprovar la ultima actulizacion del usuario
  async CheckLatestUpdateFontains(): Promise<boolean> {
    let LocaldateGeoJson: any = await this.getStorage('dateGeoJson');

    // Obtenemos la fecha del servidor
    let SupabseUpdateFountains: any = await this.waterSourceRepository.getUpdateDateFountains();

    // Verificamos que tengamos datos válidos del servidor
    if (!Array.isArray(SupabseUpdateFountains) || SupabseUpdateFountains.length === 0) {
      return false;
    }

    // Si tenemos datos locales y del servidor
    if (Array.isArray(LocaldateGeoJson) && LocaldateGeoJson.length > 0) {
      // Comparamos las fechas
      if (SupabseUpdateFountains[0].updated_at === LocaldateGeoJson[0].updated_at) {
        return true; // Están sincronizados
      } else {
        return false; // Necesita actualización
      }
    }
    // si no existe updated_at en el storage o está vacío
    else {
      await this.setStorage('dateGeoJson', SupabseUpdateFountains)
      return false
    }
  }
}
