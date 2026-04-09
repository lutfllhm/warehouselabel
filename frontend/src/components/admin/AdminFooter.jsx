export default function AdminFooter() {
  return (
    <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} RBM Warehouse Label. All rights reserved.</span>
        <span className="text-[11px] sm:text-xs">Sistem monitoring stok material &amp; label — internal use only.</span>
      </div>
    </footer>
  );
}

