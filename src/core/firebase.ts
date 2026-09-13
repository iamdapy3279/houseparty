import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Use the asia-southeast1 regional URL for the Realtime Database
const rtdbUrl = (firebaseConfig as any).databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`;

const configWithDB = {
  ...firebaseConfig,
  databaseURL: rtdbUrl
};

console.log("[Firebase Init] Initializing with config:", {
  projectId: configWithDB.projectId,
  databaseURL: configWithDB.databaseURL,
  region: "asia-southeast1 (enforced)"
});

const app = !getApps().length ? initializeApp(configWithDB) : getApp();
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signInAnonymously, signOut };
