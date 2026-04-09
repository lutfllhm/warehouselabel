export function SecondaryButton({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/80 dark:focus-visible:ring-indigo-500/20 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

