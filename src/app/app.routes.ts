import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/authentication/login/login').then(c=>c.Login),
  }
];
