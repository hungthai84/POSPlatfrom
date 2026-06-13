/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  Box,
  RotateCcw,
  Store,
  ChevronDown,
  Clock,
  RefreshCw,
  Settings,
  HelpCircle,
  ShoppingBag,
  Zap,
  Package,
  Users,
  Search,
  Users2,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Product, Order, Customer, ShopConfig } from '../types';

interface OverviewProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  config: ShopConfig;
  setCurrentTab: (tab: string) => void;
}

export default function Overview({
  products,
  orders,
  customers,
  config,
  setCurrentTab
}: OverviewProps) {
  
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  // Mock chart data for "7 days ago" comparison look
  const mainChartData = useMemo(() => {
    return [
      { day: '31', current: 0, previous: 0 },
      { day: '01', current: 0, previous: 0 },
      { day: '02', current: 0, previous: 0 },
      { day: '03', current: 0, previous: 0 },
      { day: '04', current: 0, previous: 0 },
      { day: '05', current: 0, previous: 0 },
      { day: '06', current: 0, previous: 0 },
      { day: '07', current: 0, previous: 0 },
    ];
  }, []);

  const todayChartData = useMemo(() => {
    return [
      { time: '0h', val: 0 },
      { time: '4h', val: 0 },
      { time: '8h', val: 0 },
      { time: '12h', val: 0 },
      { time: '16h', val: 0 },
      { time: '20h', val: 0 },
      { time: '22h', val: 0 },
    ];
  }, []);

  const lowInventoryItems = useMemo(() => {
    const items: { productId: string; variantId: string; productName: string; variantName: string; sku: string; available: number; price: number; image: string }[] = [];
    products.forEach(p => {
      p.variants.forEach(v => {
        if (v.available < 5) {
          items.push({
            productId: p.id,
            variantId: v.id,
            productName: p.name,
            variantName: v.name,
            sku: v.sku,
            available: v.available,
            price: v.price,
            image: p.image
          });
        }
      });
    });
    return items.sort((a,b) => a.available - b.available);
  }, [products]);

  return (
    <div className="space-y-4 bg-transparent min-h-screen pb-10 select-none font-sans" id="overview-dashboard">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden h-[80px] w-full rounded-none" id="pancake-banner">
         <div className="absolute inset-0 glass-panel border-y border-white/20 flex items-center px-8 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center p-1 shadow-lg shadow-blue-500/30">
                <div className="w-full h-full bg-white/20 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight">Pancake</span>
                </div>
                <p className="text-[14px] font-bold text-slate-600">
                  <span className="text-blue-600 font-extrabold">MỚI NHẤT:</span> TÍCH HỢP PLUGIN TIKTOK GMX MAX TRÊN POS
                </p>
                <p className="text-[12px] text-slate-500 font-medium">Quản lý đơn hàng và vận hành TikTok Shop hiệu quả</p>
              </div>
            </div>
            
            <div className="ml-auto hidden lg:flex items-center gap-10">
               <div className="flex gap-1 h-0.5 w-12 bg-slate-700">
                  <div className="w-1/2 h-full bg-white opacity-50" />
                  <div className="w-1/2 h-full bg-white" />
               </div>
               <div className="relative">
                  <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=120" alt="Promo" className="h-20 object-contain mix-blend-screen opacity-80" />
               </div>
            </div>
            <button className="absolute right-4 top-4 text-slate-500 hover:text-white">
              <RefreshCw size={14} />
            </button>
         </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Filter Toolbar */}
        {lowInventoryItems.length > 0 && (
          <div className="bg-red-50/80 border border-red-200/60 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fade-in relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-red-800 text-[15px]">Cảnh báo tồn kho thấp</h4>
                <p className="text-[13px] text-red-600/90 mt-0.5">
                  Bạn có <strong>{lowInventoryItems.length}</strong> sản phẩm đang có số lượng tồn kho dưới mức an toàn (dưới 5 sản phẩm). Vui lòng kiểm tra báo cáo phía dưới và tiến hành nhập hàng để đảm bảo hoạt động kinh doanh.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                document.getElementById('low-inventory-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white border border-red-200 text-red-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-red-50 transition shrink-0 shadow-sm"
            >
              Xem chi tiết
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 glass-card p-3 rounded-xl border border-white/40">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Khoảng thời gian</span>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-blue-400 transition">
                <Clock size={14} strokeWidth={2.5} />
                <span>7 ngày qua</span>
                <ChevronDown size={14} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">So sánh với</span>
              <button className="flex items-center justify-between min-w-[160px] px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-blue-400 transition text-left">
                <span>Trước đó 7 ngày</span>
                <ChevronDown size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <span>Thêm lọc</span>
              <ChevronDown size={14} />
            </button>
            <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition">
              <Clock size={18} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <RefreshCw size={14} />
              <span>Tải lại</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Settings size={14} />
              <span>Cấu hình</span>
            </button>
          </div>
        </div>

        {/* Triple Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           {/* Card 1 */}
           <div className="glass-card p-5 rounded-xl border border-white/40 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Box size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-[15px]">Tổng hàng chốt</h3>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Tổng tiền</p>
                  <p className="text-[16px] font-bold text-emerald-600 flex items-baseline gap-1">0 <span className="text-[12px] underline">đ</span></p>
                  <p className="text-[14px] text-slate-300">-</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Số lượng</p>
                  <p className="text-[16px] font-bold text-slate-800">0</p>
                  <p className="text-[14px] text-slate-300">-</p>
                </div>
              </div>
           </div>

           {/* Card 2 */}
           <div className="glass-card p-5 rounded-xl border border-white/40 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <h3 className="font-bold text-slate-800 text-[15px]">Tổng hàng hoàn</h3>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Tổng tiền</p>
                  <p className="text-[16px] font-bold text-orange-600 flex items-baseline gap-1">0 <span className="text-[12px] underline">đ</span></p>
                  <p className="text-[14px] text-slate-300">-</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Số lượng</p>
                  <p className="text-[16px] font-bold text-slate-800">0</p>
                  <p className="text-[14px] text-slate-300">-</p>
                </div>
              </div>
           </div>

           {/* Card 3 */}
           <div className="glass-card p-5 rounded-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Store size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-[15px]">Có thể bán</h3>
                </div>
                <span className="text-[18px] font-bold text-slate-800">37</span>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Giá nhập</p>
                  <p className="text-[16px] font-bold text-slate-800 flex items-baseline gap-1">14.900.000 <span className="text-[12px] underline">đ</span></p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Giá bán</p>
                  <p className="text-[16px] font-bold text-slate-800 flex items-baseline gap-1">29.600.000 <span className="text-[12px] underline">đ</span></p>
                </div>
              </div>
           </div>
        </div>

        {/* Main Section with Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
           {/* Left Core View */}
           <div className="lg:col-span-2 glass-card rounded-xl border border-white/40 p-0 shadow-xl overflow-hidden">
              {/* Internal metrics bar */}
              <div className="grid grid-cols-3 border-b border-slate-100">
                <div className="p-4 border-r border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Zap size={14} className="text-slate-400" />
                    <span className="text-[12px]">Tổng cộng</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Doanh thu:</span>
                    <span className="font-bold text-[14px]">0 <span className="text-[11px] underline">đ</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Đơn chốt:</span>
                    <span className="font-bold text-[14px]">0</span>
                  </div>
                </div>
                <div className="p-4 border-r border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <ShoppingBag size={14} className="text-slate-400" />
                    <span className="text-[12px]">Online</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Doanh thu:</span>
                    <span className="font-bold text-[14px]">0 <span className="text-[11px] underline">đ</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Đơn chốt:</span>
                    <span className="font-bold text-[14px]">0</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Store size={14} className="text-slate-400" />
                    <span className="text-[12px]">Bán tại quầy</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Doanh thu:</span>
                    <span className="font-bold text-[14px]">0 <span className="text-[11px] underline">đ</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] text-slate-400">Đơn chốt:</span>
                    <span className="font-bold text-[14px]">0</span>
                  </div>
                </div>
              </div>

              {/* Tabs and Chart Area */}
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-4 text-[13px] font-semibold">
                  <button className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100">Tổng quan</button>
                  <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded">Nguồn đơn</button>
                  <button className="px-4 py-1.5 text-slate-500 hover:bg-slate-50 rounded transition">Trạng thái</button>
                </div>

                <div className="flex items-center gap-8 text-center pb-2 px-2 overflow-x-auto no-scrollbar">
                  <div className="shrink-0 min-w-[100px] border-b-2 border-blue-500 pb-2">
                    <p className="text-[12px] text-slate-400">Doanh số</p>
                    <p className="font-bold text-slate-800">0 <span className="text-[11px] underline">đ</span></p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[100px] pb-2">
                    <p className="text-[12px] text-slate-400">Doanh thu</p>
                    <p className="font-bold text-slate-800">0 <span className="text-[11px] underline">đ</span></p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[100px] pb-2">
                    <p className="text-[12px] text-slate-400">Lợi nhuận</p>
                    <p className="font-bold text-slate-800">0 <span className="text-[11px] underline">đ</span></p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[80px] pb-2">
                    <p className="text-[12px] text-slate-400">Đơn chốt</p>
                    <p className="font-bold text-slate-800 text-[16px]">0</p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[80px] pb-2">
                    <p className="text-[12px] text-slate-400 flex items-center justify-center gap-1 group">GTTB <HelpCircle size={10} className="text-orange-400" /></p>
                    <p className="font-bold text-slate-300">-</p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[100px] pb-2">
                    <p className="text-[12px] text-slate-400">SL sản phẩm</p>
                    <p className="font-bold text-slate-800 text-[16px]">0</p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                  <div className="shrink-0 min-w-[100px] pb-2">
                    <p className="text-[12px] text-slate-400 flex items-center justify-center gap-1">SL SPTB <HelpCircle size={10} className="text-orange-400" /></p>
                    <p className="font-bold text-slate-300">-</p>
                    <p className="text-[10px] text-slate-300">-</p>
                  </div>
                </div>

                <div className="h-[300px] w-full relative">
                   <div className="absolute left-0 top-0 text-[11px] text-slate-400">0</div>
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mainChartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                        <YAxis hide domain={[0, 10]} />
                        <Tooltip contentStyle={{ fontSize: '10px' }} labelStyle={{ fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                   </ResponsiveContainer>
                   
                   {/* Legends */}
                   <div className="flex items-center justify-center gap-6 mt-4 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-blue-600" />
                        <span className="text-slate-600">7 ngày qua</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-slate-300 border-t border-dashed" />
                        <span className="text-slate-500">7 ngày trước đó</span>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           {/* Right Column Context */}
           <div className="glass-card rounded-xl border border-white/40 p-5 shadow-xl flex flex-col gap-5">
              <h4 className="font-bold text-slate-800 text-[15px]">Thông tin kinh doanh hôm nay</h4>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                    <p className="text-[12px] text-slate-500">Doanh thu</p>
                    <p className="text-[16px] font-bold text-slate-800">0 <span className="text-[12px] underline">đ</span></p>
                 </div>
                 <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                    <p className="text-[12px] text-slate-500">Đơn chốt</p>
                    <p className="text-[16px] font-bold text-slate-800">0</p>
                 </div>
              </div>

              <div className="h-[120px] w-full border-b border-slate-100 pb-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={todayChartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} hide />
                       <Tooltip />
                       <Area type="monotone" dataKey="val" stroke="#cbd5e1" fill="#f8fafc" strokeDasharray="3 3" />
                    </AreaChart>
                 </ResponsiveContainer>
                 <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
                    <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span><span>10h</span><span>12h</span><span>14h</span><span>16h</span><span>18h</span><span>20h</span><span>22h</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 rounded-lg p-3 space-y-1 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <Store size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-600">Bán tại quầy</span>
                       </div>
                       <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                    <p className="text-[14px] font-bold">0 <span className="text-[10px] underline">đ</span></p>
                    <p className="text-[12px] text-slate-500 font-bold">0 Đơn chốt</p>
                 </div>
                 <div className="bg-slate-50 rounded-lg p-3 space-y-1 border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-1">
                          <ShoppingBag size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-600">Online</span>
                       </div>
                       <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                    <p className="text-[14px] font-bold">0 <span className="text-[10px] underline">đ</span></p>
                    <p className="text-[12px] text-slate-500 font-bold">0 Đơn chốt</p>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Đơn tạo mới</p>
                    <p className="text-[14px] font-bold text-slate-800">0</p>
                 </div>
                 <div className="bg-red-50 p-2 rounded-md">
                    <p className="text-[9px] text-red-400 font-bold uppercase truncate">Đơn hủy</p>
                    <p className="text-[14px] font-bold text-red-600">0</p>
                 </div>
                 <div className="bg-emerald-50 p-2 rounded-md">
                    <p className="text-[9px] text-emerald-400 font-bold uppercase truncate">Đơn chốt</p>
                    <p className="text-[14px] font-bold text-emerald-600">0</p>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Đơn xoá</p>
                    <p className="text-[14px] font-bold text-slate-800">0</p>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">SL bán thực</p>
                    <p className="text-[14px] font-bold text-slate-800">0</p>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-md">
                    <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Khách hàng</p>
                    <p className="text-[14px] font-bold text-slate-800">0</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Low Inventory Alert Row */}
        <div id="low-inventory-section" className="glass-card rounded-xl border border-white/40 p-0 shadow-xl overflow-hidden mt-5 mb-5">
           <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-md bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <AlertTriangle size={18} />
                 </div>
                 <h4 className="font-bold text-slate-800 text-[15px]">Cảnh báo tồn kho thấp {'<'} 5</h4>
              </div>
              <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-[11px] font-bold">{lowInventoryItems.length} mẫu mã sắp hết hàng</span>
           </div>
           <div className="overflow-x-auto max-h-[300px] scrollbar-thin">
              <table className="w-full text-left relative">
                 <thead className="bg-[#e9eff6] sticky top-0 z-10 shadow-sm border-b border-slate-200">
                    <tr className="text-[12px] font-bold text-slate-600">
                       <th className="px-4 py-3">Sản phẩm</th>
                       <th className="px-4 py-3 whitespace-nowrap">Mã SKU</th>
                       <th className="px-4 py-3 whitespace-nowrap text-right">Tồn kho còn lại</th>
                       <th className="px-4 py-3 whitespace-nowrap text-right">Đơn giá</th>
                    </tr>
                 </thead>
                 <tbody>
                    {lowInventoryItems.length === 0 ? (
                      <tr>
                         <td colSpan={4} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center w-full">
                           <Package size={32} className="text-slate-300 mb-2" />
                           <span className="text-sm">Tất cả sản phẩm đều đủ hàng.</span>
                         </td>
                      </tr>
                    ) : (
                      lowInventoryItems.map(item => (
                        <tr key={`${item.productId}-${item.variantId}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                           <td className="px-4 py-2.5">
                             <div className="flex items-center gap-3">
                                <img src={item.image} alt={item.productName} className="w-9 h-9 flex-shrink-0 rounded-lg object-cover border border-slate-200 bg-white" />
                                <div>
                                   <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                                   <p className="text-[11px] text-slate-500 font-medium">{item.variantName}</p>
                                </div>
                             </div>
                           </td>
                           <td className="px-4 py-2.5 text-[12px] font-mono text-slate-500">{item.sku}</td>
                           <td className="px-4 py-2.5 text-[13px] font-bold text-right">
                             <span className={item.available === 0 ? 'text-red-600 bg-red-100 px-2.5 py-0.5 rounded-md border border-red-200 inline-block min-w-[32px] text-center' : 'text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-200 inline-block min-w-[32px] text-center'}>
                               {item.available}
                             </span>
                           </td>
                           <td className="px-4 py-2.5 text-[13px] font-semibold text-slate-700 text-right">{formatCurrency(item.price)}</td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
           {/* Products Table */}
           <div className="glass-card rounded-xl border border-white/40 p-0 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 pb-2">
                 <h4 className="font-bold text-slate-800 text-[15px]">Sản phẩm</h4>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#e9eff6]">
                       <tr className="text-[12px] font-bold text-slate-600">
                          <th className="px-4 py-3">Thông tin sản phẩm</th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Doanh thu <ChevronDown size={12} className="text-blue-500" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Số lượng hoàn <ChevronDown size={12} className="text-slate-400" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Số lượng bán <ChevronDown size={12} className="text-slate-400" /></div></th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr>
                          <td colSpan={4} className="py-20 text-center">
                             <div className="flex flex-col items-center gap-2 opacity-30 grayscale saturate-0">
                                <ShoppingBag size={48} className="text-slate-400" />
                                <p className="text-sm font-medium text-slate-500">Trống</p>
                             </div>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Staff Table */}
           <div className="glass-card rounded-xl border border-white/40 p-0 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-100 pb-2">
                 <h4 className="font-bold text-slate-800 text-[15px]">Nhân viên</h4>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#e9eff6]">
                       <tr className="text-[12px] font-bold text-slate-600">
                          <th className="px-4 py-3">Nhân viên</th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Doanh thu <ChevronDown size={12} className="text-blue-500" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Doanh số <ChevronDown size={12} className="text-slate-400" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Chiết khấu <ChevronDown size={12} className="text-slate-400" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Đơn chốt <ChevronDown size={12} className="text-slate-400" /></div></th>
                          <th className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-1">Tỷ lệ chốt <ChevronDown size={12} className="text-slate-400" /></div></th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr>
                          <td colSpan={6} className="py-20 text-center">
                             <div className="flex flex-col items-center gap-2 opacity-30 grayscale saturate-0">
                                <Users2 size={48} className="text-slate-400" />
                                <p className="text-sm font-medium text-slate-500">Trống</p>
                             </div>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
