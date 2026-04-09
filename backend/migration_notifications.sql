-- Migration untuk menambahkan tabel notifications

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
  INDEX idx_created_at (created_at DESC),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contoh data notifikasi
INSERT INTO notifications (user_id, username, action_type, entity_type, entity_name, message) VALUES
(1, 'superadmin', 'create', 'material_stocks', 'Material Baru', 'superadmin menambahkan data material baru'),
(1, 'superadmin', 'update', 'label_stocks', 'Label ABC', 'superadmin mengupdate data label ABC'),
(1, 'superadmin', 'delete', 'categories', 'Kategori X', 'superadmin menghapus kategori X');
