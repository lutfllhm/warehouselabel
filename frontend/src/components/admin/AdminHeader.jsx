import BrandLogo from "../BrandLogo.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { Loader2, Menu, RefreshCw } from "lucide-react";

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
    <div className="group mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl md:p-6">
      {/* Animated gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            className="group/btn inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-slate-200 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-indigo-400 hover:shadow-indigo-500/20 active:scale-95 lg:hidden"
            onClick={onOpenMenu}
            aria-label="Open menu"
          >
            <Menu size={20} className="transition-transform group-hover/btn:rotate-180" />
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-xl bg-indigo-500/20 blur-md"></div>
            <BrandLogo className="relative h-10 w-10 flex-shrink-0 rounded-xl" imgClassName="object-contain" alt="RBM" />
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">RBM Warehouse Label</p>
            <h2 className="truncate text-xl font-bold text-white md:text-2xl">{title}</h2>
            {lastUpdatedLabel && (
              <p className="mt-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Terakhir update: {lastUpdatedLabel}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-bold text-white">{user?.full_name || user?.username || "Admin"}</p>
            {user?.role && (
              <p className="text-xs text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  {user.role}
                </span>
              </p>
            )}
          </div>
          
          <NotificationBell />
          
          <button
            type="button"
            onClick={onRefresh}
            className="group/btn hidden items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:border-indigo-500/50 hover:bg-slate-900 hover:text-indigo-400 hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 sm:inline-flex"
            disabled={isLoading}
            title="Refresh data"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Memuat…</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} className="transition-transform group-hover/btn:rotate-180" />
                <span>Refresh</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onLogout}
            className="group/btn rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-105 hover:from-rose-700 hover:to-rose-800 hover:shadow-xl hover:shadow-rose-500/40 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

