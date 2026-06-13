import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Package,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { Combo, Product, ShopConfig, ComboItem, Variant } from '../types';

interface CombosProps {
  combos: Combo[];
  products: Product[];
  config: ShopConfig;
  onAddCombo?: (combo: Omit<Combo, 'id'>) => void;
  onDeleteCombo?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export default function Combos({ combos, products, config, onAddCombo, onDeleteCombo, onToggleStatus }: CombosProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Combo State
  const [newCombo, setNewCombo] = useState<{
    name: string;
    sku: string;
    price: number;
    description: string;
    items: ComboItem[];
  }>({
    name: '',
    sku: '',
    price: 0,
    description: '',
    items: []
  });

  // Product Selector State
  const [productSearch, setProductSearch] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  const filteredCombos = useMemo(() => {
    return combos.filter(cb => {
      const matchSearch = cb.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cb.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' ? cb.isActive : !cb.isActive);
      return matchSearch && matchStatus;
    });
  }, [combos, searchTerm, statusFilter]);

  const allVariants = useMemo(() => {
    const list: { product: Product; variant: Variant }[] = [];
    products.forEach(p => {
      p.variants.forEach(v => {
        list.push({ product: p, variant: v });
      });
    });
    return list;
  }, [products]);

  const filteredVariants = useMemo(() => {
    if (!productSearch) return [];
    return allVariants.filter(item => 
      item.product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      item.variant.sku.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5); // Limit for performance
  }, [allVariants, productSearch]);

  const addItem = (v: Variant) => {
    const existing = newCombo.items.find(i => i.variantId === v.id);
    if (existing) {
      setNewCombo({
        ...newCombo,
        items: newCombo.items.map(i => i.variantId === v.id ? { ...i, quantity: i.quantity + 1 } : i)
      });
    } else {
      setNewCombo({
        ...newCombo,
        items: [...newCombo.items, { productId: v.productId, variantId: v.id, quantity: 1 }]
      });
    }
    setProductSearch('');
  };

  const removeItem = (variantId: string) => {
    setNewCombo({
      ...newCombo,
      items: newCombo.items.filter(i => i.variantId !== variantId)
    });
  };

  const updateItemQuantity = (variantId: string, qty: number) => {
    if (qty < 1) return;
    setNewCombo({
      ...newCombo,
      items: newCombo.items.map(i => i.variantId === variantId ? { ...i, quantity: qty } : i)
    });
  };

  const originalPrice = useMemo(() => {
    return newCombo.items.reduce((sum, item) => {
      const variant = allVariants.find(av => av.variant.id === item.variantId)?.variant;
      return sum + (variant?.price || 0) * item.quantity;
    }, 0);
  }, [newCombo.items, allVariants]);

  const handleCreateDraft = () => {
    if (!newCombo.name || !newCombo.sku || newCombo.items.length === 0) return;
    onAddCombo?.({
      name: newCombo.name,
      sku: newCombo.sku,
      price: newCombo.price,
      originalPrice: originalPrice,
      description: newCombo.description,
      items: newCombo.items,
      isActive: true
    });
    setIsModalOpen(false);
    setNewCombo({ name: '', sku: '', price: 0, description: '', items: [] });
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Quản Lý Combo</h2>
          <p className="text-xs text-slate-500">Tạo các gói sản phẩm khuyến mãi để tăng giá trị đơn hàng.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-2xs transition"
        >
          <Plus size={14} />
          <span>Tạo Combo Mới</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên combo, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium transition"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Đã tạm dừng</option>
        </select>
      </div>

      {/* Combo List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCombos.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Package size={40} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-bold text-slate-400">Chưa có combo nào được tạo</p>
          </div>
        ) : (
          filteredCombos.map(cb => (
            <div key={cb.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-3xs overflow-hidden flex flex-col group hover:shadow-md transition">
              <div className="p-5 flex justify-between items-start gap-4 border-b border-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cb.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <h4 className="font-extrabold text-slate-800 text-sm">{cb.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-slate-400">
                    <Tag size={10} />
                    <span>{cb.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-600">{formatCurrency(cb.price)}</p>
                  <p className="text-[10px] text-slate-400 line-through">{formatCurrency(cb.originalPrice)}</p>
                </div>
              </div>

              <div className="p-4 flex-1 space-y-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sản phẩm đi kèm</p>
                  <div className="space-y-1">
                    {cb.items.map((item, idx) => {
                      const variant = allVariants.find(av => av.variant.id === item.variantId)?.variant;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">
                          <div className="flex items-center gap-2">
                            <Layers size={12} className="text-slate-400" />
                            <span className="truncate max-w-[200px]">{variant?.name || 'Sản phẩm lỗi'}</span>
                          </div>
                          <span className="font-black text-slate-800 shrink-0">x{item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {cb.description && (
                  <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                    <p className="text-[11px] text-blue-700/80 italic leading-relaxed">
                      "{cb.description}"
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggleStatus?.(cb.id)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border transition ${
                      cb.isActive 
                        ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                    }`}
                  >
                    {cb.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  </button>
                  <button 
                    onClick={() => onDeleteCombo?.(cb.id)}
                    className="text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-blue-600 text-[10px] font-black hover:underline">
                  <span>Chi tiết</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden slide-in-from-bottom-4 animate-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2 underline decoration-blue-500 decoration-2 underline-offset-4">
                <Plus size={18} className="text-blue-600" />
                Thiết Kế Combo Mới
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
              {/* Form Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên Combo</label>
                  <input 
                    type="text" 
                    value={newCombo.name}
                    onChange={(e) => setNewCombo({...newCombo, name: e.target.value})}
                    placeholder="VD: Combo Thời Trang Hè"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã Combo (SKU)</label>
                    <input 
                      type="text" 
                      value={newCombo.sku}
                      onChange={(e) => setNewCombo({...newCombo, sku: e.target.value.toUpperCase()})}
                      placeholder="CB-XXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono font-bold transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giá Combo</label>
                    <input 
                      type="number" 
                      value={newCombo.price}
                      onChange={(e) => setNewCombo({...newCombo, price: Number(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-black text-blue-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mô tả ngắn</label>
                  <textarea 
                    rows={2}
                    value={newCombo.description}
                    onChange={(e) => setNewCombo({...newCombo, description: e.target.value})}
                    placeholder="Những thông tin khách hàng cần biết..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium transition resize-none"
                  />
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-emerald-800">Cấu trúc giá trị</p>
                    <div className="flex items-center gap-4 text-[10px] text-emerald-600 font-medium">
                      <span>Tổng tiền hàng: <b>{formatCurrency(originalPrice)}</b></span>
                      <span>Giảm: <b className="text-emerald-700">{Math.max(0, 100 - (newCombo.price/originalPrice)*100).toFixed(0)}%</b></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chọn sản phẩm đi kèm</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Tìm SKU hoặc tên SP..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-medium transition"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  
                  {/* Dropdown Results */}
                  {filteredVariants.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                      {filteredVariants.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => addItem(item.variant)}
                          className="w-full p-3 flex items-center justify-between hover:bg- slate-50 text-left transition border-b border-slate-100 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.variant.name}</p>
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{item.variant.sku}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-slate-900">{formatCurrency(item.variant.price)}</p>
                            <p className={`text-[10px] font-bold ${item.variant.available > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                              Tồn: {item.variant.available}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Danh sách chọn ({newCombo.items.length})</label>
                  <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-2 min-h-[120px] max-h-[220px] overflow-y-auto space-y-2">
                    {newCombo.items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-6">
                        <Layers size={24} className="text-slate-200 mb-1" />
                        <p className="text-[10px] font-bold text-slate-300">Chưa chọn sản phẩm nào</p>
                      </div>
                    ) : (
                      newCombo.items.map((item, idx) => {
                        const variant = allVariants.find(av => av.variant.id === item.variantId)?.variant;
                        return (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-3xs flex items-center justify-between gap-3 group animate-in zoom-in-95">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">{variant?.name}</p>
                              <p className="text-[10px] font-black text-blue-600">{formatCurrency(variant?.price || 0)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-slate-100 rounded-lg px-1 py-0.5">
                                <button 
                                  onClick={() => updateItemQuantity(item.variantId, item.quantity - 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 font-bold"
                                >-</button>
                                <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                                <button 
                                  onClick={() => updateItemQuantity(item.variantId, item.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-800 font-bold"
                                >+</button>
                              </div>
                              <button 
                                onClick={() => removeItem(item.variantId)}
                                className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition shadow-xs"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreateDraft}
                disabled={!newCombo.name || !newCombo.sku || newCombo.items.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                Hoàn tất & Kích hoạt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
