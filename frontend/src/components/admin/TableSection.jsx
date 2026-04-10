import { useMemo, useState } from "react";
import { Search, Printer, Edit2, Trash2, Eye } from "lucide-react";
import Card from "../ui/Card.jsx";
import { PrimaryButton } from "../ui/PrimaryButton.jsx";

export default function TableSection({
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 sm:w-72"
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
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
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
                className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/30"
              >
                {columns.map((col, i) => {
                  if (i === 0) return <td key={col} className="px-3 py-3 text-slate-700 dark:text-slate-200">{idx + 1}</td>;
                  if (i === columns.length - 1) {
                    return (
                      <td key={col} className="space-x-1 whitespace-nowrap px-3 py-3 text-slate-700 dark:text-slate-200">
                        {onPrint && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10" 
                            onClick={() => onPrint(row)}
                            title="Cetak"
                          >
                            <Printer size={16} />
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="inline-flex items-center justify-center rounded-lg p-1.5 text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10" 
                          onClick={() => onOpenForm(row)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        {onDelete && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10" 
                            onClick={() => onDelete(row.id)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {onOpenDetail && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" 
                            onClick={() => onOpenDetail(row)}
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </td>
                    );
                  }
                  const keyName = keys[i - 1];
                  const val = row[keyName];
                  const isTanggal = keyName === "tanggal";
                  
                  // Format tanggal: ambil hanya bagian YYYY-MM-DD
                  let displayVal = val;
                  if (isTanggal && val) {
                    const dateStr = String(val);
                    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
                    displayVal = match ? match[1] : dateStr;
                  }
                  
                  return (
                    <td key={col} className={`px-3 py-3 text-slate-700 dark:text-slate-200 ${isTanggal ? "text-xs" : ""}`}>
                      {displayVal === null || displayVal === undefined || displayVal === "" ? "—" : String(displayVal)}
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

