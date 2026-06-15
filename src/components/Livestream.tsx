import React, { useState, useMemo, useEffect } from "react";
import {
  Video,
  Play,
  StopCircle,
  Eye,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  Search,
  Plus,
  ChevronRight,
  Facebook,
  Music2, // Using as TikTok icon
  Instagram,
  Clock,
  Zap,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LivestreamSession, ShopConfig, LivestreamComment } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface LivestreamProps {
  sessions: LivestreamSession[];
  config: ShopConfig;
  onStartSession?: (data: any) => void;
  onEndSession?: (id: string) => void;
}

export default function Livestream({
  sessions,
  config,
  onStartSession,
  onEndSession,
}: LivestreamProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessions.find((s) => s.status === "live")?.id || null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (val: number) => {
    return val.toLocaleString("vi-VN") + ` ${config.currency}`;
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [sessions, searchTerm]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Bán Hàng Livestream
          </h2>
          <p className="text-[14px] text-slate-500">
            Tự động chốt đơn qua comment trên đa nền tảng.
          </p>
        </div>
        {!activeSession && (
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[14px] px-4 py-2.5 rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95">
            <Video size={16} />
            <span>Bắt Đầu Live Mới</span>
          </button>
        )}
      </div>

      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Monitor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl aspect-video relative group border-4 border-white">
              {/* Mock Video Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <Video size={64} className="animate-pulse" />
                <p className="text-[14px] font-bold mt-2 uppercase tracking-widest">
                  Đang truyền tải dữ liệu...
                </p>
              </div>

              {/* Live Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="bg-red-600 text-white text-[11px] font-black px-2 py-1 rounded-md animate-pulse">
                  LIVE
                </div>
                <div className="bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Eye size={12} />
                  {activeSession.viewers.toLocaleString()}
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                {activeSession.platform === "facebook" && (
                  <Facebook size={12} className="text-blue-400" />
                )}
                {activeSession.platform === "tiktok" && (
                  <Music2 size={12} className="text-pink-400" />
                )}
                <span className="truncate max-w-[120px]">
                  {activeSession.title}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden"
                    >
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                        alt="viewer"
                      />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-[11px] text-white font-bold">
                    +99
                  </div>
                </div>
                <button
                  onClick={() => setActiveSessionId(null)}
                  className="bg-white/10 hover:bg-red-600 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[14px] font-bold transition-colors flex items-center gap-2"
                >
                  <StopCircle size={16} />
                  Dừng Livestream
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs flex flex-col items-center gap-1">
                <Zap size={20} className="text-amber-500 mb-1" />
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  Đơn hàng
                </p>
                <p className="text-xl font-black text-slate-800">
                  {activeSession.totalOrders}
                </p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs flex flex-col items-center gap-1">
                <TrendingUp size={20} className="text-blue-500 mb-1" />
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  Doanh thu tạm tính
                </p>
                <p className="text-xl font-black text-slate-800">
                  {formatCurrency(activeSession.revenue)}
                </p>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs flex flex-col items-center gap-1">
                <MessageSquare size={20} className="text-purple-500 mb-1" />
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  Tỷ lệ chuyển đổi
                </p>
                <p className="text-xl font-black text-slate-800">12.5%</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[14px] font-black text-slate-700 uppercase tracking-wider">
                  Từ khóa chốt đơn
                </h4>
                <button className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={12} />
                  Thêm từ khóa
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSession.keywords.map((kw) => (
                  <div
                    key={kw}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-[14px] font-bold flex items-center gap-2"
                  >
                    <Zap size={12} />
                    <span>{kw}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comment Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col h-[calc(100vh-12rem)] relative overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className="text-slate-400" />
                Comments Realtime
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSession.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex gap-3 group ${comment.isOrder ? "animate-in slide-in-from-right-2" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`}
                      alt="avt"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-black text-slate-800">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        12:34
                      </span>
                    </div>
                    <div
                      className={`p-2.5 rounded-2xl text-[12px] font-medium leading-relaxed shadow-3xs ${
                        comment.isOrder
                          ? "bg-blue-600 text-white shadow-blue-200"
                          : "bg-slate-50 text-slate-600 border border-slate-100"
                      }`}
                    >
                      {comment.content}
                    </div>
                    {comment.isOrder && (
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            comment.status === "converted"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {comment.status === "converted"
                            ? "ĐÃ CHỐT"
                            : "CHỜ PHẢN HỒI"}
                        </span>
                        <button className="text-[10px] font-bold text-blue-600 hover:underline">
                          Chi tiết
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Trả lời comment..."
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 transition"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History & List View */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-3xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm phiên livestream..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:border-blue-500 font-medium transition"
              />
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[14px] text-slate-700 font-bold focus:outline-none focus:border-blue-500">
              <option value="all">Tất cả nền tảng</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-3xl border border-slate-200 border-b-4 hover:border-blue-300 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${session.status === "live" ? "bg-red-500 animate-pulse" : "bg-slate-300"}`}
                      />
                      <h4 className="font-extrabold text-slate-800 text-[16px] group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                        {session.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {session.platform === "facebook" && (
                        <Facebook size={12} className="text-blue-500" />
                      )}
                      {session.platform === "tiktok" && (
                        <Music2 size={12} className="text-pink-500" />
                      )}
                      <span>{session.startTime.split("T")[0]}</span>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600 p-1">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="px-5 py-4 grid grid-cols-2 gap-4 border-y border-slate-50">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Đơn hàng
                    </span>
                    <p className="text-[16px] font-black text-slate-800">
                      {session.totalOrders}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Doanh thu
                    </span>
                    <p className="text-[16px] font-black text-slate-800">
                      {formatCurrency(session.revenue)}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <Eye size={12} />
                    <span>{session.viewers.toLocaleString()}</span>
                  </div>
                  {session.status === "live" ? (
                    <button
                      onClick={() => setActiveSessionId(session.id)}
                      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[11px] font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
                    >
                      Vào quản trị
                    </button>
                  ) : (
                    <button className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest">
                      Xem báo cáo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
