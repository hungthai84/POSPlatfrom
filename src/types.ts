/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Variant {
  id: string;
  sku: string; // Mã mẫu mã / SP
  name: string; // Tên mẫu mã (e.g. "Sản phẩm 3 - Đỏ / S")
  productId: string;
  price: number; // Giá bán
  importPrice: number; // Giá nhập
  stock: number; // Tổng nhập
  available: number; // Có thể bán
  shipping: number; // Chờ vận chuyển
  options: { [key: string]: string }; // vd: { Mau: "Đỏ", Size: "S" }
}

export interface Product {
  id: string;
  sku: string; // Mã SP
  name: string; // Tên sản phẩm
  category: string; // Danh mục
  image: string; // Đường dẫn hình ảnh
  videoUrl?: string; // Video URL
  variants: Variant[];
  isActive: boolean; // Trạng thái kích hoạt (bật/tắt)
  description?: string;
  totalImport: number; // Tổng nhập
  totalAvailable: number; // Có thể bán
  totalShipping: number; // Chờ vận chuyển
}

export interface Customer {
  id: string;
  name: string; // Tên khách hàng
  phone: string; // Số điện thoại
  email?: string;
  address?: string;
  type: 'regular' | 'vip' | 'wholesale'; // Loại khách hàng
  totalSpent: number; // Tổng chi tiêu
  orderCount: number; // Số đơn hàng
  createdAt: string;
}

export interface CartItem {
  product: Product;
  variant: Variant;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string; // Mã đơn hàng (e.g., "DH-1002")
  customer?: Customer; // Khách hàng
  items: OrderItem[];
  totalAmount: number; // Tổng số tiền hàng
  discount: number; // Giảm giá
  shippingFee?: number; // Phí vận chuyển
  surcharge?: number; // Phụ thu
  tax: number; // Thuế (VAT)
  finalAmount: number; // Tổng thanh toán
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'e_wallet'; // Phương thức thanh toán
  status: 'pending' | 'processing' | 'completed' | 'canceled'; // Trạng thái đơn hàng
  createdAt: string;
  notes?: string;
  internalNotes?: string;
  staffHandling?: string;
  staffCaring?: string;
  marketer?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  expectedDeliveryDate?: string;
  tags?: string[];
}

export interface ShopConfig {
  name: string;
  phone: string;
  address: string;
  email: string;
  currency: string;
  taxRate: number; // vd: 0.1 cho 10%
  lowStockThreshold?: number;
  logoUrl?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customer?: Customer;
  items: OrderItem[];
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  code: string; // e.g. "LARK2026"
  name: string; // Tên chương trình
  description?: string; // Chi tiết điều kiện
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value: number; // e.g., 10 for 10% or 50000 for 50k
  maxDiscount?: number; // Giới hạn giảm tối đa
  minOrderValue: number; // Đơn hàng tối thiểu
  startDate: string; // ISO date
  endDate: string; // ISO date
  usageLimit?: number; // Giới hạn dùng
  usageCount: number; // Đã dùng
  isActive: boolean; // Trạng thái kích hoạt
  targetCustomerType?: 'all' | 'regular' | 'vip' | 'wholesale';
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'tiktok';
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

export interface ComboItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface Combo {
  id: string;
  name: string;
  sku: string;
  items: ComboItem[];
  price: number;
  originalPrice: number;
  image?: string;
  isActive: boolean;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  phone: string;
  email?: string;
  address?: string;
  taxCode?: string;
  category?: string;
  debt: number;
  isActive: boolean;
  createdAt: string;
  notes?: string;
}

export interface LivestreamComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isOrder?: boolean;
  status?: 'pending' | 'converted' | 'ignored';
}

export interface LivestreamSession {
  id: string;
  title: string;
  platform: 'facebook' | 'tiktok' | 'instagram';
  status: 'live' | 'ended' | 'scheduled';
  viewers: number;
  startTime: string;
  endTime?: string;
  comments: LivestreamComment[];
  totalOrders: number;
  revenue: number;
  keywords: string[]; // e.g. ["A01", "B02"]
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  dueDate: string;
  createdAt: string;
}

export interface CashFlow {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  note: string;
  date: string;
  referenceId?: string;
}

export interface Debt {
  id: string;
  targetId: string; // Customer or Supplier ID
  targetName: string;
  type: 'customer' | 'supplier';
  amount: number;
  lastUpdated: string;
  status: 'good' | 'warning' | 'urgent';
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'adjustment';
  amount: number;
  method: 'cash' | 'bank' | 'card';
  status: 'success' | 'pending' | 'failed';
  date: string;
  referenceId?: string;
}

export interface CallAppointment {
  id: string;
  customerName: string;
  phone: string;
  reason: string;
  scheduledAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}
