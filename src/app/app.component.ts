import { Component, NgZone } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon, IonButton, IonButtons } from '@ionic/angular/standalone';
import { NavController } from "@ionic/angular";
import { TranslateService } from '@ngx-translate/core';
import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app';
import { SupabaseClientService } from './core/data/supabase.client';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    public NavCtrl: NavController,
    private transalte: TranslateService,
    private ngZone: NgZone,
    private supabaseService: SupabaseClientService
  ) {
    this.initializeApp();
  }

  private initializeApp() {
    this.transalte.addLangs(['es', 'ca', 'en']);
    const browserLang = this.transalte.getBrowserLang();
    const defaultLang = browserLang?.match(/es|ca|en/) ? browserLang : 'es';
    this.transalte.setDefaultLang(defaultLang);
    this.transalte.use(defaultLang);

    if (Capacitor.isNativePlatform()) {
      StatusBar.hide().catch(err => console.log('Error hiding status bar:', err));
    }

    // Manejo de Deep Links para Supabase Auth (Móvil)
    CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.ngZone.run(async () => {
        const url = new URL(event.url);
        // Supabase maneja los tokens en el hash (#access_token=...)
        if (url.hash || url.search) {
          const { data, error } = await this.supabaseService.supabase.auth.setSession({
            access_token: url.hash.split('access_token=')[1]?.split('&')[0] || '',
            refresh_token: url.hash.split('refresh_token=')[1]?.split('&')[0] || '',
          });
        }
      });
    });
  }
}

