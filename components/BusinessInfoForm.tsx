import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore } from '@/firebase/firebaseConfig';
import { getCoordinates } from '@/api/geocode';
import usePSGC from '@/hooks/usePSGC';

export default function BusinessInfoForm({ onSaved }: { onSaved: (data: any) => void }) {
  const [businessName, setBusinessName] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const {
    cities,
    barangays,
    selectedCityCode,
    setSelectedCityCode,
    loadingCities,
    loadingBarangays,
  } = usePSGC();

  const selectedCityName = cities.find((c) => c.code === selectedCityCode)?.name || '';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!businessName || !exactAddress || !barangay || !selectedCityName) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    setUploading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not logged in');

      const coords = await getCoordinates(`${exactAddress}, ${barangay}, ${selectedCityName}`);
      if (!coords) throw new Error('Could not get coordinates');

      let imageUrl = null;
      if (image) {
        const storage = getStorage();
        const imageRef = ref(storage, `businesses/${user.uid}/logo.jpg`);
        const img = await fetch(image);
        const blob = await img.blob();
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      const infoData = {
        businessName,
        exactAddress,
        barangay,
        city: selectedCityName,
        coordinates: coords,
        imageUrl: imageUrl || null,
        status: 'setup-complete',
      };

      await setDoc(doc(firestore, 'businesses', user.uid, 'info', 'details'), infoData);

      setIsSetupComplete(true);
      onSaved(infoData); // ⏩ Trigger move to next step
      Alert.alert('✅ Success', 'Business info saved!');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
      console.error(err);
    }
    setUploading(false);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-white px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text className="text-2xl font-bold text-center mb-6">Business Setup</Text>

      {/* 🖼 Circular logo */}
      <TouchableOpacity onPress={pickImage} className="mb-6">
        <View className="items-center justify-center w-full">
          <View
            className="rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200"
            style={{
              width: 128,
              height: 128,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 text-xs">Tap to Add Logo</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>



      {/* 🏢 Business Name */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Business Name</Text>
      <TextInput
        placeholder="Enter business name"
        value={businessName}
        onChangeText={setBusinessName}
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {/* 🏠 Address */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Exact Address</Text>
      <TextInput
        placeholder="e.g. 123 Sampaguita St."
        value={exactAddress}
        onChangeText={setExactAddress}
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {/* 🏙 City Picker */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">City</Text>
      {loadingCities ? (
        <ActivityIndicator className="mb-4" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {cities.map((c) => (
            <TouchableOpacity
              key={c.code}
              onPress={() => {
                setSelectedCityCode(c.code);
                setBarangay('');
              }}
              className={`px-4 py-2 mr-2 rounded-full border ${
                selectedCityCode === c.code ? 'bg-black border-black' : 'border-gray-300'
              }`}
            >
              <Text className={selectedCityCode === c.code ? 'text-white' : 'text-black'}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 🏘 Barangay Picker */}
      {barangays.length > 0 && (
        <>
          <Text className="text-sm font-semibold text-gray-700 mb-1">Barangay</Text>
          {loadingBarangays ? (
            <ActivityIndicator className="mb-4" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {barangays.map((b) => (
                <TouchableOpacity
                  key={b.code}
                  onPress={() => setBarangay(b.name)}
                  className={`px-4 py-2 mr-2 rounded-full border ${
                    barangay === b.name ? 'bg-black border-black' : 'border-gray-300'
                  }`}
                >
                  <Text className={barangay === b.name ? 'text-white' : 'text-black'}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* ✅ Save Button */}
      {!isSetupComplete && (
        <TouchableOpacity
          className="bg-black py-3 rounded-xl mt-2"
          disabled={uploading}
          onPress={handleSave}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">Save Business Info</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
