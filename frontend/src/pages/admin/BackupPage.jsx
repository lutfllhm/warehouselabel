import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function BackupPage() {
  const { dataMap, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Riwayat backup (log)"
      columns={["No", "File Backup", "Catatan", "Aksi"]}
      rows={dataMap.backups}
      keys={["backup_name", "note"]}
      searchKeys={["backup_name", "note"]}
      searchPlaceholder="Cari nama file / catatan…"
      onOpenForm={() => openForm("backup", null)}
    />
  );
}

