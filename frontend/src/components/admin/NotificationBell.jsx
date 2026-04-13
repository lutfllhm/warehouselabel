import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { api } from "../../api/client.js";
import { useNotifications } from "../../providers/useNotifications.js";
import { useRealtimeData } from "../../hooks/useRealtimeData.js";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { push } = useNotifications();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/notifications?limit=20");
      setNotifications(data);
      
      const { data: countData } = await api.get("/notifications/unread-count");
      setUnreadCount(countData.count);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Listen to realtime notification updates
  useRealtimeData(['notification'], (payload) => {
    console.log('🔔 New notification received:', payload.data);
    
    // Show toast notification
    if (payload.data?.message) {
      push({
        type: 'info',
        title: 'Aktivitas Baru',
        message: payload.data.message
      });
    }
    
    // Reload notifications
    loadNotifications();
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (error) {
      push({ type: "error", title: "Error", message: "Gagal menandai notifikasi" });
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all-read");
      await loadNotifications();
      push({ type: "success", title: "Berhasil", message: "Semua notifikasi ditandai sudah dibaca" });
    } catch (error) {
      push({ type: "error", title: "Error", message: "Gagal menandai semua notifikasi" });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      await loadNotifications();
      push({ type: "success", title: "Berhasil", message: "Notifikasi dihapus" });
    } catch (error) {
      push({ type: "error", title: "Error", message: "Gagal menghapus notifikasi" });
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case "create":
        return "text-emerald-500";
      case "update":
        return "text-sky-500";
      case "delete":
        return "text-rose-500";
      default:
        return "text-slate-400";
    }
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case "create":
        return "+";
      case "update":
        return "✎";
      case "delete":
        return "×";
      default:
        return "•";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 p-2 text-slate-200 shadow-sm transition hover:bg-slate-900/60"
        aria-label="Notifications"
        title="Notifikasi"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-100">Notifikasi</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Memuat...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Belum ada notifikasi</div>
            ) : (
              <div className="divide-y divide-slate-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative px-4 py-3 transition hover:bg-slate-700/50 ${
                      !notif.is_read ? "bg-slate-700/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold ${getActionColor(
                          notif.action_type
                        )}`}
                      >
                        {getActionIcon(notif.action_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-200">{notif.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">{notif.entity_type}</span>
                          <span>•</span>
                          <span>{formatTime(notif.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        {!notif.is_read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notif.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-600 hover:text-emerald-400"
                            title="Tandai sudah dibaca"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-600 hover:text-rose-400"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-700 px-4 py-2 text-center">
              <button
                type="button"
                onClick={loadNotifications}
                className="text-xs font-semibold text-indigo-400 transition hover:text-indigo-300"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
