# Database Migrations

Folder ini berisi file-file migration untuk update database schema.

## Cara Menjalankan Migration

### Menggunakan MySQL Command Line

```bash
mysql -u root -p warehouse_label < migrations/add_customer_to_label_keluar.sql
```

### Menggunakan MySQL Workbench atau phpMyAdmin

1. Buka MySQL Workbench atau phpMyAdmin
2. Pilih database `warehouse_label`
3. Buka file migration yang ingin dijalankan
4. Copy isi file dan jalankan sebagai SQL query

## Daftar Migrations

### add_customer_to_label_keluar.sql
- **Tanggal**: 2026-04-10
- **Deskripsi**: Menambahkan kolom `customer` pada tabel `label_keluar` untuk menyimpan informasi customer
- **Perubahan**:
  - Menambah kolom `customer VARCHAR(120) NULL`
  - Menambah index pada kolom `customer`

## Catatan

- Pastikan backup database sebelum menjalankan migration
- Migration ini aman dijalankan berkali-kali (menggunakan `IF NOT EXISTS`)
- Setelah menjalankan migration, restart backend server untuk memastikan perubahan diterapkan
