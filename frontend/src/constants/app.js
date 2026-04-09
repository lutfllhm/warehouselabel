import { BarChart3, Database, LayoutDashboard, Package, Settings, ShieldCheck, Users } from "lucide-react";

export const menus = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Stock",
    icon: Package,
    children: [
      { key: "stock-material", label: "Stock Material", icon: Package },
      { key: "stock-label", label: "Stock Label", icon: BarChart3 },
    ],
  },
  { key: "kategori", label: "Kategori Material", icon: Database },
  {
    label: "Transaksi",
    icon: Package,
    children: [
      { key: "transaksi-masuk", label: "Label Masuk", icon: Package },
      { key: "transaksi-keluar", label: "Label Keluar", icon: Package },
    ],
  },
  {
    label: "Documen",
    icon: ShieldCheck,
    children: [
      { key: "documen-lps", label: "Documen LPS", icon: ShieldCheck },
      { key: "documen-sj", label: "Documen SJ", icon: ShieldCheck },
    ],
  },
  { key: "users", label: "Manajemen User", icon: Users },
  { key: "backup", label: "Backup Database", icon: Database },
  { key: "setting", label: "Setting", icon: Settings },
];

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
