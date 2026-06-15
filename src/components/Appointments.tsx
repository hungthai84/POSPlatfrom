import React, { useState } from "react";
import {
  PhoneCall,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  Filter,
  MessageSquare,
} from "lucide-react";
import { CallAppointment, ShopConfig } from "../types";

interface AppointmentsProps {
  appointments: CallAppointment[];
  config: ShopConfig;
}

export default function Appointments({
  appointments,
  config,
}: AppointmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "cancelled"
  >("all");

  const filtered = appointments.filter((app) => {
    const matchesSearch =
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Hẹn Gọi Chăm Sóc
          </h2>
          <p className="text-[14px] text-slate-500">
            Quản lý lịch hẹn gọi điện tư vấn và CSKH.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-bold text-[14px] px-4 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          <Plus size={14} />
          <span>Thêm Hẹn Gọi</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên khách, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 font-medium transition"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ gọi</option>
            <option value="completed">Đã gọi</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-3xl border border-slate-200 border-b-4 hover:border-blue-300 shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    app.status === "completed"
                      ? "bg-emerald-50 text-emerald-600"
                      : app.status === "cancelled"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <PhoneCall
                    size={24}
                    className={app.status === "pending" ? "animate-bounce" : ""}
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[16px] group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {app.customerName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    <Phone size={10} />
                    {app.phone}
                  </div>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600 p-1">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="px-5 py-4 border-y border-slate-50 space-y-3 bg-slate-50/30 font-medium">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Lý do hẹn gọi
                </span>
                <p className="text-[12px] text-slate-700 leading-relaxed font-bold">
                  {app.reason}
                </p>
              </div>
              {app.notes && (
                <div className="flex items-start gap-2 bg-white/50 p-2 rounded-xl border border-slate-100">
                  <MessageSquare size={10} className="text-slate-300 mt-0.5" />
                  <p className="text-[11px] text-slate-400 italic line-clamp-2">
                    {app.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-[11px] font-black text-slate-800">
                  {new Date(app.scheduledAt).toLocaleDateString("vi-VN")}{" "}
                  {new Date(app.scheduledAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {app.status === "pending" && (
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black hover:bg-blue-700 transition flex items-center gap-1 shadow-md shadow-blue-100">
                    <PhoneCall size={10} />
                    GỌI NGAY
                  </button>
                )}
                {app.status === "completed" && (
                  <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={12} /> XONG
                  </span>
                )}
                {app.status === "cancelled" && (
                  <span className="text-[10px] font-black text-red-400 flex items-center gap-1">
                    <XCircle size={12} /> HỦY
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
