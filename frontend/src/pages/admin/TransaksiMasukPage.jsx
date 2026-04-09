import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function TransaksiMasukPage() {
  const { transaksiInRows, doDelete, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Label Masuk"
      columns={["No", "Tanggal", "No LPS", "PN", "Nama Item", "Ukuran", "Jumlah", "Aksi"]}
      rows={transaksiInRows}
      keys={["tanggal", "no_lps", "pn", "nama_item", "ukuran", "jumlah_disp"]}
      searchKeys={["tanggal", "no_lps", "pn", "nama_item", "ukuran"]}
      searchPlaceholder="Cari tanggal / LPS / PN / item…"
      onDelete={(delId) => doDelete("/transactions/in", delId)}
      onOpenForm={(row) => openForm("transaksi-masuk", row)}
    />
  );
}

