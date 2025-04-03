import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  getIdToken,
  Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { log, warn, error } from '@/utils/logger';

// ✅ Read Firebase config from app.config.js (extra.firebase)
const firebaseEnv = Constants.expoConfig?.extra?.firebase;

if (!firebaseEnv?.apiKey || !firebaseEnv?.appId || !firebaseEnv?.projectId) {
  throw new Error('❌ Missing Firebase environment variables. Check app.config.js or .env.');
}

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
  databaseURL: firebaseEnv.databaseURL,
};

// ✅ Singleton-safe Firebase init
let app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
log(getApps().length ? 'ℹ️ Firebase already initialized' : '✅ Firebase initialized');

// ✅ Auth (Web SDK — no built-in persistence in Expo Go)
const auth: Auth = getAuth(app);

// ✅ Firestore
const firestore = getFirestore(app);

// ✅ Handle persistence manually (SecureStore or AsyncStorage)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    log('✅ User is signed in:', user.email);
    try {
      const token = await getIdToken(user, true);
      await SecureStore.setItemAsync('userToken', token);
      await AsyncStorage.setItem('userEmail', user.email || '');
      log('🔐 Token saved to SecureStore, email saved to AsyncStorage');
    } catch (err) {
      error('❌ Failed to save auth token:', err);
    }
  } else {
    log('ℹ️ No user is signed in.');
    await SecureStore.deleteItemAsync('userToken');
    await AsyncStorage.removeItem('userEmail');
    log('🧼 Cleared stored token and userEmail');
  }
});

export { app, auth, firestore };
