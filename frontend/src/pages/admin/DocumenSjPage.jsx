import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function DocumenSjPage() {
  const { dataMap, openForm, openDetail, openPrintDocument } = useAdminOutlet();
  return (
    <TableSection
      title="Documen SJ"
      columns={["No", "No SJ", "PN", "Aksi"]}
      rows={dataMap.sj}
      keys={["no_sj", "pn"]}
      searchKeys={["no_sj", "pn"]}
      searchPlaceholder="Cari No SJ / PN…"
      onOpenForm={(row) => openForm("documen-sj", row)}
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
        openPrintDocument(`SJ ${row.no_sj}`, { ...row, detail_form: detail });
      }}
    />
  );
}

