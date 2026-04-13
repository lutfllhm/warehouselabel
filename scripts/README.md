# 📜 Deployment Scripts

Helper scripts untuk mempermudah deployment ke Railway.

## 🔧 Available Scripts

### 1. `setup-railway.sh`
**Full setup wizard** - Memandu Anda dari awal hingga aplikasi live.

```bash
# Linux/Mac
bash scripts/setup-railway.sh

# Windows (Git Bash)
bash scripts/setup-railway.sh
```

**What it does:**
- Login ke Railway
- Initialize project
- Add MySQL database
- Import schema
- Generate JWT secret
- Deploy backend & frontend
- Configure CORS

---

### 2. `deploy-railway.sh`
**Quick deployment** - Deploy backend, frontend, atau keduanya.

```bash
# Deploy both
bash scripts/deploy-railway.sh all

# Deploy backend only
bash scripts/deploy-railway.sh backend

# Deploy frontend only
bash scripts/deploy-railway.sh frontend
```

---

### 3. `check-deployment.sh`
**Health check** - Verifikasi semua service berjalan dengan baik.

```bash
bash scripts/check-deployment.sh
```

**Checks:**
- ✅ Backend health endpoint
- ✅ Frontend accessibility
- ✅ Database connection
- ✅ Environment variables

---

### 4. `create-admin.sql`
**Create admin user** - SQL script untuk membuat user admin pertama.

```bash
# Connect to Railway MySQL
railway connect MySQL

# Run script
source scripts/create-admin.sql;
```

**Default credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Ganti password setelah login pertama!**

---

## 🪟 Windows Users

Scripts ini menggunakan Bash. Gunakan salah satu:

1. **Git Bash** (recommended)
   - Included dengan Git for Windows
   - Run: `bash scripts/setup-railway.sh`

2. **WSL (Windows Subsystem for Linux)**
   ```bash
   wsl
   bash scripts/setup-railway.sh
   ```

3. **Manual Deployment**
   - Follow [RAILWAY-QUICKSTART.md](../RAILWAY-QUICKSTART.md)
   - Run commands manually

---

## 📚 Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [RAILWAY-QUICKSTART.md](../RAILWAY-QUICKSTART.md) - Quick start (10 min)
- [ENVIRONMENT-VARIABLES.md](../ENVIRONMENT-VARIABLES.md) - Env vars reference

---

## 🆘 Troubleshooting

### "Railway CLI not found"
```bash
npm i -g @railway/cli
```

### "Permission denied"
```bash
# Linux/Mac
chmod +x scripts/*.sh

# Windows - use Git Bash or WSL
```

### "Not logged in"
```bash
railway login
```

### Script fails midway
- Check Railway dashboard for errors
- View logs: `railway logs`
- Run health check: `bash scripts/check-deployment.sh`
