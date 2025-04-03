import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function BusinessSetupScreen() {
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(['Detergent', 'Fabric Conditioner']);

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState(categories[0]);
  const [products, setProducts] = useState<
    { name: string; price: string; category: string }[]
  >([]);

  const [services, setServices] = useState([
    {
      name: 'Regular',
      price: '',
      inclusions: ['Standard delivery'],
    },
    {
      name: 'Premium',
      price: '',
      inclusions: ['Priority delivery'],
    },
  ]);

  const addInclusion = (serviceIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].inclusions.push('');
    setServices(updated);
  };

  const removeInclusion = (serviceIndex: number, inclusionIndex: number) => {
    const updated = [...services];
    updated[serviceIndex].inclusions.splice(inclusionIndex, 1);
    setServices(updated);
  };

  const updateInclusion = (serviceIndex: number, inclusionIndex: number, text: string) => {
    const updated = [...services];
    updated[serviceIndex].inclusions[inclusionIndex] = text;
    setServices(updated);
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  const addProduct = () => {
    if (productName && productPrice && productCategory) {
      setProducts((prev) => [
        ...prev,
        { name: productName, price: productPrice, category: productCategory },
      ]);
      setProductName('');
      setProductPrice('');
      setProductCategory(categories[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold my-4">Business Setup</Text>

        {/* Business Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Business Name</Text>
        <TextInput
          placeholder="Enter business name"
          value={businessName}
          onChangeText={setBusinessName}
          className="border border-gray-300 rounded-lg p-3 mb-4"
        />

        {/* Location (Placeholder) */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Business Location</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg p-3 mb-4"
          onPress={() => console.log('TODO: Show map picker')}
        >
          <Text className="text-gray-500">{location || 'Set exact location on map'}</Text>
        </TouchableOpacity>

        {/* Product Categories */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Add Product Category</Text>
        <View className="flex-row items-center gap-2 mb-2">
          <TextInput
            placeholder="e.g. Bleach"
            value={newCategory}
            onChangeText={setNewCategory}
            className="flex-1 border border-gray-300 rounded-lg p-2"
          />
          <TouchableOpacity onPress={addCategory} className="bg-black px-4 py-2 rounded-lg">
            <Text className="text-white text-sm">Add</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-4">
          {categories.map((cat, idx) => (
            <Text key={idx} className="text-sm text-gray-600">- {cat}</Text>
          ))}
        </View>

        {/* Add Product */}
        <Text className="text-sm font-semibold text-gray-700 mb-1">Add Product</Text>
        <TextInput
          placeholder="Product name"
          value={productName}
          onChangeText={setProductName}
          className="border border-gray-300 rounded-lg p-2 mb-2"
        />
        <TextInput
          placeholder="Product price (₱)"
          value={productPrice}
          keyboardType="numeric"
          onChangeText={setProductPrice}
          className="border border-gray-300 rounded-lg p-2 mb-2"
        />
        <Text className="text-xs text-gray-600 mb-1">Category: {productCategory}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setProductCategory(cat)}
              className={`px-3 py-1 mr-2 rounded-full border ${
                productCategory === cat ? 'bg-black border-black' : 'border-gray-300'
              }`}
            >
              <Text className={productCategory === cat ? 'text-white' : 'text-black text-sm'}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={addProduct} className="bg-black py-2 rounded-xl mb-4">
          <Text className="text-white text-center text-sm font-semibold">Add Product</Text>
        </TouchableOpacity>

        {/* Product List */}
        {products.length > 0 && (
          <>
            <Text className="text-sm font-semibold text-gray-700 mb-1">Product List</Text>
            {products.map((p, idx) => (
              <Text key={idx} className="text-sm text-gray-600 mb-1">
                - {p.name} ({p.category}) — ₱{p.price}
              </Text>
            ))}
          </>
        )}

        {/* Services */}
        <Text className="text-lg font-semibold mt-6 mb-3">Services</Text>
        {services.map((service, sIndex) => (
          <View key={sIndex} className="border border-gray-300 rounded-xl p-4 mb-4">
            <Text className="text-base font-bold mb-2">{service.name}</Text>
            <TextInput
              placeholder="Set price (₱)"
              keyboardType="numeric"
              value={service.price}
              onChangeText={(text) => {
                const updated = [...services];
                updated[sIndex].price = text;
                setServices(updated);
              }}
              className="border border-gray-300 rounded-lg p-2 mb-3"
            />
            <Text className="text-sm font-semibold text-gray-700 mb-1">Inclusions</Text>
            {service.inclusions.map((inc, iIndex) => (
              <View key={iIndex} className="flex-row items-center mb-2">
                <TextInput
                  value={inc}
                  placeholder="Add inclusion"
                  onChangeText={(text) => updateInclusion(sIndex, iIndex, text)}
                  className="flex-1 border border-gray-300 rounded-lg p-2"
                />
                <TouchableOpacity onPress={() => removeInclusion(sIndex, iIndex)} className="ml-2">
                  <Ionicons name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => addInclusion(sIndex)} className="mt-2">
              <Text className="text-xs text-blue-500">+ Add Inclusion</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity className="bg-black py-3 rounded-xl mt-6 mb-10">
          <Text className="text-white text-center font-semibold">Save Setup</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
