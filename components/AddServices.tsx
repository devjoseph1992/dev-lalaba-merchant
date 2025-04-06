import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebaseConfig';

type Service = {
  name: string;
  price: string;
  inclusions: string[];
  defaultDetergent?: string;
  defaultFabricConditioner?: string;
};

type Props = {
  services: Service[];
  onUpdate: (updated: Service[]) => void;
  onComplete: () => void;
  detergentOptions: string[];
  fabricConditionerOptions: string[];
};

export default function AddServices({
                                      services,
                                      onUpdate,
                                      onComplete,
                                      detergentOptions,
                                      fabricConditionerOptions,
                                    }: Props) {
  const [saving, setSaving] = useState(false);

  const updateField = (
    sIndex: number,
    field: keyof Service,
    value: string | string[]
  ) => {
    const updated = [...services];
    updated[sIndex][field] = value as never;
    onUpdate(updated);
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not logged in');

      const serviceRef = collection(firestore, 'businesses', user.uid, 'services');

      await Promise.all(
        services.map((s) =>
          addDoc(serviceRef, {
            ...s,
            createdAt: new Date(),
          })
        )
      );

      onComplete();
    } catch (err) {
      Alert.alert('Error', 'Failed to save services.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      className="bg-white px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-2xl font-bold text-gray-800 mb-6">Services</Text>

      {services.map((service, sIndex) => (
        <View key={sIndex} className="border border-gray-300 rounded-xl p-4 mb-6">
          <Text className="text-base font-bold mb-3">{service.name}</Text>

          {/* 💰 Price */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">Set Price (₱)</Text>
          <TextInput
            placeholder="e.g. 250"
            keyboardType="numeric"
            value={service.price}
            onChangeText={(text) => updateField(sIndex, 'price', text)}
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
          />

          {/* 📦 Inclusions */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">Inclusions</Text>
          {service.inclusions.map((inc, iIndex) => (
            <View key={iIndex} className="flex-row items-center mb-2">
              <TextInput
                value={inc}
                placeholder="Add inclusion"
                onChangeText={(text) => {
                  const updated = [...service.inclusions];
                  updated[iIndex] = text;
                  updateField(sIndex, 'inclusions', updated);
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <TouchableOpacity
                onPress={() => {
                  const updated = [...service.inclusions];
                  updated.splice(iIndex, 1);
                  updateField(sIndex, 'inclusions', updated);
                }}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => updateField(sIndex, 'inclusions', [...service.inclusions, ''])}
            className="mt-2 mb-4"
          >
            <Text className="text-xs text-blue-500">+ Add Inclusion</Text>
          </TouchableOpacity>

          {/* 🧴 Default Detergent */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">Default Detergent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {detergentOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateField(sIndex, 'defaultDetergent', option)}
                className={`px-3 py-1 mr-2 rounded-full border ${
                  service.defaultDetergent === option
                    ? 'bg-black border-black'
                    : 'border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm ${
                    service.defaultDetergent === option ? 'text-white' : 'text-black'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 🧴 Default Fabric Conditioner */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Default Fabric Conditioner
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {fabricConditionerOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => updateField(sIndex, 'defaultFabricConditioner', option)}
                className={`px-3 py-1 mr-2 rounded-full border ${
                  service.defaultFabricConditioner === option
                    ? 'bg-black border-black'
                    : 'border-gray-300'
                }`}
              >
                <Text
                  className={`text-sm ${
                    service.defaultFabricConditioner === option ? 'text-white' : 'text-black'
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      {/* ✅ Save & Complete */}
      <TouchableOpacity
        onPress={handleFinish}
        disabled={saving}
        className="bg-black py-3 rounded-xl"
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">Finish Setup</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
