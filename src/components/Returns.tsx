import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  FileSpreadsheet,
  Info,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ReturnRequest, ShopConfig } from '../types';

interface ReturnsProps {
  returns: ReturnRequest[];
  config: ShopConfig;
  onUpdateReturnStatus?: (requestId: string, status: ReturnRequest['status']) => void;
}

export default function Returns({ returns, config, onUpdateReturnStatus }: ReturnsProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [activeRequest, setActiveRequest] = useState<ReturnRequest | null>(null);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  const filteredReturns = useMemo(() => {
    let result = returns.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchSearch && matchStatus;
    });

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return result;
  }, [returns, searchTerm, selectedStatus, sortBy]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none" id="returns-mgmt-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Hồ Sơ Đổi Trả & Hoàn Tiền</h2>
          <p className="text-xs text-slate-450">Quản lý các yêu cầu trả hàng, lý do trả và xử lý hoàn lại tiền.</p>
        </div>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg shadow-2xs transition">
          <FileSpreadsheet size={14} className="text-emerald-600" />
          <span>Xuất File Báo Cáo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm mã Yêu cầu, mã Đơn gốc, Tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white text-slate-755 font-medium transition"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-705 font-bold focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-150 space-x-1 hidden lg:flex">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ duyệt' },
            { id: 'approved', label: 'Đã duyệt' },
            { id: 'completed', label: 'Hoàn tất' },
            { id: 'rejected', label: 'Từ chối' }
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-4 font-semibold">Mã YC</th>
                  <th className="py-3 px-4 font-semibold">Đơn gốc</th>
                  <th className="py-3 px-4 font-semibold">Khách hàng</th>
                  <th className="py-3 px-4 font-semibold text-right">Tiền hoàn</th>
                  <th className="py-3 px-4 font-semibold">Lý do</th>
                  <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                      Không có yêu cầu đổi trả nào khớp
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((req) => {
                    const isActive = activeRequest?.id === req.id;
                    return (
                      <tr
                        key={req.id}
                        onClick={() => setActiveRequest(req)}
                        className={`border-b border-slate-50 relative z-0 hover:z-10 hover:bg-white hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200 ${
                          isActive ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-4 font-mono font-bold text-indigo-600">{req.id}</td>
                        <td className="py-4 px-4 font-mono font-medium text-slate-500">{req.orderId}</td>
                        <td className="py-4 px-4 font-medium text-slate-800">
                          {req.customer ? req.customer.name : 'Khách vãng lai'}
                        </td>
                        <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                          {formatCurrency(req.refundAmount)}
                        </td>
                        <td className="py-4 px-4 text-[10px] truncate max-w-[120px]" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            req.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : req.status === 'approved'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : req.status === 'rejected'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-101'
                          }`}>
                            {req.status === 'completed' && 'Hoàn tất'}
                            {req.status === 'approved' && 'Đã duyệt'}
                            {req.status === 'pending' && 'Chờ duyệt'}
                            {req.status === 'rejected' && 'Từ chối'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-1">
          {activeRequest ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4 sticky top-24 animate-fade-in-right">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">THÔNG TIN YÊU CẦU</span>
                  <h3 className="font-extrabold text-slate-800 text-sm">{activeRequest.id}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  activeRequest.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : activeRequest.status === 'rejected'
                    ? 'bg-red-50 text-red-700 border border-red-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {activeRequest.status === 'completed' && 'Đã hoàn tất'}
                  {activeRequest.status === 'approved' && 'Đã duyệt'}
                  {activeRequest.status === 'pending' && 'Chờ duyệt'}
                  {activeRequest.status === 'rejected' && 'Từ chối'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                 <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                   <div className="flex justify-between font-semibold text-slate-800">
                     <span>Đơn hàng gốc:</span>
                     <span className="text-blue-600 font-mono">{activeRequest.orderId}</span>
                   </div>
                   <div className="flex justify-between font-semibold text-slate-800">
                     <span>Khách hàng:</span>
                     <span>{activeRequest.customer ? activeRequest.customer.name : 'Khách vãng lai'}</span>
                   </div>
                   {activeRequest.customer && (
                     <div className="flex justify-between text-slate-500">
                       <span>Số điện thoại:</span>
                       <span>{activeRequest.customer.phone}</span>
                     </div>
                   )}
                 </div>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Mặt hàng trả ({activeRequest.items.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {activeRequest.items.map((it) => (
                    <div key={it.variantId} className="flex justify-between items-center bg-rose-50/30 p-2 rounded border border-rose-100/50">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold text-slate-800 block truncate">{it.productName}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Lỗi / Đổi</span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-[10px] font-bold text-slate-800 block">x{it.quantity}</span>
                        <span className="text-[10px] font-black text-rose-700 block">{formatCurrency(it.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between text-sm font-black text-rose-600 pb-2">
                  <span>Tổng tiền bồi hoàn:</span>
                  <span>{formatCurrency(activeRequest.refundAmount)}</span>
                </div>
                <div className="bg-slate-50 rounded p-2 text-[11px] text-slate-700 border border-slate-100 italic">
                  <strong>Lý do:</strong> {activeRequest.reason}
                </div>
                {activeRequest.notes && (
                  <div className="bg-indigo-50/50 rounded p-2 text-[11px] text-indigo-800 border border-indigo-100/50">
                    <strong>Ghi chú:</strong> {activeRequest.notes}
                  </div>
                )}
              </div>

              {activeRequest.status === 'pending' && onUpdateReturnStatus && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      onUpdateReturnStatus(activeRequest.id, 'approved');
                      setActiveRequest({...activeRequest, status: 'approved'});
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg transition"
                  >
                    Duyệt Yêu Cầu Đổi Trả
                  </button>
                  <button
                    onClick={() => {
                       onUpdateReturnStatus(activeRequest.id, 'rejected');
                       setActiveRequest({...activeRequest, status: 'rejected'});
                    }}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-lg transition border border-red-200"
                  >
                    Từ Chối Yêu Cầu
                  </button>
                </div>
              )}
              {activeRequest.status === 'approved' && onUpdateReturnStatus && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                   <button
                    onClick={() => {
                      onUpdateReturnStatus(activeRequest.id, 'completed');
                      setActiveRequest({...activeRequest, status: 'completed'});
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition"
                  >
                    Xác Nhận Đã Hoàn Tiền (Hoàn Tất)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/60 p-10 text-center text-slate-400 font-semibold text-xs h-64 flex flex-col items-center justify-center sticky top-24">
              <RotateCcw size={28} className="text-slate-300 stroke-1 mb-2" />
              <span>Hãy click vào 1 phiếu để xem lịch sử đổi trả & xử lý.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
