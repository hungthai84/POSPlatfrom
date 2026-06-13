/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Customer, Order, ShopConfig } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    sku: '000002',
    name: 'Áo Thun Lark Unisex Premium',
    category: 'Thời trang',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    isActive: true,
    description: 'Áo thun cotton 100% co giãn 4 chiều, thoáng mát, giữ form tốt.',
    totalImport: 50,
    totalAvailable: 37,
    totalShipping: 13,
    variants: [
      {
        id: 'v-1-1',
        sku: '000002-W-M',
        name: 'Áo Thun Lark - Trắng / M',
        productId: 'p-1',
        price: 250000,
        importPrice: 120000,
        stock: 25,
        available: 17,
        shipping: 8,
        options: { Mau: 'Trắng', Size: 'M' }
      },
      {
        id: 'v-1-2',
        sku: '000002-B-L',
        name: 'Áo Thun Lark - Đen / L',
        productId: 'p-1',
        price: 250000,
        importPrice: 120000,
        stock: 25,
        available: 20,
        shipping: 5,
        options: { Mau: 'Đen', Size: 'L' }
      }
    ]
  },
  {
    id: 'p-2',
    sku: '000001',
    name: 'Quần Jean Slimfit Lark',
    category: 'Thời trang',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    description: 'Chất liệu bò thô cao cấp, tôn dáng, bền màu lâu phai.',
    totalImport: 0,
    totalAvailable: 0,
    totalShipping: 0,
    variants: [
      {
        id: 'v-2-1',
        sku: '000001-30',
        name: 'Quần Jean Slimfit - Xanh đậm / 30',
        productId: 'p-2',
        price: 450000,
        importPrice: 210000,
        stock: 0,
        available: 0,
        shipping: 0,
        options: { Mau: 'Xanh đậm', Size: '30' }
      }
    ]
  },
  {
    id: 'p-3',
    sku: '000003',
    name: 'Bình Giữ Nhiệt Lark Inox 304',
    category: 'Gia dụng',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    description: 'Bình giữ nhiệt 500ml cao cấp, giữ nhiệt nóng lạnh đến 24 giờ.',
    totalImport: 100,
    totalAvailable: 85,
    totalShipping: 15,
    variants: [
      {
        id: 'v-3-1',
        sku: '000003-SL',
        name: 'Bình Giữ Nhiệt Lark - Bạc',
        productId: 'p-3',
        price: 180000,
        importPrice: 80000,
        stock: 50,
        available: 42,
        shipping: 8,
        options: { Mau: 'Bạc' }
      },
      {
        id: 'v-3-2',
        sku: '000003-BK',
        name: 'Bình Giữ Nhiệt Lark - Đen nhám',
        productId: 'p-3',
        price: 180000,
        importPrice: 80000,
        stock: 50,
        available: 43,
        shipping: 7,
        options: { Mau: 'Đen nhám' }
      }
    ]
  },
  {
    id: 'p-4',
    sku: '000004',
    name: 'Balo Du Lịch Lark Smart Voyager',
    category: 'Phụ kiện',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    description: 'Balo chống nước, tích hợp cổng sạc USB và ngăn chứa laptop 15.6 inch.',
    totalImport: 30,
    totalAvailable: 25,
    totalShipping: 5,
    variants: [
      {
        id: 'v-4-1',
        sku: '000004-GR',
        name: 'Balo Smart Voyager - Xám Ghi',
        productId: 'p-4',
        price: 650000,
        importPrice: 320000,
        stock: 30,
        available: 25,
        shipping: 5,
        options: { Mau: 'Xám Ghi' }
      }
    ]
  },
  {
    id: 'p-5',
    sku: '000005',
    name: 'Tai Nghe Không Dây Lark Pro Buds',
    category: 'Điện tử',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=200',
    isActive: true,
    description: 'Tai nghe Bluetooth 5.3, chống ồn chủ động ANC, pin lên đến 30h.',
    totalImport: 40,
    totalAvailable: 35,
    totalShipping: 5,
    variants: [
      {
        id: 'v-5-1',
        sku: '000005-WH',
        name: 'Lark Pro Buds - Trắng Tuyết',
        productId: 'p-5',
        price: 990000,
        importPrice: 450000,
        stock: 20,
        available: 18,
        shipping: 2,
        options: { Mau: 'Trắng' }
      },
      {
        id: 'v-5-2',
        sku: '000005-BL',
        name: 'Lark Pro Buds - Đen Huyền Bí',
        productId: 'p-5',
        price: 990000,
        importPrice: 450000,
        stock: 20,
        available: 17,
        shipping: 3,
        options: { Mau: 'Đen' }
      }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Nguyễn Văn Hùng',
    phone: '0987654321',
    email: 'hung.nguyen@lark.vn',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    type: 'vip',
    totalSpent: 12500000,
    orderCount: 15,
    createdAt: '2026-01-15T08:30:00Z'
  },
  {
    id: 'c-2',
    name: 'Trần Thị Mai',
    phone: '0912345678',
    email: 'mai.tran@gmail.com',
    address: '456 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    type: 'regular',
    totalSpent: 1850000,
    orderCount: 3,
    createdAt: '2026-03-22T10:15:00Z'
  },
  {
    id: 'c-3',
    name: 'Công ty TNHH Giải pháp số Lark',
    phone: '0243999888',
    email: 'info@larksports.vn',
    address: '789 Tố Hữu, Nam Từ Liêm, Hà Nội',
    type: 'wholesale',
    totalSpent: 45200000,
    orderCount: 8,
    createdAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 'c-4',
    name: 'Lê Văn Nam',
    phone: '0888999777',
    email: 'nam.le@hotmail.com',
    address: '12 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng',
    type: 'regular',
    totalSpent: 650000,
    orderCount: 1,
    createdAt: '2026-05-18T14:45:00Z'
  },
  {
    id: 'c-5',
    name: 'Phạm Thanh Thủy',
    phone: '0977665544',
    email: 'thuy.pham@outlook.com',
    address: '88 Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
    type: 'vip',
    totalSpent: 8900000,
    orderCount: 7,
    createdAt: '2026-04-05T11:20:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'DH-10001',
    customer: INITIAL_CUSTOMERS[0],
    items: [
      {
        productId: 'p-1',
        variantId: 'v-1-1',
        productName: 'Áo Thun Lark Unisex Premium',
        variantName: 'Áo Thun Lark - Trắng / M',
        sku: '000002-W-M',
        price: 250000,
        quantity: 2
      },
      {
        productId: 'p-3',
        variantId: 'v-3-1',
        productName: 'Bình Giữ Nhiệt Lark Inox 304',
        variantName: 'Bình Giữ Nhiệt Lark - Bạc',
        sku: '000003-SL',
        price: 180000,
        quantity: 1
      }
    ],
    totalAmount: 680000,
    discount: 50000,
    tax: 63000,
    finalAmount: 693000,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: '2026-06-05T09:30:11Z',
    notes: 'Khách hàng VIP, tặng kèm móc khóa'
  },
  {
    id: 'DH-10002',
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        productId: 'p-5',
        variantId: 'v-5-2',
        productName: 'Tai Nghe Không Dây Lark Pro Buds',
        variantName: 'Lark Pro Buds - Đen Huyền Bí',
        sku: '000005-BL',
        price: 990000,
        quantity: 1
      }
    ],
    totalAmount: 990000,
    discount: 0,
    tax: 99000,
    finalAmount: 1089000,
    paymentMethod: 'card',
    status: 'processing',
    createdAt: '2026-06-06T15:20:45Z',
    notes: 'Giao hàng giờ hành chính'
  },
  {
    id: 'DH-10003',
    customer: INITIAL_CUSTOMERS[2],
    items: [
      {
        productId: 'p-1',
        variantId: 'v-1-2',
        productName: 'Áo Thun Lark Unisex Premium',
        variantName: 'Áo Thun Lark - Đen / L',
        sku: '000002-B-L',
        price: 250000,
        quantity: 10
      },
      {
        productId: 'p-4',
        variantId: 'v-4-1',
        productName: 'Balo Du Lịch Lark Smart Voyager',
        variantName: 'Balo Smart Voyager - Xám Ghi',
        sku: '000004-GR',
        price: 650000,
        quantity: 5
      }
    ],
    totalAmount: 5750000,
    discount: 575000,
    tax: 517500,
    finalAmount: 5692500,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: '2026-06-06T11:05:00Z',
    notes: 'Đơn sỉ chiết khấu 10%'
  },
  {
    id: 'DH-10004',
    items: [
      {
        productId: 'p-3',
        variantId: 'v-3-2',
        productName: 'Bình Giữ Nhiệt Lark Inox 304',
        variantName: 'Bình Giữ Nhiệt Lark - Đen nhám',
        sku: '000003-BK',
        price: 180000,
        quantity: 3
      }
    ],
    totalAmount: 540000,
    discount: 20000,
    tax: 52000,
    finalAmount: 572000,
    paymentMethod: 'cash',
    status: 'pending',
    createdAt: '2026-06-07T00:15:30Z',
    notes: 'Khách lẻ tự thương lượng tại cửa hàng'
  }
];

