-- ============================================
-- Migration: Update SJ Document Structure
-- Date: 2026-04-11
-- Description: Mengubah struktur dokumen SJ dengan field tanggal, delivery order no, pn, dan customer
-- ============================================

USE warehouse_label;

-- ============================================
-- Update SJ_DOCS table structure
-- ============================================

-- Hapus kolom lama jika ada
SET @exist_pn := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'sj_docs' AND COLUMN_NAME = 'pn');
SET @sqlstmt := IF(@exist_pn > 0, 'ALTER TABLE sj_docs DROP COLUMN pn', 'SELECT ''Column pn does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_detail_form := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'sj_docs' AND COLUMN_NAME = 'detail_form');
SET @sqlstmt := IF(@exist_detail_form > 0, 'ALTER TABLE sj_docs DROP COLUMN detail_form', 'SELECT ''Column detail_form does not exist'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tambah kolom baru
SET @exist_tanggal := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'sj_docs' AND COLUMN_NAME = 'tanggal');
SET @sqlstmt := IF(@exist_tanggal = 0, 'ALTER TABLE sj_docs ADD COLUMN tanggal DATE NULL AFTER no_sj', 'SELECT ''Column tanggal already exists'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist_customer := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'warehouse_label' AND TABLE_NAME = 'sj_docs' AND COLUMN_NAME = 'customer');
SET @sqlstmt := IF(@exist_customer = 0, 'ALTER TABLE sj_docs ADD COLUMN customer VARCHAR(120) NULL AFTER tanggal', 'SELECT ''Column customer already exists'' AS Info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Create SJ_ITEMS table (relasi many-to-many)
-- ============================================
-- Tabel untuk menyimpan item-item dalam dokumen SJ
CREATE TABLE IF NOT EXISTS sj_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sj_doc_id INT NOT NULL,
  label_keluar_id INT NOT NULL,
  pn VARCHAR(120) NULL,
  nama_item VARCHAR(120) NULL,
  jumlah INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sj_doc_id (sj_doc_id),
  INDEX idx_label_keluar_id (label_keluar_id),
  FOREIGN KEY (sj_doc_id) REFERENCES sj_docs(id) ON DELETE CASCADE,
  FOREIGN KEY (label_keluar_id) REFERENCES label_keluar(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'SJ Migration completed successfully!' AS status;
