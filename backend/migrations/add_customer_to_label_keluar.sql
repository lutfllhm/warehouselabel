-- Migration: Add customer column to label_keluar table
-- Date: 2026-04-10
-- Description: Menambahkan kolom customer untuk menyimpan informasi customer pada transaksi label keluar

USE warehouse_label;

-- Add customer column if not exists
ALTER TABLE label_keluar 
ADD COLUMN IF NOT EXISTS customer VARCHAR(120) NULL AFTER jumlah_roll;

-- Add index for customer column
ALTER TABLE label_keluar 
ADD INDEX IF NOT EXISTS idx_customer (customer);

-- Verify the change
DESCRIBE label_keluar;

SELECT 'Migration completed: customer column added to label_keluar table' AS status;
