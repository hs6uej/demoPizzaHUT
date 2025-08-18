// src/pages/CartScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import { useCart } from '../context/CartContext'; // 1. Import useCart

const CartScreen = () => {
  const navigate = useNavigate();
  // 2. ดึงข้อมูลและฟังก์ชันจาก CartContext
  const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();

  // 3. คำนวณค่าต่างๆ แบบไดนามิก
  const deliveryFee = 40;
  const discount = 0; // สามารถเพิ่ม logic ส่วนลดทีหลังได้
  const total = subtotal + deliveryFee - discount;

  // ถ้าไม่มีสินค้าในตะกร้า
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="ตะกร้าของคุณ" showBackButton />
        <div className="flex-1 flex flex-col justify-center items-center">
          <p className="text-gray-500">ยังไม่มีสินค้าในตะกร้า</p>
          <button 
            onClick={() => navigate('/menu')} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md"
          >
            กลับไปเลือกเมนู
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="ตะกร้าของคุณ" showBackButton />
      <div className="flex-1 flex flex-col">
        {/* Cart items */}
        <div className="flex-1 overflow-auto">
          {cartItems.map(item => (
            <div key={item.sku} className="border-b px-4 py-3">
              <div className="flex justify-between">
                <div className="flex-1 pr-2">
                  <h3 className="font-medium">{item.name.th}</h3>
                  {/* <p className="text-sm text-gray-500 mt-1">{item.options}</p> */}
                </div>
                <button 
                  className="text-red-600 ml-2" 
                  onClick={() => removeFromCart(item.sku)}
                >
                  <TrashIcon size={18} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="font-medium">{parseInt(item.prices[0].price, 10) * item.quantity} ฿</div>
                <div className="flex items-center">
                  <button 
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                  <button 
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon code */}
        <div className="px-4 py-3 border-t">
          <div className="relative">
            <input type="text" placeholder="กรอกโค้ดส่วนลด" className="w-full pl-4 pr-24 py-2 border rounded-md" />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-100 px-4 py-1 rounded text-sm">
              ใช้โค้ด
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="px-4 py-3 border-t bg-gray-50">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">ยอดรวมค่าอาหาร</span>
            <span>{subtotal} ฿</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">ค่าจัดส่ง</span>
            <span>{deliveryFee} ฿</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-gray-600">ส่วนลด</span>
              <span className="text-green-600">-{discount} ฿</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-2 border-t font-bold">
            <span>ยอดสุทธิ</span>
            <span>{total} ฿</span>
          </div>
        </div>

        {/* Checkout button */}
        <div className="p-4 border-t">
          <PrimaryButton onClick={() => navigate('/payment')}>
            ดำเนินการต่อเพื่อชำระเงิน
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;