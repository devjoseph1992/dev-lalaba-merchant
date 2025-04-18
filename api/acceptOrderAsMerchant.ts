// src/api/acceptOrderAsMerchant.ts

import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('❌ Missing EXPO_PUBLIC_API_URL in environment variables');
}

/**
 * Accept an order as a merchant and hold platform fee.
 * @param orderId The ID of the order to accept
 */
export async function acceptOrderAsMerchant(orderId: string) {
  const token = await getToken('userToken');

  if (!token) {
    console.error('❌ No auth token found');
    throw new Error('❌ No auth token found');
  }

  try {
    const endpoint = `${API_BASE_URL}/orders/${orderId}/accept-merchant`;

    console.log('📤 Accepting order as merchant:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST', // ✅ this is correct
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    const rawText = await response.text();

    if (contentType?.includes('application/json')) {
      const result = JSON.parse(rawText);

      if (!response.ok) {
        console.error('❌ API error:', result);
        throw new Error(result?.error || 'Failed to accept order.');
      }

      console.log('✅ Order accepted:', result);
      return result;
    } else {
      console.error('❌ Unexpected response format:\n', rawText);
      throw new Error('❌ Server returned unexpected format');
    }
  } catch (err: any) {
    console.error('❌ Failed to accept order:', err.message);
    throw new Error('❌ Network or server error: Failed to accept order');
  }
}
