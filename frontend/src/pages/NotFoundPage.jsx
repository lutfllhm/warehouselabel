import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function NotFoundPage() {
  usePageTitle("404 - Halaman Tidak Ditemukan");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Halaman tidak ditemukan</h1>
      <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">URL yang Anda buka tidak ada. Gunakan menu di bawah untuk navigasi.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">
          Beranda
        </Link>
        <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          Login
        </Link>
        <Link to="/app/dashboard" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
