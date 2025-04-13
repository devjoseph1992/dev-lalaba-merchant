import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('❌ Missing EXPO_PUBLIC_API_URL in environment variables');
}

type Coordinates = {
  lat: number;
  lng: number;
};

type OpeningHours = {
  open: string;
  close: string;
};

export type BusinessSetupPayload = {
  businessName: string;
  barangay: string;
  city: string;
  exactAddress: string;
  coordinates: Coordinates;
  imageUrl?: string | null;
  phoneNumber: string;
  openingHours: OpeningHours;
  status?: boolean;
  orderTypeDelivery: boolean;
};

export async function setupBusiness(payload: BusinessSetupPayload) {
  const token = await getToken('userToken');

  if (!token) {
    console.error('❌ No auth token found');
    throw new Error('❌ No auth token found');
  }

  console.log('🔐 Bearer Token for Postman:', token); // 👉 Use this in Postman!

  try {
    const response = await fetch(`${API_BASE_URL}/businesses/setup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('text/html')) {
      const text = await response.text();
      console.error('❌ Received HTML from server:\n', text);
      throw new Error('❌ Received HTML from server instead of JSON');
    }

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Server responded with error:', result);
      throw new Error(result?.error || '❌ Failed to setup business');
    }

    console.log('✅ Business setup response:', result);
    return result;
  } catch (err) {
    console.error('❌ Network or fetch error:', err);
    throw new Error('❌ Network error: Failed to connect to server');
  }
}
