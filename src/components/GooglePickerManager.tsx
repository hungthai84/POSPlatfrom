import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import {
  Cloud,
  CloudOff,
  FolderOpen,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  CheckCircle2,
  Trash2,
  LogOut,
  AlertTriangle,
} from "lucide-react";

interface GooglePickerManagerProps {
  onLogoSelected?: (url: string) => void;
}

export default function GooglePickerManager({
  onLogoSelected,
}: GooglePickerManagerProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gapiLoaded, setGapiLoaded] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [viewType, setViewType] = useState<string>("PHOTOS"); // PHOTOS, DOCS, SPREADSHEETS

  // Check if gapi is loaded from index.html script tag
  useEffect(() => {
    const checkGapi = setInterval(() => {
      if ((window as any).gapi) {
        setGapiLoaded(true);
        clearInterval(checkGapi);
      }
    }, 500);
    return () => clearInterval(checkGapi);
  }, []);

  // Handle Google OAuth authentication with requested scopes
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Add required scopes
      provider.addScope("https://www.googleapis.com/auth/drive.file");
      provider.addScope(
        "https://www.googleapis.com/auth/drive.metadata.readonly",
      );

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (token) {
        setAccessToken(token);
      } else {
        throw new Error(
          "Không thể nhận Access Token từ tài khoản Google của bạn.",
        );
      }
    } catch (err: any) {
      console.error("Google authorization error:", err);
      // Give a friendly error message
      if (err.code === "auth/popup-blocked") {
        setError(
          "Popup đăng nhập bị chặn. Vui lòng cho phép quyền mở popup trong trình duyệt.",
        );
      } else {
        setError(err.message || "Đăng nhập Google thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccessToken(null);
    setSelectedFile(null);
  };

  // Trigger Google Picker using gapi loading
  const handleOpenPicker = () => {
    setError(null);
    if (!gapiLoaded) {
      setError("Đang tải thư viện Google API, vui lòng thử lại sau vài giây.");
      return;
    }

    if (!accessToken) {
      setError("Vui lòng kết nối Google Drive trước.");
      return;
    }

    setLoading(true);
    try {
      const gapi = (window as any).gapi;
      gapi.load("picker", {
        callback: () => {
          const google = (window as any).google;
          if (!google || !google.picker) {
            setError("Không tải được giao diện Google Picker.");
            setLoading(false);
            return;
          }

          // Calculate picker origin according to workspace guidelines
          const pickerOrigin =
            window.location.ancestorOrigins &&
            window.location.ancestorOrigins.length > 0
              ? window.location.ancestorOrigins[
                  window.location.ancestorOrigins.length - 1
                ]
              : window.location.origin;

          // Resolve view id based on state selection
          let viewId = google.picker.ViewId.DOCS;
          if (viewType === "PHOTOS") {
            viewId = google.picker.ViewId.PHOTOS;
          } else if (viewType === "SPREADSHEETS") {
            viewId = google.picker.ViewId.SPREADSHEETS;
          }

          const picker = new google.picker.PickerBuilder()
            .addView(viewId)
            .setOAuthToken(accessToken)
            .setCallback((data: any) => {
              if (data.action === google.picker.Action.PICKED) {
                const pickedDoc = data.docs[0];
                setSelectedFile(pickedDoc);
              }
              if (
                data.action === google.picker.Action.CANCEL ||
                data.action === google.picker.Action.PICKED
              ) {
                setLoading(false);
              }
            })
            .setOrigin(pickerOrigin)
            .build();

          picker.setVisible(true);
          setLoading(false);
        },
        onerror: () => {
          setError("Không tải được module Google Picker. Vui lòng thử lại.");
          setLoading(false);
        },
      });
    } catch (err: any) {
      console.error("Picker error:", err);
      setError(err.message || "Lỗi khi khởi chạy Google Picker.");
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-3xs space-y-4"
      id="google-picker-integration-card"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <FolderOpen size={16} />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">
              Phụ đính Google Picker
            </h4>
            <p className="text-[11px] text-slate-450 font-semibold mt-0.5">
              Truy xuất tài liệu an toàn từ Google Drive cá nhân
            </p>
          </div>
        </div>

        {accessToken ? (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <Cloud size={11} />
            <span>Đã liên kết Drive</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            <CloudOff size={11} />
            <span>Chưa liên kết</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg text-[11.5px] font-semibold text-rose-700 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {!accessToken ? (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
            <CloudOff size={24} className="text-slate-350" />
          </div>
          <div className="space-y-1">
            <h5 className="font-extrabold text-slate-700 text-[14px]">
              Yêu cầu quyền hạn Google Drive
            </h5>
            <p className="text-[11px] text-slate-450 max-w-xs leading-normal">
              Cấp quyền để lựa chọn ảnh, tài liệu hóa đơn hoặc file dữ liệu nhập
              kho trực tiếp từ Google Drive của bạn.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white font-extrabold rounded-lg text-[14px] transition duration-150 flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderOpen size={14} />
            )}
            <span>Bắt đầu ủy quyền Google Drive</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "PHOTOS", name: "Hình ảnh", icon: ImageIcon },
              { key: "DOCS", name: "Tài liệu", icon: FileText },
              {
                key: "SPREADSHEETS",
                name: "Trang tính",
                icon: FileSpreadsheet,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = viewType === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setViewType(item.key)}
                  className={`py-2 px-2.5 rounded-lg border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/75 border-blue-200 text-blue-700 font-bold"
                      : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-[11px]">{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleOpenPicker}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-405 text-white font-extrabold rounded-lg text-[14px] transition duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FolderOpen size={14} />
              )}
              <span>Mở bộ chọn File (Google Picker)</span>
            </button>

            <button
              onClick={handleDisconnect}
              className="p-2.5 text-slate-450 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-100 rounded-lg transition shrink-0"
              title="Hủy liên kết Drive"
            >
              <LogOut size={14} />
            </button>
          </div>

          {/* Render selected file metadata if present */}
          {selectedFile && (
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-150/70 rounded-xl space-y-3 animate-in slide-in-from-bottom-2 duration-150 text-left">
              <div className="flex items-start gap-2.5">
                <div className="p-2.5 bg-white border border-blue-100 rounded-lg text-indigo-600 shrink-0">
                  {selectedFile.mimeType?.includes("image") ? (
                    <ImageIcon size={16} />
                  ) : selectedFile.mimeType?.includes("spreadsheet") ? (
                    <FileSpreadsheet size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-slate-800 text-[14px] truncate leading-snug">
                    {selectedFile.name}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono mt-0.5 truncate uppercase">
                    ID: {selectedFile.id}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                    Mime: {selectedFile.mimeType || "Không xác định"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-100/50">
                <a
                  href={selectedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-650 flex items-center gap-1 rounded border border-slate-200 font-bold text-[11px] transition duration-150 cursor-pointer"
                >
                  <ExternalLink size={11} />
                  <span>Xem trên Drive</span>
                </a>

                {selectedFile.mimeType?.includes("image") && onLogoSelected && (
                  <button
                    onClick={() => {
                      // Retrieve view url if possible or embed/docs url
                      // A direct preview is useful, often item.url is best
                      onLogoSelected(selectedFile.url);
                    }}
                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 rounded border border-emerald-600 font-bold text-[11px] transition duration-150 cursor-pointer"
                  >
                    <CheckCircle2 size={11} />
                    <span>Dùng làm Ảnh/Logo</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-2 py-1 hover:bg-rose-50 text-rose-600 flex items-center gap-1 rounded font-bold text-[11px] transition duration-150 ml-auto"
                >
                  <Trash2 size={11} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
