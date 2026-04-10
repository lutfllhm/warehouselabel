import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronDown, ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandLogo from "../BrandLogo.jsx";
import { menus } from "../../constants/app.js";
import { useEffect, useMemo, useState } from "react";

function getGroupKey(label) {
  const lower = String(label || "").toLowerCase();
  if (lower === "stock") return "stock";
  if (lower === "transaksi") return "transaksi";
  if (lower === "documen") return "documen";
  return lower;
}

export default function AdminSidebar({
  selectedKey,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
  onLogout,
}) {
  const [expandedMenus, setExpandedMenus] = useState(() => ({ stock: true, transaksi: false, documen: false }));

  useEffect(() => {
    if (String(selectedKey).startsWith("stock-")) setExpandedMenus({ stock: true, transaksi: false, documen: false });
    else if (String(selectedKey).startsWith("transaksi-")) setExpandedMenus({ stock: false, transaksi: true, documen: false });
    else if (String(selectedKey).startsWith("documen-")) setExpandedMenus({ stock: false, transaksi: false, documen: true });
  }, [selectedKey]);

  const toggleMenuGroup = (groupKey) => {
    setExpandedMenus((s) => ({
      ...s,
      [groupKey]: !s[groupKey],
    }));
  };

  const SidebarBody = useMemo(
    () => (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 ${collapsed ? "flex-col px-2" : "px-4"}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-xl bg-indigo-500/20 blur-md"></div>
              <BrandLogo className="relative h-10 w-10 rounded-xl" imgClassName="object-contain" alt="RBM" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">RBM Warehouse</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Label Management</p>
              </div>
            )}
          </div>
          
          {/* Toggle button for desktop */}
          {!mobileOpen && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="group hidden rounded-xl border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50 p-2.5 text-slate-700 shadow-md transition-all hover:border-indigo-400 hover:from-indigo-50 hover:to-indigo-100 hover:text-indigo-700 hover:shadow-lg hover:shadow-indigo-200/50 active:scale-95 dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30 dark:hover:text-indigo-400 dark:hover:shadow-indigo-500/20 lg:inline-flex"
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={20} className="transition-transform group-hover:scale-110" />
              ) : (
                <PanelLeftClose size={20} className="transition-transform group-hover:scale-110" />
              )}
            </button>
          )}
          
          {/* Close button for mobile */}
          {mobileOpen && (
            <button
              type="button"
              onClick={onMobileClose}
              className="group rounded-xl border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50 p-2.5 text-slate-700 shadow-md transition-all hover:border-rose-400 hover:from-rose-50 hover:to-rose-100 hover:text-rose-700 hover:shadow-lg hover:shadow-rose-200/50 active:scale-95 dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:text-slate-300 dark:hover:border-rose-500 dark:hover:from-rose-900/30 dark:hover:to-rose-800/30 dark:hover:text-rose-400 dark:hover:shadow-rose-500/20 lg:hidden"
              title="Tutup menu"
            >
              <X size={20} className="transition-transform group-hover:rotate-90 group-hover:scale-110" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className={`my-4 border-t border-slate-200 dark:border-slate-700 ${collapsed ? "mx-2" : "mx-4"}`}></div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-2 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          {menus.map((m) => {
            const Icon = m.icon;
            if (m.children) {
              const groupKey = getGroupKey(m.label);
              const isExpanded = !!expandedMenus[groupKey];
              const hasActiveChild = m.children.some((child) => child.key === selectedKey);
              
              return (
                <div key={m.label} className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => toggleMenuGroup(groupKey)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      collapsed ? "justify-center" : ""
                    } ${
                      hasActiveChild
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                    title={m.label}
                  >
                    <span className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                      <Icon size={20} className={hasActiveChild ? "text-indigo-600 dark:text-indigo-400" : ""} />
                      {!collapsed && <span>{m.label}</span>}
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                      />
                    )}
                    {hasActiveChild && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400"></div>
                    )}
                  </button>
                  
                  {/* Submenu with animation */}
                  <AnimatePresence>
                    {isExpanded && !collapsed && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-4"
                      >
                        <div className="space-y-1.5 border-l-2 border-slate-200 pl-3 dark:border-slate-700">
                          {m.children.map((child) => {
                            const ChildIcon = child.icon;
                            return (
                              <NavLink
                                key={child.key}
                                to={`/app/${child.key}`}
                                className={({ isActive }) =>
                                  `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                                    isActive
                                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                  }`
                                }
                                title={child.label}
                              >
                                <ChildIcon size={16} />
                                <span className="font-medium">{child.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Collapsed submenu */}
                  {collapsed && (
                    <div className="space-y-1.5">
                      {m.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.key}
                            to={`/app/${child.key}`}
                            className={({ isActive }) =>
                              `group relative flex items-center justify-center rounded-xl p-2.5 transition-all ${
                                isActive
                                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              }`
                            }
                            title={child.label}
                          >
                            <ChildIcon size={20} />
                            {/* Tooltip on hover */}
                            <div className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700 lg:block">
                              {child.label}
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single menu item
            return (
              <NavLink
                key={m.key}
                to={`/app/${m.key}`}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }`
                }
                title={m.label}
              >
                <Icon size={20} />
                {!collapsed && <span>{m.label}</span>}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700 lg:block">
                    {m.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Divider */}
        <div className={`my-3 border-t border-slate-200 dark:border-slate-700 ${collapsed ? "mx-2" : "mx-4"}`}></div>

        {/* Logout button */}
        <div className={collapsed ? "px-2" : "px-3"}>
          <button
            type="button"
            onClick={onLogout}
            className={`group relative flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500/50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 ${
              collapsed ? "justify-center" : ""
            }`}
            title="Logout"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
            {collapsed && (
              <div className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-700 lg:block">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    ),
    [collapsed, expandedMenus, onLogout, onToggleCollapsed, onMobileClose, mobileOpen, selectedKey],
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white py-5 shadow-sm transition-all duration-300 dark:border-slate-700 dark:bg-slate-900 lg:block ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {SidebarBody}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <Motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
            <Motion.aside
              className="absolute left-0 top-0 h-full w-[85vw] max-w-sm overflow-y-auto border-r border-slate-200 bg-white py-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {SidebarBody}
            </Motion.aside>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

