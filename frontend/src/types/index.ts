// ── Auth ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ── Orders ────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
}

// ── Inventory ─────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  updatedAt: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────

export interface ProductStat {
  id: string;
  productId: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  topProducts: ProductStat[];
  allProducts: ProductStat[];
}

// ── Menu catalogue (used in order form) ──────────────────────────────────

export interface MenuItem {
  productId: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
}
