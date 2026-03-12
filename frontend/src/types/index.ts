export interface User {
  id: string;
  email?: string;
  mobileNumber?: string;
  name?: string;
  role: 'superadmin' | 'vendor' | 'user';
  phone?: string;
  address?: string;
  image?: string;
  isActive?: boolean;
  location?: {
    type: string;
    coordinates: number[];
    address: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  location?: {
    type: string;
    coordinates: number[];
    address: string;
  };
  image?: string;
  isActive: boolean;
  avgRating?: number;
  totalRatings?: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  vendor: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  vendor: string;
  isAvailable: boolean;
  quantityAvailable?: number | null;
  image?: string;
}

export interface OrderItem {
  foodItem: FoodItem | string;
  name?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber?: string;
  user: string | { _id: string; name?: string; mobileNumber?: string };
  vendor: Vendor | string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  deliveryAddress: string;
  deliveryLocation: {
    type: string;
    coordinates: number[];
  };
  userMobile?: string;
  rating?: number | null;
  review?: string;
  createdAt: string;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export interface Analytics {
  vendorStats: {
    vendorId: string;
    vendorName: string;
    totalOrders: number;
    totalSales: number;
  }[];
  salesSummary: {
    totalOrders: number;
    totalSales: number;
  };
  period: string;
}

