import React, { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Printer,
} from "lucide-react";
import { Invoice, ShopConfig } from "../types";

interface InvoicesProps {
  invoices: Invoice[];
  config: ShopConfig;
}

export default function Invoices({ invoices, config }: InvoicesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "paid" | "unpaid" | "overdue"
  >("all");

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Quản Lý Hóa Đơn
          </h2>
          <p className="text-[14px] text-slate-500">
            Xem và quản lý tất cả hóa đơn bán hàng của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold text-[14px] px-4 py-2.5 rounded-xl hover:bg-slate-50 transition shadow-sm">
            <Download size={14} />
            <span>Xuất Excel</span>
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white font-bold text-[14px] px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            <Plus size={14} />
            <span>Tạo Hóa Đơn</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 font-medium transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="unpaid">Chưa thanh toán</option>
          <option value="overdue">Quá hạn</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Mã Hóa Đơn
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Khách Hàng
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Tổng Tiền
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Ngày Hết Hạn
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Trạng Thái
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-bold text-slate-800 tracking-tight">
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-black text-slate-700">
                        {inv.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Đơn hàng: {inv.orderId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-black text-slate-800">
                      {formatCurrency(inv.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[14px] text-slate-500 font-medium">
                      <Clock size={12} className="text-slate-400" />
                      {new Date(inv.dueDate).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 ${
                          inv.status === "paid"
                            ? "bg-emerald-50 text-emerald-600"
                            : inv.status === "unpaid"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {inv.status === "paid" ? (
                          <CheckCircle2 size={12} />
                        ) : inv.status === "unpaid" ? (
                          <Clock size={12} />
                        ) : (
                          <AlertCircle size={12} />
                        )}
                        {inv.status === "paid"
                          ? "ĐÃ TRẢ"
                          : inv.status === "unpaid"
                            ? "CHỜ TRẢ"
                            : "QUÁ HẠN"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                        <Printer size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600">
                        <ChevronRight size={16} />
                      </button>
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
