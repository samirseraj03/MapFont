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
    path: 'page-success',
    loadComponent: () => import('./src/app/page-success/page-success.page').then( m => m.PageSuccessPage)
  },
];
