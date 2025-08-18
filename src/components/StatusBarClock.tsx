import React, { useState, useEffect } from 'react';

const StatusBarClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // ตั้งค่าให้เวลาอัปเดตทุกๆ 10 วินาที
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);

    // Cleanup function เพื่อลบ interval เมื่อ component ถูก unmount
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return <div className="text-sm">{formatTime(currentTime)}</div>;
};

export default StatusBarClock;