import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import DatabaseService from '../app/Types/SupabaseService';

@Injectable({
  providedIn: 'root'
})
export class Services {

  constructor() { }

  // para obtener img ref y poder eliminarla en otras paginas
  img_ref: any;
  Supabase = new DatabaseService();

    // para guardar en storage y en andoroid y ios informacion temportal
    async setStorage(key: string, value: any) {
      await Preferences.set({ key: key, value: JSON.stringify(value) });
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
  async CheckLatestUpdateFontains() :Promise<boolean>{
    let LocaldateGeoJson  : any = await this.getStorage('dateGeoJson');
    if (LocaldateGeoJson) {
      let SupabseUpdateFountains : any = await this.Supabase.getUpdateDateFountains()       
      // si existe el storage y coincide con la ultima actulizacion succes y ponemos necesidad de update en false
       if (SupabseUpdateFountains[0].updated_at === LocaldateGeoJson[0].updated_at){
          return true
       }
       else {
          return false
       }
    }
    // si no existe updated_at en el storage, lo creamos pero lo dejamos en false para que cuando se haga un update secundario.
    else {
      let dateGeoJson = await this.Supabase.getUpdateDateFountains()
      await this.setStorage('dateGeoJson' , dateGeoJson )
      return false
    }
  }
}
