import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function KategoriPage() {
  const { dataMap, doDelete, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Kategori Material"
      columns={["No", "Kategori", "Supplier", "Aksi"]}
      rows={dataMap.kategori}
      keys={["nama_kategori", "supplier"]}
      searchKeys={["nama_kategori", "supplier"]}
      searchPlaceholder="Cari kategori / supplier…"
      onDelete={(delId) => doDelete("/categories", delId)}
      onOpenForm={(row) => openForm("kategori", row)}
    />
  );
}

