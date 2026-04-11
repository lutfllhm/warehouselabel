import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import { PrimaryButton } from "../../components/ui/PrimaryButton.jsx";
import { exportLpsToExcel } from "../../utils/excelExport.js";

export default function LpsExportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const lpsDoc = location.state?.lpsDoc;

  const [formData, setFormData] = useState({
    no_lps: "",
    tgl_lps: "",
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!lpsDoc) {
      navigate("/app/documen-lps");
      return;
    }

    // Set form data
    setFormData({
      no_lps: lpsDoc.no_lps || "",
      tgl_lps: lpsDoc.tanggal ? new Date(lpsDoc.tanggal).toISOString().split('T')[0] : "",
    });

    // Set items with additional fields
    if (lpsDoc.items && Array.isArray(lpsDoc.items)) {
      setItems(
        lpsDoc.items.map((item) => ({
          ...item,
          papercore: "",
          customer: "",
          no_spk: "",
          po: "",
          bahan: "",
        }))
      );
    }
  }, [lpsDoc, navigate]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleExport = async () => {
    const exportData = {
      ...lpsDoc,
      no_lps: formData.no_lps,
      tanggal: formData.tgl_lps,
      items: items,
    };
    await exportLpsToExcel(exportData);
  };

  if (!lpsDoc) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Export LPS ke Excel
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Lengkapi data tambahan sebelum export
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/documen-lps")}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {/* Info Dokumen */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Informasi Dokumen
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              No. LPS
            </label>
            <input
              type="text"
              value={formData.no_lps}
              onChange={(e) => setFormData({ ...formData, no_lps: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tanggal LPS
            </label>
            <input
              type="date"
              value={formData.tgl_lps}
              onChange={(e) => setFormData({ ...formData, tgl_lps: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </Card>

      {/* Tabel Items */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Daftar Item
          </h3>
          <PrimaryButton onClick={handleExport} className="flex items-center gap-2">
            <Download size={16} />
            Export ke Excel
          </PrimaryButton>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b-2 border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <tr>
                <th className="px-3 py-3 font-semibold">No</th>
                <th className="px-3 py-3 font-semibold">Papercore</th>
                <th className="px-3 py-3 font-semibold">Nama Item</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">P.Number</th>
                <th className="px-3 py-3 font-semibold">No. SPK</th>
                <th className="px-3 py-3 font-semibold">PO</th>
                <th className="px-3 py-3 font-semibold">Jumlah</th>
                <th className="px-3 py-3 font-semibold">Bahan</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/30"
                >
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.papercore}
                      onChange={(e) => handleItemChange(index, "papercore", e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                      placeholder="Papercore"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.nama_item || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.customer}
                      onChange={(e) => handleItemChange(index, "customer", e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                      placeholder="Customer"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.p_number || item.pn || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.no_spk}
                      onChange={(e) => handleItemChange(index, "no_spk", e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                      placeholder="No. SPK"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.po}
                      onChange={(e) => handleItemChange(index, "po", e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                      placeholder="PO"
                    />
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.jumlah || item.jumlah_roll || 0}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="text"
                      value={item.bahan}
                      onChange={(e) => handleItemChange(index, "bahan", e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                      placeholder="Bahan"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
