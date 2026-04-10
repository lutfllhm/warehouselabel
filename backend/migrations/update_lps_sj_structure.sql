-- ============================================
-- Migration: Update LPS and SJ Document Structure
-- Date: 2026-04-10
-- Description: Mengubah struktur dokumen LPS dan SJ sesuai kebutuhan baru
-- ============================================

USE warehouse_label;

-- ============================================
-- Create or Update LPS_DOCS table structure
-- ============================================

-- Cek apakah tabel lps_docs sudah ada, jika belum buat baru
CREATE TABLE IF NOT EXISTS lps_docs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  no_lps VARCHAR(120) NOT NULL,
  tanggal DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_no_lps (no_lps)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hapus kolom lama jika ada (untuk database yang sudah punya tabel lps_docs)
SET @exist_pn := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'pn');
SET @sqlstmt := IF(@exist_pn > 0, 'ALTER TABLE lps_docs DROP COLUMN pn', 'SELECT ''Column pn does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_detail_form := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'detail_form');
SET @sqlstmt := IF(@exist_detail_form > 0, 'ALTER TABLE lps_docs DROP COLUMN detail_form', 'SELECT ''Column detail_form does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_papercore := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'papercore');
SET @sqlstmt := IF(@exist_papercore > 0, 'ALTER TABLE lps_docs DROP COLUMN papercore', 'SELECT ''Column papercore does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_customer := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'customer');
SET @sqlstmt := IF(@exist_customer > 0, 'ALTER TABLE lps_docs DROP COLUMN customer', 'SELECT ''Column customer does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_no_spk := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'no_spk');
SET @sqlstmt := IF(@exist_no_spk > 0, 'ALTER TABLE lps_docs DROP COLUMN no_spk', 'SELECT ''Column no_spk does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_po := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'po');
SET @sqlstmt := IF(@exist_po > 0, 'ALTER TABLE lps_docs DROP COLUMN po', 'SELECT ''Column po does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_bahan := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'bahan');
SET @sqlstmt := IF(@exist_bahan > 0, 'ALTER TABLE lps_docs DROP COLUMN bahan', 'SELECT ''Column bahan does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_nama_item := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'nama_item');
SET @sqlstmt := IF(@exist_nama_item > 0, 'ALTER TABLE lps_docs DROP COLUMN nama_item', 'SELECT ''Column nama_item does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_p_number := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'p_number');
SET @sqlstmt := IF(@exist_p_number > 0, 'ALTER TABLE lps_docs DROP COLUMN p_number', 'SELECT ''Column p_number does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_jumlah := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'jumlah');
SET @sqlstmt := IF(@exist_jumlah > 0, 'ALTER TABLE lps_docs DROP COLUMN jumlah', 'SELECT ''Column jumlah does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_label_masuk_id := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'label_masuk_id');
SET @sqlstmt := IF(@exist_label_masuk_id > 0, 'ALTER TABLE lps_docs DROP COLUMN label_masuk_id', 'SELECT ''Column label_masuk_id does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom tanggal jika belum ada
SET @exist_tanggal := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'lps_docs' AND COLUMN_NAME = 'tanggal');
SET @sqlstmt := IF(@exist_tanggal = 0, 'ALTER TABLE lps_docs ADD COLUMN tanggal DATE NULL AFTER no_lps', 'SELECT ''Column tanggal already exists'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Create LPS_ITEMS table (relasi many-to-many)
-- ============================================
-- Tabel untuk menyimpan item-item dalam dokumen LPS
CREATE TABLE IF NOT EXISTS lps_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lps_doc_id INT NOT NULL,
  label_masuk_id INT NOT NULL,
  p_number VARCHAR(120) NULL,
  nama_item VARCHAR(120) NULL,
  jumlah INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lps_doc_id (lps_doc_id),
  INDEX idx_label_masuk_id (label_masuk_id),
  FOREIGN KEY (lps_doc_id) REFERENCES lps_docs(id) ON DELETE CASCADE,
  FOREIGN KEY (label_masuk_id) REFERENCES label_masuk(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Update SJ_DOCS table structure (jika diperlukan)
-- ============================================
-- Untuk SJ, struktur akan disesuaikan kemudian sesuai kebutuhan

SELECT 'Migration completed successfully!' AS status;