export const INITIAL_RETURNS: any[] = [
  {
    id: 'RET-1002',
    orderId: 'DH-10002',
    customer: INITIAL_CUSTOMERS[1],
    items: [
      {
        productId: 'p-1',
        variantId: 'v-1-1',
        productName: 'Giày Bóng Rổ Nam Chính Hãng',
        variantName: 'Giày Bóng Rổ Lark - Trắng / 42',
        sku: '000001-W-42',
        price: 1200000,
        quantity: 1
      }
    ],
    refundAmount: 1200000,
    reason: 'Sản phẩm giao lỗi size',
    status: 'pending',
    createdAt: '2026-06-12T09:30:00Z',
    notes: 'Khách hàng gửi hình ảnh qua Zalo'
  }
];

export const INITIAL_ADS: any[] = [
  {
    id: 'AD-FB-1',
    name: 'Chiến dịch Mùa Hè - FB',
    platform: 'facebook',
    status: 'active',
    budget: 5000000,
    spent: 1200000,
    impressions: 45000,
    clicks: 1200,
    conversions: 24,
    startDate: '2026-06-01T00:00:00Z',
  },
  {
    id: 'AD-GG-1',
    name: 'Tìm kiếm Giày Thể Thao - GG',
    platform: 'google',
    status: 'active',
    budget: 8000000,
    spent: 2500000,
    impressions: 15000,
    clicks: 850,
    conversions: 45,
    startDate: '2026-06-05T00:00:00Z',
  },
  {
    id: 'AD-TK-1',
    name: 'Video Viral Mới - TikTok',
    platform: 'tiktok',
    status: 'paused',
    budget: 3000000,
    spent: 3000000,
    impressions: 120000,
    clicks: 3500,
    conversions: 15,
    startDate: '2026-05-20T00:00:00Z',
    endDate: '2026-06-05T00:00:00Z',
  }
];

