# ✅ Deployment Checklist - VPS KVM 2

Checklist lengkap untuk memastikan deployment berjalan dengan baik.

---

## 📋 Pre-Deployment Checklist

### VPS Requirements
- [ ] VPS sudah siap dengan minimum 2GB RAM
- [ ] VPS memiliki minimum 2 vCPU
- [ ] Storage minimum 20GB tersedia
- [ ] OS Ubuntu 20.04/22.04 atau Debian 11/12
- [ ] Public IP address sudah tersedia
- [ ] SSH access sudah dikonfigurasi

### Domain & DNS (Jika Menggunakan Domain)
- [ ] Domain sudah dibeli
- [ ] DNS A Record sudah pointing ke IP VPS
- [ ] DNS propagation sudah selesai (cek dengan `nslookup domain.com`)
- [ ] Subdomain sudah dikonfigurasi (jika perlu)

### Backup & Data
- [ ] Backup data existing (jika ada)
- [ ] Backup database existing (jika ada)
- [ ] Dokumentasi konfigurasi lama (jika ada)

---

## 🔧 Installation Checklist

### System Update
- [ ] `sudo apt update` berhasil
- [ ] `sudo apt upgrade -y` berhasil
- [ ] Essential tools terinstall (curl, wget, git, nano, ufw)

### Docker Installation
- [ ] Docker Engine terinstall
- [ ] Docker Compose terinstall
- [ ] User ditambahkan ke docker group
- [ ] Docker service berjalan (`sudo systemctl status docker`)
- [ ] Test `docker run hello-world` berhasil
- [ ] Test `docker compose version` menampilkan versi

### Repository Setup
- [ ] Repository berhasil di-clone
- [ ] Struktur direktori lengkap
- [ ] File `docker-compose.yml` ada
- [ ] File `Dockerfile.backend` ada
- [ ] File `Dockerfile.frontend` ada
- [ ] File `nginx.conf` ada
- [ ] File `backend/schema.sql` ada

---

## ⚙️ Configuration Checklist

### Environment Variables
- [ ] File `.env` sudah dibuat dari `.env.production`
- [ ] `DB_ROOT_PASSWORD` sudah diisi dengan password kuat
- [ ] `DB_NAME` sudah dikonfigurasi
- [ ] `DB_USER` sudah dikonfigurasi
- [ ] `DB_PASSWORD` sudah diisi dengan password kuat
- [ ] `JWT_SECRET` sudah diisi (minimum 32 karakter)
- [ ] `CORS_ORIGIN` sudah disesuaikan dengan IP/domain

### Password Security
- [ ] DB_ROOT_PASSWORD menggunakan password kuat (min 16 karakter)
- [ ] DB_PASSWORD menggunakan password kuat (min 16 karakter)
- [ ] JWT_SECRET menggunakan random string (min 32 karakter)
- [ ] Password tidak menggunakan default value
- [ ] Password sudah dicatat di tempat aman

### Network Configuration
- [ ] Port 9000 tidak digunakan oleh aplikasi lain
- [ ] Port 5005 tidak digunakan oleh aplikasi lain
- [ ] Port 3005 tidak digunakan oleh aplikasi lain
- [ ] Network `warehouse_network` tidak konflik

---

## 🚀 Deployment Checklist

### Database Deployment
- [ ] `docker compose up -d db` berhasil
- [ ] Database container status "Up"
- [ ] Database health check passed
- [ ] Schema berhasil di-import
- [ ] Tables berhasil dibuat
- [ ] Bisa login ke MySQL dengan root
- [ ] Database `warehouse_label` ada

### Backend Deployment
- [ ] `docker compose up -d backend` berhasil
- [ ] Backend container status "Up"
- [ ] Backend health check passed
- [ ] Backend logs tidak ada error
- [ ] Backend bisa connect ke database
- [ ] API endpoint `/api/health` response OK

### Frontend Deployment
- [ ] `docker compose up -d frontend` berhasil
- [ ] Frontend container status "Up"
- [ ] Frontend build berhasil
- [ ] Nginx configuration loaded
- [ ] Frontend bisa akses backend API

### All Services
- [ ] Semua 3 containers berjalan (db, backend, frontend)
- [ ] `docker compose ps` menampilkan semua "Up"
- [ ] Tidak ada container yang restart terus-menerus
- [ ] Logs tidak menampilkan error critical

---

## 🔒 Security Checklist

### Firewall Configuration
- [ ] UFW terinstall
- [ ] Default policy: deny incoming
- [ ] Default policy: allow outgoing
- [ ] Port 22 (SSH) allowed
- [ ] Port 9000 (Frontend) allowed
- [ ] Port 80 (HTTP) allowed (jika perlu)
- [ ] Port 443 (HTTPS) allowed (jika perlu)
- [ ] UFW enabled
- [ ] `sudo ufw status` menampilkan rules yang benar

### SSH Security
- [ ] SSH key authentication dikonfigurasi
- [ ] Password authentication disabled (recommended)
- [ ] Root login disabled (recommended)
- [ ] SSH port sudah diganti (optional)
- [ ] Fail2ban terinstall (recommended)

### Application Security
- [ ] Default password aplikasi sudah diganti
- [ ] User superadmin password sudah diganti
- [ ] Database tidak bisa diakses dari luar (port 3005 tidak exposed)
- [ ] Backend API tidak bisa diakses langsung dari luar (port 5005 tidak exposed)
- [ ] Environment variables tidak ter-commit ke git

### SSL/TLS (Jika Production)
- [ ] SSL certificate terinstall
- [ ] Certificate valid dan tidak expired
- [ ] HTTPS redirect berfungsi
- [ ] SSL labs test grade A atau B
- [ ] Auto-renewal dikonfigurasi

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Frontend bisa diakses dari browser
- [ ] URL `http://IP_VPS:9000` bisa dibuka
- [ ] Halaman login muncul
- [ ] Login dengan superadmin/admin123 berhasil
- [ ] Dashboard muncul setelah login
- [ ] Menu navigasi berfungsi

