import React, { useState, useEffect } from "react";
import { Promotion } from "../types";
import {
  Tag,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle2,
  X,
  Calendar,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Coins,
  QrCode,
  Users,
  Eye,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";

const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: "PR-101",
    code: "HE2026",
    name: "Chào Hè Rực Rỡ 2026",
    description:
      "Giảm ngay 10% tổng đơn hàng có giá trị tối thiểu từ 100K. Giảm tối đa 50K.",
    type: "percentage",
    value: 10,
    maxDiscount: 50000,
    minOrderValue: 100000,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    usageLimit: 500,
    usageCount: 142,
    isActive: true,
    targetCustomerType: "all",
  },
  {
    id: "PR-102",
    code: "LARKVIP",
    name: "Đặc Quyền Hội Viên VIP",
    description:
      "Khấu trừ trực tiếp 100K cho đơn hàng từ 550K áp dụng riêng cho quý khách hàng VIP.",
    type: "fixed_amount",
    value: 100000,
    minOrderValue: 550000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 200,
    usageCount: 87,
    isActive: true,
    targetCustomerType: "vip",
  },
  {
    id: "PR-103",
    code: "FREESHIP30",
    name: "Miễn Phí Vận Chuyển",
    description:
      "Miễn phí tối đa 30K phí vận chuyển bưu tá cho hóa đơn mua hàng từ 300K.",
    type: "free_shipping",
    value: 30000,
    minOrderValue: 300000,
    startDate: "2026-05-01",
    endDate: "2026-09-30",
    usageLimit: 1000,
    usageCount: 310,
    isActive: true,
    targetCustomerType: "all",
  },
  {
    id: "PR-104",
    code: "CHOGIASI",
    name: "Tri Ân Khách Sỉ",
    description:
      "Giảm giá cực sâu 15% tổng hóa đơn cho các đơn hàng bán buôn tối thiểu từ 2 Triệu.",
    type: "percentage",
    value: 15,
    maxDiscount: 500000,
    minOrderValue: 2000000,
    startDate: "2026-03-01",
    endDate: "2026-07-31",
    usageLimit: 150,
    usageCount: 22,
    isActive: true,
    targetCustomerType: "wholesale",
  },
  {
    id: "PR-105",
    code: "KMCHUNG",
    name: "Khuyến mãi thành viên mới",
    description:
      "Giảm trực tiếp 20.000đ cho đơn hàng đầu tiên làm quen với Power Service POS.",
    type: "fixed_amount",
    value: 20000,
    minOrderValue: 50000,
    startDate: "2026-06-01",
    endDate: "2026-06-12", // Expired to demonstrate date management!
    usageLimit: 300,
    usageCount: 300, // Fully used/expired!
    isActive: true,
    targetCustomerType: "regular",
  },
];

