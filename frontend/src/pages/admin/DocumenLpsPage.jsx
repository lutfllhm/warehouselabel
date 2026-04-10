import { useState } from "react";
import TableSection from "../../components/admin/TableSection.jsx";
import LpsDetailModal from "../../components/admin/LpsDetailModal.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function DocumenLpsPage() {
  const { dataMap, openForm, openPrintDocument } = useAdminOutlet();
  const [detailDoc, setDetailDoc] = useState(null);

  return (
    <>
      <TableSection
        title="Documen LPS"
        columns={["No", "Tanggal", "No LPS", "Jumlah Item", "Aksi"]}
        rows={dataMap.lps}
        keys={["tanggal", "no_lps", "item_count"]}
        searchKeys={["tanggal", "no_lps"]}
        searchPlaceholder="Cari Tanggal / No LPS…"
        onOpenForm={(row) => openForm("documen-lps", row)}
        onOpenDetail={(row) => setDetailDoc(row)}
        onPrint={(row) => {
          openPrintDocument(`LPS ${row.no_lps}`, row);
        }}
      />

      {detailDoc && (
        <LpsDetailModal
          lpsDoc={detailDoc}
          onClose={() => setDetailDoc(null)}
        />
      )}
    </>
  );
}

