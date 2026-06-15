import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Megaphone,
  CreditCard,
  MousePointerClick,
  Users,
  Eye,
  TrendingUp,
  Plus,
  Play,
  Pause,
  StopCircle,
} from "lucide-react";
import { AdCampaign, ShopConfig } from "../types";

interface AdsProps {
  ads: AdCampaign[];
  config: ShopConfig;
  onUpdateAdStatus?: (id: string, status: AdCampaign["status"]) => void;
}

export default function Ads({
  ads,
  config,
  onUpdateAdStatus,
  onAddAd,
}: AdsProps & { onAddAd?: (ad: Omit<AdCampaign, "id">) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<
    "all" | "facebook" | "google" | "tiktok"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "paused" | "completed"
  >("all");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAd, setNewAd] = useState<
    Omit<AdCampaign, "id" | "spent" | "impressions" | "clicks" | "conversions">
  >({
    name: "",
    platform: "facebook",
    status: "active",
    budget: 1000000,
    startDate: new Date().toISOString().split("T")[0],
  });

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  const handleCreateAd = () => {
    if (!newAd.name) return;
    onAddAd?.({
      ...newAd,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    });
    setIsModalOpen(false);
    setNewAd({
      name: "",
      platform: "facebook",
      status: "active",
      budget: 1000000,
      startDate: new Date().toISOString().split("T")[0],
    });
  };

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchSearch =
        ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPlatform =
        platformFilter === "all" || ad.platform === platformFilter;
      const matchStatus = statusFilter === "all" || ad.status === statusFilter;
      return matchSearch && matchPlatform && matchStatus;
    });
  }, [ads, searchTerm, platformFilter, statusFilter]);

  const totalSpent = ads.reduce((sum, ad) => sum + ad.spent, 0);
  const totalConversions = ads.reduce((sum, ad) => sum + ad.conversions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCpa = totalConversions > 0 ? totalSpent / totalConversions : 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">
            Quản Lý Quảng Cáo
          </h2>
          <p className="text-[14px] text-slate-500">
            Giám sát chiến dịch đa nền tảng Facebook, Google, TikTok.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] px-4 py-2.5 rounded-lg shadow-2xs transition"
        >
          <Plus size={14} />
          <span>Tạo Chiến Dịch Mới</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tổng Đã Chi
            </p>
            <p className="text-[16px] font-black text-slate-800">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chuyển Đổi
            </p>
            <p className="text-[16px] font-black text-slate-800">
              {totalConversions.toLocaleString("vi-VN")} đơn
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <MousePointerClick size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Lượt Click
            </p>
            <p className="text-[16px] font-black text-slate-800">
              {totalClicks.toLocaleString("vi-VN")} click
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/60 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CPA Trung Bình (Giá/Đơn)
            </p>
            <p className="text-[16px] font-black text-slate-800">
              {formatCurrency(avgCpa)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo mã Ad, tên chiến dịch..."
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
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả Nền tảng</option>
          <option value="facebook">Facebook Ads</option>
          <option value="google">Google Ads</option>
          <option value="tiktok">TikTok Ads</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả Trạng thái</option>
          <option value="active">Đang Chạy</option>
          <option value="paused">Tạm Dừng</option>
          <option value="completed">Đã Kết Thúc</option>
        </select>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-slate-600">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-3 px-4">Chiến dịch</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Ngân sách</th>
                <th className="py-3 px-4 text-right">Đã chi</th>
                <th className="py-3 px-4 text-right">Clicks / Imp.</th>
                <th className="py-3 px-4 text-center">Chuyển đổi</th>
                <th className="py-3 px-4 text-right">CPA</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAds.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-slate-400 font-medium h-48"
                  >
                    <Megaphone
                      size={24}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    Không tìm thấy chiến dịch nào
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => {
                  const cpa =
                    ad.conversions > 0 ? ad.spent / ad.conversions : 0;
                  const ctr =
                    ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
                  return (
                    <tr
                      key={ad.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">
                          {ad.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          {ad.platform === "facebook" && (
                            <span className="text-blue-600 font-bold uppercase">
                              FB
                            </span>
                          )}
                          {ad.platform === "google" && (
                            <span className="text-red-500 font-bold uppercase">
                              GG
                            </span>
                          )}
                          {ad.platform === "tiktok" && (
                            <span className="text-slate-800 font-bold uppercase">
                              TK
                            </span>
                          )}
                          <span>•</span>
                          {ad.id}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ad.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : ad.status === "paused"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {ad.status === "active"
                            ? "Đang Chạy"
                            : ad.status === "paused"
                              ? "Tạm Dừng"
                              : "Kết Thúc"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(ad.budget)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(ad.spent)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-700">
                          {ad.clicks.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          / {ad.impressions.toLocaleString()} ({ctr.toFixed(1)}
                          %)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded-lg border border-blue-100">
                          {ad.conversions}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-700">
                        {formatCurrency(cpa)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {ad.status === "active" && (
                            <button
                              onClick={() =>
                                onUpdateAdStatus?.(ad.id, "paused")
                              }
                              className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition"
                              title="Tạm dừng"
                            >
                              <Pause size={14} />
                            </button>
                          )}
                          {ad.status === "paused" && (
                            <button
                              onClick={() =>
                                onUpdateAdStatus?.(ad.id, "active")
                              }
                              className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition"
                              title="Tiếp tục chạy"
                            >
                              <Play size={14} />
                            </button>
                          )}
                          {(ad.status === "active" ||
                            ad.status === "paused") && (
                            <button
                              onClick={() =>
                                onUpdateAdStatus?.(ad.id, "completed")
                              }
                              className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                              title="Kết thúc chiến dịch"
                            >
                              <StopCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden slide-in-from-bottom-4 animate-in duration-300">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Megaphone size={18} className="text-blue-600" />
                Tạo Chiến Dịch Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tên chiến dịch
                </label>
                <input
                  type="text"
                  value={newAd.name}
                  onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                  placeholder="VD: Khuyến mãi mùa Hè 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[16px] focus:outline-none focus:border-blue-500 font-medium transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nền tảng
                  </label>
                  <select
                    value={newAd.platform}
                    onChange={(e) =>
                      setNewAd({ ...newAd, platform: e.target.value as any })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[16px] font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ngân sách
                  </label>
                  <input
                    type="number"
                    value={newAd.budget}
                    onChange={(e) =>
                      setNewAd({ ...newAd, budget: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[16px] font-black text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={newAd.startDate}
                  onChange={(e) =>
                    setNewAd({ ...newAd, startDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[16px] font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-[14px] rounded-xl hover:bg-slate-100 transition shadow-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCreateAd}
                disabled={!newAd.name}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                Tạo chiến dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
