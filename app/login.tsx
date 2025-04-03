// app/login.tsx
import { useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { log } from '@/utils/logger';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/');
    } catch (err) {
      log('Login error', err);
      Alert.alert('Login Failed', 'Invalid credentials.');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-8">
      <View className="mb-10">
        <Text className="text-3xl font-bold text-center text-black">Welcome back 👋</Text>
        <Text className="text-base text-gray-500 text-center mt-2">Sign in to your account</Text>
      </View>

      <View className="space-y-4">
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-black py-3 rounded-xl mt-4"
        >
          <Text className="text-white text-center text-base font-semibold">Log In</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 text-xs text-center mt-16">Powered by <Text
        className="text-black font-semibold">findxny</Text></Text>
    </View>
  );
}
