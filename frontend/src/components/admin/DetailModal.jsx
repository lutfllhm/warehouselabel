import { X } from "lucide-react";

export default function DetailModal({ row, onClose }) {
  // Format data untuk ditampilkan dengan lebih rapi
  const formatValue = (value) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Filter field yang tidak perlu ditampilkan
  const filteredEntries = Object.entries(row).filter(
    ([key]) => !key.endsWith("_disp") && key !== "id"
  );

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Detail Data</h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <div className="grid gap-4">
            {filteredEntries.map(([key, value]) => (
              <div
                key={key}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <dt className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {key === "tanggal" ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-base">{formatValue(value).split("T")[0]}</span>
                    </span>
                  ) : typeof value === "object" ? (
                    <pre className="mt-2 overflow-auto rounded bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
                      {formatValue(value)}
                    </pre>
                  ) : (
                    formatValue(value)
                  )}
                </dd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            type="button"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

