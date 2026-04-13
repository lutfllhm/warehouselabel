# 🗄️ Database Setup - Railway

Panduan untuk setup database di Railway (otomatis & manual).

## ⚡ Quick Setup (Otomatis)

### Via Railway CLI (Recommended)

```bash
# Run init script via Railway
railway run --service backend npm run init-db
```

Script akan otomatis:
- ✅ Membuat semua tabel
- ✅ Membuat user admin default
- ✅ Verifikasi setup berhasil

### Via Local (jika Railway CLI tidak tersedia)

```bash
# 1. Set environment variables dari Railway
export DB_HOST=<railway-mysql-host>
export DB_PORT=<railway-mysql-port>
export DB_USER=<railway-mysql-user>
export DB_PASSWORD=<railway-mysql-password>
export DB_NAME=<railway-mysql-database>

# 2. Run init script
cd backend
npm run init-db
```

---

## 📋 Manual Setup

### Cara 1: Via Railway CLI

```bash
# Connect to MySQL
railway connect MySQL

# Import schema
source backend/schema.sql;

# Verify tables
SHOW TABLES;

# Create admin user
INSERT INTO users (full_name, username, password_hash, role) 
VALUES ('Administrator', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

# Exit
exit;
```

### Cara 2: Via MySQL Client

```bash
# Get connection details dari Railway Dashboard
# MySQL service → Connect → Copy connection string

# Connect
mysql -h <host> -u <user> -p<password> -P <port> <database>

# Import schema
source backend/schema.sql;

# Verify
SHOW TABLES;

# Exit
exit;
```

### Cara 3: Via Railway Dashboard

1. Buka Railway Dashboard
2. Pilih MySQL service
3. Klik tab **"Data"**
4. Copy isi file `backend/schema.sql`
5. Paste ke query editor
6. Klik **"Execute"**

---

## ✅ Verify Database Setup

### Check Tables Created

```bash
# Via Railway CLI
railway run --service backend node -e "require('./src/db').query('SHOW TABLES').then(([rows]) => console.log(rows))"
```

Expected output (13 tables):
```
users
categories
material_stocks
label_stocks
label_masuk
label_keluar
lps_docs
lps_items
sj_docs
sj_items
notifications
app_settings
backup_logs
```

### Check Admin User

```bash
railway run --service backend node -e "require('./src/db').query('SELECT username, role FROM users').then(([rows]) => console.log(rows))"
```

Expected output:
```
[ { username: 'admin', role: 'admin' } ]
```

---

## 🔄 Auto-Initialize on Deploy

Untuk membuat database otomatis ter-initialize saat deploy:

### Opsi 1: Update Start Command

Edit `backend/railway.toml`:

```toml
[deploy]
startCommand = "npm run init-db && npm start"
```

⚠️ **Warning:** Ini akan run init setiap deploy. Aman karena `CREATE TABLE IF NOT EXISTS`.

### Opsi 2: One-time Setup

Lebih aman, run manual sekali saja:

```bash
railway run --service backend npm run init-db
```

---

## 🔧 Troubleshooting

### Error: "Table already exists"

Ini normal jika tabel sudah ada. Script menggunakan `CREATE TABLE IF NOT EXISTS`.

### Error: "Access denied"

Check database credentials:

```bash
railway variables --service backend | grep DB_
```

### Error: "Unknown database"

Database belum dibuat. Railway seharusnya auto-create, tapi jika tidak:

```bash
railway connect MySQL
CREATE DATABASE warehouse_label;
USE warehouse_label;
source backend/schema.sql;
```

### Tables tidak muncul di Railway Dashboard

Refresh halaman atau check via CLI:

```bash
railway connect MySQL
SHOW TABLES;
```

---

## 📊 Database Schema

Total 13 tables:

### Core Tables
- `users` - User accounts
- `categories` - Material categories
- `material_stocks` - Material inventory
- `label_stocks` - Label inventory

### Transactions
- `label_masuk` - Incoming labels
- `label_keluar` - Outgoing labels

### Documents
- `lps_docs` - LPS documents
- `lps_items` - LPS document items
- `sj_docs` - SJ documents
- `sj_items` - SJ document items

### System
- `notifications` - User notifications
- `app_settings` - Application settings
- `backup_logs` - Backup history

---

## 🔐 Default Admin User

**Credentials:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT:** Ganti password setelah login pertama!

**Change password via API:**
```bash
curl -X POST https://your-backend.railway.app/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "old_password": "admin123",
    "new_password": "your-new-secure-password"
  }'
```

---

## 📝 Database Initialization Checklist

- [ ] MySQL service running di Railway
- [ ] Backend deployed dan running
- [ ] Environment variables (DB_*) sudah di-set
- [ ] Run `railway run --service backend npm run init-db`
- [ ] Verify 13 tables created
- [ ] Verify admin user exists
- [ ] Test login dengan admin/admin123
- [ ] Ganti password admin

---

## 🚀 Quick Commands

```bash
# Initialize database
railway run --service backend npm run init-db

# Check tables
railway connect MySQL
SHOW TABLES;

# Check users
SELECT * FROM users;

# Exit
exit;
```

---

## 📚 Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md) - Quick start
- [RAILWAY-TROUBLESHOOTING.md](./RAILWAY-TROUBLESHOOTING.md) - Troubleshooting

---

**Quick Setup:**
```bash
railway run --service backend npm run init-db
```

Done! Database ready to use. 🎉
