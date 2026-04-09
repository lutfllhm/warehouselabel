# Quick Setup Railway - Langkah Singkat

## 🚀 Ringkasan
Aplikasi ini membutuhkan 3 services di Railway:
1. **MySQL Database**
2. **Backend API** (folder: `backend`)
3. **Frontend** (folder: `frontend`)

---

## 📋 Langkah Deploy

### 1️⃣ Setup Database MySQL

1. Login ke [Railway.app](https://railway.app)
2. Klik **"New Project"** → **"Provision MySQL"**
3. MySQL akan otomatis running
4. Klik service MySQL → Tab **"Variables"** → Catat kredensial:
   - `MYSQL_HOST`
   - `MYSQL_PORT` 
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

5. **Import Database Schema:**
   
   **Opsi A: Menggunakan Railway CLI**
   ```bash
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   railway link
   
   # Connect ke MySQL
   railway connect mysql
   
   # Import schema (jalankan satu per satu)
   source backend/schema.sql;
   source backend/migration_material_ukuran.sql;
   source backend/migration_notifications.sql;
   ```

   **Opsi B: Menggunakan MySQL Client**
   - Download kredensial dari Railway
   - Gunakan MySQL Workbench atau DBeaver
   - Connect dan import file SQL secara manual

---

### 2️⃣ Deploy Backend

1. Di Railway Dashboard → **"New"** → **"GitHub Repo"**
2. Pilih repository ini
3. Railway akan detect monorepo
4. Klik **"Add Service"** → Pilih repo → Set **Root Directory** = `backend`

5. **Set Environment Variables:**
   - Klik service Backend → Tab **"Variables"**
   - Klik **"Add Reference"** untuk connect ke MySQL:
     ```
     DB_HOST = ${MYSQL_HOST}
     DB_PORT = ${MYSQL_PORT}
     DB_USER = ${MYSQL_USER}
     DB_PASSWORD = ${MYSQL_PASSWORD}
     DB_NAME = ${MYSQL_DATABASE}
     ```
   - Tambahkan manual:
     ```
     PORT = 5000
     NODE_ENV = production
     JWT_SECRET = ganti-dengan-random-string-panjang-dan-aman
     ```

6. Railway akan auto-deploy
7. Klik **"Settings"** → **"Generate Domain"** untuk dapat public URL
8. **Catat URL Backend** (contoh: `https://backend-production-abc123.up.railway.app`)

---

### 3️⃣ Deploy Frontend

1. Di Railway Dashboard → **"New"** → **"GitHub Repo"** (repo yang sama)
2. Klik **"Add Service"** → Set **Root Directory** = `frontend`

3. **Set Environment Variables:**
   - Klik service Frontend → Tab **"Variables"**
   - Tambahkan:
     ```
     VITE_API_URL = https://backend-production-abc123.up.railway.app
     NODE_ENV = production
     ```
     *(Ganti dengan URL backend dari langkah 2)*

4. Railway akan auto-deploy
5. Klik **"Settings"** → **"Generate Domain"** untuk dapat public URL
6. **Catat URL Frontend** (contoh: `https://frontend-production-xyz789.up.railway.app`)

---

### 4️⃣ Update CORS Backend

1. Kembali ke service **Backend**
2. Tab **"Variables"** → Tambahkan:
   ```
   CORS_ORIGIN = https://frontend-production-xyz789.up.railway.app
   ```
   *(Ganti dengan URL frontend dari langkah 3)*

3. Backend akan auto-redeploy

---

## ✅ Verifikasi

### Test Backend
```bash
curl https://your-backend-url.up.railway.app/api/health
# Response: {"ok":true}
```

### Test Frontend
Buka browser: `https://your-frontend-url.up.railway.app`
- Harus muncul halaman login
- Coba login dengan user default (jika ada di schema)

---

## 🔧 Troubleshooting

### ❌ Database Connection Failed
- Pastikan schema sudah diimport
- Cek environment variables backend sudah benar
- Cek logs: Railway Dashboard → Backend service → **"Deployments"** → Klik latest → **"View Logs"**

### ❌ CORS Error di Frontend
- Pastikan `CORS_ORIGIN` di backend sudah diset ke URL frontend
- Atau temporary set `CORS_ORIGIN = *` untuk testing

### ❌ Frontend tidak bisa connect ke Backend
- Pastikan `VITE_API_URL` di frontend sudah benar
- Cek Network tab di browser DevTools
- Pastikan backend URL accessible

### ❌ Build Failed
**Backend:**
- Cek `backend/package.json` ada script `"start": "node src/server.js"`
- Cek logs untuk error detail

**Frontend:**
- Pastikan `VITE_API_URL` sudah diset sebelum build
- Cek logs untuk error detail

---

## 💰 Estimasi Biaya

Railway Free Tier: **$5 credit/bulan**

Setelah itu:
- MySQL: ~$5-10/bulan
- Backend: ~$5/bulan  
- Frontend: ~$5/bulan

**Total: ~$15-20/bulan**

---

## 📚 File Konfigurasi yang Sudah Disiapkan

✅ `backend/railway.toml` - Konfigurasi deploy backend
✅ `backend/nixpacks.toml` - Build config backend
✅ `frontend/railway.toml` - Konfigurasi deploy frontend
✅ `frontend/nixpacks.toml` - Build config frontend
✅ `.railwayignore` - File yang diabaikan saat deploy
✅ `backend/.env.production` - Template env production backend
✅ `frontend/.env.production` - Template env production frontend

---

## 🎯 Tips

1. **Auto Deploy:** Setiap push ke GitHub akan trigger auto-deploy
2. **Rollback:** Railway menyimpan history deployment, bisa rollback kapan saja
3. **Logs:** Selalu cek logs jika ada error
4. **Monitoring:** Railway dashboard menampilkan CPU, Memory, Network usage
5. **Custom Domain:** Bisa setup custom domain di Settings → Domains

---

## 📞 Bantuan

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## 🔐 Keamanan

⚠️ **PENTING:**
1. Ganti `JWT_SECRET` dengan string random yang kuat
2. Jangan commit file `.env` ke Git
3. Set `CORS_ORIGIN` ke domain frontend yang spesifik (jangan `*` di production)
4. Gunakan strong password untuk MySQL
5. Backup database secara berkala

---

## 🎉 Selesai!

Aplikasi sudah live di Railway! 🚀

Frontend: `https://your-frontend-url.up.railway.app`
Backend: `https://your-backend-url.up.railway.app`
