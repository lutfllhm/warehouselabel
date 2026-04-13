import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import BrandLogo from "../components/BrandLogo.jsx";
import Card from "../components/ui/Card.jsx";
import { PrimaryButton } from "../components/ui/PrimaryButton.jsx";
import { useNotifications } from "../providers/useNotifications.js";
import ThemeToggle from "../components/theme/ThemeToggle.jsx";
import { useTheme } from "../providers/useTheme.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function LoginPage() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { push } = useNotifications();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      push({ type: "success", title: "Berhasil masuk", message: "Selamat datang!" });
      navigate("/app/dashboard");
    } catch {
      setError("Gagal login, cek lagi username/password-nya.");
      push({ type: "error", title: "Gagal login", message: "Username atau password salah nih." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Decorations - subtle untuk light, lebih visible untuk dark */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-indigo-100 blur-3xl animate-[floaty_10s_ease-in-out_infinite] dark:bg-indigo-500/14" />
      <div className="pointer-events-none absolute -right-28 top-16 h-72 w-72 rounded-full bg-sky-100 blur-3xl animate-[floaty_12s_ease-in-out_infinite] dark:bg-sky-500/12" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-2">
        <div className="animate-[fadeIn_0.55s_ease-out]">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:underline"
            >
              <span aria-hidden="true">←</span> Kembali ke beranda
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <BrandLogo className="h-12 w-12" imgClassName="object-contain" />
            <div>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">RBM Warehouse Label</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Akses Sistem Internal</h1>
            </div>
          </div>

          <p className="mt-4 max-w-lg text-slate-600 dark:text-slate-300">
            Login dulu buat akses sistem gudang. Nanti bisa kelola stok, cek transaksi, sama lihat dokumen.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Cepat</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Gak ribet, langsung pakai.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Akurat</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Data update terus, bisa dipercaya.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Aman</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Cuma yang punya akses bisa masuk.</p>
            </div>
          </div>
        </div>

        <div className="animate-[fadeIn_0.65s_ease-out]">
          <Card className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-50 blur-2xl dark:bg-indigo-500/12" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-sky-50 blur-2xl dark:bg-sky-500/12" />

            <div className="relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Login Dulu Yuk</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Pakai username dan password yang udah didaftarin.</p>

              <form className="mt-6 space-y-4" onSubmit={submit}>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">Username</span>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    placeholder="Masukkan username"
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    autoComplete="username"
                    required
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700 dark:text-slate-200">Password</span>
                  <input
                    type="password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    autoComplete="current-password"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/35 dark:text-rose-200">
                    {error}
                  </div>
                )}

                <PrimaryButton
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-2xl px-4 py-3 font-semibold shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                    {isSubmitting ? "Memproses…" : "Masuk"}
                  </span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] transition duration-700 group-hover:translate-x-full" />
                </PrimaryButton>

                <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                  Sistem ini khusus buat internal RBM aja ya. Jangan coba-coba akses sembarangan.
                </p>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
