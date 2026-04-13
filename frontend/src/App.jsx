import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import BrandLogo from "./components/BrandLogo.jsx";
import { NotificationProvider } from "./providers/NotificationProvider.jsx";
import { ThemeProvider } from "./providers/ThemeProvider.jsx";
import ThemeToggle from "./components/theme/ThemeToggle.jsx";
import ThemeToggleShowcase from "./components/theme/ThemeToggleShowcase.jsx";
import DashboardPage from "./pages/admin/DashboardPage.jsx";
import StockMaterialPage from "./pages/admin/StockMaterialPage.jsx";
import StockLabelPage from "./pages/admin/StockLabelPage.jsx";
import KategoriPage from "./pages/admin/KategoriPage.jsx";
import TransaksiMasukPage from "./pages/admin/TransaksiMasukPage.jsx";
import TransaksiKeluarPage from "./pages/admin/TransaksiKeluarPage.jsx";
import DocumenLpsPage from "./pages/admin/DocumenLpsPage.jsx";
import DocumenSjPage from "./pages/admin/DocumenSjPage.jsx";
import UsersPage from "./pages/admin/UsersPage.jsx";
import BackupPage from "./pages/admin/BackupPage.jsx";
import SettingPage from "./pages/admin/SettingPage.jsx";
import LpsExportPage from "./pages/admin/LpsExportPage.jsx";
import SjExportPage from "./pages/admin/SjExportPage.jsx";
import ReportPage from "./pages/admin/ReportPage.jsx";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-transparent text-slate-100">
          {location.pathname === "/" && (
            <header className="sticky top-0 z-20 border-b border-white/30 bg-white/10 backdrop-blur-lg">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                  <BrandLogo className="h-10 w-10" imgClassName="object-contain" alt="Logo" />
                  <span className="font-semibold text-white">RBM Warehouse Label</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </header>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/theme-showcase" element={<ThemeToggleShowcase />} />
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="stock-material" element={<StockMaterialPage />} />
              <Route path="stock-label" element={<StockLabelPage />} />
              <Route path="kategori" element={<KategoriPage />} />
              <Route path="transaksi-masuk" element={<TransaksiMasukPage />} />
              <Route path="transaksi-keluar" element={<TransaksiKeluarPage />} />
              <Route path="documen-lps" element={<DocumenLpsPage />} />
              <Route path="lps-export" element={<LpsExportPage />} />
              <Route path="documen-sj" element={<DocumenSjPage />} />
              <Route path="sj-export" element={<SjExportPage />} />
              <Route path="report" element={<ReportPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="backup" element={<BackupPage />} />
              <Route path="setting" element={<SettingPage />} />
              <Route path=":legacy" element={<Navigate to="/app/dashboard" replace />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
