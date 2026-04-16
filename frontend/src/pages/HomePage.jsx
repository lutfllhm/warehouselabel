import { Link } from "react-router-dom";
import { BarChart3, FileText, Lock, Package, TrendingUp, Users, CheckCircle2, ArrowRight, Menu, X } from "lucide-react";
import BrandLogo from "../components/BrandLogo.jsx";
import LabelPrinterAnimation from "../components/ui/LabelPrinterAnimation.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { useState } from "react";

export default function HomePage() {
  usePageTitle("Beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const slides = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ n, src: `/img/${n}.jpeg` }));
  const rowA = slides.slice(0, Math.ceil(slides.length / 2));
  const rowB = slides.slice(Math.ceil(slides.length / 2));

  const GalleryRow = ({ items, reverse = false }) => {
    const duplicated = [...items, ...items];
    return (
      <div className="group relative overflow-hidden">
        <div
          className={[
            "flex w-max items-center gap-6 py-3 will-change-transform",
            reverse ? "animate-[marqueeReverse_34s_linear_infinite]" : "animate-[marquee_34s_linear_infinite]",
            "group-hover:[animation-play-state:paused]",
          ].join(" ")}
        >
          {duplicated.map(({ n, src }, idx) => (
            <div
              key={`${n}-${idx}`}
              className="h-48 w-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            >
              <img
                src={src}
                alt={`Warehouse ${n}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const features = [
    {
      icon: Package,
      title: "Stok Label & Material",
      description: "Cek stok label dan material kapan aja. Semua tercatat rapi, tinggal buka sistem.",
      color: "indigo",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "Lihat data gudang dalam bentuk grafik. Langsung paham kondisi stok tanpa buka-buka laporan.",
      color: "sky",
    },
    {
      icon: FileText,
      title: "Arsip Dokumen",
      description: "Dokumen LPS & SJ tersimpan digital. Mau cari dokumen lama? Tinggal search aja.",
      color: "emerald",
    },
    {
      icon: TrendingUp,
      title: "Riwayat Transaksi",
      description: "Semua transaksi masuk-keluar tercatat otomatis. Butuh audit? Data lengkap semua.",
      color: "amber",
    },
    {
      icon: Lock,
      title: "Login Aman",
      description: "Setiap user punya akses sesuai tugasnya. Data perusahaan tetap aman.",
      color: "rose",
    },
    {
      icon: Users,
      title: "Bisa Banyak User",
      description: "Tim bisa akses bareng-bareng tanpa bentrok. Masing-masing punya role sendiri.",
      color: "purple",
    },
  ];

  const stats = [
    { value: "100%", label: "Akurasi Sistem" },
    { value: "24/7", label: "Akses Online" },
    { value: "Real-time", label: "Data Sync" },
    { value: "Secure", label: "Data Aman" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent">
      {/* Header Navigation */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-slate-900/40 backdrop-blur-lg border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <BrandLogo className="h-8 w-8 flex-shrink-0" imgClassName="object-contain" />
              <span className="hidden sm:inline text-lg font-semibold text-white whitespace-nowrap">
                RBM Warehouse Label
              </span>
              <span className="sm:hidden text-lg font-semibold text-white whitespace-nowrap">
                RBM
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Fitur
              </a>
              <a href="#about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Tentang
              </a>
              <a href="#gallery" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Galeri
              </a>
              <Link 
                to="/login" 
                className="px-6 py-2 text-sm font-medium text-white border border-white/30 hover:bg-white/10 rounded-md transition-all"
              >
                Login
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 bg-slate-900/60 backdrop-blur-lg">
              <nav className="flex flex-col gap-2">
                <a 
                  href="#features" 
                  onClick={handleNavClick}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 px-4 hover:bg-white/10 rounded-md"
                >
                  Fitur
                </a>
                <a 
                  href="#about" 
                  onClick={handleNavClick}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 px-4 hover:bg-white/10 rounded-md"
                >
                  Tentang
                </a>
                <a 
                  href="#gallery" 
                  onClick={handleNavClick}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2.5 px-4 hover:bg-white/10 rounded-md"
                >
                  Galeri
                </a>
                <Link 
                  to="/login" 
                  onClick={handleNavClick}
                  className="mt-2 text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-all py-2.5 px-4 rounded-md text-center"
                >
                  Login
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Enhanced Decorations */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-[500px] w-[500px] translate-x-1/3 rounded-full bg-gradient-to-bl from-white/20 via-white/10 to-transparent blur-3xl" />
      
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-6 lg:pt-20 lg:pb-8">{/* Reduced top padding for tight spacing */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-6 animate-[fadeIn_0.6s_ease-out]">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-lg lg:text-6xl">
                Kelola Gudang Label{" "}
                <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Jadi Lebih Mudah
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-white/90 drop-shadow-md">
                Catat stok label, tracking material masuk-keluar, simpan dokumen LPS & SJ, semua dalam satu tempat. Gak perlu ribet lagi.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 dark:shadow-indigo-500/20"
              >
                Akses Sistem
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/20 px-6 py-3.5 text-base font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/30"
              >
                Lihat Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-white drop-shadow-md">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Label Printer Animation */}
          <div className="relative animate-[fadeIn_0.8s_ease-out]">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-sky-500/20 blur-2xl"></div>
            <LabelPrinterAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative border-t border-white/20 bg-white/10 py-16 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg lg:text-4xl">Apa Aja yang Bisa Dilakukan?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">
              Fitur-fitur yang bikin kerja di gudang jadi lebih gampang
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const colorClasses = {
                indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20",
                sky: "from-sky-500 to-sky-600 shadow-sky-500/20",
                emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
                amber: "from-amber-500 to-amber-600 shadow-amber-500/20",
                rose: "from-rose-500 to-rose-600 shadow-rose-500/20",
                purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
              };

              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl border border-white/30 bg-white/10 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"></div>
                  
                  <div className="relative">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${colorClasses[feature.color]} p-3 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Profile Section */}
      <section id="about" className="relative border-t border-white/20 bg-transparent py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-start gap-8 rounded-3xl border-2 border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-md lg:grid-cols-3 lg:p-12">
            <div className="lg:col-span-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                Tentang Sistem
              </div>
              <h2 className="mt-4 text-3xl font-bold text-white">RBM Warehouse Label</h2>
              <p className="mt-4 leading-relaxed text-white/90">
                Sistem khusus buat gudang label RBM. Dibuat supaya tracking stok, nyimpen dokumen, sama ngecek aktivitas gudang jadi lebih praktis. Gak perlu manual lagi.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/30 bg-white/10 p-6 shadow-sm backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">Yang Bisa Dikerjakan</h3>
                  <ul className="mt-4 space-y-3 text-sm text-white/90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      Cek stok material & label per roll
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      Catat transaksi masuk/keluar otomatis
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      Simpan dokumen LPS/SJ digital
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      Backup data & histori lengkap
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/30 bg-white/10 p-6 shadow-sm backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white">Kenapa Pakai Ini?</h3>
                  <ul className="mt-4 space-y-3 text-sm text-white/90">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                      Data akurat, bisa dipercaya
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                      Tampilannya simpel, gampang dipake
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                      Format data rapi & konsisten
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-indigo-500" />
                      Aman, tiap user punya akses sendiri
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/30 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold text-white/70">Alamat</p>
                  <p className="mt-1 text-sm text-white">—</p>
                </div>
                <div className="rounded-xl border border-white/30 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold text-white/70">Kontak</p>
                  <p className="mt-1 text-sm text-white">—</p>
                </div>
                <div className="rounded-xl border border-white/30 bg-white/10 p-4 shadow-sm backdrop-blur-sm">
                  <p className="text-xs font-semibold text-white/70">Jam Operasional</p>
                  <p className="mt-1 text-sm text-white">—</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="relative border-t border-white/20 bg-white/5 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg lg:text-4xl">Foto-Foto Gudang</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/90">
              Begini suasana kerja di warehouse kita
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 p-8 shadow-xl backdrop-blur-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white/10 to-transparent" />

            <GalleryRow items={rowA} />
            <div className="h-4" />
            <GalleryRow items={rowB.length ? rowB : rowA} reverse />
          </div>
          <p className="mt-4 text-center text-sm text-white/70">
            💡 Tip: Hover untuk menghentikan animasi
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/20 bg-white/5 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-10 w-10" imgClassName="object-contain" />
              <div>
                <p className="text-base font-semibold text-white">RBM Warehouse Label</p>
                <p className="text-sm text-white/70">Sistem Internal • Tracking Stok • Arsip Digital</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/80">
                © {new Date().getFullYear()} RBM Warehouse Label. Sistem Internal.
              </p>
              <p className="mt-1 text-xs text-white/60">
                Bikin kerja di gudang jadi lebih praktis
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
