# RBM Warehouse Label Management System

Sistem manajemen warehouse untuk tracking label dan material stocks dengan fitur auto stock update.

---

## 🚀 Quick Deploy - Port 9000

Aplikasi ini berjalan di **Port 9000** untuk menghindari konflik dengan aplikasi lain di VPS Anda.

### 📚 Panduan Deployment

Pilih panduan sesuai kebutuhan:

| Panduan | Deskripsi | Waktu | Untuk |
|---------|-----------|-------|-------|
| **[QUICK-START-PORT-9000.md](QUICK-START-PORT-9000.md)** | Deploy cepat 5 langkah | 5-10 menit | Testing/Development |
| **[PANDUAN-INSTALL-PORT-9000.md](PANDUAN-INSTALL-PORT-9000.md)** | Panduan lengkap step-by-step | 30-60 menit | **Production** ⭐ |
| **[TROUBLESHOOTING-PORT.md](TROUBLESHOOTING-PORT.md)** | Mengatasi konflik port | 5-15 menit | Troubleshooting |
| **[CHECKLIST-DEPLOY.md](CHECKLIST-DEPLOY.md)** | Checklist deployment | 10-20 menit | Verification |
| **[README-PANDUAN.md](README-PANDUAN.md)** | Index semua panduan | - | Reference |

### ⚡ Quick Start

```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh

# 2. Clone aplikasi
git clone your-repo warehouse-label && cd warehouse-label

# 3. Setup environment
cp .env.production .env && nano .env

# 4. Deploy
docker-compose up -d db && sleep 20
docker exec -i warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) warehouse_label < backend/schema.sql
docker-compose up -d --build

# 5. Setup firewall
sudo ufw allow 22/tcp && sudo ufw allow 9000/tcp && sudo ufw enable
```

**Akses:** `http://ip-vps-anda:9000`  
**Login:** superadmin / admin123 (⚠️ ganti setelah login!)

### 📋 Port Configuration

| Service | Port External | Akses |
|---------|---------------|-------|
| Frontend | **9000** | `http://ip-vps:9000` |
| Backend API | 5005 | Internal only |
| Database | 3005 | Internal only |

---

