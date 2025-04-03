// app/verify-email.tsx
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { auth } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';
import { log } from '@/utils/logger';
import { View, Text, TouchableOpacity } from 'react-native';

export default function VerifyEmailScreen() {
  const [sent, setSent] = useState(false);

  const sendVerification = async () => {
    if (auth.currentUser) {
      // @ts-ignore
      await auth.currentUser.sendEmailVerification();
      setSent(true);
      log('✅ Verification email sent');
    }
  };

  const checkVerification = async () => {
    await auth.currentUser?.reload(); // refresh user info
    if (auth.currentUser?.emailVerified) {
      log('✅ Email verified, redirecting...');
      router.replace('/');
    } else {
      Alert.alert('Still not verified', 'Please check your email and try again.');
    }
  };

  useEffect(() => {
    sendVerification();
  }, []);

  return (
    <View className="flex-1 justify-center bg-white px-6 py-10">
      <View className="items-center">
        <Text className="text-3xl font-bold text-center text-black mb-3">
          Verify Your Email
        </Text>

        <Text className="text-base text-gray-600 text-center mb-6">
          A verification link has been sent to:
        </Text>

        <Text className="text-base font-semibold text-black mb-4">
          {auth.currentUser?.email}
        </Text>

        {sent && (
          <Text className="text-green-600 mb-6 text-center">
            ✅ Email sent. Please check your inbox.
          </Text>
        )}

        <TouchableOpacity
          onPress={sendVerification}
          className="w-full bg-gray-100 py-3 px-6 rounded-xl mb-4"
        >
          <Text className="text-center text-gray-800 font-medium">
            Resend Verification Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={checkVerification}
          className="w-full bg-black py-3 px-6 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">
            I’ve Verified My Email
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 mt-12 text-center">
          Powered by <Text className="text-black font-bold">findxny</Text>
        </Text>
      </View>
    </View>
  );
}
