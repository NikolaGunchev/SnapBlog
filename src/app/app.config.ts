import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFunctions, getFunctions } from '@angular/fire/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyDs0ytf2No4tLuMwBnueZT1VATLkn5KqHA',
  authDomain: 'softuni-blog-project.firebaseapp.com',
  projectId: 'softuni-blog-project',
  storageBucket: 'softuni-blog-project.firebasestorage.app',
  messagingSenderId: '636311296591',
  appId: '1:636311296591:web:961442cc761399b860e83a',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions())
  ],
};
