import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TableSection from "../../components/admin/TableSection.jsx";
import SjDetailModal from "../../components/admin/SjDetailModal.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function DocumenSjPage() {
  const { dataMap, openForm, safeDateKey } = useAdminOutlet();
  const [detailDoc, setDetailDoc] = useState(null);
  const navigate = useNavigate();

  return (
    <>
      <TableSection
        title="Documen SJ"
        columns={["No", "Tanggal", "No SJ (Delivery Order)", "Customer", "Jumlah Item", "Aksi"]}
        rows={dataMap.sj}
        keys={["tanggal", "no_sj", "customer", "item_count"]}
        searchKeys={["no_sj", "customer"]}
        searchPlaceholder="Cari No SJ / Customer…"
        onOpenForm={(row) => openForm("documen-sj", row)}
        onOpenDetail={(row) => setDetailDoc(row)}
        onPrint={(row) => {
          navigate("/app/sj-export", { state: { sjDoc: row } });
        }}
        formatters={{
          tanggal: (val) => safeDateKey(val) || "-",
          customer: (val) => val || "-",
          item_count: (val) => `${val || 0} item`,
        }}
      />

      {detailDoc && (
        <SjDetailModal
          sjDoc={detailDoc}
          onClose={() => setDetailDoc(null)}
        />
      )}
    </>
  );
}

