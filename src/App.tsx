import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext';
import { CartProvider } from './context/CartContext';
import ChatScreen from './pages/ChatScreen'; // 1. Import ChatScreen
import LoginScreen from './pages/LoginScreen';
import DeliveryTypeScreen from './pages/DeliveryTypeScreen';
import AddressSelectionScreen from './pages/AddressSelectionScreen';
import MenuScreen from './pages/MenuScreen';
import CartScreen from './pages/CartScreen';
import PaymentScreen from './pages/PaymentScreen';
import OrderTrackingScreen from './pages/OrderTrackingScreen';

export function App() {
  return (
    <ApiProvider>
      <CartProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="w-full min-h-screen bg-gray-100 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-lg">
              <Routes>
                {/* 2. เปลี่ยนหน้าแรกให้เป็น ChatScreen */}
                <Route path="/" element={<ChatScreen />} />
                
                {/* 3. ย้าย LoginScreen ไปที่ path อื่น (เผื่อยังต้องใช้) */}
                <Route path="/login" element={<LoginScreen />} /> 
                
                <Route path="/delivery-type" element={<DeliveryTypeScreen />} />
                <Route path="/address-selection" element={<AddressSelectionScreen />} />
                <Route path="/menu" element={<MenuScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/payment" element={<PaymentScreen />} />
                <Route path="/order-tracking" element={<OrderTrackingScreen />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </CartProvider>
    </ApiProvider>
  );
}