-- Create default admin user for Railway deployment
-- Password: admin123
-- Run this after deploying to Railway

-- Connect to Railway MySQL first:
-- railway connect MySQL

-- Then run this script:
-- source scripts/create-admin.sql;

USE warehouse_label;

-- Check if admin already exists
SELECT COUNT(*) as admin_exists FROM users WHERE username = 'admin';

-- Create admin user (password: admin123)
-- Hash generated with bcrypt, rounds=10
INSERT INTO users (full_name, username, password_hash, role) 
VALUES (
  'Administrator', 
  'admin', 
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
)
ON DUPLICATE KEY UPDATE 
  full_name = 'Administrator',
  role = 'admin';

-- Verify
SELECT id, full_name, username, role, created_at FROM users WHERE username = 'admin';

-- Success message
SELECT '✅ Admin user created successfully!' as status;
SELECT 'Username: admin' as credentials;
SELECT 'Password: admin123' as credentials;
SELECT '⚠️  Please change password after first login!' as warning;
