export default function DetailModal({ row, onClose }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800/70">
        <h4 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">Detail</h4>
        <pre className="max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800/70">
          {JSON.stringify(row, null, 2)}
        </pre>
        <div className="mt-4 text-right">
          <button
            type="button"
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

