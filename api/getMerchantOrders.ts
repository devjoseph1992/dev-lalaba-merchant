// src/api/getMerchantOrders.ts

import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function getMerchantOrders() {
  const token = await getToken('userToken');

  if (!token) {
    throw new Error('❌ No token found. Please log in again.');
  }

  const endpoint = `${API_BASE_URL}/orders/merchant`;
  console.log('📤 Fetching merchant orders from:', endpoint);
  console.log('🔐 Bearer Token:', token);

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const rawText = await res.text();
  console.log('📥 Raw Merchant Orders Response:', rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error('❌ Failed to parse response:', err);
    throw new Error('❌ Failed to parse merchant orders response');
  }

  if (!res.ok) {
    console.error('❌ Server error:', data);
    throw new Error(data?.error || '❌ Failed to fetch merchant orders');
  }

  return data.orders;
}
