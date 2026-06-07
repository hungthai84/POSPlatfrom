/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, User, HelpCircle, Building2, LogIn, LogOut, Cloud, CloudOff } from 'lucide-react';
import { ShopConfig } from '../types';

interface HeaderProps {
  config: ShopConfig;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({
  config,
  globalSearch,
  setGlobalSearch,
  onSearchSubmit,
  user,
  onLogin,
  onLogout
}: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-panel border-b border-white/20 px-6 py-3 flex items-center justify-between sticky top-0 z-40 select-none h-16 shadow-lg shadow-black/2 backdrop-blur-xl">
      {/* Left Search Section */}
      <form
        onSubmit={onSearchSubmit || ((e) => e.preventDefault())}
        className="flex items-center gap-2 max-w-xl w-full"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm mã / tên sản phẩm / barcode / keyword..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-sm border border-white/40 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/80 text-slate-700 transition-all placeholder:text-slate-400 font-semibold"
            id="global-header-search"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
        </div>

        {/* Warehouse Filter */}
        <div className="relative">
          <select
            id="warehouse-select"
            className="bg-white/40 backdrop-blur-sm border border-white/40 text-slate-700 rounded-lg pl-8 pr-6 py-2 text-sm appearance-none focus:outline-none focus:border-blue-500 cursor-pointer font-bold focus:bg-white/80 transition-all"
          >
            <option value="all">Tất cả các kho</option>
            <option value="main">Kho tổng Hà Nội</option>
            <option value="sub">Kho chi nhánh HCM</option>
          </select>
          <Building2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 border-l border-t border-slate-500 w-1.5 h-1.5 rotate-135 pointer-events-none" />
        </div>
      </form>

      {/* Right Notifications and Stats */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/50 text-indigo-700 border border-indigo-100/40 text-xs font-mono font-semibold">
          <Clock size={14} className="animate-spin-slow" />
          <span>{time}</span>
        </div>

        {/* Support Help */}
        <button
          className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition"
          title="Trợ giúp"
        >
          <HelpCircle size={18} />
        </button>

        {/* Sync Status / Notifications */}
        <button
          className="p-2 text-slate-450 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition relative"
          title="Thông báo"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Firebase Cloud Sync Status */}
        <div className="hidden sm:flex items-center gap-1.5">
          {user ? (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 animate-pulse-slow">
              <Cloud size={13} />
              <span>Cloud đồng bộ</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-450 font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
              <CloudOff size={13} />
              <span>Chế độ cục bộ</span>
            </div>
          )}
        </div>

        {/* Active Shop Profile or Firebase Google Access Link */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 overflow-hidden flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User photo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-bold text-blue-600">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 leading-none truncate max-w-[120px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-slate-400 leading-none mt-1">
                  Chủ cửa hàng
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition shrink-0"
                title="Đăng xuất khỏi Firebase"
                id="btn-firebase-logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs border border-blue-700 cursor-pointer"
              title="Đăng nhập Google đồng bộ dữ liệu đám mây"
              id="btn-firebase-login"
            >
              <LogIn size={13} />
              <span>Kết nối Cloud</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
