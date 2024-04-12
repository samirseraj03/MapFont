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
    path: 'configuration-tab',
    loadComponent: () => import('./src/app/ConfigurationPage/configuration-tab/configuration-tab.page').then( m => m.ConfigurationTabPage)
  },
  {
    path: 'security',
    loadComponent: () => import('./src/app/ConfigurationPage/ConfigurationSecurity/configuration-security.page').then( m => m.ConfigurationSecurityPage)
  },
  {
    path: 'donation',
    loadComponent: () => import('./src/app/ConfigurationPage/configuration-donation/configuration-donation.page').then( m => m.ConfigurationDonationPage)
  },
  {
    path: 'lookforms',
    loadComponent: () => import('./src/app/ConfigurationPage/configuration-look-forms/configuration-look-forms.page').then( m => m.ConfigurationLookFormsPage)
  },




];
