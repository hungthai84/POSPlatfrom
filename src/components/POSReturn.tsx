import React, { useState } from 'react';
import {
  Search,
  Scan,
  Box,
  Truck,
  Plus,
  Printer,
  Save,
  ChevronDown,
  Info
} from 'lucide-react';
import { Product, Customer } from '../types';

interface POSReturnProps {
  products: Product[];
  customers: Customer[];
}

export default function POSReturn({ products, customers }: POSReturnProps) {
  const [searchTermReturn, setSearchTermReturn] = useState('');
  const [searchTermExchange, setSearchTermExchange] = useState('');
  const [isProductMode, setIsProductMode] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#f1f3f5] overflow-hidden select-none font-sans text-slate-800">
      {/* 1. Header Tabs */}
      <div className="flex items-center px-4 bg-white border-b border-slate-200 h-12 shrink-0 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          <div className="flex items-center gap-2 px-4 h-9 rounded-t-lg border-x border-t transition-all cursor-pointer text-xs font-bold whitespace-nowrap bg-[#f1f3f5] border-slate-200 text-blue-600">
            <span>Trả hàng</span>
          </div>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 flex gap-3 min-h-0">
        
        {/* LEFT COLUMN */}
        <div className="flex-[7] flex flex-col gap-3 min-w-0">
          
          {/* Section: Trả hàng */}
          <div className="bg-white rounded-lg p-4 flex flex-col gap-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-bold text-sm">Trả hàng</h4>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <select className="bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 text-xs font-bold appearance-none pr-8">
                    <option>Online</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative group">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <Box size={16} />
                    <select className="bg-transparent border-none p-0 text-xs font-bold appearance-none pr-6">
                      <option>Kho mặc định</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhập mã, tên sản phẩm hoặc Barcode"
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  value={searchTermReturn}
                  onChange={(e) => setSearchTermReturn(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                   <Search size={14} />
                   <Scan size={16} className="ml-2" />
                   <span className="text-[10px] font-bold">(F9)</span>
                </div>
              </div>
            </div>

             <div className="min-h-[160px] border border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <div className="relative mb-2">
                  <div className="w-12 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-1 bg-slate-200 rounded"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 leading-none text-slate-300">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-200">
                      <span className="block w-1 h-1 bg-slate-300 rounded-full"></span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium">Giỏ hàng trống</span>
              </div>
          </div>

          {/* Section: Đơn đổi hàng */}
           <div className="bg-white rounded-lg p-4 flex flex-col gap-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-bold text-sm">Đơn đổi hàng</h4>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <select className="bg-slate-100 border border-transparent rounded-lg px-3 py-1.5 text-xs font-bold appearance-none pr-8 text-slate-500">
                    <option>Chọn nguồn đơn</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative group">
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500">
                    <Box size={16} />
                    <select className="bg-transparent border-none p-0 text-xs font-bold appearance-none pr-6 text-slate-500">
                      <option>Kho mặc định</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setIsProductMode(true)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition ${isProductMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Sản phẩm
                  </button>
                  <button 
                    onClick={() => setIsProductMode(false)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition ${!isProductMode ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Combo
                  </button>
                </div>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhập mã, tên sản phẩm hoặc Barcode"
                  className="w-full bg-slate-100 border-none rounded-lg px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  value={searchTermExchange}
                  onChange={(e) => setSearchTermExchange(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400">
                   <div className="flex items-center gap-1 border-r border-slate-300 pr-2 mr-1">
                     <input type="checkbox" className="rounded text-blue-600 border-slate-300 mr-1" />
                     <span className="text-[10px]">Còn hàng</span>
                   </div>
                   <Scan size={16} />
                   <span className="text-[10px] font-bold">(F9)</span>
                </div>
              </div>
            </div>

             <div className="min-h-[160px] border border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-white">
                <div className="relative mb-2">
                  <div className="w-12 h-10 border-2 border-slate-200 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-1 bg-slate-200 rounded"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 leading-none text-slate-300">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center border border-slate-200">
                      <span className="block w-1 h-1 bg-slate-300 rounded-full"></span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium">Giỏ hàng trống</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-8">
            {/* Section: Thông tin trả hàng */}
            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-slate-200">
              <h4 className="font-bold text-sm">Thông tin trả hàng</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700">Giảm giá đơn trả hàng</span>
                  <div className="w-32 bg-slate-100 rounded px-2 py-1 flex items-center justify-end">
                    <span className="text-xs font-bold text-slate-900 mr-1">0</span>
                    <span className="text-xs font-bold underline">đ</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700">Phí trả hàng</span>
                   <div className="relative w-32">
                    <input type="text" className="w-full bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-900 text-right pr-6" value="0" readOnly />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold underline pointer-events-none">đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Thanh toán */}
            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Thanh toán</h4>
                <button className="text-slate-400 hover:text-slate-600"><span className="text-xl leading-none px-1">⋮</span></button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-700">Tiền chuyển khoản</span>
                   <div className="relative w-32">
                    <input type="text" className="w-full bg-slate-100 rounded px-2 py-1 text-xs font-bold text-slate-900 text-right pr-6" value="0" readOnly />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold underline pointer-events-none">đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-[4] flex flex-col gap-3 min-w-0 pb-[80px]">
          
          {/* Section: Trạng thái */}
          <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-slate-200">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">Trạng thái</h4>
                <input type="text" placeholder="Mã tùy chỉnh" className="bg-slate-50 border border-slate-100 rounded p-1.5 text-xs w-28 text-slate-600" />
             </div>
             
             <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Tạo lúc:</span>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700">
                    <span className="w-32">{new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="ml-1 text-slate-400">📅</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Trả cho đơn hàng</span>
                  <a href="#" className="font-bold text-blue-600 hover:underline">Đơn hàng</a>
                </div>
                <div className="pt-1">
                  <button className="text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded px-2 py-1">
                    Thêm thẻ
                  </button>
                </div>
             </div>
          </div>

          {/* Section: Khách hàng */}
          <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-slate-200">
             <h4 className="font-bold text-sm">Khách hàng</h4>
             <div className="grid grid-cols-2 gap-2">
                 <input type="text" placeholder="Tên khách hàng" className="bg-slate-50 border border-transparent rounded px-3 py-2 text-xs focus:bg-white focus:border-blue-500" />
                 <input type="text" placeholder="Số điện thoại" className="bg-slate-50 border border-transparent rounded px-3 py-2 text-xs focus:bg-white focus:border-blue-500" />
             </div>
             
             <div className="bg-[#f0f6fc] border border-blue-100 text-slate-700 rounded-lg p-2.5 flex justify-center items-center gap-1.5 text-xs font-medium">
               <Info size={14} />
               <span>Chưa có thông tin</span>
             </div>
          </div>

          {/* Section: Nhận hàng */}
          <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                 <h4 className="font-bold text-sm">Nhận hàng</h4>
                 <div className="relative">
                   <select className="bg-slate-50 border border-none rounded px-3 py-1.5 text-xs font-medium appearance-none pr-6 text-slate-600 min-w-28 text-right">
                    <option>Chọn địa chỉ</option>
                   </select>
                   <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>

              <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">Dự kiến nhận hàng</span>
                  <div className="flex items-center bg-slate-50 border border-none rounded px-3 py-1.5 text-xs text-slate-500">
                    <span className="w-24">Chọn ngày</span>
                    <span className="ml-1 text-slate-400">📅</span>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                 <input type="text" placeholder="Tên người nhận" className="col-span-1 bg-slate-50 border border-transparent rounded px-3 py-2 text-xs focus:bg-white focus:border-blue-500" />
                 <input type="text" placeholder="Số điện thoại" className="col-span-1 bg-slate-50 border border-transparent rounded px-3 py-2 text-xs focus:bg-white focus:border-blue-500" />
                 <input type="text" placeholder="Địa chỉ chi tiết" className="col-span-2 bg-slate-50 border border-transparent rounded px-3 py-2 text-xs focus:bg-white focus:border-blue-500" />
                 
                 <div className="col-span-2 relative">
                   <select className="w-full bg-slate-50 border border-none rounded px-3 py-2 text-xs font-medium appearance-none text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option>Chọn địa chỉ</option>
                   </select>
                   <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>
          </div>

          {/* Section: Vận chuyển */}
          <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-1">
                 <h4 className="font-bold text-sm">Vận chuyển</h4>
                 <div className="relative">
                   <select className="bg-slate-50 border border-none rounded px-3 py-1.5 text-xs font-medium appearance-none pr-6 text-slate-600 text-right">
                    <option>Đơn vị VC</option>
                   </select>
                   <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                 </div>
              </div>

               <div className="flex items-center justify-between text-xs text-slate-700">
                  <span>Kích thước</span>
                  <div className="flex items-center gap-1 font-mono">
                    <input type="text" className="w-8 bg-slate-50 rounded px-1.5 py-1 text-center font-semibold text-slate-600" value="0" readOnly /> <span>x</span>
                    <input type="text" className="w-8 bg-slate-50 rounded px-1.5 py-1 text-center font-semibold text-slate-600" value="0" readOnly /> <span>x</span>
                    <input type="text" className="w-8 bg-slate-50 rounded px-1.5 py-1 text-center font-semibold text-slate-600" value="0" readOnly /> <span className="ml-1 text-[11px]">(cm)</span>
                  </div>
              </div>
          </div>

        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-16 xl:left-60 right-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] z-20 transition-all duration-300">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-700">Tổng số tiền:</span>
            <span className="text-sm font-bold text-slate-900">0 đ</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-700">COD:</span>
            <span className="text-sm font-bold text-red-600">0 đ</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-teal-300 px-4 py-2 rounded-lg text-teal-600 text-xs font-bold shadow-sm">
            Trạng thái: Mới
          </div>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-2 shadow-sm transition">
            <Printer size={16} />
            <span>In (F4)</span>
          </button>
          <button className="bg-[#0f62fe] hover:bg-blue-700 px-6 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-md transition">
            <Save size={16} />
            <span>Lưu (F2)</span>
          </button>
        </div>
      </div>

    </div>
  );
}
