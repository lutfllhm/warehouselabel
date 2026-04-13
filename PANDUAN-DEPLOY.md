# 🚀 Panduan Deploy RBM Warehouse Label Management

Panduan lengkap deploy aplikasi Warehouse Label Management ke VPS menggunakan Docker.

---

## 📋 Persyaratan

1. ✅ VPS (Hostinger/DigitalOcean/AWS/dll) dengan minimal:
   - RAM: 2GB
   - Storage: 20GB
   - OS: Ubuntu 20.04/22.04 atau Debian
2. ✅ Akses SSH ke VPS
3. ✅ Domain atau subdomain (opsional)

---

## 🎯 LANGKAH 1: Persiapan VPS

### 1.1 Login ke VPS via SSH

```bash
ssh root@ip-vps-anda
# Atau jika menggunakan user biasa
ssh username@ip-vps-anda
```

### 1.2 Update Sistem

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install tools yang diperlukan
sudo apt install -y curl git nano
```

### 1.3 Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verifikasi instalasi
docker --version
docker-compose --version

# (Opsional) Tambahkan user ke docker group
sudo usermod -aG docker $USER
# Logout dan login kembali agar perubahan berlaku
```

---

## 🎯 LANGKAH 2: Upload Aplikasi ke VPS

### Opsi A: Menggunakan Git (Recommended)

```bash
# Clone repository
cd /home
git clone https://github.com/your-username/warehouse-label.git
cd warehouse-label

# Atau jika private repo
git clone https://your-token@github.com/your-username/warehouse-label.git
```

### Opsi B: Upload Manual via SFTP

1. Buka FileZilla, WinSCP, atau SFTP client lainnya
2. Connect ke VPS:
   - Host: `sftp://ip-vps-anda`
   - Username: `root` atau username Anda
   - Password: password VPS
   - Port: `22`
3. Upload seluruh folder aplikasi ke `/home/warehouse-label`

---

## 🎯 LANGKAH 3: Konfigurasi Environment

### 3.1 Copy Template Environment

```bash
# Copy template .env
cp .env.production .env
```

### 3.2 Edit File .env

```bash
nano .env
```

Isi dengan konfigurasi berikut:

```env
# Database Configuration
DB_ROOT_PASSWORD=BuatPasswordKuatUntukRoot123!@#
DB_NAME=warehouse_label
DB_USER=warehouse_user
DB_PASSWORD=BuatPasswordKuatUntukUser456!@#

# Backend Configuration
JWT_SECRET=BuatRandomStringPanjangUntukJWT789!@#
CORS_ORIGIN=http://ip-vps-anda
# Atau jika pakai domain:
# CORS_ORIGIN=https://warehouselabel.iwareid.com
```

**Tips Generate Password Aman:**
```bash
# Generate random password (32 karakter)
openssl rand -base64 32

# Generate JWT secret (64 karakter)
openssl rand -base64 64
```

**Simpan file:**
- Tekan `Ctrl+X`
- Tekan `Y`
- Tekan `Enter`

**⚠️ PENTING:** Catat semua password yang Anda buat!

---

## 🎯 LANGKAH 4: Setup Database

### 4.1 Import Database Schema

```bash
# Start database container dulu
docker-compose up -d db

# Tunggu 10-15 detik agar MySQL siap
sleep 15

# Import schema
docker exec -i $(docker-compose ps -q db) mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) < backend/schema.sql
```

**Atau import manual:**
```bash
# Masuk ke MySQL container
docker-compose exec db mysql -u root -p

# Masukkan password root dari .env
# Lalu jalankan:
source /docker-entrypoint-initdb.d/schema.sql;
exit;
```

### 4.2 Verifikasi Database

```bash
# Cek database dan tables
docker-compose exec db mysql -u root -p -e "USE warehouse_label; SHOW TABLES;"

# Harus muncul 13 tables:
# - users
# - categories
# - material_stocks
# - label_stocks
# - label_masuk
# - label_keluar
# - lps_docs
# - sj_docs
# - sj_items
# - app_settings
# - backup_logs
# - notifications

# Cek triggers (harus ada 7 triggers)
docker-compose exec db mysql -u root -p -e "USE warehouse_label; SHOW TRIGGERS;"
```

---

## 🎯 LANGKAH 5: Deploy Aplikasi

### 5.1 Build dan Start Containers

```bash
# Build dan start semua containers
docker-compose up -d --build

# Tunggu proses build selesai (2-5 menit)
```

### 5.2 Cek Status Containers

