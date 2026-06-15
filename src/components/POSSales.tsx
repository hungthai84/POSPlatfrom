/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "./Toast";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Coins,
  QrCode,
  Receipt,
  ShoppingCart,
  Calendar,
  ChevronDown,
  Monitor,
  Maximize2,
  Printer,
  Save,
  Tag,
  Scan,
  Box,
  Truck,
  Info,
  ChevronUp,
  MoreVertical,
  X,
} from "lucide-react";
import {
  Product,
  Variant,
  Customer,
  CartItem,
  Order,
  ShopConfig,
} from "../types";
import { motion, AnimatePresence } from "motion/react";

interface POSSalesProps {
  products: Product[];
  customers: Customer[];
  config: ShopConfig;
  onAddOrder: (order: Order) => void;
  onAddCustomer: (customer: Customer) => void;
}

interface OrderState {
  id: string;
  tabLabel: string;
  cart: CartItem[];
  selectedCustomerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerBirthday: string;
  customerGender: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientLocation: string; // Tỉnh/Thành
  expectedDeliveryDate: string;
  staffHandling: string;
  staffCaring: string;
  marketer: string;
  discountValue: number;
  discountType: "cash" | "percent";
  shippingFee: number;
  surcharge: number;
  paymentAmount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "e_wallet";
  notes: string;
  internalNotes: string;
  freeShipping: boolean;
  onlyChargeIfReturn: boolean;
  tags: string[];
}

const DEFAULT_ORDER_STATE = (id: string, label: string): OrderState => ({
  id,
  tabLabel: label,
  cart: [],
  selectedCustomerId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerBirthday: "",
  customerGender: "male",
  recipientName: "",
  recipientPhone: "",
  recipientAddress: "",
  recipientLocation: "",
  expectedDeliveryDate: "",
  staffHandling: "Hùng Thái Nguyễn",
  staffCaring: "",
  marketer: "",
  discountValue: 0,
  discountType: "cash",
  shippingFee: 0,
  surcharge: 0,
  paymentAmount: 0,
  paymentMethod: "bank_transfer",
  notes: "",
  internalNotes: "",
  freeShipping: false,
  onlyChargeIfReturn: false,
  tags: [],
});

