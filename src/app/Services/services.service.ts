import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import DatabaseService from '../Types/SupabaseService';

@Injectable({
  providedIn: 'root'
})
export class Services {

  constructor(private Supabase: DatabaseService) { }

  // para obtener img ref y poder eliminarla en otras paginas
  public img_ref: any = null;
  public file_to_upload: any = null;

  // para guardar en storage y en andoroid y ios informacion temportal
  async setStorage(key: string, value: any) {
    await Preferences.set({ key: key, value: JSON.stringify(value) });
  }


  public clearUploadData() {
    this.img_ref = null;
    this.file_to_upload = null;
  }


  // para obtener en storage y en andoroid y ios informacion temportal
  async getStorage(key: string) {
    const ret = await Preferences.get({ key: key });
    if (ret.value === null) {
      return null;
    } else {
      return JSON.parse(ret.value);
    }
  }

  // para eliminar en storage y en andoroid y ios informacion temportal
  async removeStorage(key: string) {
    await Preferences.remove({ key: key });
    return 0;
  }




  // comprovar la ultima actulizacion del usuario
  async CheckLatestUpdateFontains(): Promise<boolean> {
    let LocaldateGeoJson: any = await this.getStorage('dateGeoJson');

    // Obtenemos la fecha del servidor
    let SupabseUpdateFountains: any = await this.Supabase.getUpdateDateFountains();

    // Verificamos que tengamos datos válidos del servidor
    if (!Array.isArray(SupabseUpdateFountains) || SupabseUpdateFountains.length === 0) {
      // Si no hay datos en el servidor, devolvemos false (forzar actualización o manejar vacío)
      // Si no hay fuentes, tal vez queramos borrar el local.
      // Por seguridad, si el servidor no devuelve nada, asumimos que no hay coincidencia
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
      // Guardamos la nueva fecha y devolvemos false para indicar que se debe actualizar el mapa
      await this.setStorage('dateGeoJson', SupabseUpdateFountains)
      return false
    }
  }
}