```bash
# Lihat status semua containers
docker-compose ps

# Output harus seperti ini:
# NAME                  STATUS
# warehouse-frontend    Up
# warehouse-backend     Up
# warehouse-db          Up
```

### 5.3 Cek Logs

```bash
# Lihat logs semua containers
docker-compose logs -f

# Atau lihat per service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Tekan Ctrl+C untuk keluar dari logs
```

---

## 🎯 LANGKAH 6: Verifikasi Deployment

### 6.1 Test Backend API

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Harus return: {"ok":true}
```

### 6.2 Test Frontend

```bash
# Test dari dalam VPS
curl http://localhost

# Harus return HTML content
```

### 6.3 Test dari Browser

Buka browser dan akses:
```
http://ip-vps-anda:9000
```

**Catatan:** Aplikasi berjalan di port 9000. Jika ingin akses tanpa port (port 80), setup reverse proxy atau SSL di langkah 7-8.

Jika berhasil, Anda akan melihat halaman login aplikasi.

**Default Login:**
- Username: `superadmin`
- Password: `admin123`

**⚠️ PENTING:** Ganti password default setelah login pertama kali!

---

## 🎯 LANGKAH 7: Setup Domain/Subdomain

### 7.1 Konfigurasi DNS

Di DNS provider Anda (Hostinger/Cloudflare/Namecheap):

**Untuk subdomain (contoh: warehouselabel.iwareid.com):**

| Tipe | Nama | Mengarah ke | TTL |
|------|------|-------------|-----|
| **A** | **warehouselabel** | **[IP VPS]** | **14400** |

**Untuk domain utama (contoh: domain.com):**

| Tipe | Nama | Mengarah ke | TTL |
|------|------|-------------|-----|
| **A** | **@** | **[IP VPS]** | **14400** |

**Tunggu DNS propagation (5-30 menit)**

### 7.2 Update nginx.conf

```bash
nano nginx.conf
```

Ubah `server_name`:
```nginx
# Redirect www to non-www
server {
    listen 80;
    server_name www.warehouselabel.iwareid.com;
    return 301 http://warehouselabel.iwareid.com$request_uri;
}

server {
    listen 80;
    server_name warehouselabel.iwareid.com;  # Ganti dengan domain Anda
    
    # ... rest of config
}
```

### 7.3 Update CORS Origin

```bash
nano .env
```

Ubah `CORS_ORIGIN`:
```env
CORS_ORIGIN=https://warehouselabel.iwareid.com
```

### 7.4 Restart Aplikasi

```bash
docker-compose restart
```

### 7.5 Test Domain

```bash
# Test dari VPS
curl http://warehouselabel.iwareid.com:9000

# Atau buka di browser
http://warehouselabel.iwareid.com:9000
```

**Catatan:** Untuk akses tanpa port (:9000), lanjutkan ke Langkah 8 untuk setup SSL/reverse proxy.

---

## 🎯 LANGKAH 8: Install SSL Certificate (HTTPS)

### 8.1 Install Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Stop Frontend Container

```bash
# Stop frontend sementara (agar port 80 bebas)
docker-compose stop frontend
```

### 8.3 Generate SSL Certificate

```bash
# Generate certificate
sudo certbot certonly --standalone -d warehouselabel.iwareid.com

# Ikuti instruksi:
# 1. Masukkan email Anda
# 2. Setuju terms of service (Y)
# 3. Pilih apakah mau share email (N)
```

Certificate akan disimpan di:
- Certificate: `/etc/letsencrypt/live/warehouselabel.iwareid.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/warehouselabel.iwareid.com/privkey.pem`

### 8.4 Update nginx.conf untuk HTTPS

```bash
nano nginx.conf
```

Ganti isi file dengan:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name warehouselabel.iwareid.com www.warehouselabel.iwareid.com;
    return 301 https://warehouselabel.iwareid.com$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name warehouselabel.iwareid.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/warehouselabel.iwareid.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/warehouselabel.iwareid.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://warehouse_backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://warehouse_backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Catatan:** Konfigurasi ini akan membuat aplikasi bisa diakses tanpa port (langsung https://warehouselabel.iwareid.com)

### 8.5 Update docker-compose.yml

```bash
nano docker-compose.yml
```

Tambahkan volume untuk SSL di service frontend:

```yaml
frontend:
  # ... existing config
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "80:80"
    - "443:443"
```

### 8.6 Restart Aplikasi

```bash
docker-compose up -d
```

### 8.7 Test HTTPS

```bash
# Test dari VPS
curl https://warehouselabel.iwareid.com

