import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockOrders = [
  {
    id: '001',
    customer: 'Angelo Cañaveral',
    total: '₱370.00',
    status: 'Completed',
    date: 'April 1, 2025',
  },
  {
    id: '002',
    customer: 'Maria Santos',
    total: '₱180.00',
    status: 'Pending',
    date: 'April 2, 2025',
  },
  {
    id: '003',
    customer: 'Juan Dela Cruz',
    total: '₱560.00',
    status: 'Cancelled',
    date: 'April 3, 2025',
  },
];

export default function OrderTransactionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-2xl font-bold my-4">📋 Order Transactions</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockOrders.map((order) => (
          <View
            key={order.id}
            className="border border-gray-200 rounded-xl p-4 mb-3 shadow-sm bg-white"
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm font-semibold text-black">#{order.id}</Text>
              <Text
                className={`text-xs font-medium ${
                  order.status === 'Completed'
                    ? 'text-green-600'
                    : order.status === 'Pending'
                      ? 'text-yellow-600'
                      : 'text-red-500'
                }`}
              >
                {order.status}
              </Text>
            </View>
            <Text className="text-sm text-gray-700">👤 {order.customer}</Text>
            <Text className="text-sm text-gray-600">🗓 {order.date}</Text>
            <Text className="text-base font-bold text-black mt-1">{order.total}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
