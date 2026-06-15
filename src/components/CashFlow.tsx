import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Download,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  Clock,
} from "lucide-react";
import { CashFlow as CashFlowType, ShopConfig } from "../types";

interface CashFlowProps {
  cashflows: CashFlowType[];
  config: ShopConfig;
}

export default function CashFlow({ cashflows, config }: CashFlowProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">(
    "all",
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  const totals = cashflows.reduce(
    (acc, curr) => {
      if (curr.type === "income") acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const filtered = cashflows.filter(
    (cf) => typeFilter === "all" || cf.type === typeFilter,
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Sổ Quỹ Thu Chi
          </h2>
          <p className="text-[14px] text-slate-500">
            Theo dõi dòng tiền vào và ra của cửa hàng.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white font-bold text-[14px] px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
          <Plus size={14} />
          <span>Tạo Phiếu Thu Chi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng Thu
            </p>
            <p className="text-[20px] font-black text-slate-800">
              {formatCurrency(totals.income)}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng Chi
            </p>
            <p className="text-[20px] font-black text-slate-800">
              {formatCurrency(totals.expense)}
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl shadow-lg border border-blue-500 flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-blue-100 uppercase tracking-wider">
              Tồn Quỹ
            </p>
            <p className="text-[20px] font-black">
              {formatCurrency(totals.income - totals.expense)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${typeFilter === "all" ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTypeFilter("income")}
            className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${typeFilter === "income" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Thu
          </button>
          <button
            onClick={() => setTypeFilter("expense")}
            className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-all ${typeFilter === "expense" ? "bg-red-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Chi
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold focus:outline-none focus:border-blue-500">
              <option>Tháng 06/2026</option>
              <option>Tháng 05/2026</option>
            </select>
          </div>
          <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600">
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((cf) => (
            <div
              key={cf.id}
              className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${cf.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  {cf.type === "income" ? (
                    <ArrowUpRight size={20} />
                  ) : (
                    <ArrowDownRight size={20} />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-black text-slate-800">
                      {cf.category}
                    </span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${cf.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {cf.type === "income" ? "THU" : "CHI"}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-500 font-medium truncate max-w-xs">
                    {cf.note}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <p
                  className={`text-[16px] font-black ${cf.type === "income" ? "text-emerald-600" : "text-red-500"}`}
                >
                  {cf.type === "income" ? "+" : "-"}
                  {formatCurrency(cf.amount)}
                </p>
                <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400 font-medium italic">
                  <Clock size={10} />
                  {new Date(cf.date).toLocaleString("vi-VN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
