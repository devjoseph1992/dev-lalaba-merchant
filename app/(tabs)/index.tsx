import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebaseConfig';

const mockOrders = [
  {
    id: '1',
    customer: 'Juan Dela Cruz',
    items: '3x Siomai, 2x Chicken Feet',
    total: '₱180.00',
    paymentMethod: 'GCash',
  },
  {
    id: '2',
    customer: 'Maria Santos',
    items: '1x Hakaw, 1x Taho',
    total: '₱120.00',
    paymentMethod: 'Cash on Delivery',
  },
];

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBusinessSetup = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      try {
        const ref = doc(firestore, 'businesses', user.uid, 'info', 'details');
        const snap = await getDoc(ref);

        if (!snap.exists() || snap.data()?.status !== 'setup-complete') {
          // ❌ Not setup – redirect
          router.replace('/business/setup');
        }
      } catch (err) {
        console.error('❌ Error checking business setup status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkBusinessSetup();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="black" />
        <Text className="mt-4 text-gray-600 text-sm">Checking business setup...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} className="px-4 py-4">
        <Text className="text-xl font-semibold text-black mb-4">Incoming Orders</Text>

        {mockOrders.map((order) => (
          <View
            key={order.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-medium text-black">👤 {order.customer}</Text>
              <Text className="text-sm font-bold text-black">{order.total}</Text>
            </View>
            <Text className="text-xs text-gray-600 mb-1">{order.items}</Text>
            <Text className="text-xs text-gray-500 mb-3">Payment: {order.paymentMethod}</Text>

            <TouchableOpacity className="bg-black rounded-full py-2">
              <Text className="text-white text-center text-sm font-medium">Accept Order</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Promo Banner */}
      <View className="absolute bottom-0 w-full px-4 pb-4">
        <View className="bg-yellow-100 rounded-2xl flex-row items-center justify-between p-4 shadow-md">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-black mb-1">📢 Boost Your Store</Text>
            <Text className="text-xs text-gray-600">
              Join featured merchants this week and get more orders!
            </Text>
          </View>
          <TouchableOpacity className="ml-4 bg-black px-3 py-2 rounded-full">
            <Text className="text-xs text-white font-medium">Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
