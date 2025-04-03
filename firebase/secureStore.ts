// firebase/secureStore.ts
import * as SecureStore from 'expo-secure-store';

export async function saveToken(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

export async function getToken(key: string): Promise<string | null> {
  return await SecureStore.getItemAsync(key);
}

export async function deleteToken(key: string) {
  await SecureStore.deleteItemAsync(key);
}
