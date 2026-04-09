import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function StockMaterialPage() {
  const { materialRows, doDelete, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Stock Material"
      columns={["No", "Tanggal", "No PO", "Nama Material", "Ukuran", "Aksi"]}
      rows={materialRows}
      keys={["tanggal", "no_po", "nama_material", "ukuran_tampil"]}
      searchKeys={["tanggal", "no_po", "nama_material", "ukuran_tampil"]}
      searchPlaceholder="Cari tanggal / PO / material…"
      onDelete={(delId) => doDelete("/material-stocks", delId)}
      onOpenForm={(row) => openForm("stock-material", row)}
    />
  );
}

