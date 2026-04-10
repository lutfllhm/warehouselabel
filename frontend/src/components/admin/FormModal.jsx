import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { itemOptions } from "../../constants/app.js";
import { parsePnNumber, parseUkuranMm } from "../../utils/documents.js";
import StructuredItemInput from "./StructuredItemInput.jsx";

export default function FormModal({ mode, initial, fields, categories, onClose, onSubmit, safeDateKey }) {
  const seed = useMemo(() => {
    const empty = Object.fromEntries(fields.map((f) => [f, ""]));
    if (mode === "stock-label") empty.finishing = "FI";
    if (!initial) return empty;

    if (mode === "stock-material") {
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_po: initial.no_po ?? "",
        nama_material: initial.nama_material ?? "",
        ukuran_panjang: initial.ukuran_panjang ?? "",
        ukuran_lebar: initial.ukuran_lebar ?? "",
        jumlah_roll: initial.jumlah_roll ?? "",
        kategori_id: initial.kategori_id != null ? String(initial.kategori_id) : "",
      };
    }
    if (mode === "stock-label") {
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        pn_number: parsePnNumber(initial.pn_prefix),
        nama_item: initial.nama_item ?? "",
        ukuran_value: initial.ukuran_value ?? "",
        stock_awal: initial.stock_awal ?? "",
        stock_total: initial.stock_total ?? "",
        finishing: initial.finishing ?? "FI",
        isi: initial.isi ?? "",
      };
    }
    if (mode === "kategori") {
      return { ...empty, nama_kategori: initial.nama_kategori ?? "", supplier: initial.supplier ?? "" };
    }
    if (mode === "transaksi-masuk") {
      const u = parseUkuranMm(initial.ukuran);
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_lps: initial.no_lps ?? "",
        pn_number: parsePnNumber(initial.pn),
        nama_item: initial.nama_item ?? "",
        ukuran_panjang: u.panjang,
        ukuran_lebar: u.lebar,
        jumlah_roll: initial.jumlah_roll ?? "",
      };
    }
    if (mode === "transaksi-keluar") {
      const u = parseUkuranMm(initial.ukuran);
      return {
        ...empty,
        tanggal: safeDateKey(initial.tanggal) || "",
        no_sj: initial.no_sj ?? "",
        pn_number: parsePnNumber(initial.pn),
        nama_item: initial.nama_item ?? "",
        ukuran_panjang: u.panjang,
        ukuran_lebar: u.lebar,
        jumlah_roll: initial.jumlah_roll ?? "",
      };
    }
    if (mode === "documen-lps" || mode === "documen-sj") {
      let d = initial.detail_form;
      if (typeof d === "string") {
        try {
          d = JSON.parse(d);
        } catch {
          d = {};
        }
      }
      return {
        ...empty,
        no_lps: initial.no_lps ?? "",
        no_sj: initial.no_sj ?? "",
        pn: initial.pn ?? "",
        detail_customer: d?.customer ?? "",
        detail_qty: d?.qty ?? "",
        detail_notes: d?.notes ?? "",
      };
    }
    if (mode === "users") {
      return {
        ...empty,
        full_name: initial.full_name ?? "",
        username: initial.username ?? "",
        password: "",
        role: initial.role ?? "admin",
      };
    }
    if (mode === "setting") {
      return {
        ...empty,
        setting_key: initial.setting_key ?? "",
        setting_value: initial.setting_value ?? "",
      };
    }
    return empty;
  }, [mode, initial, fields, safeDateKey]);

  const [form, setForm] = useState(seed);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [useStructuredInput, setUseStructuredInput] = useState(false);

  const numericFields = useMemo(
    () => new Set(["ukuran_panjang", "ukuran_lebar", "jumlah_roll", "stock_awal", "stock_total", "detail_qty"]),
    [],
  );

  const validate = useCallback(() => {
    const next = {};
    const requirePositive = (field, label) => {
      const raw = form[field];
      if (raw === "" || raw === null || raw === undefined) {
        next[field] = `${label} wajib diisi.`;
        return;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n <= 0) next[field] = `${label} harus lebih dari 0.`;
    };

    const requireNonNegative = (field, label) => {
      const raw = form[field];
      if (raw === "" || raw === null || raw === undefined) {
        next[field] = `${label} wajib diisi.`;
        return;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) next[field] = `${label} tidak boleh negatif.`;
    };

    if (mode === "stock-material") {
      requirePositive("ukuran_panjang", "Ukuran panjang");
      requirePositive("ukuran_lebar", "Ukuran lebar");
      requirePositive("jumlah_roll", "Jumlah roll");
    }
    if (mode === "stock-label") {
      requireNonNegative("stock_awal", "Stock awal");
      requireNonNegative("stock_total", "Stock total");
    }
    if (mode === "transaksi-masuk" || mode === "transaksi-keluar") {
      requirePositive("ukuran_panjang", "Ukuran panjang");
      requirePositive("ukuran_lebar", "Ukuran lebar");
      requirePositive("jumlah_roll", "Jumlah roll");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [form, mode]);

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    const normalized = { ...form };

    if (mode === "stock-material") {
      normalized.ukuran_panjang = Number(form.ukuran_panjang || 0);
      normalized.ukuran_lebar = Number(form.ukuran_lebar || 0);
      normalized.jumlah_roll = Number(form.jumlah_roll || 0);
      normalized.kategori_id = form.kategori_id ? Number(form.kategori_id) : null;
    }
    if (mode === "stock-label") {
      normalized.stock_awal = Number(form.stock_awal || 0);
      normalized.stock_total = Number(form.stock_total || 0);
      normalized.ukuran_value = Number(form.ukuran_value || 0);
    }
    if (mode === "transaksi-masuk" || mode === "transaksi-keluar") {
      normalized.jumlah_roll = Number(form.jumlah_roll || 0);
      normalized.ukuran_panjang = Number(form.ukuran_panjang || 0);
      normalized.ukuran_lebar = Number(form.ukuran_lebar || 0);
    }
    if (mode === "users" && initial?.id && !form.password) {
      delete normalized.password;
    }

    try {
      await onSubmit(normalized);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] dark:bg-black/60">
      <form
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-slate-100 dark:ring-1 dark:ring-slate-800/70"
        onSubmit={submit}
      >
        <h4 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          {String(mode).replace(/([A-Z])/g, " $1")}
        </h4>
        
        {/* Checkbox untuk structured input - di luar grid */}
        {(mode === "stock-label" || mode === "transaksi-masuk" || mode === "transaksi-keluar") && (
          <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={useStructuredInput}
                onChange={(e) => setUseStructuredInput(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-slate-600"
              />
              <span className="font-medium">Gunakan input terstruktur untuk nama item</span>
            </label>
            <p className="ml-6 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Format otomatis: Lb. [ukuran] [tipe] [finishing] [deskripsi]
            </p>
          </div>
        )}
        
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field} className={`text-sm ${field === "detail_notes" ? "md:col-span-2" : ""}`}>
              <span className="mb-1 block text-slate-600 dark:text-slate-300">{field.replaceAll("_", " ")}</span>

              {field === "tanggal" ? (
                <input
                  type="date"
                  value={form[field] ?? ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                />
              ) : field === "finishing" ? (
                <select
                  value={form[field] || "FI"}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  {["FI", "FO", "CORELESS", "FANFOLD", "SHEET"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : field === "kategori_id" ? (
                <select
                  value={form[field] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              ) : field === "nama_item" && (mode === "stock-label" || mode === "transaksi-masuk" || mode === "transaksi-keluar") ? (
                <>
                  {useStructuredInput ? (
                    <StructuredItemInput
                      value={form[field] ?? ""}
                      onChange={(val) => setForm((s) => ({ ...s, [field]: val }))}
                      finishing={form.finishing || "FI"}
                      onFinishingChange={
                        mode === "stock-label"
                          ? (val) => setForm((s) => ({ ...s, finishing: val }))
                          : undefined
                      }
                      onUkuranChange={
                        mode === "transaksi-masuk" || mode === "transaksi-keluar"
                          ? (panjang, lebar) => {
                              setForm((s) => ({
                                ...s,
                                ukuran_panjang: panjang,
                                ukuran_lebar: lebar,
                              }));
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <>
                      <input
                        list="nama-item-saran"
                        value={form[field] ?? ""}
                        onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                        placeholder="Ketik atau pilih dari saran"
                      />
                      <datalist id="nama-item-saran">
                        {itemOptions.map((o) => (
                          <option key={o} value={o} />
                        ))}
                      </datalist>
                    </>
                  )}
                </>
              ) : field === "role" ? (
                <select
                  value={form[field] || "admin"}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                >
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                  <option value="operator">operator</option>
                </select>
              ) : field === "detail_notes" ? (
                <textarea
                  value={form[field] || ""}
                  onChange={(e) => setForm((s) => ({ ...s, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  rows={3}
                />
              ) : (
                <input
                  type={
                    field.includes("password") ? "password" : numericFields.has(field) ? "number" : "text"
                  }
                  value={form[field] ?? ""}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setForm((s) => ({ ...s, [field]: nextVal }));
                    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                  required={field === "password" && mode === "users" && !initial?.id}
                  min={numericFields.has(field) ? 0 : undefined}
                  step={numericFields.has(field) ? 1 : undefined}
                  placeholder={
                    field.includes("pn_number")
                      ? "Angka saja, /label-RBM otomatis"
                      : field === "jumlah_roll"
                        ? "Angka saja (Roll otomatis di sistem)"
                        : field.includes("ukuran_panjang") || field.includes("ukuran_lebar") || field === "ukuran_value"
                          ? "Angka / format sesuai kolom"
                          : ""
                  }
                  disabled={mode === "users" && initial?.id && field === "username"}
                />
              )}

              {!!errors[field] && <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{errors[field]}</p>}
              {field === "ukuran_panjang" && mode === "stock-material" && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Contoh 1000M x 225mm: isi panjang 1000 (M) dan lebar 225 (mm).
                </p>
              )}
              {field === "ukuran_lebar" && mode === "stock-material" && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lebar dalam mm, panjang dalam M.
                </p>
              )}
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800/40"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            {isSaving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

