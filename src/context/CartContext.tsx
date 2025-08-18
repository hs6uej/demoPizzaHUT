// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useMemo } from 'react';
import { MenuItem } from '../services/menuService';

// สร้าง Type สำหรับสินค้าในตะกร้า โดยเพิ่ม 'quantity' เข้าไป
export interface CartItem extends MenuItem {
  quantity: number;
}

// สร้าง Type สำหรับค่าที่จะส่งผ่าน Context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeFromCart: (sku: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

// สร้าง Context พร้อมค่าเริ่มต้น
const CartContext = createContext<CartContextType | undefined>(undefined);

// สร้าง Provider เพื่อครอบแอปพลิเคชัน
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.sku === item.sku);
      if (existingItem) {
        // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวน
        return prevItems.map(i =>
          i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      // ถ้าจำนวนน้อยกว่าหรือเท่ากับ 0 ให้ลบออก
      removeFromCart(sku);
    } else {
      setCartItems(prevItems =>
        prevItems.map(i => (i.sku === sku ? { ...i, quantity } : i))
      );
    }
  };

  const removeFromCart = (sku: string) => {
    setCartItems(prevItems => prevItems.filter(i => i.sku !== sku));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };

  // คำนวณจำนวนสินค้าทั้งหมดในตะกร้า
  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // คำนวณราคารวม (ยังไม่รวมค่าส่ง)
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = parseInt(item.prices[0].price, 10);
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

// สร้าง Custom Hook เพื่อให้เรียกใช้ง่าย
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};