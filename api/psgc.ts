/**
 * Fetch list of cities in Metro Manila (Region 13)
 */
export const fetchMetroManilaCities = async (): Promise<{ code: string; name: string; provinceName: string }[]> => {
  try {
    const regionRes = await fetch('https://psgc.gitlab.io/api/regions/130000000');
    const region = await regionRes.json();

    const citiesRes = await fetch(region._cities_url);
    const cities = await citiesRes.json();

    return cities.map((city: any) => ({
      code: city.code,
      name: city.name,
      provinceName: city.provinceName,
    }));
  } catch (err) {
    console.error('🏙️ Failed to fetch Metro Manila cities:', err);
    return [];
  }
};
