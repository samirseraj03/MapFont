import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'fonts',
        loadComponent: () =>
          import('../Fonts/Fonts.page').then((m) => m.fontsPage),
      },
      {
        path: 'form',
        loadComponent: () =>
          import('../Form/FormUploadImage/form.page').then((m) => m.FormPage),
      },
      {
        path: 'configuration-tab',
        loadComponent: () => import('../ConfigurationPage/configuration-tab/configuration-tab.page').then( m => m.ConfigurationTabPage)
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('../ConfigurationPage/ConfigurationUser/ConfigurationUser.page').then((m) => m.ConfigurationUserPage),
      },
      {
        path: 'lookforms',
        loadComponent: () =>
          import('../ConfigurationPage/configuration-look-forms/configuration-look-forms.page').then((m) => m.ConfigurationLookFormsPage),
      },
      {
        path: 'security',
        loadComponent: () => import('../ConfigurationPage/ConfigurationSecurity/configuration-security.page').then( m => m.ConfigurationSecurityPage)
      },
      {
        path: 'donation',
        loadComponent: () => import('../ConfigurationPage/configuration-donation/configuration-donation.page').then( m => m.ConfigurationDonationPage)
      },
      {
        path: 'lookforms',
        loadComponent: () => import('../ConfigurationPage/configuration-look-forms/configuration-look-forms.page').then( m => m.ConfigurationLookFormsPage)
      },
      {
        path: 'favorites',
        loadComponent: () => import('../ConfigurationPage/configuration-fonts-saved/configuration-fonts-saved.page').then( m => m.ConfigurationFontsSavedPage)
      },
      // {
      //   path: 'confirmation',
      //   loadComponent: () => import('../Form/confirmation-form/confirmation-form.page').then( m => m.ConfirmationFormPage)
      // },
      
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
