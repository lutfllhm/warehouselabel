# Panduan Deployment ke Railway

Aplikasi ini terdiri dari 3 service yang perlu di-deploy:
1. **Backend API** (Node.js/Express)
2. **Frontend** (React/Vite)
3. **Database** (MySQL)

## Langkah-langkah Deploy

### 1. Persiapan Akun Railway
- Buat akun di [Railway.app](https://railway.app)
- Login menggunakan GitHub (recommended)

### 2. Deploy Database MySQL

1. Buka Railway Dashboard
2. Klik **"New Project"**
3. Pilih **"Provision MySQL"**
4. Railway akan otomatis membuat MySQL instance
5. Catat kredensial database yang diberikan:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`

6. **Import Schema Database:**
   - Gunakan MySQL client atau Railway CLI untuk import schema
   - File yang perlu diimport (urutan penting):
     ```bash
     backend/schema.sql
     backend/migration_material_ukuran.sql
     backend/migration_notifications.sql
     ```

### 3. Deploy Backend API

1. Di Railway Dashboard, klik **"New"** → **"GitHub Repo"**
2. Pilih repository ini
3. Railway akan detect monorepo, pilih **"backend"** folder
4. Atau buat service baru dan set **Root Directory** ke `backend`

5. **Set Environment Variables** untuk Backend:
   ```
   PORT=5000
   DB_HOST=${MYSQL_HOST}
   DB_PORT=${MYSQL_PORT}
   DB_USER=${MYSQL_USER}
   DB_PASSWORD=${MYSQL_PASSWORD}
   DB_NAME=${MYSQL_DATABASE}
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   ```

6. Railway akan otomatis build dan deploy
7. Catat URL backend yang diberikan (misal: `https://backend-production-xxxx.up.railway.app`)

### 4. Deploy Frontend

1. Di Railway Dashboard, klik **"New"** → **"GitHub Repo"**
2. Pilih repository yang sama
3. Pilih **"frontend"** folder atau set **Root Directory** ke `frontend`

4. **Set Environment Variables** untuk Frontend:
   ```
   VITE_API_URL=https://backend-production-xxxx.up.railway.app
   NODE_ENV=production
   ```
   *(Ganti dengan URL backend dari langkah 3)*

5. Railway akan otomatis build dan deploy
6. Catat URL frontend yang diberikan

### 5. Update CORS di Backend

Setelah mendapat URL frontend, update environment variable backend:
```
CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app
```

Atau edit `backend/src/server.js` untuk menambahkan CORS origin:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

## Struktur File Railway

File-file berikut telah disiapkan untuk Railway:

- `railway.json` - Konfigurasi global Railway
- `backend/railway.toml` - Konfigurasi deploy backend
- `backend/nixpacks.toml` - Build configuration backend
- `frontend/railway.toml` - Konfigurasi deploy frontend
- `frontend/nixpacks.toml` - Build configuration frontend

## Verifikasi Deployment

### Backend
Akses: `https://your-backend-url.railway.app/api/health`
Response: `{"ok": true}`

### Frontend
Akses: `https://your-frontend-url.railway.app`
Harus bisa melihat halaman login

## Troubleshooting

### Database Connection Error
- Pastikan environment variables database sudah benar
- Cek apakah MySQL service sudah running
- Pastikan schema sudah diimport

### CORS Error
- Pastikan `CORS_ORIGIN` di backend sudah diset ke URL frontend
- Atau set CORS ke `*` untuk testing (tidak recommended untuk production)

### Build Error Frontend
- Pastikan `VITE_API_URL` sudah diset
- Cek logs di Railway dashboard

### Backend Crash
- Cek logs di Railway dashboard
- Pastikan semua environment variables sudah diset
- Pastikan database connection berhasil

## Monitoring

Railway menyediakan:
- **Logs** - Real-time logs untuk debugging
- **Metrics** - CPU, Memory, Network usage
- **Deployments** - History semua deployment

## Update Aplikasi

Setiap push ke GitHub branch yang terhubung akan otomatis trigger deployment baru di Railway.

## Biaya

Railway menyediakan:
- **Free tier**: $5 credit per bulan
- Setelah itu pay-as-you-go

Estimasi biaya untuk aplikasi ini:
- MySQL: ~$5-10/bulan
- Backend: ~$5/bulan
- Frontend: ~$5/bulan

**Total: ~$15-20/bulan**

## Alternative: Deploy Monorepo

Jika ingin deploy sebagai satu service (tidak recommended):
1. Buat build script yang build frontend dan serve dari backend
2. Update backend untuk serve static files dari `frontend/dist`
3. Hanya perlu 2 services: Backend+Frontend dan MySQL

## Kontak & Support

Jika ada masalah:
1. Cek Railway documentation: https://docs.railway.app
2. Railway Discord: https://discord.gg/railway
3. Cek logs di Railway dashboard
