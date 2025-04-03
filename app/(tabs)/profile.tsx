import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage} className="items-center mt-10 mb-6">
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : { uri: 'https://i.pravatar.cc/150?img=3' } // fallback
          }
          className="w-28 h-28 rounded-full border border-gray-300"
        />
        <Text className="text-xs text-blue-500 mt-2">Edit Profile Photo</Text>
      </TouchableOpacity>

      {/* Email Display */}
      <Text className="text-sm text-gray-600 mb-6 text-center">
        {user?.email}
      </Text>

      {/* Payment Method */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Payment Method</Text>
      <TextInput
        placeholder="e.g. GCash, Bank Transfer"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
        className="border border-gray-300 rounded-lg p-3 mb-6"
      />

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-black py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
