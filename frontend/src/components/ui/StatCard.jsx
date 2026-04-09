export default function StatCard({ label, value, maxValue = 0 }) {
  const numeric = Number(value || 0);
  const safeMax = Math.max(1, Number(maxValue || 0), numeric);
  const pct = Math.min(100, Math.max(8, (numeric / safeMax) * 100));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-colors dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{numeric}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

