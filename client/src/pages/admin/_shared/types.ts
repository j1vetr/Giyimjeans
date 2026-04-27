export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  basePrice: string;
  categoryId: string;
  categoryIds?: string[];
  images: string[];
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    city: string;
    district: string;
    postalCode: string;
  };
  total: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

export interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  price: string;
  stock: number;
}

export type TabType =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'users'
  | 'analytics'
  | 'inventory'
  | 'settings'
  | 'database'
  | 'ai-descriptions'
  | 'menu'
  | 'marketplaces';
