import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('❌ Missing EXPO_PUBLIC_API_URL in environment variables');
}

type UpdateServicePayload = {
  serviceId: string; // ✅ Now includes the service document ID
  name: 'Regular' | 'Premium';
  price: number;
  inclusions: string[];
  defaultDetergentId: string;
  defaultFabricConditionerId: string;
};

export async function updateService(payload: UpdateServicePayload) {
  const token = await getToken('userToken');
  const merchantId = await getToken('userId');

  if (!merchantId) {
    throw new Error('❌ Merchant ID is missing from secure store.');
  }

  const endpoint = `${API_BASE_URL}/businesses/${merchantId}/services/serviceId/${payload.name}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (contentType?.includes('text/html')) {
      console.error('❌ HTML returned instead of JSON:', responseText);
      throw new Error('❌ Server error: Received HTML instead of JSON');
    }

    const data = JSON.parse(responseText);

    if (!response.ok) {
      throw new Error(data?.error || '❌ Failed to update service');
    }

    return data;
  } catch (error: any) {
    console.error('❌ Failed to update service:', error);
    throw error;
  }
}
