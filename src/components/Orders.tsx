/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Trash2,
  Calendar,
  DollarSign,
  User,
  ShoppingBag,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  Check,
  XCircle,
  Info,
  Printer,
} from "lucide-react";
import { Order, ShopConfig } from "../types";

interface OrdersProps {
  orders: Order[];
  config: ShopConfig;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

export default function Orders({
  orders,
  config,
  onUpdateOrderStatus,
}: OrdersProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest_amount">(
    "newest",
  );
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer?.name || "khach le")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (o.customer?.phone || "").includes(searchTerm);
      const matchStatus =
        selectedStatus === "all" || o.status === selectedStatus;
      return matchSearch && matchStatus;
    });

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === "highest_amount") {
      result.sort((a, b) => b.finalAmount - a.finalAmount);
    }

    return result;
  }, [orders, searchTerm, selectedStatus, sortBy]);

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Khách hàng",
      "SĐT",
      "Tổng tiền",
      "Giảm giá",
      "Khách trả",
      "Hình thức TT",
      "Trạng thái",
      "Ngày tạo",
    ];
    const data = filteredOrders.map((o) => [
      o.id,
      o.customer?.name || "Khách lẻ",
      o.customer?.phone || "",
      o.totalAmount,
      o.discount,
      o.finalAmount,
      o.paymentMethod === "cash"
        ? "Tiền mặt"
        : o.paymentMethod === "card"
          ? "Quẹt thẻ"
          : o.paymentMethod === "bank_transfer"
            ? "Chuyển khoản"
            : "Ví điện tử",
      o.status,
      new Date(o.createdAt).toLocaleString("vi-VN"),
    ]);
    const csvContent = [headers, ...data]
      .map((e) =>
        e.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "danh_sach_don_hang.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    let itemsHtml = "";
    order.items.forEach((item) => {
      itemsHtml += `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #ccc;">
            <div style="font-weight: bold; font-size: 13px;">${item.productName}</div>
            <div style="font-size: 11px; color: #666;">${item.variantName || item.sku}</div>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px dashed #ccc; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px dashed #ccc; text-align: right; font-size: 13px;">${formatCurrency(item.price)}</td>
          <td style="padding: 8px 0; border-bottom: 1px dashed #ccc; text-align: right; font-weight: bold; font-size: 13px;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>In Hóa Đơn - ${order.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 5px 0; font-size: 12px; color: #666; }
            .info { margin-bottom: 20px; font-size: 13px; line-height: 1.5; }
            .info .row { display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; padding-bottom: 8px; border-bottom: 2px solid #333; font-size: 12px; text-transform: uppercase; }
            .summary { margin-top: 20px; font-size: 14px; }
            .summary .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .summary .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            @media print {
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.name}</h1>
            <p>${config.address}</p>
            <p>Hotline: ${config.phone}</p>
          </div>
          
          <div class="info">
            <div class="row"><span>Mã ĐH:</span> <strong>${order.id}</strong></div>
            <div class="row"><span>Ngày:</span> <span>${new Date(order.createdAt).toLocaleString("vi-VN")}</span></div>
            <div class="row"><span>Thu ngân:</span> <span>Admin</span></div>
            <div class="row" style="margin-top: 8px;"><span>Khách hàng:</span> <strong>${order.customer?.name || "Khách lẻ"}</strong></div>
            <div class="row"><span>SĐT:</span> <span>${order.customer?.phone || "-"}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>SP</th>
                <th style="text-align: center;">SL</th>
                <th style="text-align: right;">Đơn giá</th>
                <th style="text-align: right;">TT</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary">
            <div class="row">
              <span>Tổng tiền hàng:</span>
              <span>${formatCurrency(order.totalAmount)}</span>
            </div>
            ${
              order.discount > 0
                ? `
            <div class="row">
              <span>Chiết khấu:</span>
              <span>-${formatCurrency(order.discount)}</span>
            </div>`
                : ""
            }
            <div class="row total">
              <span>Khách phải trả:</span>
              <span>${formatCurrency(order.finalAmount)}</span>
            </div>
            <div class="row" style="margin-top: 10px; font-size: 12px;">
              <span>HT Thanh toán:</span>
              <span>${order.paymentMethod === "cash" ? "Tiền mặt" : order.paymentMethod === "card" ? "Quẹt thẻ" : order.paymentMethod === "bank_transfer" ? "Chuyển khoản" : "Ví điện tử"}</span>
            </div>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách & Hẹn gặp lại!</p>
            <p>Xin trân trọng cảm ơn</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div
      className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none"
      id="orders-mgmt-screen"
    >
      {/* List Action Buttons Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">
            Hồ Sơ Giao Dịch & Đơn Hàng
          </h2>
          <p className="text-[14px] text-slate-450">
            Quản lý hóa đơn xuất tại POS, trạng thái thanh toán và vận chuyển.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[14px] px-4 py-2.5 rounded-lg shadow-2xs transition"
        >
          <FileSpreadsheet size={14} className="text-emerald-600" />
          <span>Xuất File Excel (.CSV)</span>
        </button>
      </div>

      {/* Searching row parameters */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
        {/* Search input field */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm theo Mã Đơn Hàn (e.g. DH-1002), Tên hoặc SĐT Khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-[14px] focus:outline-none focus:border-blue-500 focus:bg-white text-slate-755 font-medium transition"
          />
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-[14px] text-slate-705 font-bold focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest_amount">Giá trị cao</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {/* Status selection slider */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-150 space-x-1 hidden lg:flex">
          {[
            { id: "all", label: "Tất cả" },
            { id: "completed", label: "Hoàn tất" },
            { id: "processing", label: "Đang xử lý" },
            { id: "pending", label: "Chờ duyệt" },
            { id: "canceled", label: "Đã hủy" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`text-[12px] font-bold px-3 py-1.5 rounded-md transition ${
                selectedStatus === st.id
                  ? "bg-white text-slate-800 shadow-3xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table details block */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-3xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] text-slate-650">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400">
                <th className="py-3 px-4 font-semibold">Mã Đơn</th>
                <th className="py-3 px-4 font-semibold">Khách hàng</th>
                <th className="py-3 px-4 font-semibold">Ngày tạo</th>
                <th className="py-3 px-4 font-semibold text-right">
                  Tổng tiền
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Hình thức
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Trạng thái
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-400 font-medium"
                  >
                    ❌ Không tìm thấy thông tin đơn hàng nào phù hợp!
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isActive = activeOrder?.id === ord.id;
                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setActiveOrder(ord)}
                      className={`border-b border-slate-50 relative z-0 hover:z-10 hover:bg-slate-50/50 cursor-pointer transition-all duration-200 ${
                        isActive ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">
                        {ord.id}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-800">
                        <div className="font-bold">
                          {ord.customer ? ord.customer.name : "Khách vãng lai"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ord.customer ? ord.customer.phone : "Khách mua lẻ"}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString("vi-VN")}{" "}
                        {new Date(ord.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                        {formatCurrency(ord.finalAmount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[12px] font-semibold text-slate-700">
                          {ord.paymentMethod === "cash" && "💵 Tiền mặt"}
                          {ord.paymentMethod === "card" && "💳 Quẹt thẻ"}
                          {ord.paymentMethod === "bank_transfer" &&
                            "🏦 Chuyển khoản"}
                          {ord.paymentMethod === "e_wallet" && "📱 Ví điện tử"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                            ord.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : ord.status === "processing"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : ord.status === "canceled"
                                  ? "bg-red-50 text-red-600 border border-red-100"
                                  : "bg-yellow-50 text-yellow-700 border border-yellow-101"
                          }`}
                        >
                          {ord.status === "completed" && "Hoàn tất"}
                          {ord.status === "processing" && "Đang xử lý"}
                          {ord.status === "pending" && "Chờ duyệt"}
                          {ord.status === "canceled" && "Đã hủy"}
                        </span>
                      </td>
                      <td
                        className="py-4 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setActiveOrder(ord)}
                            className="p-1 px-2 border border-slate-200 hover:border-blue-600 bg-white text-slate-600 hover:text-blue-600 rounded text-[11px] font-semibold transition"
                          >
                            Chi tiết
                          </button>
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

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden slide-in-from-bottom-4 animate-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  HÓA ĐƠN GIAO DỊCH
                </span>
                <h3 className="font-extrabold text-slate-800 text-[20px] flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-600" />
                  {activeOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Customer Info row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Khách hàng
                  </p>
                  <p className="text-[16px] font-black text-slate-800">
                    {activeOrder.customer
                      ? activeOrder.customer.name
                      : "Khách vãng lai"}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {activeOrder.customer
                      ? activeOrder.customer.phone
                      : "Mua lẻ tại quầy"}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Trạng thái & Thanh toán
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
                        activeOrder.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {activeOrder.status === "completed"
                        ? "Hoàn tất"
                        : "Đang xử lý"}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {activeOrder.paymentMethod === "cash"
                        ? "💵 TM"
                        : "💳 Thẻ/CK"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {new Date(activeOrder.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Chi tiết hàng hóa ({activeOrder.items.length})
                </h4>
                <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden">
                  {activeOrder.items.map((it) => (
                    <div
                      key={it.variantId}
                      className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[16px] font-bold text-slate-800 block truncate">
                          {it.productName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-mono">
                            SKU: {it.sku}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-[11px] text-slate-500 font-bold">
                            {formatCurrency(it.price)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[16px] font-black text-slate-900 block">
                          {formatCurrency(it.price * it.quantity)}
                        </span>
                        <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          x{it.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-200 space-y-3">
                  <div className="flex justify-between text-[14px] opacity-70">
                    <span>Tổng tiền hàng</span>
                    <span>{formatCurrency(activeOrder.totalAmount)}</span>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between text-[14px] text-rose-300">
                      <span>Chiết khấu giảm giá</span>
                      <span>-{formatCurrency(activeOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[20px] font-black pt-2 border-t border-white/10">
                    <span>KHÁCH PHẢI TRẢ</span>
                    <span className="text-blue-400">
                      {formatCurrency(activeOrder.finalAmount)}
                    </span>
                  </div>
                </div>
                {activeOrder.notes && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <p className="text-[11px] font-bold text-blue-500 uppercase mb-1 flex items-center gap-1.5">
                      <Info size={12} />
                      Ghi chú đơn hàng
                    </p>
                    <p className="text-[14px] text-blue-800 font-medium leading-relaxed">
                      {activeOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => handlePrintReceipt(activeOrder)}
                className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[14px] py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer size={16} />
                In Hóa Đơn
              </button>
              {activeOrder.status !== "completed" &&
                activeOrder.status !== "canceled" && (
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(activeOrder.id, "completed");
                      setActiveOrder({ ...activeOrder, status: "completed" });
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <Check size={16} />
                    Hoàn Tất
                  </button>
                )}
              {activeOrder.status === "completed" && (
                <button
                  onClick={() => setActiveOrder(null)}
                  className="flex-1 bg-slate-800 text-white font-bold text-[14px] py-3 rounded-2xl transition"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
