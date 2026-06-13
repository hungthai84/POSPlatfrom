import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  UserCheck,
  Building2
} from 'lucide-react';
import { Debt, ShopConfig } from '../types';

interface DebtManagementProps {
  debts: Debt[];
  config: ShopConfig;
}

export default function DebtManagement({ debts, config }: DebtManagementProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  const filteredDebts = debts.filter(d => d.type === activeTab);
  const totalDebt = filteredDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight tracking-tighter">Công Nợ & Phải Trả</h2>
          <p className="text-xs text-slate-500">Quản lý nợ khách hàng và nợ nhà cung cấp.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Tổng Nợ {activeTab === 'customer' ? 'KHÁCH' : 'NCC'}</p>
            <p className="text-sm font-black text-slate-800 leading-none">{formatCurrency(totalDebt)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <UserCheck size={14} />
          <span>Nợ Khách Hàng</span>
        </button>
        <button 
          onClick={() => setActiveTab('supplier')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'supplier' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Building2 size={14} />
          <span>Nợ Nhà Cung Cấp</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDebts.map(debt => (
          <div key={debt.id} className="bg-white rounded-3xl border border-slate-200 border-b-4 hover:border-blue-300 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="p-5 flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  debt.status === 'urgent' ? 'bg-red-50 text-red-600' :
                  debt.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {debt.status === 'urgent' ? <AlertTriangle size={24} /> : 
                   debt.status === 'warning' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {debt.targetName}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Mã: {debt.id}</span>
                  </div>
                </div>
              </div>
              <button className="text-slate-300 hover:text-slate-600 p-1">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="px-5 py-4 border-y border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Số tiền nợ</span>
                <p className={`text-lg font-black ${debt.status === 'urgent' ? 'text-red-500' : 'text-slate-800'}`}>
                  {formatCurrency(debt.amount)}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                debt.status === 'urgent' ? 'bg-red-500 text-white' :
                debt.status === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {debt.status === 'urgent' ? 'Khẩn cấp' : debt.status === 'warning' ? 'Cần chú ý' : 'An toàn'}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between text-[10px] font-bold text-slate-500">
               <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" />
                  <span>Cập nhật: {new Date(debt.lastUpdated).toLocaleDateString('vi-VN')}</span>
               </div>
               <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <span>Đối soát</span>
                  <ChevronRight size={12} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
