/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Package,
  CircleDollarSign,
  Users2,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  MonitorCheck,
  Globe,
  ChevronDown
} from 'lucide-react';
import { ShopConfig } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  config: ShopConfig;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  config,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({
    sales: false,
    'orders-group': false,
    'products-group': false,
    'finance-group': false
  });

  const setMenuExpanded = (id: string, expanded: boolean) => {
    setExpandedMenus(prev => ({ ...prev, [id]: expanded }));
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { 
      id: 'sales', 
      label: 'Bán hàng', 
      icon: ShoppingCart,
      subItems: [
        { id: 'pos', label: 'Bán hàng' },
        { id: 'sales-return', label: 'Trả hàng' }
      ]
    },
    { 
      id: 'orders-group', 
      label: 'Đơn hàng', 
      icon: ReceiptText,
      subItems: [
        { id: 'orders', label: 'Đơn hàng' },
        { id: 'livestream', label: 'Livestream' },
        { id: 'returns', label: 'Đổi trả' },
        { id: 'invoices', label: 'Hoá đơn' },
        { id: 'call-appointments', label: 'Hẹn gọi' }
      ]
    },
    { 
      id: 'products-group', 
      label: 'Sản phẩm', 
      icon: Package,
      subItems: [
        { id: 'products', label: 'Sản phẩm' },
        { id: 'promotions', label: 'Khuyến mãi' },
        { id: 'combos', label: 'Combo' },
        { id: 'suppliers', label: 'Nhà cung cấp' }
      ]
    },
    { 
      id: 'finance-group', 
      label: 'Tài chính', 
      icon: CircleDollarSign,
      subItems: [
        { id: 'reconciliation', label: 'Đối soát' },
        { id: 'income-expense', label: 'Thu chi' },
        { id: 'debt', label: 'Công nợ' },
        { id: 'transactions', label: 'Giao dịch' }
      ]
    },
    { id: 'customers', label: 'Khách hàng', icon: Users2 },
    { id: 'ads', label: 'Quảng cáo', icon: Megaphone },
    { id: 'analytics', label: 'Thống kê', icon: BarChart3 },
    { id: 'settings', label: 'Cấu hình', icon: Settings }
  ];

  return (
    <div
      className={`glass-panel border-r border-white/20 flex flex-col justify-between h-screen transition-all duration-300 select-none shadow-2xl ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      id="pos-sidebar"
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {/* Brand Section */}
      <div className="p-4 border-b border-black/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
          <MonitorCheck size={20} className="animate-pulse" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-slate-800 tracking-tight truncate">
              {config.name}
            </span>
            <span className="text-[10px] text-blue-600 font-bold tracking-wider uppercase">
              Pancake POS
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 py-6 overflow-y-auto space-y-1.5 px-2.5 scrollbar-none flex flex-col justify-center">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isGroup = !!item.subItems;
            const isExpanded = expandedMenus[item.id];
            const isActive = currentTab === item.id || item.subItems?.some(sub => sub.id === currentTab);

            if (isGroup && !collapsed) {
              return (
                <div 
                  key={item.id} 
                  className="space-y-1"
                  onMouseEnter={() => setMenuExpanded(item.id, true)}
                  onMouseLeave={() => setMenuExpanded(item.id, false)}
                >
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-200 group ${
                      isActive ? 'text-blue-700 bg-blue-500/10' : 'text-slate-650 hover:bg-white/40'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-9 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                      {item.subItems?.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setCurrentTab(sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
                            currentTab === sub.id 
                              ? 'text-blue-700 font-bold bg-blue-500/15' 
                              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 hover:pl-4'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-200 group ${
                  isActive && !isGroup
                    ? 'bg-blue-500/10 text-blue-700 shadow-sm'
                    : 'text-slate-650 hover:bg-white/40 hover:text-slate-900'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isActive && !isGroup ? 'text-blue-600 font-bold' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Section removed as requested */}
    </div>
  );
}
