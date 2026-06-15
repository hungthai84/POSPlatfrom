/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShopConfig, Product, Customer, Order } from "../types";
import {
  Settings,
  Shield,
  Store,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Percent,
  HelpCircle,
  Save,
  CheckCircle2,
  Download,
} from "lucide-react";
import GooglePickerManager from "./GooglePickerManager";

interface SettingsProps {
  config: ShopConfig;
  onUpdateConfig: (config: ShopConfig) => void;
  onResetDatabase: () => void;
  products: Product[];
  customers: Customer[];
  orders: Order[];
}

export default function SettingsView({
  config,
  onUpdateConfig,
  onResetDatabase,
  products,
  customers,
  orders,
}: SettingsProps) {
  // Config states
  const [shopName, setShopName] = useState<string>(config.name);
  const [shopPhone, setShopPhone] = useState<string>(config.phone);
  const [shopAddress, setShopAddress] = useState<string>(config.address);
  const [shopEmail, setShopEmail] = useState<string>(config.email);
  const [shopTax, setShopTax] = useState<number>(config.taxRate * 100);
  const [shopCurrency, setShopCurrency] = useState<string>(config.currency);
  const [shopLowStockThreshold, setShopLowStockThreshold] = useState<number>(
    config.lowStockThreshold ?? 5,
  );

  const [saved, setSaved] = useState<boolean>(false);

  const handleBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      shopConfig: config,
      products: products || [],
      customers: customers || [],
      orders: orders || [],
    };

    const fileContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `pancake_pos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShopConfig = {
      name: shopName,
      phone: shopPhone,
      address: shopAddress,
      email: shopEmail,
      taxRate: Number(shopTax) / 100,
      currency: shopCurrency,
      lowStockThreshold: Number(shopLowStockThreshold),
      logoUrl: config.logoUrl,
    };
    onUpdateConfig(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (
      confirm(
        "BẠN CHẮC CHẮN MUỐN ĐỒNG BỘ LẠI TOÀN BỘ? Tất cả đơn hàng mới sẽ bị xóa và sản phẩm/khách hàng gốc được thiết lập mặc định.",
      )
    ) {
      onResetDatabase();
      alert("Đã thiết lập lại cơ sở dữ liệu mẫu thành công!");
      window.location.reload();
    }
  };

  return (
    <div
      className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none animate-fade-in"
      id="settings-page"
    >
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">
          Cấu hình hệ thống cửa hàng
        </h2>
        <p className="text-[14px] text-slate-450">
          Điều chỉnh thông tin shop, đơn vị hóa đơn, thuế VAT và dữ liệu hệ
          thống.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-medium text-[14px]">
        {/* Left Form (2/3 weight) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/60 p-6 shadow-3xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="text-blue-600" size={18} />
            <span className="font-extrabold text-slate-800 text-[16px]">
              Thông tin gian hàng POS
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <span>Tên Cửa Hàng / Shop Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition"
                  placeholder="Power Service POS"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Số Điện Thoại Shop
                </label>
                <input
                  type="text"
                  required
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-700 focus:outline-none focus:bg-white focus:border-blue-500 transition font-mono"
                  placeholder="0987 654 321"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Hộp thư nhận hóa đơn (Email)
                </label>
                <input
                  type="email"
                  required
                  value={shopEmail}
                  onChange={(e) => setShopEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-705 focus:outline-none focus:bg-white focus:border-blue-500 transition"
                  placeholder="info@larkshop.vn"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-0.5">
                    <Percent size={11} /> Thuế suất VAT
                  </label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={shopTax}
                      onChange={(e) => setShopTax(Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 text-[14px] focus:outline-none font-bold"
                    />
                    <span className="bg-slate-100 text-slate-500 font-bold px-2 py-2 select-none">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Ký hiệu tệ (Currency)
                  </label>
                  <input
                    type="text"
                    required
                    value={shopCurrency}
                    onChange={(e) => setShopCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-705 focus:outline-none focus:bg-white focus:border-blue-500 transition font-bold"
                    placeholder="đ"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-0.5">
                    <span>Ngưỡng cảnh báo</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={shopLowStockThreshold}
                    onChange={(e) =>
                      setShopLowStockThreshold(Number(e.target.value))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[14px] text-slate-705 focus:outline-none focus:bg-white focus:border-blue-500 transition font-bold"
                    placeholder="5"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                Địa chỉ trụ sở chính
              </label>
              <textarea
                value={shopAddress}
                required
                onChange={(e) => setShopAddress(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[14px] text-slate-705 focus:outline-none focus:bg-white focus:border-blue-500 transition leading-relaxed"
                placeholder="Số nhà, Tên đường..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {saved ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 text-[12px] animate-fade-in">
                  <CheckCircle2 size={14} />
                  <span>Cập nhật cấu hình cửa hàng thành công!</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Lưu thay đổi để cập nhật dữ liệu hiển thị toàn màn hình.
                </span>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
              >
                <Save size={14} />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Info panels (1/3 weight) */}
        <div className="space-y-6 col-span-1">
          {/* Google Picker Integration */}
          <GooglePickerManager
            onLogoSelected={(url) => {
              const updated: ShopConfig = {
                ...config,
                logoUrl: url,
              };
              onUpdateConfig(updated);
            }}
          />

          {/* Sao lưu dữ liệu */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-1.5 text-blue-600 border-b border-slate-100 pb-3">
              <Download size={16} />
              <span className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">
                Sao lưu toàn vẹn dữ liệu
              </span>
            </div>
            <p className="text-[12px] text-slate-450 leading-relaxed mt-1">
              Tải xuống toàn bộ cấu hình cửa hàng, sản phẩm, khách hàng và danh
              sách lịch sử giao dịch hiện tại dưới định dạng file{" "}
              <strong>JSON</strong> dự phòng.
            </p>
            <button
              onClick={handleBackup}
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Download size={14} />
              <span>TẢI FILE SAO LƯU (.JSON)</span>
            </button>
          </div>

          {/* Quick status and sync specs */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-1.5 text-[#2B4C6F] border-b border-slate-100 pb-3">
              <Shield size={16} />
              <span className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">
                Quản lý cơ sở dữ liệu mẫu
              </span>
            </div>
            <p className="text-[12px] text-slate-450 leading-relaxed">
              Các thay đổi về đơn hàng mới, danh sách khách hàng hay mẫu SKU sản
              phẩm khi thử nghiệm chỉ giữ lại trong trình duyệt tại{" "}
              <strong>localStorage</strong>.
            </p>
            <p className="text-[12px] text-slate-450 leading-relaxed font-bold">
              Bạn có muốn trả toàn bộ về dữ liệu mẫu xuất phát ban đầu?
            </p>
            <button
              onClick={handleReset}
              className="w-full border border-red-200 hover:bg-red-50 text-red-600 font-black text-[14px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>THIẾT LẬP LẠI TOÀN BỘ (RESET)</span>
            </button>
          </div>

          {/* Quick tips */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-3.5">
            <h4 className="font-bold text-slate-800 text-[14px] uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={14} className="text-blue-500" />
              <span>Chế độ vận hành POS</span>
            </h4>
            <div className="space-y-2 text-[12px] text-slate-550 leading-relaxed font-medium">
              <p>
                • <strong>Hàng có thể bán:</strong> Tự động giảm tương ứng sau
                mỗi giao dịch POS thành công.
              </p>
              <p>
                • <strong>Mã SP / SKU:</strong> Có cấu trúc phân loại tự động
                LARK_TÊN_SIZE_MÀU để phân biệt mã quản lý độc lập.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
