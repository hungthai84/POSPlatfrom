import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Calendar,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Download
} from 'lucide-react';
import { Transaction, ShopConfig } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  config: ShopConfig;
}

export default function Transactions({ transactions, config }: TransactionsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ` ${config.currency}`;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote size={16} />;
      case 'bank': return <Building size={16} />;
      case 'card': return <CreditCard size={16} />;
      default: return <ArrowRightLeft size={16} />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Lịch Sử Giao Dịch</h2>
          <p className="text-xs text-slate-500">Xem tất cả các giao dịch thanh toán và hoàn tiền.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="date"
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 shadow-sm"
              />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 shadow-sm">
             <Download size={16} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại giao dịch</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phương thức</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số tiền</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã tham chiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        tx.type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                        tx.type === 'refund' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                         <ArrowRightLeft size={16} />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {tx.type === 'payment' ? 'Thanh toán' : tx.type === 'refund' ? 'Hoàn tiền' : 'Điều chỉnh'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase">
                      {getMethodIcon(tx.method)}
                      <span>{tx.method === 'cash' ? 'Tiền mặt' : tx.method === 'bank' ? 'Chuyển khoản' : 'Thẻ'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-800">{formatCurrency(tx.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-slate-500">
                      {new Date(tx.date).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                       <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        tx.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                        tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                       }`}>
                         {tx.status === 'success' ? <CheckCircle2 size={10} /> : 
                          tx.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                         {tx.status === 'success' ? 'THÀNH CÔNG' : tx.status === 'pending' ? 'CHỜ XỬ LÝ' : 'THẤT BẠI'}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {tx.referenceId && (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                        <Hash size={10} />
                        {tx.referenceId}
                      </div>
                    )}
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
