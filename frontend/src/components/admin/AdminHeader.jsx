import BrandLogo from "../BrandLogo.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { Loader2, Menu } from "lucide-react";

export default function AdminHeader({
  user,
  title,
  isLoading,
  lastUpdatedLabel,
  onOpenMenu,
  onRefresh,
  onLogout,
}) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-sm md:px-6 md:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/40 p-2 text-slate-200 shadow-sm transition hover:bg-slate-900/60 lg:hidden"
            onClick={onOpenMenu}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <BrandLogo className="h-9 w-9 flex-shrink-0" imgClassName="object-contain" alt="RBM" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">RBM Warehouse Label</p>
            <h2 className="truncate text-lg font-bold text-slate-100 md:text-xl">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-right text-xs md:block">
            <p className="font-semibold text-slate-100">{user?.full_name || user?.username || "Admin"}</p>
            {user?.role && <p className="text-slate-400">Role: {user.role}</p>}
          </div>
          <NotificationBell />
          <button
            type="button"
            onClick={onRefresh}
            className="hidden rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:bg-slate-900/60 disabled:opacity-60 sm:inline-flex sm:text-sm"
            disabled={isLoading}
            title="Refresh data"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Memuat…
              </span>
            ) : (
              "Refresh"
            )}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 sm:text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {lastUpdatedLabel && <p className="mt-2 text-xs text-slate-400">Terakhir update: {lastUpdatedLabel}</p>}
    </div>
  );
}

