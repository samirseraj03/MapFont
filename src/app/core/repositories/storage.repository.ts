import { Injectable } from '@angular/core';
import { SupabaseClientService } from '../data/supabase.client';
import { AuthFacade } from '../facades/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class StorageRepository {
  constructor(private client: SupabaseClientService, private authFacade: AuthFacade) {}

  private get supabase() {
    return this.client.supabase;
  }

  isStringArray(data: unknown): data is string[] {
    return Array.isArray(data) && data.every((item) => typeof item === 'string');
  }

  IsBase64URL(url: string) {
    const regex = /^(data:)([a-zA-Z0-9+\/]+)(;base64,)(.*)$/;
    return regex.test(url);
  }

  async insertToStorage(file: any): Promise<string | null> {
    if (typeof file !== 'object') {
      return file;
    }
    let nombre = this.esNombreArchivoValido(file.name);
    let { data, error } = await this.supabase.storage.from('ImageWaterSource').upload(nombre, file);

    if (error && error.message === 'The resource already exists') {
      const userId = await this.authFacade.getCurrentUserId();
      const newName = `_mapfont_${new Date().getTime()}_${userId}_` + nombre;
      const result = await this.supabase.storage.from('ImageWaterSource').upload(newName, file);
      data = result.data;
      error = result.error;
      if (error) return null;
    } else if (error) {
      return null;
    }

    if (data && 'fullPath' in data) return data.fullPath;
    if (data && 'path' in (data as any)) return (data as any).path;
    return null;
  }

  getStorageUrl(urlImage: string) {
    return `https://xcperzkujymdzvhfuqgi.supabase.co/storage/v1/object/public/${urlImage.replace(/ /g, "%20")}`;
  }

  esNombreArchivoValido(nombreArchivo: string) {
    const caracteresProhibidos = ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', '-', ' '];
    let nombreArchivoCorregido = nombreArchivo;
    for (const caracter of caracteresProhibidos) {
      nombreArchivoCorregido = nombreArchivoCorregido.split(caracter).join('_');
    }
    return nombreArchivoCorregido.trim();
  }
}
