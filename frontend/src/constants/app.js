import { ArrowDownToLine, ArrowUpFromLine, BarChart3, Database, FileText, LayoutDashboard, LineChart, Package, PackageOpen, Receipt, Repeat2, Settings, Users, Warehouse } from "lucide-react";

export const menus = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Stock",
    icon: Warehouse,
    children: [
      { key: "stock-material", label: "Stock Material", icon: PackageOpen },
      { key: "stock-label", label: "Stock Label", icon: BarChart3 },
    ],
  },
  { key: "kategori", label: "Kategori Material", icon: Database },
  {
    label: "Transaksi",
    icon: Repeat2,
    children: [
      { key: "transaksi-masuk", label: "Label Masuk", icon: ArrowDownToLine },
      { key: "transaksi-keluar", label: "Label Keluar", icon: ArrowUpFromLine },
    ],
  },
  {
    label: "Documen",
    icon: FileText,
    children: [
      { key: "documen-lps", label: "Documen LPS", icon: Receipt },
      { key: "documen-sj", label: "Documen SJ", icon: FileText },
    ],
  },
  { key: "report", label: "Report", icon: LineChart },
  { key: "users", label: "Manajemen User", icon: Users, requireSuperAdmin: true },
  { key: "backup", label: "Backup Database", icon: Database, requireSuperAdmin: true },
  { key: "setting", label: "Setting", icon: Settings },
];

// Filter menu berdasarkan role user
export function getFilteredMenus(userRole) {
  if (userRole === "superadmin") {
    return menus;
  }
  return menus.filter(menu => !menu.requireSuperAdmin);
}

const flatMenuItems = menus.flatMap((m) => (m.children ? m.children : [m]));
export const dashboardSectionKeys = flatMenuItems.map((m) => m.key).filter(Boolean);
export const dashboardSectionLabels = Object.fromEntries(flatMenuItems.map((m) => [m.key, m.label]));

export const itemOptions = [
  "GP1L",
  "GP2L",
  "GP3L",
  "GP4L",
  "G1L",
  "G2L",
  "G3L",
  "G4L",
  "CORELESS",
  "EYEMARK",
  "HALFCUT",
];
