/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  CircleDollarSign,
  Users2,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MonitorCheck,
  Globe,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Search,
  Building2,
  Bell,
  AlertCircle,
  Plus,
} from "lucide-react";
import { ShopConfig, Order, Product, Variant } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  config: ShopConfig;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  orders: Order[];
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  products: Product[];
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  config,
  collapsed,
  setCollapsed,
  orders,
  user,
  onLogin,
  onLogout,
  globalSearch,
  setGlobalSearch,
  products,
}: SidebarProps) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [activeWarehouse, setActiveWarehouse] = React.useState("Tất cả các kho");
  const [showWarehouseDropdown, setShowWarehouseDropdown] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [forecastQuantities, setForecastQuantities] = React.useState<
    Record<string, { reorderAmount: number; sales30d: number }>
  >({});

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

  const calculateReorderAmount = (
    productId: string,
    variantId: string,
    currentAvailable: number,
  ) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let soldQty = 0;
    (orders || []).forEach((o) => {
      if (o.status === "canceled") return;
      const orderDate = new Date(o.createdAt);
      if (orderDate >= thirtyDaysAgo) {
        o.items.forEach((item) => {
          if (item.variantId === variantId) {
            soldQty += item.quantity;
          }
        });
      }
    });

    const reorderAmount = Math.max(
      10,
      Math.ceil(soldQty * 1.5) - currentAvailable,
    );
    setForecastQuantities((prev) => ({
      ...prev,
      [variantId]: { reorderAmount, sales30d: soldQty },
    }));
  };

  const suggestions = React.useMemo(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) return [];

    const searchLower = globalSearch.toLowerCase();
    const matches: { product: Product; variant: Variant }[] = [];

    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (
          p.name.toLowerCase().includes(searchLower) ||
          v.name.toLowerCase().includes(searchLower) ||
          p.sku?.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower)
        ) {
          matches.push({ product: p, variant: v });
        }
      });
    });

    return matches.slice(0, 6);
  }, [globalSearch, products]);

  const sidebarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setShowSuggestions(false);
        setShowWarehouseDropdown(false);
        setShowNotifications(false);
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "architecture", label: "Kiến trúc", icon: LayoutDashboard },
    {
      id: "sales",
      label: "Bán hàng",
      icon: ShoppingCart,
      subItems: [
        { id: "pos", label: "Bán hàng" },
        { id: "sales-return", label: "Trả hàng" },
      ],
    },
    {
      id: "orders-group",
      label: "Đơn hàng",
      icon: ReceiptText,
      subItems: [
        { id: "orders", label: "Đơn hàng" },
        { id: "livestream", label: "Livestream" },
        { id: "returns", label: "Đổi trả" },
        { id: "invoices", label: "Hoá đơn" },
        { id: "call-appointments", label: "Hẹn gọi" },
      ],
    },
    {
      id: "products-group",
      label: "Sản phẩm",
      icon: Package,
      subItems: [
        { id: "products", label: "Sản phẩm" },
        { id: "promotions", label: "Khuyến mãi" },
        { id: "combos", label: "Combo" },
        { id: "suppliers", label: "Nhà cung cấp" },
      ],
    },
    {
      id: "finance-group",
      label: "Tài chính",
      icon: CircleDollarSign,
      subItems: [
        { id: "reconciliation", label: "Đối soát" },
        { id: "income-expense", label: "Thu chi" },
        { id: "debt", label: "Công nợ" },
        { id: "transactions", label: "Giao dịch" },
      ],
    },
    { id: "customers", label: "Khách hàng", icon: Users2 },
    { id: "ads", label: "Quảng cáo", icon: Megaphone },
    { id: "analytics", label: "Thống kê", icon: BarChart3 },
    { id: "settings", label: "Cấu hình", icon: Settings },
  ];

  return (
    <div
      ref={sidebarRef}
      className={`glass-panel border-r border-white/20 flex flex-col justify-between h-screen select-none shadow-2xl transition-all duration-300 whitespace-nowrap ${
        collapsed ? "w-16" : "w-max"
      }`}
      id="pos-sidebar"
    >
      {/* Brand Section */}
      <div className="p-[14px] border-b border-black/5 flex items-center gap-3">
        <img
          src="https://i.ibb.co/WW0K15Xz/Logo-mau-xanh-x-m-CV-Nguyen-H-ng-Th-i.png"
          alt="Power Service"
          className="w-10 h-10 object-contain shrink-0"
          referrerPolicy="no-referrer"
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-black text-[18px] font-sans text-[#2B4C6F] tracking-tighter leading-none">
              Power Service
            </span>
            <span className="text-[12px] font-bold text-black mt-1 leading-none tracking-normal">
              POS Platfrom
            </span>
          </div>
        )}
      </div>

      {/* Global Search Section */}
      <div className={`px-3.5 mb-2 mt-4 transition-all duration-300 ${collapsed ? "opacity-0 invisible h-0" : "opacity-100 visible h-auto"}`}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-slate-400 group-focus-within:text-[#2B4C6F] transition-colors" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-100/80 border border-transparent focus:border-[#2B4C6F]/30 focus:bg-white text-[13px] rounded-xl py-2 pl-9 pr-3 text-slate-700 placeholder:text-slate-400 focus:outline-none transition-all focus:shadow-sm"
            placeholder="Tìm kiếm..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

          {/* Sidebar Suggestions Popover */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto overflow-x-hidden font-sans"
              >
                <div className="bg-slate-50/80 px-3 py-1.5 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                  Kết quả nhanh ({suggestions.length})
                </div>
                {suggestions.map(({ product, variant }) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setCurrentTab("products");
                      setGlobalSearch(variant.sku || variant.name);
                      setShowSuggestions(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                      <img
                        src={product.image}
                        alt={variant.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-bold text-slate-700 leading-tight truncate">
                        {variant.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        Mã: {variant.sku} • {variant.price.toLocaleString()}đ
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Warehouse Selector Section - Integrated below Search */}
      <div className={`px-3.5 mt-1 transition-all duration-300 ${collapsed ? "opacity-0 invisible h-0 mb-0" : "opacity-100 visible h-auto mb-2"}`}>
        <div className="relative">
          <button
            onClick={() => setShowWarehouseDropdown(!showWarehouseDropdown)}
            className="w-full flex items-center justify-between gap-2 bg-slate-100/80 border border-transparent hover:border-slate-200 text-slate-700 text-[13px] rounded-xl py-2 px-3 focus:outline-none transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 size={14} className="text-[#2B4C6F] shrink-0" />
              <span className="font-bold truncate">{activeWarehouse}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${showWarehouseDropdown ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {showWarehouseDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[110] py-1.5 font-sans"
              >
                {[
                  "Tất cả các kho",
                  "Kho tổng Hà Nội",
                  "Kho chi nhánh HCM",
                ].map((wh) => (
                  <button
                    key={wh}
                    onClick={() => {
                      setActiveWarehouse(wh);
                      setShowWarehouseDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] font-semibold transition-colors flex items-center justify-between ${
                      activeWarehouse === wh
                        ? "text-[#2B4C6F] font-bold bg-slate-50"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{wh}</span>
                  </button>
                ))}
                <div className="mx-2 mt-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => setShowWarehouseDropdown(false)}
                    className="w-full flex items-center gap-2 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus size={12} />
                    <span>Thêm kho mới</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 py-6 overflow-y-auto space-y-1.5 px-2.5 scrollbar-none flex flex-col justify-center">
        <div className="space-y-1">
          {(() => {
            const unprocessedCount = orders
              ? orders.filter(
                  (o) => o.status === "pending" || o.status === "processing",
                ).length
              : 0;
            return menuItems.map((item) => {
              const Icon = item.icon;
              const isGroup = !!item.subItems;
              const isActive =
                currentTab === item.id ||
                item.subItems?.some((sub) => sub.id === currentTab);

              if (isGroup) {
                const isDropdownOpen = activeDropdown === item.id;
                return (
                  <div key={item.id} className="relative group/menu">
                    <button
                      onClick={(e) => toggleDropdown(e, item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[16px] font-bold tracking-tight transition-all duration-200 group relative ${
                        isActive
                          ? "text-blue-600 bg-blue-100/50"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="w-5 flex items-center justify-center shrink-0">
                        <Icon
                          size={18}
                          className={
                            isActive
                              ? "text-blue-600"
                              : "text-slate-500 group-hover:text-slate-700"
                          }
                        />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.id === "orders-group" &&
                            unprocessedCount > 0 && (
                              <span className="bg-red-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                                {unprocessedCount}
                              </span>
                            )}
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      )}
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, x: collapsed ? 10 : 0, y: -5 }}
                          animate={{ opacity: 1, scale: 1, x: collapsed ? 0 : 0, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className={`absolute z-[100] bg-white border border-slate-200 shadow-xl rounded-xl py-2 min-w-[180px] ${
                            collapsed ? "left-full ml-2 top-0" : "left-0 right-0 top-full mt-1"
                          }`}
                        >
                          <div className="px-3 py-1.5 mb-1.5 border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.label}
                          </div>
                          <div className="space-y-0.5 px-2">
                            {item.subItems?.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentTab(sub.id);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 flex items-center justify-between ${
                                  currentTab === sub.id
                                    ? "text-blue-600 font-bold bg-blue-50"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                              >
                                <span>{sub.label}</span>
                                {sub.id === "orders" &&
                                  unprocessedCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shrink-0">
                                      {unprocessedCount}
                                    </span>
                                  )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setCurrentTab(
                      item.id === "orders-group"
                        ? "orders"
                        : item.id === "products-group"
                          ? "products"
                          : item.id === "finance-group"
                            ? "reconciliation"
                            : item.id,
                    )
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[16px] font-bold tracking-tight transition-all duration-200 group relative ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="w-5 flex items-center justify-center shrink-0 relative">
                    <Icon
                      size={18}
                      className={`${
                        isActive
                          ? "text-white font-bold"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    />
                    {item.id === "orders-group" && unprocessedCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center ring-1 ring-white">
                        {unprocessedCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1 text-left">
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white absolute right-3"></div>
                      )}
                    </>
                  )}
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Notifications Section - Located above Profile */}
      <div className="px-2.5 mb-1 relative" id="sidebar-notifications-container">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[16px] font-bold tracking-tight transition-all duration-200 group relative ${
            showNotifications
              ? "bg-[#2B4C6F] text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          } ${collapsed ? "justify-center" : ""}`}
          title="Thông báo đơn hàng & tồn kho"
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0 relative">
            <Bell size={18} />
            {lowStockVariants.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f43f5e] text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white scale-90">
                {lowStockVariants.length}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="truncate flex-1 text-left">Thông báo</span>
          )}
        </button>

        {/* Floating notifications list popup from bottom */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`absolute bottom-full mb-2 bg-white border border-slate-200/80 rounded-xl shadow-2xl z-[150] text-[14px] divide-y divide-slate-100 font-sans ${
                collapsed ? "left-full ml-2 w-80" : "left-2.5 right-2.5 w-80"
              }`}
            >
              <div className="bg-slate-50/80 px-4 py-3 font-bold text-slate-700 text-[14px] flex justify-between items-center rounded-t-xl rounded-b-none">
                <span className="flex items-center gap-1.5 shrink-0">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>Sản phẩm sắp hết ({lowStockVariants.length})</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Ngưỡng: ≤{config.lowStockThreshold ?? 5}
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {lowStockVariants.length === 0 ? (
                  <div className="py-8 px-4 text-center text-slate-400 font-semibold text-[14px]">
                    🎉 Tất cả các mặt hàng hiện đều có lượng tồn kho an toàn!
                  </div>
                ) : (
                  lowStockVariants.map(({ product, variant }) => {
                    const forecast = forecastQuantities[variant.id];
                    return (
                      <div
                        key={variant.id}
                        className="p-3 hover:bg-slate-50/50 transition duration-150 text-left"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <img
                            src={
                              product.image ||
                              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=100&q=80"
                            }
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-150 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-slate-800 truncate leading-snug">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 font-mono">
                              <span className="bg-red-50 text-red-600 px-1 rounded font-bold">
                                {variant.sku}
                              </span>
                              <span>•</span>
                              <span>
                                {variant.name.split(" - ")[1] || "Bản chuẩn"}
                              </span>
                            </div>
                            <div className="text-[10.5px] font-bold mt-1 text-slate-600 flex items-center justify-between">
                              <span>Số lượng khả dụng:</span>
                              <span
                                className={
                                  variant.available === 0
                                    ? "text-rose-500 font-black"
                                    : "text-amber-600 font-black"
                                }
                              >
                                {variant.available} / {variant.stock}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Forecast calculations */}
                        {forecast ? (
                          <div className="mt-2 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-lg text-[12px] font-semibold text-slate-700">
                            <div className="text-emerald-700 font-semibold flex items-center gap-1">
                              <span>
                                📈 Gợi ý nhập: <b>+{forecast.reorderAmount}</b>{" "}
                                sản phẩm
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">
                              Lượng bán 30 ngày qua: <b>{forecast.sales30d}</b>{" "}
                              cái.
                              <br />
                              (Hệ số an toàn 1.5 trừ tồn kho sẵn có)
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2.5 flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                calculateReorderAmount(
                                  product.id,
                                  variant.id,
                                  variant.available,
                                );
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center gap-1 rounded font-extrabold text-[11px] uppercase tracking-wider transition duration-150 active:scale-95 border border-blue-100 cursor-pointer"
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
              <div className="p-2 text-center bg-slate-50/50 rounded-b-xl border-t border-slate-100 font-bold">
                <button
                  onClick={() => {
                    setCurrentTab("products");
                    setShowNotifications(false);
                  }}
                  className="text-blue-600 font-black hover:underline tracking-tight text-[11px] cursor-pointer"
                >
                  Xem chi tiết kho hàng &gt;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="p-2 border-t border-black/5 bg-white/40 relative">
        {user ? (
          <div className="relative">
            {/* Clickable Profile Card */}
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`w-full flex items-center gap-2.5 p-1.5 rounded-xl transition-all duration-200 text-left cursor-pointer ${
                collapsed 
                  ? "justify-center hover:bg-slate-100" 
                  : "bg-white/60 hover:bg-white shadow-sm border border-black/5"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User photo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[14px] font-bold text-blue-600">
                    {(user.displayName || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 flex flex-col text-left min-w-0">
                  <span className="text-[13px] font-bold text-slate-700 leading-none truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    Administrator
                  </span>
                </div>
              )}
              {!collapsed && (
                <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${showProfileDropdown ? "rotate-180" : ""}`} />
              )}
            </button>

            {/* Profile Dropdown revealing log out */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className={`absolute bottom-full mb-1 bg-white border border-slate-200 shadow-2xl rounded-xl py-1 w-44 z-[160] ${
                    collapsed ? "left-full ml-2" : "right-1"
                  }`}
                >
                  <div className="px-3 py-1.5 border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tài khoản admin
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut size={14} className="shrink-0 text-rose-500" />
                    <span>Đăng xuất</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${
              collapsed
                ? "justify-center text-blue-600 hover:bg-blue-50"
                : "w-full bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
            }`}
            title="Kết nối Cloud"
          >
            <LogIn size={16} />
            {!collapsed && <span>Kết nối Cloud</span>}
          </button>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-50 transition-all hover:scale-110 active:scale-95"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
