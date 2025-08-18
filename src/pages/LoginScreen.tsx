import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import StatusBarClock from '../components/StatusBarClock'; // Import clock component

const LoginScreen = () => {
  const navigate = useNavigate();
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
        <button onClick={() => navigate('/')}> {/* แก้ไขตรงนี้ */}
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
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-xl font-bold mb-2">เข้าสู่ระบบสมาชิก</h2>
          <img src="/image.png" alt="HUT REWARDS" className="h-10 object-contain mb-6" />
          <p className="text-sm text-gray-500 mb-1">ยินดีต้อนรับกลับมา</p>
          <p className="text-lg font-medium mb-4">Jammy Jim</p>
          <div className="w-20 h-20 rounded-full overflow-hidden mb-6">
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
        <button onClick={() => navigate('/delivery-type')} className="flex items-center justify-center bg-green-500 text-white rounded-full py-2 px-6 w-56">
          <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2" fill="white">
            <circle cx="12" cy="12" r="10" />
            <path fill="green" d="M8 13l3 3 5-7" />
          </svg>
          เข้าสู่ระบบด้วย Line
        </button>
      </div>
      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-500 mt-auto">
        <p className="mb-2">© 2025 PHC บริษัทจำกัด</p>
        <div className="flex justify-center space-x-4">
          <span>ศูนย์ช่วยเหลือ</span>
          <span>ข้อตกลง</span>
          <span>ความเป็นส่วนตัว</span>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;