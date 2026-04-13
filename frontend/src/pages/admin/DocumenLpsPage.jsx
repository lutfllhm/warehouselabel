import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TableSection from "../../components/admin/TableSection.jsx";
import LpsDetailModal from "../../components/admin/LpsDetailModal.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function DocumenLpsPage() {
  const { dataMap, openForm, doDelete } = useAdminOutlet();
  const [detailDoc, setDetailDoc] = useState(null);
  const navigate = useNavigate();

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
        onDelete={(delId) => doDelete("/documents/lps", delId)}
        onPrint={(row) => {
          navigate("/app/lps-export", { state: { lpsDoc: row } });
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

