import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { ShoppingCartIcon, PlusIcon } from 'lucide-react';
import { getCategories, getMenuItems, Category, MenuItem } from '../services/menuService';
import { useApi } from '../context/ApiContext';
import { useCart } from '../context/CartContext';

// Helper function to map category slug to an emoji icon
const getCategoryIcon = (slug: string): string => {
  if (slug.includes('pizza')) return '🍕';
  if (slug.includes('pasta') || slug.includes('spaghetti')) return '🍝';
  if (slug.includes('appetizer') || slug.includes('side')) return '🍗';
  if (slug.includes('drink')) return '🥤';
  if (slug.includes('promo')) return '🔥';
  return '⭐';
};

// We need to add categoryId to each menu item for filtering
interface MenuItemWithCategory extends MenuItem {
  categoryId: string;
}

const MenuScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: apiLoading } = useApi();
  const { addToCart, cartCount } = useCart();

  // State for data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get store info from navigation state
  const store = location.state?.store;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, menuData] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);

        setCategories(categoriesData);

        // Set the first category as selected by default
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].slug);
        }

        // Flatten menu data and add categoryId to each item
        const allItems: MenuItemWithCategory[] = [];
        menuData.forEach(categoryGroup => {
          const items = [...categoryGroup.promos, ...categoryGroup.products];
          items.forEach(item => {
            // Check for item existence and name
            if (item && item.name) {
              // *** เพิ่มเงื่อนไขตรวจสอบราคาตรงนี้ ***
              const price = parseInt(item.prices?.[0]?.price ?? '0', 10);
              if (price > 0) {
                allItems.push({ ...item, categoryId: categoryGroup.category_id });
              }
            }
          });
        });
        setMenuItems(allItems);

      } catch (err) {
        console.error('Failed to fetch menu data:', err);
        setError('ไม่สามารถโหลดข้อมูลเมนูได้');
      } finally {
        setLoading(false);
      }
    };

    if (!apiLoading) {
      fetchData();
    }
  }, [apiLoading]);

  // Filter items to display based on selected category
  const filteredMenuItems = menuItems.filter(item => {
    if (!selectedCategory) return true;
    if (selectedCategory.includes('promo')) {
      return item.type === 'promo';
    }
    return item.categoryId === selectedCategory;
  });

  return (
    <div className="flex flex-col h-screen">
      <Header title={store?.name.th || 'เมนู'} showBackButton />

      {/* Cart button */}
      <div className="absolute top-4 right-4 z-10">
        <button className="relative p-2" onClick={() => navigate('/cart')}>
          <ShoppingCartIcon size={24} />
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-xs">{cartCount}</span>
            </div>
          )}
        </button>
      </div>
      
      {/* Loading and Error Handling */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-600">{error}</div>
      ) : (
        <>
          {/* Categories */}
          <div className="overflow-x-auto border-b">
            <div className="flex px-4 py-3 space-x-4">
              {categories.map(category => (
                <button
                  key={category.slug}
                  className={`flex flex-col items-center min-w-[60px] ${selectedCategory === category.slug ? 'text-red-600' : 'text-gray-500'}`}
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <span className="text-2xl">{getCategoryIcon(category.slug)}</span>
                  </div>
                  <span className="text-xs whitespace-nowrap">{category.name.th}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Promotions banner */}
          <div className="px-4 py-2">
            <div className="bg-red-100 rounded-lg p-4 flex items-center">
              <div className="flex-1">
                <h3 className="font-bold text-red-600">โปรโมชั่น 1 แถม 1</h3>
                <p className="text-sm text-red-600">พิซซ่าถาด 2 ถาดในราคาเพียงถาดเดียว</p>
              </div>
              <div className="bg-red-600 text-white px-3 py-1 rounded-md text-sm">ดูเพิ่มเติม</div>
            </div>
          </div>

          {/* Menu items */}
          <div className="flex-1 overflow-auto px-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              {filteredMenuItems.map(item => (
                <div key={item.sku} className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="h-32 bg-gray-200 relative">
                    <img 
                      src={item.image_url?.th ?? ''} 
                      alt={item.name?.th ?? 'Menu item'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="font-bold text-sm leading-tight">{item.name?.th ?? 'ไม่มีชื่อสินค้า'}</h3>
                    {item.description?.th && (
                       <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">
                        {item.description.th}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">{parseInt(item.prices?.[0]?.price ?? '0', 10)} ฿</span>
                      <button
                        className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white"
                        onClick={() => addToCart(item)}
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MenuScreen;