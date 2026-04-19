import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Servicio centralizado de almacenamiento.
 * - Siempre intenta Capacitor Filesystem primero (nativo usa disco, web usa IndexedDB).
 * - Si Filesystem falla en web, hace fallback a localStorage solo para datos pequeños.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly DIR = Directory.Data;
  private readonly PREFIX = 'mapfont_cache_';
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async set(key: string, value: any): Promise<void> {
    const json = JSON.stringify(value);

    // Siempre intentar Filesystem primero (funciona en nativo y web via IndexedDB)
    try {
      await Filesystem.writeFile({
        path: `mapfont_cache/${key}.json`,
        data: json,
        directory: this.DIR,
        encoding: Encoding.UTF8,
        recursive: true
      });
      return; // Éxito, no necesitamos fallback
    } catch (error) {
      // En nativo esto no debería fallar, logueamos
      if (this.isNative) {
        console.error(`[StorageService] Filesystem error writing ${key}:`, error);
        return;
      }
      // En web, Filesystem puede fallar → evaluamos fallback
    }

    // EVITAR el fallback a localStorage si es el GeoJSON o si excede los 2MB
    if (key === 'geojson' || json.length > 2000000) {
      console.warn(`[StorageService] Se omitió el guardado en localStorage para "${key}" por superar el tamaño seguro.`);
      return;
    }

    // Fallback web: solo localStorage para datos < 2MB
    try {
      localStorage.setItem(this.PREFIX + key, json);
    } catch (e) {
      console.warn(`[StorageService] Could not cache "${key}" on web (too large for localStorage). Will re-fetch.`);
    }
  }

  async get(key: string): Promise<any> {
    // Intentar Filesystem primero
    try {
      const result = await Filesystem.readFile({
        path: `mapfont_cache/${key}.json`,
        directory: this.DIR,
        encoding: Encoding.UTF8
      });
      return JSON.parse(result.data as string);
    } catch {
      // No existe en Filesystem, intentar localStorage en web
    }

    if (!this.isNative) {
      try {
        const raw = localStorage.getItem(this.PREFIX + key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    return null;
  }

  async remove(key: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `mapfont_cache/${key}.json`,
        directory: this.DIR
      });
    } catch { }

    if (!this.isNative) {
      localStorage.removeItem(this.PREFIX + key);
    }
  }
}