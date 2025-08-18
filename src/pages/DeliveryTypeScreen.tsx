import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import { getStores, findNearestStores, Store } from '../services/storeService';
import { useApi } from '../context/ApiContext';
import StatusBarClock from '../components/StatusBarClock';

const DeliveryTypeScreen = () => {
  const navigate = useNavigate();
  const { loading: apiLoading } = useApi();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch all stores (fallback)
    const fetchAllStores = async () => {
      try {
        setLoading(true);
        const storesData = await getStores();
        setStores(storesData);
      } catch (err) {
        setError('Failed to load stores');
        console.error('Error fetching all stores:', err);
      } finally {
        setLoading(false);
      }
    };

    // Function to get location and then fetch sorted stores
    const fetchAndSortStores = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          // Success: We got the location
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              setLoading(true);
              const storesData = await findNearestStores(latitude, longitude);
              setStores(storesData);
            } catch (err) {
              setError('Failed to load stores');
              console.error('Error fetching nearest stores:', err);
            } finally {
              setLoading(false);
            }
          },
          // Error: User denied location or it failed. Fallback to fetching all stores.
          (error) => {
            console.warn('Could not get location, fetching all stores instead.', error);
            fetchAllStores();
          }
        );
      } else {
        // Geolocation is not supported by this browser.
        console.warn('Geolocation not supported, fetching all stores instead.');
        fetchAllStores();
      }
    };

    if (!apiLoading) {
      fetchAndSortStores();
    }
  }, [apiLoading]);

  const handleDeliverySelect = () => {
    navigate('/address-selection', {
      state: {
        type: 'delivery'
      }
    });
  };

  const handleStoreSelect = (store: Store) => {
    navigate('/menu', {
      state: {
        store
      }
    });
  };

  // Format distance to show in km with 2 decimal places
  const formatDistance = (distance?: number) => {
    if (distance === undefined) return '';
    return `${distance.toFixed(2)} KM`;
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Status bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center">
        <StatusBarClock />
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-full h-2/3 border-l border-r border-black"></div>
          </div>
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-2/3 h-2/3 rounded-full border border-black"></div>
          </div>
          <div className="w-6 h-3 rounded-md bg-black"></div>
        </div>
      </div>

      {/* Header with URL and close button */}
      <div className="px-4 py-2 flex justify-between items-center border-b">
        <div className="flex flex-col">
          <span className="font-bold text-sm">Pizza Hut 1150</span>
          <span className="text-xs text-gray-500">
            www.pizzahut.co.th/login-line
          </span>
        </div>
        <button onClick={() => navigate('/')}>
          <XIcon size={20} />
        </button>
      </div>

      {/* Navigation bar */}
      <div className="flex justify-between px-6 py-3 border-b">
        <div className="flex flex-col items-center">
          <img src="/pizza-hut-logo-png_seeklogo-479706.png" alt="Pizza Hut Logo" className="h-12 object-contain" />
        </div>
        <div className="flex space-x-4">
          <button className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <span className="text-xs mt-1">เมนูหลัก</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                <path d="M12 8l4 4 4-4" />
                <path d="M16 4v8" />
              </svg>
            </div>
            <span className="text-xs mt-1">ออเดอร์</span>
          </button>
          <button className="flex flex-col items-center">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M4 11a9 9 0 0 1 9 9" />
                <path d="M4 4a16 16 0 0 1 16 16" />
                <circle cx="5" cy="19" r="1" />
              </svg>
            </div>
            <span className="text-xs mt-1">ไทย</span>
          </button>
        </div>
      </div>
      
      <div className="px-4 py-3 border-b">
        <p className="font-medium text-lg">เลือกประเภทการจัดส่งและที่อยู่</p>
      </div>
      
      {/* Delivery type selection */}
      <div className="px-4 py-3 flex">
        <div className="flex-1">
          <button className="w-full py-3 bg-black text-white rounded-l-md font-medium" onClick={handleDeliverySelect}>
            บริการส่งถึงบ้าน
          </button>
        </div>
        <div className="flex-1">
          <button className="w-full py-3 bg-red-600 text-white rounded-r-md font-medium">
            รับสินค้าที่ร้าน
          </button>
        </div>
      </div>

      {/* Store list */}
      <div className="flex-1 overflow-auto px-4 py-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <>
            <p className="font-medium mb-3">ร้านใกล้ฉัน</p>
            {stores.slice(0, 2).map(store => (
              <div key={store.store_code} className="mb-3 bg-red-100 rounded-lg p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-red-600">{store.name.th}</p>
                    <p className="text-xs text-red-600">
                      {store.address_info.address.th}
                    </p>
                    {/* Display the distance */}
                    {store.distance !== undefined && (
                      <p className="text-xs text-gray-500 mt-1 font-semibold">
                        {formatDistance(store.distance)}
                      </p>
                    )}
                  </div>
                  <button 
                    className="bg-white text-red-600 rounded-full px-3 py-1 text-xs h-fit" 
                    onClick={() => handleStoreSelect(store)}
                  >
                    เลือก
                  </button>
                </div>
              </div>
            ))}
            <p className="font-medium mb-3 mt-5">ร้านอื่นๆ</p>
            {stores.slice(2).map(store => (
              <div key={store.store_code} className="mb-3 bg-white border rounded-lg p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{store.name.th}</p>
                    <p className="text-xs text-gray-600">
                      {store.address_info.address.th}
                    </p>
                     {/* Display the distance */}
                    {store.distance !== undefined && (
                       <p className="text-xs text-gray-500 mt-1">
                        {formatDistance(store.distance)}
                      </p>
                    )}
                  </div>
                  <button 
                    className="bg-white text-red-600 border border-red-600 rounded-full px-3 py-1 text-xs h-fit" 
                    onClick={() => handleStoreSelect(store)}
                  >
                    เลือก
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DeliveryTypeScreen;