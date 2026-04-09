# Railway Environment Variables Setup

## Backend Service Variables

Setelah deploy backend ke Railway, set variables berikut di **Backend Service** → Tab **Variables**:

### 1. Add Reference to MySQL (WAJIB)

Klik **"+ New Variable"** → **"Add a Reference"** → Pilih **MySQL service**

Railway akan otomatis menambahkan:
- ✅ `MYSQLHOST` - MySQL host address
- ✅ `MYSQLPORT` - MySQL port (default: 3306)
- ✅ `MYSQLUSER` - MySQL username
- ✅ `MYSQLPASSWORD` - MySQL password
- ✅ `MYSQLDATABASE` - MySQL database name

### 2. Add Manual Variables

Tambahkan variables berikut secara manual:

```
PORT = 5000
```

```
NODE_ENV = production
```

```
JWT_SECRET = 4f7f87c89616887da2b039f9dac460f36e57dae85448f3eef8548da4e43e35c3c1dcd0359d773d6d004d7345fa033600959864142291f5142263be25cfe2965a
```

```
CORS_ORIGIN = *
```
*(Ganti dengan URL frontend setelah deploy, contoh: `https://frontend-production.up.railway.app`)*

---

## Frontend Service Variables

Set variables berikut di **Frontend Service** → Tab **Variables**:

```
VITE_API_URL = https://your-backend-url.up.railway.app
```
*(Ganti dengan URL backend dari Railway)*

```
NODE_ENV = production
```

---

## MySQL Service

Tidak perlu set variables manual. Railway sudah otomatis provide semua variables yang dibutuhkan.

---

## Cara Add Reference di Railway

### Step-by-step:

1. **Buka Backend Service** di Railway Dashboard
2. Klik tab **"Variables"**
3. Klik tombol **"+ New Variable"**
4. Pilih **"Add a Reference"** (bukan "Add a Variable")
5. **Service**: Pilih **MySQL** (service database kamu)
6. Railway akan menampilkan semua available variables dari MySQL
7. Klik **"Add"** atau **"Add All"**
8. Variables akan otomatis ter-link ke MySQL service

### Keuntungan menggunakan Reference:

✅ Otomatis sync dengan MySQL service
✅ Tidak perlu copy-paste manual
✅ Kalau MySQL credentials berubah, backend otomatis update
✅ Lebih aman karena tidak hardcode credentials

---

## Verifikasi Variables

Setelah semua variables ditambahkan, pastikan di Backend Variables ada:

- ✅ `MYSQLHOST` (dengan icon link/reference)
- ✅ `MYSQLPORT` (dengan icon link/reference)
- ✅ `MYSQLUSER` (dengan icon link/reference)
- ✅ `MYSQLPASSWORD` (dengan icon link/reference)
- ✅ `MYSQLDATABASE` (dengan icon link/reference)
- ✅ `PORT` (manual)
- ✅ `NODE_ENV` (manual)
- ✅ `JWT_SECRET` (manual)
- ✅ `CORS_ORIGIN` (manual)

Total: **9 variables**

---

## Troubleshooting

### Backend tidak bisa connect ke MySQL

**Cek:**
1. Apakah MySQL service sudah **Active**?
2. Apakah Reference variables sudah ditambahkan?
3. Cek logs backend untuk error detail

**Solusi:**
- Restart backend service
- Pastikan backend dan MySQL dalam satu project
- Cek logs: Backend → Deployments → View Logs

### CORS Error di Frontend

**Solusi:**
- Update `CORS_ORIGIN` di backend dengan URL frontend yang benar
- Atau set `CORS_ORIGIN = *` untuk testing (tidak recommended untuk production)

---

## Summary

**Backend Variables (9 total):**
- 5 dari MySQL Reference (otomatis)
- 4 manual (PORT, NODE_ENV, JWT_SECRET, CORS_ORIGIN)

**Frontend Variables (2 total):**
- VITE_API_URL (manual)
- NODE_ENV (manual)

**MySQL Variables:**
- Tidak perlu set, Railway sudah provide otomatis
