import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { updateService } from '@/api/services';

type Service = {
  name: string;
  price: string;
  inclusions: string[];
  defaultDetergentId?: string;
  defaultFabricConditionerId?: string;
};

type ProductOption = { id: string; name: string };

type Props = {
  services: Service[];
  onUpdate: (updated: Service[]) => void;
  detergentOptions: ProductOption[];
  fabricConditionerOptions: ProductOption[];
};

export default function AddServices({
  services,
  onUpdate,
  detergentOptions,
  fabricConditionerOptions,
}: Props) {
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const updateField = (
    sIndex: number,
    field: keyof Service,
    value: string | string[]
  ) => {
    const updated = [...services];
    updated[sIndex][field] = value as any;
    onUpdate(updated);
  };

  const handleSave = async (index: number) => {
    const service = services[index];
    setSavingIndex(index);

    try {
      const priceNum = parseFloat(service.price);

      if (
        !service.price ||
        isNaN(priceNum) ||
        !service.defaultDetergentId ||
        !service.defaultFabricConditionerId
      ) {
        Alert.alert(
          'Missing fields',
          'Please fill all required fields correctly.'
        );
        return;
      }

      const payload = {
        name: service.name as 'Regular' | 'Premium',
        price: priceNum,
        inclusions: service.inclusions.filter((inc) => inc.trim() !== ''),
        defaultDetergentId: service.defaultDetergentId,
        defaultFabricConditionerId: service.defaultFabricConditionerId,
      };

      console.log('🔍 Payload to send:', payload);

      await updateService(payload);

      Alert.alert('Success', `${service.name} service updated.`);
    } catch (err: any) {
      console.error('❌ Failed to update service:', err);
      Alert.alert('Error', err.message || 'Failed to update service.');
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <ScrollView
      className="bg-white px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text className="text-2xl font-bold text-gray-800 mb-6">Services</Text>

      {services.map((service, sIndex) => (
        <View
          key={`service-${sIndex}`}
          className="border border-gray-300 rounded-xl p-4 mb-6"
        >
          <Text className="text-base font-bold mb-3">{service.name}</Text>

          {/* 💰 Price */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Price (₱)
          </Text>
          <TextInput
            placeholder="e.g. 250"
            keyboardType="numeric"
            value={service.price}
            onChangeText={(text) => updateField(sIndex, 'price', text)}
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
          />

          {/* 📋 Inclusions */}
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Inclusions
          </Text>
          {service.inclusions.map((inc, iIndex) => (
            <View
              key={`inc-${sIndex}-${iIndex}`}
              className="flex-row items-center mb-2"
            >
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
            onPress={() =>
              updateField(sIndex, 'inclusions', [...service.inclusions, ''])
            }
            className="mt-2 mb-4"
          >
            <Text className="text-xs text-blue-500">+ Add Inclusion</Text>
          </TouchableOpacity>

          {/* 🧼 Default Detergent */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Default Detergent
          </Text>
          <ScrollView horizontal className="mb-2">
            {detergentOptions.map(({ id, name }) => (
              <TouchableOpacity
                key={`det-${id}`}
                onPress={() => updateField(sIndex, 'defaultDetergentId', id)}
                className={`px-4 py-2 mr-2 rounded-full border ${
                  service.defaultDetergentId === id
                    ? 'bg-black border-black'
                    : 'border-gray-300'
                }`}
              >
                <Text
                  className={`text-base font-medium ${
                    service.defaultDetergentId === id
                      ? 'text-white'
                      : 'text-black'
                  }`}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 🧴 Default Fabric Conditioner */}
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Default Fabric Conditioner
          </Text>
          <ScrollView horizontal className="mb-4">
            {fabricConditionerOptions.map(({ id, name }) => (
              <TouchableOpacity
                key={`fab-${id}`}
                onPress={() =>
                  updateField(sIndex, 'defaultFabricConditionerId', id)
                }
                className={`px-4 py-2 mr-2 rounded-full border ${
                  service.defaultFabricConditionerId === id
                    ? 'bg-black border-black'
                    : 'border-gray-300'
                }`}
              >
                <Text
                  className={`text-base font-medium ${
                    service.defaultFabricConditionerId === id
                      ? 'text-white'
                      : 'text-black'
                  }`}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 💾 Save Button */}
          <TouchableOpacity
            onPress={() => handleSave(sIndex)}
            disabled={savingIndex === sIndex}
            className="bg-black py-2 rounded-lg"
          >
            {savingIndex === sIndex ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Save {service.name}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
