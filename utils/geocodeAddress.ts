import Constants from 'expo-constants';

const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_API_KEY) {
    console.warn('❌ Google Maps API key not set.');
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'OK' && json.results.length > 0) {
      const location = json.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.warn('❌ Geocoding failed:', json.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error);
    return null;
  }
}
