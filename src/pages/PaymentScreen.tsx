import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CreditCardIcon, QrCodeIcon } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import { useCart } from '../context/CartContext'; // 1. Import useCart

const PaymentScreen = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // 2. ดึง subtotal และคำนวณยอดสุทธิ
  const { subtotal } = useCart();
  const deliveryFee = 40; // ค่าจัดส่ง
  const total = subtotal + deliveryFee;

  const orderId = 'ORDER011934'; // ตัวอย่าง Order ID

  return (
    <div className="flex flex-col h-screen">
      <Header title="ชำระเงิน" showBackButton />
      <div className="flex-1 flex flex-col">
        {/* Total amount - 3. แสดงยอดเงินที่คำนวณใหม่ */}
        <div className="py-6 flex flex-col items-center justify-center bg-gray-50">
          <div className="text-sm text-gray-500">ยอดชำระ</div>
          <div className="text-3xl font-bold mt-1">{total} ฿</div>
          <div className="text-sm text-gray-500 mt-1">Order ID: {orderId}</div>
        </div>

        {/* Payment methods */}
        <div className="px-4 py-3">
          <h3 className="font-medium mb-3">เลือกช่องทางการชำระเงิน</h3>
          <div className="space-y-3">
            <button
              className={`w-full flex items-center p-3 border rounded-md ${paymentMethod === 'credit_card' ? 'border-red-600' : ''}`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <CreditCardIcon size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">บัตรเครดิต/เดบิต</span>
              {paymentMethod === 'credit_card' && <div className="ml-auto w-5 h-5 rounded-full bg-red-600"></div>}
            </button>
            <button
              className={`w-full flex items-center p-3 border rounded-md ${paymentMethod === 'true_money' ? 'border-red-600' : ''}`}
              onClick={() => setPaymentMethod('true_money')}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <div className="text-red-600 font-bold">T</div>
              </div>
              <span className="font-medium">True Money</span>
              {paymentMethod === 'true_money' && <div className="ml-auto w-5 h-5 rounded-full bg-red-600"></div>}
            </button>
            <button
              className={`w-full flex items-center p-3 border rounded-md ${paymentMethod === 'qr_code' ? 'border-red-600' : ''}`}
              onClick={() => setPaymentMethod('qr_code')}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <QrCodeIcon size={20} className="text-green-600" />
              </div>
              <span className="font-medium">QR Code / PromptPay</span>
              {paymentMethod === 'qr_code' && <div className="ml-auto w-5 h-5 rounded-full bg-red-600"></div>}
            </button>
          </div>
        </div>

        {/* Payment form */}
        {paymentMethod === 'credit_card' && (
          <div className="px-4 py-3 border-t">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  หมายเลขบัตร
                </label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-2 border rounded-md" />
              </div>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    วันหมดอายุ
                  </label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-2 border rounded-md" />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ชื่อบนบัตร
                </label>
                <input type="text" placeholder="FIRSTNAME LASTNAME" className="w-full px-4 py-2 border rounded-md" />
              </div>
            </div>
          </div>
        )}

        {/* Payment button */}
        <div className="mt-auto p-4 border-t">
          <PrimaryButton onClick={() => navigate('/order-tracking')}>
            ชำระเงิน {total} THB
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;