import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { environment } from './../../../environments/environment';
import { WaterSources } from '../models/database.models';

@Injectable({
    providedIn: 'root'
})
export class OsmService {

    // Lista de servidores Overpass
    private overpassEndpoints = [
        'https://overpass.openstreetmap.fr/api/interpreter', // 2. Respaldo (Francia - Muy estable y rápido)


        'https://lz4.overpass-api.de/api/interpreter',       // 3. Balanceador oficial rápido
        'https://overpass-api.de/api/interpreter',           // 1. Principal (Alemania)

        'https://z.overpass-api.de/api/interpreter',         // 4. Segundo balanceador oficial
        'https://overpass.openstreetmap.ru/api/interpreter'  // 5. Respaldo final (Rusia - A veces lento)
    ];

    constructor() { }

    private async getAddressFromMapbox(lng: number, lat: number): Promise<string> {
        try {
            const response: AxiosResponse = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${environment.accessToken}`
            );

            if (response.data && response.data.features && response.data.features.length > 0) {
                return response.data.features[0].place_name;
            }
            return "Dirección no disponible";
        } catch (error) {
            console.error("Error obteniendo dirección de Mapbox:", error);
            return "Dirección no especificada";
        }
    }

    async fetchFountainsInBounds(south: number, west: number, north: number, east: number): Promise<WaterSources[] | null> {

        const overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"~"drinking_water|water_point"](${south},${west},${north},${east});
            node["water"="not_drinking"](${south},${west},${north},${east});
          );
          out body qt; 
        `;

        let textData = '';
        let success = false;

        // BUCLE DE SERVIDORES DE RESPALDO
        for (const url of this.overpassEndpoints) {

            // 🚨 EL SALVAVIDAS: Creamos un controlador que abortará la petición si tarda más de 25 segundos
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            try {
                console.log(`Intentando conectar a OSM a través de: ${url}...`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'data=' + encodeURIComponent(overpassQuery),
                    signal: controller.signal // Inyectamos el salvavidas
                });

                clearTimeout(timeoutId); // Si responde a tiempo, cancelamos el salvavidas

                if (response.ok) {
                    textData = await response.text();
                    success = true;
                    break; // ¡Éxito! Salimos del bucle y dejamos de probar servidores.
                }
                // 🚨 NUEVO COMPORTAMIENTO 429: Ahora simplemente probamos el siguiente servidor
                else if (response.status === 429) {
                    console.warn(`[OSM] Servidor ${url} nos bloqueó (429 Too Many Requests). Probando siguiente...`);
                    continue;
                }
                else if (response.status === 504) {
                    console.warn(`[OSM] Timeout (504) en ${url}. Probando siguiente...`);
                    continue;
                }
                else {
                    console.warn(`[OSM] Error ${response.status} en ${url}. Probando siguiente...`);
                    continue;
                }
            } catch (err: any) {
                clearTimeout(timeoutId);

                // Si el error es porque nuestro salvavidas cortó la conexión (el servidor se quedó colgado)
                if (err.name === 'AbortError') {
                    console.warn(`[OSM] El servidor ${url} se quedó colgado (más de 25s). Abortado. Probando siguiente...`);
                } else {
                    console.error(`[OSM] Falló la red con ${url}:`, err);
                }
                // Continuamos al siguiente servidor automáticamente
            }
        }

        // Si recorrimos TODOS los servidores y ninguno funcionó (todos dieron 429, 504 o se colgaron)
        if (!success || !textData) {
            console.error("Colapso total: Ningún servidor de Overpass está disponible en este momento.");
            return null; // Esto enviará el 'null' a Fonts.page.ts y activará el castigo de 1 minuto
        }

        try {
            const data = JSON.parse(textData);

            if (data.remark && data.remark.includes("timed out")) {
                console.warn("OSM envió un error de TIMEOUT interno:", data.remark);
                return [];
            }

            if (!data || !data.elements || data.elements.length === 0) {
                return [];
            }

            const newFountains: WaterSources[] = [];

            const fountainPromises = data.elements.map(async (element: any) => {
                let isPotable = false;
                if (element.tags && element.tags.amenity === 'drinking_water') {
                    isPotable = true;
                }

                const realAddress = await this.getAddressFromMapbox(element.lon, element.lat);

                const fountain: WaterSources = {
                    location: { latitude: element.lat, longitude: element.lon },
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

                return fountain;
            });

            const resolvedFountains = await Promise.all(fountainPromises);
            newFountains.push(...resolvedFountains);

            return newFountains;

        } catch (error) {
            console.error("Error crítico parseando los datos de OSM:", error);
            return null;
        }
    }
}