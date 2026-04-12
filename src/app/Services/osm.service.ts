import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { environment } from './../../environments/environment';
import { WaterSources } from '../Types/SupabaseService';

@Injectable({
    providedIn: 'root'
})
export class OsmService {

    constructor() { }

    // Función auxiliar: Para sacar la dirección real con Mapbox
    private async getAddressFromMapbox(lng: number, lat: number): Promise<string> {
        try {
            const response: AxiosResponse = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${environment.accessToken}`
            );

            if (response.data && response.data.features && response.data.features.length > 0) {
                return response.data.features[0].place_name; // Ej: "Calle Mayor 15, Madrid, España"
            }
            return "Dirección no disponible";
        } catch (error) {
            console.error("Error obteniendo dirección de Mapbox:", error);
            return "Dirección no especificada";
        }
    }

    // LA FUNCIÓN PRINCIPAL
    async fetchFountainsInBounds(south: number, west: number, north: number, east: number): Promise<WaterSources[] | null> {
        const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="drinking_water"](${south},${west},${north},${east});
        node["amenity"="water_point"](${south},${west},${north},${east});
        node["water"="not_drinking"](${south},${west},${north},${east});
      );
      out body;
    `;

        const url = 'https://overpass-api.de/api/interpreter';

        try {
            // FORMATO ESTRICTO para OSM
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'data=' + encodeURIComponent(overpassQuery)
            });

            // Si OSM nos banea (429) o se cae (500), devolvemos NULL para activar el castigo
            if (!response.ok) {
                console.warn(`OSM respondió con error ${response.status}. Activando bloqueo...`);
                return null;
            }

            // Leemos el texto puro primero para evitar errores de parseo JSON
            const textData = await response.text();

            if (!textData || textData.trim() === '') {
                return [];
            }

            const data = JSON.parse(textData);

            // CAZANDO EL ERROR FANTASMA: Si OSM envía un "remark", es un error de límite.
            if (data.remark) {
                console.warn("OSM envió un error fantasma (Límite o Timeout):", data.remark);
                return null;
            }

            const newFountains: WaterSources[] = [];

            // Si el JSON viene bien pero no hay fuentes (desierto real)
            if (!data || !data.elements || data.elements.length === 0) {
                return [];
            }

            for (const element of data.elements) {
                let isPotable = false;
                if (element.tags && element.tags.amenity === 'drinking_water') {
                    isPotable = true;
                }

                const realAddress = await this.getAddressFromMapbox(element.lon, element.lat);

                const fountain: WaterSources = {
                    location: {
                        latitude: element.lat,
                        longitude: element.lon
                    },
                    name: element.tags?.name || 'Fuente Pública',
                    address: realAddress,
                    ispotable: isPotable,
                    available: true,
                    created_at: new Date(),
                    photo: "",
                    description: "Fuente pública verificada a través del sistema global de OpenStreetMap.",
                    watersourcetype: "Public",
                    updated_at: new Date()
                };

                newFountains.push(fountain);
            }

            return newFountains;

        } catch (error) {
            console.error("Error crítico de red contactando a OSM:", error);
            return null; // Solo devolvemos NULL si falló gravemente
        }
    }
}