# RBM Warehouse Label Management System

Sistem manajemen warehouse untuk tracking label dan material stocks dengan fitur auto stock update.

---

## 🚀 Quick Start

### Setup Database

```bash
# Import schema (includes auto stock update triggers)
mysql -u root -p < backend/schema.sql
```

### Development

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### Docker Deployment

```bash
# Deploy dengan Docker
docker-compose up -d
```

**Akses:**
- Frontend: http://localhost
- Backend API: http://localhost:5005
- Database: localhost:3005

---

## ✨ Fitur Utama

### 1. Auto Stock Update
Stock label otomatis terupdate saat ada transaksi masuk/keluar melalui database triggers.

### 2. Autocomplete PN
Saat input transaksi, ketik PN dan sistem akan auto-suggest dari Stock Label, lalu auto-fill field lainnya.

### 3. Realtime Updates
Semua perubahan data langsung terupdate di semua client via Socket.IO.

### 4. Validasi Stock
Sistem otomatis validasi stock sebelum transaksi keluar untuk mencegah stock negatif.

---

## 📊 Database Schema

**Version:** 3.0  
**File:** `backend/schema.sql`

Schema sudah include:
- ✅ 13 Tables (users, categories, stocks, transactions, documents, notifications, dll)
- ✅ 7 Triggers untuk auto stock update
- ✅ Indexes untuk performance
- ✅ Default superadmin user

**Default Login:**
- Username: `superadmin`
- Password: `admin123`

---

## 🔧 Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MySQL 8.0
- **Realtime:** Socket.IO
- **Deployment:** Docker + Nginx

---

## 📚 Dokumentasi

- **Panduan Deploy:** [PANDUAN-DEPLOY.md](./PANDUAN-DEPLOY.md)
- **README:** [README.md](./README.md) (file ini)

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Cek MySQL running
docker ps

# Restart MySQL
docker-compose restart db
```

### Port Already in Use
```bash
# Cek port yang digunakan
netstat -ano | findstr :80
netstat -ano | findstr :5005
netstat -ano | findstr :3005

# Stop container
docker-compose down
```

### Triggers Tidak Terpasang
```sql
-- Verifikasi triggers
SELECT TRIGGER_NAME FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'warehouse_label';

-- Jika kosong, re-import schema
SOURCE backend/schema.sql;
```

---

**Version:** 3.0  
**Last Updated:** 2026-04-13
# 1. Setup environment
chmod +x setup.sh
./setup.sh

# 2. Deploy
chmod +x deploy.sh
./deploy.sh start

# 3. Akses aplikasi
# Frontend: http://localhost
# Backend: http://localhost:5000
```

📖 **Dokumentasi:**
- **[PANDUAN-DEPLOY.md](./PANDUAN-DEPLOY.md)** - 📘 Panduan lengkap deploy ke VPS Hostinger
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide (English)
- [SECURITY.md](./SECURITY.md) - Security best practices

### 💻 Local Development (Non-Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 🏗️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, JWT
- **Database:** MySQL

## ✨ Features

- Material & Label Stock Management
- Transaction Tracking (In/Out)
- Document Management (LPS/SJ)
- Real-time Updates (WebSocket)
- Excel Export
- User Management
- Notifications

## 📦 Project Structure

```
.
├── backend/                    # Node.js API server
├── frontend/                   # React application
├── format/                     # Excel templates
├── docker-compose.yml          # Docker orchestration (GUNAKAN INI)
├── Dockerfile.backend          # Backend container
├── Dockerfile.frontend         # Frontend container
├── nginx.conf                  # Nginx configuration
├── deploy.sh                   # Deployment helper script
├── setup.sh                    # Setup wizard
└── .env.production             # Environment template
```

## 🐳 Docker Commands

```bash
# Start aplikasi
./deploy.sh start

# Stop aplikasi
./deploy.sh stop

# Restart aplikasi
./deploy.sh restart

# Lihat logs
./deploy.sh logs

# Cek status
./deploy.sh status

# Backup database
./deploy.sh backup

# Update aplikasi
./deploy.sh update
```

**File Docker yang digunakan:**
- ✅ `docker-compose.yml` - File utama untuk production
- ✅ `Dockerfile.backend` - Build backend container
- ✅ `Dockerfile.frontend` - Build frontend container
- ✅ `nginx.conf` - Konfigurasi web server

## 🔐 Default Credentials

After setup, create admin user:
- Username: `admin`
- Password: `admin123`

⚠️ **Change password after first login!**

## 🌐 Deployment ke VPS Hostinger

### Quick Deploy

```bash
# 1. Di VPS, install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose -y

# 2. Clone repository
git clone <your-repo-url>
cd warehouse-app

# 3. Setup & Deploy
./setup.sh
./deploy.sh start
```

📘 **Baca panduan lengkap:** [PANDUAN-DEPLOY.md](./PANDUAN-DEPLOY.md)

## 🔒 Security

**Penting untuk Production:**
- ✅ Ganti semua password default
- ✅ Setup firewall (`ufw`)
- ✅ Install SSL certificate
- ✅ Setup backup otomatis
- ✅ Review [SECURITY.md](./SECURITY.md)



## 💾 Backup & Restore

```bash
# Backup database
./deploy.sh backup

# Restore database
docker-compose exec -T db mysql -u root -p warehouse_label < backup.sql
```

## 🆘 Troubleshooting

### Container tidak start
```bash
docker-compose logs -f
docker-compose ps
```

### Database connection error
```bash
docker-compose restart db
docker-compose logs db
```

### Port sudah digunakan
```bash
sudo netstat -tulpn | grep :80
# Edit port di docker-compose.yml jika perlu
```

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk troubleshooting lengkap.

## 📚 Documentation

### 🇮🇩 Bahasa Indonesia
- **[MULAI-DISINI.md](./MULAI-DISINI.md)** - 📄 Quick start (baca ini dulu!)
- **[PANDUAN-DEPLOY.md](./PANDUAN-DEPLOY.md)** - 📘 Panduan lengkap deploy ke VPS
- **[CHEAT-SHEET.md](./CHEAT-SHEET.md)** - 📝 Perintah-perintah penting
- **[RINGKASAN-DOCKER.md](./RINGKASAN-DOCKER.md)** - 📦 Ringkasan setup Docker
- **[STRUKTUR-DOCKER.md](./STRUKTUR-DOCKER.md)** - 🏗️ Visualisasi struktur Docker
- **[FILE-DOCKER.md](./FILE-DOCKER.md)** - 📁 Penjelasan file Docker
- **[WINDOWS.md](./WINDOWS.md)** - 🪟 Panduan untuk Windows

### 🇬🇧 English
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [SECURITY.md](./SECURITY.md) - Security best practices

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

[Your License Here]

## Catatan Lanjutan

- Form detail LPS/SJ bisa diselaraskan lagi dengan file di folder `format/` bila sudah dilampirkan.
- Backup dari menu aplikasi saat ini mencatat log entri backup. Untuk file dump MySQL (.sql) gunakan skrip: `powershell -ExecutionPolicy Bypass -File backend/scripts/backup-db.ps1` (pastikan `mysqldump` ada di PATH dan `backend/.env` sudah benar).
- Untuk deployment production, gunakan Docker untuk kemudahan dan konsistensi.
