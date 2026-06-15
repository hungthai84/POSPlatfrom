import React, { useState, useEffect } from "react";
import { Order } from "../types";
import {
  CircleDollarSign,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  X,
  FileSpreadsheet,
  Upload,
  ArrowRight,
  Sparkles,
  Download,
  Clock,
  Coins,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Check,
  Percent,
  FileCheck2,
  Lock,
} from "lucide-react";

interface ReconciliationProps {
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: Order["status"]) => void;
}

interface ReconcileState {
  status: "reconciled" | "discrepancy" | "unreconciled";
  receivedAmount: number;
  notes: string;
  reconciledAt?: string;
  statementKey?: string;
}

interface ReconciliationSession {
  id: string;
  date: string;
  source: string;
  totalOrders: number;
  reconciledCount: number;
  discrepancyCount: number;
  netImpact: number;
}

export default function Reconciliation({ orders }: ReconciliationProps) {
  // Reconciliation database states stored locally
  const [reconciliations, setReconciliations] = useState<
    Record<string, ReconcileState>
  >(() => {
    const saved = localStorage.getItem("lark_pos_reconciliations");
    return saved ? JSON.parse(saved) : {};
  });

  const [sessions, setSessions] = useState<ReconciliationSession[]>(() => {
    const saved = localStorage.getItem("lark_pos_reconciliation_sessions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "RC-101",
        date: "2026-06-11T14:30:00Z",
        source: "Báo cáo COD Giao Hàng Tiết Kiệm (GHTK)",
        totalOrders: 2,
        reconciledCount: 1,
        discrepancyCount: 1,
        netImpact: -89000,
      },
      {
        id: "RC-100",
        date: "2026-06-05T10:00:00Z",
        source: "Sao kê ngân hàng Vietcombank",
        totalOrders: 1,
        reconciledCount: 1,
        discrepancyCount: 0,
        netImpact: 0,
      },
    ];
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(
      "lark_pos_reconciliations",
      JSON.stringify(reconciliations),
    );
  }, [reconciliations]);

  useEffect(() => {
    localStorage.setItem(
      "lark_pos_reconciliation_sessions",
      JSON.stringify(sessions),
    );
  }, [sessions]);

  // Tab & Filters Setup
  const [activeTab, setActiveTab] = useState<"manual" | "auto" | "history">(
    "manual",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "reconciled" | "discrepancy" | "unreconciled"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("all");

  // Selected Order for side-drawer manual reconciliation
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingReceived, setEditingReceived] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<string>("");

  // Auto Matching Tool States
  const [pasteText, setPasteText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Template contents for quick testing
  const templates = {
    ghtk: `MÃ VẬN ĐƠN\tMÃ ĐƠN HÀNG\tTIỀN HÀNG SỰ THỰC THU\tGHI CHÚ GIAO\nGHTK1000192\tDH-10001\t693000\tĐã phát thành công - Người nhận ký nhận\nGHTK1000213\tDH-10002\t1000000\tĐã ký nhận - Khách xin bớt 89k do trầy xước nhẹ\nGHTK2938120\tDH-14569\t350000\tĐịa chỉ ngoài vùng giao - Đơn tự do phát sinh`,
    vcb: `13/06/2026 08:20 AM\t+5,692,500 VND\tND: DH-10003 chuyen khoan tien mua ao thun va balo Power Service VIP\n13/06/2026 09:15 AM\t+572,000 VND\tND: Tai khoan DH-10004 thanh toan mua hang binh nuoc\n12/06/2026 14:10 PM\t+1,200,000 VND\tND: CHU VAN KHUONG CK MUA BUON`,
    momo: `MOMO-839218\t220,000 VND\tThanh toan don le hoa don Power Service POS\nMOMO-DH10001\t693,000 VND\tDH-10001 app pay`,
  };

  // Switch template
  const handleSelectTemplate = (tpl: string) => {
    setSelectedTemplate(tpl);
    if (tpl === "ghtk") {
      setPasteText(templates.ghtk);
    } else if (tpl === "vcb") {
      setPasteText(templates.vcb);
    } else if (tpl === "momo") {
      setPasteText(templates.momo);
    } else {
      setPasteText("");
    }
    setIsAnalyzed(false);
    setParsedItems([]);
  };

  // Custom analysis logic with regular expressions to scan text logs
  const handleAnalyzeStatement = () => {
    if (!pasteText.trim()) return;

    // Scan lines
    const lines = pasteText.split("\n");
    const matchedAnalysis: any[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      // Extract Order Code via RegExp "DH-10001" or "DH10001" or "DH-1000[1-9]"
      const orderMatch = line.match(/(DH-?\d+)/i);
      const orderIdFound = orderMatch
        ? orderMatch[1].toUpperCase().replace("DH", "DH-")
        : null;

      // Extract raw amount: scan for number tokens over 1000 (e.g. 5,692,500 or 693000)
      // Clean periods, commas, "VND", etc.
      let guessedAmount = 0;
      const cleanLine = line.replace(/,/g, "").replace(/\./g, "");
      const numMatches = cleanLine.match(/(\d{4,9})/g);
      if (numMatches && numMatches.length > 0) {
        // usually the amount is the largest/first matching high number, but we can look for numbers that aren't the order code
        const candidates = numMatches
          .map(Number)
          .filter(
            (n) =>
              n !== 10001 &&
              n !== 10002 &&
              n !== 10003 &&
              n !== 10004 &&
              n !== 14569,
          );
        guessedAmount = candidates.length > 0 ? candidates[0] : 0;
      }

      if (orderIdFound) {
        // Find if this order actually exists in our store
        const existingOrder = orders.find(
          (o) =>
            o.id === orderIdFound || o.id === orderIdFound.replace("-", ""),
        );
        if (existingOrder) {
          const expected = existingOrder.finalAmount;
          const delta = guessedAmount - expected;
          matchedAnalysis.push({
            lineNumber: index + 1,
            rawText: line,
            foundCode: orderIdFound,
            matchedOrder: existingOrder,
            parsedAmount: guessedAmount,
            expectedAmount: expected,
            status: delta === 0 ? "perfect" : "discrepancy",
            difference: delta,
            note:
              delta === 0
                ? "Khớp hoàn toàn 100%"
                : `Lệch ${delta > 0 ? "+" : ""}${delta.toLocaleString("vi-VN")}đ`,
          });
        } else {
          // Has valid order code pattern but not in DB
          matchedAnalysis.push({
            lineNumber: index + 1,
            rawText: line,
            foundCode: orderIdFound,
            matchedOrder: null,
            parsedAmount: guessedAmount,
            expectedAmount: 0,
            status: "not_found",
            difference: guessedAmount,
            note: "Không tìm thấy mã đơn hàng trên hệ thống POS",
          });
        }
      } else if (guessedAmount > 0) {
        // No code found but has an amount
        matchedAnalysis.push({
          lineNumber: index + 1,
          rawText: line,
          foundCode: null,
          matchedOrder: null,
          parsedAmount: guessedAmount,
          expectedAmount: 0,
          status: "unknown",
          difference: guessedAmount,
          note: "Giao dịch không ghi kèm mã đơn hàng",
        });
      }
    });

    setParsedItems(matchedAnalysis);
    setIsAnalyzed(true);
  };

  // Apply batch reconciliation to the selected matches
  const handleApplyBatchReconciliation = (sourceName: string) => {
    const nextRecons = { ...reconciliations };
    let reconciledCount = 0;
    let discrepancyCount = 0;
    let netImpact = 0;

    parsedItems.forEach((item) => {
      if (item.matchedOrder) {
        const orderId = item.matchedOrder.id;
        const state: ReconcileState = {
          status: item.status === "perfect" ? "reconciled" : "discrepancy",
          receivedAmount: item.parsedAmount,
          notes:
            item.status === "perfect"
              ? `Đối soát tự động qua ${sourceName}.`
              : `Lệch số tiền thực nhận so với hóa đơn (${item.note}).`,
          reconciledAt: new Date().toISOString(),
          statementKey: sourceName,
        };
        nextRecons[orderId] = state;

        if (item.status === "perfect") reconciledCount++;
        else discrepancyCount++;

        netImpact += item.difference;
      }
    });

    setReconciliations(nextRecons);

    // Save logs of this session
    const newSession: ReconciliationSession = {
      id: `RC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      source: sourceName,
      totalOrders: reconciledCount + discrepancyCount,
      reconciledCount,
      discrepancyCount,
      netImpact,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Reset analyzers and show success message
    setIsAnalyzed(false);
    setPasteText("");
    setParsedItems([]);
    setSelectedTemplate("none");
    setActiveTab("history");
  };

  // Open manual reconciliation for order
  const handleOpenManualEdit = (order: Order) => {
    setSelectedOrderId(order.id);
    const existing = reconciliations[order.id];
    setEditingReceived(existing ? existing.receivedAmount : order.finalAmount);
    setEditingNotes(existing ? existing.notes : "");
  };

  // Save manual reconciliation
  const handleSaveManual = () => {
    if (!selectedOrderId) return;
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!order) return;

    const diff = editingReceived - order.finalAmount;
    const status = diff === 0 ? "reconciled" : "discrepancy";

    setReconciliations((prev) => ({
      ...prev,
      [selectedOrderId]: {
        status,
        receivedAmount: editingReceived,
        notes:
          editingNotes ||
          (status === "reconciled"
            ? "Thủ công hợp lệ."
            : `Chênh lệch ${diff.toLocaleString("vi-VN")}đ`),
        reconciledAt: new Date().toISOString(),
      },
    }));

    setSelectedOrderId(null);
  };

  // Delete/Reset manual reconciliation for order
  const handleResetManual = (orderId: string) => {
    setReconciliations((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
    }
  };

  // Calculate high-level financial summary
  // We only count orders that are processing or completed (active flows) plus those reconciled
  const activeOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "processing",
  );

  const stats = {
    totalExpected: activeOrders.reduce((sum, o) => sum + o.finalAmount, 0),
    totalReconciled: (
      Object.entries(reconciliations) as [string, ReconcileState][]
    ).reduce((sum, [orderId, rec]) => {
      const orderExists = activeOrders.some((o) => o.id === orderId);
      if (orderExists && rec.status === "reconciled") {
        return sum + rec.receivedAmount;
      }
      return sum;
    }, 0),
    totalDiscrepancyStore: (
      Object.entries(reconciliations) as [string, ReconcileState][]
    ).reduce((sum, [orderId, rec]) => {
      const order = activeOrders.find((o) => o.id === orderId);
      if (order && rec.status === "discrepancy") {
        return sum + (rec.receivedAmount - order.finalAmount);
      }
      return sum;
    }, 0),
    countReconciled: (
      Object.values(reconciliations) as ReconcileState[]
    ).filter((r) => r.status === "reconciled").length,
    countDiscrepancy: (
      Object.values(reconciliations) as ReconcileState[]
    ).filter((r) => r.status === "discrepancy").length,
    countUnreconciled: activeOrders.filter((o) => {
      const rec = reconciliations[o.id];
      return !rec || rec.status === "unreconciled";
    }).length,
    totalUnreconciledAmount: activeOrders.reduce((sum, o) => {
      const rec = reconciliations[o.id];
      if (!rec || rec.status === "unreconciled") {
        return sum + o.finalAmount;
      }
      return sum;
    }, 0),
  };

  // Filtered Orders List computation
  const filteredOrders = activeOrders.filter((o) => {
    // 1. Text Search
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(searchLower) ||
      (o.customer?.name || "").toLowerCase().includes(searchLower) ||
      (o.customer?.phone || "").includes(searchTerm);

    if (!matchSearch) return false;

    // 2. Reconciliation Status
    const rec = reconciliations[o.id];
    const recStatus = rec ? rec.status : "unreconciled";
    if (statusFilter !== "all" && recStatus !== statusFilter) return false;

    // 3. Payment Method
    if (paymentFilter !== "all" && o.paymentMethod !== paymentFilter)
      return false;

    // 4. Date filtering
    if (dateFilter !== "all") {
      const date = new Date(o.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (dateFilter === "today" && diffDays > 1) return false;
      if (dateFilter === "7days" && diffDays > 7) return false;
      if (dateFilter === "30days" && diffDays > 30) return false;
    }

    return true;
  });

  const getPaymentName = (method: string) => {
    switch (method) {
      case "cash":
        return "Tiền mặt";
      case "card":
        return "Thẻ POS";
      case "bank_transfer":
        return "Chuyển khoản";
      case "e_wallet":
        return "Ví điện tử";
      default:
        return method;
    }
  };

  // Export Reconciliation Sheet as a Mock CSV Download
  const handleExportReconciliationDataset = () => {
    let csvContent =
      "Mã đơn hàng,Khách hàng,Tổng tiền hàng,Phương thức thanh toán,Ngày tạo,Trạng thái đối soát,Thực nhận VNĐ,Mẹo biệt lập / Chênh lệch,Ngày đối soát,Ghi chú\n";

    activeOrders.forEach((o) => {
      const rec = reconciliations[o.id];
      const statusText = rec
        ? rec.status === "reconciled"
          ? "Đã đối soát"
          : "Sai lệch"
        : "Chưa đối soát";
      const rAmount = rec ? rec.receivedAmount : 0;
      const discrepancyValue = rec ? rec.receivedAmount - o.finalAmount : 0;
      const recDate =
        rec && rec.reconciledAt
          ? new Date(rec.reconciledAt).toLocaleDateString("vi-VN")
          : "";
      const notes = rec ? rec.notes.replace(/,/g, ";") : "";

      csvContent += `${o.id},${o.customer?.name || "Khách vãng lai"},${o.finalAmount},${getPaymentName(o.paymentMethod)},${new Date(o.createdAt).toLocaleDateString("vi-VN")},${statusText},${rAmount},${discrepancyValue},${recDate},${notes}\n`;
    });

    const blob = new Blob([`\ufeff${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bao_cao_doi_soat_lark_pos_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="p-6 max-w-7xl mx-auto space-y-6 text-slate-700 font-sans"
      id="reconciliation-module-view"
    >
      {/* Module Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-[14px] uppercase tracking-wider mb-1">
            <Coins size={14} />
            <span>Phân Hệ Quản Lý Tài Chính</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Đối Soát Giao Dịch &amp; Doanh Thu
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">
            Tra cứu chênh lệch ngân quỹ, COD nhà vận chuyển và đối sánh số dư
            tài khoản ngân hàng thông minh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReconciliationDataset}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[14px] transition duration-150 flex items-center gap-1.5 shadow-xs cursor-pointer"
            id="btn-export-recons"
          >
            <FileSpreadsheet size={14} />
            <span>Xuất bảng kê XLS</span>
          </button>
        </div>
      </div>

      {/* Grid of Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Doanh thu ghi nhận (POS)
            </span>
            <div className="text-[20px] font-black text-slate-800 tracking-tight">
              {stats.totalExpected.toLocaleString("vi-VN")}
              <span className="text-[14px] font-semibold ml-0.5">đ</span>
            </div>
            <p className="text-[11px] text-slate-450 font-bold">
              {activeOrders.length} đơn hoàn thành/vận chuyển
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <CircleDollarSign size={18} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300"></div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Tiền đã đối soát (Thực nhận)
            </span>
            <div className="text-[20px] font-black text-emerald-600 tracking-tight">
              {stats.totalReconciled.toLocaleString("vi-VN")}
              <span className="text-[14px] font-semibold ml-0.5">đ</span>
            </div>
            <p className="text-[11px] text-emerald-650 font-extrabold">
              ✓ {stats.countReconciled} đơn trùng khớp tuyệt đối
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle size={18} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300"></div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Đang chờ đối soát
            </span>
            <div className="text-[20px] font-black text-amber-500 tracking-tight">
              {stats.totalUnreconciledAmount.toLocaleString("vi-VN")}
              <span className="text-[14px] font-semibold ml-0.5">đ</span>
            </div>
            <p className="text-[11px] text-amber-600 font-extrabold">
              ⏳ {stats.countUnreconciled} đơn chờ khớp lệnh tiền
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl border border-amber-100">
            <Clock size={18} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300"></div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
              Sai lệch phát hiện
            </span>
            <div
              className={`text-[20px] font-black tracking-tight ${stats.totalDiscrepancyStore !== 0 ? "text-red-500 shadow-rose-200" : "text-slate-500"}`}
            >
              {stats.totalDiscrepancyStore > 0 ? "+" : ""}
              {stats.totalDiscrepancyStore.toLocaleString("vi-VN")}
              <span className="text-[14px] font-semibold ml-0.5">đ</span>
            </div>
            <p className="text-[11px] text-red-550 font-extrabold">
              ⚠ {stats.countDiscrepancy} đơn lệch số liệu cần xử lý
            </p>
          </div>
          <div
            className={`p-3 rounded-xl border ${stats.totalDiscrepancyStore !== 0 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"}`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-all duration-300"></div>
        </div>
      </div>

      {/* Tabs selectors with elegant pills */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("manual")}
          className={`pb-3 text-[14px] font-black tracking-wide uppercase px-4 border-b-2 transition duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "manual"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
          id="tab-manual-recons"
        >
          <Plus size={13} />
          <span>Đối soát thủ công</span>
        </button>

        <button
          onClick={() => setActiveTab("auto")}
          className={`pb-3 text-[14px] font-black tracking-wide uppercase px-4 border-b-2 transition duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "auto"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
          id="tab-auto-recons"
        >
          <Sparkles size={13} className="text-indigo-600 fill-indigo-100" />
          <span>Đối soát Sao kê tự động (AI)</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-[14px] font-black tracking-wide uppercase px-4 border-b-2 transition duration-200 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-450 hover:text-slate-700"
          }`}
          id="tab-history-recons"
        >
          <FileCheck2 size={13} />
          <span>Nhật ký phiên ({sessions.length})</span>
        </button>
      </div>

      {/* TAB 1: MANUAL RECONCILIATION */}
      {activeTab === "manual" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel (2/3 weight): Table of Orders and filtering */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã đơn (DH-...), Khách hàng, SĐT..."
                    className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-[14px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-semibold text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    id="search-reconcile-orders"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="p-1.5 border border-slate-200 rounded-lg text-[14px] font-bold outline-hidden text-slate-600 bg-slate-50/50"
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Mọi trạng thái đối soát</option>
                    <option value="unreconciled">Chưa đối soát</option>
                    <option value="reconciled">Khớp hoàn hảo</option>
                    <option value="discrepancy">Có sai lệch tiền</option>
                  </select>

                  <select
                    className="p-1.5 border border-slate-200 rounded-lg text-[14px] font-bold outline-hidden text-slate-600 bg-slate-50/50"
                    value={paymentFilter}
                    onChange={(e: any) => setPaymentFilter(e.target.value)}
                  >
                    <option value="all">Tất cả thanh toán</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="card">Thẻ POS</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="e_wallet">Ví điện tử</option>
                  </select>

                  <select
                    className="p-1.5 border border-slate-200 rounded-lg text-[14px] font-bold outline-hidden text-slate-600 bg-slate-50/50"
                    value={dateFilter}
                    onChange={(e: any) => setDateFilter(e.target.value)}
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="7days">7 ngày qua</option>
                    <option value="30days">30 ngày qua</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px] border-collapse">
                  <thead>
                    <tr className="bg-slate-55/65 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                      <th className="py-3 px-4 font-black">Mã đơn hàng</th>
                      <th className="py-3 px-4 font-black">Khách hàng</th>
                      <th className="py-3 px-4 font-black text-right">
                        Tổng tiền hàng
                      </th>
                      <th className="py-3 px-4 font-black">Thanh toán</th>
                      <th className="py-3 px-4 font-black">
                        Trạng thái đổi soát
                      </th>
                      <th className="py-3 px-4 font-black text-right">
                        Thực nhận
                      </th>
                      <th className="py-3 px-4 font-black text-center">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-10 text-slate-400"
                        >
                          Không tìm thấy đơn hàng nào cần đối soát thỏa mãn bộ
                          lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const rec = reconciliations[order.id];
                        const diffVal = rec
                          ? rec.receivedAmount - order.finalAmount
                          : 0;

                        return (
                          <tr
                            key={order.id}
                            className={`hover:bg-slate-50/70 transition-colors ${selectedOrderId === order.id ? "bg-indigo-50/30" : ""}`}
                          >
                            <td className="py-3 px-4">
                              <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[11px]">
                                {order.id}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1 font-semibold font-mono">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN",
                                )}{" "}
                                {new Date(order.createdAt).toLocaleTimeString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-slate-800">
                                {order.customer?.name || "Khách vãng lai"}
                              </div>
                              <div className="text-[11px] text-slate-450 font-semibold">
                                {order.customer?.phone || "N/A"}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-800">
                              {order.finalAmount.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-150 rounded px-1.5 py-0.5 font-bold text-slate-650">
                                {getPaymentName(order.paymentMethod)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {!rec ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                                  <Clock size={10} />
                                  <span>Chờ đối soát</span>
                                </span>
                              ) : rec.status === "reconciled" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-110">
                                  <CheckCircle size={10} />
                                  <span>Đã khớp</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150 animate-pulse">
                                  <AlertTriangle size={10} />
                                  <span>
                                    Sai lệch ({diffVal > 0 ? "+" : ""}
                                    {diffVal ? (diffVal / 1000).toFixed(0) : 0}
                                    k)
                                  </span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                              {rec
                                ? `${rec.receivedAmount.toLocaleString("vi-VN")}đ`
                                : "---"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenManualEdit(order)}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-150 hover:border-indigo-200 text-[11px] px-2 font-bold transition duration-150 cursor-pointer"
                                  id={`btn-manual-recons-${order.id}`}
                                >
                                  {rec ? "Chỉnh sửa" : "Đối soát"}
                                </button>
                                {rec && (
                                  <button
                                    onClick={() => handleResetManual(order.id)}
                                    className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded border border-slate-200 hover:border-rose-200 transition"
                                    title="Hủy kết quả đối soát"
                                  >
                                    <Trash2 size={12} />
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
          </div>

          {/* Right panel (1/3 weight): Selected order manual configuration form */}
          <div className="lg:col-span-1">
            {selectedOrderId ? (
              (() => {
                const order = orders.find((o) => o.id === selectedOrderId);
                if (!order) return null;
                const rec = reconciliations[order.id];
                const diff = editingReceived - order.finalAmount;

                return (
                  <div
                    className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm space-y-4 animate-in slide-in-from-right-3 duration-200"
                    id="manual-reconcile-card"
                  >
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">
                          Chi tiết đối soát đơn
                        </h4>
                        <p className="text-[11px] text-indigo-650 font-bold mt-0.5 font-mono">
                          {order.id}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrderId(null)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Order info summary */}
                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-150 text-slate-600 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-semibold">
                          Khách hàng:
                        </span>
                        <span className="font-bold text-slate-750">
                          {order.customer?.name || "Khách vãng lai"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-semibold">
                          Thanh toán theo đơn:
                        </span>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1 rounded font-mono">
                          {getPaymentName(order.paymentMethod)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-dashed border-slate-200/80 pt-1.5 mt-1 text-[14px]">
                        <span className="text-slate-500 font-bold">
                          Số tiền cần thu:
                        </span>
                        <span className="font-black text-slate-800">
                          {order.finalAmount.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>

                    {/* Items list breakdown */}
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                      <span className="text-[11px] uppercase font-bold text-slate-450">
                        Sản phẩm bán ({order.items.length})
                      </span>
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-[11px] border-b border-slate-50 pb-1 pt-0.5"
                        >
                          <span className="text-slate-600 font-semibold truncate max-w-[120px]">
                            {it.productName} ({it.variantName})
                          </span>
                          <span className="text-slate-500 font-mono">
                            x{it.quantity} - {it.price.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Input form */}
                    <div className="space-y-3.5 pt-2 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-500 flex justify-between">
                          <span>Số tiền thực tế thực nhận (VNĐ)</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingReceived(order.finalAmount)
                            }
                            className="text-[11px] text-blue-600 hover:underline font-extrabold cursor-pointer"
                          >
                            Khớp 100%
                          </button>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-[14px] outline-hidden text-slate-700 font-extrabold bg-white"
                            value={editingReceived || ""}
                            onChange={(e) =>
                              setEditingReceived(Number(e.target.value))
                            }
                            id="input-received-amount"
                          />
                          <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-[11px] font-bold text-slate-400">
                            đ
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-slate-500">
                          Ghi chú đối soát
                        </label>
                        <textarea
                          className="w-full border border-slate-200 rounded-lg p-3 text-[14px] outline-hidden focus:border-indigo-500 text-slate-650 font-medium"
                          rows={2}
                          placeholder="Có thể ghi chú lý do lệch tiền (phí phát sinh, hoàn hàng, chiết khấu khách hàng mua nhiều...)"
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          id="textarea-reconcile-notes"
                        />
                      </div>

                      {/* Calculated Outcome */}
                      <div
                        className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                          diff === 0
                            ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                            : "bg-rose-50 border-rose-150 text-rose-700"
                        }`}
                      >
                        {diff === 0 ? (
                          <>
                            <CheckCircle
                              size={15}
                              className="shrink-0 mt-0.5"
                            />
                            <div className="text-[12px] font-bold">
                              <p>Số liệu hoàn toàn có thể duyệt</p>
                              <span className="text-[9.5px] font-medium text-emerald-600 font-mono">
                                Không phát sinh chênh lệch ngân quỹ.
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle
                              size={15}
                              className="shrink-0 mt-0.5"
                            />
                            <div className="text-[12px] font-bold">
                              <p>
                                Phát hiện chênh lệch: {diff > 0 ? "+" : ""}
                                {diff.toLocaleString("vi-VN")} đ
                              </p>
                              <span className="text-[9.5px] font-medium text-rose-600">
                                Hệ thống sẽ gắn nhãn "Có sai lệch" và lưu trữ
                                lịch sử để thủ quỹ duyệt.
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleSaveManual}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-extrabold rounded-lg transition duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        id="btn-save-manual-recons"
                      >
                        <Check size={14} />
                        <span>Xác nhận kết quả đối soát</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-50/50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-400 space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-450 border border-slate-150">
                  <HelpCircle size={18} />
                </div>
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-700 text-[14px]">
                    Vận hành đối soát thủ công
                  </h5>
                  <p className="text-[11px] text-slate-450 max-w-xs leading-normal mx-auto">
                    Bấm nút "Đối soát" ở cột cuối bất kỳ đơn hàng nào để cập
                    nhật thủ công dòng ngân quỹ, số tiền thực thu, và lý do
                    chênh lệch.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATIC STATEMENT SUITE (AI REGEX MATCHING) */}
      {activeTab === "auto" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles size={16} className="fill-indigo-100" />
              </div>
              <div>
                <h3 className="font-black text-[14px] uppercase tracking-wider text-slate-800">
                  Quét &amp; Đối Soát Sao kê thông minh
                </h3>
                <p className="text-[11px] text-slate-450 font-bold">
                  Regex AI Matching engine tự động kiểm lỗi sao kê và đối sánh
                  nhiều đơn hàng lập tức
                </p>
              </div>
            </div>

            {/* Selector templates for testing */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-500">
                Mẫu sao kê kiểm thử nhanh (Demo Templates)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={() => handleSelectTemplate("ghtk")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition cursor-pointer ${
                    selectedTemplate === "ghtk"
                      ? "bg-blue-50/75 border-blue-300 text-blue-700 font-bold"
                      : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 text-slate-600"
                  }`}
                  id="tpl-ghtk"
                >
                  <span className="text-[11px] font-black text-rose-500 font-mono">
                    Báo cáo COD GHTK
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-450 leading-tight">
                    Chứa DH-10001 (Khớp) &amp; DH-10002 (Lệch 89k)
                  </span>
                </button>

                <button
                  onClick={() => handleSelectTemplate("vcb")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition cursor-pointer ${
                    selectedTemplate === "vcb"
                      ? "bg-emerald-50/75 border-emerald-300 text-emerald-700 font-bold"
                      : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 text-slate-600"
                  }`}
                  id="tpl-vcb"
                >
                  <span className="text-[11px] font-black text-emerald-600 font-mono">
                    Sao kê Vietcombank
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-450 leading-tight">
                    Chứa DH-10003 &amp; DH-10004 (Cả hai khớp)
                  </span>
                </button>

                <button
                  onClick={() => handleSelectTemplate("momo")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition cursor-pointer ${
                    selectedTemplate === "momo"
                      ? "bg-fuchsia-50/75 border-fuchsia-300 text-fuchsia-700 font-bold"
                      : "bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 text-slate-600"
                  }`}
                  id="tpl-momo"
                >
                  <span className="text-[11px] font-black text-fuchsia-600 font-mono">
                    Ví Momo Merchant
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-450 leading-tight">
                    Chứa mã đơn kèm số tiền thanh toán nhanh
                  </span>
                </button>

                <button
                  onClick={() => handleSelectTemplate("none")}
                  className={`p-3 rounded-xl border border-dashed text-left flex flex-col justify-between h-20 transition cursor-pointer ${
                    selectedTemplate === "none"
                      ? "bg-indigo-50/60 border-indigo-200 text-indigo-700 font-bold"
                      : "bg-slate-50/30 border-slate-200/70 hover:bg-slate-50 text-slate-600"
                  }`}
                  id="tpl-custom"
                >
                  <span className="text-[11px] font-black text-slate-600 font-mono">
                    Khởi tạo tay / Import tay
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-450 leading-tight">
                    Gõ / Paste dán sao kê bất kỳ chứa mã DH-XXXXX
                  </span>
                </button>
              </div>
            </div>

            {/* Input logs statement textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black uppercase text-slate-500">
                  Nội dung dữ liệu đối chiếu
                </label>
                {pasteText && (
                  <button
                    onClick={() => setPasteText("")}
                    className="text-[11px] text-rose-500 hover:underline font-bold"
                  >
                    Xóa trắng
                  </button>
                )}
              </div>
              <textarea
                className="w-full font-mono text-[14px] border border-slate-250 p-4 rounded-xl outline-hidden focus:ring-1 focus:ring-indigo-500 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500"
                rows={5}
                placeholder="Dán nhật ký biến động số dư ngân hàng, file CSV xuất từ GHTK / GHN / POS, hoặc tin nhắn SMS giao dịch điện tử..."
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  setIsAnalyzed(false);
                }}
                id="statement-analysis-textarea"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleAnalyzeStatement}
                disabled={!pasteText.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[14px] font-extrabold rounded-lg transition duration-150 flex items-center gap-1.5 shadow-xs cursor-pointer"
                id="btn-analyze-statement"
              >
                <Sparkles size={14} className="fill-white" />
                <span>Quét &amp; phân tách mã đơn</span>
              </button>
            </div>
          </div>

          {/* Analysis output breakdown */}
          {isAnalyzed && parsedItems.length > 0 && (
            <div
              className="bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden animate-in slide-in-from-bottom-3 duration-250 space-y-4 p-5"
              id="analysis-output-container"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-3 gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">
                    Kết quả quét dữ liệu sao kê
                  </h4>
                  <p className="text-[11px] text-slate-450 font-bold mt-0.5">
                    Tìm thấy {parsedItems.length} giao dịch có tiềm năng kết hợp
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleApplyBatchReconciliation(
                        selectedTemplate === "ghtk"
                          ? "Báo cáo COD GHTK"
                          : selectedTemplate === "vcb"
                            ? "Vietcombank E-Bank"
                            : selectedTemplate === "momo"
                              ? "Momo API Merchant"
                              : "Đối soát Sao kê Thủ Công",
                      )
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[14px] transition duration-150 flex items-center gap-1.5 shadow-xs cursor-pointer"
                    id="btn-apply-batch-recons"
                  >
                    <Check size={14} />
                    <span>
                      Xác nhận ghi sổ (
                      {parsedItems.filter((p) => p.matchedOrder).length} đơn
                      khớp hệ thống)
                    </span>
                  </button>
                </div>
              </div>

              {/* Parsed list visualization */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {parsedItems.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-[14px] flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        item.status === "perfect"
                          ? "bg-emerald-50/40 border-emerald-150 text-slate-700"
                          : item.status === "discrepancy"
                            ? "bg-rose-50/40 border-rose-150 text-slate-700"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5 shrink-0">
                          {item.status === "perfect" ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px]">
                              ✓
                            </span>
                          ) : item.status === "discrepancy" ? (
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[11px]">
                              ⚠
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-[11px]">
                              ?
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="font-mono text-[10px] text-slate-400 uppercase">
                            Dòng {item.lineNumber}
                          </div>
                          <p className="font-semibold text-[12px] text-slate-500 truncate max-w-lg mb-1">
                            "{item.rawText.trim()}"
                          </p>

                          {item.foundCode && (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 text-[9.5px]">
                                {item.foundCode}
                              </span>
                              {item.matchedOrder ? (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  Đại diện:{" "}
                                  <b className="text-slate-700">
                                    {item.matchedOrder.customer?.name ||
                                      "Khách vãng lai"}
                                  </b>{" "}
                                  • Đơn giá:{" "}
                                  <b className="text-slate-700">
                                    {item.matchedOrder.finalAmount.toLocaleString(
                                      "vi-VN",
                                    )}
                                    đ
                                  </b>
                                </span>
                              ) : (
                                <span className="text-red-500 text-[11px] font-bold">
                                  Mã này không tồn tại trên cơ sở dữ liệu POS
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-[12px] font-black text-slate-800">
                          Thu hoạch: {item.parsedAmount.toLocaleString("vi-VN")}
                          đ
                        </div>
                        <div
                          className={`text-[11px] font-bold ${
                            item.status === "perfect"
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.note}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isAnalyzed && parsedItems.length === 0 && (
            <div className="bg-rose-50 border border-rose-150 p-6 rounded-xl text-center space-y-2">
              <AlertTriangle className="text-rose-500 mx-auto" />
              <p className="font-extrabold text-rose-700 text-[14px]">
                Phân phân dán không thành công!
              </p>
              <p className="text-rose-600 text-[11px]">
                Chúng tôi không phát hiện được định dạng văn bản hay bất cứ mã
                đơn nào (vd: DH-10001) cùng mệnh giá tiền. Vui lòng kiểm tra lại
                cấu trúc copy.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HISTORY RECONCILIATION LOG */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <FileCheck2 size={16} />
            </div>
            <div>
              <h3 className="font-black text-[14px] uppercase tracking-wider text-slate-800">
                Lịch sử và Nhật ký phiên đối sát
              </h3>
              <p className="text-[11px] text-slate-450 font-bold">
                Lưu giữ vết kiểm duyệt độc lập các hoạt động đối toán của nhân
                viên, đối thủ và ngân quỹ
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="bg-slate-55/65 text-slate-500 font-extrabold uppercase border-b border-slate-100">
                  <th className="py-3 px-4 font-black">Mã phiên</th>
                  <th className="py-3 px-4 font-black">Thời gian tạo</th>
                  <th className="py-3 px-4 font-black">
                    Nguồn dữ liệu đối so sánh
                  </th>
                  <th className="py-3 px-4 font-black text-center">
                    Tổng số đơn quét
                  </th>
                  <th className="py-3 px-4 font-black text-center">
                    Khớp hoàn hảo
                  </th>
                  <th className="py-3 px-4 font-black text-center">
                    Có chênh lệch
                  </th>
                  <th className="py-3 px-4 font-black text-right">
                    Tổng thực nhận quy đổi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-755">
                {sessions.map((session, index) => {
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                          {session.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10.5px]">
                        {new Date(session.date).toLocaleDateString("vi-VN")}{" "}
                        {new Date(session.date).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-extrabold">
                        {session.source}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-600">
                        {session.totalOrders} đơn
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-110 rounded text-[11px]">
                          {session.reconciledCount} đơn
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            session.discrepancyCount > 0
                              ? "bg-rose-50 text-rose-600 border border-rose-150 animate-pulse"
                              : "bg-slate-50 text-slate-400 border border-slate-100"
                          }`}
                        >
                          {session.discrepancyCount} đơn
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-black ${
                          session.netImpact >= 0
                            ? "text-slate-850"
                            : "text-rose-600"
                        }`}
                      >
                        {session.netImpact > 0 ? "+" : ""}
                        {session.netImpact.toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
