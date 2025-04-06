import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebaseConfig';

type Product = {
  name: string;
  price: string;
  category: string;
};

type Props = {
  categories: string[];
  onAdd: (product: Product) => void;
  onDone: () => void;
};

export default function AddProduct({ categories, onAdd, onDone }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name || !price || !category) return;

    const newProduct = { name, price, category };
    setSaving(true);

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not logged in');

      await addDoc(collection(firestore, 'businesses', user.uid, 'products'), {
        ...newProduct,
        createdAt: new Date(),
      });

      setProducts((prev) => [...prev, newProduct]);
      onAdd(newProduct);
      setName('');
      setPrice('');
      setCategory(categories[0]);
      onDone(); // Advance to next step
    } catch (err) {
      Alert.alert('Error', 'Failed to save product');
      console.error(err);
    }

    setSaving(false);
  };

  return (
    <View className="bg-white px-4 pt-6 mb-10">
      {/* 🛒 Section Header */}
      <Text className="text-lg font-bold text-gray-800 mb-4">Add Product</Text>

      {/* 🧼 Name */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Product Name</Text>
      <TextInput
        placeholder="e.g. Liquid Detergent"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      {/* 💰 Price */}
      <Text className="text-sm font-semibold text-gray-700 mb-1">Price (₱)</Text>
      <TextInput
        placeholder="e.g. 150"
        value={price}
        keyboardType="numeric"
        onChangeText={setPrice}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      {/* 🏷️ Category */}
      <Text className="text-sm font-semibold text-gray-700 mb-2">Select Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`px-4 py-2 mr-2 rounded-full border ${
              category === cat ? 'bg-black border-black' : 'border-gray-300'
            }`}
          >
            <Text className={category === cat ? 'text-white' : 'text-black text-sm'}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ➕ Save Button */}
      <TouchableOpacity
        onPress={handleAdd}
        disabled={saving}
        className="bg-black py-3 rounded-xl"
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">Add Product</Text>
        )}
      </TouchableOpacity>

      {/* 📝 Product List */}
      {products.length > 0 && (
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Product List</Text>
          {products.map((p, idx) => (
            <Text key={idx} className="text-sm text-gray-600 mb-1">
              - {p.name} ({p.category}) — ₱{p.price}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
