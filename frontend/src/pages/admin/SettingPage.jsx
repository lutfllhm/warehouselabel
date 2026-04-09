import { useState } from "react";
import Card from "../../components/ui/Card.jsx";
import { api } from "../../api/client.js";
import { useNotifications } from "../../providers/useNotifications.js";
import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

function PasswordSettingPanel() {
  const [form, setForm] = useState({ old_password: "", new_password: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const { push } = useNotifications();

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api.post("/auth/change-password", form);
      setMsg("Password berhasil diubah.");
      setForm({ old_password: "", new_password: "" });
    } catch {
      setErr("Gagal mengubah password (cek password lama).");
      push({ type: "error", title: "Gagal", message: "Tidak dapat mengubah password." });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ganti password</h3>
      <form className="mt-4 grid max-w-md gap-3" onSubmit={submit}>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Password lama</span>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
            value={form.old_password}
            onChange={(e) => setForm((s) => ({ ...s, old_password: e.target.value }))}
            required
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Password baru</span>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
            value={form.new_password}
            onChange={(e) => setForm((s) => ({ ...s, new_password: e.target.value }))}
            required
          />
        </label>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        {err && <p className="text-sm text-rose-500">{err}</p>}
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white dark:bg-indigo-500 dark:hover:bg-indigo-400">
          Simpan password
        </button>
      </form>
    </Card>
  );
}

export default function SettingPage() {
  const { dataMap, openForm } = useAdminOutlet();
  return (
    <div className="space-y-6">
      <PasswordSettingPanel />
      <TableSection
        title="Pengaturan umum (key / value)"
        columns={["No", "Key", "Value", "Aksi"]}
        rows={dataMap.settings}
        keys={["setting_key", "setting_value"]}
        searchKeys={["setting_key", "setting_value"]}
        searchPlaceholder="Cari key / value…"
        onOpenForm={(row) => openForm("setting", row)}
      />
    </div>
  );
}

