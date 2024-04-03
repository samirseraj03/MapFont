import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'location',
    loadComponent: () => import('./Form/FormSelectLocation/formselectlocation.page').then( m => m.FormSelectLocationPage)
  },
];
