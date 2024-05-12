import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClient ,HttpClientModule} from '@angular/common/http';
import {TranslateModule , TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader  } from '@ngx-translate/http-loader';

import { routes } from '../app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

export function createTranslateLoader(http : HttpClient){
  return new TranslateHttpLoader(http , './assets/i18n/' ,  '.json')
}


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(TranslateModule.forRoot({
      loader : {
        provide :TranslateLoader ,
        useFactory : createTranslateLoader,
        deps : [HttpClient]
      }

    }
    )),
    provideRouter(routes),
  ],
});
