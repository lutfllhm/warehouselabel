import TableSection from "../../components/admin/TableSection.jsx";
import { useAdminOutlet } from "./useAdminOutlet.js";

export default function UsersPage() {
  const { dataMap, doDelete, openForm } = useAdminOutlet();
  return (
    <TableSection
      title="Manajemen User"
      columns={["No", "Nama", "Username", "Role", "Aksi"]}
      rows={dataMap.users}
      keys={["full_name", "username", "role"]}
      searchKeys={["full_name", "username", "role"]}
      searchPlaceholder="Cari nama / username / role…"
      onDelete={(delId) => doDelete("/users", delId)}
      onOpenForm={(row) => openForm("users", row)}
    />
  );
}

