import { useState, useEffect } from "react";
import { Printer, Zap } from "lucide-react";

export default function LabelPrinterAnimation() {
  const [printingLabel, setPrintingLabel] = useState(0);
  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrintingLabel((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const labels = [
    { id: 1, text: "RBM-001", subtext: "Material Stock" },
    { id: 2, text: "LABEL-RBM", subtext: "Warehouse" },
    { id: 3, text: "WH-2024", subtext: "Inventory" },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8 shadow-2xl dark:border-slate-800/70 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/90">
      {/* Background decorations */}
      <div className="absolute right-0 top-0 h-40 w-40 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"></div>
      <div className="absolute left-0 bottom-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-gradient-to-tr from-sky-400/20 to-blue-400/20 blur-3xl"></div>

      <div className="relative flex h-full flex-col items-center justify-center space-y-8">
        {/* Printer Machine */}
        <div className="relative">
          {/* Printer Body */}
          <div className="relative rounded-2xl border-4 border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 p-6 shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            {/* Printer Top */}
            <div className="absolute -top-3 left-1/2 h-6 w-32 -translate-x-1/2 rounded-t-xl border-2 border-slate-300 bg-gradient-to-b from-slate-200 to-slate-100 dark:border-slate-700 dark:from-slate-700 dark:to-slate-800"></div>
            
            {/* Logo on Printer */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white/80 px-3 py-1.5 shadow-md backdrop-blur-sm dark:bg-slate-950/80">
              <img src="/img/rbm.png" alt="RBM" className="h-6 w-6 object-contain" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">RBM</span>
            </div>

            {/* Status Indicator */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isPrinting ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {isPrinting ? "Printing..." : "Ready"}
              </span>
            </div>

            {/* Printer Display */}
            <div className="mt-8 flex items-center justify-center">
              <div className="relative h-48 w-64">
                {/* Printer Slot */}
                <div className="absolute inset-x-0 top-0 h-4 rounded-t-lg border-2 border-slate-400 bg-slate-800 dark:border-slate-600"></div>
                
                {/* Printing Area */}
                <div className="absolute inset-x-0 top-4 h-40 overflow-hidden rounded-b-lg border-2 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                  {/* Print Head */}
                  <div className="absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-slate-400 to-slate-500 shadow-lg animate-[printHead_3s_ease-in-out_infinite] dark:from-slate-600 dark:to-slate-700">
                    <div className="flex h-full items-center justify-center gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-1 w-1 rounded-full bg-slate-200"></div>
                      ))}
                    </div>
                  </div>

                  {/* Label being printed */}
                  <div className="absolute inset-x-4 top-12 animate-[labelPrint_3s_ease-in-out_infinite]">
                    <div className="rounded-xl border-2 border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      {/* Logo watermark */}
                      <div className="absolute right-2 top-2 opacity-10">
                        <img src="/img/rbm.png" alt="RBM" className="h-8 w-8 object-contain" />
                      </div>

                      {/* Label content */}
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-2">
                          <Printer size={20} className="text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {labels[printingLabel].text}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {labels[printingLabel].subtext}
                          </p>
                        </div>
                        {/* Barcode */}
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-4 w-0.5 ${i % 2 === 0 ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-400 dark:bg-slate-600"}`}
                              style={{ height: i % 3 === 0 ? "16px" : "12px" }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paper roll indicator */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="h-3 w-3 rounded-full border-2 border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-800"></div>
                    <span>Roll</span>
                  </div>
                </div>

                {/* Output tray */}
                <div className="absolute -bottom-6 inset-x-0 h-8 rounded-b-xl border-2 border-t-0 border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900"></div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-600">
                <Zap size={14} className="inline mr-1" />
                Print
              </button>
              <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Pause
              </button>
            </div>
          </div>

          {/* Printer Shadow */}
          <div className="absolute -bottom-4 inset-x-8 h-4 rounded-full bg-slate-900/20 blur-xl dark:bg-black/40"></div>
        </div>

        {/* Info Text */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Label Printer System
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sistem cetak otomatis untuk label warehouse dengan logo RBM
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="rounded-xl bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm dark:bg-slate-950/80">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">1000+</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Labels/Day</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm dark:bg-slate-950/80">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">99.9%</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Accuracy</p>
          </div>
          <div className="rounded-xl bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm dark:bg-slate-950/80">
            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">24/7</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Operation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
