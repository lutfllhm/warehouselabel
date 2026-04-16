import { useMemo } from "react";
import { Package, Tag, TrendingUp, TrendingDown } from "lucide-react";
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
import StatCard from "../../components/ui/StatCard.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

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

export default function DashboardPage() {
  const { summary, dataMap, theme, safeDateKey } = useAdminOutlet();
  const isDark = theme === "dark";

  const cards = [
    { label: "Stock Material", value: summary.material || 0, icon: Package },
    { label: "Stock Label", value: summary.label || 0, icon: Tag },
    { label: "Label Masuk", value: summary.masuk || 0, icon: TrendingUp },
    { label: "Label Keluar", value: summary.keluar || 0, icon: TrendingDown },
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
  }, [dataMap, trendDays, safeDateKey]);
  const outByDay = useMemo(() => {
    const map = Object.fromEntries(trendDays.map((k) => [k, 0]));
    for (const r of dataMap?.transaksiOut || []) {
      const k = safeDateKey(r.tanggal);
      if (k && map[k] != null) map[k] += Number(r.jumlah_roll || 0);
    }
    return map;
  }, [dataMap, trendDays, safeDateKey]);

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
    <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out]">
      <div className="grid gap-6 lg:grid-cols-4">
        {cards.map((item, idx) => (
          <div 
            key={item.label}
            className="animate-[fadeInUp_0.8s_ease-out] opacity-0"
            style={{ 
              animationDelay: `${idx * 0.1}s`,
              animationFillMode: 'forwards'
            }}
          >
            <StatCard label={item.label} value={item.value} maxValue={maxCard} icon={item.icon} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 lg:col-span-2 animate-[fadeInUp_0.8s_ease-out_0.4s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tren Transaksi</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Perbandingan jumlah Roll label masuk vs keluar (14 hari terakhir)</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-2">
              <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="mt-6 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <LineChart data={trendData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(value) => [`${value} Roll`, ""]} contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="masuk" name="Masuk" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="keluar" name="Keluar" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 animate-[fadeInUp_0.8s_ease-out_0.5s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ringkasan Data</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Komposisi stok &amp; transaksi</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-2">
              <svg className="h-6 w-6 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 h-72 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
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
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 lg:col-span-2 animate-[fadeInUp_0.8s_ease-out_0.6s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Top Item Keluar</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Item dengan jumlah Roll keluar terbesar</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-2">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-6 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={topItems} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTick} interval={0} angle={-18} textAnchor="end" height={60} />
                <YAxis tick={axisTick} />
                <Tooltip formatter={(value) => [`${value} Roll`, ""]} contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Roll" fill="#f59e0b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-500 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800 animate-[fadeInUp_0.8s_ease-out_0.7s] opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Stock per Finishing</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribusi stok berdasarkan finishing</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-2">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
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

