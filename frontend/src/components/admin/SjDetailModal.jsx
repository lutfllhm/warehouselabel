import { X } from "lucide-react";

export default function SjDetailModal({ sjDoc, onClose }) {
  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4 dark:border-slate-800 dark:from-sky-700 dark:to-sky-800">
          <div>
            <h4 className="text-xl font-semibold text-white">Detail Dokumen SJ (Surat Jalan)</h4>
            <p className="mt-1 text-sm text-sky-100">Informasi lengkap dokumen dan item</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {/* Info Dokumen */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <h5 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Informasi Dokumen
            </h5>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  No SJ (Delivery Order)
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {sjDoc.no_sj || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tanggal
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {formatDate(sjDoc.tanggal)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Customer
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {sjDoc.customer || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Jumlah Item
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {sjDoc.items?.length || 0} Item
                </dd>
              </div>
            </div>
          </div>

          {/* Tabel Items */}
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/55">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Daftar Item Label Keluar
              </h5>
            </div>
            
            {sjDoc.items && sjDoc.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-950/40">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Part Number (PN)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Nama Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/50 dark:bg-slate-900/55">
                    {sjDoc.items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.pn || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                          {item.nama_item || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {item.jumlah || item.jumlah_roll || 0} Roll
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-950/40">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Total:
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-sky-600 dark:text-sky-400">
                        {sjDoc.items.reduce((sum, item) => sum + (item.jumlah || item.jumlah_roll || 0), 0)} Roll
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                Tidak ada item dalam dokumen ini
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            type="button"
            className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
