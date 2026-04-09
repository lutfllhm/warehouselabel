import { AnimatePresence, motion as Motion } from "framer-motion";
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

  const iconBtnBase =
    "group flex items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:focus-visible:ring-indigo-500/20";
  const iconBtnIdle =
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100";
  const iconBtnActive = "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20";

  useEffect(() => {
    if (String(selectedKey).startsWith("stock-")) setExpandedMenus({ stock: true, transaksi: false, documen: false });
    else if (String(selectedKey).startsWith("transaksi-")) setExpandedMenus({ stock: false, transaksi: true, documen: false });
    else if (String(selectedKey).startsWith("documen-")) setExpandedMenus({ stock: false, transaksi: false, documen: true });
  }, [selectedKey]);

  const toggleMenuGroup = (groupKey) => {
    setExpandedMenus((s) => {
      const nextOpen = !s[groupKey];
      return { stock: false, transaksi: false, documen: false, [groupKey]: nextOpen };
    });
  };

  const asideWidthClass = collapsed ? "w-20" : "w-72";
  const labelClass = collapsed ? "hidden" : "";
  const indentClass = collapsed ? "pl-0" : "pl-4";

  const SidebarBody = useMemo(
    () => (
      <div className="flex h-full flex-col">
        <div className={`flex items-center justify-between gap-2 ${collapsed ? "px-2" : "px-3"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
            <BrandLogo className="h-9 w-9" imgClassName="object-contain" alt="RBM" />
            <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${labelClass}`}>RBM Warehouse</h2>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`hidden ${iconBtnBase} h-10 w-10 border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60 lg:inline-flex`}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className={`mt-5 text-sm ${collapsed ? "px-2" : ""}`}>
          {menus.map((m) => {
            const Icon = m.icon;
            if (m.children) {
              const groupKey = getGroupKey(m.label);
              const isExpanded = !!expandedMenus[groupKey];
              return (
                <div key={m.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleMenuGroup(groupKey)}
                    className={
                      collapsed
                        ? `${iconBtnBase} h-10 w-full ${iconBtnIdle}`
                        : "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                    }
                    title={m.label}
                  >
                    <span className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                      <Icon size={collapsed ? 20 : 18} />
                      <span className={labelClass}>{m.label}</span>
                    </span>
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                      />
                    )}
                  </button>
                  {isExpanded && !collapsed && (
                    <div className={`space-y-1 ${indentClass}`}>
                      {m.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.key}
                            to={`/app/${child.key}`}
                            className={({ isActive }) =>
                              `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                isActive
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                              }`
                            }
                            title={child.label}
                          >
                            <ChildIcon size={16} />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                  {collapsed && (
                    <div className="space-y-1">
                      {m.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.key}
                            to={`/app/${child.key}`}
                            className={({ isActive }) =>
                              `${iconBtnBase} h-10 w-full ${isActive ? iconBtnActive : iconBtnIdle}`
                            }
                            title={child.label}
                            aria-label={child.label}
                          >
                            <ChildIcon size={20} />
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={m.key}
                to={`/app/${m.key}`}
                className={({ isActive }) =>
                  collapsed
                    ? `${iconBtnBase} h-10 w-full ${isActive ? iconBtnActive : iconBtnIdle}`
                    : `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                      }`
                }
                title={m.label}
                aria-label={m.label}
              >
                <Icon size={collapsed ? 20 : 18} />
                <span className={labelClass}>{m.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className={
            collapsed
              ? `${iconBtnBase} mt-auto h-10 w-full border border-slate-200 ${iconBtnIdle} dark:border-slate-700`
              : "mt-auto flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
          }
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span className={labelClass}>Logout</span>
        </button>
      </div>
    ),
    [collapsed, expandedMenus, indentClass, labelClass, onLogout, onToggleCollapsed, iconBtnBase, iconBtnIdle, iconBtnActive],
  );

  return (
    <>
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white py-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:block ${
          collapsed ? "px-2" : "px-4"
        } ${asideWidthClass}`}
      >
        {SidebarBody}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <Motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onMobileClose} />
            <Motion.aside
              className="absolute left-0 top-0 h-full w-[90vw] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
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

