export function PrimaryButton({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

