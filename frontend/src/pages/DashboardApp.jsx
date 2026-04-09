import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Loader2, LogOut, Menu, Search } from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { NavLink, Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { dashboardSectionKeys, dashboardSectionLabels, itemOptions, menus } from "../constants/app.js";
import { openPrintDocument, parsePnNumber, parseUkuranMm } from "../utils/documents.js";
import BrandLogo from "../components/BrandLogo.jsx";
import Card from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/PrimaryButton.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import ThemeToggle from "../components/theme/ThemeToggle.jsx";
import { useNotifications } from "../providers/useNotifications.js";
import { useTheme } from "../providers/useTheme.js";

function safeDateKey(value) {
  if (!value) return null;
  // Expecting YYYY-MM-DD, but tolerate full ISO timestamps.
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function lastNDaysKeys(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${mm}-${dd}`);
  }
  return out;
}

function DashboardContent({ summary, dataMap, isDark }) {
  const cards = [
    { label: "Stock Material", value: summary.material || 0 },
    { label: "Stock Label", value: summary.label || 0 },
    { label: "Label Masuk", value: summary.masuk || 0 },
    { label: "Label Keluar", value: summary.keluar || 0 },
  ];
  const maxCard = Math.max(1, ...cards.map((c) => Number(c.value || 0)));
  const chartData = cards.map((c) => ({ name: c.label, value: Number(c.value) }));
  const pieData = chartData.map((d) => ({ ...d, value: Math.max(0, d.value) || 0.01 }));

  const trendDays = useMemo(() => lastNDaysKeys(14), []);
  const inByDay = useMemo(() => {
    const map = Object.fromEntries(trendDays.map((k) => [k, 0]));
    for (const r of dataMap?.transaksiIn || []) {
      const k = safeDateKey(r.tanggal);
      if (k && map[k] != null) map[k] += Number(r.jumlah_roll || 0);
    }
    return map;
  }, [dataMap, trendDays]);
  const outByDay = useMemo(() => {
    const map = Object.fromEntries(trendDays.map((k) => [k, 0]));
    for (const r of dataMap?.transaksiOut || []) {
      const k = safeDateKey(r.tanggal);
      if (k && map[k] != null) map[k] += Number(r.jumlah_roll || 0);
    }
    return map;
  }, [dataMap, trendDays]);

  const trendData = useMemo(
    () =>
      trendDays.map((k) => ({
        date: k.slice(5),
        masuk: inByDay[k] || 0,
        keluar: outByDay[k] || 0,
      })),
    [trendDays, inByDay, outByDay],
  );

  const topItems = useMemo(() => {
    const agg = new Map();
    for (const r of dataMap?.transaksiOut || []) {
      const key = r.nama_item || r.pn || "—";
      agg.set(key, (agg.get(key) || 0) + Number(r.jumlah_roll || 0));
    }
    return Array.from(agg.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [dataMap]);

  const stockByFinishing = useMemo(() => {
    const agg = new Map();
    for (const r of dataMap?.label || []) {
      const key = r.finishing || "—";
      agg.set(key, (agg.get(key) || 0) + Number(r.stock_total || 0));
    }
    return Array.from(agg.entries())
      .map(([name, value]) => ({ name, value: value || 0.01 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [dataMap]);

  const axisTick = useMemo(() => ({ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }), [isDark]);
  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const tooltipStyle = useMemo(
    () => ({
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.98)",
      border: `1px solid ${isDark ? "rgba(51, 65, 85, 0.85)" : "rgba(226, 232, 240, 1)"}`,
      borderRadius: 12,
      color: isDark ? "#e2e8f0" : "#0f172a",
    }),
    [isDark],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-4">
        {cards.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} maxValue={maxCard} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 dark:bg-slate-900/55 dark:ring-slate-800/70 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tren transaksi (14 hari)</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Perbandingan jumlah Roll label masuk vs keluar.</p>
          <div className="mt-4 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(value) => [`${value} Roll`, ""]} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="masuk" name="Masuk" stroke="#4f46e5" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="keluar" name="Keluar" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 dark:bg-slate-900/55 dark:ring-slate-800/70">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ringkasan data</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Komposisi stok &amp; transaksi.</p>
          <div className="mt-3 h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={102} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={["#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b"][i % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [Number(value).toFixed(0), ""]} contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 dark:bg-slate-900/55 dark:ring-slate-800/70 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top item keluar</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Item dengan jumlah Roll keluar terbesar.</p>
          <div className="mt-4 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} interval={0} angle={-18} textAnchor="end" height={60} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(value) => [`${value} Roll`, ""]} contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Roll" fill="#4f46e5" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200/70 dark:bg-slate-900/55 dark:ring-slate-800/70">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Stock label per finishing</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribusi stok total berdasarkan finishing.</p>
          <div className="mt-3 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockByFinishing} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={2}>
                  {stockByFinishing.map((entry, i) => (
                    <Cell key={entry.name} fill={["#0ea5e9", "#22c55e", "#a855f7", "#f59e0b", "#ef4444", "#64748b"][i % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(0)} Roll`, ""]} contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSection({
  title,
  columns,
  rows,
  keys,
  searchKeys = [],
  searchPlaceholder = "Cari…",
  onDelete,
  onOpenForm,
  onOpenDetail,
  onPrint,
}) {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !Array.isArray(searchKeys) || searchKeys.length === 0) return rows;
    return rows.filter((row) =>
      searchKeys.some((k) => {
        const v = row?.[k];
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(q);
      }),
    );
  }, [rows, query, searchKeys]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {filteredRows.length} dari {rows.length} data
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {searchKeys.length > 0 && (
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 sm:w-72"
              />
            </div>
          )}
          <PrimaryButton type="button" onClick={() => onOpenForm(null)} className="rounded-lg">
            Tambah Data
          </PrimaryButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-slate-600 dark:border-slate-800/70 dark:bg-slate-950/40 dark:text-slate-300">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">
                  {rows.length === 0 ? "Belum ada data" : "Tidak ada data yang cocok dengan pencarian"}
                </td>
              </tr>
            )}
            {filteredRows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="border-b border-slate-100 hover:bg-slate-50/80 dark:border-slate-800/70 dark:hover:bg-slate-800/30"
              >
                {columns.map((col, i) => {
                  if (i === 0) return <td key={col} className="px-3 py-3 text-slate-700 dark:text-slate-200">{idx + 1}</td>;
                  if (i === columns.length - 1) {
                    return (
                      <td key={col} className="space-x-2 whitespace-nowrap px-3 py-3 text-slate-700 dark:text-slate-200">
                        {onPrint && (
                          <button type="button" className="text-sky-600 hover:underline dark:text-sky-400" onClick={() => onPrint(row)}>
                            Cetak
                          </button>
                        )}
                        <button type="button" className="text-indigo-600 hover:underline dark:text-indigo-400" onClick={() => onOpenForm(row)}>
                          Edit
                        </button>
                        {onDelete && (
                          <button type="button" className="text-rose-600 hover:underline dark:text-rose-400" onClick={() => onDelete(row.id)}>
                            Hapus
                          </button>
                        )}
                        {onOpenDetail && (
                          <button type="button" className="text-slate-600 hover:underline dark:text-slate-300" onClick={() => onOpenDetail(row)}>
                            Detail
                          </button>
                        )}
                      </td>
                    );
                  }
                  const keyName = keys[i - 1];
                  const val = row[keyName];
                  return (
                    <td key={col} className="px-3 py-3 text-slate-700 dark:text-slate-200">
                      {val === null || val === undefined || val === "" ? "—" : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PasswordSettingPanel() {
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api.post("/auth/change-password", form);
      setMsg("Password berhasil diubah.");
      setForm({ old_password: "", new_password: "" });
    } catch {
      setErr("Gagal mengubah password (cek password lama).");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ganti password</h3>
      <form className="mt-4 grid max-w-md gap-3" onSubmit={submit}>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Password lama</span>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
            value={form.old_password}
            onChange={(e) => setForm((s) => ({ ...s, old_password: e.target.value }))}
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Password baru</span>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
            value={form.new_password}
            onChange={(e) => setForm((s) => ({ ...s, new_password: e.target.value }))}
            required
          />
        </label>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          Simpan password
        </button>
      </form>
    </Card>
  );
}

function FormModal({ mode, initial, fields, categories, onClose, onSubmit }) {
  const seed = useMemo(() => {
    const empty = Object.fromEntries(fields.map((f) => [f, ""]));
    if (mode === "label") empty.finishing = "FI";
    if (!initial) return empty;

    if (mode === "material") {
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_po: initial.no_po ?? "",
        nama_material: initial.nama_material ?? "",
        ukuran_panjang: initial.ukuran_panjang ?? "",
        ukuran_lebar: initial.ukuran_lebar ?? "",
        jumlah_roll: initial.jumlah_roll ?? "",
        kategori_id: initial.kategori_id != null ? String(initial.kategori_id) : "",
      };
    }
    if (mode === "label") {
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        pn_number: parsePnNumber(initial.pn_prefix),
        nama_item: initial.nama_item ?? "",
        ukuran_value: initial.ukuran_value ?? "",
        stock_awal: initial.stock_awal ?? "",
        stock_total: initial.stock_total ?? "",
        finishing: initial.finishing ?? "FI",
        isi: initial.isi ?? "",
      };
    }
    if (mode === "kategori") {
      return { ...empty, nama_kategori: initial.nama_kategori ?? "", supplier: initial.supplier ?? "" };
    }
    if (mode === "transaksiIn") {
      const u = parseUkuranMm(initial.ukuran);
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_lps: initial.no_lps ?? "",
        pn_number: parsePnNumber(initial.pn),
        nama_item: initial.nama_item ?? "",
        ukuran_panjang: u.panjang,
        ukuran_lebar: u.lebar,
        jumlah_roll: initial.jumlah_roll ?? "",
      };
    }
    if (mode === "transaksiOut") {
      const u = parseUkuranMm(initial.ukuran);
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_sj: initial.no_sj ?? "",
        pn_number: parsePnNumber(initial.pn),
        nama_item: initial.nama_item ?? "",
        ukuran_panjang: u.panjang,
        ukuran_lebar: u.lebar,
        jumlah_roll: initial.jumlah_roll ?? "",
      };
    }
    if (mode === "lps" || mode === "sj") {
      let d = initial.detail_form;
      if (typeof d === "string") {
        try {
          d = JSON.parse(d);
        } catch {
          d = {};
        }
      }
      return {
        ...empty,
        no_lps: initial.no_lps ?? "",
        no_sj: initial.no_sj ?? "",
        pn: initial.pn ?? "",
        detail_customer: d?.customer ?? "",
        detail_qty: d?.qty ?? "",
        detail_notes: d?.notes ?? "",
      };
    }
    if (mode === "users") {
      return {
        ...empty,
        full_name: initial.full_name ?? "",
        username: initial.username ?? "",
        password: "",
        role: initial.role ?? "admin",
      };
    }
    if (mode === "settings") {
      return {
        ...empty,
        setting_key: initial.setting_key ?? "",
        setting_value: initial.setting_value ?? "",
      };
    }
    return empty;
  }, [mode, initial, fields]);

  const [form, setForm] = useState(seed);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const numericFields = useMemo(
    () =>
      new Set([
        "ukuran_panjang",
        "ukuran_lebar",
        "jumlah_roll",
        "stock_awal",
        "stock_total",
        "ukuran_value",
        "detail_qty",
      ]),
    [],
  );

  const validate = useCallback(() => {
    const next = {};
    const requirePositive = (field, label) => {
      const raw = form[field];
      if (raw === "" || raw === null || raw === undefined) {
        next[field] = `${label} wajib diisi.`;
        return;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) next[field] = `${label} harus lebih dari 0.`;
    };

    if (mode === "material") {
      requirePositive("ukuran_panjang", "Ukuran panjang");
      requirePositive("ukuran_lebar", "Ukuran lebar");
      requirePositive("jumlah_roll", "Jumlah roll");
    }
    if (mode === "label") {
      requirePositive("stock_awal", "Stock awal");
      requirePositive("stock_total", "Stock total");
      requirePositive("ukuran_value", "Ukuran");
    }
    if (mode === "transaksiIn" || mode === "transaksiOut") {
      requirePositive("ukuran_panjang", "Ukuran panjang");
      requirePositive("ukuran_lebar", "Ukuran lebar");
      requirePositive("jumlah_roll", "Jumlah roll");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form, mode]);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    const normalized = { ...form };
    if (mode === "material") {
      normalized.ukuran_panjang = Number(form.ukuran_panjang || 0);
      normalized.ukuran_lebar = Number(form.ukuran_lebar || 0);
      normalized.jumlah_roll = Number(form.jumlah_roll || 0);
      normalized.kategori_id = form.kategori_id ? Number(form.kategori_id) : null;
    }
    if (mode === "label") {
      normalized.stock_awal = Number(form.stock_awal || 0);
      normalized.stock_total = Number(form.stock_total || 0);
      normalized.ukuran_value = Number(form.ukuran_value || 0);
    }
    if (mode === "transaksiIn" || mode === "transaksiOut") {
      normalized.jumlah_roll = Number(form.jumlah_roll || 0);
      normalized.ukuran_panjang = Number(form.ukuran_panjang || 0);
      normalized.ukuran_lebar = Number(form.ukuran_lebar || 0);
    }
    if (mode === "users" && initial?.id && !form.password) {
      delete normalized.password;
    }
    try {
      await onSubmit(normalized);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] dark:bg-black/60">
      <form className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-slate-100 dark:ring-1 dark:ring-slate-800/70" onSubmit={submit}>
        <h4 className="mb-4 text-lg font-semibold capitalize text-slate-800 dark:text-slate-100">{mode.replace(/([A-Z])/g, " $1")}</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field} className={`text-sm ${field === "detail_notes" ? "md:col-span-2" : ""}`}>
              <span className="mb-1 block text-slate-600 dark:text-slate-300">{field.replaceAll("_", " ")}</span>
              {field === "tanggal" ? (
                <input
                  type="date"
                  value={form[field] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              ) : field === "finishing" ? (
                <select
                  value={form[field] || "FI"}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  {["FI", "FO", "CORELESS", "FANFOLD", "SHEET"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : field === "kategori_id" ? (
                <select
                  value={form[field] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              ) : field === "nama_item" && (mode === "label" || mode === "transaksiIn" || mode === "transaksiOut") ? (
                <>
                  <input
                    list="nama-item-saran"
                    value={form[field] ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                    placeholder="Ketik atau pilih dari saran"
                  />
                  <datalist id="nama-item-saran">
                    {itemOptions.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </>
              ) : field === "role" ? (
                <select
                  value={form[field] || "admin"}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                  <option value="operator">operator</option>
                </select>
              ) : field === "detail_notes" ? (
                <textarea
                  value={form[field] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  rows={3}
                />
              ) : (
                <input
                  type={
                    field.includes("password")
                      ? "password"
                      : numericFields.has(field)
                        ? "number"
                        : "text"
                  }
                  value={form[field] ?? ""}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setForm((s) => ({ ...s, [field]: nextVal }));
                    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  required={field === "password" && mode === "users" && !initial?.id}
                  min={numericFields.has(field) ? 0 : undefined}
                  step={numericFields.has(field) ? 1 : undefined}
                  placeholder={
                    field.includes("pn_number")
                      ? "Angka saja, /label-RBM otomatis"
                      : field === "jumlah_roll"
                        ? "Angka saja (Roll otomatis di sistem)"
                        : field.includes("ukuran_panjang") || field.includes("ukuran_lebar") || field === "ukuran_value"
                          ? "Angka / format sesuai kolom"
                          : ""
                  }
                  disabled={mode === "users" && initial?.id && field === "username"}
                />
              )}
              {!!errors[field] && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors[field]}</p>}
              {field === "ukuran_panjang" && mode === "material" && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Contoh 1000M x 100M: isi panjang 1000 dan lebar 100 (M tampil sebagai label).</p>
              )}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/40"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DashboardApp() {
  const { section } = useParams();
  const navigate = useNavigate();
  const legacySectionMap = {
    material: "stock-material",
    label: "stock-label",
    transaksi: "transaksi-masuk",
    dokumen: "documen-lps",
  };
  const legacyTarget = legacySectionMap[section];
  const isValidSection = dashboardSectionKeys.includes(section);
  const selected = isValidSection ? section : "dashboard";
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const { push } = useNotifications();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
  const [expandedMenus, setExpandedMenus] = useState(() => ({ stock: true, transaksi: false, documen: false }));

  const toggleMenuGroup = useCallback((groupKey) => {
    setExpandedMenus((s) => {
      const nextOpen = !s[groupKey];
      return {
        stock: false,
        transaksi: false,
        documen: false,
        [groupKey]: nextOpen,
      };
    });
  }, []);

  useEffect(() => {
    if (selected.startsWith("stock-")) {
      setExpandedMenus({ stock: true, transaksi: false, documen: false });
    } else if (selected.startsWith("transaksi-")) {
      setExpandedMenus({ stock: false, transaksi: true, documen: false });
    } else if (selected.startsWith("documen-")) {
      setExpandedMenus({ stock: false, transaksi: false, documen: true });
    }
  }, [selected]);

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
    const [
      s,
      material,
      label,
      kategori,
      transaksiIn,
      transaksiOut,
      lps,
      sj,
      users,
      backups,
      settings,
    ] = await Promise.all([
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
      now.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
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
      if (!window.confirm("Hapus data ini?")) return;
      try {
        await api.delete(`${endpoint}/${delId}`);
        await loadAll();
        push({ type: "success", title: "Berhasil", message: "Data berhasil dihapus." });
      } catch {
        push({ type: "error", title: "Gagal", message: "Tidak dapat menghapus data." });
      }
    },
    [loadAll, push],
  );

  const submitForm = async (payload) => {
    try {
      const mode = formState.mode;
      const id = formState.record?.id;

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
      if (mode === "sj") {
        await api.post("/documents/sj", {
          no_sj: payload.no_sj,
          pn: payload.pn,
          detail_form: {
            customer: payload.detail_customer,
            qty: payload.detail_qty,
            notes: payload.detail_notes,
          },
        });
        setFormState({ open: false, mode: "", record: null });
        await loadAll();
        push({ type: "success", title: "Berhasil", message: "Dokumen SJ tersimpan." });
        return;
      }

      const map = {
        material: "/material-stocks",
        label: "/label-stocks",
        kategori: "/categories",
        transaksiIn: "/transactions/in",
        transaksiOut: "/transactions/out",
        users: "/users",
        backups: "/backups",
        settings: "/settings",
      };
      const endpoint = map[mode];

      if (mode === "users" && id) {
        await api.put(`${endpoint}/${id}`, payload);
      } else if (id && ["material", "label", "kategori", "transaksiIn", "transaksiOut"].includes(mode)) {
        await api.put(`${endpoint}/${id}`, payload);
      } else {
        await api.post(endpoint, {
          ...payload,
          ...(mode === "backups" ? { created_by: JSON.parse(localStorage.getItem("user") || "{}").username } : {}),
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
    material: ["tanggal", "no_po", "nama_material", "ukuran_panjang", "ukuran_lebar", "jumlah_roll", "kategori_id"],
    label: ["tanggal", "pn_number", "nama_item", "ukuran_value", "stock_awal", "stock_total", "finishing", "isi"],
    kategori: ["nama_kategori", "supplier"],
    transaksiIn: ["tanggal", "no_lps", "pn_number", "nama_item", "ukuran_panjang", "ukuran_lebar", "jumlah_roll"],
    transaksiOut: ["tanggal", "no_sj", "pn_number", "nama_item", "ukuran_panjang", "ukuran_lebar", "jumlah_roll"],
    lps: ["no_lps", "pn", "detail_customer", "detail_qty", "detail_notes"],
    sj: ["no_sj", "pn", "detail_customer", "detail_qty", "detail_notes"],
    users: ["full_name", "username", "password", "role"],
    backups: ["note"],
    settings: ["setting_key", "setting_value"],
  };

  const materialRows = useMemo(
    () =>
      dataMap.material.map((r) => ({
        ...r,
        ukuran_tampil: `${Number(r.ukuran_panjang ?? 0)}M × ${Number(r.ukuran_lebar ?? 0)}M`,
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

  const content = useMemo(() => {
    if (selected === "dashboard")
      return (
        <DashboardContent
          summary={summary}
          dataMap={dataMap}
          isDark={isDark}
        />
      );
    if (selected === "stock-material")
      return (
        <TableSection
          title="Stock Material"
          columns={["No", "Tanggal", "No PO", "Nama Material", "Ukuran", "Aksi"]}
          rows={materialRows}
          keys={["tanggal", "no_po", "nama_material", "ukuran_tampil"]}
          searchKeys={["tanggal", "no_po", "nama_material", "ukuran_tampil"]}
          searchPlaceholder="Cari tanggal / PO / material…"
          onDelete={(delId) => doDelete("/material-stocks", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "material", record: row })}
        />
      );
    if (selected === "stock-label")
      return (
        <TableSection
          title="Stock Label"
          columns={["No", "Tanggal", "PN", "Nama Item", "Stock Awal", "Stock Total", "Aksi"]}
          rows={labelRows}
          keys={["tanggal", "pn_prefix", "nama_item", "stock_awal_disp", "stock_total_disp"]}
          searchKeys={["tanggal", "pn_prefix", "nama_item"]}
          searchPlaceholder="Cari tanggal / PN / item…"
          onDelete={(delId) => doDelete("/label-stocks", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "label", record: row })}
          onOpenDetail={setDetailRow}
        />
      );
    if (selected === "kategori")
      return (
        <TableSection
          title="Kategori Material"
          columns={["No", "Kategori", "Supplier", "Aksi"]}
          rows={dataMap.kategori}
          keys={["nama_kategori", "supplier"]}
          searchKeys={["nama_kategori", "supplier"]}
          searchPlaceholder="Cari kategori / supplier…"
          onDelete={(delId) => doDelete("/categories", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "kategori", record: row })}
        />
      );
    if (selected === "transaksi-masuk")
      return (
        <TableSection
          title="Label Masuk"
          columns={["No", "Tanggal", "No LPS", "PN", "Nama Item", "Ukuran", "Jumlah", "Aksi"]}
          rows={transaksiInRows}
          keys={["tanggal", "no_lps", "pn", "nama_item", "ukuran", "jumlah_disp"]}
          searchKeys={["tanggal", "no_lps", "pn", "nama_item", "ukuran"]}
          searchPlaceholder="Cari tanggal / LPS / PN / item…"
          onDelete={(delId) => doDelete("/transactions/in", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "transaksiIn", record: row })}
        />
      );
    if (selected === "transaksi-keluar")
      return (
        <TableSection
          title="Label Keluar"
          columns={["No", "Tanggal", "No SJ", "PN", "Nama Item", "Ukuran", "Jumlah", "Aksi"]}
          rows={transaksiOutRows}
          keys={["tanggal", "no_sj", "pn", "nama_item", "ukuran", "jumlah_disp"]}
          searchKeys={["tanggal", "no_sj", "pn", "nama_item", "ukuran"]}
          searchPlaceholder="Cari tanggal / SJ / PN / item…"
          onDelete={(delId) => doDelete("/transactions/out", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "transaksiOut", record: row })}
        />
      );
    if (selected === "documen-lps")
      return (
        <TableSection
          title="Documen LPS"
          columns={["No", "No LPS", "PN", "Aksi"]}
          rows={dataMap.lps}
          keys={["no_lps", "pn"]}
          searchKeys={["no_lps", "pn"]}
          searchPlaceholder="Cari No LPS / PN…"
          onOpenForm={(row) => setFormState({ open: true, mode: "lps", record: row })}
          onOpenDetail={setDetailRow}
          onPrint={(row) => {
            let detail = row.detail_form;
            if (typeof detail === "string") {
              try {
                detail = JSON.parse(detail);
              } catch {
                detail = {};
              }
            }
            openPrintDocument(`LPS ${row.no_lps}`, { ...row, detail_form: detail });
          }}
        />
      );
    if (selected === "documen-sj")
      return (
        <TableSection
          title="Documen SJ"
          columns={["No", "No SJ", "PN", "Aksi"]}
          rows={dataMap.sj}
          keys={["no_sj", "pn"]}
          searchKeys={["no_sj", "pn"]}
          searchPlaceholder="Cari No SJ / PN…"
          onOpenForm={(row) => setFormState({ open: true, mode: "sj", record: row })}
          onOpenDetail={setDetailRow}
          onPrint={(row) => {
            let detail = row.detail_form;
            if (typeof detail === "string") {
              try {
                detail = JSON.parse(detail);
              } catch {
                detail = {};
              }
            }
            openPrintDocument(`SJ ${row.no_sj}`, { ...row, detail_form: detail });
          }}
        />
      );
    if (selected === "users")
      return (
        <TableSection
          title="Manajemen User"
          columns={["No", "Nama", "Username", "Role", "Aksi"]}
          rows={dataMap.users}
          keys={["full_name", "username", "role"]}
          searchKeys={["full_name", "username", "role"]}
          searchPlaceholder="Cari nama / username / role…"
          onDelete={(delId) => doDelete("/users", delId)}
          onOpenForm={(row) => setFormState({ open: true, mode: "users", record: row })}
        />
      );
    if (selected === "backup")
      return (
        <TableSection
          title="Riwayat backup (log)"
          columns={["No", "File Backup", "Catatan", "Aksi"]}
          rows={dataMap.backups}
          keys={["backup_name", "note"]}
          searchKeys={["backup_name", "note"]}
          searchPlaceholder="Cari nama file / catatan…"
          onOpenForm={() => setFormState({ open: true, mode: "backups", record: null })}
        />
      );
    if (selected === "setting")
      return (
        <div className="space-y-6">
          <PasswordSettingPanel />
          <TableSection
            title="Pengaturan umum (key / value)"
            columns={["No", "Key", "Value", "Aksi"]}
            rows={dataMap.settings}
            keys={["setting_key", "setting_value"]}
            onOpenForm={(row) => setFormState({ open: true, mode: "settings", record: row })}
          />
        </div>
      );
    return null;
  }, [selected, summary, dataMap, materialRows, labelRows, transaksiInRows, transaksiOutRows, doDelete, isDark]);

  if (!isValidSection && legacyTarget) {
    return <Navigate to={`/app/${legacyTarget}`} replace />;
  }

  if (!isValidSection) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const getGroupKey = (label) => {
    const lower = label.toLowerCase();
    if (lower === "stock") return "stock";
    if (lower === "transaksi") return "transaksi";
    if (lower === "documen") return "documen";
    return lower;
  };

  return (
    <div className="flex min-h-screen bg-white text-slate-900 dark:bg-slate-950/80 dark:text-slate-100">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 lg:block">
        <div className="flex items-center gap-2 px-3">
          <BrandLogo className="h-9 w-9" imgClassName="object-contain" alt="RBM" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">RBM Warehouse</h2>
        </div>
        <p className="mt-2 px-3 text-xs text-slate-400 dark:text-slate-400/90">URL: /app/{selected}</p>
        <nav className="mt-5 space-y-1 text-sm">
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
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {m.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="space-y-1 pl-4">
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
                          >
                            <ChildIcon size={16} />
                            {child.label}
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
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`
                }
              >
                <Icon size={18} />
                {m.label}
              </NavLink>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="mt-8 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <Motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
              onClick={() => setMobileNavOpen(false)}
            />
            <Motion.aside
              className="absolute left-0 top-0 h-full w-[90vw] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 dark:border-slate-800/60 dark:bg-slate-900/70"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-3">
                <BrandLogo className="h-9 w-9" imgClassName="object-contain" alt="RBM" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">RBM Warehouse</h2>
              </div>
              <p className="mt-2 px-3 text-xs text-slate-400 dark:text-slate-400/90">URL: /app/{selected}</p>
              <nav className="mt-4 space-y-1">
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
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/60"
                        >
                          <span className="flex items-center gap-3">
                            <Icon size={18} />
                            {m.label}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="space-y-1 pl-4">
                            {m.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <NavLink
                                  key={child.key}
                                  to={`/app/${child.key}`}
                                  onClick={() => setMobileNavOpen(false)}
                                  className={({ isActive }) =>
                                    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                      isActive
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                                    }`
                                  }
                                >
                                  <ChildIcon size={16} />
                                  {child.label}
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
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                        }`
                      }
                    >
                      <Icon size={18} />
                      {m.label}
                    </NavLink>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                  setMobileNavOpen(false);
                }}
                className="mt-8 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
              >
                <LogOut size={16} />
                Logout
              </button>
            </Motion.aside>
          </Motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 bg-transparent">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 md:px-6 md:pt-6">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70 dark:border-slate-800/60 dark:bg-slate-900/70 dark:ring-slate-800/70 md:px-6 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
              <BrandLogo className="h-9 w-9 flex-shrink-0" imgClassName="object-contain" alt="RBM" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  RBM Warehouse Label
                </p>
                <h2 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100 md:text-xl">
                  {dashboardSectionLabels[selected] || selected.charAt(0).toUpperCase() + selected.slice(1)}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden text-right text-xs md:block">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{user.full_name || user.username || "Admin"}</p>
                {user.role && <p className="text-slate-500 dark:text-slate-400">Role: {user.role}</p>}
              </div>
              <ThemeToggle size={16} variant="switch" />
              <button
                type="button"
                onClick={() =>
                  void loadAll().catch(() => {
                    setLoadError("Gagal memuat data. Silakan coba lagi.");
                    push({ type: "error", title: "Gagal memuat data", message: "Coba lagi beberapa saat." });
                  })
                }
                className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-900/60 sm:inline-flex sm:text-sm"
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
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          {lastUpdatedLabel && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Terakhir update: {lastUpdatedLabel}</p>}
        </div>

        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{loadError}</div>
        )}
        {isLoading && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/55 dark:text-slate-300">
            Memuat data…
          </div>
        )}
        {content}
        <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} RBM Warehouse Label. All rights reserved.</span>
            <span className="text-[11px] sm:text-xs">
              Sistem monitoring stok material &amp; label — internal use only.
            </span>
          </div>
        </footer>
        </div>
        {detailRow && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800/70">
              <h4 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Detail</h4>
              <pre className="max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800/70">{JSON.stringify(detailRow, null, 2)}</pre>
              <div className="mt-4 text-right">
                <button
                  type="button"
                  className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                  onClick={() => setDetailRow(null)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
        {formState.open && (
          <FormModal
            key={`${formState.mode}-${formState.record?.id ?? "new"}`}
            mode={formState.mode}
            initial={formState.record}
            fields={dynamicFormFields[formState.mode]}
            categories={dataMap.kategori}
            onClose={() => setFormState({ open: false, mode: "", record: null })}
            onSubmit={submitForm}
          />
        )}
      </main>
    </div>
  );
}
