import { Routes } from '@angular/router';
import { NotFound } from './shared/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(c=>c.Home),
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
    path:'create-group',
    loadComponent: () => import('./features/create-group/create-group').then(c=>c.CreateGroup),
  },
  {
    path: 'group/:name',
    loadComponent: () => import('./features/group-details/group-details').then(c=>c.GroupDetails),
  },
  {
    path: 'group/:name/create-post',
    loadComponent: () => import('./features/create-post/create-post').then(c=>c.CreatePost),
  },
  {
    path: 'group/:name/post/:id',
    loadComponent: () => import('./features/post-details/post-details').then(c=>c.PostDetails),
  },
  
  {
    path: '**',
    component: NotFound
  }
];
