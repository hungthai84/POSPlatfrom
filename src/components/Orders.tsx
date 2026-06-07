/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Trash2,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  Check,
  XCircle,
  Info
} from 'lucide-react';
import { Order, ShopConfig } from '../types';

interface OrdersProps {
  orders: Order[];
  config: ShopConfig;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export default function Orders({ orders, config, onUpdateOrderStatus }: OrdersProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer?.name || 'khach le').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer?.phone || '').includes(searchTerm);
      const matchStatus = selectedStatus === 'all' || o.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  // Export orders to CSV placeholder
  const handleExportCSV = () => {
    alert('Đang chuẩn bị xuất file danh sách hóa đơn POS (.CSV)...\nTính năng xuất dữ liệu báo cáo đã sẵn sàng!');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none" id="orders-mgmt-screen">
      
      {/* List Action Buttons Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Hồ Sơ Giao Dịch & Đơn Hàng</h2>
          <p className="text-xs text-slate-450">Quản lý hóa đơn xuất tại POS, trạng thái thanh toán và vận chuyển.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg shadow-2xs transition"
        >
          <FileSpreadsheet size={14} className="text-emerald-600" />
          <span>Xuất File Excel (.CSV)</span>
        </button>
      </div>

      {/* Searching row parameters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        {/* Search input field */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo Mã Đơn Hàn (e.g. DH-1002), Tên hoặc SĐT Khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white text-slate-755 font-medium transition"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Status selection slider */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-150 space-x-1">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'completed', label: 'Hoàn tất' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'pending', label: 'Chờ duyệt' },
            { id: 'canceled', label: 'Đã hủy' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition ${
                selectedStatus === st.id
                  ? 'bg-white text-slate-800 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table details block */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Table column spanning 2/3 weight */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4 font-semibold">Mã Đơn</th>
                  <th className="py-3 px-4 font-semibold">Khách hàng</th>
                  <th className="py-3 px-4 font-semibold">Ngày tạo</th>
                  <th className="py-3 px-4 font-semibold text-right">Tổng tiền</th>
                  <th className="py-3 px-4 font-semibold text-center">Hình thức</th>
                  <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      ❌ Không tìm thấy thông tin đơn hàng nào phù hợp!
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isActive = activeOrder?.id === ord.id;
                    return (
                      <tr
                        key={ord.id}
                        onClick={() => setActiveOrder(ord)}
                        className={`border-b border-slate-50 hover:bg-slate-50/60 cursor-pointer transition ${
                          isActive ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">{ord.id}</td>
                        <td className="py-4 px-4 font-medium text-slate-800">
                          <div className="font-bold">{ord.customer ? ord.customer.name : 'Khách vãng lai'}</div>
                          <div className="text-[10px] text-slate-400">{ord.customer ? ord.customer.phone : 'Khách mua lẻ'}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString('vi-VN')} {new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                          {formatCurrency(ord.finalAmount)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-[11px] font-semibold text-slate-700">
                            {ord.paymentMethod === 'cash' && '💵 Tiền mặt'}
                            {ord.paymentMethod === 'card' && '💳 Quẹt thẻ'}
                            {ord.paymentMethod === 'bank_transfer' && '🏦 Chuyển khoản'}
                            {ord.paymentMethod === 'e_wallet' && '📱 Ví điện tử'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            ord.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : ord.status === 'processing'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : ord.status === 'canceled'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-101'
                          }`}>
                            {ord.status === 'completed' && 'Hoàn tất'}
                            {ord.status === 'processing' && 'Đang xử lý'}
                            {ord.status === 'pending' && 'Chờ duyệt'}
                            {ord.status === 'canceled' && 'Đã hủy'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setActiveOrder(ord)}
                              className="p-1 px-2 border border-slate-200 hover:border-blue-600 bg-white text-slate-600 hover:text-blue-600 rounded text-[10px] font-semibold transition"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side Detail Drawer / Sticky detail pane (1/3 weight) */}
        <div className="col-span-1">
          {activeOrder ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4 sticky top-24 animate-fade-in-right">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">HÓA ĐƠN GIAO DỊCH</span>
                  <h3 className="font-extrabold text-slate-800 text-sm">{activeOrder.id}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  activeOrder.status === 'completed'
                    ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : activeOrder.status === 'canceled'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {activeOrder.status === 'completed' && 'Đã hoàn tất'}
                  {activeOrder.status === 'processing' && 'Đang làm'}
                  {activeOrder.status === 'pending' && 'Chờ duyệt'}
                  {activeOrder.status === 'canceled' && 'Hủy bỏ'}
                </span>
              </div>

              {/* Customer Metadata Card */}
              <div className="space-y-2.5 text-xs">
                <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Thông tin khách</p>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>Họ & Tên:</span>
                    <span>{activeOrder.customer ? activeOrder.customer.name : 'Khách mua trực tiếp (lẻ)'}</span>
                  </div>
                  {activeOrder.customer && (
                    <>
                      <div className="flex justify-between text-slate-500">
                        <span>Số điện thoại:</span>
                        <span>{activeOrder.customer.phone}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Hạng thành viên:</span>
                        <span className="capitalize font-bold text-blue-600">{activeOrder.customer.type}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Items Summary list */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Mặt hàng ({activeOrder.items.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {activeOrder.items.map((it) => (
                    <div key={it.variantId} className="flex justify-between items-center bg-slate-50/50 p-2 rounded border border-slate-100">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold text-slate-800 block truncate">{it.productName}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Mã: {it.sku}</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[10px] font-bold text-slate-800 block">x{it.quantity}</span>
                        <span className="text-[10px] font-black text-slate-900 block">{formatCurrency(it.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs Calculation breakdown */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tiền hàng khách mua:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(activeOrder.totalAmount)}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-red-650 font-semibold">
                    <span>Bớt chiết khấu:</span>
                    <span>-{formatCurrency(activeOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Thuế (VAT):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(activeOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-rose-600 pt-1.5 border-t border-dashed border-slate-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span>{formatCurrency(activeOrder.finalAmount)}</span>
                </div>
              </div>

              {/* Notes panel (optional) */}
              {activeOrder.notes && (
                <div className="p-3 bg-indigo-50/50 text-[11px] text-indigo-800 rounded border border-indigo-100/50">
                  <strong>Ghi chú đơn:</strong> {activeOrder.notes}
                </div>
              )}

              {/* Flow actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {activeOrder.status !== 'completed' && activeOrder.status !== 'canceled' && (
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(activeOrder.id, 'completed');
                      setActiveOrder({ ...activeOrder, status: 'completed' });
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition"
                  >
                    Xác nhận hoàn thành thanh toán
                  </button>
                )}
                {activeOrder.status !== 'canceled' && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Sẽ hồi phục số lượng có thể bán.')) {
                        onUpdateOrderStatus(activeOrder.id, 'canceled');
                        setActiveOrder({ ...activeOrder, status: 'canceled' });
                      }
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-lg transition border border-red-200"
                  >
                    Hủy bỏ giao dịch (Hoàn kho)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 p-10 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col items-center justify-center sticky top-24">
              <Info size={28} className="text-slate-300 stroke-1 mb-2" />
              <span>Hãy click vào một hóa đơn để xem toàn bộ thông tin chi tiết hóa đơn xuất.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
