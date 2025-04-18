import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { acceptOrderAsMerchant } from '@/api/acceptOrderAsMerchant';
import RNModal from 'react-native-modal';

export default function HomeScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchOrdersOnce = useCallback(async () => {
    setRefreshing(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const q = query(
        collection(db, 'orders'),
        where('merchantId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const result: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') {
          result.push({ orderId: doc.id, ...data });
        }
      });

      setOrders(result);
    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to view your orders.');
      return;
    }

    const db = getFirestore();
    const q = query(
      collection(db, 'orders'),
      where('merchantId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') {
          result.push({ orderId: doc.id, ...data });
        }
      });
      setOrders(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      setAcceptingOrderId(orderId);
      const result = await acceptOrderAsMerchant(orderId);
      Alert.alert('✅ Order Accepted', result?.message || 'Success!');
      fetchOrdersOnce(); // Trigger refresh
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept order');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchOrdersOnce} />
        }
        contentContainerStyle={{ paddingBottom: 160 }}
        className="px-4 py-4"
      >
        <Text className="text-xl font-semibold text-black mb-4">
          Incoming Orders
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : orders.length === 0 ? (
          <Text className="text-center text-gray-500">No incoming orders</Text>
        ) : (
          orders.map((order) => {
            const isAccepted = order.status === 'accepted_by_merchant';
            const isLoading = acceptingOrderId === order.orderId;

            return (
              <TouchableOpacity
                key={order.orderId}
                onPress={() => openModal(order)}
              >
                <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-medium text-black">
                      👤 {order.customerName ?? 'Customer'}
                    </Text>
                    <Text className="text-sm font-bold text-black">
                      ₱{((order.price ?? 0) + (order.riderFee ?? 0)).toFixed(2)}
                    </Text>
                  </View>

                  <Text className="text-xs text-gray-600 mb-1">
                    {order.serviceName} • {order.estimatedKilo} kg
                  </Text>
                  <Text className="text-xs text-gray-500 mb-3">
                    {order.orderType ?? 'Delivery'} • {order.distance} km
                  </Text>

                  <TouchableOpacity
                    className={`${
                      isAccepted
                        ? 'bg-gray-400'
                        : isLoading
                          ? 'bg-gray-600'
                          : 'bg-black'
                    } rounded-full py-2`}
                    disabled={isAccepted || isLoading}
                    onPress={() => handleAcceptOrder(order.orderId)}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white text-center text-sm font-medium">
                        {isAccepted ? 'Accepted' : 'Accept Order'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ✅ Modal */}
      <RNModal isVisible={modalVisible} onBackdropPress={closeModal}>
        <View className="bg-white rounded-xl p-6">
          <Text className="text-lg font-semibold mb-3 text-black">
            📦 Order Details
          </Text>

          {selectedOrder && (
            <>
              <Text className="text-sm text-gray-800 mb-1">
                👤 Customer: {selectedOrder.customerName ?? 'Customer'}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                📍 Address: {selectedOrder.customerAddress}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                📦 Estimated Kilos: {selectedOrder.estimatedKilo} kg
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                🧺 Service: {selectedOrder.serviceName}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                🛵 Type: {selectedOrder.orderType}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                📏 Distance: {selectedOrder.distance} km
              </Text>
              <Text className="text-sm text-gray-800 mb-3">
                💰 Total: ₱
                {(
                  (selectedOrder.price ?? 0) + (selectedOrder.riderFee ?? 0)
                ).toFixed(2)}
              </Text>

              <TouchableOpacity
                onPress={closeModal}
                className="bg-black py-2 rounded-full mt-2"
              >
                <Text className="text-white text-center font-medium">
                  Close
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </RNModal>

      {/* ✅ Bottom Section */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 p-4">
        <Text className="text-center text-xs text-gray-500">
          Pulled in real-time. Pull down to refresh manually.
        </Text>
      </View>
    </SafeAreaView>
  );
}
