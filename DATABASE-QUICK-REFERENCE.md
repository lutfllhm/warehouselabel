# 🗄️ Database Setup - Quick Reference

## ⚡ Quick Commands

### Initialize Database (Otomatis)
```bash
# Via Railway CLI (Recommended)
railway run --service backend npm run init-db
```

### Manual Import
```bash
# Connect to MySQL
railway connect MySQL

# Import schema
source backend/schema.sql;

# Verify tables
SHOW TABLES;

# Exit
exit;
```

### Check Tables
```bash
# Via Railway CLI
railway run --service backend node -e "require('./src/db').query('SHOW TABLES').then(([r]) => console.log(r))"

# Via MySQL
railway connect MySQL
SHOW TABLES;
```

### Check Users
```bash
railway connect MySQL
SELECT username, role FROM users;
```

## ✅ Expected Tables (13 total)

- users
- categories
- material_stocks
- label_stocks
- label_masuk
- label_keluar
- lps_docs
- lps_items
- sj_docs
- sj_items
- notifications
- app_settings
- backup_logs

## 🔐 Default Admin

- Username: `admin`
- Password: `admin123`

⚠️ Ganti password setelah login!

## 🔧 Troubleshooting

### Tables tidak muncul
```bash
# Run init script
railway run --service backend npm run init-db

# Check logs
railway logs --service backend
```

### Connection error
```bash
# Check DB variables
railway variables --service backend | grep DB_

# Test connection
railway connect MySQL
```

## 📚 Full Guide

See [DATABASE-SETUP.md](./DATABASE-SETUP.md)

---

**Quick Setup:**
```bash
railway run --service backend npm run init-db
```