export const INITIAL_COMBOS: any[] = [
  {
    id: 'cb-1',
    name: 'Combo Mùa Hè Năng Động',
    sku: 'CB-SUMMER-01',
    price: 1500000,
    originalPrice: 1730000,
    isActive: true,
    description: 'Bao gồm 1 Áo thun, 1 Quần jean và 1 Balo du lịch.',
    items: [
      { productId: 'p-1', variantId: 'v-1-1', quantity: 1 },
      { productId: 'p-2', variantId: 'v-2-1', quantity: 1 },
      { productId: 'p-4', variantId: 'v-4-1', quantity: 1 }
    ]
  }
];

export const INITIAL_SUPPLIERS: any[] = [
  {
    id: 'sup-1',
    name: 'Xưởng May Hà Nội',
    code: 'NCC-HN-001',
    phone: '0243123456',
    email: 'contact@xuongmayhanoi.vn',
    address: 'KCN Sài Đồng, Long Biên, Hà Nội',
    taxCode: '0101234567',
    category: 'May mặc',
    debt: 15000000,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    notes: 'Nhà cung cấp áo thun chủ lực'
  },
  {
    id: 'sup-2',
    name: 'Tổng kho Gia dụng Minh Phát',
    code: 'NCC-MP-002',
    phone: '0283987654',
    email: 'sales@giadungminhphat.com',
    address: '456 Kinh Dương Vương, Quận 6, TP.HCM',
    taxCode: '0309876543',
    category: 'Gia dụng',
    debt: 0,
    isActive: true,
    createdAt: '2026-02-15T10:00:00Z'
  }
];

