import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// ✅ Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

// ✅ Ionicons imports
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  checkmarkOutline,
  createOutline,
  trashOutline,
  archiveOutline,
  checkmarkDoneOutline,
  checkboxOutline,
  arrowBackOutline,
  searchOutline,
  optionsOutline,
  calendarOutline,
  clipboardOutline,
  homeOutline,
  personOutline,
  ellipsisVerticalOutline,
} from 'ionicons/icons';

// ✅ Register all icons used in dashboard
addIcons({
  logOutOutline,
  checkmarkOutline,
  createOutline,
  trashOutline,
  archiveOutline,
  checkmarkDoneOutline,
  checkboxOutline,
  arrowBackOutline,
  searchOutline,
  optionsOutline,
  calendarOutline,
  clipboardOutline,
  homeOutline,
  personOutline,
  ellipsisVerticalOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // ✅ Firebase initialization
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
