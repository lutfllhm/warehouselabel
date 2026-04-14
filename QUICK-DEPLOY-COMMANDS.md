# ⚡ Quick Deploy Commands - Copy & Paste

Kumpulan command yang bisa langsung di-copy paste untuk deploy cepat.

---

## 🚀 Full Deployment (Copy Semua)

```bash
# ============================================
# 1. UPDATE SISTEM
# ============================================
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano ufw net-tools

# ============================================
# 2. INSTALL DOCKER
# ============================================
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# ============================================
# 3. CLONE REPOSITORY
# ============================================
cd ~
git clone https://github.com/username/warehouse-label.git
cd warehouse-label

# ============================================
# 4. SETUP ENVIRONMENT
# ============================================
cp .env.production .env

# Generate passwords
echo "DB_ROOT_PASSWORD=$(openssl rand -base64 32)"
echo "DB_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 48)"

# Edit .env dengan password yang di-generate
nano .env

# ============================================
# 5. DEPLOY DATABASE
# ============================================
docker compose up -d db
sleep 30

# Import schema
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} warehouse_label < backend/schema.sql

# ============================================
# 6. DEPLOY ALL SERVICES
# ============================================
docker compose up -d --build

# ============================================
# 7. SETUP FIREWALL
# ============================================
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 9000/tcp
sudo ufw --force enable

# ============================================
# 8. VERIFY DEPLOYMENT
# ============================================
docker compose ps
docker compose logs -f
```

---

## 🔄 Update Aplikasi

```bash
cd ~/warehouse-label
git pull origin main
docker compose down
docker compose up -d --build
docker compose logs -f
```

---

## 💾 Backup Database

```bash
# One-time backup
cd ~/warehouse-label
mkdir -p ~/backups
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
docker exec warehouse_db mysqldump -u root -p${DB_ROOT_PASSWORD} warehouse_label | gzip > ~/backups/warehouse_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 🔙 Restore Database

```bash
# List backups
ls -lh ~/backups/

# Restore (ganti dengan nama file backup Anda)
cd ~/warehouse-label
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
gunzip -c ~/backups/warehouse_20260413_030000.sql.gz | docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} warehouse_label
```

---

## 🔍 Monitoring Commands

```bash
# Status containers
docker compose ps

# Logs semua services
docker compose logs -f

# Logs specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Resource usage
docker stats

# Disk space
df -h
docker system df
```

---

## 🛠️ Troubleshooting Commands

```bash
# Restart semua services
docker compose restart

# Restart specific service
docker compose restart backend

# Stop semua services
docker compose down

# Start dengan rebuild
docker compose up -d --build

# Cek port yang digunakan
sudo netstat -tulpn | grep :9000

# Masuk ke container
docker exec -it warehouse_backend sh
docker exec -it warehouse_frontend sh
docker exec -it warehouse_db bash

# Masuk ke MySQL
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# Clean Docker
docker system prune -a
```

---

## 🔐 SSL Setup (Let's Encrypt)

```bash
# Install Certbot
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Stop frontend
cd ~/warehouse-label
docker compose stop frontend

# Generate certificate (ganti domain)
sudo certbot certonly --standalone -d warehouse.yourdomain.com

# Update firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Setup auto-renewal
sudo crontab -e
# Tambahkan:
# 0 2 * * * certbot renew --quiet --post-hook "docker compose -f /home/deployer/warehouse-label/docker-compose.yml restart frontend"

# Restart services
docker compose up -d --build
```

---

## 📊 Automated Backup Script

```bash
# Create backup script
cat > ~/backup-warehouse.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR
cd ~/warehouse-label
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
BACKUP_FILE="$BACKUP_DIR/warehouse_$(date +%Y%m%d_%H%M%S).sql"
docker exec warehouse_db mysqldump -u root -p$DB_ROOT_PASSWORD warehouse_label > $BACKUP_FILE
gzip $BACKUP_FILE
find $BACKUP_DIR -name "warehouse_*.sql.gz" -mtime +7 -delete
echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

# Make executable
chmod +x ~/backup-warehouse.sh

# Test
~/backup-warehouse.sh

# Setup cron (backup setiap hari jam 3 pagi)
crontab -e
# Tambahkan:
# 0 3 * * * /home/deployer/backup-warehouse.sh >> /home/deployer/backup.log 2>&1
```

---

## 🔒 Security Hardening

```bash
# Disable root login via SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Setup firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 9000/tcp
sudo ufw --force enable
sudo ufw status verbose
```

---

## 📈 Performance Optimization

```bash
# Optimize MySQL
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD ~/warehouse-label/.env | cut -d '=' -f2) << 'EOF'
USE warehouse_label;
OPTIMIZE TABLE material_stocks;
OPTIMIZE TABLE label_stocks;
OPTIMIZE TABLE transaksi_masuk;
OPTIMIZE TABLE transaksi_keluar;
ANALYZE TABLE material_stocks;
ANALYZE TABLE label_stocks;
EXIT;
EOF

# Clean Docker
docker system prune -a --volumes

# Clean logs
sudo journalctl --vacuum-time=7d

# Restart services
cd ~/warehouse-label
docker compose restart
```

---

## 🧪 Testing Commands

```bash
# Test backend API
curl http://localhost:5005/api/health

# Test frontend
curl http://localhost:9000

# Test database connection
docker exec warehouse_db mysqladmin ping -h localhost -u root -p$(grep DB_ROOT_PASSWORD ~/warehouse-label/.env | cut -d '=' -f2)

# Test from external
curl http://IP_VPS_ANDA:9000
```

---

## 📱 Monitoring Setup (Portainer)

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

# Allow port
sudo ufw allow 9443/tcp

# Access: https://IP_VPS_ANDA:9443
```

---

## 🆘 Emergency Commands

```bash
# Stop everything
cd ~/warehouse-label
docker compose down

# Remove all containers and volumes (HATI-HATI!)
docker compose down -v

# Start fresh
docker compose up -d --build

# Check Docker daemon
sudo systemctl status docker
sudo systemctl restart docker

# Check disk space
df -h

# Free up space
docker system prune -a --volumes
sudo apt autoremove -y
sudo apt clean
```

---

## 📝 Useful Aliases

Tambahkan ke `~/.bashrc`:

```bash
# Edit bashrc
nano ~/.bashrc

# Tambahkan di akhir file:
alias dc='docker compose'
alias dps='docker compose ps'
alias dlogs='docker compose logs -f'
alias dup='docker compose up -d'
alias ddown='docker compose down'
alias drestart='docker compose restart'
alias drebuild='docker compose up -d --build'
alias wh='cd ~/warehouse-label'

# Reload bashrc
source ~/.bashrc
```

Sekarang bisa pakai command pendek:
```bash
wh              # cd ke warehouse-label
dps             # docker compose ps
dlogs           # docker compose logs -f
dup             # docker compose up -d
drebuild        # docker compose up -d --build
```

---

## 🎯 Daily Operations

```bash
# Morning check
cd ~/warehouse-label
docker compose ps
docker stats --no-stream
df -h

# View logs
docker compose logs --tail=100 -f

# Restart if needed
docker compose restart

# Update aplikasi
git pull origin main
docker compose up -d --build
```

---

**Tips:** Simpan file ini dan gunakan sebagai quick reference saat maintenance!
