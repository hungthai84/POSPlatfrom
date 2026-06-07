/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users2,
  Search,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Crown,
  History,
  ShoppingBag,
  Grid
} from 'lucide-react';
import { Customer, ShopConfig } from '../types';

interface CustomersProps {
  customers: Customer[];
  config: ShopConfig;
  onAddCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export default function Customers({
  customers,
  config,
  onAddCustomer,
  onDeleteCustomer
}: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Customer Creator Form Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [type, setType] = useState<'regular' | 'vip' | 'wholesale'>('regular');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  // High-level statistics counts
  const vipCount = useMemo(() => customers.filter((c) => c.type === 'vip').length, [customers]);
  const regularCount = useMemo(() => customers.filter((c) => c.type === 'regular').length, [customers]);
  const wholesaleCount = useMemo(() => customers.filter((c) => c.type === 'wholesale').length, [customers]);

  // Filtered customer listing
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'all' || c.type === selectedType;
      return matchSearch && matchType;
    });
  }, [customers, searchTerm, selectedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCust: Customer = {
      id: 'c-' + Date.now(),
      name,
      phone,
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
      type,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCust);
    setShowModal(false);

    // Reset fields
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setType('regular');
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none" id="customers-page">
      
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Hồ Sơ Khách Hàng & Thành Viên</h2>
          <p className="text-xs text-slate-450">Quản lý hạng mức thành viên, lịch sử chi tiêu tại quầy POS.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
        >
          <Plus size={16} />
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* KPI Counters boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI VIP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Crown size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Hội viên VIP</span>
            <span className="text-base font-black text-slate-800">{vipCount} người</span>
          </div>
        </div>

        {/* KPI Regular */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users2 size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Hội viên Thường</span>
            <span className="text-base font-black text-slate-800">{regularCount} người</span>
          </div>
        </div>

        {/* KPI Wholesale */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Mối mua sỉ (Đại lý)</span>
            <span className="text-base font-black text-slate-800">{wholesaleCount} đơn vị</span>
          </div>
        </div>
      </div>

      {/* Filtering area */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo Tên khách, Số điện thoại hoặc Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-705 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Type Selector slider */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-150 space-x-1 shrink-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'regular', label: 'Khách thường' },
            { id: 'vip', label: 'Thành viên VIP' },
            { id: 'wholesale', label: 'Mua sỉ' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedType(st.id)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded transition ${
                selectedType === st.id
                  ? 'bg-white text-slate-800 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid splits list */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Customer listing table (2/3 weight) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto font-medium">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4">Tên khách hàng</th>
                  <th className="py-3 px-4">Sơ đồ / SĐT</th>
                  <th className="py-3 px-4">Email / Hộp thư</th>
                  <th className="py-3 px-4 text-center">Hạng mức</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                  <th className="py-3 px-4 text-center">Số đơn mua</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold select-none">
                      ❌ Không có thông tin khách hàng nào phù hợp!
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isActive = activeCustomer?.id === cust.id;
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => setActiveCustomer(cust)}
                        className={`border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition ${
                          isActive ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {cust.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-650 font-mono">
                          {cust.phone}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {cust.email || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cust.type === 'vip'
                              ? 'bg-amber-55 bg-amber-50 text-amber-700 font-mono border border-amber-100'
                              : cust.type === 'wholesale'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {cust.type === 'vip' ? '👑 VIP' : ''}
                            {cust.type === 'wholesale' ? '💼 Đại lý' : ''}
                            {cust.type === 'regular' ? 'Thường' : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-850">
                          {formatCurrency(cust.totalSpent)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {cust.orderCount}
                        </td>
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa khách hàng ${cust.name} khỏi cơ sở dữ liệu phân tích?`)) {
                                onDeleteCustomer(cust.id);
                                if (activeCustomer?.id === cust.id) {
                                  setActiveCustomer(null);
                                }
                              }
                            }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded transition hover:bg-red-50/50 inline-block"
                            title="Xóa thành viên"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side Detailed summary profile card (1/3 weight) */}
        <div className="col-span-1">
          {activeCustomer ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-5 sticky top-24 animate-fade-in-right font-medium">
              <div className="text-center pb-4 border-b border-slate-100 flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black ${
                  activeCustomer.type === 'vip'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-blue-600'
                }`}>
                  {activeCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{activeCustomer.name}</h3>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono mt-0.5 block">ID: {activeCustomer.id}</span>
                </div>
              </div>

              {/* General details contact */}
              <div className="space-y-3 text-xs text-slate-650">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span>SĐT liên hệ: <strong className="text-slate-800 font-mono">{activeCustomer.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">Email: <strong className="text-slate-800">{activeCustomer.email || '—'}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">Địa chỉ giao nhận: <strong className="text-slate-800">{activeCustomer.address || '—'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>Gia nhập: <strong className="text-slate-850 font-mono">{new Date(activeCustomer.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                </div>
              </div>

              {/* Transactions stats breakdown */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50/75 border border-slate-100 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Số lần mua tại POS</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">{activeCustomer.orderCount} lần</span>
                </div>
                <div className="p-3 bg-slate-50/75 border border-slate-100 rounded-lg text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Tổng số hóa đơn</span>
                  <span className="text-base font-black text-emerald-800 mt-1 block">{formatCurrency(activeCustomer.totalSpent)}</span>
                </div>
              </div>

              {/* Customer quick recommendation context alert */}
              <div className="p-3 bg-blue-50/40 text-[11px] text-blue-800 rounded border border-blue-100/40 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <History size={13} className="text-blue-600 shrink-0" />
                  <span>Mối mua sắm định đám</span>
                </div>
                <p className="text-blue-700 leading-relaxed text-[11px]">
                  Khách hàng ưa thích sử dụng phương pháp <strong>Chuyển khoản</strong> thanh toán và thường ghé mua s sắm vào ngày cuối tuần.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 p-10 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col items-center justify-center sticky top-24 select-none">
              <Users2 size={28} className="text-slate-350 stroke-1 mb-2" />
              <span>Hãy chọn 1 người trong danh mục thành viên để xem hồ sơ giao dịch chi tiết.</span>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD CUSTOMER SPEC */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-150 animate-zoom-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm">Thêm mới hồ sơ khách hàng thành viên</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-650">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Họ và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Số Điện Thoại (*)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 09xxxxxxxx"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Hạng Thành Viên</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="regular">Regular (Thường)</option>
                    <option value="vip">VIP (Giảm 5% trực tiếp)</option>
                    <option value="wholesale">Wholesale (Hàng Đại Lý)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Địa chỉ Hòm thư Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="khachhang@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Địa chỉ Giao hàng mặc định</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Số nhà, Tên đường, Quận, Thành phố..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold px-4 py-2.5 rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-lg transition shadow-sm"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
