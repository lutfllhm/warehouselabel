# 🚀 Quick Deploy Commands

Perintah cepat untuk deploy setelah fix port error.

## Status Saat Ini

✅ Port sudah diubah ke **9000** di `docker-compose.yml`
✅ Dockerfile.frontend sudah diupdate (npm install)
✅ Konfigurasi sudah siap

## Langkah Deploy

### 1. Stop containers yang sedang berjalan

```bash
docker-compose down
```

### 2. Rebuild dan start ulang

```bash
docker-compose up -d --build
```

### 3. Cek status containers

```bash
docker-compose ps
```

Harus muncul 3 containers dengan status "Up":
- warehouse_db
- warehouse_backend  
- warehouse_frontend

### 4. Cek logs jika ada error

```bash
# Lihat semua logs
docker-compose logs -f

# Atau per service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### 5. Test akses aplikasi

**Via browser:**
```
http://ip-vps-anda:9000
```

**Via curl dari VPS:**
```bash
curl http://localhost:9000
```

## Troubleshooting

### Jika port 9000 juga sudah dipakai

Edit `docker-compose.yml`, ubah baris:
```yaml
ports:
  - "9000:80"
```

Menjadi port lain yang kosong, misalnya:
```yaml
ports:
  - "9001:80"
```

Lalu jalankan:
```bash
docker-compose down
docker-compose up -d
```

### Jika masih error

1. Cek port yang digunakan:
```bash
sudo netstat -tulpn | grep :9000
```

2. Lihat logs detail:
```bash
docker-compose logs --tail=100
```

3. Restart Docker:
```bash
sudo systemctl restart docker
docker-compose up -d
```

## Setup Firewall (Jangan Lupa!)

```bash
# Allow port 9000
sudo ufw allow 9000/tcp

# Cek status
sudo ufw status
```

## Akses Aplikasi

Setelah berhasil deploy:

**URL:** `http://warehouselabel.iwareid.com:9000`

**Login:**
- Username: `superadmin`
- Password: `admin123`

⚠️ **Ganti password setelah login pertama!**

## Next Steps

Setelah aplikasi berjalan dengan baik di port 9000:

1. **Setup SSL** (opsional tapi recommended)
   - Ikuti Langkah 8 di `PANDUAN-DEPLOY.md`
   - Setelah SSL aktif, aplikasi bisa diakses tanpa port: `https://warehouselabel.iwareid.com`

2. **Setup Backup Otomatis**
   - Ikuti Langkah 10 di `PANDUAN-DEPLOY.md`

3. **Monitoring**
   - Cek logs secara berkala: `docker-compose logs -f`
   - Monitor resource: `docker stats`

---

**Dokumentasi lengkap:** Lihat `PANDUAN-DEPLOY.md`
