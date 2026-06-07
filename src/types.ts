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
  tax: number; // Thuế (VAT)
  finalAmount: number; // Tổng thanh toán
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'e_wallet'; // Phương thức thanh toán
  status: 'pending' | 'processing' | 'completed' | 'canceled'; // Trạng thái đơn hàng
  createdAt: string;
  notes?: string;
}

export interface ShopConfig {
  name: string;
  phone: string;
  address: string;
  email: string;
  currency: string;
  taxRate: number; // vd: 0.1 cho 10%
}
