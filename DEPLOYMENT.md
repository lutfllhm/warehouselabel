# 🚀 Railway Deployment Guide

Panduan lengkap untuk deploy aplikasi RBM Warehouse Label ke Railway.

## 📋 Prerequisites

1. Akun Railway (https://railway.app)
2. Railway CLI: `npm i -g @railway/cli`

## ⚡ Quick Deploy

### Opsi 1: Automated (Recommended)
```bash
bash scripts/setup-railway.sh
```

### Opsi 2: Manual

#### 1. Setup Railway Project
```bash
railway login
railway init
```

#### 2. Add MySQL Database
```bash
railway add --database mysql
```

#### 3. Import Database Schema
```bash
railway connect MySQL
source backend/schema.sql;
exit;
```

#### 4. Deploy Backend
```bash
cd backend

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
railway variables set PORT='${{RAILWAY_PORT}}'
railway variables set DB_HOST='${{MySQL.MYSQLHOST}}'
railway variables set DB_PORT='${{MySQL.MYSQLPORT}}'
railway variables set DB_USER='${{MySQL.MYSQLUSER}}'
railway variables set DB_PASSWORD='${{MySQL.MYSQLPASSWORD}}'
railway variables set DB_NAME='${{MySQL.MYSQLDATABASE}}'
railway variables set CORS_ORIGIN='*'

# Deploy
railway up

# Generate domain
railway domain
```

#### 5. Deploy Frontend
```bash
cd ../frontend

# Set backend URL (ganti dengan URL backend Anda)
railway variables set VITE_API_URL=https://your-backend.railway.app/api

# Deploy
railway up

# Generate domain
railway domain
```

#### 6. Update CORS
```bash
cd ../backend

# Set CORS origin (ganti dengan URL frontend Anda)
railway variables set CORS_ORIGIN=https://your-frontend.railway.app

# Redeploy
railway up
```

#### 7. Create Admin User
```bash
railway connect MySQL

# Create admin (password: admin123)
INSERT INTO users (full_name, username, password_hash, role) 
VALUES ('Admin', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');
```

## 🔐 Environment Variables

### Backend Service
```bash
PORT=${{RAILWAY_PORT}}
NODE_ENV=production
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=<generate-random-64-char-string>
CORS_ORIGIN=https://your-frontend.railway.app
```

### Frontend Service
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

## 🔧 Useful Commands

```bash
# View logs
railway logs

# Check status
railway status

# Open dashboard
railway open

# Connect to database
railway connect MySQL

# Set variable
railway variables set KEY=value

# View variables
railway variables
```

## 🆘 Troubleshooting

### Backend tidak bisa connect ke database
```bash
# Check variables
railway variables --service backend | grep DB_

# Test connection
railway connect MySQL
```

### Frontend tidak bisa reach backend (CORS error)
```bash
# Check CORS_ORIGIN
railway variables --service backend | grep CORS

# Update CORS
railway variables set CORS_ORIGIN=https://your-frontend.railway.app
```

### Service crashed
```bash
# View logs
railway logs --service backend
railway logs --service frontend

# Check status
railway status
```

## 💰 Cost Estimate

**Hobby Plan ($5/month):**
- MySQL: ~$2-5/month
- Backend: ~$2-5/month  
- Frontend: ~$1-3/month
- **Total: ~$5-13/month**

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app)

## ✅ Post-Deployment

- [ ] Test login dengan admin user
- [ ] Verify semua fitur berfungsi
- [ ] Ganti password admin
- [ ] Setup database backup
- [ ] Monitor logs untuk errors

---

**Selamat! Aplikasi Anda sudah live di Railway! 🎉**
