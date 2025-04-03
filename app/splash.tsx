import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'expo-image'; // Using expo-image for GIF support

export default function SplashScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/' : '/login');
    }
  }, [loading, user]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Image
        source={require('@/assets/images/splash.gif')}
        style={{ width: 200, height: 200 }} // Adjust as needed
        contentFit="contain" // Keeps aspect ratio
      />
    </View>
  );
}
