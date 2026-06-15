/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString() + Math.random().toString().substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => {
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
                layout
                className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl bg-white w-full select-none"
                style={{
                  borderColor:
                    toast.type === "success"
                      ? "#bbf7d0"
                      : toast.type === "error"
                      ? "#fecaca"
                      : "#f1f5f9",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.06)",
                }}
              >
                {/* Icon Column */}
                <div className="shrink-0 mt-0.5">
                  {toast.type === "success" && (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  )}
                  {toast.type === "error" && (
                    <AlertCircle size={18} className="text-rose-500" />
                  )}
                  {toast.type === "info" && (
                    <Info size={18} className="text-blue-500" />
                  )}
                </div>

                {/* Message Content Column */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-800 leading-normal break-words font-sans">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button Column */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
