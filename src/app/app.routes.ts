import { Routes } from '@angular/router';
import { NotFound } from './shared/not-found/not-found';
import { PostDetails } from './features/post-details/post-details';

export const routes: Routes = [
  {
    path: '',
    // loadComponent: () => import('./features/home/home').then(c=>c.Home),
    component: PostDetails
  },
  {
    path: 'login',
    loadComponent: () => import('./features/authentication/login/login').then(c=>c.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/authentication/register/register').then(c=>c.Register),
  },
  {
    path: '**',
    component: NotFound
  }
];
