import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./src/app/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'location',
    loadComponent: () => import('./src/app/Form/FormSelectLocation/formselectlocation.page').then( m => m.FormSelectLocationPage)
  },
  {
    path: 'FormInformation',
    loadComponent: () => import('./src/app/Form/FormInsertInformation/form-insert-infromation.page').then( m => m.FormInsertInfromationPage)
  },
  {
    path: 'Success',
    loadComponent: () => import('./src/app/Globals/page-success/page-success.page').then( m => m.PageSuccessPage)
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./src/app/Form/confirmation-form/confirmation-form.page').then( m => m.ConfirmationFormPage)
  },
  {
    path: 'viewForm',
    loadComponent: () => import('./src/app/Form/view-form/view-form.page').then( m => m.ViewFormPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./src/app/authentication/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./src/app/authentication/register/register.page').then( m => m.RegisterPage)
  },



  // {
  //   path: 'configuration-tab',
  //   loadComponent: () => import('./src/app/ConfigurationPage/configuration-tab/configuration-tab.page').then( m => m.ConfigurationTabPage)
  // },
  // {
  //   path: 'security',
  //   loadComponent: () => import('./src/app/ConfigurationPage/ConfigurationSecurity/configuration-security.page').then( m => m.ConfigurationSecurityPage)
  // },
  // {
  //   path: 'donation',
  //   loadComponent: () => import('./src/app/ConfigurationPage/configuration-donation/configuration-donation.page').then( m => m.ConfigurationDonationPage)
  // },
  // {
  //   path: 'lookforms',
  //   loadComponent: () => import('./src/app/ConfigurationPage/configuration-look-forms/configuration-look-forms.page').then( m => m.ConfigurationLookFormsPage)
  // },
  // {
  //   path: 'favorites',
  //   loadComponent: () => import('./src/app/ConfigurationPage/configuration-fonts-saved/configuration-fonts-saved.page').then( m => m.ConfigurationFontsSavedPage)
  // },





];
