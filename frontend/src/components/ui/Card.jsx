export default function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-md transition-colors dark:bg-slate-800 ${className}`}
    >
      {children}
    </div>
  );
}

