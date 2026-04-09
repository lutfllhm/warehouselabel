export function parsePnNumber(pn) {
  if (!pn) return "";
  return String(pn).replace(/\/label-RBM$/i, "").trim();
}

export function parseUkuranMm(str) {
  const m = String(str || "").match(/(\d+(?:\.\d+)?)\s*mm\s*x\s*(\d+(?:\.\d+)?)\s*mm/i);
  if (!m) return { panjang: "", lebar: "" };
  return { panjang: m[1], lebar: m[2] };
}

export function openPrintDocument(title, payload) {
  const w = window.open("", "_blank", "width=960,height=720");
  if (!w) return;
  const body = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 28px; color: #0f172a; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; }
        pre { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; overflow: auto; }
        @media print { body { padding: 12px; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <table>
        ${Object.entries(payload)
          .filter(([k]) => k !== "detail_form")
          .map(([k, v]) => `<tr><th>${k}</th><td>${String(v)}</td></tr>`)
          .join("")}
      </table>
      ${payload.detail_form ? `<h2 style="margin-top:20px;font-size:16px;">Detail</h2><pre>${JSON.stringify(payload.detail_form, null, 2)}</pre>` : ""}
      <script>window.onload = () => { window.print(); };</script>
    </body>
    </html>`;
  w.document.write(body);
  w.document.close();
}
