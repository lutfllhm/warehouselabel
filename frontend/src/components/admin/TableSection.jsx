import { useMemo, useState } from "react";
import { Search, FileSpreadsheet, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 data per halaman
  const [sortConfig, setSortConfig] = useState({ key: "pn_prefix", direction: "asc" }); // Default sort by PN
  
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

  // Sorting with special handling for PN numbers
  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;
    
    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      // Special handling for PN sorting (extract number from "123/label-RBM")
      if (sortConfig.key === "pn_prefix") {
        const aNum = parseInt(String(aVal).match(/^\d+/)?.[0] || "0");
        const bNum = parseInt(String(bVal).match(/^\d+/)?.[0] || "0");
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
    
    return sorted;
  }, [filteredRows, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [query]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSort = (keyName) => {
    if (!keyName) return;
    
    setSortConfig((prev) => {
      if (prev.key === keyName) {
        if (prev.direction === 'asc') return { key: keyName, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key: keyName, direction: 'asc' };
    });
  };

  const getSortIcon = (keyName) => {
    if (sortConfig.key !== keyName) return <ArrowUpDown size={14} className="opacity-40 transition-opacity group-hover:opacity-70" />;
    if (sortConfig.direction === 'asc') return <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" />;
    return <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedRows.length)} dari {sortedRows.length} data
            {sortedRows.length !== rows.length && ` (difilter dari ${rows.length} total)`}
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

      {/* Items per page selector */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className="text-slate-600 dark:text-slate-400">Tampilkan:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-slate-600 dark:text-slate-400">data per halaman</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              {columns.map((col, i) => {
                const keyName = i > 0 && i < columns.length - 1 ? keys[i - 1] : null;
                const isSortable = keyName && i !== columns.length - 1;
                
                return (
                  <th 
                    key={col} 
                    className={`px-4 py-3 font-semibold ${isSortable ? 'cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}
                    onClick={() => isSortable && handleSort(keyName)}
                  >
                    <div className={`flex items-center gap-2 ${isSortable ? 'group' : ''}`}>
                      <span>{col}</span>
                      {isSortable && getSortIcon(keyName)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginatedRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                  {rows.length === 0 ? "Belum ada data" : "Tidak ada data yang cocok dengan pencarian"}
                </td>
              </tr>
            )}
            {paginatedRows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {columns.map((col, i) => {
                  if (i === 0) return <td key={col} className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{startIndex + idx + 1}</td>;
                  if (i === columns.length - 1) {
                    return (
                      <td key={col} className="space-x-1 whitespace-nowrap px-4 py-3">
                        {onPrint && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10" 
                            onClick={() => onPrint(row)}
                            title="Export Excel"
                          >
                            <FileSpreadsheet size={18} />
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10" 
                          onClick={() => onOpenForm(row)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        {onDelete && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10" 
                            onClick={() => onDelete(row.id)}
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {onOpenDetail && (
                          <button 
                            type="button" 
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" 
                            onClick={() => onOpenDetail(row)}
                            title="Detail"
                          >
                            <Eye size={18} />
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
                    <td key={col} className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
                      {displayVal === null || displayVal === undefined || displayVal === "" ? "—" : String(displayVal)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Halaman {currentPage} dari {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Halaman pertama"
            >
              <ChevronsLeft size={18} />
            </button>
            
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Halaman sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-[36px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      currentPage === pageNum
                        ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Halaman selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
            
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Halaman terakhir"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
