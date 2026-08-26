import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey || '',
  authDomain: firebaseConfigData.authDomain || '',
  projectId: firebaseConfigData.projectId || '',
  storageBucket: firebaseConfigData.storageBucket || '',
  messagingSenderId: firebaseConfigData.messagingSenderId || '',
  appId: firebaseConfigData.appId || '',
};

let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

try {
  if (firebaseConfig.projectId) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
    storage = getStorage(app);
  }
} catch (e) {
  console.warn('Firebase init optional notice:', e);
}

export { db, auth, storage };
export default app;
