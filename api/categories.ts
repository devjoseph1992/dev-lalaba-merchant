import { getToken } from '@/firebase/secureStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('❌ Missing EXPO_PUBLIC_API_URL');
}

export type NewCategoryPayload = {
  name: string;
  icon: string;
  sortOrder: number;
};

export async function createCategory(payload: NewCategoryPayload) {
  const token = await getToken('userToken');

  if (!token) {
    throw new Error('❌ No auth token found');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/businesses/categories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    if (contentType && contentType.includes('text/html')) {
      console.error('❌ HTML returned instead of JSON:', text);
      throw new Error('❌ Server error: Expected JSON but received HTML');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error('❌ Failed to parse JSON response:', text);
      throw new Error('❌ Invalid JSON returned from server');
    }

    if (!response.ok) {
      throw new Error(data?.error || '❌ Failed to create category');
    }

    console.log('✅ Category created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Network or server error while creating category:', error);
    throw error;
  }
}
