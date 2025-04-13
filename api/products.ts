import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('❌ Missing EXPO_PUBLIC_API_URL in environment variables');
}

export type NewProductPayload = {
  name: string;
  category: string;
  price: number;
  imageUrl?: string | null;
  available: boolean;
};

/**
 * Create a product for a specific merchant.
 * @param merchantId - Firestore UID of the business owner
 * @param payload - Product data to create
 */
export async function createProduct(
  merchantId: string,
  payload: NewProductPayload
) {
  if (!merchantId) {
    throw new Error('❌ Merchant ID is required');
  }

  const token = await getToken('userToken');
  if (!token) {
    throw new Error('❌ No auth token found. Please log in.');
  }

  const endpoint = `${API_BASE_URL}/businesses/${merchantId}/products`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
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

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('❌ JSON parse failed:', responseText);
      throw new Error('❌ Invalid JSON response from server');
    }

    if (!response.ok) {
      throw new Error(data?.error || '❌ Failed to create product');
    }

    console.log('✅ Product created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Network or server error while creating product:', error);
    throw error;
  }
}

/**
 * Fetch all products for a given merchant from the backend (not Firestore directly).
 * @param merchantId - Firestore UID of the business owner
 */
export async function fetchProducts(merchantId: string) {
  if (!merchantId) {
    throw new Error('❌ Merchant ID is required to fetch products.');
  }

  const token = await getToken('userToken');
  if (!token) {
    throw new Error('❌ No auth token found. Please log in.');
  }

  const endpoint = `${API_BASE_URL}/businesses/${merchantId}/products`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (contentType?.includes('text/html')) {
      console.error('❌ HTML returned instead of JSON:', responseText);
      throw new Error('❌ Server error: Received HTML instead of JSON');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('❌ JSON parse failed:', responseText);
      throw new Error('❌ Invalid JSON response from server');
    }

    if (!response.ok) {
      throw new Error(data?.error || '❌ Failed to fetch products');
    }

    return data.products;
  } catch (error: any) {
    console.error('❌ Network or server error while fetching products:', error);
    throw error;
  }
}
