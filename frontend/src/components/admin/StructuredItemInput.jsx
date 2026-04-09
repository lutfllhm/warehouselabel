import { useState, useEffect } from "react";

/**
 * Komponen input terstruktur untuk nama item label
 * Format: Lb. [ukuran_panjang]mm x [ukuran_lebar]mm [tipe] [deskripsi_manual]
 * Contoh: Lb. 33mm x 15mm GPIL FO THERMAL LABEL
 */
export default function StructuredItemInput({ value, onChange, onUkuranChange }) {
  // Parse nilai awal jika ada
  const parseInitialValue = (val) => {
    if (!val) return { prefix: "Lb.", panjang: "", lebar: "", tipe: "", deskripsi: "" };
    
    const parts = val.trim().split(/\s+/);
    let prefix = "";
    let panjang = "";
    let lebar = "";
    let tipe = "";
    let deskripsi = "";
    
    // Cek prefix
    if (parts[0] === "Lb.") {
      prefix = "Lb.";
      parts.shift();
    }
    
    // Parse ukuran (33mm x 15mm)
    if (parts.length >= 3) {
      const panjangMatch = parts[0].match(/^(\d+(?:\.\d+)?)mm$/);
      if (panjangMatch && parts[1] === "x") {
        panjang = panjangMatch[1];
        const lebarMatch = parts[2].match(/^(\d+(?:\.\d+)?)mm$/);
        if (lebarMatch) {
          lebar = lebarMatch[1];
          parts.splice(0, 3);
        }
      }
    }
    
    // Cek tipe
    const tipeOptions = ["GPIL", "GP4L", "G1L", "G2L", "G3L", "G4L", "CORELESS", "EYEMARK", "HALFCUT"];
    if (parts.length > 0 && tipeOptions.includes(parts[0])) {
      tipe = parts[0];
      parts.shift();
    }
    
    // Sisanya adalah deskripsi
    deskripsi = parts.join(" ");
    
    return { prefix, panjang, lebar, tipe, deskripsi };
  };

  const [parts, setParts] = useState(() => parseInitialValue(value));

  // Update nilai lengkap ketika ada perubahan
  useEffect(() => {
    const { prefix, panjang, lebar, tipe, deskripsi } = parts;
    const components = [];
    
    if (prefix) components.push(prefix);
    if (panjang && lebar) {
      components.push(`${panjang}mm x ${lebar}mm`);
      // Update ukuran untuk field terpisah
      if (onUkuranChange) {
        onUkuranChange(panjang, lebar);
      }
    }
    if (tipe) components.push(tipe);
    if (deskripsi) components.push(deskripsi);
    
    const fullValue = components.join(" ");
    if (onChange) {
      onChange(fullValue);
    }
  }, [parts, onChange, onUkuranChange]);

  const updatePart = (key, val) => {
    setParts(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Prefix */}
        <div>
          <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
            Prefix
          </label>
          <select
            value={parts.prefix}
            onChange={(e) => updatePart("prefix", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          >
            <option value="">Tanpa prefix</option>
            <option value="Lb.">Lb.</option>
          </select>
        </div>

        {/* Tipe */}
        <div>
          <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
            Tipe
          </label>
          <select
            value={parts.tipe}
            onChange={(e) => updatePart("tipe", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          >
            <option value="">Pilih tipe</option>
            <option value="GPIL">GPIL</option>
            <option value="GP4L">GP4L</option>
            <option value="G1L">G1L</option>
            <option value="G2L">G2L</option>
            <option value="G3L">G3L</option>
            <option value="G4L">G4L</option>
            <option value="CORELESS">CORELESS</option>
            <option value="EYEMARK">EYEMARK</option>
            <option value="HALFCUT">HALFCUT</option>
          </select>
        </div>
      </div>

      {/* Ukuran */}
      <div>
        <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
          Ukuran (mm)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={parts.panjang}
            onChange={(e) => updatePart("panjang", e.target.value)}
            placeholder="Panjang"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          />
          <span className="text-slate-500 dark:text-slate-400">×</span>
          <input
            type="number"
            value={parts.lebar}
            onChange={(e) => updatePart("lebar", e.target.value)}
            placeholder="Lebar"
            min="0"
            step="0.01"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Deskripsi Manual */}
      <div>
        <label className="mb-1 block text-xs text-slate-600 dark:text-slate-400">
          Deskripsi Tambahan (Manual)
        </label>
        <input
          type="text"
          value={parts.deskripsi}
          onChange={(e) => updatePart("deskripsi", e.target.value)}
          placeholder="Contoh: FO THERMAL LABEL"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
        />
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Preview:</p>
        <p className="font-medium text-slate-800 dark:text-slate-100">
          {parts.prefix && <span>{parts.prefix} </span>}
          {parts.panjang && parts.lebar && <span>{parts.panjang}mm x {parts.lebar}mm </span>}
          {parts.tipe && <span>{parts.tipe} </span>}
          {parts.deskripsi && <span>{parts.deskripsi}</span>}
          {!parts.prefix && !parts.panjang && !parts.lebar && !parts.tipe && !parts.deskripsi && (
            <span className="text-slate-400 dark:text-slate-500 italic">Belum ada input</span>
          )}
        </p>
      </div>
    </div>
  );
}
