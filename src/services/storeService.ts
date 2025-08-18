import api, { ensureToken } from './api';
export interface Store {
  store_code: string;
  tier_num: number;
  name: {
    en: string;
    th: string;
  };
  phone: string | null;
  address_info: {
    address: {
      en: string;
      th: string;
    };
    postcode: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    longitude: string;
    latitude: string;
  };
  operation_time: {
    delivery_start_time: string;
    delivery_end_time: string;
    pickup_start_time: string;
    pickup_end_time: string;
    time_difference: string;
  };
  earliest_delivery_time: string;
  earliest_pickup_time: string;
}
export interface StoreListResponse {
  meta: {
    status: number;
    subject: string;
    message: string;
  };
  response: {
    success: boolean;
    data: Store[];
  };
}
// Get all stores
export const getStores = async (lang: string = 'th'): Promise<Store[]> => {
  try {
    await ensureToken();
    const response = await api.get<StoreListResponse>(`/stores/list?lang=${lang}`);
    return response.data.response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};
// Find nearest stores by coordinates
export const findNearestStores = async (latitude: number, longitude: number, lang: string = 'th'): Promise<Store[]> => {
  try {
    const stores = await getStores(lang);
    // Calculate distance for each store
    const storesWithDistance = stores.map(store => {
      const storeLat = parseFloat(store.address_info.latitude);
      const storeLng = parseFloat(store.address_info.longitude);
      // Simple distance calculation (Haversine formula would be more accurate)
      const distance = calculateDistance(latitude, longitude, storeLat, storeLng);
      return {
        ...store,
        distance
      };
    });
    // Sort by distance
    return storesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error finding nearest stores:', error);
    throw error;
  }
};
// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};