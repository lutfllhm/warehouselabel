# ⚡ Railway Quick Start Guide

Panduan cepat untuk deploy dalam 10 menit.

## 🎯 Quick Steps

### 1. Create Railway Project
```bash
# Login ke Railway
railway login

# Create new project
railway init
```

### 2. Add MySQL Database
```bash
# Via CLI
railway add --database mysql

# Atau via Dashboard: New → Database → MySQL
```

### 3. Import Database Schema (Otomatis ⭐)
```bash
# Run init script via Railway (Recommended)
railway run --service backend npm run init-db
```

Script akan otomatis:
- ✅ Membuat 13 tabel
- ✅ Membuat user admin default
- ✅ Verifikasi setup berhasil

**Atau manual:**
```bash
# Connect to MySQL
railway connect MySQL

# Import schema
source backend/schema.sql;
exit;
```

Lihat [DATABASE-SETUP.md](./DATABASE-SETUP.md) untuk panduan lengkap.

### 4. Deploy Backend
```bash
cd backend

# Generate JWT Secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$JWT_SECRET"

# Deploy
railway up

# Generate domain
railway domain
```

### 5. Deploy Frontend
```bash
cd ../frontend

# Install serve
npm install --save-dev serve

# Set backend URL (ganti dengan URL backend Anda)
railway variables set VITE_API_URL=https://your-backend.railway.app/api

# Deploy
railway up

# Generate domain
railway domain
```

### 6. Update CORS
```bash
cd ../backend

# Set CORS origin (ganti dengan URL frontend Anda)
railway variables set CORS_ORIGIN=https://your-frontend.railway.app

# Redeploy
railway up
```

### 7. Create Admin User

**Jika menggunakan `npm run init-db` di step 3, admin user sudah otomatis dibuat. Skip step ini.**

**Jika manual:**
```sql
-- Connect to MySQL
railway connect MySQL

-- Create admin (password: admin123)
INSERT INTO users (full_name, username, password_hash, role) 
VALUES ('Admin', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
```

## ✅ Done!

Akses aplikasi di URL frontend Railway Anda.

Login dengan:
- Username: `admin`
- Password: `admin123`

**Jangan lupa ganti password setelah login pertama!**

---

## 🔐 JWT Secret Info

JWT Secret sudah di-generate otomatis saat deploy. Jika perlu generate manual:

```bash
# Generate JWT Secret
node scripts/generate-jwt-secret.js

# Atau quick command
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Lihat [JWT-SETUP.md](./JWT-SETUP.md) untuk panduan lengkap.

---

## 🔗 Useful Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# List services
railway status

# Connect to database
railway connect MySQL

# Run migrations
railway run node migrate.js
```

## 📚 Full Documentation

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.
