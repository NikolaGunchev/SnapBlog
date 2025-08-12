import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator,
} from '@angular/fire/functions';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';

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
    // provideFirestore(() => getFirestore()),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (useEmulator) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    // provideAuth(() => getAuth()),
    provideAuth(() => {
      const auth = getAuth();
      if (useEmulator) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    // provideFunctions(() => getFunctions())
    provideFunctions(() => {
      const functions = getFunctions();
      if (useEmulator) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    // provideStorage(()=> getStorage())
    provideStorage(() => {
      const storage = getStorage();
      if (useEmulator) {
        connectStorageEmulator(storage, 'localhost', 9199); 
      }
      return storage;
    }),
  ],
};
