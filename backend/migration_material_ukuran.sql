-- Pemutakhiran database lama (phpMyAdmin): sesuaikan manual jika kolom sudah tidak ada.

USE warehouse_label;

-- Perpanjang PN penuh contoh: 12/label-RBM
ALTER TABLE label_stocks MODIFY COLUMN pn_prefix VARCHAR(80) NOT NULL;

-- Jika tabel material_stocks masih memakai ukuran_value & ukuran_suffix, jalankan:
-- ALTER TABLE material_stocks ADD COLUMN ukuran_panjang DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER nama_material;
-- ALTER TABLE material_stocks ADD COLUMN ukuran_lebar DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER ukuran_panjang;
-- UPDATE material_stocks SET ukuran_panjang = ukuran_value, ukuran_lebar = ukuran_value WHERE ukuran_panjang = 0;
-- ALTER TABLE material_stocks DROP COLUMN ukuran_value;
-- ALTER TABLE material_stocks DROP COLUMN ukuran_suffix;
