import { useCallback, useMemo, useState } from "react";
import { NotificationContext } from "./NotificationContext.js";

function Toast({ toast, onClose }) {
  const colors =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-200"
      : toast.type === "error"
        ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/35 dark:text-rose-200"
        : "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/35 dark:text-indigo-200";

  return (
    <div className={`w-[320px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${colors}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
          {toast.message ? <p className="mt-1 text-sm">{toast.message}</p> : null}
        </div>
        <button
          type="button"
          className="rounded-xl px-2 py-1 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          onClick={onClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ type = "info", title = "", message = "", durationMs = 4200 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = { id, type, title, message };
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      window.setTimeout(() => remove(id), durationMs);
    },
    [remove],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[70] space-y-3">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

