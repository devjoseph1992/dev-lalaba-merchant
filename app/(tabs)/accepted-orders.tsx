import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
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
import QRCode from 'react-native-qrcode-svg';
import RNModal from 'react-native-modal';

export default function AcceptedOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchLatestSnapshot = useCallback(async () => {
    setRefreshing(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const ordersRef = collection(db, 'orders');

      const q = query(
        ordersRef,
        where('merchantId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const acceptedOrders: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'accepted_by_merchant') {
          acceptedOrders.push({ orderId: doc.id, ...data });
        }
      });

      setOrders(acceptedOrders);
    } catch (err: any) {
      console.error('❌ Pull-down refresh failed:', err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to view your orders.');
      return;
    }

    const db = getFirestore();
    const ordersRef = collection(db, 'orders');

    const q = query(
      ordersRef,
      where('merchantId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const acceptedOrders: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'accepted_by_merchant') {
            acceptedOrders.push({ orderId: doc.id, ...data });
          }
        });
        setOrders(acceptedOrders);
        setLoading(false);
      },
      (err) => {
        console.error('❌ Real-time fetch failed:', err.message);
        Alert.alert('Error', err.message || 'Could not load accepted orders');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="px-4 py-4"
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchLatestSnapshot}
          />
        }
      >
        <Text className="text-xl font-semibold text-black mb-4">
          Accepted Orders
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : orders.length === 0 ? (
          <Text className="text-center text-gray-500">
            No accepted orders yet.
          </Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.orderId}
              onPress={() => openModal(order)}
            >
              <View className="bg-white border border-green-300 rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm font-medium text-black">
                    👤 {order.customerName ?? 'Customer'}
                  </Text>
                  <Text className="text-sm font-bold text-green-600">
                    ₱{((order.price ?? 0) + (order.riderFee ?? 0)).toFixed(2)}
                  </Text>
                </View>

                <Text className="text-xs text-gray-600 mb-1">
                  {order.serviceName} • {order.estimatedKilo} kg
                </Text>
                <Text className="text-xs text-gray-500">
                  {order.orderType ?? 'Delivery'} • {order.distance} km
                </Text>
                <Text className="text-xs text-green-600 mt-1 font-medium">
                  ✅ Accepted
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ✅ Modal for Order Details + QR Code */}
      <RNModal isVisible={modalVisible} onBackdropPress={closeModal}>
        <View className="bg-white rounded-xl p-6">
          <Text className="text-lg font-semibold text-black mb-3">
            📦 Order Details
          </Text>

          {selectedOrder && (
            <>
              <Text className="text-sm text-gray-800 mb-1">
                👤 {selectedOrder.customerName ?? 'Customer'}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                📍 {selectedOrder.customerAddress}
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                🧺 {selectedOrder.serviceName} • {selectedOrder.estimatedKilo}{' '}
                kg
              </Text>
              <Text className="text-sm text-gray-800 mb-1">
                🛵 {selectedOrder.orderType} • {selectedOrder.distance} km
              </Text>
              <Text className="text-sm text-gray-800 mb-3">
                💰 ₱
                {(
                  (selectedOrder.price ?? 0) + (selectedOrder.riderFee ?? 0)
                ).toFixed(2)}
              </Text>

              {/* ✅ QR Code */}
              <View className="items-center justify-center mb-4 mt-2">
                <QRCode value={selectedOrder.orderId} size={160} />
                <Text className="text-center text-gray-500 text-xs mt-2">
                  Scan this QR code to mark order as delivered
                </Text>
              </View>

              <TouchableOpacity
                className="bg-black py-2 rounded-full"
                onPress={closeModal}
              >
                <Text className="text-white text-center text-sm font-medium">
                  Close
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </RNModal>
    </SafeAreaView>
  );
}
