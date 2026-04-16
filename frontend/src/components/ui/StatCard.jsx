import { useEffect, useState } from "react";

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

export default function StatCard({ label, value, maxValue = 0, icon: Icon }) {
  const numeric = Number(value || 0);
  const animatedValue = useCountUp(numeric);
  const safeMax = Math.max(1, Number(maxValue || 0), numeric);
  const pct = Math.min(100, Math.max(8, (numeric / safeMax) * 100));

  const getGradient = (label) => {
    if (label.includes("Material")) return "from-blue-500 to-cyan-500";
    if (label.includes("Label") && !label.includes("Masuk") && !label.includes("Keluar")) return "from-indigo-500 to-purple-500";
    if (label.includes("Masuk")) return "from-emerald-500 to-green-500";
    if (label.includes("Keluar")) return "from-amber-500 to-orange-500";
    return "from-slate-500 to-slate-600";
  };

  const getIconBg = (label) => {
    if (label.includes("Material")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (label.includes("Label") && !label.includes("Masuk") && !label.includes("Keluar")) return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
    if (label.includes("Masuk")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (label.includes("Keluar")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800">
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(label)} opacity-0 transition-opacity duration-500 group-hover:opacity-5`}></div>
      
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-br ${getGradient(label)} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}></div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-4xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              {animatedValue.toLocaleString()}
            </p>
          </div>
          
          {Icon && (
            <div className={`rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${getIconBg(label)}`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full bg-gradient-to-r ${getGradient(label)} transition-all duration-1000 ease-out shadow-lg`}
            style={{ width: `${pct}%` }}
          ></div>
        </div>

        {/* Percentage indicator */}
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          {pct.toFixed(1)}% dari maksimal
        </p>
      </div>
    </div>
  );
}


