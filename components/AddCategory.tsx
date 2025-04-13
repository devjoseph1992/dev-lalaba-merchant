import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createCategory } from '@/api/categories';

type Props = {
  customCategories: string[];
  defaultCategories?: string[];
  onAdd: (newCategory: string) => void;
  onComplete: () => void;
  isComplete?: boolean;
};

export default function AddCategory({
  customCategories,
  defaultCategories = ['Detergent', 'Fabric Conditioner'],
  onAdd,
  onComplete,
  isComplete = false,
}: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [defaultsSaved, setDefaultsSaved] = useState(false);

  const allCategories = [...defaultCategories, ...customCategories];

  const handleAdd = async () => {
    const newCat = input.trim();
    const isDuplicate = allCategories.some(
      (cat) => cat.toLowerCase() === newCat.toLowerCase()
    );

    if (!newCat) return;

    if (isDuplicate) {
      Alert.alert('Duplicate', `"${newCat}" is already in your category list.`);
      return;
    }

    setLoading(true);
    try {
      await createCategory({
        name: newCat,
        icon: '🧺',
        sortOrder: allCategories.length + 1,
      });

      onAdd(newCat);
      setInput('');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to add category');
    }
    setLoading(false);
  };

  const handleSaveDefaults = async () => {
    setSaving(true);
    try {
      const reserved = ['Detergent', 'Fabric Conditioner'];

      const toAdd = defaultCategories.filter(
        (cat) =>
          !reserved.includes(cat) &&
          !customCategories.some(
            (existing) => existing.toLowerCase() === cat.toLowerCase()
          )
      );

      await Promise.all(
        toAdd.map((cat, index) =>
          createCategory({
            name: cat,
            icon: cat === 'Detergent' ? '🧼' : '🧴',
            sortOrder: index + 1,
          }).catch((err) => {
            console.warn(`⚠️ Failed to add "${cat}":`, err.message);
          })
        )
      );

      setDefaultsSaved(true);
      onComplete(); // ✅ always move to next step
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to save default categories');
    }
    setSaving(false);
  };

  return (
    <View className="bg-white px-4 pt-6 mb-10">
      {/* ✏️ Input and Add */}
      <View className="flex-row items-center gap-2 mb-4">
        <TextInput
          placeholder="e.g. Bleach"
          value={input}
          onChangeText={setInput}
          editable={!loading && !isComplete}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white"
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={loading || isComplete}
          className="bg-black px-4 py-2 rounded-lg justify-center items-center"
        >
          <Text className="text-white text-sm font-semibold">
            {loading ? 'Adding...' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📋 Category List */}
      <View className="space-y-2 mb-6">
        {allCategories.map((cat, idx) => (
          <View key={idx} className="flex-row items-center">
            <Text className="text-sm text-gray-700">• {cat}</Text>
            {defaultCategories.includes(cat) && (
              <Text className="text-xs text-gray-400 ml-2">(Default)</Text>
            )}
          </View>
        ))}
      </View>

      {/* 💾 Save Button */}
      {!isComplete && !defaultsSaved && (
        <TouchableOpacity
          onPress={handleSaveDefaults}
          disabled={saving}
          className="bg-black py-3 rounded-xl mt-2"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              Save Categories
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
