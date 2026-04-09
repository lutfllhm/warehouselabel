import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function TransaksiKeluarPage() {
  const { transaksiOutRows, doDelete, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Label Keluar"
      columns={["No", "Tanggal", "No SJ", "PN", "Nama Item", "Ukuran", "Jumlah", "Aksi"]}
      rows={transaksiOutRows}
      keys={["tanggal", "no_sj", "pn", "nama_item", "ukuran", "jumlah_disp"]}
      searchKeys={["tanggal", "no_sj", "pn", "nama_item", "ukuran"]}
      searchPlaceholder="Cari tanggal / SJ / PN / item…"
      onDelete={(delId) => doDelete("/transactions/out", delId)}
      onOpenForm={(row) => openForm("transaksi-keluar", row)}
    />
  );
}

