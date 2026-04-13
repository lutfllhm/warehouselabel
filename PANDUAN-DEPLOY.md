# 🚀 Panduan Deploy ke VPS Hostinger

Panduan lengkap deploy aplikasi Warehouse Label Management ke VPS Hostinger menggunakan Docker.

---

## 📋 Yang Anda Butuhkan

1. ✅ VPS Hostinger (sudah aktif)
2. ✅ Akses SSH ke VPS
3. ✅ Domain (opsional, tapi direkomendasikan)

---

## 🎯 LANGKAH 1: Persiapan VPS

### 1.1 Login ke VPS via SSH

```bash
ssh root@ip-vps-anda
# Atau
ssh username@ip-vps-anda
```

### 1.2 Install Docker

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Verifikasi instalasi
docker --version
docker-compose --version
```

---

## 🎯 LANGKAH 2: Upload Aplikasi ke VPS

### Opsi A: Menggunakan Git (Direkomendasikan)

```bash
# Di VPS
cd /home
git clone https://github.com/username/warehouse-app.git
cd warehouse-app
```

### Opsi B: Upload Manual via FileZilla/WinSCP

1. Buka FileZilla atau WinSCP
2. Connect ke VPS (SFTP)
3. Upload folder aplikasi ke `/home/warehouse-app`

---

## 🎯 LANGKAH 3: Konfigurasi Environment

### 3.1 Setup Otomatis (Mudah)

```bash
# Jalankan setup wizard
chmod +x setup.sh
./setup.sh
```

Script akan otomatis:
- Generate password yang aman
- Membuat file `.env`
- Menampilkan password yang di-generate

**PENTING: Catat semua password yang ditampilkan!**

### 3.2 Setup Manual (Jika setup.sh tidak jalan)

```bash
# Copy template
cp .env.production .env

# Edit dengan nano
nano .env
```

Isi dengan nilai berikut:

```env
# Database Configuration
DB_ROOT_PASSWORD=GantiDenganPasswordKuat123!
DB_NAME=warehouse_label
DB_USER=warehouse_user
DB_PASSWORD=GantiDenganPasswordKuat456!

# Backend Configuration
JWT_SECRET=GantiDenganRandomString789!
CORS_ORIGIN=http://ip-vps-anda
```

**Tips Generate Password Aman:**
```bash
# Generate random password
openssl rand -base64 32
```

Tekan `Ctrl+X`, lalu `Y`, lalu `Enter` untuk save.

---

## 🎯 LANGKAH 4: Deploy Aplikasi

### 4.1 Deploy dengan Script (Mudah)

```bash
# Buat script executable
chmod +x deploy.sh

# Start aplikasi
./deploy.sh start
```

### 4.2 Deploy Manual (Jika deploy.sh tidak jalan)

```bash
# Build dan start semua container
docker-compose up -d --build

# Tunggu beberapa saat (30-60 detik)
```

### 4.3 Cek Status

```bash
# Lihat status container
docker-compose ps

# Semua container harus status "Up"
```

---

## 🎯 LANGKAH 5: Verifikasi Deployment

### 5.1 Test Backend

```bash
curl http://localhost:5000/api/health
# Harus return: {"ok":true}
```

### 5.2 Test Frontend

Buka browser dan akses:
```
http://ip-vps-anda
```

Jika berhasil, Anda akan melihat halaman login aplikasi.

---

## 🎯 LANGKAH 6: Setup Domain (Opsional)

### 6.1 Arahkan Domain ke VPS

Di DNS provider Anda (Cloudflare, Namecheap, dll):

1. Buat A Record:
   - Type: `A`
   - Name: `@` (atau subdomain seperti `warehouse`)
   - Value: `IP VPS Anda`
   - TTL: `3600`

2. Tunggu propagasi DNS (5-30 menit)

### 6.2 Update CORS Origin

```bash
# Edit .env
nano .env

# Ubah CORS_ORIGIN
CORS_ORIGIN=http://domain-anda.com
```

```bash
# Restart aplikasi
./deploy.sh restart
# Atau
docker-compose restart
```

### 6.3 Install SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot -y

# Stop frontend sementara
docker-compose stop frontend

# Dapatkan SSL certificate
sudo certbot certonly --standalone -d domain-anda.com

# Update nginx config untuk SSL
sudo nano nginx.conf
```

Tambahkan di `nginx.conf`:

```nginx
server {
    listen 80;
    server_name domain-anda.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name domain-anda.com;

    ssl_certificate /etc/letsencrypt/live/domain-anda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain-anda.com/privkey.pem;

    # ... rest of config (copy dari nginx.conf yang ada)
}
```

Update `docker-compose.yml` untuk mount SSL:

```yaml
frontend:
  # ... existing config
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  ports:
    - "80:80"
    - "443:443"
```

