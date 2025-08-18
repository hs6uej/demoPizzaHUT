import React from 'react';
import { CheckIcon, MapPinIcon } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
const OrderTrackingScreen = () => {
  const orderStatus = 'preparing'; // 'preparing', 'delivering', 'delivered'
  return <div className="flex flex-col h-screen">
      {/* Status header */}
      <div className="bg-green-600 text-white p-4 text-center">
        <h2 className="text-xl font-bold">สั่งซื้อสำเร็จ!</h2>
        <p className="mt-1">พิซซ่าของคุณกำลังถูกเตรียม</p>
      </div>
      {/* Map placeholder */}
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPinIcon size={32} className="text-gray-400" />
        </div>
      </div>
      {/* Order status tracker */}
      <div className="px-4 py-6">
        <div className="relative">
          {/* Status line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          {/* Status steps */}
          <div className="space-y-8">
            <div className="flex">
              <div className="relative z-10 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-4">
                <CheckIcon size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-medium">รับออเดอร์แล้ว</h3>
                <p className="text-sm text-gray-500">16:30</p>
              </div>
            </div>
            <div className="flex">
              <div className={`relative z-10 w-8 h-8 rounded-full ${orderStatus === 'preparing' || orderStatus === 'delivering' || orderStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center mr-4`}>
                {(orderStatus === 'preparing' || orderStatus === 'delivering' || orderStatus === 'delivered') && <CheckIcon size={16} className="text-white" />}
              </div>
              <div>
                <h3 className="font-medium">กำลังเตรียมอาหาร</h3>
                <p className="text-sm text-gray-500">16:35</p>
              </div>
            </div>
            <div className="flex">
              <div className={`relative z-10 w-8 h-8 rounded-full ${orderStatus === 'delivering' || orderStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center mr-4`}>
                {(orderStatus === 'delivering' || orderStatus === 'delivered') && <CheckIcon size={16} className="text-white" />}
              </div>
              <div>
                <h3 className="font-medium">กำลังจัดส่ง</h3>
                <p className="text-sm text-gray-500">16:50</p>
              </div>
            </div>
            <div className="flex">
              <div className={`relative z-10 w-8 h-8 rounded-full ${orderStatus === 'delivered' ? 'bg-green-600' : 'bg-gray-300'} flex items-center justify-center mr-4`}>
                {orderStatus === 'delivered' && <CheckIcon size={16} className="text-white" />}
              </div>
              <div>
                <h3 className="font-medium">จัดส่งสำเร็จ</h3>
                <p className="text-sm text-gray-500">--:--</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Order details */}
      <div className="mt-auto border-t">
        <div className="px-4 py-3 border-b">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-medium">ORDER011934</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">เวลาจัดส่งโดยประมาณ:</span>
            <span className="font-medium">17:15</span>
          </div>
        </div>
        <div className="p-4">
          <PrimaryButton>ดูรายละเอียดออเดอร์</PrimaryButton>
        </div>
      </div>
    </div>;
};
export default OrderTrackingScreen;