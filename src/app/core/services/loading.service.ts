import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    private currentLoader?: HTMLIonLoadingElement;

    constructor(private loadingCtrl: LoadingController) { }

    async show(message = 'Cargando...') {
        // Si ya hay uno, lo cerramos primero (evita stacking)
        await this.hide();

        this.currentLoader = await this.loadingCtrl.create({
            message,
            spinner: 'circles',
            backdropDismiss: false
        });
        await this.currentLoader.present();
    }

    async hide() {
        // 1. Cierra el que tenemos guardado
        if (this.currentLoader) {
            await this.currentLoader.dismiss().catch(() => { });
            this.currentLoader = undefined;
        }
        // 2. Por si acaso, fuerza el cierre de CUALQUIER loader que esté arriba
        await this.loadingCtrl.dismiss().catch(() => { });
    }
}