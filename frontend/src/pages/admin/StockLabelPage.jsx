import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function StockLabelPage() {
  const { labelRows, doDelete, openForm, openDetail } = useAdminOutlet();
  return (
    <TableSection
      title="Stock Label"
      columns={["No", "Tanggal", "PN", "Nama Item", "Stock Awal", "Stock Total", "Aksi"]}
      rows={labelRows}
      keys={["tanggal", "pn_prefix", "nama_item", "stock_awal_disp", "stock_total_disp"]}
      searchKeys={["tanggal", "pn_prefix", "nama_item"]}
      searchPlaceholder="Cari tanggal / PN / item…"
      onDelete={(delId) => doDelete("/label-stocks", delId)}
      onOpenForm={(row) => openForm("stock-label", row)}
      onOpenDetail={openDetail}
    />
  );
}

