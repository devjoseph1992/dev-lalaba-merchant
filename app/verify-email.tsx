import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '@/firebase/firebaseConfig';
import { router } from 'expo-router';
import { log } from '@/utils/logger';
import { signOut, sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailScreen() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Send email on mount if needed
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      log('❌ No user signed in. Redirecting to login.');
      router.replace('/login');
      return;
    }

    setEmail(user.email ?? null);
    sendVerification();
  }, []);

  const sendVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsSending(true);
      await sendEmailVerification(user); // ✅ Correct usage
      setSent(true);
      Alert.alert(
        'Verification Email Sent',
        'Check your inbox or spam folder.'
      );
      log(`✅ Verification email sent to: ${user.email}`);
    } catch (err) {
      log('❌ Error sending email', err);
      Alert.alert('Error', 'Failed to send verification email.');
    } finally {
      setIsSending(false);
    }
  };

  const checkVerification = async () => {
    if (!auth.currentUser) return;

    setChecking(true);
    await auth.currentUser.reload();

    if (auth.currentUser.emailVerified) {
      log('✅ Email verified. Redirecting to tabs...');
      Alert.alert('✅ Verified!', 'Redirecting...');
      router.replace('/(tabs)/'); // ✅ Redirect to tabs
    } else {
      Alert.alert(
        'Still Not Verified',
        'Please check your inbox and try again.'
      );
    }

    setChecking(false);
  };

  const logout = async () => {
    await signOut(auth);
    router.replace('/login');
    log('🔓 User logged out from verify-email screen');
  };

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
          {email ?? 'your email'}
        </Text>

        {sent && (
          <Text className="text-green-600 mb-6 text-center">
            ✅ Email sent. Please check your inbox.
          </Text>
        )}

        <TouchableOpacity
          onPress={sendVerification}
          disabled={isSending}
          className={`w-full ${
            isSending ? 'bg-gray-300' : 'bg-gray-100'
          } py-3 px-6 rounded-xl mb-4`}
        >
          <Text className="text-center text-gray-800 font-medium">
            {isSending ? 'Sending...' : 'Resend Verification Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={checkVerification}
          className="w-full bg-black py-3 px-6 rounded-xl mb-4"
        >
          <Text className="text-center text-white font-semibold">
            {checking ? 'Checking...' : 'I’ve Verified My Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={logout}
          className="w-full bg-red-100 border border-red-300 py-3 px-6 rounded-xl mt-2"
        >
          <Text className="text-center text-red-600 font-semibold">
            Use a Different Account
          </Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 mt-12 text-center">
          Powered by <Text className="text-black font-bold">findxny</Text>
        </Text>
      </View>
    </View>
  );
}
