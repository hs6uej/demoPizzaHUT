import api, { ensureToken } from './api';
export interface Category {
  slug: string;
  name: {
    en: string;
    th: string;
  };
}
export interface CategoryListResponse {
  meta: {
    status: number;
    subject: string;
    message: string;
  };
  response: {
    success: boolean;
    data: Category[];
  };
}
export interface MenuItem {
  sku: string;
  id: string;
  type: string;
  name: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  image_url: {
    en: string;
    th: string;
  };
  prices: {
    tier_num: number;
    price: string;
  }[];
}
export interface MenuListResponse {
  meta: {
    status: number;
    subject: string;
    message: string;
  };
  response: {
    success: boolean;
    data: {
      category_id: string;
      promos: MenuItem[];
      products: MenuItem[];
    }[];
  };
}
// Get all categories
export const getCategories = async (lang: string = 'th'): Promise<Category[]> => {
  try {
    await ensureToken();
    const response = await api.get<CategoryListResponse>(`/categories/list?lang=${lang}`);
    return response.data.response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
// Get all menu items
export const getMenuItems = async (lang: string = 'th') => {
  try {
    await ensureToken();
    const response = await api.get<MenuListResponse>(`/menus/list?lang=${lang}`);
    return response.data.response.data;
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};