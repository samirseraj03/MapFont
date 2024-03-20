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
          import('../Form/form.page').then((m) => m.FormPage),
      },
      {
        path: 'tab3',
        loadComponent: () =>
          import('../tab3/tab3.page').then((m) => m.Tab3Page),
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