### API Testing
- [ ] Backend API response
- [ ] `curl http://localhost:5005/api/health` return OK
- [ ] API authentication berfungsi
- [ ] CORS configuration bekerja
- [ ] Socket.IO connection established

### Database Testing
- [ ] Database connection dari backend OK
- [ ] Query data berhasil
- [ ] Insert data berhasil
- [ ] Update data berhasil
- [ ] Delete data berhasil
- [ ] Triggers berfungsi (auto stock update)

### Real-time Features
- [ ] Socket.IO connection established
- [ ] Real-time notifications berfungsi
- [ ] Real-time data update berfungsi
- [ ] Multiple users bisa connect bersamaan

### Performance Testing
- [ ] Page load time < 3 detik
- [ ] API response time < 500ms
- [ ] Database query time acceptable
- [ ] No memory leaks
- [ ] CPU usage normal

---

## 💾 Backup & Recovery Checklist

### Backup Configuration
- [ ] Backup directory sudah dibuat
- [ ] Backup script sudah dibuat
- [ ] Backup script executable
- [ ] Test backup berhasil
- [ ] Backup file ter-compress dengan gzip
- [ ] Backup retention policy dikonfigurasi (7 hari)

### Automated Backup
- [ ] Cron job untuk backup sudah dikonfigurasi
- [ ] Cron job berjalan setiap hari
- [ ] Backup log file dibuat
- [ ] Email notification dikonfigurasi (optional)

### Recovery Testing
- [ ] Test restore dari backup berhasil
- [ ] Data integrity setelah restore OK
- [ ] Application berfungsi setelah restore

---

## 📊 Monitoring Checklist

### Container Monitoring
- [ ] `docker compose ps` menampilkan status
- [ ] `docker stats` menampilkan resource usage
- [ ] Container logs accessible
- [ ] Health checks configured

### System Monitoring
- [ ] Disk space monitoring
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring
- [ ] Network traffic monitoring

### Application Monitoring
- [ ] Error logs monitoring
- [ ] Access logs monitoring
- [ ] Performance metrics
- [ ] Uptime monitoring

### Alerting (Optional)
- [ ] Email alerts dikonfigurasi
- [ ] Slack/Discord webhook dikonfigurasi
- [ ] SMS alerts dikonfigurasi
- [ ] Alert thresholds dikonfigurasi

---

## 📝 Documentation Checklist

### Technical Documentation
- [ ] Deployment steps didokumentasikan
- [ ] Configuration didokumentasikan
- [ ] Environment variables didokumentasikan
- [ ] Network topology didokumentasikan
- [ ] Backup procedure didokumentasikan

### Operational Documentation
- [ ] Login credentials dicatat (di tempat aman)
- [ ] Server access information dicatat
- [ ] Emergency contacts dicatat
- [ ] Escalation procedure didokumentasikan
- [ ] Maintenance schedule didokumentasikan

### User Documentation
- [ ] User manual tersedia
- [ ] Admin guide tersedia
- [ ] FAQ tersedia
- [ ] Troubleshooting guide tersedia

---

## 🔄 Post-Deployment Checklist

### Immediate Actions (Day 1)
- [ ] Change default passwords
- [ ] Test all critical features
- [ ] Monitor logs for errors
- [ ] Verify backup is running
- [ ] Notify stakeholders deployment complete

### Short-term Actions (Week 1)
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Optimize slow queries
- [ ] Update documentation based on issues found

### Long-term Actions (Month 1)
- [ ] Review security logs
- [ ] Analyze performance trends
- [ ] Plan for scaling (if needed)
- [ ] Review backup retention
- [ ] Update dependencies

---

## 🆘 Emergency Contacts

```
VPS Provider Support: ___________________________
Domain Provider Support: ___________________________
Developer Contact: ___________________________
System Admin Contact: ___________________________
Emergency Hotline: ___________________________
```

---

## 📞 Important Information

```
VPS IP Address: ___________________________
Domain Name: ___________________________
SSH Port: ___________________________
SSH User: ___________________________

Application URL: ___________________________
Admin Username: ___________________________
Admin Email: ___________________________

Database Host: ___________________________
Database Name: ___________________________
Database User: ___________________________

Backup Location: ___________________________
Backup Schedule: ___________________________
```

---

## ✅ Final Verification

### Before Going Live
- [ ] All checklist items completed
- [ ] All tests passed
- [ ] Backup verified
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team trained
- [ ] Rollback plan ready

### Sign-off
```
Deployed by: ___________________________
Date: ___________________________
Time: ___________________________
Verified by: ___________________________
Approved by: ___________________________
```

---

## 📊 Deployment Status

| Phase | Status | Date | Notes |
|-------|--------|------|-------|
| Pre-deployment | ⬜ | | |
| Installation | ⬜ | | |
| Configuration | ⬜ | | |
| Deployment | ⬜ | | |
| Security | ⬜ | | |
| Testing | ⬜ | | |
| Backup | ⬜ | | |
| Monitoring | ⬜ | | |
| Documentation | ⬜ | | |
| Post-deployment | ⬜ | | |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 🎉 Deployment Complete!

Jika semua checklist sudah ✅, selamat! Aplikasi Anda sudah siap production.

**Next Steps:**
1. Monitor aplikasi selama 24 jam pertama
2. Siapkan on-call rotation
3. Schedule regular maintenance
4. Plan for future updates

---

**Print checklist ini dan gunakan saat deployment!**

*Last Updated: 2026-04-13*
