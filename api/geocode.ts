import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('❌ Missing Google Maps API Key from Constants');
}

/**
 * Geocode address into coordinates using Google Maps API
 * @param address Full address string (barangay, city, etc.)
 * @returns { lat, lng } or null
 */
export const getCoordinates = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const encoded = encodeURIComponent(`${address}, Metro Manila, Philippines`);
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`);
    const data = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    console.warn('🧭 Geocoding failed:', data.status, data.error_message);
    return null;
  } catch (err) {
    console.error('📍 Geocoding error:', err);
    return null;
  }
};
