/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Settings2,
  Palette,
  Sparkles,
  Laptop,
  Smartphone,
  Eye,
  Check,
  Save,
  Copy,
  QrCode,
  ExternalLink,
  Plus,
  Minus,
  ShoppingCart,
  Phone,
  MapPin,
  Mail,
  Trash2,
  ChevronRight,
  Tv,
  ArrowRight,
  Info
} from 'lucide-react';
import { Product, Order, Customer, ShopConfig, OrderItem } from '../types';

interface WebsiteBuilderProps {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  config: ShopConfig;
  onAddOrder: (order: Order) => void;
  onAddCustomer: (customer: Customer) => void;
}

// Internal config structure for the sales website
interface WebConfig {
  title: string;
  subtitle: string;
  aboutText: string;
  themeColor: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate';
  bannerPreset: string;
  shopeeUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  allowOrderSimulation: boolean;
  featuredProductIds: string[];
}

const COLOR_MAP = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', ring: 'focus:ring-blue-500', border: 'border-blue-100', raw: '#2563eb' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', ring: 'focus:ring-emerald-500', border: 'border-emerald-100', raw: '#059669' },
  rose: { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-600', ring: 'focus:ring-rose-500', border: 'border-rose-100', raw: '#e11d48' },
  amber: { bg: 'bg-amber-600', hover: 'hover:bg-amber-700', text: 'text-amber-600', ring: 'focus:ring-amber-500', border: 'border-amber-100', raw: '#d97706' },
  violet: { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-600', ring: 'focus:ring-violet-500', border: 'border-violet-100', raw: '#7c3aed' },
  slate: { bg: 'bg-slate-800', hover: 'hover:bg-slate-900', text: 'text-slate-800', ring: 'focus:ring-slate-500', border: 'border-slate-200', raw: '#1e293b' }
};

const BANNER_PRESETS = [
  { id: 'minimal-light', name: 'Sáng tối giản', class: 'bg-slate-50 text-slate-800 border-b border-light' },
  { id: 'indigo-gradient', name: 'Gradient Lam Tím', class: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white' },
  { id: 'emerald-fresh', name: 'Xanh Lá Tươi Mới', class: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white' },
  { id: 'rose-coral', name: 'Hồng San Hô', class: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white animate-pulse-slow' }
];

export default function WebsiteBuilder({
  products,
  customers,
  orders,
  config,
  onAddOrder,
  onAddCustomer,
}: WebsiteBuilderProps) {
  // Load initial settings or default
  const [webConfig, setWebConfig] = useState<WebConfig>(() => {
    const cached = localStorage.getItem('lark_pos_web_config');
    if (cached) {
      try { return JSON.parse(cached); } catch(_) {}
    }
    return {
      title: `${config.name} - Online Store`,
      subtitle: 'Khám phá bộ sưu tập sản phẩm mới nhất với mức giá ưu đãi cực kì hấp dẫn.',
      aboutText: `Chào mừng bạn đến với cửa hàng trực tuyến của chúng tôi. Chúng tôi cam kết cung cấp các dòng sản phẩm chất lượng cao, bảo hành chính hãng và hỗ trợ ship COD tận nhà an toàn nhanh chóng nhất.`,
      themeColor: 'blue',
      bannerPreset: 'indigo-gradient',
      shopeeUrl: 'https://shopee.vn',
      tiktokUrl: 'https://tiktok.com',
      facebookUrl: 'https://facebook.com',
      allowOrderSimulation: true,
      featuredProductIds: products.slice(0, 3).map(p => p.id)
    };
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedLink, setCopiedLink] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('published');
  
  // Simulated Web State
  const [webCart, setWebCart] = useState<{ productId: string; variantId: string; quantity: number }[]>([]);
  const [selectedWebProduct, setSelectedWebProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Customer checkout fields in website preview
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPayment, setCheckoutPayment] = useState<'cash' | 'bank_transfer'>('cash');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderedSuccess, setIsOrderedSuccess] = useState(false);
  const [lastGeneratedOrderId, setLastGeneratedOrderId] = useState('');

  // Save Config to storage
  useEffect(() => {
    localStorage.setItem('lark_pos_web_config', JSON.stringify(webConfig));
  }, [webConfig]);

  // Categories extraction
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Selected Products for builder
  const handleProductToggle = (productId: string) => {
    setWebConfig(prev => {
      const exists = prev.featuredProductIds.includes(productId);
      const updated = exists
        ? prev.featuredProductIds.filter(id => id !== productId)
        : [...prev.featuredProductIds, productId];
      return { ...prev, featuredProductIds: updated };
    });
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(`https://${config.name.toLowerCase().replace(/\s+/g, '')}.larkshop.store`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Web Cart helper calculations
  const cartTotalQty = webCart.reduce((acc, c) => acc + c.quantity, 0);
  const cartTotalPrice = webCart.reduce((sum, c) => {
    const prod = products.find(p => p.id === c.productId);
    const variant = prod?.variants.find(v => v.id === c.variantId);
    return sum + (variant?.price || 0) * c.quantity;
  }, 0);

  const handleAddToCart = (productId: string, variantId: string, qty: number) => {
    if (!variantId) return;
    setWebCart(prev => {
      const existing = prev.find(i => i.productId === productId && i.variantId === variantId);
      if (existing) {
        return prev.map(i =>
          (i.productId === productId && i.variantId === variantId)
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { productId, variantId, quantity: qty }];
    });
  };

  const handleCartQtyChange = (productId: string, variantId: string, diff: number) => {
    setWebCart(prev => prev.map(i => {
      if (i.productId === productId && i.variantId === variantId) {
        const next = i.quantity + diff;
        return next > 0 ? { ...i, quantity: next } : null;
      }
      return i;
    }).filter(Boolean) as typeof webCart);
  };

  // Simulated Web Checkout -> Sinks into POS Order DB
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress || webCart.length === 0) return;

    // 1. Identify or Create Customer
    const phoneClean = checkoutPhone.trim();
    let clientCust = customers.find(c => c.phone === phoneClean);
    if (!clientCust) {
      clientCust = {
        id: `cust-web-${Date.now()}`,
        name: checkoutName,
        phone: phoneClean,
        type: 'regular',
        totalSpent: 0,
        orderCount: 0,
        createdAt: new Date().toISOString()
      };
      onAddCustomer(clientCust);
    }

    // 2. Wrap order items
    const orderItems: OrderItem[] = webCart.map(c => {
      const product = products.find(p => p.id === c.productId)!;
      const variant = product.variants.find(v => v.id === c.variantId)!;
      return {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        price: variant.price,
        quantity: c.quantity
      };
    });

    const totalAmount = cartTotalPrice;
    const discount = 0;
    const taxRate = config.taxRate;
    const tax = Math.round(totalAmount * taxRate);
    const finalAmount = totalAmount + tax;

    // Create New Order
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const webOrderId = `WEB-${randomSuffix}`;

    const newOrder: Order = {
      id: webOrderId,
      customer: clientCust,
      items: orderItems,
      totalAmount,
      discount,
      tax,
      finalAmount,
      paymentMethod: checkoutPayment === 'cash' ? 'cash' : 'bank_transfer',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: '🔥 Đơn trực tuyến từ Website bán hàng Online'
    };

    onAddOrder(newOrder);

    // Save success flags
    setLastGeneratedOrderId(webOrderId);
    setIsOrderedSuccess(true);
    setWebCart([]);
    setIsCheckoutOpen(false);
  };

  // Filtered products inside the simulator
  const simProducts = products.filter(p => {
    // Only featured products
    const isFeatured = webConfig.featuredProductIds.includes(p.id);
    if (!isFeatured) return false;
    
    // Status filter
    if (!p.isActive) return false;

    // Class filter
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;

    // Search query
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  const themeScheme = COLOR_MAP[webConfig.themeColor];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none animate-fade-in" id="web-builder-view">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe className="text-blue-600" size={24} />
            Website Bán Hàng Online
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Thiết kế, đồng bộ danh mục và tạo trang bán trực tuyến chuyên nghiệp cho cửa hàng của bạn chỉ với 1 click.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200/60 rounded-lg p-1 flex gap-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-md transition ${previewDevice === 'desktop' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Xem giao diện Máy tính"
            >
              <Laptop size={16} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-md transition ${previewDevice === 'mobile' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              title="Xem giao diện Điện thoại"
            >
              <Smartphone size={16} />
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition shadow-2xs`}
          >
            {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Đã sao chép' : 'Sao chép Link Web'}</span>
          </button>

          <button
            onClick={() => setPublishStatus(prev => prev === 'draft' ? 'published' : 'draft')}
            className={`flex items-center gap-1.5 px-3 py-2 ${publishStatus === 'published' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' : 'bg-slate-200 text-slate-700'} rounded-lg text-xs font-semibold transition`}
          >
            <Sparkles size={13} />
            <span>{publishStatus === 'published' ? 'Đang hoạt động' : 'Đang tạm dừng'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Customize Sidebar */}
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="p-4 border-b border-rose-50/50 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 size={16} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cấu hình Web Trực Tuyến</span>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full border border-blue-100 animate-pulse-slow">
              Auto Sync Realtime
            </span>
          </div>

          <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
            
            {/* Store Information */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Giao Diện Tiêu Đề</span>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Tên Store Website</label>
                <input
                  type="text"
                  value={webConfig.title}
                  onChange={(e) => setWebConfig(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Nhập tên Store phụ của bạn..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Lời chào / Khẩu hiệu (Hero Subtitle)</label>
                <textarea
                  value={webConfig.subtitle}
                  onChange={(e) => setWebConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Giới thiệu nhanh về bộ sưu tập của cửa hàng..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Về chúng tôi (About section footer)</label>
                <textarea
                  value={webConfig.aboutText}
                  onChange={(e) => setWebConfig(prev => ({ ...prev, aboutText: e.target.value }))}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  placeholder="Cung cấp cam kết về chất lượng và độ an toàn của sản phẩm..."
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Design & Color Themes */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={13} />
                Màu sắc & Banner Cover
              </span>

              {/* Theme Colors */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Tông màu chủ đạo</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(COLOR_MAP).map(([name, opt]) => (
                    <button
                      key={name}
                      onClick={() => setWebConfig(prev => ({ ...prev, themeColor: name as any }))}
                      className={`w-full h-8 rounded-lg flex items-center justify-center border transition ${
                        webConfig.themeColor === name
                          ? 'border-slate-800 ring-2 ring-offset-1 ring-slate-400'
                          : 'border-slate-200/50 hover:bg-slate-50'
                      }`}
                      style={{ backgroundColor: opt.raw }}
                      title={`Màu ${name}`}
                    >
                      {webConfig.themeColor === name && (
                        <Check size={14} className="text-white drop-shadow-sm font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Hình nền Banner Đầu Trang</label>
                <div className="grid grid-cols-2 gap-2">
                  {BANNER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setWebConfig(prev => ({ ...prev, bannerPreset: p.id }))}
                      className={`p-2.5 rounded-lg text-left text-xs font-semibold border transition overflow-hidden truncate ${
                        webConfig.bannerPreset === p.id
                          ? 'border-blue-600 bg-blue-50/20 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Products Selector to expose */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Sản phẩm xuất bản</span>
                <span className="text-[10px] text-slate-505 font-medium">Sản phẩm kích hoạt: {webConfig.featuredProductIds.length}</span>
              </div>
              <p className="text-[10px] text-slate-400">Chọn những sản phẩm sẽ hiển thị công khai trên website bán hàng của bạn.</p>

              <div className="border border-slate-150 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto bg-slate-50/50">
                {products.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Không tìm thấy sản phẩm trong danh mục</div>
                ) : (
                  products.map((p) => {
                    const isChecked = webConfig.featuredProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleProductToggle(p.id)}
                        className={`flex items-center gap-3 p-2.5 hover:bg-white cursor-pointer transition select-none ${
                          isChecked ? 'bg-blue-50/10' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Click is handled by wrapper div
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <img
                          src={p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100"}
                          alt={p.name}
                          className="w-8 h-8 rounded-md border border-slate-100 shrink-0 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-slate-700 truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-450 block truncate">
                            {p.category} · {p.variants.length} mã mẫu
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-800">
                            {p.variants[0]?.price.toLocaleString('vi-VN') || 0}đ
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Simulated Settings Integration */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Kênh liên kết mạng xã hội</span>
              
              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Cửa hàng Shopee URL</label>
                  <input
                    type="text"
                    value={webConfig.shopeeUrl}
                    onChange={(e) => setWebConfig(prev => ({ ...prev, shopeeUrl: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tài khoản Tiktok URL</label>
                  <input
                    type="text"
                    value={webConfig.tiktokUrl}
                    onChange={(e) => setWebConfig(prev => ({ ...prev, tiktokUrl: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Quick Informational Box */}
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-3 flex gap-2.5 mt-2">
              <Info className="text-indigo-500 shrink-0 mt-0.5" size={15} />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 block">Sự phối hợp hoàn hảo!</span>
                <p className="text-[10px] leading-relaxed text-indigo-900">
                  Mỗi khi một người dùng gửi thông tin đặt hàng trên trang web này, một đơn hàng với tag <b>WEB-xxxx</b> sẽ tự động tạo bên trong POS, trừ kho và tính điểm thưởng loyalty một cách thực sự!
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Device Simulator Display */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Màn hình mô phỏng thời gian thực</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sẵn sàng kết nối khách hàng</span>
            </div>
          </div>

          {/* Core Emulator */}
          <div className="flex justify-center w-full">
            <div
              className={`bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 w-full ${
                previewDevice === 'mobile' ? 'max-w-[360px] h-[720px]' : 'max-w-full h-[720px]'
              }`}
            >
              {/* Mock Browser/Device Header */}
              <div className="bg-slate-850 px-4 py-2 border-b border-slate-800 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                {/* Simulated URL bar */}
                <div className="flex-1 bg-slate-800 text-[10px] text-slate-300 px-3 py-1 rounded-md border border-slate-700/50 flex items-center justify-between font-mono">
                  <span className="truncate">https://{config.name.toLowerCase().replace(/\s+/g, '')}.larkshop.store</span>
                  <ExternalLink size={10} className="text-slate-450" />
                </div>
              </div>

              {/* Simulated Landing Web View Client Canvas */}
              <div className="bg-white text-slate-800 h-[calc(100%-2.5rem)] overflow-y-auto text-left relative flex flex-col scrollbar-thin">
                
                {/* 1. Header of the public website */}
                <header className="sticky top-0 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10 shrink-0">
                  <span className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${themeScheme.bg}`} />
                    {config.name}
                  </span>
                  
                  {/* Web Navigation Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsCheckoutOpen(true);
                        setIsOrderedSuccess(false);
                      }}
                      className="relative p-1.5 text-slate-600 hover:text-slate-900 transition"
                      title="Giỏ hàng trực tuyến"
                    >
                      <ShoppingCart size={18} />
                      {cartTotalQty > 0 && (
                        <span className={`absolute -top-1 -right-1.5 ${themeScheme.bg} text-white font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce`}>
                          {cartTotalQty}
                        </span>
                      )}
                    </button>
                  </div>
                </header>

                {/* 2. Core Body of Website (Only if Published) */}
                {publishStatus === 'draft' ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center space-y-3">
                    <Tv className="text-slate-300" size={50} />
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">Trang Web Tạm Khóa</h3>
                      <p className="text-xs text-slate-450 mt-1">Cửa hàng hiện đang bảo trì hệ thống. Vui lòng quay lại sau ít phút.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    
                    {/* Simulated Success Order Banner if placed a simulation order */}
                    {isOrderedSuccess && (
                      <div className="bg-emerald-50 border-b border-emerald-100 p-4 shrink-0 text-center space-y-1 animate-fade-in">
                        <span className="text-[11px] font-bold text-emerald-800 block">✨ Đặt hàng thành công hoàn tất! ✨</span>
                        <p className="text-[10px] text-emerald-700">
                          Mã hóa đơn trực tuyến <b>{lastGeneratedOrderId}</b> đã được tạo tự động trong màn hình quản trị Đơn hàng.
                        </p>
                        <button
                          onClick={() => setIsOrderedSuccess(false)}
                          className="text-[9px] text-emerald-600 font-extrabold underline block mx-auto mt-1"
                        >
                          Đóng thông báo
                        </button>
                      </div>
                    )}

                    {/* Banner Section */}
                    <div className={`p-6 text-center shrink-0 border-b border-slate-100 ${
                      BANNER_PRESETS.find(p => p.id === webConfig.bannerPreset)?.class || BANNER_PRESETS[1].class
                    }`}>
                      <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full inline-block backdrop-blur-xs mb-2">
                        CHÀO MỪNG QUÝ KHÁCH
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-tight">{webConfig.title}</h2>
                      <p className="text-[11px] mt-1 opacity-90 max-w-sm mx-auto leading-relaxed">{webConfig.subtitle}</p>
                    </div>

                    {/* Category Filter and Search Container inside website */}
                    <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2.5 shrink-0">
                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tìm sản phẩm trên website..."
                          className="w-full text-[10px] border border-slate-200/80 rounded-lg px-2.5 py-1 bg-white outline-none focus:border-slate-300"
                        />
                      </div>
                      
                      {/* Category pills */}
                      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none shrink-0">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition shrink-0 uppercase tracking-widest ${
                              activeCategory === cat
                                ? `${themeScheme.bg} text-white`
                                : 'bg-white text-slate-600 border border-slate-200/60'
                            }`}
                          >
                            {cat === 'all' ? 'Tất cả' : cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Website Products Section */}
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Sản phẩm nổi bật</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{simProducts.length} sản phẩm</span>
                      </div>

                      {simProducts.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                          <p className="text-xs">Không tìm thấy sản phẩm nổi bật nào.</p>
                          <p className="text-[10px] opacity-75">Hãy tick chọn tối thiểu một sản phẩm ở menu bên trái.</p>
                        </div>
                      ) : (
                        <div className={`grid gap-3 ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {simProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedWebProduct(p);
                                setSelectedVariantId(p.variants[0]?.id || '');
                                // Clear ordered status inside modal
                                setIsOrderedSuccess(false);
                              }}
                              className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                            >
                              <div className="relative aspect-square shrink-0">
                                <img
                                  src={p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200"}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                <span className={`absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded ${themeScheme.bg} text-white uppercase`}>
                                  HOT
                                </span>
                              </div>
                              <div className="p-2 flex-1 flex flex-col justify-between bg-slate-50/20">
                                <span className="block text-[11px] font-bold text-slate-800 line-clamp-2 min-h-[30px]">
                                  {p.name}
                                </span>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className={`text-[11px] font-black ${themeScheme.text}`}>
                                    {p.variants[0]?.price.toLocaleString('vi-VN')}đ
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    Kho: {p.variants[0]?.available || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* About details / Trust values on website website */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 shrink-0 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-800 block uppercase tracking-wide">Về Cửa Hàng Trực Tuyến</span>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-medium">{webConfig.aboutText}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2 border-t border-slate-200/60 pt-4">
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                          <Phone size={11} className="text-slate-400" />
                          <span>Mọi tư vấn: {config.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                          <Mail size={11} className="text-slate-400" />
                          <span>Email: {config.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="truncate">Địa chỉ: {config.address}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. Product Details Modal/Drawer INSIDE Simulation preview device */}
                {selectedWebProduct && (
                  <div className="absolute inset-0 bg-black/60 z-20 flex items-end animate-fade-in h-full">
                    <div className="bg-white rounded-t-2xl w-full max-h-[85%] overflow-y-auto p-4 space-y-4 animate-fade-in-right">
                      {/* Close */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
                        <span className="text-xs font-bold text-slate-800 max-w-[80%] truncate">Chi tiết sản phẩm</span>
                        <button
                          onClick={() => setSelectedWebProduct(null)}
                          className="text-xs font-bold text-slate-450 hover:text-slate-800"
                        >
                          Đóng
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <img
                          src={selectedWebProduct.image}
                          alt={selectedWebProduct.name}
                          className="w-20 h-20 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-800 leading-snug">{selectedWebProduct.name}</h4>
                          <p className="text-[10px] text-slate-450 mt-1 uppercase tracking-wider">{selectedWebProduct.category}</p>
                          <p className="text-xs font-extrabold mt-1 text-slate-900">
                            {selectedWebProduct.variants.find(v => v.id === selectedVariantId)?.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>

                      {/* Select variants structure */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500">Mẫu mã sản phẩm (Màu sắc / Kích thước/ Dung tích):</label>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedWebProduct.variants.map((v) => {
                            const isSel = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVariantId(v.id)}
                                className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                                  isSel
                                    ? `border-slate-800 bg-slate-900 text-white`
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {v.name.replace(`${selectedWebProduct.name} - `, '')} ({v.available} khả dụng)
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-700 block">Thông tin mô tả:</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{selectedWebProduct.description || 'Sản phẩm mới chính hãng.'}</p>
                      </div>

                      {/* Add directly controls */}
                      <button
                        onClick={() => {
                          handleAddToCart(selectedWebProduct.id, selectedVariantId, 1);
                          setSelectedWebProduct(null);
                        }}
                        disabled={!selectedVariantId}
                        className={`w-full text-center py-2.5 rounded-xl text-xs font-extrabold text-white transition ${
                          selectedVariantId ? `${themeScheme.bg} ${themeScheme.hover}` : 'bg-slate-300 cursor-not-allowed'
                        }`}
                      >
                        Thêm vào giỏ ({selectedWebProduct.variants.find(v => v.id === selectedVariantId)?.price.toLocaleString('vi-VN')}đ)
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Checkout Simulation Drawer INSIDE browser simulator */}
                {isCheckoutOpen && (
                  <div className="absolute inset-0 bg-black/50 z-20 flex items-end h-full">
                    <div className="bg-white rounded-t-2xl w-full max-h-[90%] overflow-y-auto p-4 space-y-4 flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Giỏ hàng & Đặt hàng</span>
                          <button
                            onClick={() => setIsCheckoutOpen(false)}
                            className="text-xs font-bold text-slate-450 hover:text-slate-800"
                          >
                            Đóng
                          </button>
                        </div>

                        {/* Cart items list */}
                        {webCart.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">Giỏ hàng của bạn đang trống.</div>
                        ) : (
                          <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
                            {webCart.map((item) => {
                              const p = products.find(prod => prod.id === item.productId)!;
                              const v = p.variants.find(vari => vari.id === item.variantId)!;
                              return (
                                <div key={v.id} className="py-2 flex items-center justify-between gap-1">
                                  <div className="flex-1 min-w-0">
                                    <span className="block text-[11px] font-bold text-slate-700 truncate">{p.name}</span>
                                    <span className="text-[10px] text-slate-450 block truncate">Phân loại: {v.name.replace(`${p.name} - `, '')}</span>
                                    <span className="text-[9px] font-bold text-blue-600 block">{v.price.toLocaleString('vi-VN')}đ/cái</span>
                                  </div>
                                  
                                  {/* Qty edit */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleCartQtyChange(p.id, v.id, -1)}
                                      className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                    <button
                                      onClick={() => handleCartQtyChange(p.id, v.id, 1)}
                                      className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Summary */}
                        {webCart.length > 0 && (
                          <div className="border-t border-slate-100 pt-2.5 pb-2.5 space-y-1 font-semibold text-[11px] text-slate-600">
                            <div className="flex justify-between">
                              <span>Số tiền tạm tính:</span>
                              <span className="text-slate-800">{cartTotalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span>Thuế VAT ({config.taxRate * 100}%):</span>
                              <span className="text-slate-800">{Math.round(cartTotalPrice * config.taxRate).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold border-t border-slate-50 pt-1.5 text-slate-900">
                              <span>Tổng cộng thanh toán:</span>
                              <span className={themeScheme.text}>{(cartTotalPrice + Math.round(cartTotalPrice * config.taxRate)).toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                        )}

                        {/* Checkout Form */}
                        {webCart.length > 0 && (
                          <form onSubmit={handlePlaceOrder} className="space-y-2.5 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-black text-slate-450 uppercase block tracking-wider">Thông tin người nhận</span>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Họ tên khách</label>
                                <input
                                  type="text"
                                  required
                                  value={checkoutName}
                                  onChange={(e) => setCheckoutName(e.target.value)}
                                  placeholder="Nguyễn Văn A"
                                  className="w-full text-[10px] border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-slate-300"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Số điện thoại</label>
                                <input
                                  type="text"
                                  required
                                  value={checkoutPhone}
                                  onChange={(e) => setCheckoutPhone(e.target.value)}
                                  placeholder="0987654321"
                                  className="w-full text-[10px] border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-slate-300"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Địa chỉ giao hàng</label>
                              <input
                                type="text"
                                required
                                value={checkoutAddress}
                                onChange={(e) => setCheckoutAddress(e.target.value)}
                                placeholder="Số nhà, Tên đường, Quận, Thành phố..."
                                className="w-full text-[10px] border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-slate-300"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500">Hình thức thanh toán</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCheckoutPayment('cash')}
                                  className={`flex-1 text-[10px] p-2 border rounded-lg text-center font-bold transition ${
                                    checkoutPayment === 'cash' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 text-slate-700'
                                  }`}
                                >
                                  COD (Tiền mặt)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCheckoutPayment('bank_transfer')}
                                  className={`flex-1 text-[10px] p-2 border rounded-lg text-center font-bold transition ${
                                    checkoutPayment === 'bank_transfer' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 text-slate-700'
                                  }`}
                                >
                                  Chuyển khoản QR
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className={`w-full py-2 rounded-xl text-xs font-extrabold text-white transition ${themeScheme.bg} ${themeScheme.hover} mt-1`}
                            >
                              Xác Nhận Đặt Hàng Trực Tuyến
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
