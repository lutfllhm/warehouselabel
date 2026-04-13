# 🔧 Railway Troubleshooting - Quick Fix

## ❌ Build Failed Error

### Error yang Anda alami:
```
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c nix-env..."
Error: Docker build failed
```

### ✅ Solusi:

File `nixpacks.toml` sudah dihapus. Railway sekarang akan auto-detect konfigurasi yang benar.

**Cara Redeploy:**

1. **Push changes ke GitHub** (jika menggunakan GitHub):
   ```bash
   git add .
   git commit -m "Fix: Remove nixpacks.toml, use Railway auto-detect"
   git push
   ```
   Railway akan auto-deploy.

2. **Atau deploy manual via CLI**:
   ```bash
   # Backend
   cd backend
   railway up
   
   # Frontend
   cd ../frontend
   railway up
   ```

3. **Atau via Railway Dashboard**:
   - Buka Railway Dashboard
   - Pilih service yang failed
   - Klik "Redeploy"

### 🔍 Check Logs

```bash
# Backend logs
railway logs --service backend

# Frontend logs
railway logs --service frontend
```

### ✅ Build Seharusnya Berhasil Sekarang

Railway akan auto-detect:
- **Backend**: Node.js app dengan `npm start`
- **Frontend**: Vite app dengan build dan serve

---

## 🚨 Common Errors & Solutions

### 1. "Module not found"
```bash
# Pastikan dependencies installed
cd backend  # atau frontend
npm install
railway up
```

### 2. "Port already in use"
```bash
# Railway otomatis assign port via $PORT
# Pastikan di code menggunakan process.env.PORT
```

### 3. "Database connection failed"
```bash
# Check environment variables
railway variables --service backend | grep DB_

# Pastikan format benar:
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
```

### 4. "CORS error"
```bash
# Update CORS_ORIGIN
railway variables set CORS_ORIGIN=https://your-frontend.railway.app
```

### 5. "JWT token invalid"
```bash
# Check JWT_SECRET exists
railway variables --service backend | grep JWT_SECRET

# Generate dan set jika belum ada
node scripts/generate-jwt-secret.js
railway variables set JWT_SECRET="<generated-secret>"
```

---

## 📋 Deployment Checklist

Sebelum deploy, pastikan:
- [ ] `package.json` ada di backend dan frontend
- [ ] `npm install` berhasil di local
- [ ] Environment variables sudah di-set di Railway
- [ ] Database schema sudah di-import
- [ ] JWT_SECRET sudah di-generate dan di-set

---

## 🔄 Redeploy Steps

1. **Fix code/config** (sudah done - nixpacks.toml dihapus)
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix build error"
   git push
   ```
3. **Railway auto-deploy** atau manual:
   ```bash
   railway up
   ```
4. **Check logs**:
   ```bash
   railway logs
   ```
5. **Test aplikasi**:
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

---

## 📚 Dokumentasi Lengkap

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deployment lengkap
- [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md) - Quick start
- [RAILWAY-CONFIG.md](./RAILWAY-CONFIG.md) - Konfigurasi files

---

## 🆘 Masih Error?

1. **Check Railway Status**: https://status.railway.app
2. **View Logs**: `railway logs`
3. **Check Variables**: `railway variables`
4. **Join Discord**: https://discord.gg/railway

---

**Quick Fix Command:**
```bash
# Redeploy sekarang
railway up
```
