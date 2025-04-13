import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import BusinessInfoForm from '@/components/BusinessInfoForm';
import AddCategory from '@/components/AddCategory';
import AddProduct from '@/components/AddProduct';
import AddServices from '@/components/AddServices';
import { firestore } from '@/firebase/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { fetchProducts } from '@/api/products';

export default function BusinessSetupScreen() {
  const { user, loading } = useAuth();

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]); // ✅ includes `id` from Firestore

  const defaultCategories = ['Detergent', 'Fabric Conditioner'];
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<
    { name: string; price: string; category: string }[]
  >([]);

  const [detergentOptions, setDetergentOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [fabricConditionerOptions, setFabricConditionerOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const refreshProducts = async () => {
    if (!user?.uid) return;

    try {
      const products = await fetchProducts(user.uid);
      setSavedProducts(products);

      const detergents = products
        .filter((p: any) => p.category === 'Detergent' && p.id && p.name)
        .map((p: any) => ({ id: p.id, name: p.name }));

      const conditioners = products
        .filter(
          (p: any) => p.category === 'Fabric Conditioner' && p.id && p.name
        )
        .map((p: any) => ({ id: p.id, name: p.name }));

      setDetergentOptions(detergents);
      setFabricConditionerOptions(conditioners);
    } catch (error) {
      console.error('❌ Failed to fetch products via API:', error);
    }
  };

  useEffect(() => {
    const fetchSetup = async () => {
      if (!user?.uid) return;

      try {
        const infoSnap = await getDoc(
          doc(firestore, 'businesses', user.uid, 'info', 'details')
        );
        if (infoSnap.exists()) {
          const infoData = infoSnap.data();
          setBusinessInfo(infoData);
        }

        const catSnap = await getDocs(
          collection(firestore, 'businesses', user.uid, 'categories')
        );
        const allCat = catSnap.docs.map((doc) => doc.data().name);
        setSavedCategories(allCat);

        await refreshProducts();

        const servSnap = await getDocs(
          collection(firestore, 'businesses', user.uid, 'services')
        );

        const servData = servSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: String(doc.data().price ?? ''), // 🧠 convert to string for input
        }));

        setServices(servData);
      } catch (err) {
        console.error('❌ Failed to load setup data:', err);
      }
    };

    fetchSetup();
  }, [user?.uid]);

  if (loading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold my-4">Business Setup</Text>

        {/* ✅ Business Info */}
        <Text className="text-xl font-bold mb-2">📄 Business Info</Text>
        <BusinessInfoForm
          onSaved={(info) => setBusinessInfo(info)}
          defaultValues={businessInfo}
        />

        {/* ✅ Categories */}
        <Text className="text-xl font-bold mt-6 mb-2">📦 Categories</Text>
        <AddCategory
          defaultCategories={defaultCategories}
          customCategories={customCategories}
          onAdd={(newCat) => setCustomCategories((prev) => [...prev, newCat])}
          onComplete={() => {}}
          isComplete={false}
        />

        {/* ✅ Products */}
        <Text className="text-xl font-bold mt-6 mb-2">🛍 Products</Text>
        <AddProduct
          categories={defaultCategories.concat(customCategories)}
          userId={user.uid}
          onAdd={(product) => {
            setProducts((prev) => [...prev, product]);

            if (product.category === 'Detergent') {
              setDetergentOptions((prev) => [
                ...prev,
                { id: product.id, name: product.name },
              ]);
            } else if (product.category === 'Fabric Conditioner') {
              setFabricConditionerOptions((prev) => [
                ...prev,
                { id: product.id, name: product.name },
              ]);
            }

            refreshProducts();
          }}
          onDone={() => {}}
        />

        {/* ✅ Product List */}
        {products.length > 0 && (
          <View className="mt-6 px-2">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Product List
            </Text>
            {products.map((p, idx) => (
              <Text key={`prod-${idx}`} className="text-sm text-gray-600 mb-1">
                • {p.name} ({p.category}) — ₱{p.price}
              </Text>
            ))}
          </View>
        )}

        {/* ✅ Services */}
        <Text className="text-xl font-bold mt-6 mb-2">🧾 Services</Text>
        <AddServices
          services={services}
          onUpdate={(updated) => setServices([...updated])}
          detergentOptions={detergentOptions}
          fabricConditionerOptions={fabricConditionerOptions}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
