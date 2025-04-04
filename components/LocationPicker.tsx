// components/LocationPicker.tsx

import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import usePSGC from '@/hooks/usePSGC';
import { geocodeAddress } from '@/utils/geocodeAddress';

type Props = {
  onLocationSet: (data: {
    businessName: string;
    address: string;
    coords: { lat: number; lng: number };
  }) => void;
};

export default function LocationPicker({ onLocationSet }: Props) {
  const [businessName, setBusinessName] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    cities,
    barangays,
    selectedCityCode,
    setSelectedCityCode,
    loadingCities,
    loadingBarangays,
  } = usePSGC();

  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  const handleGeocode = async () => {
    if (!businessName || !selectedCityCode || !selectedBarangay || !exactAddress) return;

    const city = cities.find((c) => c.code === selectedCityCode)?.name;
    const barangay = barangays.find((b) => b.code === selectedBarangay)?.name;

    if (city && barangay) {
      const address = `${exactAddress}, ${barangay}, ${city}, NCR, Philippines`;
      const res = await geocodeAddress(address);
      if (res) {
        setCoords(res);
        setFullAddress(address);
        onLocationSet({ businessName, address, coords: res });
      }
    }
  };

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3">Business Location</Text>

      {/* Business Name */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Business Name</Text>
      <TextInput
        placeholder="Enter business name"
        value={businessName}
        onChangeText={setBusinessName}
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {/* Exact Address */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Street/Building/Exact Address</Text>
      <TextInput
        placeholder="e.g. 123 ABC St. Building Name"
        value={exactAddress}
        onChangeText={setExactAddress}
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {/* City Picker */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">City</Text>
      {loadingCities ? (
        <ActivityIndicator />
      ) : (
        <ScrollView horizontal className="mb-2">
          {cities.map((city) => (
            <TouchableOpacity
              key={city.code}
              onPress={() => {
                setSelectedCityCode(city.code);
                setSelectedBarangay(null);
              }}
              className={`px-3 py-1 mr-2 rounded-full border ${
                selectedCityCode === city.code ? 'bg-black border-black' : 'border-gray-300'
              }`}
            >
              <Text className={selectedCityCode === city.code ? 'text-white' : 'text-black text-sm'}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Barangay Picker */}
      {selectedCityCode && (
        <>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Barangay</Text>
          {loadingBarangays ? (
            <ActivityIndicator />
          ) : (
            <ScrollView horizontal className="mb-2">
              {barangays.map((bgy) => (
                <TouchableOpacity
                  key={bgy.code}
                  onPress={() => setSelectedBarangay(bgy.code)}
                  className={`px-3 py-1 mr-2 rounded-full border ${
                    selectedBarangay === bgy.code ? 'bg-black border-black' : 'border-gray-300'
                  }`}
                >
                  <Text className={selectedBarangay === bgy.code ? 'text-white' : 'text-black text-sm'}>
                    {bgy.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Set Location */}
      <TouchableOpacity onPress={handleGeocode} className="bg-black px-4 py-2 rounded-lg mb-4 self-start">
        <Text className="text-white text-sm">Set Location</Text>
      </TouchableOpacity>

      {/* Display Address and Coordinates */}
      {coords && fullAddress && (
        <Text className="text-sm text-gray-700 mb-2">
          📍 {fullAddress}{"\n"}🧭 {coords.lat}, {coords.lng}
        </Text>
      )}
    </View>
  );
}
