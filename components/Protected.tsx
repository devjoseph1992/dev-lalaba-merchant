import { ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router, usePathname } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

type Props = {
  children: ReactNode;
};

export default function Protected({ children }: Props) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;

    if (!user) {
      if (pathname !== '/login') {
        hasRedirected.current = true;
        router.replace('/login');
      }
    } else if (!user.emailVerified) {
      if (pathname !== '/verify-email') {
        hasRedirected.current = true;
        router.replace('/verify-email');
      }
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
