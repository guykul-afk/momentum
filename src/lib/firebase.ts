import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'momentum-app-guy2026',
  appId: '1:28352563653:web:4bfda694e7bb21590f23ac',
  storageBucket: 'momentum-app-guy2026.firebasestorage.app',
  apiKey: 'AIzaSyBVYAmAwGhKCqxqTRLQbohOKxda1S-Y4jQ',
  authDomain: 'momentum-app-guy2026.firebaseapp.com',
  messagingSenderId: '28352563653',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function initAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      // Anonymous auth not enabled in console or offline - Firestore operates cleanly with public rules
    }
  }
}
