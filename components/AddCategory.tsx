import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase/firebaseConfig';

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
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not logged in');

      await addDoc(collection(firestore, 'businesses', user.uid, 'categories'), {
        name: newCat,
        createdAt: new Date(),
      });

      onAdd(newCat);
      setInput('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add category');
    }
    setLoading(false);
  };

  const handleSaveDefaults = async () => {
    setSaving(true);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not logged in');

      const snap = await getDocs(collection(firestore, 'businesses', user.uid, 'categories'));
      const existing = snap.docs.map((doc) => doc.data().name.toLowerCase());

      const toAdd = defaultCategories.filter(
        (cat) => !existing.includes(cat.toLowerCase())
      );

      await Promise.all(
        toAdd.map((cat) =>
          addDoc(collection(firestore, 'businesses', user.uid, 'categories'), {
            name: cat,
            createdAt: new Date(),
          })
        )
      );

      setDefaultsSaved(true);
      onComplete(); // ✅ Move to next step
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save default categories');
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
            <Text className="text-white text-center font-semibold">Save Categories</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
