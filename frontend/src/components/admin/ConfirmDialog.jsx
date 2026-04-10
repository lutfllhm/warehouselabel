import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title || "Konfirmasi"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {message || "Apakah Anda yakin ingin melanjutkan?"}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
