import ThemeToggle from "./ThemeToggle.jsx";

/**
 * Showcase component untuk menampilkan semua variant ThemeToggle
 * Gunakan ini untuk testing atau dokumentasi
 */
export default function ThemeToggleShowcase() {
  return (
    <div className="min-h-screen bg-white p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Theme Toggle Variants
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Pilih variant yang sesuai dengan desain aplikasi Anda
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Variant 1: Default */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Default
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Toggle dengan text label, cocok untuk header atau navbar
            </p>
            <div className="flex items-center justify-center rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <ThemeToggle variant="default" />
            </div>
            <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
              {'<ThemeToggle variant="default" />'}
            </code>
          </div>

          {/* Variant 2: Icon */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Icon Only
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Hanya icon, hemat space untuk mobile atau sidebar
            </p>
            <div className="flex items-center justify-center rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <ThemeToggle variant="icon" />
            </div>
            <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
              {'<ThemeToggle variant="icon" />'}
            </code>
          </div>

          {/* Variant 3: Switch */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Switch Style
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Toggle switch modern, cocok untuk settings page
            </p>
            <div className="flex items-center justify-center rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <ThemeToggle variant="switch" />
            </div>
            <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
              {'<ThemeToggle variant="switch" />'}
            </code>
          </div>

          {/* Variant 4: Minimal */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Minimal
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Desain minimal dengan background color yang berubah
            </p>
            <div className="flex items-center justify-center rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <ThemeToggle variant="minimal" />
            </div>
            <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
              {'<ThemeToggle variant="minimal" />'}
            </code>
          </div>

          {/* Variant 5: Gradient */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Gradient ⭐
            </h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              Paling modern dengan gradient background yang eye-catching
            </p>
            <div className="flex items-center justify-center rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <ThemeToggle variant="gradient" />
            </div>
            <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
              {'<ThemeToggle variant="gradient" />'}
            </code>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h3 className="mb-2 text-lg font-semibold text-indigo-900 dark:text-indigo-200">
            💡 Tips Penggunaan
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
            <li>• <strong>Default</strong>: Untuk header utama atau navbar dengan space cukup</li>
            <li>• <strong>Icon</strong>: Untuk mobile view atau sidebar yang compact</li>
            <li>• <strong>Switch</strong>: Untuk halaman settings atau preferences</li>
            <li>• <strong>Minimal</strong>: Untuk floating button atau quick access</li>
            <li>• <strong>Gradient</strong>: Untuk landing page atau hero section (paling eye-catching)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Custom Size
          </h3>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
            Anda juga bisa mengatur ukuran icon dengan prop <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">size</code>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <ThemeToggle variant="icon" size={14} />
            <ThemeToggle variant="icon" size={18} />
            <ThemeToggle variant="icon" size={22} />
            <ThemeToggle variant="icon" size={26} />
          </div>
          <code className="mt-3 block rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
            {'<ThemeToggle variant="icon" size={14} />'}
          </code>
        </div>
      </div>
    </div>
  );
}
