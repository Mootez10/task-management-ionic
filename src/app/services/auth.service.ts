import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  UserCredential,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  DocumentReference,
} from '@angular/fire/firestore';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /**
   * Register a new user with email, password and name.
   * Also saves user info in Firestore.
   */
  async register(email: string, password: string, name: string): Promise<UserCredential> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);

      const user = credential.user;
      const userRef = doc(this.firestore, `users/${user.uid}`);

      await setDoc(userRef, {
        uid: user.uid,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      console.log('✅ User created in Firestore:', user.uid);
      return credential;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  }

  /**
   * Login existing user
   */
  async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    return await sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    return await signOut(this.auth);
  }

  /**
   * Get current user
   */
  get currentUser() {
    return this.auth.currentUser;
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Works in web browser (Popup mode)
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      // ✅ Create / update Firestore document
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'user',
          provider: 'google',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      console.log('✅ Google sign-in successful');
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw error;
    }
  }

  async loginWithGithub(): Promise<void> {
  const provider = new GithubAuthProvider();
  provider.setCustomParameters({ allow_signup: 'true' });

  try {
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    // ✅ Create or update Firestore document
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        name: user.displayName || 'GitHub User',
        email: user.email,
        photoURL: user.photoURL,
        role: 'user',
        provider: 'github',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log('✅ GitHub sign-in successful');
  } catch (error) {
    console.error('❌ GitHub sign-in error:', error);
    throw error;
  }
}

async getUserRole(uid: string): Promise<string | null> {
  const userRef = doc(this.firestore, `users/${uid}`);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data()['role'] as string) : null;
}
}
