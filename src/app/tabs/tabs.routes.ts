import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      // 🌍 Ruta pública — El mapa es accesible sin login
      {
        path: 'fonts',
        loadComponent: () =>
          import('../pages/map/Fonts.page').then((m) => m.fontsPage),
      },

      // 🔒 Rutas protegidas — Requieren autenticación
      {
        path: 'form',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pages/form/FormUploadImage/form.page').then((m) => m.FormPage),
      },
      {
        path: 'configuration-tab',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/configuration/configuration-tab/configuration-tab.page').then( m => m.ConfigurationTabPage)
      },
      {
        path: 'configuration',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pages/configuration/ConfigurationUser/ConfigurationUser.page').then((m) => m.ConfigurationUserPage),
      },
      {
        path: 'lookforms',
        canActivate: [authGuard],
        loadComponent: () =>
          import('../pages/configuration/configuration-look-forms/configuration-look-forms.page').then((m) => m.ConfigurationLookFormsPage),
      },
      {
        path: 'security',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/configuration/ConfigurationSecurity/configuration-security.page').then( m => m.ConfigurationSecurityPage)
      },
      {
        path: 'donation',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/configuration/configuration-donation/configuration-donation.page').then( m => m.ConfigurationDonationPage)
      },
      {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () => import('../pages/configuration/configuration-fonts-saved/configuration-fonts-saved.page').then( m => m.ConfigurationFontsSavedPage)
      },

      // 🔓 Rutas de autenticación — Accesibles sin login
      {
        path: 'register',
        loadComponent: () => import('../pages/auth/register/register.page').then( m => m.RegisterPage)
      },
      {
        path: 'login',
        loadComponent: () => import('../pages/auth/login/login.page').then( m => m.LoginPage)
      },

      {
        path: '',
        redirectTo: '/tabs/fonts',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/fonts',
    pathMatch: 'full',
  },
];
