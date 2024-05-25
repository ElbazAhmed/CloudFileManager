import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), 
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig }
  ]
};
