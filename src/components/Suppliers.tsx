import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Hash,
  Wallet,
} from "lucide-react";
import { Supplier, ShopConfig } from "../types";

interface SuppliersProps {
  suppliers: Supplier[];
  config: ShopConfig;
  onAddSupplier?: (supplier: Omit<Supplier, "id">) => void;
  onDeleteSupplier?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
}

export default function Suppliers({
  suppliers,
  config,
  onAddSupplier,
  onDeleteSupplier,
  onToggleStatus,
}: SuppliersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Supplier State
  const [newSupplier, setNewSupplier] = useState<
    Omit<Supplier, "id" | "createdAt">
  >({
    name: "",
    code: "",
    phone: "",
    email: "",
    address: "",
    taxCode: "",
    category: "Tổng hợp",
    debt: 0,
    isActive: true,
    notes: "",
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? s.isActive : !s.isActive);
      return matchSearch && matchStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const handleCreateSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) return;
    onAddSupplier?.({
      ...newSupplier,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(false);
    setNewSupplier({
      name: "",
      code: "",
      phone: "",
      email: "",
      address: "",
      taxCode: "",
      category: "Tổng hợp",
      debt: 0,
      isActive: true,
      notes: "",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">
            Quản Lý Nhà Cung Cấp
          </h2>
          <p className="text-[14px] text-slate-500">
            Quản lý thông tin liên hệ và công nợ với các đối tác nhập hàng.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-4 py-2.5 rounded-lg shadow-2xs transition"
        >
          <Plus size={14} />
          <span>Thêm Nhà Cung Cấp</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              Tổng số NCC
            </p>
            <p className="text-[20px] font-black text-slate-800">
              {suppliers.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              Đang hợp tác
            </p>
            <p className="text-[20px] font-black text-slate-800">
              {suppliers.filter((s) => s.isActive).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              Tổng nợ NCC
            </p>
            <p className="text-[20px] font-black text-red-600">
              {formatCurrency(suppliers.reduce((sum, s) => sum + s.debt, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-[14px] focus:outline-none focus:border-blue-500 font-medium transition"
          />
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Đã tạm dừng</option>
        </select>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 border-b-4 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Nhà Cung Cấp
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Liên Hệ
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Danh Mục
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Công Nợ
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none text-center">
                  Trạng Thái
                </th>
                <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <Building2
                      size={40}
                      className="mx-auto text-slate-200 mb-2"
                    />
                    <p className="text-[16px] font-bold text-slate-400">
                      Không tìm thấy nhà cung cấp nào
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="group hover:bg-slate-50/50 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-extrabold text-slate-800">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 uppercase">
                          <Hash size={10} />
                          <span>{s.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-[14px] text-slate-600 font-medium tracking-tight">
                        <div className="flex items-center gap-2">
                          <Phone size={10} className="text-slate-400" />
                          <span>{s.phone}</span>
                        </div>
                        {s.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={10} className="text-slate-400" />
                            <span className="truncate max-w-[150px]">
                              {s.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[14px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[16px] font-black ${s.debt > 0 ? "text-red-500" : "text-slate-400"}`}
                      >
                        {formatCurrency(s.debt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => onToggleStatus?.(s.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {s.isActive ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          <span>{s.isActive ? "HOẠT ĐỘNG" : "TẠM DỪNG"}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                          <ChevronRight size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteSupplier?.(s.id)}
                          className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden slide-in-from-bottom-4 animate-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Thêm Nhà Cung Cấp Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tên Nhà Cung Cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    placeholder="VD: Xưởng may ABC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 font-medium transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Mã Nhà Cung Cấp
                  </label>
                  <input
                    type="text"
                    value={newSupplier.code}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="NCC-XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 font-mono font-bold transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSupplier.phone}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 font-bold transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={newSupplier.taxCode}
                      onChange={(e) =>
                        setNewSupplier({
                          ...newSupplier,
                          taxCode: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
                    }
                    placeholder="example@supplier.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        address: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ghi chú
                  </label>
                  <textarea
                    rows={3}
                    value={newSupplier.notes}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, notes: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 transition resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-[14px] rounded-2xl hover:bg-slate-100 transition shadow-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCreateSupplier}
                disabled={!newSupplier.name || !newSupplier.phone}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold text-[14px] rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                Lưu Nhà Cung Cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
