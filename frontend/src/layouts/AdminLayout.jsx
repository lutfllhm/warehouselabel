import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { dashboardSectionLabels } from "../constants/app.js";
import { openPrintDocument, parsePnNumber, parseUkuranMm } from "../utils/documents.js";
import { useNotifications } from "../providers/useNotifications.js";
import { useTheme } from "../providers/useTheme.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";
import AdminFooter from "../components/admin/AdminFooter.jsx";
import FormModal from "../components/admin/FormModal.jsx";
import DetailModal from "../components/admin/DetailModal.jsx";
import ConfirmDialog from "../components/admin/ConfirmDialog.jsx";

function safeDateKey(value) {
  if (!value) return null;
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useNotifications();
  const { theme } = useTheme();

  const selectedKey = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[1] || "dashboard";
  }, [location.pathname]);

  const title = dashboardSectionLabels[selectedKey] || selectedKey;

  // Update page title dynamically based on current section
  usePageTitle(title);

  const [summary, setSummary] = useState({});
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("");
  const [dataMap, setDataMap] = useState({
    material: [],
    label: [],
    kategori: [],
    transaksiIn: [],
    transaksiOut: [],
    lps: [],
    sj: [],
    users: [],
    backups: [],
    settings: [],
  });

  const [detailRow, setDetailRow] = useState(null);
  const [formState, setFormState] = useState({ open: false, mode: "", record: null });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "1");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const loadAll = useCallback(async () => {
    setLoadError("");
    setIsLoading(true);
    const [s, material, label, kategori, transaksiIn, transaksiOut, lps, sj, users, backups, settings] = await Promise.all([
      api.get("/dashboard/summary"),
      api.get("/material-stocks"),
      api.get("/label-stocks"),
      api.get("/categories"),
      api.get("/transactions/in"),
      api.get("/transactions/out"),
      api.get("/documents/lps"),
      api.get("/documents/sj"),
      api.get("/users"),
      api.get("/backups"),
      api.get("/settings"),
    ]);

    setSummary(s.data);
    setDataMap({
      material: material.data,
      label: label.data,
      kategori: kategori.data,
      transaksiIn: transaksiIn.data,
      transaksiOut: transaksiOut.data,
      lps: lps.data,
      sj: sj.data,
      users: users.data,
      backups: backups.data,
      settings: settings.data,
    });

    const now = new Date();
    setLastUpdatedLabel(
      now.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadAll().catch(() => {
        setIsLoading(false);
        setLoadError("Gagal memuat data. Pastikan backend jalan (npm run dev di folder backend) dan database sudah diimpor.");
        push({
          type: "error",
          title: "Gagal memuat data",
          message: "Periksa backend Anda dan pastikan database sudah diimpor.",
        });
      });
    }, 0);
    return () => clearTimeout(id);
  }, [loadAll, push]);

  const doDelete = useCallback(
    async (endpoint, delId) => {
      setConfirmDelete({ endpoint, delId });
    },
    [],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`${confirmDelete.endpoint}/${confirmDelete.delId}`);
      await loadAll();
      push({ type: "success", title: "Berhasil", message: "Data berhasil dihapus." });
    } catch {
      push({ type: "error", title: "Gagal", message: "Tidak dapat menghapus data." });
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, loadAll, push]);

  const submitForm = async (payload) => {
    try {
      const mode = formState.mode;
      const id = formState.record?.id;

      if (mode === "documen-lps") {
        const endpoint = id ? `/documents/lps/${id}` : "/documents/lps";
        const method = id ? "put" : "post";
        await api[method](endpoint, {
          no_lps: payload.no_lps,
          tanggal: payload.tanggal,
          label_masuk_ids: payload.label_masuk_ids || [],
        });
        setFormState({ open: false, mode: "", record: null });
        await loadAll();
        push({ type: "success", title: "Berhasil", message: "Dokumen LPS tersimpan dan No LPS telah diupdate ke Label Masuk." });
        return;
      }
      if (mode === "lps") {
        await api.post("/documents/lps", {
          no_lps: payload.no_lps,
          pn: payload.pn,
          detail_form: {
            customer: payload.detail_customer,
            qty: payload.detail_qty,
            notes: payload.detail_notes,
          },
        });
        setFormState({ open: false, mode: "", record: null });
        await loadAll();
        push({ type: "success", title: "Berhasil", message: "Dokumen LPS tersimpan." });
        return;
      }
      if (mode === "documen-sj") {
        const endpoint = id ? `/documents/sj/${id}` : "/documents/sj";
        const method = id ? "put" : "post";
        await api[method](endpoint, {
          no_sj: payload.no_sj,
          tanggal: payload.tanggal,
          label_keluar_ids: payload.label_keluar_ids || [],
        });
        setFormState({ open: false, mode: "", record: null });
        await loadAll();
        push({ type: "success", title: "Berhasil", message: "Dokumen SJ tersimpan dan No SJ telah diupdate ke Label Keluar." });
        return;
      }

      const map = {
        "stock-material": "/material-stocks",
        "stock-label": "/label-stocks",
        kategori: "/categories",
        "transaksi-masuk": "/transactions/in",
        "transaksi-keluar": "/transactions/out",
        users: "/users",
        backup: "/backups",
        setting: "/settings",
      };
      const endpoint = map[mode];

      if (mode === "users" && id) {
        await api.put(`${endpoint}/${id}`, payload);
      } else if (id && ["stock-material", "stock-label", "kategori", "transaksi-masuk", "transaksi-keluar"].includes(mode)) {
        await api.put(`${endpoint}/${id}`, payload);
      } else {
        await api.post(endpoint, {
          ...payload,
          ...(mode === "backup" ? { created_by: JSON.parse(localStorage.getItem("user") || "{}").username } : {}),
        });
      }
      setFormState({ open: false, mode: "", record: null });
      await loadAll();
      push({ type: "success", title: "Berhasil", message: "Perubahan tersimpan." });
    } catch {
      push({ type: "error", title: "Gagal", message: "Tidak dapat menyimpan perubahan." });
      throw new Error("submit_failed");
    }
  };

  const dynamicFormFields = {
    "stock-material": ["tanggal", "no_po", "nama_material", "ukuran_panjang", "ukuran_lebar", "jumlah_roll", "kategori_id"],
    "stock-label": ["tanggal", "pn_number", "nama_item", "stock_awal", "stock_total", "isi"],
    kategori: ["nama_kategori", "supplier"],
    "transaksi-masuk": ["tanggal", "no_lps", "pn_number", "nama_item", "ukuran_panjang", "ukuran_lebar", "jumlah_roll"],
    "transaksi-keluar": ["tanggal", "no_sj", "pn_number", "nama_item", "ukuran_panjang", "ukuran_lebar", "jumlah_roll", "customer"],
    "documen-lps": ["tanggal", "no_lps", "label_masuk_ids"],
    "documen-sj": ["tanggal", "no_sj", "label_keluar_ids"],
    users: ["full_name", "username", "password", "role"],
    backup: ["note"],
    setting: ["setting_key", "setting_value"],
  };

  const materialRows = useMemo(
    () =>
      dataMap.material.map((r) => ({
        ...r,
        ukuran_tampil: `${Number(r.ukuran_panjang ?? 0)}M × ${Number(r.ukuran_lebar ?? 0)}mm`,
        jumlah_disp: `${r.jumlah_roll} Roll`,
      })),
    [dataMap.material],
  );

  const labelRows = useMemo(
    () =>
      dataMap.label.map((r) => ({
        ...r,
        stock_awal_disp: `${r.stock_awal} Roll`,
        stock_total_disp: `${r.stock_total} Roll`,
      })),
    [dataMap.label],
  );

  const transaksiInRows = useMemo(
    () =>
      dataMap.transaksiIn.map((r) => ({
        ...r,
        jumlah_disp: `${r.jumlah_roll} Roll`,
      })),
    [dataMap.transaksiIn],
  );

  const transaksiOutRows = useMemo(
    () =>
      dataMap.transaksiOut.map((r) => ({
        ...r,
        jumlah_disp: `${r.jumlah_roll} Roll`,
      })),
    [dataMap.transaksiOut],
  );

  const ctx = useMemo(
    () => ({
      theme,
      title,
      selectedKey,
      user,
      summary,
      dataMap,
      materialRows,
      labelRows,
      transaksiInRows,
      transaksiOutRows,
      isLoading,
      loadError,
      lastUpdatedLabel,
      openForm: (mode, record) => setFormState({ open: true, mode, record }),
      openDetail: setDetailRow,
      doDelete,
      openPrintDocument,
      parsePnNumber,
      parseUkuranMm,
      safeDateKey,
      setMobileNavOpen,
    }),
    [
      theme,
      title,
      selectedKey,
      user,
      summary,
      dataMap,
      materialRows,
      labelRows,
      transaksiInRows,
      transaksiOutRows,
      isLoading,
      loadError,
      lastUpdatedLabel,
      doDelete,
    ],
  );

  // Legacy redirects: keep old URLs working
  const legacySectionMap = {
    material: "stock-material",
    label: "stock-label",
    transaksi: "transaksi-masuk",
    dokumen: "documen-lps",
  };
  if (legacySectionMap[selectedKey]) {
    return <Navigate to={`/app/${legacySectionMap[selectedKey]}`} replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar
        selectedKey={selectedKey}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((s) => !s)}
        onLogout={() => {
          localStorage.clear();
          navigate("/login");
        }}
      />

      <main className="min-w-0 flex-1 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:px-6 md:pt-6">
          <AdminHeader
            user={user}
            title={title}
            isLoading={isLoading}
            lastUpdatedLabel={lastUpdatedLabel}
            onOpenMenu={() => setMobileNavOpen(true)}
            onRefresh={() =>
              void loadAll().catch(() => {
                setLoadError("Gagal memuat data. Silakan coba lagi.");
                push({ type: "error", title: "Gagal memuat data", message: "Coba lagi beberapa saat." });
              })
            }
            onLogout={() => {
              localStorage.clear();
              navigate("/login");
            }}
          />

          {loadError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {loadError}
            </div>
          )}

          {isLoading && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/55 dark:text-slate-300">
              Memuat data…
            </div>
          )}

          <Outlet context={ctx} />

          <AdminFooter />
        </div>
      </main>

      {detailRow && <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />}

      {formState.open && (
        <FormModal
          key={`${formState.mode}-${formState.record?.id ?? "new"}`}
          mode={formState.mode}
          initial={formState.record}
          fields={dynamicFormFields[formState.mode]}
          categories={dataMap.kategori}
          transaksiIn={dataMap.transaksiIn}
          transaksiOut={dataMap.transaksiOut}
          onClose={() => setFormState({ open: false, mode: "", record: null })}
          onSubmit={submitForm}
          safeDateKey={safeDateKey}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Hapus Data"
          message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

