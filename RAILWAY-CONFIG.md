# ⚙️ Railway Configuration Files

Ringkasan file-file konfigurasi untuk Railway deployment.

## 📁 File Structure

```
.
├── backend/
│   ├── railway.toml          # Railway config
│   ├── Procfile              # Process definition
│   └── .env.railway          # Env vars template
│
├── frontend/
│   ├── railway.toml          # Railway config
│   ├── Procfile              # Process definition
│   └── .env.railway          # Env vars template
│
├── scripts/
│   ├── setup-railway.sh      # Setup wizard
│   ├── deploy-railway.sh     # Deploy script
│   ├── check-deployment.sh   # Health check
│   └── create-admin.sql      # Create admin user
│
└── .railwayignore            # Exclude files
```

## 🔧 Configuration Files

### `railway.toml`
Railway-specific configuration untuk build dan deploy.

**Backend:**
- Build: Auto-detected by Railway
- Start: `npm start`
- Health check: `/api/health`

**Frontend:**
- Build: Auto-detected by Railway (`npm run build`)
- Start: `npx serve -s dist -l $PORT`
- Health check: `/`

### `Procfile`
Process definition yang Railway gunakan untuk start aplikasi.

**Backend:** `web: npm start`
**Frontend:** `web: npx serve -s dist -l $PORT`

### `.env.railway`
Template untuk environment variables. Copy values ke Railway Dashboard.

**Backend variables:**
```bash
PORT=${{RAILWAY_PORT}}
NODE_ENV=production
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=<generate-random-string>
CORS_ORIGIN=https://your-frontend.railway.app
```

**Frontend variables:**
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

### `.railwayignore`
Files to exclude from deployment (similar to .gitignore).

Excludes:
- Development files (`.env`, logs)
- Documentation
- Test files
- Build artifacts
- Format files

## 🔐 Environment Variables

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Set Variables via CLI
```bash
railway variables set KEY=value
```

### Set Variables via Dashboard
Railway Dashboard → Service → Variables tab

## 🚀 Deployment Scripts

### `setup-railway.sh`
Automated setup wizard - guides you through entire deployment.

```bash
bash scripts/setup-railway.sh
```

### `deploy-railway.sh`
Quick deployment script.

```bash
bash scripts/deploy-railway.sh all      # Deploy both
bash scripts/deploy-railway.sh backend  # Backend only
bash scripts/deploy-railway.sh frontend # Frontend only
```

### `check-deployment.sh`
Health check script - verifies all services are running.

```bash
bash scripts/check-deployment.sh
```

### `create-admin.sql`
SQL script to create default admin user.

```bash
railway connect MySQL
source scripts/create-admin.sql;
```

## 📝 Updated Files

### `backend/src/db.js`
- Added `DB_PORT` support
- Added `connectTimeout`

### `backend/.env.example`
- Added all required variables
- Better documentation

### `frontend/package.json`
- Added `serve` package for static file serving

## 🔗 Service References

Railway uses `${{SERVICE.VARIABLE}}` syntax for cross-service references:

```bash
# Reference MySQL service variables
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}

# Railway-provided variables
PORT=${{RAILWAY_PORT}}
```

## ✅ Quick Checklist

Before deploying:
- [ ] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Database schema ready
- [ ] Environment variables prepared

After deploying:
- [ ] All services running
- [ ] Health checks passing
- [ ] Admin user created
- [ ] CORS configured

## 📚 Documentation

- [RAILWAY-QUICKSTART.md](./RAILWAY-QUICKSTART.md) - Quick start guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [scripts/README.md](./scripts/README.md) - Scripts documentation

## 🆘 Troubleshooting

**Service won't start:**
```bash
railway logs --service <service>
railway variables --service <service>
```

**Database connection failed:**
```bash
railway connect MySQL
railway variables --service backend | grep DB_
```

**CORS errors:**
```bash
railway variables --service backend | grep CORS
```

---

**Ready to deploy?**
```bash
bash scripts/setup-railway.sh
```