export default function POSSales({
  products,
  customers,
  config,
  onAddOrder,
  onAddCustomer,
}: POSSalesProps) {
  const toast = useToast();
  // Tabs State
  const [orders, setOrders] = useState<OrderState[]>([
    DEFAULT_ORDER_STATE("order-1", "Đơn mới (F6)"),
  ]);
  const [activeOrderId, setActiveOrderId] = useState<string>("order-1");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductMode, setIsProductMode] = useState(true); // Sản phẩm vs Combo
  const [isBarcodeScannerMode, setIsBarcodeScannerMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId) || orders[0],
    [orders, activeOrderId],
  );

  useEffect(() => {
    if (isBarcodeScannerMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isBarcodeScannerMode, activeOrder.cart.length]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!isBarcodeScannerMode) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag !== "input" && activeTag !== "textarea") {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isBarcodeScannerMode]);

  const updateActiveOrder = (updates: Partial<OrderState>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === activeOrderId ? { ...o, ...updates } : o)),
    );
  };

  // Cart Logic
  const handleAddVariantToCart = (prod: Product, v: Variant) => {
    const existing = activeOrder.cart.find((it) => it.variant.id === v.id);
    if (existing) {
      const newCart = activeOrder.cart.map((it) =>
        it.variant.id === v.id ? { ...it, quantity: it.quantity + 1 } : it,
      );
      updateActiveOrder({ cart: newCart });
    } else {
      updateActiveOrder({
        cart: [...activeOrder.cart, { product: prod, variant: v, quantity: 1 }],
      });
    }
  };

  const removeCartItem = (variantId: string) => {
    updateActiveOrder({
      cart: activeOrder.cart.filter((it) => it.variant.id !== variantId),
    });
  };

  const updateCartQty = (variantId: string, delta: number) => {
    const newCart = activeOrder.cart.map((it) => {
      if (it.variant.id === variantId) {
        const n = Math.max(1, it.quantity + delta);
        return { ...it, quantity: n };
      }
      return it;
    });
    updateActiveOrder({ cart: newCart });
  };

  // Calculations
  const subTotal = useMemo(
    () =>
      activeOrder.cart.reduce((s, i) => s + i.variant.price * i.quantity, 0),
    [activeOrder.cart],
  );

  const discountVal = useMemo(() => {
    if (activeOrder.discountType === "cash") return activeOrder.discountValue;
    return (subTotal * activeOrder.discountValue) / 100;
  }, [subTotal, activeOrder.discountValue, activeOrder.discountType]);

  const totalAmount = Math.max(
    0,
    subTotal - discountVal + activeOrder.shippingFee + activeOrder.surcharge,
  );

  // Dynamic Voucher Codes Handling
  const [typedPromoCode, setTypedPromoCode] = useState("");
  const [appliedPromoError, setAppliedPromoError] = useState("");
  const [appliedPromoSuccess, setAppliedPromoSuccess] = useState("");
  const [showPromoList, setShowPromoList] = useState(false);

  // Retrieve current active/valid promotion list
  const activePromoVouchers = useMemo(() => {
    const saved = localStorage.getItem("lark_pos_promotions");
    if (saved) {
      try {
        const list = JSON.parse(saved);
        const now = new Date();
        return list.filter(
          (p: any) =>
            p.isActive &&
            new Date(p.startDate) <= now &&
            new Date(p.endDate) >= now &&
            (!p.usageLimit || p.usageCount < p.usageLimit),
        );
      } catch (e) {
        return [];
      }
    }
    return [];
  }, [activeOrderId, showPromoList]);

  const applyPromoCode = (code: string) => {
    setAppliedPromoError("");
    setAppliedPromoSuccess("");

    const cleanedCode = code.trim().toUpperCase();
    if (!cleanedCode) return;

    const savedPromos = localStorage.getItem("lark_pos_promotions");
    let promos = [];
    if (savedPromos) {
      try {
        promos = JSON.parse(savedPromos);
      } catch (e) {}
    }

    const promo = promos.find((p: any) => p.code.toUpperCase() === cleanedCode);
    if (!promo) {
      setAppliedPromoError("Mã này không tồn tại trong hệ thống!");
      return;
    }

    if (!promo.isActive) {
      setAppliedPromoError("Mã này đã bị tạm ngừng hoạt động!");
      return;
    }

    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (now < start) {
      setAppliedPromoError(
        `Chương trình bắt đầu từ ${start.toLocaleDateString("vi-VN")}!`,
      );
      return;
    }
    if (now > end) {
      setAppliedPromoError("Mã giảm giá đã hết hiệu lực ứng dụng!");
      return;
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      setAppliedPromoError("Mã này đã dùng hết lượt phát hành!");
      return;
    }

    if (subTotal < promo.minOrderValue) {
      setAppliedPromoError(
        `Mua tối thiểu ${promo.minOrderValue.toLocaleString()}đ để dùng mã này!`,
      );
      return;
    }

    if (promo.targetCustomerType && promo.targetCustomerType !== "all") {
      const selectedCust = activeOrder.selectedCustomerId
        ? customers.find((c) => c.id === activeOrder.selectedCustomerId)
        : null;
      const custType = selectedCust ? selectedCust.type : "regular";
      if (custType !== promo.targetCustomerType) {
        setAppliedPromoError(
          `Voucher áp dụng riêng cho phân khúc khách ${promo.targetCustomerType === "vip" ? "VIP" : "Sỉ"}.`,
        );
        return;
      }
    }

    if (promo.type === "percentage") {
      let discVal = (subTotal * promo.value) / 100;
      if (promo.maxDiscount && discVal > promo.maxDiscount) {
        discVal = promo.maxDiscount;
      }
      updateActiveOrder({
        discountType: "cash",
        discountValue: discVal,
      });
      setAppliedPromoSuccess(
        `Áp dụng ${promo.code}: Giảm ${promo.value}% (-${discVal.toLocaleString()}đ)`,
      );
    } else if (promo.type === "fixed_amount") {
      const discVal = Math.min(subTotal, promo.value);
      updateActiveOrder({
        discountType: "cash",
        discountValue: discVal,
      });
      setAppliedPromoSuccess(
        `Áp dụng ${promo.code}: Giảm trực tiếp -${discVal.toLocaleString()}đ`,
      );
    } else if (promo.type === "free_shipping") {
      updateActiveOrder({
        shippingFee: 0,
        freeShipping: true,
      });
      setAppliedPromoSuccess(`Mã giảm phí bưu tá thành công!`);
    } else if (promo.type === "buy_x_get_y") {
      setAppliedPromoSuccess(
        `Áp dụng ${promo.code}: Mua X tặng Y (Tặng thêm ${promo.value} SP).`,
      );
    }
    setTypedPromoCode(cleanedCode);
  };

  // Tabs Management
  const addNewTab = () => {
    const newId = `order-${Date.now()}`;
    const newOrder = DEFAULT_ORDER_STATE(newId, `Đơn mới`);
    setOrders([...orders, newOrder]);
    setActiveOrderId(newId);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (orders.length === 1) return;
    const newOrders = orders.filter((o) => o.id !== id);
    setOrders(newOrders);
    if (activeOrderId === id) {
      setActiveOrderId(newOrders[newOrders.length - 1].id);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.variants.some((v) =>
            v.sku.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      .slice(0, 10);
  }, [products, searchTerm]);

  const handleBarcodeScanner = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm) {
      const termToLower = searchTerm.toLowerCase();
      for (const p of products) {
        for (const v of p.variants) {
          if (
            v.sku.toLowerCase() === termToLower ||
            p.sku.toLowerCase() === termToLower
          ) {
            handleAddVariantToCart(p, v);
            setSearchTerm("");
            return;
          }
        }
      }
      toast.error("Không tìm thấy sản phẩm có mã barcode/SKU này!");
    }
  };

  const handleSave = () => {
    if (activeOrder.cart.length === 0) {
      toast.error("Vui lòng thêm sản phẩm vào đơn hàng!");
      return;
    }

    const order: Order = {
      id: "DH-" + Date.now().toString().slice(-6),
      items: activeOrder.cart.map((i) => ({
        productId: i.product.id,
        variantId: i.variant.id,
        productName: i.product.name,
        variantName: i.variant.name,
        sku: i.variant.sku,
        price: i.variant.price,
        quantity: i.quantity,
      })),
      totalAmount: subTotal,
      discount: discountVal,
      shippingFee: activeOrder.shippingFee,
      surcharge: activeOrder.surcharge,
      tax: 0,
      finalAmount: totalAmount,
      paymentMethod: activeOrder.paymentMethod,
      status: "completed",
      createdAt: new Date().toISOString(),
      notes: activeOrder.notes,
      internalNotes: activeOrder.internalNotes,
      staffHandling: activeOrder.staffHandling,
      staffCaring: activeOrder.staffCaring,
      marketer: activeOrder.marketer,
      recipientName: activeOrder.recipientName || activeOrder.customerName,
      recipientPhone: activeOrder.recipientPhone || activeOrder.customerPhone,
      recipientAddress: activeOrder.recipientAddress,
      expectedDeliveryDate: activeOrder.expectedDeliveryDate,
      tags: activeOrder.tags,
    };

    onAddOrder(order);
    toast.success("Đã ghi nhận đơn hàng thành công!");
    // Close tab or reset
    if (orders.length > 1) {
      closeTab(activeOrderId, { stopPropagation: () => {} } as any);
    } else {
      setOrders([DEFAULT_ORDER_STATE("order-1", "Đơn mới (F6)")]);
    }
  };

  // Shortcut keyboard listener (F2: Save/Pay, F3: New tab)
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "F3") {
        e.preventDefault();
        addNewTab();
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [orders, activeOrderId, activeOrder]);

  return (
    <div className="flex flex-col h-screen bg-[#f1f3f5] overflow-hidden select-none font-sans text-slate-800">
      {/* 1. Header Tabs */}
      <div className="flex items-center px-4 bg-white border-b border-slate-200 h-12 shrink-0 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => setActiveOrderId(o.id)}
              className={`flex items-center gap-2 px-4 h-9 rounded-t-lg border-x border-t transition-all cursor-pointer text-[14px] font-bold whitespace-nowrap ${
                activeOrderId === o.id
                  ? "bg-[#f1f3f5] border-slate-200 text-blue-600"
                  : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span>{o.tabLabel}</span>
              {orders.length > 1 && (
                <X
                  size={14}
                  className="hover:text-red-500 rounded-full hover:bg-white/50 p-0.5"
                  onClick={(e) => closeTab(o.id, e)}
                />
              )}
            </div>
          ))}
          <button
            onClick={addNewTab}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <Monitor size={18} />
          <Maximize2 size={18} />
        </div>
      </div>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 overflow-y-auto p-3 flex gap-3 min-h-0">
        {/* LEFT COLUMN */}
        <div className="flex-[8] flex flex-col gap-3 min-w-0">
          {/* Section: Sản phẩm */}
          <div className="glass-card rounded-lg p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-bold text-[16px]">Sản phẩm</h4>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setIsProductMode(true)}
                    className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${isProductMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
                  >
                    Sản phẩm
                  </button>
                  <button
                    onClick={() => setIsProductMode(false)}
                    className={`px-3 py-1.5 text-[12px] font-bold rounded-md transition ${!isProductMode ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
                  >
                    Combo
                  </button>
                </div>
                <div className="relative group/channel">
                  <button className="flex items-center gap-2 bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 text-[14px] font-bold transition-all hover:bg-slate-200">
                    <span>Online</span>
                    <ChevronDown
                      size={14}
                      className="text-slate-500 group-hover/channel:rotate-180 transition-transform duration-200"
                    />
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 scale-95 pointer-events-none group-hover/channel:opacity-100 group-hover/channel:scale-100 group-hover/channel:pointer-events-auto transition-all duration-150 z-50">
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-bold text-blue-600 bg-blue-50">Online</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Offline (Tại quầy)</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Facebook</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Shopee</button>
                  </div>
                </div>
                <div className="relative group/source">
                  <button className="flex items-center gap-2 bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 text-[14px] font-bold transition-all hover:bg-slate-200">
                    <span>Chọn nguồn đơn</span>
                    <ChevronDown
                      size={14}
                      className="text-slate-500 group-hover/source:rotate-180 transition-transform duration-200"
                    />
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 scale-95 pointer-events-none group-hover/source:opacity-100 group-hover/source:scale-100 group-hover/source:pointer-events-auto transition-all duration-150 z-50">
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Nguồn tự nhiên</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Quảng cáo Facebook</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Người quen giới thiệu</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Livestream</button>
                  </div>
                </div>
                <div className="relative group/warehouse">
                  <button className="flex items-center gap-2 bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 text-[14px] font-bold transition-all hover:bg-slate-200">
                    <Box size={16} className="text-slate-500" />
                    <span>Kho mặc định</span>
                    <ChevronDown
                      size={14}
                      className="text-slate-500 group-hover/warehouse:rotate-180 transition-transform duration-200"
                    />
                  </button>
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 opacity-0 scale-95 pointer-events-none group-hover/warehouse:opacity-100 group-hover/warehouse:scale-100 group-hover/warehouse:pointer-events-auto transition-all duration-150 z-50">
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-bold text-blue-600 bg-blue-50">Kho mặc định</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Kho tổng Hà Nội</button>
                    <button className="w-full text-left px-3 py-1.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50">Kho chi nhánh HCM</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Nhập mã, tên sản phẩm hoặc Barcode"
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 text-[14px] font-medium focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleBarcodeScanner}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                  <div className="flex items-center gap-1 border-r border-slate-300 pr-2 mr-1">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span className="text-[11px]">Còn hàng</span>
                  </div>
                  <button
                    onClick={() =>
                      setIsBarcodeScannerMode(!isBarcodeScannerMode)
                    }
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${isBarcodeScannerMode ? "bg-blue-100 text-blue-600" : "text-slate-400 hover:bg-slate-200"}`}
                    title="Chế độ quét mã vạch liên tục"
                  >
                    <Scan size={16} />
                    <span className="text-[11px] font-bold">Quét mã vạch</span>
                  </button>
                  <span className="text-[11px] font-bold">(F9)</span>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                  {searchTerm && filteredProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
                    >
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          className="border-b border-slate-50 last:border-none"
                        >
                          {p.variants.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => {
                                handleAddVariantToCart(p, v);
                                setSearchTerm("");
                              }}
                              className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-[14px] transition"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image}
                                  className="w-8 h-8 rounded object-cover"
                                  alt=""
                                />
                                <div>
                                  <p className="font-bold">{p.name}</p>
                                  <p className="text-slate-500">
                                    {v.name} - SKU: {v.sku}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-blue-600">
                                  {v.price.toLocaleString()}đ
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  Còn: {v.available}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cart Table Placeholder / Content */}
            <div className="min-h-[200px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              {activeOrder.cart.length === 0 ? (
                <>
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-[16px] font-medium">Giỏ hàng trống</p>
                </>
              ) : (
                <div className="w-full h-full overflow-y-auto px-2">
                  <table className="w-full text-[14px] text-left">
                    <thead className="text-slate-500 border-b border-slate-200 bg-slate-100/50">
                      <tr>
                        <th className="py-2 px-3">Tên sản phẩm</th>
                        <th className="py-2 px-3">Số lượng</th>
                        <th className="py-2 px-3">Đơn giá</th>
                        <th className="py-2 px-3 text-right">Tổng</th>
                        <th className="py-2 px-3 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {activeOrder.cart.map((item) => (
                        <tr
                          key={item.variant.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-3 px-3">
                            <p className="font-bold">{item.product.name}</p>
                            <p className="text-slate-400 text-[11px]">
                              {item.variant.name}
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateCartQty(item.variant.id, -1)
                                }
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQty(item.variant.id, 1)
                                }
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {item.variant.price.toLocaleString()}đ
                          </td>
                          <td className="py-3 px-3 font-bold text-right">
                            {(
                              item.variant.price * item.quantity
                            ).toLocaleString()}
                            đ
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => removeCartItem(item.variant.id)}
                              className="text-slate-300 hover:text-red-500 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Section: Giá trị đơn hàng */}
            <div className="glass-card rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[16px]">Giá trị đơn hàng</h4>
                <MoreVertical size={16} className="text-slate-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-[12px] font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border ${activeOrder.freeShipping ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                      onClick={() =>
                        updateActiveOrder({
                          freeShipping: !activeOrder.freeShipping,
                        })
                      }
                    />
                    <span>Miễn phí giao hàng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border ${activeOrder.onlyChargeIfReturn ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}
                      onClick={() =>
                        updateActiveOrder({
                          onlyChargeIfReturn: !activeOrder.onlyChargeIfReturn,
                        })
                      }
                    />
                    <span>Chỉ thu phí nếu hoàn</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between text-[14px]">
                    <span className="text-slate-500 py-1 border-transparent border">
                      Giảm giá
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex bg-slate-100 rounded-lg overflow-hidden w-32 border border-slate-200">
                        <input
                          type="number"
                          className="w-full bg-transparent border-none text-right px-2 py-1 text-[14px] font-bold outline-none"
                          value={activeOrder.discountValue}
                          onChange={(e) =>
                            updateActiveOrder({
                              discountValue: Number(e.target.value),
                            })
                          }
                        />
                        <button
                          className="bg-slate-200 px-2 text-[11px] font-bold"
                          onClick={() =>
                            updateActiveOrder({
                              discountType:
                                activeOrder.discountType === "cash"
                                  ? "percent"
                                  : "cash",
                            })
                          }
                        >
                          {activeOrder.discountType === "cash" ? "đ" : "%"}
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            updateActiveOrder({
                              discountType: "percent",
                              discountValue: 5,
                            })
                          }
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 transition hover:bg-blue-100"
                        >
                          5%
                        </button>
                        <button
                          onClick={() =>
                            updateActiveOrder({
                              discountType: "percent",
                              discountValue: 10,
                            })
                          }
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 transition hover:bg-blue-100"
                        >
                          10%
                        </button>
                        <button
                          onClick={() =>
                            updateActiveOrder({
                              discountType: "percent",
                              discountValue: 15,
                            })
                          }
                          className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 transition hover:bg-blue-100"
                        >
                          15%
                        </button>
                        <button
                          onClick={() =>
                            updateActiveOrder({
                              discountType: "cash",
                              discountValue: 50000,
                            })
                          }
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 transition hover:bg-emerald-100"
                        >
                          -50k
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Promotions Voucher Selector */}
                  <div className="border-t border-dashed border-slate-200 pt-2 pb-1 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between text-slate-500 font-bold">
                      <span className="flex items-center gap-1">
                        <Tag size={12} className="text-indigo-500" />
                        <span>Mã khuyến mãi</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPromoList(!showPromoList)}
                        className="text-[9.5px] text-indigo-600 hover:underline font-extrabold flex items-center gap-0.5"
                      >
                        {showPromoList ? "Ẩn mã" : "Chọn nhanh mã"}
                      </button>
                    </div>

                    <div className="flex bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <input
                        type="text"
                        placeholder="Nhập mã voucher (vd: HE2026)..."
                        className="w-full bg-transparent border-none px-2 py-1 text-[14px] font-bold outline-none uppercase placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal"
                        value={typedPromoCode}
                        onChange={(e) => {
                          setTypedPromoCode(e.target.value);
                          setAppliedPromoError("");
                        }}
                      />
                      <button
                        type="button"
                        className="bg-indigo-600 text-white px-3 text-[11px] font-extrabold hover:bg-indigo-700 transition"
                        onClick={() => applyPromoCode(typedPromoCode)}
                      >
                        Áp dụng
                      </button>
                    </div>

                    {appliedPromoError && (
                      <p className="text-[9.5px] text-red-500 font-bold leading-normal">
                        ⚠️ {appliedPromoError}
                      </p>
                    )}
                    {appliedPromoSuccess && (
                      <div className="text-[9.5px] text-emerald-600 font-black leading-snug bg-emerald-50 border border-emerald-100 rounded-md p-1.5 flex items-center justify-between">
                        <span>✓ {appliedPromoSuccess}</span>
                        <button
                          className="hover:text-red-500 font-extrabold text-[12px] p-0.5 ml-1"
                          onClick={() => {
                            setAppliedPromoSuccess("");
                            setTypedPromoCode("");
                            updateActiveOrder({ discountValue: 0 });
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {showPromoList && (
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 space-y-2 max-h-36 overflow-y-auto scrollbar-thin">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-200">
                          Mã hợp lệ thời điểm này ({activePromoVouchers.length})
                        </span>
                        {activePromoVouchers.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic block">
                            Không có mã giảm giá nào đang diễn ra!
                          </span>
                        ) : (
                          activePromoVouchers.map((p: any) => {
                            const isEligible = subTotal >= p.minOrderValue;
                            return (
                              <div
                                key={p.id}
                                className={`p-1.5 rounded-md border text-[10.5px] cursor-pointer transition ${
                                  isEligible
                                    ? "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20"
                                    : "bg-slate-100/60 border-slate-150 opacity-70"
                                }`}
                                onClick={() => {
                                  if (isEligible) {
                                    applyPromoCode(p.code);
                                  } else {
                                    setAppliedPromoError(
                                      `Đơn hàng cần từ ${p.minOrderValue.toLocaleString()}đ để dùng mã "${p.code}"`,
                                    );
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between font-black">
                                  <span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded uppercase">
                                    {p.code}
                                  </span>
                                  <span className="text-slate-750">
                                    {p.type === "percentage"
                                      ? `-${p.value}%`
                                      : `-${Math.round(p.value / 1000)}k`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-2">
                                  {p.name}
                                </p>
                                <div className="text-[9px] text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-100 font-bold">
                                  <span>
                                    Đơn từ: {p.minOrderValue.toLocaleString()}đ
                                  </span>
                                  {!isEligible && (
                                    <span className="text-amber-600">
                                      Thiếu:{" "}
                                      {(
                                        p.minOrderValue - subTotal
                                      ).toLocaleString()}
                                      đ
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[14px] pt-1">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <div className="flex bg-slate-100 rounded-lg overflow-hidden w-32 border border-slate-200">
                      <input
                        type="number"
                        className="w-full bg-transparent border-none text-right px-2 py-1 text-[14px] font-bold outline-none"
                        value={activeOrder.shippingFee}
                        onChange={(e) =>
                          updateActiveOrder({
                            shippingFee: Number(e.target.value),
                          })
                        }
                      />
                      <span className="bg-slate-200 px-2 flex items-center text-[11px] font-bold">
                        đ
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-slate-500">Phụ thu</span>
                    <div className="flex bg-slate-100 rounded-lg overflow-hidden w-32 border border-slate-200">
                      <input
                        type="number"
                        className="w-full bg-transparent border-none text-right px-2 py-1 text-[14px] font-bold outline-none"
                        value={activeOrder.surcharge}
                        onChange={(e) =>
                          updateActiveOrder({
                            surcharge: Number(e.target.value),
                          })
                        }
                      />
                      <span className="bg-slate-200 px-2 flex items-center text-[11px] font-bold">
                        đ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-[14px]">
                    <span>Tổng số tiền</span>
                    <span className="font-bold">
                      {subTotal.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span>Giảm giá</span>
                    <span className="font-bold text-red-500">
                      {discountVal.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] pt-1 border-t border-dashed border-slate-200">
                    <span className="font-bold">Tiền cần thu</span>
                    <span className="font-bold text-green-600">
                      {totalAmount.toLocaleString()} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Thanh toán */}
            <div className="glass-card rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[16px]">Thanh toán</h4>
                <MoreVertical size={16} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-slate-500">Tiền chuyển khoản</span>
                  <div className="flex bg-slate-100 rounded-lg overflow-hidden w-40 border border-slate-200">
                    <input
                      type="number"
                      className="w-full bg-transparent border-none text-right px-2 py-1.5 text-[14px] font-bold outline-none"
                      value={activeOrder.paymentAmount || totalAmount}
                      onChange={(e) =>
                        updateActiveOrder({
                          paymentAmount: Number(e.target.value),
                        })
                      }
                    />
                    <span className="bg-slate-200 px-2 flex items-center text-[11px] font-bold">
                      đ
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  {[
                    { id: "bank_transfer", icon: QrCode, label: "CK" },
                    { id: "cash", icon: Coins, label: "TM" },
                    { id: "card", icon: CreditCard, label: "Thẻ" },
                    { id: "e_wallet", icon: Receipt, label: "Ví" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() =>
                        updateActiveOrder({ paymentMethod: m.id as any })
                      }
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${activeOrder.paymentMethod === m.id ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400"}`}
                    >
                      <m.icon size={16} />
                      <span className="text-[10px] font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section: Ghi chú */}
            <div className="glass-card rounded-lg p-4 space-y-4">
              <h4 className="font-bold text-[16px]">Ghi chú</h4>
              <div className="flex bg-slate-100 p-0.5 rounded-lg">
                <button className="flex-1 py-1.5 text-[12px] font-bold bg-white shadow-sm text-blue-600 rounded-md">
                  Nội bộ
                </button>
                <button className="flex-1 py-1.5 text-[12px] font-bold text-slate-500 rounded-md">
                  Để in
                </button>
              </div>
              <div className="space-y-3">
                <textarea
                  className="w-full h-24 bg-slate-100 rounded-lg p-3 text-[14px] font-medium border-none outline-none resize-none placeholder:text-slate-400"
                  placeholder="Viết ghi chú hoặc /shortcut để ghi chú nhanh"
                  value={activeOrder.internalNotes}
                  onChange={(e) =>
                    updateActiveOrder({ internalNotes: e.target.value })
                  }
                />
                <button className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition">
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-[4] flex flex-col gap-3 min-w-[320px]">
          {/* Section: Thông tin */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer">
              <h4 className="font-bold text-[16px]">Thông tin</h4>
              <ChevronUp size={16} className="text-slate-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500">Tạo lúc</span>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="font-bold">12:50 07/06/2026</span>
                  <Calendar size={14} className="text-slate-400" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500">NV xử lý</span>
                <div className="relative w-44">
                  <select
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[14px] font-bold appearance-none pr-8"
                    value={activeOrder.staffHandling}
                    onChange={(e) =>
                      updateActiveOrder({ staffHandling: e.target.value })
                    }
                  >
                    <option>Hùng Thái Nguyễn</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500">NV chăm sóc</span>
                <div className="relative w-44">
                  <select className="w-full bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[14px] font-bold appearance-none pr-8 italic text-slate-400">
                    <option>Chọn NV chăm sóc</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500">Marketer</span>
                <div className="relative w-44">
                  <select className="w-full bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[14px] font-bold appearance-none pr-8 italic text-slate-400">
                    <option>Chọn Marketer</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-[14px] font-bold border border-slate-200">
                Thêm thẻ
              </button>
            </div>
          </div>

          {/* Section: Khách hàng */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[16px]">Khách hàng</h4>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <select className="bg-slate-100 px-2 py-1 rounded-lg text-[11px] font-bold appearance-none pr-6">
                    <option>Giới tính</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
                <MoreVertical size={16} className="text-slate-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tên khách hàng"
                className="col-span-1 bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                value={activeOrder.customerName}
                onChange={(e) =>
                  updateActiveOrder({ customerName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="SĐT"
                className="col-span-1 bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                value={activeOrder.customerPhone}
                onChange={(e) =>
                  updateActiveOrder({ customerPhone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Địa chỉ email"
                className="col-span-1 bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                value={activeOrder.customerEmail}
                onChange={(e) =>
                  updateActiveOrder({ customerEmail: e.target.value })
                }
              />
              <div className="col-span-1 relative">
                <input
                  type="text"
                  placeholder="Ngày sinh"
                  className="w-full bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                  value={activeOrder.customerBirthday}
                  onChange={(e) =>
                    updateActiveOrder({ customerBirthday: e.target.value })
                  }
                />
                <Calendar
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section: Nhận hàng */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[16px]">Nhận hàng</h4>
              <div className="relative group">
                <select className="bg-slate-100 px-3 py-1.5 rounded-lg text-[14px] font-bold appearance-none pr-8">
                  <option>Chọn địa chỉ</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500 whitespace-nowrap">
                  Dự kiến nhận hàng
                </span>
                <div className="relative w-44">
                  <input
                    type="text"
                    placeholder="Chọn ngày"
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-[14px] font-bold appearance-none pr-8"
                    value={activeOrder.expectedDeliveryDate}
                    onChange={(e) =>
                      updateActiveOrder({
                        expectedDeliveryDate: e.target.value,
                      })
                    }
                  />
                  <Calendar
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tên người nhận"
                  className="col-span-1 bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                  value={activeOrder.recipientName}
                  onChange={(e) =>
                    updateActiveOrder({ recipientName: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  className="col-span-1 bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                  value={activeOrder.recipientPhone}
                  onChange={(e) =>
                    updateActiveOrder({ recipientPhone: e.target.value })
                  }
                />
              </div>
              <input
                type="text"
                placeholder="Địa chỉ chi tiết"
                className="w-full bg-slate-100 px-3 py-2 rounded-lg text-[14px] font-medium border-none outline-none"
                value={activeOrder.recipientAddress}
                onChange={(e) =>
                  updateActiveOrder({ recipientAddress: e.target.value })
                }
              />
              <div className="relative w-full">
                <select className="w-full bg-slate-100 px-4 py-2 rounded-lg text-[14px] font-bold appearance-none pr-10 text-slate-400">
                  <option>Chọn địa chỉ</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Vận chuyển (Stub) */}
          <div className="glass-card rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[16px]">Vận chuyển</h4>
              <div className="text-[11px] text-slate-400 font-bold px-2 py-1 rounded bg-slate-100 border border-slate-200">
                Đơn vị VC: <span>Y</span>
              </div>
            </div>
            <p className="text-[12px] text-slate-400 italic font-medium">
              Thông tin cấu hình vận chuyển...
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar Buttons */}
      <div className="h-16 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[14px] text-slate-400 font-medium">
              Tiền cần thu:
            </span>
            <span className="text-[20px] font-black text-slate-800">
              {totalAmount.toLocaleString()}{" "}
              <span className="text-[14px]">đ</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] text-slate-400 font-medium">COD:</span>
            <span className="text-[20px] font-black text-red-500">
              {totalAmount.toLocaleString()}{" "}
              <span className="text-[14px]">đ</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-[14px] font-extrabold border border-slate-200 hover:bg-slate-200 transition">
            <Printer size={16} />
            <span>In (F4)</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white text-[14px] font-extrabold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            <Save size={16} />
            <span>Lưu (F2)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
