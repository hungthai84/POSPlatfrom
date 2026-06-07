/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  UserPlus2,
  User,
  CreditCard,
  Coins,
  QrCode,
  Tag,
  Receipt,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  CircleCheck,
  Percent
} from 'lucide-react';
import { Product, Variant, Customer, CartItem, Order, ShopConfig } from '../types';

interface POSSalesProps {
  products: Product[];
  customers: Customer[];
  config: ShopConfig;
  onAddOrder: (order: Order) => void;
  onAddCustomer: (customer: Customer) => void;
}

export default function POSSales({
  products,
  customers,
  config,
  onAddOrder,
  onAddCustomer
}: POSSalesProps) {
  // POS States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'cash' | 'percent'>('cash');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'e_wallet'>('cash');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Customer Creator Modal State
  const [showAddCustomer, setShowAddCustomer] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustEmail, setNewCustEmail] = useState<string>('');
  const [newCustType, setNewCustType] = useState<'regular' | 'vip'>('regular');

  // Checkout Success Message
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(list)];
  }, [products]);

  // Selected customer model
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return p.isActive && matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart actions
  const handleAddVariantToCart = (product: Product, variant: Variant) => {
    if (variant.available <= 0) {
      alert(`Mẫu mã "${variant.name}" đã hết hàng có thể bán!`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.variant.id === variant.id
      );

      if (existingIndex > -1) {
        const item = prevCart[existingIndex];
        if (item.quantity >= variant.available) {
          alert(`Không thể thêm nhiều hơn số lượng có thể bán (${variant.available})!`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex] = { ...item, quantity: item.quantity + 1 };
        return updated;
      } else {
        return [...prevCart, { product, variant, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.variant.id === variantId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.variant.available) {
              alert(`Không thể vượt quá số lượng có thể bán!`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.variant.id !== variantId));
  };

  // Calculations
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'cash') {
      return Math.min(discountValue, totalAmount);
    } else {
      return Math.round((totalAmount * Math.min(discountValue, 100)) / 100);
    }
  }, [discountValue, discountType, totalAmount]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, totalAmount - discountAmount);
    return Math.round(taxable * config.taxRate);
  }, [totalAmount, discountAmount, config.taxRate]);

  const finalAmount = useMemo(() => {
    return Math.max(0, totalAmount - discountAmount + taxAmount);
  }, [totalAmount, discountAmount, taxAmount]);

  // Handle Create Customer
  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCust: Customer = {
      id: 'c-' + Date.now(),
      name: newCustName,
      phone: newCustPhone,
      ...(newCustEmail ? { email: newCustEmail } : {}),
      type: newCustType,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setShowAddCustomer(false);
    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustType('regular');
  };

  // Handle Checkout Order
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Vui lòng thêm sản phẩm vào đơn hàng để thanh toán!');
      return;
    }

    const orderId = 'DH-' + Math.floor(10000 + Math.random() * 90000);

    const newOrder: Order = {
      id: orderId,
      ...(selectedCustomer ? { customer: selectedCustomer } : {}),
      items: cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant.id,
        productName: item.product.name,
        variantName: item.variant.name,
        sku: item.variant.sku,
        price: item.variant.price,
        quantity: item.quantity
      })),
      totalAmount,
      discount: discountAmount,
      tax: taxAmount,
      finalAmount,
      paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
      notes
    };

    onAddOrder(newOrder);
    setSuccessOrder(newOrder);

    // Reset checkout states
    setCart([]);
    setSelectedCustomerId('');
    setDiscountValue(0);
    setNotes('');
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden select-none" id="pos-cashier-screen">
      
      {/* 1. LEFT SIDE: CATALOGUE AND FILTER (8/12 weight) */}
      <div className="col-span-1 xl:col-span-7 flex flex-col h-full overflow-hidden p-4 space-y-4">
        
        {/* Search and Category Filter Cards */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-xs space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Live Search Catalogue Filter */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm hàng nhanh bằng tên, mã SKU sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Quick Filter Info */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <SlidersHorizontal size={14} />
              <span>Lọc hàng hoạt động</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
                }`}
              >
                {cat === 'all' ? 'Tất cả danh mục' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-full">
              <ShoppingCart size={40} className="text-slate-300 stroke-1 mb-3" />
              <p className="text-slate-500 font-medium text-sm">Không tìm thấy sản phẩm nào phù hợp</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-blue-600 font-bold hover:underline"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-slate-200/60 p-3 hover:border-blue-300 transition duration-200 flex flex-col justify-between group shadow-2xs hover:shadow-xs"
                >
                  {/* Photo & Basic Details */}
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-slate-50 h-28 w-full group-hover:scale-[1.02] transition">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full"
                      />
                      <span className="absolute top-1.5 right-1.5 bg-slate-900/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-semibold">
                        {prod.sku}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">
                        {prod.category}
                      </span>
                      <h4 className="font-semibold text-slate-800 text-xs line-clamp-2 mt-0.5">
                        {prod.name}
                      </h4>
                    </div>
                  </div>

                  {/* Product variants grid */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-450 block font-medium">
                      Phân loại & Mẫu mã:
                    </span>
                    <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                      {prod.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleAddVariantToCart(prod, v)}
                          disabled={v.available <= 0}
                          className={`w-full flex items-center justify-between p-1.5 rounded-md text-[11px] text-left border transition ${
                            v.available <= 0
                              ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                              : 'border-slate-150 hover:bg-blue-50/50 hover:border-blue-200'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium text-slate-700 block truncate leading-tight">
                              {v.options.Mau ? `${v.options.Mau}` : ''}
                              {v.options.Size ? ` / Size ${v.options.Size}` : ''}
                              {!v.options.Mau && !v.options.Size ? 'Bản chuẩn (Default)' : ''}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              Tồn: <strong className={v.available > 0 ? 'text-emerald-600' : 'text-red-500'}>{v.available}</strong>
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 leading-tight shrink-0">
                            {formatCurrency(v.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. RIGHT SIDE: CART & CHECKOUT PAY (5/12 weight) */}
      <div className="col-span-1 xl:col-span-5 h-full bg-white border-l border-slate-200 flex flex-col justify-between shadow-lg">
        
        {/* Cart Header & Customer selector */}
        <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" />
              <span>Chi tiết đơn hàng đang chọn</span>
              {cart.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-slate-400 hover:text-red-500 text-[11px] font-semibold flex items-center gap-1 transition"
              >
                <Trash2 size={12} />
                <span>Xóa hết</span>
              </button>
            )}
          </div>

          {/* Customer selection interface row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                id="pos-customer-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:border-blue-500"
              >
                <option value="">Khách vãng lai (Lẻ)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.phone} {c.type === 'vip' ? '👑 VIP' : ''}
                  </option>
                ))}
              </select>
              <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 border-l border-t border-slate-400 w-1.5 h-1.5 rotate-135 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowAddCustomer(true)}
              className="p-2 border border-blue-100 hover:border-blue-500 hover:bg-blue-50 text-blue-600 rounded-lg transition shrink-0"
              title="Thêm nhanh khách hàng mới"
            >
              <UserPlus2 size={16} />
            </button>
          </div>

          {/* Selected Customer Loyalty Benefit Info Card */}
          {selectedCustomer && (
            <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50 flex justify-between items-center text-xs animate-fade-in">
              <div>
                <p className="font-semibold text-blue-900 leading-tight">
                  Khách hàng: {selectedCustomer.name}
                </p>
                <p className="text-[10px] text-blue-700 mt-0.5">
                  Hạng: <span className="uppercase font-bold">{selectedCustomer.type}</span> | Tổng tiền đã mua: {formatCurrency(selectedCustomer.totalSpent)}
                </p>
              </div>
              {selectedCustomer.type === 'vip' && (
                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <span>Giảm 5%</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cart Item Scrolling Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
              <ShoppingCart size={36} className="text-slate-300 stroke-1" />
              <p className="text-slate-400 text-xs font-semibold">Giỏ hàng rải rác - Hãy click chọn sản phẩm bên trái!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.variant.id}
                className="bg-white p-3 rounded-lg border border-slate-200/80 flex gap-2.5 justify-between shadow-2xs group hover:border-blue-200 transition"
              >
                {/* Product spec summary */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-400 font-mono block mb-0.5">
                    {item.variant.sku}
                  </span>
                  <h5 className="font-bold text-slate-800 text-xs truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Phân loại: {item.variant.name.split(' - ')[1] || 'Mặc định'}
                  </p>
                  <p className="font-bold text-slate-900 text-xs mt-1.5">
                    {formatCurrency(item.variant.price)}
                  </p>
                </div>

                {/* Operations & total cost */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => handleRemoveItem(item.variant.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition"
                    title="Xóa khỏi đơn"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Decrement quantity */}
                    <button
                      onClick={() => updateQuantity(item.variant.id, -1)}
                      className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center transition"
                    >
                      <Minus size={10} />
                    </button>

                    {/* Quantity Display */}
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>

                    {/* Increment quantity */}
                    <button
                      onClick={() => updateQuantity(item.variant.id, 1)}
                      className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded flex items-center justify-center transition"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Billing controls */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-4 shrink-0">
          
          {/* Quick values inputs (Discounts and Notes) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Tag size={10} />
                <span>Khấu trừ (Giảm giá)</span>
              </label>
              <div className="flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType(discountType === 'cash' ? 'percent' : 'cash');
                    setDiscountValue(0);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 px-2 text-[10px] font-extrabold text-slate-700 transition"
                >
                  {discountType === 'cash' ? config.currency : '%'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ghi chú</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition"
                placeholder="Thuộc tính thêm..."
              />
            </div>
          </div>

          {/* Cost items sheet breakdown */}
          <div className="space-y-2 text-xs py-2 border-y border-slate-50">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Tổng tiền hàng:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalAmount)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Percent size={11} />
                  Chiết khấu:
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 font-medium">
              <span>Thuế giá trị (VAT {config.taxRate * 100}%):</span>
              <span className="font-semibold text-slate-800">{formatCurrency(taxAmount)}</span>
            </div>

            <div className="flex justify-between text-sm pt-1 border-t border-dashed border-slate-100">
              <span className="font-bold text-slate-800">Khách phải trả (Cần thu):</span>
              <span className="font-black text-rose-600 text-base">{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          {/* Payment method Selector triggers */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Hình thức thanh toán
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'cash', label: 'Tiền mặt', icon: Coins },
                { id: 'card', label: 'Quẹt thẻ', icon: CreditCard },
                { id: 'bank_transfer', label: 'Chuyển khoản', icon: QrCode },
                { id: 'e_wallet', label: 'Ví điện tử', icon: Receipt }
              ].map((m) => {
                const MIcon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                      active
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-550'
                    }`}
                  >
                    <MIcon size={14} className="mb-1" />
                    <span className="text-[9px] truncate w-full">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main CTA Pay Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl text-center text-sm font-extrabold flex items-center justify-center gap-2 transition duration-200 ${
              cart.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:translate-y-0.5'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>XUẤT HÓA ĐƠN & THANH TOÁN ({formatCurrency(finalAmount)})</span>
          </button>
        </div>
      </div>

      {/* 3. MODAL: QUICK CUSTOMER ADD CREATOR */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-150 animate-zoom-in">
            <h4 className="font-bold text-slate-800 text-sm mb-4">
              Thêm nhanh khách hàng mới
            </h4>
            <form onSubmit={handleSubmitCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Anh Hoàng"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Số Điện Thoại (*)</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 0912..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Hạng Thành Viên</label>
                <select
                  value={newCustType}
                  onChange={(e) => setNewCustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="regular">Regular (Thường)</option>
                  <option value="vip">VIP (Chiết khấu 5%)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-lg transition shadow-sm"
                >
                  Thêm & Chọn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: SUCCESS CHECKOUT ORDER RECEIPT */}
      {successOrder && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-emerald-500 flex flex-col space-y-4 animate-zoom-in">
            <div className="flex flex-col items-center text-center space-y-2 border-b border-dashed border-slate-200 pb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CircleCheck size={28} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Thanh Toán Thành Công!</h4>
              <p className="text-[11px] text-slate-400 font-mono">ID Đơn: {successOrder.id}</p>
            </div>

            {/* Receipt Summary Details */}
            <div className="space-y-2.5 text-xs text-slate-600 flex-1">
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span className="font-semibold text-slate-950">
                  {successOrder.customer ? successOrder.customer.name : 'Khách lẻ vãng lai'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thời gian:</span>
                <span className="font-mono text-slate-800">
                  {new Date(successOrder.createdAt).toLocaleDateString('vi-VN')} {new Date(successOrder.createdAt).toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Hình thức:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {successOrder.paymentMethod === 'cash' ? '💵 Tiền mặt' : ''}
                  {successOrder.paymentMethod === 'card' ? '💳 Mạng thẻ' : ''}
                  {successOrder.paymentMethod === 'bank_transfer' ? '🏦 QR Chuyển khoản' : ''}
                  {successOrder.paymentMethod === 'e_wallet' ? '📱 Ví điện tử' : ''}
                </span>
              </div>

              {/* Items Table within bill */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wide">
                  Chi tiết mặt hàng
                </span>
                <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
                  {successOrder.items.map((it) => (
                    <div key={it.variantId} className="flex justify-between text-[11px] font-medium text-slate-700">
                      <span className="truncate max-w-[280px]">
                        {it.productName} ({it.variantName.split(' - ')[1] || 'Bản chuẩn'}) x{it.quantity}
                      </span>
                      <strong className="text-slate-900 shrink-0 select-none">
                        {formatCurrency(it.price * it.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost balance breakdown */}
              <div className="pt-2 border-t border-dashed border-slate-200 text-xs space-y-1 flex flex-col items-end">
                <div className="flex justify-between w-full text-[11px]">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(successOrder.totalAmount)}</span>
                </div>
                {successOrder.discount > 0 && (
                  <div className="flex justify-between w-full text-[11px] text-red-500 font-semibold">
                    <span>Khấu trừ giảm:</span>
                    <span>-{formatCurrency(successOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full text-[11px]">
                  <span>Thuế (VAT):</span>
                  <span className="font-bold text-slate-800">{formatCurrency(successOrder.tax)}</span>
                </div>
                <div className="flex justify-between w-full text-sm font-black text-rose-600 pt-1.5 border-t border-slate-100">
                  <span>Tổng thanh toán:</span>
                  <span>{formatCurrency(successOrder.finalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-lg transition shadow-sm hover:shadow active:scale-[0.99] select-none"
            >
              Tiếp tục bán đơn hàng mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
