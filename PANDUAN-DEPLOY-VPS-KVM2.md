# 🚀 Panduan Deploy Lengkap - VPS KVM 2

Panduan lengkap deployment aplikasi **RBM Warehouse Label Management System** di VPS KVM 2 menggunakan Docker.

---

## 📋 Daftar Isi

1. [Spesifikasi Minimum](#spesifikasi-minimum)
2. [Persiapan VPS](#persiapan-vps)
3. [Instalasi Docker & Docker Compose](#instalasi-docker--docker-compose)
4. [Setup Aplikasi](#setup-aplikasi)
5. [Konfigurasi Environment](#konfigurasi-environment)
6. [Deploy dengan Docker Compose](#deploy-dengan-docker-compose)
7. [Konfigurasi Firewall](#konfigurasi-firewall)
8. [Setup Domain (Opsional)](#setup-domain-opsional)
9. [SSL Certificate dengan Let's Encrypt](#ssl-certificate-dengan-lets-encrypt)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## 🖥️ Spesifikasi Minimum

### VPS Requirements
- **RAM**: Minimum 2GB (Recommended 4GB)
- **CPU**: 2 vCPU
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 / 22.04 LTS atau Debian 11/12
- **Network**: Public IP Address

### Software Stack
- Docker Engine 24.x atau lebih baru
- Docker Compose v2.x
- Node.js 20 (via Docker)
- MySQL 8.0 (via Docker)
- Nginx (via Docker)

---

## 🔧 Persiapan VPS

### 1. Login ke VPS

```bash
ssh root@IP_VPS_ANDA
# atau
ssh username@IP_VPS_ANDA
```

### 2. Update Sistem

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano ufw net-tools
```

### 3. Buat User Non-Root (Recommended)

```bash
# Buat user baru
sudo adduser deployer

# Tambahkan ke sudo group
sudo usermod -aG sudo deployer

# Switch ke user baru
su - deployer
```

### 4. Setup SSH Key (Opsional tapi Recommended)

```bash
# Di komputer lokal, generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key ke VPS
ssh-copy-id deployer@IP_VPS_ANDA
```

---

## 🐳 Instalasi Docker & Docker Compose

### Metode 1: Instalasi Otomatis (Recommended)

```bash
# Download dan jalankan script instalasi Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tambahkan user ke docker group
sudo usermod -aG docker $USER

# Aktifkan Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Logout dan login kembali agar group changes berlaku
exit
# Login kembali ke VPS
```

### Metode 2: Instalasi Manual

```bash
# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Tambahkan Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Tambahkan Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Tambahkan user ke docker group
sudo usermod -aG docker $USER
```

### Verifikasi Instalasi

```bash
# Cek versi Docker
docker --version
# Output: Docker version 24.x.x, build xxxxx

# Cek versi Docker Compose
docker compose version
# Output: Docker Compose version v2.x.x

# Test Docker
docker run hello-world
```

---

## 📦 Setup Aplikasi

### 1. Clone Repository

```bash
# Pindah ke home directory
cd ~

# Clone repository (ganti dengan URL repo Anda)
git clone https://github.com/username/warehouse-label.git

# Atau jika menggunakan private repo dengan token
git clone https://YOUR_TOKEN@github.com/username/warehouse-label.git

# Masuk ke direktori aplikasi
cd warehouse-label
```

### 2. Struktur Direktori

Pastikan struktur direktori seperti ini:

```
warehouse-label/
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── schema.sql
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
└── .env.production
```

---

## ⚙️ Konfigurasi Environment

### 1. Setup Environment Variables

```bash
# Copy template environment
cp .env.production .env

# Edit file .env
nano .env
```

### 2. Konfigurasi .env File

Isi dengan konfigurasi berikut:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_ROOT_PASSWORD=RootPassword_2024!Secure
DB_NAME=warehouse_label
DB_USER=warehouse_user
DB_PASSWORD=WarehouseDB_2024!Strong

# ============================================
# BACKEND CONFIGURATION
# ============================================
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_random_string_here
CORS_ORIGIN=http://IP_VPS_ANDA:9000

# ============================================
# NOTES
# ============================================
# 1. Ganti semua password dengan password yang kuat
# 2. JWT_SECRET harus random string minimal 32 karakter
# 3. Ganti IP_VPS_ANDA dengan IP VPS Anda
# 4. Jika menggunakan domain, ganti CORS_ORIGIN dengan domain Anda
```

### 3. Generate Strong Passwords

```bash
# Generate random password untuk DB_ROOT_PASSWORD
openssl rand -base64 32

# Generate random password untuk DB_PASSWORD
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 48
```

### 4. Update CORS_ORIGIN

```bash
# Jika menggunakan IP
CORS_ORIGIN=http://123.456.789.10:9000

# Jika menggunakan domain
CORS_ORIGIN=https://warehouse.yourdomain.com
```

### 5. Konfigurasi Backend Environment (Opsional)

```bash
# Copy backend env example
cp backend/.env.example backend/.env

# Edit jika diperlukan
nano backend/.env
```

---

## 🚀 Deploy dengan Docker Compose

### 1. Build dan Start Database Terlebih Dahulu

```bash
# Start database container
docker compose up -d db

# Tunggu database siap (20-30 detik)
sleep 30

# Cek status database
docker compose ps
docker compose logs db
```

### 2. Import Database Schema

```bash
# Ambil password dari .env
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Import schema
docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} warehouse_label < backend/schema.sql

# Verifikasi import
docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} -e "USE warehouse_label; SHOW TABLES;"
```

### 3. Build dan Start Semua Services

```bash
# Build dan start semua container
docker compose up -d --build

# Proses ini akan memakan waktu 5-10 menit tergantung spesifikasi VPS
```

### 4. Monitor Deployment

```bash
# Lihat status semua container
docker compose ps

# Lihat logs semua services
docker compose logs -f

# Lihat logs specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Tekan Ctrl+C untuk keluar dari logs
```

### 5. Verifikasi Deployment

```bash
# 1. Cek container yang running
docker ps

# 2. Cek logs jika ada error
docker logs warehouse_frontend
docker logs warehouse_backend
docker logs warehouse_db

# 3. Test akses lokal
curl http://localhost:9000
curl http://localhost:5005/api/health

# 4. Test akses domain (setelah setup Nginx di host)
curl http://warehouselabel.iwareid.com
curl http://warehouselabel.iwareid.com/api/health

# 5. Cek port yang digunakan
sudo netstat -tulpn | grep -E ':(9000|5005|3005)'
```

---

## 🔒 Konfigurasi Firewall

### 1. Setup UFW (Uncomplicated Firewall)

```bash
# Reset UFW (jika sudah ada konfigurasi sebelumnya)
sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (PENTING! Jangan sampai terkunci)
sudo ufw allow 22/tcp
sudo ufw allow ssh

# Allow aplikasi port
sudo ufw allow 9000/tcp comment 'Warehouse Frontend'

# Opsional: Allow backend dan database jika perlu akses eksternal
# sudo ufw allow 5005/tcp comment 'Warehouse Backend API'
# sudo ufw allow 3005/tcp comment 'MySQL Database'

# Enable firewall
sudo ufw enable

# Cek status
sudo ufw status verbose
```

### 2. Verifikasi Firewall Rules

```bash
# Lihat numbered rules
sudo ufw status numbered

# Expected output:
# Status: active
#
#      To                         Action      From
#      --                         ------      ----
# [ 1] 22/tcp                     ALLOW IN    Anywhere
# [ 2] 9000/tcp                   ALLOW IN    Anywhere
```

### 3. Test Akses dari Browser

**Sebelum Setup Domain:**
```
http://IP_VPS_ANDA:9000
```

**Setelah Setup Domain (lihat bagian Setup Domain):**
```
http://warehouselabel.iwareid.com
```

**Default Login:**
- Username: `superadmin`
- Password: `admin123`

⚠️ **PENTING**: Segera ganti password setelah login pertama kali!

---

## 🌐 Setup Domain dengan Nginx Reverse Proxy

### ⚠️ PENTING: Port yang Digunakan Aplikasi

Aplikasi ini menggunakan port berikut (sudah disesuaikan agar tidak bentrok):
- **Port 9000**: Frontend (Nginx dalam container)
- **Port 5005**: Backend API
- **Port 3005**: MySQL Database

Port 80 dan 443 akan digunakan oleh **Nginx di host VPS** sebagai reverse proxy.

### 1. Konfigurasi DNS

Di DNS provider Anda (Cloudflare, Namecheap, dll), tambahkan A Record:

```
Type: A
Name: warehouselabel (atau @ untuk root domain)
Value: IP_VPS_ANDA
TTL: Auto atau 3600
```

Contoh:
```
warehouselabel.iwareid.com → 123.456.789.10
```

### 2. Setup Nginx di Host VPS

```bash
# Install Nginx di host (jika belum ada)
sudo apt install nginx -y

# Copy konfigurasi nginx untuk aplikasi ini
sudo nano /etc/nginx/sites-available/warehouselabel
```

Paste konfigurasi berikut:

```nginx
# Redirect www to non-www
server {
    listen 80;
    server_name www.warehouselabel.iwareid.com;
    return 301 http://warehouselabel.iwareid.com$request_uri;
}

# Main server block
server {
    listen 80;
    server_name warehouselabel.iwareid.com;

    # Logging
    access_log /var/log/nginx/warehouselabel-access.log;
    error_log /var/log/nginx/warehouselabel-error.log;

    # Proxy to Docker container (port 9000)
    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Client max body size (untuk upload file)
    client_max_body_size 50M;
}
```

### 3. Aktifkan Konfigurasi Nginx

```bash
# Buat symlink ke sites-enabled
sudo ln -s /etc/nginx/sites-available/warehouselabel /etc/nginx/sites-enabled/

# Test konfigurasi nginx
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Cek status nginx
sudo systemctl status nginx
```

### 4. Update CORS Origin

```bash
# Edit .env
nano .env
```

Update CORS_ORIGIN:

```env
CORS_ORIGIN=http://warehouselabel.iwareid.com
```

### 5. Restart Services

```bash
# Rebuild dan restart
docker compose down
docker compose up -d --build
```

### 6. Update Firewall untuk HTTP/HTTPS

```bash
# Allow HTTP (port 80 untuk Nginx host)
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (untuk SSL nanti)
sudo ufw allow 443/tcp comment 'HTTPS'

# Port 9000 tidak perlu dibuka karena hanya diakses dari localhost
# Jika sudah dibuka sebelumnya, bisa dihapus:
# sudo ufw delete allow 9000/tcp

# Reload firewall
sudo ufw reload

# Cek status
sudo ufw status numbered
```

---

## 🔐 SSL Certificate dengan Let's Encrypt

### 1. Install Certbot

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Atau menggunakan snap (recommended)
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Generate SSL Certificate

```bash
# Generate certificate (Certbot akan otomatis update konfigurasi Nginx)
sudo certbot --nginx -d warehouselabel.iwareid.com -d www.warehouselabel.iwareid.com

# Ikuti instruksi:
# - Masukkan email Anda
# - Setuju terms of service
# - Pilih apakah mau share email dengan EFF
# - Pilih redirect HTTP ke HTTPS (recommended: pilih 2)
```

Certificate akan disimpan di:
```
/etc/letsencrypt/live/warehouselabel.iwareid.com/fullchain.pem
/etc/letsencrypt/live/warehouselabel.iwareid.com/privkey.pem
```

### 3. Update CORS Origin untuk HTTPS

```bash
# Edit .env
nano .env
```

```env
CORS_ORIGIN=https://warehouselabel.iwareid.com
```

### 4. Restart Backend Container

```bash
# Restart backend untuk apply CORS changes
docker compose restart backend
```

### 5. Setup Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot sudah otomatis setup cron/systemd timer untuk renewal
# Cek timer status
sudo systemctl status certbot.timer

# Atau cek cron
sudo cat /etc/cron.d/certbot
```

### 6. Verifikasi SSL

Buka browser dan akses:
```
https://warehouselabel.iwareid.com
```

Cek SSL certificate dengan:
```bash
# Test SSL
openssl s_client -connect warehouselabel.iwareid.com:443 -servername warehouselabel.iwareid.com
```

---

## 📊 Monitoring & Maintenance

### 1. Monitoring Container Status

```bash
# Cek status semua container
docker compose ps

# Cek resource usage
docker stats

# Cek logs
docker compose logs -f --tail=100
```

### 2. Database Backup

```bash
# Buat direktori backup
mkdir -p ~/backups

# Backup database
docker exec warehouse_db mysqldump -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) warehouse_label > ~/backups/warehouse_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip ~/backups/warehouse_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Setup Automated Backup

```bash
# Buat backup script
nano ~/backup-warehouse.sh
```

Isi script:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="$HOME/backups"
DB_CONTAINER="warehouse_db"
DB_NAME="warehouse_label"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Get DB password from .env
cd ~/warehouse-label
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Backup filename
BACKUP_FILE="$BACKUP_DIR/warehouse_$(date +%Y%m%d_%H%M%S).sql"

# Create backup
echo "Creating backup: $BACKUP_FILE"
docker exec $DB_CONTAINER mysqldump -u root -p$DB_ROOT_PASSWORD $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
echo "Backup compressed: ${BACKUP_FILE}.gz"

# Delete old backups
find $BACKUP_DIR -name "warehouse_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups deleted (older than $RETENTION_DAYS days)"

echo "Backup completed successfully!"
```

```bash
# Buat executable
chmod +x ~/backup-warehouse.sh

# Test backup script
~/backup-warehouse.sh

# Setup cron job (backup setiap hari jam 3 pagi)
crontab -e

# Tambahkan:
0 3 * * * /home/deployer/backup-warehouse.sh >> /home/deployer/backup.log 2>&1
```

### 4. Restore Database dari Backup

```bash
# List available backups
ls -lh ~/backups/

# Decompress backup
gunzip ~/backups/warehouse_20260413_030000.sql.gz

# Restore database
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD ~/warehouse-label/.env | cut -d '=' -f2)
docker exec -i warehouse_db mysql -u root -p$DB_ROOT_PASSWORD warehouse_label < ~/backups/warehouse_20260413_030000.sql
```

### 5. Update Aplikasi

```bash
# Masuk ke direktori aplikasi
cd ~/warehouse-label

# Pull latest changes
git pull origin main

# Rebuild dan restart
docker compose down
docker compose up -d --build

# Cek logs
docker compose logs -f
```

### 6. Monitoring Disk Space

```bash
# Cek disk usage
df -h

# Cek Docker disk usage
docker system df

# Clean up unused Docker resources
docker system prune -a --volumes

# HATI-HATI: Command di atas akan menghapus semua unused images, containers, dan volumes
```

### 7. Setup Monitoring dengan Portainer (Opsional)

```bash
# Install Portainer
docker volume create portainer_data

docker run -d \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Allow port di firewall
sudo ufw allow 9443/tcp comment 'Portainer'

# Akses Portainer
# https://IP_VPS_ANDA:9443
```

---

## 🔧 Troubleshooting

### 1. Container Tidak Bisa Start

```bash
# Cek logs detail
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Cek container status
docker compose ps

# Restart specific service
docker compose restart backend

# Rebuild specific service
docker compose up -d --build backend
```

### 2. Database Connection Error

```bash
# Cek database container
docker compose logs db

# Cek database health
docker exec warehouse_db mysqladmin ping -h localhost -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Masuk ke database container
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Di dalam MySQL:
SHOW DATABASES;
USE warehouse_label;
SHOW TABLES;
```

### 3. Port Already in Use

```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :9000
sudo netstat -tulpn | grep :5005
sudo netstat -tulpn | grep :3005

# Kill process yang menggunakan port
sudo kill -9 PID

# Atau ubah port di docker-compose.yml
```

### 4. Frontend Tidak Bisa Akses Backend

```bash
# Cek CORS configuration
docker compose logs backend | grep CORS

# Cek network
docker network ls
docker network inspect warehouse_warehouse_network

# Test backend dari dalam frontend container
docker exec warehouse_frontend wget -O- http://warehouse_backend:5000/api/health
```

### 5. SSL Certificate Error

```bash
# Cek certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect warehouse.yourdomain.com:443 -servername warehouse.yourdomain.com
```

### 6. Out of Memory

```bash
# Cek memory usage
free -h
docker stats

# Restart services
docker compose restart

# Atau tambahkan memory limits di docker-compose.yml
```

### 7. Disk Space Full

```bash
# Cek disk space
df -h

# Clean Docker
docker system prune -a

# Clean logs
sudo journalctl --vacuum-time=3d

# Clean old backups
find ~/backups -name "*.sql.gz" -mtime +30 -delete
```

### 8. Cannot Connect to Docker Daemon

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker on boot
sudo systemctl enable docker

# Cek Docker status
sudo systemctl status docker

# Tambahkan user ke docker group
sudo usermod -aG docker $USER

# Logout dan login kembali
```

### 9. Git Pull Error

```bash
# Stash local changes
git stash

# Pull latest
git pull origin main

# Apply stashed changes
git stash pop

# Atau force pull (HATI-HATI: akan menghapus local changes)
git fetch --all
git reset --hard origin/main
```

### 10. Performance Issues

```bash
# Cek resource usage
htop
docker stats

# Restart services
docker compose restart

# Optimize MySQL
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Di MySQL:
OPTIMIZE TABLE material_stocks;
OPTIMIZE TABLE label_stocks;
ANALYZE TABLE material_stocks;
ANALYZE TABLE label_stocks;
```

---

## 📝 Checklist Deployment

### Pre-Deployment
- [ ] VPS sudah siap dengan spesifikasi minimum
- [ ] SSH access sudah dikonfigurasi
- [ ] Domain sudah pointing ke IP VPS (jika menggunakan domain)
- [ ] Backup data existing (jika ada)

### Installation
- [ ] Docker dan Docker Compose terinstall
- [ ] Repository sudah di-clone
- [ ] Environment variables sudah dikonfigurasi
- [ ] Strong passwords sudah di-generate

### Deployment
- [ ] Database container berjalan
- [ ] Database schema sudah di-import
- [ ] Backend container berjalan
- [ ] Frontend container berjalan
- [ ] Semua container status "Up"

### Security
- [ ] Firewall sudah dikonfigurasi
- [ ] Hanya port yang diperlukan yang dibuka
- [ ] Default password sudah diganti
- [ ] SSL certificate sudah terinstall (jika production)

### Testing
- [ ] Frontend bisa diakses dari browser
- [ ] Login berhasil
- [ ] API backend berfungsi
- [ ] Database connection OK
- [ ] Real-time features (Socket.IO) berfungsi

### Maintenance
- [ ] Backup script sudah dikonfigurasi
- [ ] Cron job untuk backup sudah aktif
- [ ] SSL auto-renewal sudah dikonfigurasi (jika menggunakan SSL)
- [ ] Monitoring tools sudah disetup

---

## 📞 Support & Resources

### Dokumentasi
- Docker: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Let's Encrypt: https://letsencrypt.org/docs/
- Nginx: https://nginx.org/en/docs/

### Useful Commands Cheat Sheet

```bash
# Docker Compose
docker compose up -d              # Start services
docker compose down               # Stop services
docker compose ps                 # List services
docker compose logs -f            # View logs
docker compose restart            # Restart services
docker compose up -d --build      # Rebuild and start

# Docker
docker ps                         # List running containers
docker ps -a                      # List all containers
docker logs CONTAINER_NAME        # View container logs
docker exec -it CONTAINER bash    # Enter container
docker system prune -a            # Clean up

# System
sudo systemctl status docker      # Check Docker status
sudo ufw status                   # Check firewall
df -h                            # Check disk space
free -h                          # Check memory
htop                             # Monitor resources

# Database
docker exec -it warehouse_db mysql -u root -p  # Enter MySQL
mysqldump                        # Backup database
mysql < backup.sql               # Restore database
```

---

## 🎉 Selesai!

Aplikasi Anda sekarang sudah berjalan di VPS KVM 2!

**Akses Aplikasi:**
- Lokal: `http://IP_VPS_ANDA:9000`
- Domain: `http://warehouselabel.iwareid.com` (setelah setup domain)
- HTTPS: `https://warehouselabel.iwareid.com` (setelah setup SSL)

**Default Login:**
- Username: `superadmin`
- Password: `admin123`

⚠️ **Jangan lupa ganti password default setelah login pertama kali!**

---

**Dibuat dengan ❤️ untuk deployment yang mudah dan aman**

*Last Updated: 2026-04-13*
