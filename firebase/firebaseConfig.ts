// src/config/firebase.ts or FirebaseConfig.ts

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getIdToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { error, log } from '@/utils/logger';

// ✅ Read from Constants.extra (flat keys — make sure these are in app.config.js)
const extra = Constants.expoConfig?.extra;

if (
  !extra?.firebaseApiKey ||
  !extra?.firebaseAppId ||
  !extra?.firebaseProjectId
) {
  throw new Error(
    '❌ Missing Firebase environment variables. Check your app.config.js or .env'
  );
}

const firebaseConfig = {
  apiKey: extra.firebaseApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: extra.firebaseAppId,
  databaseURL: extra.firebaseDatabaseURL,
};

// ✅ Singleton-safe Firebase initialization
let app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
log(
  getApps().length
    ? 'ℹ️ Firebase already initialized'
    : '✅ Firebase initialized'
);

// ✅ Firebase Auth and Firestore setup
const auth: Auth = getAuth(app);
const firestore = getFirestore(app);

// ✅ Manually handle token persistence
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
