import { useEffect, useState } from 'react';

type PSGCCity = {
  code: string;
  name: string;
};

type PSGCBarangay = {
  code: string;
  name: string;
};

export default function usePSGC() {
  const [cities, setCities] = useState<PSGCCity[]>([]);
  const [barangays, setBarangays] = useState<PSGCBarangay[]>([]);
  const [selectedCityCode, setSelectedCityCode] = useState<string | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Fetch all cities in NCR (Region 130000000)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch('https://psgc.gitlab.io/api/regions/130000000/cities/');
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.warn('❌ Failed to fetch cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch barangays of selected city
  useEffect(() => {
    if (!selectedCityCode) {
      setBarangays([]);
      return;
    }

    const fetchBarangays = async () => {
      setLoadingBarangays(true);
      try {
        const res = await fetch(`https://psgc.gitlab.io/api/cities/${selectedCityCode}/barangays/`);
        const data = await res.json();
        setBarangays(data);
      } catch (error) {
        console.warn('❌ Failed to fetch barangays:', error);
        setBarangays([]);
      } finally {
        setLoadingBarangays(false);
      }
    };

    fetchBarangays();
  }, [selectedCityCode]);

  return {
    cities,
    barangays,
    selectedCityCode,
    setSelectedCityCode,
    loadingCities,
    loadingBarangays,
  };
}