export const INITIAL_LIVESTREAMS: any[] = [
  {
    id: 'live-1',
    title: 'Xả hàng Hè 2026 - Giảm 50%',
    platform: 'facebook',
    status: 'live',
    viewers: 1250,
    startTime: new Date().toISOString(),
    totalOrders: 45,
    revenue: 12500000,
    keywords: ['HN01', 'HN02', 'VAY01'],
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Nguyễn Văn A', content: 'Chốt HN01 size L ạ', timestamp: new Date().toISOString(), isOrder: true, status: 'pending' },
      { id: 'c2', userId: 'u2', userName: 'Trần Thị B', content: 'Có size cho 60kg không shop?', timestamp: new Date().toISOString(), isOrder: false },
      { id: 'c3', userId: 'u3', userName: 'Minh Khôi', content: 'VAY01 màu xanh nha', timestamp: new Date().toISOString(), isOrder: true, status: 'converted' }
    ]
  },
  {
    id: 'live-2',
    title: 'Tiktok Shop Flash Sale',
    platform: 'tiktok',
    status: 'ended',
    viewers: 8500,
    startTime: '2026-06-12T20:00:00Z',
    endTime: '2026-06-12T22:30:00Z',
    totalOrders: 210,
    revenue: 58000000,
    keywords: ['SKINCARE', 'COMBO01'],
    comments: []
  }
];

export const INITIAL_INVOICES: any[] = [
  { id: 'INV-001', orderId: 'ORD-1001', customerName: 'Nguyễn Văn An', amount: 450000, status: 'unpaid', dueDate: '2026-06-20T17:00:00Z', createdAt: '2026-06-13T10:00:00Z' },
  { id: 'INV-002', orderId: 'ORD-1002', customerName: 'Trần Thị Bích', amount: 1200000, status: 'paid', dueDate: '2026-06-15T17:00:00Z', createdAt: '2026-06-12T09:00:00Z' }
];

export const INITIAL_CASHFLOW: any[] = [
  { id: 'CF-001', type: 'income', category: 'Bán hàng', amount: 5000000, note: 'Doanh thu trong ngày', date: '2026-06-13T08:00:00Z' },
  { id: 'CF-002', type: 'expense', category: 'Nhập hàng', amount: 2000000, note: 'Nhập thêm 100 áo thun', date: '2026-06-13T09:30:00Z' }
];

export const INITIAL_DEBTS: any[] = [
  { id: 'DB-001', targetId: 'cust-1', targetName: 'Nguyễn Văn An', type: 'customer', amount: 450000, lastUpdated: '2026-06-13T10:00:00Z', status: 'warning' },
  { id: 'DB-002', targetId: 'sup-1', targetName: 'Xưởng May Hà Nội', type: 'supplier', amount: 15000000, lastUpdated: '2026-06-10T08:00:00Z', status: 'urgent' }
];

export const INITIAL_TRANSACTIONS: any[] = [
  { id: 'TX-001', type: 'payment', amount: 1200000, method: 'bank', status: 'success', date: '2026-06-12T15:00:00Z', referenceId: 'INV-002' },
  { id: 'TX-002', type: 'refund', amount: 200000, method: 'cash', status: 'success', date: '2026-06-11T10:00:00Z' }
];

export const INITIAL_CALLS: any[] = [
  { id: 'CAL-001', customerName: 'Lê Minh Tâm', phone: '0912123456', reason: 'Tư vấn combo Hè', scheduledAt: '2026-06-14T09:00:00Z', status: 'pending', notes: 'Khách quan tâm đồ gia dụng' },
  { id: 'CAL-002', customerName: 'Hoàng Oanh', phone: '0988777666', reason: 'Chăm sóc sau mua', scheduledAt: '2026-06-13T14:30:00Z', status: 'completed' }
];

export const DEFAULT_CONFIG: ShopConfig = {
  name: 'Lark Shop',
  phone: '0987 654 321',
  address: 'Tòa nhà Lark, 15 Tố Hữu, Nam Từ Liêm, Hà Nội',
  email: 'lienhe@larkshop.vn',
  currency: 'đ',
  taxRate: 0.10, // 10% VAT
  lowStockThreshold: 5
};

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage key', key, e);
  }
}
