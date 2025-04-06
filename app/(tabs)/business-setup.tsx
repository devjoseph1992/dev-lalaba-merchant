import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import BusinessInfoForm from '@/components/BusinessInfoForm';
import Stepper from '@/components/Stepper';
import AddCategory from '@/components/AddCategory';
import AddProduct from '@/components/AddProduct';
import AddServices from '@/components/AddServices';
import { firestore } from '@/firebase/firebaseConfig';

export default function BusinessSetupScreen() {
  const steps = ['Info', 'Categories', 'Products', 'Services', 'Done'];
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);

  const defaultCategories = ['Detergent', 'Fabric Conditioner'];
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<{ name: string; price: string; category: string }[]>([]);
  const [services, setServices] = useState([
    { name: 'Regular', price: '', inclusions: ['Standard delivery'] },
    { name: 'Premium', price: '', inclusions: ['Priority delivery'] },
  ]);

  const allCategories = [...defaultCategories, ...customCategories];

  const [detergentOptions, setDetergentOptions] = useState<string[]>([]);
  const [fabricConditionerOptions, setFabricConditionerOptions] = useState<string[]>([]);

  // 🧠 Load setup data if completed
  useEffect(() => {
    const fetchCompletedSetup = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      try {
        const infoSnap = await getDoc(doc(firestore, 'businesses', user.uid, 'info', 'details'));
        if (infoSnap.exists()) {
          const infoData = infoSnap.data();
          if (infoData.status === 'setup-complete') {
            setIsComplete(true);
            setBusinessInfo(infoData);
          }
        }

        const catSnap = await getDocs(collection(firestore, 'businesses', user.uid, 'categories'));
        const allCat = catSnap.docs.map((doc) => doc.data().name);
        setSavedCategories(allCat);

        const prodSnap = await getDocs(collection(firestore, 'businesses', user.uid, 'products'));
        const prodData = prodSnap.docs.map((doc) => doc.data());
        setSavedProducts(prodData);

        const detergents = prodData.filter((p) => p.category === 'Detergent').map((p) => p.name);
        const conditioners = prodData.filter((p) => p.category === 'Fabric Conditioner').map((p) => p.name);
        setDetergentOptions(detergents);
        setFabricConditionerOptions(conditioners);

        const servSnap = await getDocs(collection(firestore, 'businesses', user.uid, 'services'));
        const servData = servSnap.docs.map((doc) => doc.data());
        setSavedServices(servData);
      } catch (err) {
        console.error('❌ Failed to load setup data:', err);
      }
    };

    fetchCompletedSetup();
  }, []);

  const renderStep = () => {
    if (isComplete) {
      return (
        <View className="space-y-6">
          <Text className="text-xl font-bold mb-2">✅ Business Info</Text>
          <BusinessInfoForm onSaved={() => {}} readonly defaultValues={businessInfo} />

          <Text className="text-xl font-bold mb-2">📦 Product Categories</Text>
          <AddCategory
            defaultCategories={defaultCategories}
            customCategories={savedCategories.filter((c) => !defaultCategories.includes(c))}
            onAdd={() => {}}
            onComplete={() => {}}
            isComplete={true}
            readonly
          />

          <Text className="text-xl font-bold mb-2">🛍 Products</Text>
          <AddProduct
            categories={[...savedCategories]}
            onAdd={() => {}}
            onDone={() => {}}
            readonly
            existingProducts={savedProducts}
          />

          <Text className="text-xl font-bold mb-2">🧾 Services</Text>
          <AddServices
            services={savedServices}
            onUpdate={() => {}}
            onComplete={() => {}}
            readonly
            detergentOptions={detergentOptions}
            fabricConditionerOptions={fabricConditionerOptions}
          />
        </View>
      );
    }

    switch (step) {
      case 0:
        return (
          <BusinessInfoForm
            onSaved={(info) => {
              setBusinessInfo(info);
              setStep(1);
            }}
          />
        );
      case 1:
        return (
          <AddCategory
            defaultCategories={defaultCategories}
            customCategories={customCategories}
            onAdd={(newCat) => setCustomCategories((prev) => [...prev, newCat])}
            onComplete={() => setStep(2)}
            isComplete={step > 1}
          />
        );
      case 2:
        return (
          <AddProduct
            categories={allCategories}
            onAdd={(product) => setProducts((prev) => [...prev, product])}
            onDone={() => setStep(3)}
          />
        );
      case 3:
        return (
          <AddServices
            services={services}
            onUpdate={setServices}
            onComplete={() => {
              setIsComplete(true);
              setStep(4);
            }}
            detergentOptions={detergentOptions}
            fabricConditionerOptions={fabricConditionerOptions}
          />
        );
      case 4:
        return (
          <View className="mt-6">
            <Text className="text-lg font-bold mb-4">🎉 Setup Complete!</Text>
            <Text className="text-gray-700">You’ve completed your business setup.</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold my-4">Business Setup</Text>

        {/* 🚫 Hide Stepper after completion */}
        {!isComplete && <Stepper steps={steps} currentStep={step} />}

        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
}
