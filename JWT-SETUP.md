# 🔐 JWT Secret Setup Guide

Panduan lengkap untuk setup JWT Secret di Railway.

## ❓ Apa itu JWT Secret?

JWT Secret adalah kunci rahasia yang digunakan untuk:
- **Sign** (menandatangani) JWT tokens saat user login
- **Verify** (memverifikasi) JWT tokens saat user akses API
- **Protect** API endpoints dari akses tidak sah

## 🔑 Generate JWT Secret

### Cara 1: Menggunakan Script (Recommended)

```bash
node scripts/generate-jwt-secret.js
```

Output:
```
🔐 JWT Secret Generator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated JWT Secret (128 characters):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
a1b2c3d4e5f6...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cara 2: Menggunakan Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Cara 3: Menggunakan OpenSSL

```bash
openssl rand -hex 64
```

### Cara 4: Online Generator

Kunjungi: https://www.grc.com/passwords.htm
- Pilih "63 random alpha-numeric characters"
- Copy hasilnya

## 📝 Set JWT Secret di Railway

### Via Railway Dashboard

1. Buka Railway Dashboard
2. Pilih **Backend Service**
3. Klik tab **"Variables"**
4. Klik **"+ New Variable"**
5. Masukkan:
   - Key: `JWT_SECRET`
   - Value: `<paste-generated-secret>`
6. Klik **"Add"**
7. Service akan auto-redeploy

### Via Railway CLI

```bash
# Generate dan set sekaligus
cd backend
railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

Atau manual:

```bash
# Generate dulu
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Set ke Railway
railway variables set JWT_SECRET="$JWT_SECRET"
```

## ✅ Verify JWT Secret

### Check apakah sudah di-set:

```bash
railway variables --service backend | grep JWT_SECRET
```

Output yang benar:
```
JWT_SECRET=a1b2c3d4e5f6... (128 characters)
```

### Test backend bisa start:

```bash
railway logs --service backend
```

Cari log:
```
✅ API running on port 5000
```

## 🔒 Security Best Practices

### ✅ DO (Lakukan):

1. **Generate random secret minimal 64 characters**
   ```bash
   # Good: 128 characters
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Gunakan secret berbeda untuk staging dan production**
   ```bash
   # Staging
   railway environment staging
   railway variables set JWT_SECRET="<staging-secret>"
   
   # Production
   railway environment production
   railway variables set JWT_SECRET="<production-secret>"
   ```

3. **Simpan di Railway environment variables**
   - Tidak di code
   - Tidak di `.env` file yang di-commit

4. **Rotate secret secara berkala**
   - Setiap 3-6 bulan
   - Setelah security incident
   - Saat team member keluar

### ❌ DON'T (Jangan):

1. **Jangan gunakan secret yang lemah**
   ```bash
   # Bad examples:
   JWT_SECRET=secret
   JWT_SECRET=123456
   JWT_SECRET=myapp-secret
   ```

2. **Jangan commit ke git**
   ```bash
   # Bad: .env file dengan JWT_SECRET di git
   # Good: .env.example tanpa nilai actual
   ```

3. **Jangan share secret di chat/email**
   - Gunakan secure password manager
   - Share via Railway dashboard access

4. **Jangan gunakan secret yang sama untuk semua environment**
   - Development ≠ Staging ≠ Production

## 🧪 Test JWT Authentication

### 1. Test Login

```bash
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response yang benar:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 2. Test Protected Endpoint

```bash
# Gunakan token dari response login
curl https://your-backend.railway.app/api/label-stocks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Response yang benar:
```json
[
  {
    "id": 1,
    "pn_prefix": "12345/label-RBM",
    "nama_item": "Label A",
    ...
  }
]
```

## 🔧 Troubleshooting

### Error: "Token tidak valid"

**Penyebab:**
- JWT_SECRET tidak di-set
- JWT_SECRET salah
- Token expired
- Token format salah

**Solusi:**
```bash
# Check JWT_SECRET
railway variables --service backend | grep JWT_SECRET

# Regenerate dan set ulang
node scripts/generate-jwt-secret.js
railway variables set JWT_SECRET="<new-secret>"

# Redeploy
railway up
```

### Error: "Token diperlukan"

**Penyebab:**
- Header Authorization tidak ada
- Format header salah

**Solusi:**
```bash
# Format yang benar:
Authorization: Bearer <token>

# Bukan:
Authorization: <token>
```

### Backend tidak bisa start

**Penyebab:**
- JWT_SECRET tidak di-set di Railway

**Solusi:**
```bash
# Set JWT_SECRET
railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"

# Check logs
railway logs --service backend
```

## 📋 JWT Secret Checklist

Sebelum deploy:
- [ ] JWT_SECRET generated (minimal 64 characters)
- [ ] JWT_SECRET di-set di Railway backend variables
- [ ] JWT_SECRET tidak di-commit ke git
- [ ] JWT_SECRET berbeda untuk staging/production

Setelah deploy:
- [ ] Backend bisa start tanpa error
- [ ] Login berhasil dan return token
- [ ] Protected endpoints bisa diakses dengan token
- [ ] Token invalid ditolak dengan error 401

## 🔄 Rotate JWT Secret

Jika perlu ganti JWT_SECRET:

```bash
# 1. Generate secret baru
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# 2. Set di Railway
railway variables set JWT_SECRET="$NEW_SECRET"

# 3. Service akan auto-redeploy

# 4. Semua user harus login ulang
```

**⚠️ Warning:** Setelah rotate secret, semua token lama akan invalid dan user harus login ulang.

## 📚 Additional Resources

- [JWT.io](https://jwt.io) - JWT debugger
- [Railway Docs - Variables](https://docs.railway.app/develop/variables)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)

## 🆘 Need Help?

**JWT Secret tidak work?**

1. Check logs:
   ```bash
   railway logs --service backend
   ```

2. Verify variable:
   ```bash
   railway variables --service backend | grep JWT_SECRET
   ```

3. Test login:
   ```bash
   curl -X POST https://your-backend.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

4. Check [DEPLOYMENT.md](./DEPLOYMENT.md) untuk troubleshooting lengkap

---

**Quick Command:**
```bash
# Generate dan set JWT_SECRET sekaligus
node scripts/generate-jwt-secret.js
railway variables set JWT_SECRET="<copy-from-output>"
```