```bash
# Start frontend kembali
docker-compose up -d
```

---

## 🎯 LANGKAH 7: Setup Firewall (Keamanan)

```bash
# Install UFW
sudo apt install ufw -y

# Allow SSH (PENTING!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Cek status
sudo ufw status
```

---

## 🎯 LANGKAH 8: Setup Backup Otomatis

### 8.1 Test Backup Manual

```bash
# Test backup
./deploy.sh backup

# Cek hasil backup
ls -lh backups/
```

### 8.2 Setup Cron Job untuk Backup Otomatis

```bash
# Edit crontab
crontab -e

# Pilih editor (nano = 1)
# Tambahkan baris berikut di akhir file:

# Backup setiap hari jam 2 pagi
0 2 * * * cd /home/warehouse-app && ./deploy.sh backup

# Save: Ctrl+X, Y, Enter
```

---

## 📚 Perintah Penting

### Mengelola Aplikasi

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

# Update aplikasi (setelah git pull)
./deploy.sh update
```

### Perintah Docker Manual

```bash
# Lihat container yang running
docker-compose ps

# Lihat logs semua container
docker-compose logs -f

# Lihat logs backend saja
docker-compose logs -f backend

# Restart service tertentu
docker-compose restart backend

# Masuk ke container
docker-compose exec backend sh
docker-compose exec db mysql -u root -p

# Stop dan hapus semua container
docker-compose down

# Stop dan hapus termasuk volumes (HATI-HATI!)
docker-compose down -v
```

---

## 🆘 Troubleshooting

### ❌ Container tidak bisa start

```bash
# Lihat logs untuk error
docker-compose logs

# Cek apakah port sudah digunakan
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5000

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### ❌ Database connection error

```bash
# Restart database
docker-compose restart db

# Lihat logs database
docker-compose logs db

# Cek apakah database sudah ready
docker-compose exec db mysql -u root -p
```

### ❌ Frontend tidak bisa diakses

```bash
# Cek logs frontend
docker-compose logs frontend

# Cek apakah nginx running
docker-compose ps frontend

# Restart frontend
docker-compose restart frontend
```

### ❌ Port 80 sudah digunakan

```bash
# Cek apa yang menggunakan port 80
sudo netstat -tulpn | grep :80

# Jika Apache/Nginx lain yang running
sudo systemctl stop apache2
# atau
sudo systemctl stop nginx

# Lalu start aplikasi lagi
docker-compose up -d
```

### ❌ Out of disk space

```bash
# Cek disk space
df -h

# Hapus Docker images yang tidak terpakai
docker system prune -a

# Hapus old backups
rm backups/backup_old*.sql
```

---

## 🔒 Checklist Keamanan

Setelah deploy, pastikan:

- [ ] ✅ Semua password sudah diganti dari default
- [ ] ✅ JWT secret menggunakan random string yang panjang
- [ ] ✅ Firewall sudah aktif (ufw)
- [ ] ✅ SSL certificate terinstall (untuk production)
- [ ] ✅ Backup otomatis sudah disetup
- [ ] ✅ File `.env` tidak di-commit ke git
- [ ] ✅ CORS origin sudah diset dengan benar

---

## 📊 Monitoring Sederhana

### Cek Resource Usage

```bash
# Lihat penggunaan resource per container
docker stats

# Lihat disk usage
df -h

# Lihat memory usage
free -h
```

### Cek Logs Secara Berkala

```bash
# Lihat logs hari ini
docker-compose logs --since 24h

# Lihat error logs
docker-compose logs | grep -i error
```

---

## 🔄 Update Aplikasi

Jika ada update code:

```bash
# 1. Pull latest code
git pull

# 2. Update aplikasi
./deploy.sh update

# Atau manual:
docker-compose down
docker-compose up -d --build
```

---

## 📞 Bantuan

Jika mengalami masalah:

1. **Cek logs**: `./deploy.sh logs`
2. **Cek status**: `./deploy.sh status`
3. **Restart aplikasi**: `./deploy.sh restart`
4. **Cek dokumentasi**: Baca file `DEPLOYMENT.md` dan `SECURITY.md`

---

## 🎉 Selesai!

Aplikasi Anda sekarang sudah running di VPS Hostinger!

**Akses aplikasi:**
- Tanpa domain: `http://ip-vps-anda`
- Dengan domain: `http://domain-anda.com`
- Dengan SSL: `https://domain-anda.com`

**Default Login:**
- Buat user admin pertama kali melalui database atau API

**Jangan lupa:**
- ✅ Backup database secara berkala
- ✅ Update aplikasi secara berkala
- ✅ Monitor logs untuk error
- ✅ Ganti password default

---

**Selamat! Aplikasi Anda sudah live! 🚀**
