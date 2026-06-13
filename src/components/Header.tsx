/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, User, HelpCircle, Building2, LogIn, LogOut, Cloud, CloudOff, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { ShopConfig, Product, Variant, Order } from '../types';

interface HeaderProps {
  config: ShopConfig;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  products: Product[];
  orders: Order[];
  setCurrentTab: (tab: string) => void;
}

export default function Header({
  config,
  globalSearch,
  setGlobalSearch,
  onSearchSubmit,
  user,
  onLogin,
  onLogout,
  products,
  orders,
  setCurrentTab
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [forecastQuantities, setForecastQuantities] = useState<Record<string, { reorderAmount: number; sales30d: number }>>({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockVariants = React.useMemo(() => {
    const list: { product: Product; variant: Variant }[] = [];
    const threshold = config.lowStockThreshold ?? 5;
    (products || []).forEach((p) => {
      (p.variants || []).forEach((v) => {
        if (v.available <= threshold) {
          list.push({ product: p, variant: v });
        }
      });
    });
    return list;
  }, [products, config.lowStockThreshold]);

  const calculateReorderAmount = (productId: string, variantId: string, currentAvailable: number) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let soldQty = 0;
    (orders || []).forEach((o) => {
      if (o.status === 'canceled') return;
      const orderDate = new Date(o.createdAt);
      if (orderDate >= thirtyDaysAgo) {
        o.items.forEach((item) => {
          if (item.variantId === variantId) {
            soldQty += item.quantity;
          }
        });
      }
    });

    const reorderAmount = Math.max(10, Math.ceil(soldQty * 1.5) - currentAvailable);
    setForecastQuantities(prev => ({
      ...prev,
      [variantId]: { reorderAmount, sales30d: soldQty }
    }));
  };

  const suggestions = React.useMemo(() => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase();
    const results: { product: Product; variant: Variant }[] = [];
    
    for (const p of products || []) {
      for (const v of p.variants || []) {
        if (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          v.sku.toLowerCase().includes(query) ||
          v.name.toLowerCase().includes(query)
        ) {
          results.push({ product: p, variant: v });
          if (results.length >= 5) break;
        }
      }
      if (results.length >= 5) break;
    }
    return results;
  }, [globalSearch, products]);

  return (
    <header className="glass-panel border-b border-white/20 px-6 py-3 flex items-center justify-between sticky top-0 z-40 select-none h-16 shadow-lg shadow-black/2 backdrop-blur-xl">
      {/* Left Search Section */}
      <form
        onSubmit={onSearchSubmit || ((e) => e.preventDefault())}
        className="flex items-center gap-2 max-w-xl w-full"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm mã / tên sản phẩm / barcode / keyword..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-sm border border-white/40 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/80 text-slate-700 transition-all placeholder:text-slate-400 font-semibold"
            id="global-header-search"
            autoComplete="off"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />

          {/* Search Suggestion Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200/80 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50 text-xs divide-y divide-slate-100 font-sans">
              <div className="bg-slate-50/80 px-3 py-1.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider flex justify-between">
                <span>Gợi ý Pancake POS ({suggestions.length})</span>
                <span className="text-blue-600">Click để thêm vào Giỏ</span>
              </div>
              {suggestions.map(({ product, variant }) => (
                <div
                  key={variant.id}
                  onClick={() => {
                    setCurrentTab('sales');
                    setTimeout(() => {
                      const event = new CustomEvent('add-to-cart', {
                        detail: { product, variant }
                      });
                      window.dispatchEvent(event);
                    }, 80);
                    setGlobalSearch('');
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50/80 cursor-pointer transition duration-150 gap-3 text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-150 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-800 truncate leading-snug group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                        <span className="bg-slate-100 text-slate-600 px-1 rounded font-semibold">{variant.sku || product.sku}</span>
                        <span>•</span>
                        <span>{variant.name.split(' - ')[1] || 'Mặc định'}</span>
                        <span>•</span>
                        <span className={variant.available > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>
                          Còn: {variant.available}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-slate-900 font-mono">
                      {variant.price.toLocaleString('vi-VN')} {config.currency}
                    </span>
                    <button className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 transition duration-150 group-hover:bg-blue-600 group-hover:text-white shrink-0">
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warehouse Filter */}
        <div className="relative">
          <select
            id="warehouse-select"
            className="bg-white/40 backdrop-blur-sm border border-white/40 text-slate-700 rounded-lg pl-8 pr-6 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 cursor-pointer font-bold focus:bg-white/80 transition-all auto-hidden"
          >
            <option value="all">Tất cả các kho</option>
            <option value="main">Kho tổng Hà Nội</option>
            <option value="sub">Kho chi nhánh HCM</option>
          </select>
          <Building2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 border-l border-t border-slate-500 w-1.5 h-1.5 rotate-135 pointer-events-none" />
        </div>
      </form>

      {/* Right Notifications and Stats */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/50 text-indigo-700 border border-indigo-100/40 text-xs font-mono font-semibold">
          <Clock size={14} className="animate-spin-slow" />
          <span>{time}</span>
        </div>

        {/* Support Help */}
        <button
          className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition"
          title="Trợ giúp"
        >
          <HelpCircle size={18} />
        </button>

        {/* Sync Status / Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-450 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition relative"
            title="Đơn hàng / Sản phẩm sắp hết hàng"
          >
            <Bell size={18} />
            {lowStockVariants.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white scale-90">
                {lowStockVariants.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/80 rounded-xl shadow-2xl z-50 text-xs divide-y divide-slate-100 font-sans animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="bg-slate-50/80 px-4 py-3 font-bold text-slate-700 text-xs flex justify-between items-center rounded-t-xl rounded-b-none">
                <span className="flex items-center gap-1.5 shrink-0">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>Sản phẩm sắp hết ({lowStockVariants.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Ngưỡng: ≤{config.lowStockThreshold ?? 5}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {lowStockVariants.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-400 font-semibold text-xs">
                    🎉 Tất cả các mặt hàng hiện đều có lượng tồn kho an toàn!
                  </div>
                ) : (
                  lowStockVariants.map(({ product, variant }) => {
                    const forecast = forecastQuantities[variant.id];
                    return (
                      <div key={variant.id} className="p-3 hover:bg-slate-50/50 transition duration-150 text-left">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80'}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-150 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-800 truncate leading-snug">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <span className="bg-red-50 text-red-600 px-1 rounded font-bold">{variant.sku}</span>
                              <span>•</span>
                              <span>{variant.name.split(' - ')[1] || 'Bản chuẩn'}</span>
                            </div>
                            <div className="text-[10.5px] font-bold mt-1 text-slate-600 flex items-center justify-between">
                              <span>Số lượng khả dụng:</span>
                              <span className={variant.available === 0 ? 'text-rose-500 font-black' : 'text-amber-600 font-black'}>
                                {variant.available} / {variant.stock}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Forecast calculations */}
                        {forecast ? (
                          <div className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-lg text-[11px] font-semibold text-slate-700">
                            <div className="text-emerald-700 font-extrabold flex items-center gap-1">
                              <span>📈 Gợi ý nhập: <b>+{forecast.reorderAmount}</b> sản phẩm</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-normal font-medium">
                              Lượng bán 30 ngày qua: <b>{forecast.sales30d}</b> cái. 
                              <br />
                              (Hệ số an toàn 1.5 trừ tồn kho sẵn có)
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                calculateReorderAmount(product.id, variant.id, variant.available);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center gap-1 rounded font-extrabold text-[10px] uppercase tracking-wider transition duration-150 active:scale-95 border border-blue-100 cursor-pointer"
                            >
                              💡 Gợi ý nhập hàng
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-2 text-center bg-slate-50/50 rounded-b-xl border-t border-slate-100">
                <button
                  onClick={() => {
                    setCurrentTab('products');
                    setShowNotifications(false);
                  }}
                  className="text-blue-600 font-black hover:underline tracking-tight text-[10px] cursor-pointer"
                >
                  Xem chi tiết kho hàng &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Firebase Cloud Sync Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {user ? (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 animate-pulse-slow">
              <Cloud size={13} />
              <span>Cloud đồng bộ</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-450 font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <CloudOff size={13} />
              <span>Chế độ cục bộ</span>
            </div>
          )}
        </div>

        {/* Active Shop Profile or Firebase Google Access Link */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User photo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold text-blue-600">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 leading-none truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-slate-400 leading-none mt-1">
                  Chủ cửa hàng
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition shrink-0"
                title="Đăng xuất khỏi Firebase"
                id="btn-firebase-logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs border border-blue-700 cursor-pointer"
              title="Đăng nhập Google đồng bộ dữ liệu đám mây"
              id="btn-firebase-login"
            >
              <LogIn size={13} />
              <span>Kết nối Cloud</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
