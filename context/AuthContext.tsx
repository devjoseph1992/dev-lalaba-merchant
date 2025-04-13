import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { saveToken, getToken, deleteToken } from '@/firebase/secureStore';
import { log, error } from '@/utils/logger';
import { router, usePathname } from 'expo-router';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const didInitialRedirect = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const tokenResult = await getIdTokenResult(firebaseUser);
          const role = tokenResult.claims.role;

          if (!firebaseUser.emailVerified) {
            log('⛔ Email not verified.');
            if (pathname !== '/verify-email') {
              router.replace('/verify-email');
            }
            return;
          }

          if (role === 'merchant') {
            const token = await getIdToken(firebaseUser);
            console.log('🔐 Bearer Token (for Postman):', token);

            await saveToken('userToken', token);
            await saveToken('userId', firebaseUser.uid); // ✅ Save UID

            setUser(firebaseUser);
            log('✅ Logged in (restored):', firebaseUser.email);

            if (
              pathname !== '/(tabs)/' &&
              pathname !== '/login' &&
              pathname !== '/verify-email' &&
              !didInitialRedirect.current
            ) {
              didInitialRedirect.current = true;
              log('➡️ Redirecting to /tabs');
              router.replace('/(tabs)/');
            }
          } else {
            await signOut(auth);
            await deleteToken('userToken');
            await deleteToken('userId'); // ✅ Delete UID
            setUser(null);
            log('⛔ Not a merchant. User signed out.');
          }
        } else {
          const cachedToken = await getToken('userToken');
          if (cachedToken) {
            log('🔄 Token exists, waiting for Firebase session...');
          } else {
            await deleteToken('userToken');
            await deleteToken('userId'); // ✅ Delete UID
            setUser(null);
            if (pathname !== '/login') {
              router.replace('/login');
            }
            log('ℹ️ No user found');
          }
        }
      } catch (err) {
        error('❌ Auth state error:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      if (!firebaseUser.emailVerified) {
        log('⛔ Email not verified.');
        router.replace('/verify-email');
        return;
      }

      const tokenResult = await getIdTokenResult(firebaseUser);
      if (tokenResult.claims.role !== 'merchant') {
        await signOut(auth);
        await deleteToken('userToken');
        await deleteToken('userId');
        throw new Error('Access denied: Only merchants can log in.');
      }

      const token = await firebaseUser.getIdToken();
      console.log('🔐 Bearer Token (for Postman):', token);

      await saveToken('userToken', token);
      await saveToken('userId', firebaseUser.uid); // ✅ Save UID
      setUser(firebaseUser);

      log('✅ Logged in:', firebaseUser.email);
      router.replace('/(tabs)/');
    } catch (err) {
      error('❌ Login error:', err);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      await deleteToken('userToken');
      await deleteToken('userId'); // ✅ Clear UID
      setUser(null);
      log('🔒 Logged out');
      router.replace('/login');
    } catch (err) {
      error('❌ Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
