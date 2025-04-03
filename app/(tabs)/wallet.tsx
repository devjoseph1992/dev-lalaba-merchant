import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

export default function WalletScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="px-4 py-6">
        {/* Header / Balance Card */}
        <View className="bg-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-sm text-gray-500">Hi!</Text>
              <Text className="text-lg font-semibold text-black">Jonie Balagoza Jr.</Text>
              <Text className="text-xs text-gray-400">👤 Priority</Text>
            </View>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
              className="w-12 h-12 rounded-full"
            />
          </View>

          <Text className="text-2xl font-bold text-black">₱5,500.50</Text>
          <Text className="text-sm text-gray-500">Account No. 1011023040</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-6">
          <ActionButton icon="wallet" label="Top Up" />
          <ActionButton icon="swap-horizontal" label="Transfer" />
          <ActionButton icon="send" label="Send" />
          <ActionButton icon="ellipsis-horizontal" label="More" />
        </View>

        {/* Transactions */}
        <Text className="text-lg font-semibold text-black mb-3">Wallet Transactions</Text>
        <TransactionRow label="Payment" to="lalaba services inc." amount="₱370.50" />
        <TransactionRow label="Transfer" to="1011023049" amount="₱20.50" />
        <TransactionRow label="Top Up" to="Lalaba Wallet" amount="₱2000.50" />

        {/* Verify Footer */}
        <View className="bg-gray-100 rounded-2xl p-4 mt-10">
          <Text className="text-sm font-semibold text-black mb-1">
            Verify your identity before transferring money to others
          </Text>
          <Text className="text-xs text-gray-500 mb-3">
            In accordance with your country's regulatory requirements, Lalaba users are required to verify their
            wallets to ensure security.
          </Text>
          <TouchableOpacity className="bg-black rounded-xl py-3">
            <Text className="text-white text-center text-sm font-medium">Verify Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label }: { icon: string; label: string }) {
  const IconComponent =
    icon === 'wallet' ? Ionicons :
      icon === 'swap-horizontal' ? Ionicons :
        icon === 'send' ? Feather :
          Ionicons;

  return (
    <TouchableOpacity className="items-center w-1/5">
      <View className="bg-black p-3 rounded-full mb-1">
        <IconComponent name={icon as any} size={20} color="white" />
      </View>
      <Text className="text-xs text-center text-black">{label}</Text>
    </TouchableOpacity>
  );
}

function TransactionRow({
                          label,
                          to,
                          amount,
                        }: {
  label: string;
  to: string;
  amount: string;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
      <View>
        <Text className="text-sm font-medium text-black">{label}</Text>
        <Text className="text-xs text-gray-500">To {to}</Text>
      </View>
      <Text className="text-sm font-semibold text-black">{amount}</Text>
    </View>
  );
}
