import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';


const firebaseConfig = {
  apiKey: 'AIzaSyDs0ytf2No4tLuMwBnueZT1VATLkn5KqHA',
  authDomain: 'softuni-blog-project.firebaseapp.com',
  projectId: 'softuni-blog-project',
  storageBucket: 'softuni-blog-project.firebasestorage.app',
  messagingSenderId: '636311296591',
  appId: '1:636311296591:web:961442cc761399b860e83a',
};

const useEmulator = false;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    // provideAuth(() => getAuth()),
     provideAuth(() => {
      const auth = getAuth();
      if (useEmulator) {
        connectAuthEmulator(auth, 'http://localhost:9099'); // Connect to the Auth emulator
      }
      return auth;
    }),
    // provideFunctions(() => getFunctions())
     provideFunctions(() => {
      const functions = getFunctions();
      // Check if you are in a local development environment
      if (useEmulator) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    })
  ],
};
