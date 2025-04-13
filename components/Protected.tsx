import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebaseConfig';

type Props = {
  children: ReactNode;
};

export default function Protected({ children }: Props) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  useEffect(() => {
    const guard = async () => {
      if (!user) {
        if (pathname !== '/login') {
          hasRedirected.current = true;
          router.replace('/login');
        }
        setCheckingBusiness(false);
        return;
      }

      if (!user.emailVerified) {
        if (pathname !== '/verify-email') {
          hasRedirected.current = true;
          router.replace('/verify-email');
        }
        setCheckingBusiness(false);
        return;
      }

      const isSetupScreen = pathname === '/(tabs)/business-setup';

      if (!isSetupScreen) {
        try {
          const ref = doc(firestore, 'businesses', user.uid);
          const snap = await getDoc(ref);
          const status = snap.data()?.status;

          if (!snap.exists() || status !== true) {
            console.warn('⚠️ Business not setup. Redirecting...');
            hasRedirected.current = true;
            router.replace('/(tabs)/business-setup');
          }
        } catch (err) {
          console.error('❌ Error checking business:', err);
        } finally {
          setCheckingBusiness(false);
        }
      } else {
        setCheckingBusiness(false);
      }
    };

    if (!loading && !hasRedirected.current) {
      guard();
    }
  }, [user, loading]);

  const isLoading = loading || checkingBusiness;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
