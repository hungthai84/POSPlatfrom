/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  PlaySquare,
  Search,
  Filter,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Info,
  Check,
  XCircle,
  FileDown,
  FileUp,
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Product, Variant, ShopConfig } from '../types';

interface ProductsProps {
  products: Product[];
  config: ShopConfig;
  onAddProduct: (product: Product) => void;
  onUpdateProductStatus: (productId: string, isActive: boolean) => void;
  onDeleteProduct: (productId: string) => void;
}

export default function Products({
  products,
  config,
  onAddProduct,
  onUpdateProductStatus,
  onDeleteProduct
}: ProductsProps) {
  // Tabs: "Sản phẩm" (Products summary group) vs "Mẫu mã" (Flat list of all variants/spec SKU)
  const [activeTab, setActiveTab] = useState<'products' | 'variants'>('products');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Expose list expanded state
  const [expandedProductIds, setExpandedProductIds] = useState<{ [key: string]: boolean }>({});

  // Add Product Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdSku, setNewProdSku] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('Thời trang');
  const [newProdImg, setNewProdImg] = useState<string>('');
  const [newProdDesc, setNewProdDesc] = useState<string>('');
  const [newProdVideo, setNewProdVideo] = useState<string>('');

  // Variants generation builder helper in modal form
  const [newVariants, setNewVariants] = useState<
    Array<{ mau: string; size: string; stock: number; price: number; importPrice: number }>
  >([{ mau: '', size: '', stock: 10, price: 150000, importPrice: 80000 }]);

  // Filter Categories
  const categoriesList = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Expansion actions
  const toggleProductExpand = (id: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddVariantRow = () => {
    setNewVariants((prev) => [
      ...prev,
      { mau: '', size: '', stock: 10, price: 150000, importPrice: 80000 }
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (newVariants.length === 1) return;
    setNewVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateVariantField = (index: number, field: string, value: any) => {
    setNewVariants((prev) =>
      prev.map((v, idx) => (idx === index ? { ...v, [field]: value } : v))
    );
  };

  // Submit product creation
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) {
      alert('Vui lòng điền tên và mã SKU sản phẩm gốc!');
      return;
    }

    const productId = 'p-' + Date.now();
    
    // Construct real typed Variants nested array
    const compiledVariants: Variant[] = newVariants.map((v, index) => {
      const vSku = `${newProdSku}-${v.mau || 'DEF'}-${v.size || 'STD'}-${index}`.toUpperCase();
      let vName = `${newProdName}`;
      if (v.mau || v.size) {
        vName += ` - ${v.mau || ''} ${v.size ? '/ ' + v.size : ''}`;
      }
      return {
        id: `v-${Date.now()}-${index}`,
        sku: vSku,
        name: vName,
        productId,
        price: Number(v.price),
        importPrice: Number(v.importPrice),
        stock: Number(v.stock),
        available: Number(v.stock),
        shipping: 0,
        options: {
          ...(v.mau ? { Mau: v.mau } : {}),
          ...(v.size ? { Size: v.size } : {})
        }
      };
    });

    // Compile product sums
    const totalImport = compiledVariants.reduce((s, v) => s + v.stock, 0);
    const totalAvailable = compiledVariants.reduce((s, v) => s + v.available, 0);

    const newProduct: Product = {
      id: productId,
      sku: newProdSku.toUpperCase(),
      name: newProdName,
      category: newProdCategory,
      image: newProdImg || 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200',
      ...(newProdVideo ? { videoUrl: newProdVideo } : {}),
      ...(newProdDesc ? { description: newProdDesc } : {}),
      isActive: true,
      variants: compiledVariants,
      totalImport,
      totalAvailable,
      totalShipping: 0
    };

    onAddProduct(newProduct);
    setShowAddModal(false);

    // Reset Form
    setNewProdName('');
    setNewProdSku('');
    setNewProdCategory('Thời trang');
    setNewProdImg('');
    setNewProdDesc('');
    setNewProdVideo('');
    setNewVariants([{ mau: '', size: '', stock: 10, price: 150000, importPrice: 80000 }]);
  };

  // Search filter
  const processedProducts = useMemo(() => {
    return products.filter((p) => {
      const query = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [products, searchTerm]);

  // All flat individual variations for Tab "Mẫu mã"
  const flatVariants = useMemo(() => {
    const list: Array<{ product: Product; variant: Variant }> = [];
    products.forEach((prod) => {
      prod.variants.forEach((v) => {
        const query = searchTerm.toLowerCase();
        if (
          v.name.toLowerCase().includes(query) ||
          v.sku.toLowerCase().includes(query) ||
          prod.sku.toLowerCase().includes(query)
        ) {
          list.push({ product: prod, variant: v });
        }
      });
    });
    return list;
  }, [products, searchTerm]);

  // Bottom stats calculations
  const totalProductsCount = processedProducts.length;
  const totalAvailableStock = processedProducts.reduce((s, p) => s + p.totalAvailable, 0);
  const totalPotentialValue = processedProducts.reduce((sum, p) => {
    return sum + p.variants.reduce((vSum, v) => vSum + (v.price * v.available), 0);
  }, 0);
  
  const totalImportCostValue = processedProducts.reduce((sum, p) => {
    return sum + p.variants.reduce((vSum, v) => vSum + (v.importPrice * v.stock), 0);
  }, 0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none" id="products-catalogue-page">
      
      {/* 1. Sub-Header tabs and upper actions matching Pancakepos image */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle products vs flat variants buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-lg border border-slate-100">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('variants')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition ${
              activeTab === 'variants'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Mẫu mã
          </button>
        </div>

        {/* Action icons like FB sync, in, xuat, nhap, tao san pham */}
        <div className="flex items-center gap-2">
          {/* Print Barcode */}
          <button
            onClick={() => alert('Đang in tem mã vạch barcode cho hàng hóa...')}
            className="p-2 border border-slate-200 rounded-lg hover:border-slate-400 bg-white text-slate-550 transition"
            title="In mã vạch tem"
          >
            <Printer size={16} />
          </button>
          
          {/* Export & Import excel catalog placeholder */}
          <button
            onClick={() => alert('Bắt đầu xử lý nạp danh mục hàng xuất khẩu...')}
            className="flex items-center gap-1.5 p-2 px-3 border border-slate-200 rounded-lg text-slate-705 font-bold hover:bg-slate-50 text-xs bg-white transition"
          >
            <FileDown size={14} className="text-blue-650" />
            <span>Xuất file</span>
          </button>
          
          <button
            onClick={() => alert('Mở bảng nhập catalog sản phẩm bằng excel file (.XLSX)...')}
            className="flex items-center gap-1.5 p-2 px-3 border border-slate-200 rounded-lg text-slate-705 font-bold hover:bg-slate-50 text-xs bg-white transition"
          >
            <FileUp size={14} className="text-blue-650" />
            <span>Nhập file</span>
          </button>

          {/* Create Product Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={16} />
            <span>Tạo sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 2. Sync indicator alert bar from Pancake POS */}
      <div className="bg-blue-50/70 border border-blue-100 text-blue-800 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs animate-fade-in animate-pulse-slow">
        <div className="flex items-center gap-2">
          <AlertCircle size={15} className="text-blue-600 shrink-0" />
          <span className="font-medium text-blue-900 leading-normal">
            Bạn có thể đồng bộ sản phẩm lên <strong>Facebook Catalog</strong> để gửi sản phẩm đến khách hàng nhanh chóng. Nhấn vào nút <strong>Đồng bộ trang Facebook</strong> để bắt đầu.
          </span>
        </div>
        <button
          onClick={() => alert('Đã chuyển hướng liên kết tích hợp Pancakes API Facebook Shop sync...')}
          className="text-blue-600 font-extrabold hover:underline whitespace-nowrap shrink-0 text-[11px]"
        >
          Tìm hiểu thêm hệ thống &gt;
        </button>
      </div>

      {/* Search catalogue filtering */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm mã SP (e.g. 000002), Tên sản phẩm, Tên mẫu mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchTerm('')}
            className="p-2 px-3 border border-slate-250 text-slate-600 font-bold hover:bg-slate-50 rounded-lg text-xs flex items-center gap-1 bg-white"
          >
            <RefreshCw size={12} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 3. TABLE BLOCK: DEPENDS ON ACTIVE TAB */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-3xs">
        {activeTab === 'products' ? (
          /* TAB 1: PRODUCT ROWS TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4 w-10">Mở</th>
                  <th className="py-3 px-4">Mã SP</th>
                  <th className="py-3 px-4">Tên sản phẩm</th>
                  <th className="py-3 px-4 text-center">Hình ảnh</th>
                  <th className="py-3 px-4">Danh mục</th>
                  <th className="py-3 px-4 text-center">Số mẫu mã</th>
                  <th className="py-3 px-4 text-center">Video</th>
                  <th className="py-3 px-4 text-right">Tổng nhập</th>
                  <th className="py-3 px-4 text-right">Có thể bán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400 font-semibold">
                      ❌ Không có sản phẩm nào khớp bộ tìm lọc hàng hóa!
                    </td>
                  </tr>
                ) : (
                  processedProducts.map((prod) => {
                    const isExpanded = !!expandedProductIds[prod.id];
                    return (
                      <React.Fragment key={prod.id}>
                        {/* Parent product summary row */}
                        <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition duration-150">
                          {/* Expanded icon toggler */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => toggleProductExpand(prod.id)}
                              className="p-1 rounded bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                            >
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </td>

                          {/* Code product spec */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {prod.sku}
                          </td>

                          {/* Dynamic Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            {prod.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                {prod.description}
                              </div>
                            )}
                          </td>

                          {/* Small thumbnail preview */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-9 h-9 rounded bg-slate-50 border border-slate-150 overflow-hidden mx-auto flex items-center justify-center text-slate-400">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  referrerPolicy="no-referrer"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <ImageIcon size={14} />
                              )}
                            </div>
                          </td>

                          {/* Category label */}
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            {prod.category}
                          </td>

                          {/* Variants count badge */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                            {prod.variants.length}
                          </td>

                          {/* Video attachment indicators */}
                          <td className="py-3.5 px-4 text-center text-slate-400">
                            {prod.videoUrl ? (
                              <a
                                href={prod.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:text-blue-700 transition inline-block"
                                title="Xem video gắn kết"
                              >
                                <PlaySquare size={16} />
                              </a>
                            ) : (
                              <Video size={14} className="opacity-40 mx-auto" />
                            )}
                          </td>

                          {/* Total imports stock value */}
                          <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                            {prod.totalImport}
                          </td>

                          {/* Tồn kho có thể bán */}
                          <td className="py-3.5 px-4 text-right">
                            <span className={`font-extrabold ${prod.totalAvailable > 0 ? 'text-slate-850' : 'text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded'}`}>
                              {prod.totalAvailable}
                            </span>
                          </td>

                          {/* Active / Inactive switch status exactly like Pancakes screenshot */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onUpdateProductStatus(prod.id, !prod.isActive)}
                              className="focus:outline-none transition-colors"
                              title="Ấn để bật tắt trạng thái trưng bày ngoài quầy"
                            >
                              {prod.isActive ? (
                                <ToggleRight size={32} className="text-blue-600 cursor-pointer" />
                              ) : (
                                <ToggleLeft size={32} className="text-slate-300 cursor-pointer" />
                              )}
                            </button>
                          </td>

                          {/* Operations actions */}
                          <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn chắc chắn muốn xóa sản phẩm ${prod.name}? Các dữ liệu giao dịch cũ vẫn tồn tại.`)) {
                                  onDeleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>

                        {/* Expandable nested table of item spec variations */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={11} className="py-3 px-6 border-b border-slate-100">
                              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden max-w-4xl shadow-inner animate-fade-in">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                                      <th className="py-2 px-3">Mã SKU Mẫu</th>
                                      <th className="py-2 px-3">Tên mẫu mã phân loại</th>
                                      <th className="py-2 px-3 text-right">Giá nhập</th>
                                      <th className="py-2 px-3 text-right">Giá bán đề xuất</th>
                                      <th className="py-2 px-3 text-right">Tổng tồn</th>
                                      <th className="py-2 px-3 text-right">Có thể bán</th>
                                      <th className="py-2 px-3 text-right">Chờ vận chuyển</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {prod.variants.map((v) => (
                                      <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                                        <td className="py-2 px-3 font-mono font-bold text-slate-600">{v.sku}</td>
                                        <td className="py-2 px-3 font-bold text-slate-800">
                                          {v.options.Mau ? `Màu: ${v.options.Mau}` : ''}
                                          {v.options.Size ? ` / Size ${v.options.Size}` : ''}
                                          {!v.options.Mau && !v.options.Size && 'Bản chuẩn sản phẩm'}
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium text-slate-500">
                                          {formatCurrency(v.importPrice)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-extrabold text-blue-650">
                                          {formatCurrency(v.price)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-bold text-slate-800">{v.stock}</td>
                                        <td className="py-2 px-3 text-right">
                                          <strong className={v.available > 0 ? 'text-emerald-600 font-extrabold' : 'text-red-500'}>
                                            {v.available}
                                          </strong>
                                        </td>
                                        <td className="py-2 px-3 text-right text-slate-500">{v.shipping}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TAB 2: FLAT VARIANT SKU DETAILED VIEW */
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs text-slate-650">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4">Hình ảnh</th>
                  <th className="py-3 px-4">Tên mẫu phân loại</th>
                  <th className="py-3 px-4">Sản phẩm gốc</th>
                  <th className="py-3 px-4 text-right">Giá nhập</th>
                  <th className="py-3 px-4 text-right">Giá bán</th>
                  <th className="py-3 px-4 text-right">Tồn kho gốc</th>
                  <th className="py-3 px-4 text-right">Có thể bán</th>
                  <th className="py-3 px-4 text-right">Chờ giao</th>
                </tr>
              </thead>
              <tbody>
                {flatVariants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold animate-pulse">
                      ❌ Không có tệp mẫu mã nào khớp với nội dung tìm kiếm!
                    </td>
                  </tr>
                ) : (
                  flatVariants.map(({ product, variant }) => (
                    <tr key={variant.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition duration-100">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{variant.sku}</td>
                      <td className="py-3.5 px-4">
                        <img
                          src={product.image}
                          alt={variant.name}
                          className="w-8 h-8 rounded border object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{variant.name}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-500">{product.name}</td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-400">
                        {formatCurrency(variant.importPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-blue-600">
                        {formatCurrency(variant.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">{variant.stock}</td>
                      <td className="py-3.5 px-4 text-right">
                        <strong className={variant.available > 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {variant.available}
                        </strong>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{variant.shipping}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. FOOTER TABLE STATS SUMMARY MATCHING THE SCREENSHOT EXACTLY */}
        <div className="bg-slate-50/90 border-t border-slate-100 p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-650">
            <span>
              Mặt hàng hiển thị: <strong className="text-blue-600 font-black">{totalProductsCount}</strong>
            </span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block" />
            <span>
              Tổng số lượng có thể bán: <strong className="text-emerald-600 font-black">{totalAvailableStock}</strong>
            </span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden lg:block" />
            <span>
              Tổng giá trị vốn đầu tư: <span className="text-amber-700 font-bold">{formatCurrency(totalImportCostValue)}</span>
            </span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden xl:block" />
            <span>
              Tổng giá trị bán lẻ dự tính: <span className="text-red-500 font-black">{formatCurrency(totalPotentialValue)}</span>
            </span>
          </div>

          {/* Simple Pagination items */}
          <div className="flex items-center gap-1.5 text-xs">
            <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="w-7 h-7 bg-blue-600 text-white font-extrabold rounded flex items-center justify-center">
              1
            </button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-400 cursor-not-allowed text-xs">
              &gt;
            </button>
            <span className="text-slate-400 font-medium ml-2">30 / trang</span>
          </div>
        </div>
      </div>

      {/* 5. MODAL: DETAILED NEW PRODUCT MAKER WITH VARIANTS SPEC DESIGN */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-zoom-in max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm">
                Thêm sản phẩm mới và phân loại bán lẻ
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tên sản phẩm (*)</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Áo sơ mi Lark Cotton"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mã SP Gốc (SKU Gốc) (*)</label>
                  <input
                    type="text"
                    required
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 placeholder:font-mono font-mono"
                    placeholder="e.g. LARK-01"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Ngành hàng / Danh mục</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Thời trang">Thời trang</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Gia dụng">Gia dụng</option>
                    <option value="Điện tử">Điện tử</option>
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Ảnh Link minh hoạ (URL)</label>
                  <input
                    type="text"
                    value={newProdImg}
                    onChange={(e) => setNewProdImg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. https://images.unsplash..."
                  />
                </div>
              </div>

              {/* Description & Video */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Mô tả ngắn gọn</label>
                  <textarea
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="Mô tả chất liệu, tính năng..."
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Gắn link Video review (URL)</label>
                  <input
                    type="text"
                    value={newProdVideo}
                    onChange={(e) => setNewProdVideo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. https://www.w3schools.com..."
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Hỗ trợ các link video định dạng mp4.</span>
                </div>
              </div>

              {/* Dynamic Variants Setup */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-650 uppercase tracking-wider block">
                    Danh sách các Mẫu mã, Phân loại SKU bổ sung
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Plus size={14} />
                    <span>Thêm phân loại</span>
                  </button>
                </div>

                {/* Sub-Rows table spec config */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {newVariants.map((v, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-55 bg-slate-50 border border-slate-200 p-2.5 rounded-lg shadow-3xs">
                      {/* Color Option */}
                      <input
                        type="text"
                        placeholder="Màu (Đỏ, Trắng...)"
                        value={v.mau}
                        onChange={(e) => handleUpdateVariantField(index, 'mau', e.target.value)}
                        className="w-1/4 bg-white border border-slate-150 rounded px-2 py-1 text-xs focus:outline-none"
                      />

                      {/* Size Option */}
                      <input
                        type="text"
                        placeholder="Size (M, L...)"
                        value={v.size}
                        onChange={(e) => handleUpdateVariantField(index, 'size', e.target.value)}
                        className="w-1/5 bg-white border border-slate-150 rounded px-2 py-1 text-xs focus:outline-none"
                      />

                      {/* Import Cost Price */}
                      <div className="w-1/4 flex bg-white border border-slate-150 rounded items-center overflow-hidden">
                        <input
                          type="number"
                          placeholder="Giá nhập"
                          value={v.importPrice}
                          onChange={(e) => handleUpdateVariantField(index, 'importPrice', e.target.value)}
                          className="w-full px-2 py-1 text-xs focus:outline-none"
                        />
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-1 select-none">đ</span>
                      </div>

                      {/* Retail Price */}
                      <div className="w-1/4 flex bg-white border border-slate-150 rounded items-center overflow-hidden">
                        <input
                          type="number"
                          placeholder="Giá bán"
                          value={v.price}
                          onChange={(e) => handleUpdateVariantField(index, 'price', e.target.value)}
                          className="w-full px-2 py-1 text-xs focus:outline-none"
                        />
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-1 select-none">đ</span>
                      </div>

                      {/* Initial Stock */}
                      <input
                        type="number"
                        placeholder="Tổn kho"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariantField(index, 'stock', e.target.value)}
                        className="w-20 bg-white border border-slate-150 rounded px-2 py-1 text-xs focus:outline-none"
                      />

                      {/* Delete spec row button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(index)}
                        disabled={newVariants.length === 1}
                        className={`p-1.5 text-slate-350 hover:text-red-600 transition hover:bg-slate-100 rounded shrink-0 ${
                          newVariants.length === 1 ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form operations */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs px-4 py-2.5 rounded-lg transition"
                >
                  Hủy thao tác
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg transition shadow-sm"
                >
                  Xác nhận lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
