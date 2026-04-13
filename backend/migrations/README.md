# Database Migrations

Folder ini berisi file-file migration untuk update struktur database.

## 📋 Daftar Migrations

### 1. `add_customer_to_label_keluar.sql`
- **Tanggal:** 2026-04-10
- **Deskripsi:** Menambahkan kolom `customer` pada tabel `label_keluar`

### 2. `add_auto_stock_update.sql` ⭐
- **Tanggal:** 2026-04-13
- **Deskripsi:** Menambahkan 7 triggers untuk auto stock update
- **Note:** Triggers ini sudah terintegrasi di `schema.sql` v3.0
- **Gunakan file ini hanya untuk database existing**

### 3. `update_sj_structure.sql`
- **Deskripsi:** Update struktur tabel SJ (Surat Jalan)

### 4. `update_lps_sj_structure.sql`
- **Deskripsi:** Update struktur tabel LPS dan SJ

### 5. `insert_260_label_stocks.sql`
- **Deskripsi:** Insert 260 data label stocks (sample data)

### 6. `test_auto_stock.sql`
- **Deskripsi:** Script testing untuk auto stock update triggers

---

## 🚀 Cara Menjalankan Migration

### Via MySQL Command Line
```bash
mysql -u root -p warehouse_label < nama_file_migration.sql
```

### Via Docker
```bash
docker exec -i warehouse-db mysql -u root -ppassword warehouse_label < nama_file_migration.sql
```

---

## ⚠️ Catatan Penting

1. **Backup database** sebelum menjalankan migration
2. **Schema.sql v3.0** sudah include auto stock triggers
3. Migration `add_auto_stock_update.sql` hanya untuk database existing
4. Test migration di development dulu sebelum production
