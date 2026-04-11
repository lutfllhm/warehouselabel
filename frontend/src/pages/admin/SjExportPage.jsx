import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card.jsx";
import { PrimaryButton } from "../../components/ui/PrimaryButton.jsx";
import { exportSjToExcel } from "../../utils/excelExport.js";

export default function SjExportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const sjDoc = location.state?.sjDoc;

  const [formData, setFormData] = useState({
    no_sj: "",
    tgl_sj: "",
  });

  useEffect(() => {
    if (!sjDoc) {
      navigate("/app/documen-sj");
      return;
    }

    // Set form data
    setFormData({
      no_sj: sjDoc.no_sj || "",
      tgl_sj: sjDoc.tanggal ? new Date(sjDoc.tanggal).toISOString().split('T')[0] : "",
    });
  }, [sjDoc, navigate]);

  const handleExport = async () => {
    const exportData = {
      ...sjDoc,
      no_sj: formData.no_sj,
      tanggal: formData.tgl_sj,
    };
    await exportSjToExcel(exportData);
  };

  if (!sjDoc) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Export SJ ke Excel
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Preview dan export dokumen Surat Jalan
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/app/documen-sj")}
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
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              No. SJ (Delivery Order)
            </label>
            <input
              type="text"
              value={formData.no_sj}
              onChange={(e) => setFormData({ ...formData, no_sj: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tanggal SJ
            </label>
            <input
              type="date"
              value={formData.tgl_sj}
              onChange={(e) => setFormData({ ...formData, tgl_sj: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Customer
            </label>
            <input
              type="text"
              value={sjDoc.customer || ""}
              readOnly
              disabled
              className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
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
                <th className="px-3 py-3 font-semibold">Nama Barang</th>
                <th className="px-3 py-3 font-semibold">Part Number</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {sjDoc.items && sjDoc.items.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/30"
                >
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.nama_item || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.pn || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {sjDoc.customer || "—"}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                    {item.jumlah || item.jumlah_roll || 0} Roll
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              <tr>
                <td colSpan="4" className="px-3 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                  Total:
                </td>
                <td className="px-3 py-3 font-bold text-sky-600 dark:text-sky-400">
                  {sjDoc.items?.reduce((sum, item) => sum + (item.jumlah || item.jumlah_roll || 0), 0) || 0} Roll
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