# Atau buka di browser
https://warehouselabel.iwareid.com
```

### 8.8 Setup Auto-Renewal SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job untuk auto-renewal
sudo crontab -e

# Tambahkan baris ini (renewal setiap hari jam 3 pagi):
0 3 * * * certbot renew --quiet --post-hook "docker-compose -f /home/warehouse-label/docker-compose.yml restart frontend"
```

---

## 🎯 LANGKAH 9: Setup Firewall

```bash
# Install UFW (jika belum ada)
sudo apt install ufw -y

# Allow SSH (PENTING! Jangan lupa ini!)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow port 9000 (untuk akses langsung tanpa SSL)
sudo ufw allow 9000/tcp

# Enable firewall
sudo ufw enable

# Cek status
sudo ufw status verbose
```

**Output harus seperti:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
9000/tcp                   ALLOW       Anywhere
```

**Catatan:** Port 9000 diperlukan jika belum setup SSL. Setelah SSL aktif, bisa dinonaktifkan dengan `sudo ufw delete allow 9000/tcp`

---

## 🎯 LANGKAH 10: Setup Backup Otomatis

### 10.1 Buat Folder Backup

```bash
mkdir -p /home/warehouse-label/backups
```

### 10.2 Buat Script Backup

```bash
nano /home/warehouse-label/backup.sh
```

Isi dengan:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/warehouse-label/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
CONTAINER_NAME="warehouse-db"
DB_NAME="warehouse_label"
DB_USER="root"
DB_PASSWORD=$(grep DB_ROOT_PASSWORD /home/warehouse-label/.env | cut -d '=' -f2)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
docker exec $CONTAINER_NAME mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Delete backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

Buat executable:
```bash
chmod +x /home/warehouse-label/backup.sh
```

### 10.3 Test Backup

```bash
/home/warehouse-label/backup.sh

# Cek hasil backup
ls -lh /home/warehouse-label/backups/
```

### 10.4 Setup Cron Job

```bash
crontab -e

# Tambahkan baris ini (backup setiap hari jam 2 pagi):
0 2 * * * /home/warehouse-label/backup.sh >> /home/warehouse-label/backup.log 2>&1
```

---

## 📚 Perintah Penting

### Mengelola Containers

```bash
# Start semua containers
docker-compose up -d

# Stop semua containers
docker-compose down

# Restart semua containers
docker-compose restart

# Restart service tertentu
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db

# Rebuild dan restart
docker-compose up -d --build

# Lihat status
docker-compose ps

# Lihat logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Mengelola Database

```bash
# Masuk ke MySQL
docker-compose exec db mysql -u root -p

# Backup database
docker exec warehouse-db mysqldump -u root -p warehouse_label > backup.sql

# Restore database
docker exec -i warehouse-db mysql -u root -p warehouse_label < backup.sql

# Lihat tables
docker-compose exec db mysql -u root -p -e "USE warehouse_label; SHOW TABLES;"

# Lihat triggers
docker-compose exec db mysql -u root -p -e "USE warehouse_label; SHOW TRIGGERS;"
```

### Monitoring

```bash
# Lihat resource usage
docker stats

# Lihat disk usage
df -h

# Lihat memory usage
free -h

# Lihat logs error
docker-compose logs | grep -i error

# Lihat logs hari ini
docker-compose logs --since 24h
```

---

## 🆘 Troubleshooting

### ❌ Container tidak bisa start

```bash
# Lihat logs untuk error
docker-compose logs

# Cek port yang digunakan
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3306

# Restart Docker daemon
sudo systemctl restart docker
docker-compose up -d
```

### ❌ Database connection error

```bash
# Cek database container
docker-compose ps db

# Lihat logs database
docker-compose logs db

# Restart database
docker-compose restart db

# Test connection
docker-compose exec db mysql -u root -p -e "SELECT 1;"
```

### ❌ Frontend tidak bisa diakses

```bash
# Cek nginx logs
docker-compose logs frontend

# Cek nginx config
docker-compose exec frontend nginx -t

# Restart frontend
docker-compose restart frontend
```

### ❌ Backend API error

```bash
# Cek backend logs
docker-compose logs backend

# Cek environment variables
docker-compose exec backend env | grep -E "DB_|JWT_|CORS_"

# Restart backend
docker-compose restart backend
```

### ❌ SSL Certificate error

```bash
# Cek certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### ❌ Port 80/443 sudah digunakan

```bash
# Cek apa yang menggunakan port
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :9000

# Stop Apache/Nginx lain
sudo systemctl stop apache2
sudo systemctl stop nginx

