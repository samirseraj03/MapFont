import { Routes } from '@angular/router';
import { authGuard } from './src/app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./src/app/tabs/tabs.routes').then((m) => m.routes),
  },

  // 🔒 Rutas protegidas — Requieren sesión activa
  {
    path: 'location',
    canActivate: [authGuard],
    loadComponent: () => import('./src/app/pages/form/FormSelectLocation/formselectlocation.page').then( m => m.FormSelectLocationPage)
  },
  {
    path: 'FormInformation',
    canActivate: [authGuard],
    loadComponent: () => import('./src/app/pages/form/FormInsertInformation/form-insert-infromation.page').then( m => m.FormInsertInfromationPage)
  },
  {
    path: 'Success',
    canActivate: [authGuard],
    loadComponent: () => import('./src/app/pages/success/page-success/page-success.page').then( m => m.PageSuccessPage)
  },
  {
    path: 'confirmation',
    canActivate: [authGuard],
    loadComponent: () => import('./src/app/pages/form/confirmation-form/confirmation-form.page').then( m => m.ConfirmationFormPage)
  },
  {
    path: 'viewForm',
    canActivate: [authGuard],
    loadComponent: () => import('./src/app/pages/form/view-form/view-form.page').then( m => m.ViewFormPage)
  },

  // 🔓 Rutas de autenticación — Públicas
  {
    path: 'login',
    loadComponent: () => import('./src/app/pages/auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./src/app/pages/auth/register/register.page').then( m => m.RegisterPage)
  },
];
