import React, { useMemo } from "react";
import {
  TrendingUp,
  Store,
  ChevronDown,
  Clock,
  Zap,
  Package,
  Users,
  AlertTriangle,
  LayoutDashboard,
  CircleDollarSign,
  ShoppingCart,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import { Product, Order, Customer, ShopConfig } from "../types";

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
  setCurrentTab,
}: OverviewProps) {
  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  // 1. KPI Calculations
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
    
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
    const lowStockCount = products.reduce((count, p) => 
      count + p.variants.filter(v => v.available < (config.lowStockThreshold || 5)).length, 
    0);
    
    const statusCounts = {
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      completed: orders.filter(o => o.status === "completed").length,
      canceled: orders.filter(o => o.status === "canceled").length,
    };

    return { todayRevenue, totalRevenue, lowStockCount, statusCounts, todayOrderCount: todayOrders.length };
  }, [orders, products, config]);

  // 2. Top Products Data
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number }> = {};
    
    orders.forEach(order => {
      if (order.status === "canceled") return;
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.productName, quantity: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // 3. Status Distribution for Charts
  const statusChartData = useMemo(() => [
    { name: "Chờ duyệt", value: stats.statusCounts.pending, color: "#f59e0b" },
    { name: "Đang xử lý", value: stats.statusCounts.processing, color: "#3b82f6" },
    { name: "Hoàn tất", value: stats.statusCounts.completed, color: "#10b981" },
    { name: "Đã hủy", value: stats.statusCounts.canceled, color: "#ef4444" },
  ], [stats]);

  // 4. Calculate trend data for the last 7 days (Doanh thu, Đơn hàng, Khách hàng mới)
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => {
      const dateOrders = orders.filter((o) => o.createdAt && o.createdAt.startsWith(date));
      const revenue = dateOrders.reduce((sum, o) => sum + o.finalAmount, 0);
      const orderCount = dateOrders.length;
      const registeredCustomers = customers.filter((c) => c.createdAt && c.createdAt.startsWith(date)).length;

      const [_, month, day] = date.split("-");
      const label = `${day}/${month}`;

      return {
        date,
        label,
        revenue,
        orderCount,
        newCustomers: registeredCustomers,
      };
    });
  }, [orders, customers]);

  return (
    <div
      className="space-y-6 bg-transparent min-h-screen p-6 select-none font-sans"
      id="overview-dashboard"
    >
      {/* 1. Header Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <LayoutDashboard size={28} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-[23px] font-black text-slate-900 tracking-tight">
              Tổng quan kinh doanh
            </h1>
            <p className="text-[16px] font-semibold text-slate-500 mt-1">
              Theo dõi hiệu suất bán hàng và quản lý kho trong thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[13px] font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Hệ thống trực tuyến
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-6">
        {/* Today's Sales */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">Doanh thu hôm nay</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CircleDollarSign size={20} />
            </div>
          </div>
          <div className="text-[28px] font-black text-slate-900 mb-1">{formatCurrency(stats.todayRevenue)}</div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-emerald-500">
            <TrendingUp size={14} />
            <span>{stats.todayOrderCount} đơn hàng mới</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">Đơn hàng chờ duyệt</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="text-[28px] font-black text-slate-900 mb-1">{stats.statusCounts.pending}</div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-amber-500">
            <Clock size={14} />
            <span>Cần xử lý ngay</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">Sản phẩm sắp hết</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="text-[28px] font-black text-slate-900 mb-1">{stats.lowStockCount}</div>
          <button 
            onClick={() => setCurrentTab("products")}
            className="flex items-center gap-1 text-[13px] font-bold text-rose-500 hover:underline"
          >
            <span>Xem chi tiết danh sách</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Customer Base */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">Tổng khách hàng</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div className="text-[28px] font-black text-slate-900 mb-1">{customers.length}</div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-slate-400">
            <span>Tăng trưởng tự nhiên</span>
          </div>
        </div>
      </div>

      {/* 2.5 Quick Trends Dashboard Charts */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Trend AreaChart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-[15px] font-extrabold text-slate-800 font-sans flex items-center gap-1.5 uppercase tracking-wide">
              <TrendingUp size={16} className="text-emerald-500" />
              Doanh thu 7 ngày qua
            </h3>
            <p className="text-[12px] text-slate-400 font-semibold font-sans">Xu hướng dòng tiền doanh số bán lẻ</p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: any) => [formatCurrency(value), "Doanh thu"]}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#64748b' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Count BarChart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-[15px] font-extrabold text-slate-800 font-sans flex items-center gap-1.5 uppercase tracking-wide">
              <ShoppingCart size={16} className="text-indigo-500" />
              Đơn hàng 7 ngày qua
            </h3>
            <p className="text-[12px] text-slate-400 font-semibold font-sans">Tổng số lượng đơn hàng hoàn thành</p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: any) => [value + " đơn", "Số đơn hàng"]}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#64748b' }}
                />
                <Bar dataKey="orderCount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Customers AreaChart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-[15px] font-extrabold text-slate-800 font-sans flex items-center gap-1.5 uppercase tracking-wide">
              <Users size={16} className="text-amber-500" />
              Khách hàng mới 7 ngày qua
            </h3>
            <p className="text-[12px] text-slate-400 font-semibold font-sans">Tốc độ thu hút khách hàng đăng ký mới</p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: any) => [value + " khách", "Khách hàng mới"]}
                  labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#64748b' }}
                />
                <Area type="monotone" dataKey="newCustomers" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCustomers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Detailed Analytics Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Sales Distribution (Pie Chart) */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[18px] font-bold text-slate-800 mb-6 font-sans">Trạng thái đơn hàng</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {statusChartData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-[14px] text-slate-600 font-semibold">{s.name}</span>
                </div>
                <span className="text-[14px] font-black text-slate-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products (Bar Chart) */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-bold text-slate-800 font-sans">Sản phẩm bán chạy (Số lượng)</h3>
            <button className="text-[13px] font-bold text-blue-600 hover:underline">Tất cả sản phẩm</button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={150}
                  tick={{ fill: "#64748b", fontSize: 13, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="quantity" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recent High Value Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="text-[18px] font-bold text-slate-800 font-sans">Giao dịch gần đây</h3>
            <p className="text-[13px] text-slate-500 font-semibold mt-1">Các đơn hàng mới nhất cần xử lý hoặc theo dõi.</p>
          </div>
          <button 
            onClick={() => setCurrentTab("orders")}
            className="px-4 py-2 bg-slate-50 text-slate-700 text-[13px] font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition"
          >
            Xem tất cả đơn hàng
          </button>
        </div>

        <div className="overflow-hidden border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-4 py-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">Mã đơn</th>
                <th className="px-4 py-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-4 py-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-[14px] font-black text-blue-600">#{order.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-700">{order.customer?.name || "Khách lẻ"}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{order.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-[14px] font-black text-slate-900">{formatCurrency(order.finalAmount)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        order.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        order.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        order.status === "canceled" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {order.status === "completed" ? "Hoàn tất" :
                         order.status === "pending" ? "Chờ duyệt" :
                         order.status === "canceled" ? "Đã hủy" : "Đang xử lý"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
