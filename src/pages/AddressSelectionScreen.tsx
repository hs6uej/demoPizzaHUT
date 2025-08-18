import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPinIcon, SearchIcon, ArrowLeftIcon, XIcon } from 'lucide-react';
import { findNearestStores } from '../services/storeService';
import { useApi } from '../context/ApiContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import StatusBarClock from '../components/StatusBarClock';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Component to recenter map when position changes
function RecenterAutomatically({
  lat,
  lng
}: {
  lat: number;
  lng: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

const AddressSelectionScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading: apiLoading
  } = useApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([13.7563, 100.5018]); // Bangkok coordinates
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if we're in delivery or takeaway mode
  const isDelivery = location.state?.type === 'delivery';

  useEffect(() => {
    // Get user's current position if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const {
          latitude,
          longitude
        } = position.coords;
        setCurrentPosition([latitude, longitude]);
        // Reverse geocode to get address
        fetchAddressFromCoordinates(latitude, longitude);
      }, error => {
        console.error('Error getting location:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch address from coordinates using OpenStreetMap Nominatim
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        setCurrentAddress(data.display_name);
      } else {
        setCurrentAddress('ไม่พบที่อยู่');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setCurrentAddress('ไม่สามารถดึงข้อมูลที่อยู่ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const {
          lat,
          lon,
          display_name
        } = data[0];
        setCurrentPosition([parseFloat(lat), parseFloat(lon)]);
        setCurrentAddress(display_name);
      } else {
        alert('ไม่พบที่อยู่ที่ค้นหา');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      alert('เกิดข้อผิดพลาดในการค้นหาที่อยู่');
    } finally {
      setLoading(false);
    }
  };

  const handleUseThisAddress = async () => {
    try {
      setLoading(true);
      // Find nearest stores based on current position
      const nearbyStores = await findNearestStores(currentPosition[0], currentPosition[1]);
      if (nearbyStores && nearbyStores.length > 0) {
        // Navigate to menu with selected store
        navigate('/menu', {
          state: {
            store: nearbyStores[0],
            userAddress: currentAddress,
            coordinates: currentPosition
          }
        });
      } else {
        alert('ไม่พบร้านค้าใกล้เคียง');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error finding nearby stores:', error);
      alert('เกิดข้อผิดพลาดในการค้นหาร้านค้าใกล้เคียง');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
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

      {isDelivery ?
        // Delivery address selection screen with map
        <>
          <div className="flex items-center px-4 py-3 border-b">
            <button onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeftIcon size={20} />
            </button>
            <h1 className="font-medium">ตำแหน่งปัจจุบันของคุณ</h1>
          </div>
          {/* Map with search */}
          <div className="relative flex-1 min-h-0">
            {/* Search bar overlay */}
            <div className="absolute top-3 left-4 right-4 z-[1000]">
              <form onSubmit={handleSearch} className="flex">
                <div className="bg-white rounded-md shadow-md flex items-center px-3 py-2 flex-1">
                  <SearchIcon size={18} className="text-gray-400 mr-2" />
                  <input type="text" placeholder="ค้นหาตำแหน่งที่อยู่ของคุณ" className="flex-1 outline-none text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button type="submit" className="ml-2 bg-red-600 text-white px-3 rounded-md">
                  ค้นหา
                </button>
              </form>
            </div>
            {/* Map component */}
            <div className="w-full h-full">
              {!apiLoading && <MapContainer center={currentPosition} zoom={15} style={{
            height: '100%',
            width: '100%'
          }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={currentPosition} />
                  <RecenterAutomatically lat={currentPosition[0]} lng={currentPosition[1]} />
                </MapContainer>}
            </div>
            {/* Address details at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-2xl shadow-lg z-[1000]">
              {loading ? <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
                </div> : <>
                  <div className="flex items-start mb-4">
                    <MapPinIcon size={20} className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">ที่อยู่ปัจจุบัน</p>
                      <p className="text-sm text-gray-600">{currentAddress}</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-red-600 text-white rounded-full" onClick={handleUseThisAddress} disabled={loading}>
                    {loading ? 'กำลังโหลด...' : 'ใช้ที่อยู่นี้'}
                  </button>
                </>}
            </div>
          </div>
        </> :
        // Redirect back to delivery type screen
        <>{navigate('/delivery-type')}</>}
    </div>
  );
};

export default AddressSelectionScreen;