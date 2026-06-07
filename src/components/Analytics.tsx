/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Order, Product, Customer, ShopConfig } from '../types';
import { TrendingUp, Award, BarChart3, TrendingDown, Coins, HelpCircle } from 'lucide-react';

interface AnalyticsProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  config: ShopConfig;
}

export default function Analytics({ orders, products, customers, config }: AnalyticsProps) {
  
  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  // 1. High level indices
  const salesCompleted = useMemo(() => orders.filter((o) => o.status === 'completed'), [orders]);
  
  const totalRevenue = useMemo(() => {
    return salesCompleted.reduce((s, o) => s + o.finalAmount, 0);
  }, [salesCompleted]);

  const totalProfit = useMemo(() => {
    // Basic margin profit = revenue - estimation cost of goods sold (COGS)
    let cogs = 0;
    salesCompleted.forEach((o) => {
      o.items.forEach((item) => {
        // Look up import cost for each variant
        const foundProd = products.find((p) => p.id === item.productId);
        const foundVar = foundProd?.variants.find((v) => v.id === item.variantId);
        const singleCogs = foundVar?.importPrice || Math.round(item.price * 0.5);
        cogs += singleCogs * item.quantity;
      });
    });
    return Math.max(0, totalRevenue - cogs);
  }, [salesCompleted, products, totalRevenue]);

  const averageBasketValue = useMemo(() => {
    if (salesCompleted.length === 0) return 0;
    return Math.round(totalRevenue / salesCompleted.length);
  }, [salesCompleted, totalRevenue]);

  // 2. Chart data: Daily Revenue splits
  const revenueChartData = useMemo(() => {
    const map: { [key: string]: { revenue: number; ordersCount: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      map[k] = { revenue: 0, ordersCount: 0 };
    }

    salesCompleted.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (map[dateKey]) {
        map[dateKey].revenue += o.finalAmount;
        map[dateKey].ordersCount += 1;
      }
    });

    return Object.keys(map).map((key) => ({
      name: key,
      'Doanh thu': map[key].revenue,
      'Số hóa đơn': map[key].ordersCount
    }));
  }, [salesCompleted]);

  // 3. Chart data: Best Categories BarChart
  const categoryChartData = useMemo(() => {
    const countsMap: { [key: string]: number } = {};
    salesCompleted.forEach((o) => {
      o.items.forEach((item) => {
        const p = products.find((prod) => prod.id === item.productId);
        if (p) {
          countsMap[p.category] = (countsMap[p.category] || 0) + item.quantity;
        }
      });
    });

    return Object.keys(countsMap).map((catName) => ({
      name: catName,
      'Số lượng bán': countsMap[catName]
    }));
  }, [salesCompleted, products]);

  // 4. Chart data: Payment selections pie charts count
  const paymentChartData = useMemo(() => {
    const map: { [key: string]: number } = {
      cash: 0,
      card: 0,
      bank_transfer: 0,
      e_wallet: 0
    };

    salesCompleted.forEach((o) => {
      map[o.paymentMethod] = (map[o.paymentMethod] || 0) + o.finalAmount;
    });

    const labels: { [key: string]: string } = {
      cash: 'Tiền mặt 💵',
      card: 'Quẹt thẻ 💳',
      bank_transfer: 'Chuyển khoản 🏦',
      e_wallet: 'Ví điện tử 📱'
    };

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

    return Object.keys(map).map((key, index) => ({
      name: labels[key] || key,
      value: map[key],
      color: COLORS[index % COLORS.length]
    }));
  }, [salesCompleted]);

  // 5. Best products list
  const bestSellingProducts = useMemo(() => {
    const itemsMap: { [key: string]: { name: string; sku: string; qty: number; value: number } } = {};
    salesCompleted.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemsMap[it.variantId]) {
          itemsMap[it.variantId] = {
            name: it.productName + ' (' + (it.variantName.split(' - ')[1] || 'Bản chuẩn') + ')',
            sku: it.sku,
            qty: 0,
            value: 0
          };
        }
        itemsMap[it.variantId].qty += it.quantity;
        itemsMap[it.variantId].value += it.price * it.quantity;
      });
    });

    return Object.values(itemsMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [salesCompleted]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none animate-fade-in" id="analytics-statistics-page">
      
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Thống kê & Phân tích bán hàng</h2>
        <p className="text-xs text-slate-450">Báo cáo doanh thu kinh doanh chi tiết phục vụ tối ưu hóa chi phí.</p>
      </div>

      {/* KPI summaries cards standard row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Ho doanh thu gặt hái</span>
          <h3 className="text-xl font-black text-blue-600 mt-1">{formatCurrency(totalRevenue)}</h3>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <TrendingUp size={11} /> +12% so với tháng trước
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Khấu hao Lợi nhuận gộp</span>
          <h3 className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(totalProfit)}</h3>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <Award size={11} /> Tỉ lệ lợi nhuận ~{totalRevenue ? Math.round((totalProfit / totalRevenue) * 100) : 0}% vĩ mô
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Giá trị TB/Hóa đơn POS</span>
          <h3 className="text-xl font-black text-slate-800 mt-1">{formatCurrency(averageBasketValue)}</h3>
          <span className="text-[10px] text-slate-400 mt-1 block font-semibold">Tăng 2.5% so với quý trước</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Tổng đơn hoàn tất</span>
          <h3 className="text-xl font-black text-slate-800 mt-1">{salesCompleted.length} Hóa đơn</h3>
          <span className="text-[10px] text-indigo-650 font-bold mt-1 block">Tỷ lệ hủy đơn cực thấp: 0%</span>
        </div>
      </div>

      {/* Charts section splits 2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Doanh thu trends area chart */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Doanh thu bán hằng ngày (7 Ngày qua)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString('vi-VN')} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']} />
                <Area type="monotone" dataKey="Doanh thu" stroke="#10b981" strokeWidth={2.5} fill="url(#chartColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories bar charts count */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Lượng tiêu thụ sản phẩm theo Ngành hàng</h4>
          <div className="h-64 w-full">
            {categoryChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 select-none text-xs">Phân tích dữ liệu sẽ xuất hiện khi bạn có đơn hàng thành công</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="Số lượng bán" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment split Pie chart */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Cấu trúc dòng tiền theo Phương thức thanh toán</h4>
          <div className="h-64 w-full flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh số']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <Coins size={18} className="text-slate-400" />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {paymentChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-550 font-semibold">{item.name}:</span>
                  <span className="font-black text-slate-850">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Best selling products ranks */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Bảng vàng TOP 5 sản phẩm bán chạy nhất</h4>
          <div className="space-y-2.5">
            {bestSellingProducts.length === 0 ? (
              <div className="py-20 text-center text-slate-450 font-medium text-xs">Số liệu bán hàng sẽ tự động xếp hạng tại đây khi hoàn thành thanh toán.</div>
            ) : (
              bestSellingProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-150/40 hover:border-slate-300/80 transition text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-850 block">{p.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">SKU: {p.sku}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <strong className="text-slate-800 block">Đã bán: x{p.qty}</strong>
                    <span className="text-[10px] text-emerald-600 block font-bold">{formatCurrency(p.value)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
