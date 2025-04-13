import { useState } from 'react';
import { Alert, TextInput, View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { log } from '@/utils/logger';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️ toggle

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      log('Login error', err);
      Alert.alert('Login Failed', 'Invalid credentials.');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-8">
      <View className="mb-10">
        <Text className="text-3xl font-bold text-center text-black">
          Welcome back 👋
        </Text>
        <Text className="text-base text-gray-500 text-center mt-2">
          Sign in to your account
        </Text>
      </View>

      <View className="space-y-4">
        {/* ✉️ Email */}
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        {/* 🔒 Password */}
        <View className="relative">
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base pr-12"
            placeholder="Password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3"
          >
            <Text className="text-sm text-gray-500">
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔘 Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          className="bg-black py-3 rounded-xl mt-4"
        >
          <Text className="text-white text-center text-base font-semibold">
            Log In
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 text-xs text-center mt-16">
        Powered by <Text className="text-black font-semibold">findxny</Text>
      </Text>
    </View>
  );
}
