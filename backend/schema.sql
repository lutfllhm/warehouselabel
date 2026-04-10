-- ============================================
-- RBM Warehouse Label - Database Schema
-- ============================================
-- Version: 2.0
-- Last Updated: 2026-04-10
-- Description: Complete database schema untuk sistem warehouse label management
-- ============================================

CREATE DATABASE IF NOT EXISTS warehouse_label;
USE warehouse_label;

-- ============================================
-- TABLE: users
-- Deskripsi: Menyimpan data user dan autentikasi
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(120) NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- Deskripsi: Kategori material dan supplier
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_kategori VARCHAR(120) NOT NULL,
  supplier VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nama_kategori (nama_kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: material_stocks
-- Deskripsi: Stock material (bahan baku)
-- ============================================
CREATE TABLE IF NOT EXISTS material_stocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATE NOT NULL,
  no_po VARCHAR(120) NOT NULL,
  nama_material VARCHAR(120) NOT NULL,
  ukuran_panjang DECIMAL(10,2) NOT NULL,
  ukuran_lebar DECIMAL(10,2) NOT NULL,
  jumlah_roll INT DEFAULT 0,
  supplier_id INT NULL,
  kategori_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_no_po (no_po),
  INDEX idx_nama_material (nama_material)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: label_stocks
-- Deskripsi: Stock label (produk jadi)
-- ============================================
CREATE TABLE IF NOT EXISTS label_stocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATE NOT NULL,
  pn_prefix VARCHAR(80) NOT NULL,
  nama_item VARCHAR(120) NOT NULL,
  ukuran_value VARCHAR(30) NULL,
  stock_awal INT NOT NULL DEFAULT 0,
  stock_total INT NOT NULL DEFAULT 0,
  finishing ENUM('FI','FO','CORELESS','FANFOLD','SHEET') NOT NULL DEFAULT 'FI',
  isi VARCHAR(80) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Aman',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_pn_prefix (pn_prefix),
  INDEX idx_nama_item (nama_item),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: label_masuk
-- Deskripsi: Transaksi label masuk (incoming)
-- ============================================
CREATE TABLE IF NOT EXISTS label_masuk (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATE NOT NULL,
  no_lps VARCHAR(120) NOT NULL,
  pn VARCHAR(60) NOT NULL,
  nama_item VARCHAR(120) NOT NULL,
  ukuran VARCHAR(40) NOT NULL,
  jumlah_roll INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_no_lps (no_lps),
  INDEX idx_pn (pn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: label_keluar
-- Deskripsi: Transaksi label keluar (outgoing)
-- ============================================
CREATE TABLE IF NOT EXISTS label_keluar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tanggal DATE NOT NULL,
  no_sj VARCHAR(120) NOT NULL,
  pn VARCHAR(60) NOT NULL,
  nama_item VARCHAR(120) NOT NULL,
  ukuran VARCHAR(40) NOT NULL,
  jumlah_roll INT NOT NULL DEFAULT 0,
  customer VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_no_sj (no_sj),
  INDEX idx_pn (pn),
  INDEX idx_customer (customer)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: lps_docs
-- Deskripsi: Dokumen LPS (Laporan Produksi Selesai)
-- ============================================
CREATE TABLE IF NOT EXISTS lps_docs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  no_lps VARCHAR(120) NOT NULL,
  pn VARCHAR(60) NOT NULL,
  detail_form JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_no_lps (no_lps),
  INDEX idx_pn (pn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: sj_docs
-- Deskripsi: Dokumen SJ (Surat Jalan)
-- ============================================
CREATE TABLE IF NOT EXISTS sj_docs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  no_sj VARCHAR(120) NOT NULL,
  pn VARCHAR(60) NOT NULL,
  detail_form JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_no_sj (no_sj),
  INDEX idx_pn (pn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: app_settings
-- Deskripsi: Pengaturan aplikasi (key-value store)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(80) UNIQUE NOT NULL,
  setting_value TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: backup_logs
-- Deskripsi: Log backup database
-- ============================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_name VARCHAR(160) NOT NULL,
  note VARCHAR(255) NULL,
  created_by VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: notifications
-- Deskripsi: Notifikasi aktivitas user
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(100) NOT NULL,
  action_type ENUM('create', 'update', 'delete') NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_name VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Insert default superadmin user
-- Username: superadmin
-- Password: admin123
INSERT INTO users (username, password_hash, role)
VALUES ('superadmin', '$2b$10$5DzNioIzg7BXg04vRIYzZOw7GnOrs5NMSt9fuy9JMkFDWHmRzgGfG', 'superadmin')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Insert sample notifications
INSERT INTO notifications (user_id, username, action_type, entity_type, entity_name, message) VALUES
(1, 'superadmin', 'create', 'material_stocks', 'Material Baru', 'superadmin menambahkan data material baru'),
(1, 'superadmin', 'update', 'label_stocks', 'Label ABC', 'superadmin mengupdate data label ABC'),
(1, 'superadmin', 'delete', 'categories', 'Kategori X', 'superadmin menghapus kategori X')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- SCHEMA INFORMATION
-- ============================================
SELECT 'Database schema created successfully!' AS status;
SELECT 'Default user: superadmin / admin123' AS info;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'warehouse_label';
