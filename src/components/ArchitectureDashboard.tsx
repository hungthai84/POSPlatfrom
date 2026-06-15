import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Layers, 
  Server, 
  Database, 
  ShieldAlert, 
  Activity,
  ArrowRight,
  Cpu,
  Globe,
  Settings,
  CloudLightning
} from "lucide-react";

export default function ArchitectureDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Tổng quan kiến trúc" },
    { id: "data", label: "Luồng dữ liệu" },
    { id: "security", label: "Bảo mật & Tuân thủ" },
  ];

  return (
    <div className="min-h-screen bg-background md:bg-muted/10 p-4 md:p-6 pb-24 lg:p-8 space-y-6 font-sans">
      
      {/* 2. Cấu trúc Banner Tổng quan & Menu Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/45 border border-border/60 p-5 md:p-6 rounded-2xl shadow-sm backdrop-blur-md w-full flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-30"
      >
        <div className="flex flex-col gap-2">
          {/* Headings/Tiêu đề chính: font-heading -> Play font is applied via sans in index.css, meaning we can use font-sans or explicit Tailwind classes if we had font-heading, but index.css uses --font-sans for Play. Let's use font-sans */}
          <h1 className="font-sans font-black text-2xl tracking-tight text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            Quản lý Kiến trúc Doanh nghiệp
          </h1>
          <p className="text-sm text-muted-foreground">
            Bảng điều khiển tập trung giám sát hệ thống lõi và đánh giá các luồng dữ liệu kiến trúc.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-zinc-800 text-primary shadow-sm scale-[1.02] font-black"
                    : "text-muted-foreground hover:text-foreground font-bold"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.button 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 bg-background border border-border text-foreground hover:bg-muted text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap self-stretch sm:self-auto"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Tài liệu
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: System Status */}
        <div className="col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card/45 border border-border/60 p-6 rounded-3xl shadow-sm backdrop-blur-md space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold tracking-tight text-foreground text-lg">Trạng thái hạ tầng</h2>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Core App", status: "Active", icon: Cpu },
                { label: "Database", status: "Healthy", icon: Database },
                { label: "Network", status: "Stable", icon: Globe },
                { label: "Cache API", status: "Active", icon: CloudLightning },
              ].map((item, idx) => (
                <div key={idx} className="bg-muted/40 p-3 rounded-2xl flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="w-full bg-primary text-primary-foreground text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Chạy kiểm tra hệ thống <Activity className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card/45 border border-border/60 p-6 rounded-3xl shadow-sm backdrop-blur-md space-y-4"
          >
            <h2 className="font-sans font-bold tracking-tight text-foreground text-lg">Cảnh báo bảo mật</h2>
            <div className="bg-muted/40 p-4 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Rule vi phạm: Firewall</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  12 lượt truy cập không xác định bị chặn bởi WAF. Đề xuất cập nhật policy.
                </p>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                  TGT_IP: 192.168.1.*
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Columns: Diagram / Architecture Content */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card/60 border border-border/60 p-6 rounded-3xl shadow-sm backdrop-blur-md h-full min-h-[400px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans font-bold tracking-tight text-foreground text-lg">Bản đồ kiến trúc sơ bộ</h2>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Mở rộng sơ đồ <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-muted/40 rounded-2xl border border-border/40 p-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 relative overflow-hidden">
              {/* Fake lines to connect nodes */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0 hidden md:block"></div>
              
              {/* Node 1 */}
              <div className="relative z-10 bg-background border border-border rounded-2xl p-5 shadow-sm min-w-[160px] text-center space-y-2">
                <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-sm font-bold">Client Layer</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">React / mobile</p>
              </div>

              {/* Node 2 */}
              <div className="relative z-10 bg-background border border-primary/40 rounded-2xl p-5 shadow-md shadow-primary/10 min-w-[160px] text-center space-y-2 scale-105">
                <Server className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-sm font-bold text-primary">API Gateway</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Express / Node</p>
              </div>

              {/* Node 3 */}
              <div className="relative z-10 bg-background border border-border rounded-2xl p-5 shadow-sm min-w-[160px] text-center space-y-2">
                <Database className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="text-sm font-bold">Data Store</h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">PostgreSQL / Redis</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="bg-background border border-border rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">API Latency: 42ms</span>
              </div>
              <div className="bg-background border border-border rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Throughput: 12k/s</span>
              </div>
            </div>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}
