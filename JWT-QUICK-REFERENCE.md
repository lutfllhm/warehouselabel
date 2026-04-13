# 🔐 JWT Secret - Quick Reference

## 🚀 Quick Commands

### Generate JWT Secret
```bash
# Cara 1: Menggunakan script
node scripts/generate-jwt-secret.js

# Cara 2: One-liner
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cara 3: OpenSSL
openssl rand -hex 64
```

### Set di Railway
```bash
# Via CLI
railway variables set JWT_SECRET="<your-generated-secret>"

# Via Dashboard
Railway → Backend Service → Variables → Add JWT_SECRET
```

### Check JWT Secret
```bash
# Lihat semua variables
railway variables --service backend

# Filter JWT_SECRET saja
railway variables --service backend | grep JWT_SECRET
```

## ✅ Checklist

- [ ] Generate JWT_SECRET (128 characters)
- [ ] Set di Railway backend variables
- [ ] Tidak commit ke git
- [ ] Test login berhasil

## 🧪 Test JWT

### Test Login
```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Protected Endpoint
```bash
curl https://your-backend.railway.app/api/label-stocks \
  -H "Authorization: Bearer <token-from-login>"
```

## 🔒 Security Rules

✅ **DO:**
- Use 64+ character random string
- Store in Railway variables
- Different secrets for staging/production
- Rotate every 3-6 months

❌ **DON'T:**
- Use weak secrets (e.g., "secret123")
- Commit to git
- Share via chat/email
- Same secret for all environments

## 🆘 Troubleshooting

### "Token tidak valid"
```bash
# Check JWT_SECRET exists
railway variables --service backend | grep JWT_SECRET

# Regenerate and set
node scripts/generate-jwt-secret.js
railway variables set JWT_SECRET="<new-secret>"
```

### Backend won't start
```bash
# Check logs
railway logs --service backend

# Set JWT_SECRET if missing
railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

## 📚 Full Documentation

See [JWT-SETUP.md](./JWT-SETUP.md) for complete guide.

---

**Quick Setup:**
```bash
node scripts/generate-jwt-secret.js
railway variables set JWT_SECRET="<copy-from-output>"
```
