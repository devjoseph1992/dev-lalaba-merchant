import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createProduct,
  fetchProducts, // ✅ Function to call your GET endpoint
  NewProductPayload,
} from '@/api/products';

type Product = {
  name: string;
  price: string;
  category: string;
};

type Props = {
  categories: string[];
  userId: string; // ✅ Merchant ID from context
  onAdd: (product: Product) => void;
  onDone: () => void;
};

export default function AddProduct({
  categories,
  userId,
  onAdd,
  onDone,
}: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load products from API (not Firestore)
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts(userId);
      const formatted = response.map((p: any) => ({
        name: p.name,
        price: String(p.price),
        category: p.category,
      }));
      setProducts(formatted);
    } catch (err) {
      console.error('❌ Failed to fetch products:', err);
      Alert.alert('Error', 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories]);

  const handleAdd = async () => {
    if (!name.trim() || !price.trim() || !category) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert('Invalid Price', 'Please enter a valid number for price.');
      return;
    }

    const payload: NewProductPayload = {
      name: name.trim(),
      category,
      price: parsedPrice,
      imageUrl: null,
      available: true,
    };

    setSaving(true);
    try {
      await createProduct(userId, payload);

      // Optionally add to local state
      onAdd({ name, price, category });

      // Refresh from backend
      await loadProducts();

      // Reset form
      setName('');
      setPrice('');
      setCategory(categories[0]);

      onDone(); // 👈 advance to next step if needed
    } catch (err: any) {
      console.error('❌ Product save failed:', err);
      Alert.alert('Error', err.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-white px-4 pt-6 mb-10">
      <Text className="text-lg font-bold text-gray-800 mb-4">Add Product</Text>

      <Text className="text-sm font-semibold text-gray-700 mb-1">
        Product Name
      </Text>
      <TextInput
        placeholder="e.g. Liquid Detergent"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      <Text className="text-sm font-semibold text-gray-700 mb-1">
        Price (₱)
      </Text>
      <TextInput
        placeholder="e.g. 150"
        value={price}
        keyboardType="numeric"
        onChangeText={setPrice}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      <Text className="text-sm font-semibold text-gray-700 mb-2">
        Select Category
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`px-4 py-2 mr-2 rounded-full border ${
              category === cat ? 'bg-black border-black' : 'border-gray-300'
            }`}
          >
            <Text
              className={`text-sm ${
                category === cat ? 'text-white' : 'text-black'
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAdd}
        disabled={saving}
        className="bg-black py-3 rounded-xl"
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">
            Add Product
          </Text>
        )}
      </TouchableOpacity>

      {/* 📝 Product List */}
      <View className="mt-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Product List
        </Text>
        {loading ? (
          <ActivityIndicator />
        ) : products.length > 0 ? (
          products.map((p, idx) => (
            <Text key={idx} className="text-sm text-gray-600 mb-1">
              • {p.name} ({p.category}) — ₱{p.price}
            </Text>
          ))
        ) : (
          <Text className="text-sm text-gray-400">No products added yet.</Text>
        )}
      </View>
    </View>
  );
}
