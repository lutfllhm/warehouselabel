import { useState, useEffect } from "react";
import { Calendar, Download, FileText, TrendingDown, TrendingUp, Package, FileCheck, Users } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../components/ui/SecondaryButton";
import { api } from "../../api/client";
import { usePageTitle } from "../../hooks/usePageTitle";
import * as XLSX from "xlsx";

export default function ReportPage() {
  usePageTitle("Report");
  
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [byItem, setByItem] = useState({ masuk: [], keluar: [] });
  const [byCustomer, setByCustomer] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    loadReport();
  }, [period, startDate, endDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period !== "custom") {
        params.append("period", period);
      } else if (startDate && endDate) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }

      const [summaryRes, transactionsRes, byItemRes, byCustomerRes] = await Promise.all([
        api.get(`/api/reports/summary?${params}`),
        api.get(`/api/reports/transactions?${params}`),
        api.get(`/api/reports/by-item?${params}`),
        api.get(`/api/reports/by-customer?${params}`)
      ]);

      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data);
      setByItem(byItemRes.data);
      setByCustomer(byCustomerRes.data);
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    if (summary) {
      const summaryData = [
        ["LAPORAN WAREHOUSE LABEL"],
        ["Periode:", getPeriodLabel()],
        [""],
        ["RINGKASAN"],
        ["Kategori", "Total Transaksi", "Total Roll"],
        ["Label Masuk", summary.label_masuk.total_transaksi, summary.label_masuk.total_roll],
        ["Label Keluar", summary.label_keluar.total_transaksi, summary.label_keluar.total_roll],
        ["Material Stocks", summary.material_stocks.total_transaksi, summary.material_stocks.total_roll],
        [""],
        ["DOKUMEN"],
        ["Jenis Dokumen", "Total"],
        ["Dokumen LPS", summary.lps_documents],
        ["Dokumen SJ", summary.sj_documents]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");
    }

    // Transactions sheet
    if (transactions.length > 0) {
      const transData = transactions.map(t => ({
        "Tanggal": t.tanggal,
        "Tipe": t.type === "masuk" ? "Masuk" : "Keluar",
        "No Dokumen": t.type === "masuk" ? t.no_lps : t.no_sj,
        "PN": t.pn,
        "Nama Item": t.nama_item,
        "Ukuran": t.ukuran,
        "Jumlah Roll": t.jumlah_roll,
        "Customer": t.customer || "-"
      }));
      const wsTrans = XLSX.utils.json_to_sheet(transData);
      XLSX.utils.book_append_sheet(wb, wsTrans, "Transaksi");
    }

    // By Item Masuk sheet
    if (byItem.masuk.length > 0) {
      const itemMasukData = byItem.masuk.map(item => ({
        "Nama Item": item.nama_item,
        "PN": item.pn,
        "Total Transaksi": item.total_transaksi,
        "Total Roll": item.total_roll
      }));
      const wsItemMasuk = XLSX.utils.json_to_sheet(itemMasukData);
      XLSX.utils.book_append_sheet(wb, wsItemMasuk, "Per Item Masuk");
    }

    // By Item Keluar sheet
    if (byItem.keluar.length > 0) {
      const itemKeluarData = byItem.keluar.map(item => ({
        "Nama Item": item.nama_item,
        "PN": item.pn,
        "Total Transaksi": item.total_transaksi,
        "Total Roll": item.total_roll
      }));
      const wsItemKeluar = XLSX.utils.json_to_sheet(itemKeluarData);
      XLSX.utils.book_append_sheet(wb, wsItemKeluar, "Per Item Keluar");
    }

    // By Customer sheet
    if (byCustomer.length > 0) {
      const customerData = byCustomer.map(c => ({
        "Customer": c.customer || "Tidak ada customer",
        "Total Transaksi": c.total_transaksi,
        "Total Roll": c.total_roll
      }));
      const wsCustomer = XLSX.utils.json_to_sheet(customerData);
      XLSX.utils.book_append_sheet(wb, wsCustomer, "Per Customer");
    }

    const fileName = `Report_${getPeriodLabel().replace(/\s/g, "_")}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "today": return "Hari Ini";
      case "this_week": return "Minggu Ini";
      case "this_month": return "Bulan Ini";
      case "this_year": return "Tahun Ini";
      case "custom": return `${startDate} s/d ${endDate}`;
      default: return "Semua";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report"
        subtitle="Laporan transaksi dan statistik warehouse"
        icon={FileText}
      />

      {/* Filter Section */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filter Periode</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Pilih Periode
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              >
                <option value="today">Hari Ini</option>
                <option value="this_week">Minggu Ini</option>
                <option value="this_month">Bulan Ini</option>
                <option value="this_year">Tahun Ini</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {period === "custom" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <PrimaryButton
                onClick={exportToExcel}
                disabled={loading || !summary}
                className="w-full"
              >
                <Download size={18} />
                Export Excel
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Label Masuk</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.label_masuk.total_roll}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {summary.label_masuk.total_transaksi} transaksi
                </p>
              </div>
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Label Keluar</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.label_keluar.total_roll}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {summary.label_keluar.total_transaksi} transaksi
                </p>
              </div>
              <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Material Stocks</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.material_stocks.total_roll}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {summary.material_stocks.total_transaksi} transaksi
                </p>
              </div>
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <Package className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Dokumen</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {summary.lps_documents + summary.sj_documents}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  LPS: {summary.lps_documents} | SJ: {summary.sj_documents}
                </p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                <FileCheck className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card>
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("summary")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "summary"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Transaksi
            </button>
            <button
              onClick={() => setActiveTab("by-item")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "by-item"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Per Item
            </button>
            <button
              onClick={() => setActiveTab("by-customer")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "by-customer"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Per Customer
            </button>
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "summary" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Tipe</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">No Dokumen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">PN</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nama Item</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Ukuran</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Jumlah Roll</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{t.tanggal}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          t.type === "masuk"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {t.type === "masuk" ? "Masuk" : "Keluar"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {t.type === "masuk" ? t.no_lps : t.no_sj}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{t.pn}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{t.nama_item}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{t.ukuran}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">{t.jumlah_roll}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{t.customer || "-"}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Tidak ada data transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "by-item" && (
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Label Masuk per Item</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nama Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">PN</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Transaksi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byItem.masuk.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.nama_item}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.pn}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">{item.total_transaksi}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">{item.total_roll}</td>
                        </tr>
                      ))}
                      {byItem.masuk.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Label Keluar per Item</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nama Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">PN</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Transaksi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Roll</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byItem.keluar.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.nama_item}</td>
                          <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{item.pn}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">{item.total_transaksi}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">{item.total_roll}</td>
                        </tr>
                      ))}
                      {byItem.keluar.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                            Tidak ada data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "by-customer" && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Transaksi</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Total Roll</th>
                  </tr>
                </thead>
                <tbody>
                  {byCustomer.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {c.customer || "Tidak ada customer"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">{c.total_transaksi}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">{c.total_roll}</td>
                    </tr>
                  ))}
                  {byCustomer.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Tidak ada data customer
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
