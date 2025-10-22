import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// ✅ Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

// ✅ Capacitor imports
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// ✅ Ionicons imports
import { addIcons } from 'ionicons';
import {
  peopleOutline,
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
  logoGithub,
  eyeOutline,
  addCircleOutline,
} from 'ionicons/icons';

// ✅ Register all icons used in dashboard
addIcons({
  addCircleOutline,
  peopleOutline,
  eyeOutline,
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
  logoGithub,
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
}).then(async () => {
  console.log('🚀 App bootstrapped successfully');

  // ✅ Check if running in Capacitor environment
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Running on native Capacitor platform');
  } else {
    console.log('💻 Running in browser environment');
  }

  // ✅ Request notification permissions
  try {
    const permission = await LocalNotifications.requestPermissions();
    console.log('🔔 Notification permission status:', permission);

    if (permission.display === 'granted') {
      console.log('✅ Notifications enabled');
    } else {
      console.warn('⚠️ Notifications permission denied');
    }
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
  }
});