# Disable auto-start
sudo systemctl disable apache2
sudo systemctl disable nginx

# Atau ubah port di docker-compose.yml
# Contoh: ubah "9000:80" menjadi "9001:80" jika port 9000 sudah dipakai
```

### ❌ Out of disk space

```bash
# Cek disk usage
df -h

# Hapus Docker images tidak terpakai
docker system prune -a

# Hapus old backups
find /home/warehouse-label/backups -name "*.sql.gz" -mtime +30 -delete

# Hapus logs lama
docker-compose logs --tail=0 -f > /dev/null
```

### ❌ Triggers tidak berfungsi

```bash
# Cek triggers terpasang
docker-compose exec db mysql -u root -p -e "
USE warehouse_label;
SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'warehouse_label';
"

# Harus ada 7 triggers:
# - after_label_masuk_insert
# - after_label_masuk_update
# - after_label_masuk_delete
# - after_label_keluar_insert
# - after_label_keluar_update
# - after_label_keluar_delete
# - before_label_stocks_update

# Jika tidak ada, re-import schema
docker exec -i warehouse-db mysql -u root -p warehouse_label < backend/schema.sql
```

---

## 🔒 Checklist Keamanan

Setelah deploy, pastikan:

- [ ] ✅ Password database sudah diganti dari default
- [ ] ✅ JWT secret menggunakan random string panjang (min 64 karakter)
- [ ] ✅ Password superadmin sudah diganti dari `admin123`
- [ ] ✅ Firewall (UFW) sudah aktif
- [ ] ✅ SSL certificate terinstall (HTTPS)
- [ ] ✅ Backup otomatis sudah disetup
- [ ] ✅ File `.env` tidak di-commit ke git
- [ ] ✅ CORS origin sudah diset dengan benar
- [ ] ✅ Port database (3306) tidak exposed ke public
- [ ] ✅ Auto-renewal SSL sudah disetup

---

## 🔄 Update Aplikasi

Jika ada update code:

```bash
# 1. Backup database dulu
/home/warehouse-label/backup.sh

# 2. Pull latest code
cd /home/warehouse-label
git pull

# 3. Rebuild dan restart
docker-compose down
docker-compose up -d --build

# 4. Cek logs
docker-compose logs -f
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
# Cek status containers
docker-compose ps

# Cek disk space
df -h

# Cek logs error
docker-compose logs --since 24h | grep -i error
```

### Weekly Checks

```bash
# Cek backup files
ls -lh /home/warehouse-label/backups/

# Test restore backup
# (di development/staging environment)

# Update sistem
sudo apt update && sudo apt upgrade -y
```

### Monthly Checks

```bash
# Review logs
docker-compose logs --since 720h > monthly_logs.txt

# Clean up old backups
find /home/warehouse-label/backups -name "*.sql.gz" -mtime +30 -delete

# Clean up Docker
docker system prune -a
```

---

## 📞 Bantuan & Support

Jika mengalami masalah:

1. **Cek logs**: `docker-compose logs -f`
2. **Cek status**: `docker-compose ps`
3. **Restart aplikasi**: `docker-compose restart`
4. **Cek dokumentasi**: Baca `README.md`
5. **Cek database**: Pastikan schema dan triggers terpasang

---

## 🎉 Selesai!

Aplikasi Warehouse Label Management Anda sekarang sudah running di VPS!

### Akses Aplikasi:

**Sebelum SSL:**
- **HTTP**: `http://warehouselabel.iwareid.com:9000`
- **Atau via IP**: `http://ip-vps-anda:9000`

**Setelah SSL (Langkah 8):**
- **HTTPS**: `https://warehouselabel.iwareid.com` (tanpa port)

### Default Login:

- **Username**: `superadmin`
- **Password**: `admin123`

**⚠️ PENTING: Ganti password setelah login pertama!**

### Fitur yang Sudah Aktif:

- ✅ Auto Stock Update (via database triggers)
- ✅ Autocomplete PN dari Stock Label
- ✅ Realtime updates via Socket.IO
- ✅ Validasi stock sebelum transaksi keluar
- ✅ Backup otomatis setiap hari
- ✅ SSL/HTTPS (jika sudah disetup)

### Jangan Lupa:

- ✅ Ganti password default
- ✅ Monitor logs secara berkala
- ✅ Test backup & restore
- ✅ Update aplikasi secara berkala

---

**Selamat! Aplikasi Anda sudah live dan siap digunakan! 🚀**

**Version:** 3.0  
**Last Updated:** 2026-04-13