export default function Promotions() {
  // Local state synced to LS to prevent losses on tab click
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem("lark_pos_promotions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROMOTIONS;
      }
    }
    return INITIAL_PROMOTIONS;
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "scheduled" | "expired"
  >("all");

  // Selected for edits/add
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to LS whenever promotions update
  useEffect(() => {
    localStorage.setItem("lark_pos_promotions", JSON.stringify(promotions));
  }, [promotions]);

  // Statistics calculation
  const stats = {
    totalCampaigns: promotions.length,
    activeCount: promotions.filter((p) => {
      const now = new Date();
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return (
        p.isActive &&
        start <= now &&
        end >= now &&
        (!p.usageLimit || p.usageCount < p.usageLimit)
      );
    }).length,
    scheduledCount: promotions.filter((p) => {
      const now = new Date();
      const start = new Date(p.startDate);
      return p.isActive && start > now;
    }).length,
    expiredCount: promotions.filter((p) => {
      const now = new Date();
      const end = new Date(p.endDate);
      return (
        !p.isActive ||
        end < now ||
        (!!p.usageLimit && p.usageCount >= p.usageLimit)
      );
    }).length,
    totalUsages: promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0),
    typeGroups: {
      percentage: promotions.filter((p) => p.type === "percentage").length,
      fixed_amount: promotions.filter((p) => p.type === "fixed_amount").length,
      free_shipping: promotions.filter((p) => p.type === "free_shipping")
        .length,
      buy_x_get_y: promotions.filter((p) => p.type === "buy_x_get_y").length,
    },
  };

  // Helper code generator
  const generateRandomCode = () => {
    const prefix = "LARK";
    const rand = Math.floor(1000 + Math.random() * 9000);
    if (editingPromo) {
      setEditingPromo((prev) => ({
        ...prev,
        code: `${prefix}${rand}`,
      }));
    }
  };

  // Handle toggle active state
  const handleToggleActive = (id: string) => {
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    );
  };

  // Delete promotional code
  const handleDeletePromo = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa chương trình khuyến mãi này không? Người mua sẽ không thể áp dụng mã này nữa.",
      )
    ) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Open creation form
  const handleOpenCreate = () => {
    const newPromo: Partial<Promotion> = {
      id: `PR-${Date.now().toString().slice(-4)}`,
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 10,
      minOrderValue: 0,
      maxDiscount: undefined,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days
      usageLimit: 100,
      usageCount: 0,
      isActive: true,
      targetCustomerType: "all",
    };
    setEditingPromo(newPromo);
    setIsDrawerOpen(true);
  };

  // Open edit form
  const handleOpenEdit = (promo: Promotion) => {
    setEditingPromo({ ...promo });
    setIsDrawerOpen(true);
  };

  // Save the promo code
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo || !editingPromo.code || !editingPromo.name) {
      alert("Vui lòng điền đầy đủ Mã khuyến mãi và Tên chiến dịch!");
      return;
    }

    // Clean up code: uppercase
    const cleanedCode = editingPromo.code.toUpperCase().replace(/\s+/g, "");

    const finalPromo: Promotion = {
      id: editingPromo.id || `PR-${Date.now().toString().slice(-4)}`,
      code: cleanedCode,
      name: editingPromo.name,
      description:
        editingPromo.description ||
        `Giảm ${editingPromo.value}${editingPromo.type === "percentage" ? "%" : "đ"} cho đơn hàng phù hợp.`,
      type: editingPromo.type || "percentage",
      value: Number(editingPromo.value) || 0,
      minOrderValue: Number(editingPromo.minOrderValue) || 0,
      maxDiscount: editingPromo.maxDiscount
        ? Number(editingPromo.maxDiscount)
        : undefined,
      startDate:
        editingPromo.startDate || new Date().toISOString().split("T")[0],
      endDate: editingPromo.endDate || new Date().toISOString().split("T")[0],
      usageLimit: editingPromo.usageLimit
        ? Number(editingPromo.usageLimit)
        : undefined,
      usageCount: editingPromo.usageCount || 0,
      isActive: editingPromo.isActive ?? true,
      targetCustomerType: editingPromo.targetCustomerType || "all",
    };

    // Check duplicate code
    const isDuplicate = promotions.some(
      (p) => p.code === finalPromo.code && p.id !== finalPromo.id,
    );
    if (isDuplicate) {
      alert(
        `Mã khuyến mãi "${finalPromo.code}" đã tồn tại! Vui lòng chọn mã khác.`,
      );
      return;
    }

    setPromotions((prev) => {
      const exists = prev.some((p) => p.id === finalPromo.id);
      if (exists) {
        return prev.map((p) => (p.id === finalPromo.id ? finalPromo : p));
      }
      return [finalPromo, ...prev];
    });

    setIsDrawerOpen(false);
    setEditingPromo(null);
  };

  // Filtering list computation
  const filteredPromotions = promotions.filter((p) => {
    // 1. Text Search
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      p.code.toLowerCase().includes(searchLower) ||
      p.name.toLowerCase().includes(searchLower) ||
      (p.description || "").toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    // 2. Type Filter
    if (typeFilter !== "all" && p.type !== typeFilter) return false;

    // 3. Status Filter
    const now = new Date();
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);

    if (statusFilter === "active") {
      const isReallyActive =
        p.isActive &&
        start <= now &&
        end >= now &&
        (!p.usageLimit || p.usageCount < p.usageLimit);
      if (!isReallyActive) return false;
    } else if (statusFilter === "scheduled") {
      const isScheduled = p.isActive && start > now;
      if (!isScheduled) return false;
    } else if (statusFilter === "expired") {
      const isExpired =
        !p.isActive ||
        end < now ||
        (!!p.usageLimit && p.usageCount >= p.usageLimit);
      if (!isExpired) return false;
    }

    return true;
  });

  const getTypeName = (type: string) => {
    switch (type) {
      case "percentage":
        return "Khấu trừ %";
      case "fixed_amount":
        return "Giảm số tiền thẳng";
      case "free_shipping":
        return "Freeship bưu tá";
      case "buy_x_get_y":
        return "Mua X tặng Y";
      default:
        return type;
    }
  };

  const getTargetName = (target?: string) => {
    switch (target) {
      case "all":
        return "Toàn bộ khách";
      case "regular":
        return "Phổ thông";
      case "vip":
        return "Vực VIP";
      case "wholesale":
        return "Khách mua sỉ";
      default:
        return "Tất cả";
    }
  };

  const getPromoProgressPercentage = (p: Promotion) => {
    if (!p.usageLimit) return 0;
    return Math.min(100, (p.usageCount / p.usageLimit) * 100);
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6 text-slate-700 font-sans"
      id="promotions-module-root"
    >
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] uppercase tracking-wider mb-1">
            <Tag size={13} className="fill-indigo-100" />
            <span>Mã giảm giá &amp; Chiến dịch</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Quản Lý Chương Trình Khuyến Mãi
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">
            Thiết lập mã voucher chiết khấu đơn hàng, giảm giá % hóa đơn hoặc
            vận chuyển miễn phí đồng bộ với cổng Pancake POS.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-[14px] transition duration-150 flex items-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
            id="btn-create-promotion"
          >
            <Plus size={15} />
            <span>Tạo chiến dịch mới</span>
          </button>
        </div>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Tổng số chương trình
            </span>
            <div className="text-xl font-black text-slate-850 tracking-tight">
              {stats.totalCampaigns}
              <span className="text-[14px] font-semibold ml-1.5 text-slate-500">
                campaigns
              </span>
            </div>
            <p className="text-[11px] text-slate-450 font-bold">
              Lưu trong cơ sở dữ liệu bán hàng
            </p>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
            <Tag size={18} />
          </div>
        </div>

        {/* Metric 2: Active */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Chiến dịch đang chạy
            </span>
            <div className="text-xl font-black text-emerald-600 tracking-tight">
              {stats.activeCount}
              <span className="text-[14px] font-semibold ml-1.5 text-emerald-500">
                đang bật
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-extrabold">
              ✓ Khách hàng có thể quét áp mã
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Metric 3: Total usages */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Lượt áp mã thành công
            </span>
            <div className="text-xl font-black text-indigo-600 tracking-tight">
              {stats.totalUsages.toLocaleString()}
              <span className="text-[14px] font-semibold ml-1 text-slate-450">
                lượt
              </span>
            </div>
            <p className="text-[11px] text-slate-450 font-semibold">
              Tự động cộng dồn doanh thu
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Metric 4: Direct breakdown distributions quick info */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group/item">
          <div className="space-y-1 w-full">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Cơ cấu thể loại giảm
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[9.5px] text-slate-500 font-bold">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>
                  % Chiết khấu:{" "}
                  <b className="text-slate-800">
                    {stats.typeGroups.percentage}
                  </b>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>
                  Khấu trừ trực tiếp:{" "}
                  <b className="text-slate-800">
                    {stats.typeGroups.fixed_amount}
                  </b>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>
                  Freeship:{" "}
                  <b className="text-slate-800">
                    {stats.typeGroups.free_shipping}
                  </b>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                <span>
                  Quà tặng:{" "}
                  <b className="text-slate-800">
                    {stats.typeGroups.buy_x_get_y}
                  </b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Search & Tabs Grid */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-full lg:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-800 shadow-xs ring-1 ring-slate-200/60"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md ${statusFilter === "all" ? "bg-slate-100 text-slate-700" : "bg-slate-200/70 text-slate-600"}`}
              >
                {stats.totalCampaigns}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-100"
                  : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Đang chạy</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md ${statusFilter === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-200/70 text-slate-600"}`}
              >
                {stats.activeCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("scheduled")}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "scheduled"
                  ? "bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-100"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              <span>Sắp diễn ra</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md ${statusFilter === "scheduled" ? "bg-indigo-50 text-indigo-650 font-bold" : "bg-slate-200/70 text-slate-600"}`}
              >
                {stats.scheduledCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("expired")}
              className={`px-3 py-1.5 rounded-lg text-[14px] font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "expired"
                  ? "bg-white text-amber-700 shadow-xs ring-1 ring-amber-100"
                  : "text-slate-500 hover:text-amber-600 hover:bg-slate-50/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Đã kết thúc</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-md ${statusFilter === "expired" ? "bg-amber-55 text-amber-700 font-bold" : "bg-slate-200/70 text-slate-600"}`}
              >
                {stats.expiredCount}
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:flex-1 lg:justify-end">
            {/* Search bar */}
            <div className="relative flex-1 w-full max-w-md">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm theo Tên chương trình, Mã code (e.g. HE2026), Mô tả chi tiết..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-[14px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-semibold text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-promotions"
              />
            </div>

            {/* Type selector dropdown */}
            <div className="w-full sm:w-auto">
              <select
                className="w-full sm:w-auto p-2 border border-slate-200 rounded-lg text-[14px] font-bold outline-hidden text-slate-600 bg-slate-50/50 cursor-pointer"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả kiểu giảm</option>
                <option value="percentage">Chiết khấu phần trăm (%)</option>
                <option value="fixed_amount">Trừ tiền mặt cố định (đ)</option>
                <option value="free_shipping">Giảm phí ship bưu tá</option>
                <option value="buy_x_get_y">Chương trình Mua X tặng Y</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.length === 0 ? (
          <div className="col-span-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-250 py-16 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto border border-slate-150">
              <AlertCircle size={22} className="text-slate-450" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-700 text-[14px] uppercase">
                Không tìm thấy khuyến mãi phù hợp
              </h4>
              <p className="text-[11px] text-slate-450 max-w-sm leading-normal mx-auto">
                Hãy thử đổi từ khóa tìm kiếm, thay đổi một bộ lọc trạng thái
                hoặc bấm "Tạo chiến dịch mới" để tiến hành thêm mã voucher.
              </p>
            </div>
          </div>
        ) : (
          filteredPromotions.map((p) => {
            const now = new Date();
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            const isFullyUsed = p.usageLimit
              ? p.usageCount >= p.usageLimit
              : false;
            const isNotStarted = start > now;
            const isExpired = end < now;

            // Render specific status badge
            let statusBadge = (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-120">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hoạt động</span>
              </span>
            );

            if (!p.isActive) {
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-220">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Đã tắt / Tạm hoãn</span>
                </span>
              );
            } else if (isFullyUsed) {
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Hết lượt dùng</span>
                </span>
              );
            } else if (isExpired) {
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-120">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Hết thời hạn</span>
                </span>
              );
            } else if (isNotStarted) {
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>Sắp kích hoạt</span>
                </span>
              );
            }

            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl border p-5 shadow-3xs flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                  p.isActive
                    ? "border-slate-200/60 hover:border-slate-300"
                    : "border-slate-200 bg-slate-50/20 opacity-80"
                }`}
              >
                {/* Visual stamp cut/notch for coupon style */}
                <div className="absolute top-1/2 -left-2.5 w-5 h-5 rounded-full bg-slate-50/90 border-r border-slate-200 -translate-y-1/2"></div>
                <div className="absolute top-1/2 -right-2.5 w-5 h-5 rounded-full bg-slate-50/90 border-l border-slate-200 -translate-y-1/2"></div>

                <div className="space-y-3">
                  {/* Top line ID & badge status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-black tracking-wider text-slate-400 font-mono">
                      {p.id}
                    </span>
                    {statusBadge}
                  </div>

                  {/* Coupon Title Area */}
                  <div className="flex items-start gap-2.5 pt-1.5">
                    {/* Left Icon box depending on type */}
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 ${
                        p.type === "percentage"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : p.type === "fixed_amount"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : p.type === "free_shipping"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-pink-50 text-pink-600 border-pink-100"
                      }`}
                    >
                      {p.type === "percentage" && <Percent size={18} />}
                      {p.type === "fixed_amount" && <Coins size={18} />}
                      {p.type === "free_shipping" && <QrCode size={18} />}
                      {p.type === "buy_x_get_y" && <Sparkles size={18} />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-extrabold text-slate-800 text-[16px] tracking-tight leading-tight group-hover:text-indigo-650 transition">
                        {p.name}
                      </h3>
                      {/* Bold code badge */}
                      <span className="inline-block mt-1 font-mono text-[14px] font-black tracking-wider text-indigo-600 bg-indigo-50/60 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                        {p.code}
                      </span>
                    </div>
                  </div>

                  {/* Condition Details description paragraph */}
                  <p className="text-[12px] text-slate-500 font-semibold leading-relaxed pt-1 select-all h-10 overflow-hidden line-clamp-2">
                    {p.description}
                  </p>

                  {/* Conditions & limits brief bullet metadata labels */}
                  <div className="bg-slate-50/60 rounded-lg border border-slate-100 p-2.5 space-y-1.5 text-[11px] text-slate-500 font-bold">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">
                        Hình thức:
                      </span>
                      <span className="text-slate-700 font-extrabold">
                        {getTypeName(p.type)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">
                        Trị giá chiết khấu:
                      </span>
                      <span className="text-indigo-600 font-extrabold text-[14px]">
                        {p.type === "percentage"
                          ? `${p.value}%`
                          : `${p.value.toLocaleString()}đ`}
                      </span>
                    </div>
                    {p.type === "percentage" && p.maxDiscount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold">
                          Giảm tối đa:
                        </span>
                        <span className="text-slate-700 font-extrabold">
                          {p.maxDiscount.toLocaleString()}đ
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">
                        Đơn hàng tối thiểu:
                      </span>
                      <span className="text-slate-700 font-extrabold">
                        {p.minOrderValue.toLocaleString()}đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-semibold">
                        Nhóm đối tượng:
                      </span>
                      <span className="text-blue-600 bg-blue-50 px-1 rounded font-extrabold text-[10px]">
                        {getTargetName(p.targetCustomerType)}
                      </span>
                    </div>
                  </div>

                  {/* Progress tracker slider if limit is configured */}
                  {p.usageLimit ? (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>Đã sử dụng</span>
                        <span className="text-slate-600">
                          {p.usageCount} / {p.usageLimit} lượt
                        </span>
                      </div>
                      <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            getPromoProgressPercentage(p) > 85
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${getPromoProgressPercentage(p)}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold pt-1 flex justify-between">
                      <span>
                        Đã sử dụng:{" "}
                        <b className="text-slate-600">{p.usageCount} lượt</b>
                      </span>
                      <span>Không giới hạn dùng</span>
                    </div>
                  )}
                </div>

                {/* Bottom metadata timelines and interactions */}
                <div className="border-t border-slate-100/80 pt-3.5 mt-4 flex items-center justify-between">
                  {/* Timeline Date period */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                    <Calendar size={11} />
                    <span>
                      {new Date(p.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(p.endDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* Call to arms buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Active/Inactive switch */}
                    <button
                      onClick={() => handleToggleActive(p.id)}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition cursor-pointer font-bold ${
                        p.isActive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-250 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200"
                      }`}
                      title="Bật/Tắt khuyến mãi"
                    >
                      {p.isActive ? "Đang bật" : "Đang tắt"}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 px-1.5 hover:bg-slate-100 text-indigo-600 hover:text-indigo-700 rounded border border-slate-200 hover:border-slate-300 transition duration-150 cursor-pointer"
                      title="Sửa"
                    >
                      <Edit size={12} />
                    </button>

                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1 px-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded border border-slate-200 hover:border-rose-150 transition duration-150 cursor-pointer"
                      title="Xóa"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATION & MODIFICATION FORM POPUP MODAL IN-COMPONENT */}
      {isDrawerOpen && editingPromo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          id="promotion-drawer-container"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          {/* Centered Modal Container */}
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header modal */}
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-[16px] uppercase">
                  {editingPromo.id &&
                  promotions.some((p) => p.id === editingPromo.id)
                    ? "Chỉnh Sửa Khuyến Mãi"
                    : "Thêm Khuyến Mãi Mới"}
                </h3>
                <p className="text-[11px] text-indigo-600 font-bold mt-0.5 font-mono">
                  {editingPromo.id}
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleSavePromo}
              className="flex-1 overflow-y-auto p-6 space-y-4 text-[14px]"
            >
              {/* Promo Code section */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    Mã khuyến mãi (Voucher Code) *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] text-indigo-600 hover:underline font-extrabold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={11} className="fill-indigo-100" />
                    <span>Tự tạo mã sạch</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HE2026, FREESHIP50..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-mono uppercase font-black tracking-wider outline-hidden text-slate-800 focus:border-indigo-500"
                  value={editingPromo.code || ""}
                  onChange={(e) =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  id="input-promo-code"
                />
                <p className="text-[9.5px] text-slate-450 font-bold">
                  Mã viết liền không dấu, không khoảng cách, sẽ tự động viết hoa
                  toàn bộ.
                </p>
              </div>

              {/* Campaign Title / Name */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-slate-500 text-[11px]">
                  Tên chương trình / Chiến dịch *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giảm giá mùa hè rực rỡ, Đón chào tân binh..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-extrabold outline-hidden text-slate-850 focus:border-indigo-500"
                  value={editingPromo.name || ""}
                  onChange={(e) =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  id="input-promo-name"
                />
              </div>

              {/* Detailed description text */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-slate-500 text-[11px]">
                  Mô tả điều kiện &amp; Quy chuẩn áp dụng
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả cụ thể để nhân viên bán hàng dễ phân tích và tư vấn..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-650 outline-hidden focus:border-indigo-500"
                  value={editingPromo.description || ""}
                  onChange={(e) =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  id="input-promo-desc"
                />
              </div>

              {/* Grid Type and Value fields */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    Hình thức giảm
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-lg p-2.5 font-extrabold outline-hidden text-slate-700 bg-white"
                    value={editingPromo.type || "percentage"}
                    onChange={(e) =>
                      setEditingPromo((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                        value: e.target.value === "percentage" ? 10 : 20000,
                      }))
                    }
                  >
                    <option value="percentage">Chiết khấu phần trăm (%)</option>
                    <option value="fixed_amount">Trừ tiền mặt thẳng (đ)</option>
                    <option value="free_shipping">
                      Giảm phí ship bưu tá (đ)
                    </option>
                    <option value="buy_x_get_y">
                      Chương trình Mua X tặng Y
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    {editingPromo.type === "percentage"
                      ? "Giá trị chiết khấu (%)"
                      : editingPromo.type === "buy_x_get_y"
                        ? "Số sản phẩm tặng"
                        : "Mức giảm (VNĐ)"}{" "}
                    *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      className="w-full border border-slate-200 rounded-lg p-2.5 pl-3 pr-8 font-black outline-hidden text-slate-800"
                      value={editingPromo.value || ""}
                      onChange={(e) =>
                        setEditingPromo((prev) => ({
                          ...prev,
                          value: Number(e.target.value),
                        }))
                      }
                      id="input-promo-value"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 font-black text-slate-400">
                      {editingPromo.type === "percentage"
                        ? "%"
                        : editingPromo.type === "buy_x_get_y"
                          ? "SP"
                          : "đ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bounds limits (Max discount is only available when type is percentage) */}
              {editingPromo.type === "percentage" && (
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    Giới hạn số tiền giảm tối đa (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Để trống nếu không giới hạn tối đa"
                      className="w-full border border-slate-200 rounded-lg p-2.5 pr-8 font-extrabold outline-hidden text-slate-755"
                      value={editingPromo.maxDiscount || ""}
                      onChange={(e) =>
                        setEditingPromo((prev) => ({
                          ...prev,
                          maxDiscount: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      id="input-promo-max-discount"
                    />
                    <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 font-black text-slate-400">
                      đ
                    </span>
                  </div>
                </div>
              )}

              {/* Minimum Order Value */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-slate-500 text-[11px]">
                  Giá trị đơn hàng tối thiểu cần thu (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Ví dụ: 100000"
                    className="w-full border border-slate-200 rounded-lg p-2.5 pr-8 font-black outline-hidden text-slate-850"
                    value={editingPromo.minOrderValue || ""}
                    onChange={(e) =>
                      setEditingPromo((prev) => ({
                        ...prev,
                        minOrderValue: Number(e.target.value),
                      }))
                    }
                    id="input-promo-min-order"
                  />
                  <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 font-black text-slate-400">
                    đ
                  </span>
                </div>
              </div>

              {/* Target Audience Scope group */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-slate-500 text-[11px]">
                  Nhóm đối tượng khách hàng áp dụng
                </label>
                <select
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-extrabold outline-hidden text-slate-700 bg-white"
                  value={editingPromo.targetCustomerType || "all"}
                  onChange={(e: any) =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      targetCustomerType: e.target.value,
                    }))
                  }
                >
                  <option value="all">
                    Mọi nhóm đối tượng khách hàng (Tất cả)
                  </option>
                  <option value="regular">Chỉ thuộc phân khúc Phổ thông</option>
                  <option value="vip">
                    Chỉ dành đặc quyền cho Thành viên VIP
                  </option>
                  <option value="wholesale">
                    Chỉ hiển thị cho Đối tác mua sỉ
                  </option>
                </select>
              </div>

              {/* Total Usage Limit */}
              <div className="space-y-1.5">
                <label className="font-black uppercase text-slate-500 text-[11px]">
                  Tổng lượt phát hành tối đa (Usage Limit)
                </label>
                <input
                  type="number"
                  placeholder="Không điền để mở vô hạn lượt dùng"
                  className="w-full border border-slate-200 rounded-lg p-2.5 font-extrabold outline-hidden text-slate-700"
                  value={editingPromo.usageLimit || ""}
                  onChange={(e) =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      usageLimit: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  id="input-promo-usage-limit"
                />
              </div>

              {/* Effective Dates timelines period */}
              <div className="grid grid-cols-2 gap-3.5 pt-1.5 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    Ngày bắt đầu hiệu lực
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-200 rounded-lg p-2 font-bold outline-hidden text-slate-700"
                    value={editingPromo.startDate || ""}
                    onChange={(e) =>
                      setEditingPromo((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    id="input-promo-start-date"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-black uppercase text-slate-500 text-[11px]">
                    Ngày hết hạn chiến dịch
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-200 rounded-lg p-2 font-bold outline-hidden text-slate-700"
                    value={editingPromo.endDate || ""}
                    onChange={(e) =>
                      setEditingPromo((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    id="input-promo-end-date"
                  />
                </div>
              </div>

              {/* Quick Toggle Status */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <div className="space-y-0.5">
                  <label className="font-extrabold text-slate-800 text-[12px]">
                    Trạng thái chiến dịch
                  </label>
                  <p className="text-[10px] text-slate-450 leading-none">
                    Cho phép kích hoạt áp dụng lập tức tại quầy thu ngân
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPromo((prev) => ({
                      ...prev,
                      isActive: !prev?.isActive,
                    }))
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    editingPromo.isActive ? "bg-indigo-600" : "bg-slate-350"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      editingPromo.isActive ? "right-1" : "left-1"
                    }`}
                  ></span>
                </button>
              </div>

              {/* Modal actions buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-[14px] font-bold transition duration-150 cursor-pointer text-slate-600"
                >
                  Đóng bỏ qua
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-extrabold rounded-lg transition duration-150 shadow-md shadow-indigo-500/10 cursor-pointer"
                  id="submit-save-promo-drawer"
                >
                  Lưu chiến dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
