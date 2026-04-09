import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function DocumenLpsPage() {
  const { dataMap, openForm, openDetail, openPrintDocument } = useAdminOutlet();
  return (
    <TableSection
      title="Documen LPS"
      columns={["No", "No LPS", "PN", "Aksi"]}
      rows={dataMap.lps}
      keys={["no_lps", "pn"]}
      searchKeys={["no_lps", "pn"]}
      searchPlaceholder="Cari No LPS / PN…"
      onOpenForm={(row) => openForm("documen-lps", row)}
      onOpenDetail={openDetail}
      onPrint={(row) => {
        let detail = row.detail_form;
        if (typeof detail === "string") {
          try {
            detail = JSON.parse(detail);
          } catch {
            detail = {};
          }
        }
        openPrintDocument(`LPS ${row.no_lps}`, { ...row, detail_form: detail });
      }}
    />
  );
}

