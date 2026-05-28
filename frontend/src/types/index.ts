// ── Auth ─────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'barista';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ── Đơn hàng ──────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'REJECTED';

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
  rejectionReason?: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
}

// ── Tồn kho ───────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
  updatedAt: string;
}

export interface RestockDto {
  quantity: number;
  operation: 'add' | 'set';
}

// ── Thống kê ──────────────────────────────────────────────────────────────

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
  rejectedOrders: number;
  completedOrders: number;
  topProducts: ProductStat[];
  allProducts: ProductStat[];
}

// ── Menu ──────────────────────────────────────────────────────────────────

export interface MenuItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  active?: boolean;
}

// ── Nhân sự ───────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
