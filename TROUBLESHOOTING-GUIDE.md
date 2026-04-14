# 🔧 Troubleshooting Guide - VPS KVM 2

Panduan lengkap mengatasi masalah yang sering terjadi saat deployment dan operasional.

---

## 📋 Daftar Isi

1. [Docker Issues](#docker-issues)
2. [Database Issues](#database-issues)
3. [Backend Issues](#backend-issues)
4. [Frontend Issues](#frontend-issues)
5. [Network Issues](#network-issues)
6. [SSL/HTTPS Issues](#sslhttps-issues)
7. [Performance Issues](#performance-issues)
8. [Security Issues](#security-issues)
9. [Backup & Recovery Issues](#backup--recovery-issues)
10. [Common Error Messages](#common-error-messages)

---

## 🐳 Docker Issues

### Issue: Cannot connect to Docker daemon

**Symptoms:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solutions:**

```bash
# 1. Check Docker service status
sudo systemctl status docker

# 2. Start Docker service
sudo systemctl start docker

# 3. Enable Docker on boot
sudo systemctl enable docker

# 4. Add user to docker group
sudo usermod -aG docker $USER

# 5. Logout and login again
exit
# Login kembali ke VPS

# 6. Verify
docker ps
```

---

### Issue: Port already in use

**Symptoms:**
```
Error starting userland proxy: listen tcp 0.0.0.0:9000: bind: address already in use
```

**Solutions:**

```bash
# 1. Check what's using the port
sudo netstat -tulpn | grep :9000

# 2. Kill the process
sudo kill -9 PID

# 3. Or change port in docker-compose.yml
nano docker-compose.yml
# Change: "9000:80" to "9001:80"

# 4. Restart services
docker compose down
docker compose up -d
```

---

### Issue: Container keeps restarting

**Symptoms:**
```
Container status shows "Restarting" continuously
```

**Solutions:**

```bash
# 1. Check logs
docker compose logs CONTAINER_NAME

# 2. Check last 100 lines
docker compose logs --tail=100 CONTAINER_NAME

# 3. Stop container
docker compose stop CONTAINER_NAME

# 4. Remove container
docker compose rm CONTAINER_NAME

# 5. Rebuild and start
docker compose up -d --build CONTAINER_NAME

# 6. Check configuration
nano docker-compose.yml
```

---

### Issue: Out of disk space

**Symptoms:**
```
no space left on device
```

**Solutions:**

```bash
# 1. Check disk usage
df -h

# 2. Check Docker disk usage
docker system df

# 3. Clean unused Docker resources
docker system prune -a

# 4. Remove unused volumes
docker volume prune

# 5. Clean old images
docker image prune -a

# 6. Clean logs
sudo journalctl --vacuum-time=3d

# 7. Clean old backups
find ~/backups -name "*.sql.gz" -mtime +30 -delete
```

---

### Issue: Build fails with memory error

**Symptoms:**
```
ERROR: failed to solve: process "/bin/sh -c npm install" did not complete successfully
```

**Solutions:**

```bash
# 1. Check available memory
free -h

# 2. Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 3. Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 4. Verify swap
free -h

# 5. Rebuild
docker compose build --no-cache
```

---

## 🗄️ Database Issues

### Issue: Database connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**

```bash
# 1. Check database container
docker compose ps db

# 2. Check database logs
docker compose logs db

# 3. Wait for database to be ready
sleep 30

# 4. Check database health
docker exec warehouse_db mysqladmin ping -h localhost -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# 5. Restart database
docker compose restart db

# 6. Check network
docker network inspect warehouse_warehouse_network
```

---

### Issue: Access denied for user

**Symptoms:**
```
ERROR 1045 (28000): Access denied for user 'warehouse_user'@'localhost'
```

**Solutions:**

```bash
# 1. Verify credentials in .env
cat .env | grep DB_

# 2. Login as root
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)

# 3. Check user permissions (in MySQL)
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'warehouse_user'@'%';

# 4. Recreate user if needed (in MySQL)
DROP USER IF EXISTS 'warehouse_user'@'%';
CREATE USER 'warehouse_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON warehouse_label.* TO 'warehouse_user'@'%';
FLUSH PRIVILEGES;
EXIT;

# 5. Restart backend
docker compose restart backend
```

---

### Issue: Table doesn't exist

**Symptoms:**
```
Error: Table 'warehouse_label.users' doesn't exist
```

**Solutions:**

```bash
# 1. Check if database exists
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "SHOW DATABASES;"

# 2. Check tables
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "USE warehouse_label; SHOW TABLES;"

# 3. Re-import schema
cd ~/warehouse-label
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} warehouse_label < backend/schema.sql

# 4. Verify tables
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "USE warehouse_label; SHOW TABLES;"
```

---

### Issue: Database is slow

**Symptoms:**
- Queries taking too long
- Application timeout

**Solutions:**

```bash
# 1. Check database size
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) << 'EOF'
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'warehouse_label'
GROUP BY table_schema;
EOF

# 2. Optimize tables
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) << 'EOF'
USE warehouse_label;
OPTIMIZE TABLE material_stocks;
OPTIMIZE TABLE label_stocks;
OPTIMIZE TABLE transaksi_masuk;
OPTIMIZE TABLE transaksi_keluar;
ANALYZE TABLE material_stocks;
ANALYZE TABLE label_stocks;
EOF

# 3. Check slow queries
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "SHOW PROCESSLIST;"

# 4. Restart database
docker compose restart db
```

---

## 🔧 Backend Issues

### Issue: Backend not starting

**Symptoms:**
```
Backend container exits immediately
```

**Solutions:**

```bash
# 1. Check logs
docker compose logs backend

# 2. Check environment variables
docker exec warehouse_backend env | grep DB_

# 3. Test database connection
docker exec warehouse_backend node -e "const mysql = require('mysql2'); const conn = mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME}); conn.connect(err => {if(err) console.error(err); else console.log('Connected'); conn.end();});"

# 4. Rebuild backend
docker compose stop backend
docker compose rm backend
docker compose up -d --build backend

# 5. Check logs again
docker compose logs -f backend
```

---

### Issue: JWT authentication fails

**Symptoms:**
```
Error: jwt malformed
Error: invalid signature
```

**Solutions:**

```bash
# 1. Check JWT_SECRET in .env
cat .env | grep JWT_SECRET

# 2. Ensure JWT_SECRET is at least 32 characters
echo "JWT_SECRET=$(openssl rand -base64 48)" >> .env

# 3. Restart backend
docker compose restart backend

# 4. Clear browser cookies/localStorage
# In browser console:
# localStorage.clear();
# location.reload();
```

---

### Issue: CORS error

**Symptoms:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions:**

```bash
# 1. Check CORS_ORIGIN in .env
cat .env | grep CORS_ORIGIN

# 2. Update CORS_ORIGIN
nano .env
# Set: CORS_ORIGIN=http://YOUR_IP:9000
# Or: CORS_ORIGIN=https://your-domain.com

# 3. Restart backend
docker compose restart backend

# 4. Check backend logs
docker compose logs backend | grep CORS

# 5. Test from browser console
# fetch('http://YOUR_IP:5005/api/health').then(r => r.json()).then(console.log)
```

---

### Issue: Socket.IO not connecting

**Symptoms:**
```
WebSocket connection failed
Socket.IO connection error
```

**Solutions:**

```bash
# 1. Check backend logs
docker compose logs backend | grep socket

# 2. Check nginx configuration
cat nginx.conf | grep socket.io

# 3. Test Socket.IO endpoint
curl http://localhost:5005/socket.io/

# 4. Restart services
docker compose restart backend frontend

# 5. Check browser console for errors
# Open browser DevTools > Console
```

---

## 🌐 Frontend Issues

### Issue: Frontend shows blank page

**Symptoms:**
- White screen
- No content displayed

**Solutions:**

```bash
# 1. Check frontend logs
docker compose logs frontend

# 2. Check nginx logs
docker exec warehouse_frontend cat /var/log/nginx/error.log

# 3. Check if files exist
docker exec warehouse_frontend ls -la /usr/share/nginx/html/

# 4. Rebuild frontend
docker compose stop frontend
docker compose rm frontend
docker compose up -d --build frontend

# 5. Check browser console
# Open browser DevTools > Console
# Look for JavaScript errors
```

---

### Issue: API calls failing from frontend

**Symptoms:**
```
Network Error
Failed to fetch
```

**Solutions:**

```bash
# 1. Check nginx proxy configuration
cat nginx.conf | grep "location /api"

# 2. Test API from inside frontend container
docker exec warehouse_frontend wget -O- http://warehouse_backend:5000/api/health

# 3. Check backend is accessible
docker compose ps backend

# 4. Check network
docker network inspect warehouse_warehouse_network

# 5. Restart services
docker compose restart backend frontend
```

---

### Issue: Static files not loading

**Symptoms:**
- Images not showing
- CSS not applied
- JS not loading

**Solutions:**

```bash
# 1. Check if files exist
docker exec warehouse_frontend ls -la /usr/share/nginx/html/assets/

# 2. Check nginx configuration
docker exec warehouse_frontend cat /etc/nginx/conf.d/default.conf

# 3. Check file permissions
docker exec warehouse_frontend ls -la /usr/share/nginx/html/

# 4. Rebuild with no cache
docker compose build --no-cache frontend
docker compose up -d frontend

# 5. Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

---

## 🌍 Network Issues

### Issue: Cannot access from external IP

**Symptoms:**
- Works on localhost
- Doesn't work from external IP

**Solutions:**

```bash
# 1. Check firewall
sudo ufw status

# 2. Allow port 9000
sudo ufw allow 9000/tcp

# 3. Check if port is listening
sudo netstat -tulpn | grep :9000

# 4. Check Docker port mapping
docker compose ps

# 5. Test from VPS
curl http://localhost:9000

# 6. Test from external
# From your computer:
# curl http://VPS_IP:9000
```

---

### Issue: Timeout connecting to VPS

**Symptoms:**
```
Connection timed out
```

**Solutions:**

```bash
# 1. Check VPS is running
ping VPS_IP

# 2. Check SSH access
ssh user@VPS_IP

# 3. Check firewall rules
sudo ufw status verbose

# 4. Check if service is running
docker compose ps

# 5. Check VPS provider firewall
# Login to VPS provider dashboard
# Check security groups / firewall rules
```

---

### Issue: DNS not resolving

**Symptoms:**
```
Domain not found
DNS_PROBE_FINISHED_NXDOMAIN
```

**Solutions:**

```bash
# 1. Check DNS records
nslookup your-domain.com

# 2. Check DNS propagation
# Visit: https://dnschecker.org

# 3. Wait for DNS propagation (up to 48 hours)

# 4. Use IP address temporarily
http://VPS_IP:9000

# 5. Clear DNS cache
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

---

## 🔐 SSL/HTTPS Issues

### Issue: Certificate not valid

**Symptoms:**
```
NET::ERR_CERT_AUTHORITY_INVALID
Your connection is not private
```

**Solutions:**

```bash
# 1. Check certificate
sudo certbot certificates

# 2. Renew certificate
sudo certbot renew

# 3. Check certificate files
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# 4. Check nginx SSL configuration
cat nginx.conf | grep ssl

# 5. Test SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# 6. Restart frontend
docker compose restart frontend
```

---

### Issue: Certificate expired

**Symptoms:**
```
NET::ERR_CERT_DATE_INVALID
```

**Solutions:**

```bash
# 1. Check certificate expiry
sudo certbot certificates

# 2. Renew certificate
sudo certbot renew --force-renewal

# 3. Restart frontend
docker compose restart frontend

# 4. Setup auto-renewal
sudo crontab -e
# Add: 0 2 * * * certbot renew --quiet --post-hook "docker compose -f /home/deployer/warehouse-label/docker-compose.yml restart frontend"
```

---

### Issue: Mixed content warning

**Symptoms:**
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Solutions:**

```bash
# 1. Update CORS_ORIGIN to HTTPS
nano .env
# Set: CORS_ORIGIN=https://your-domain.com

# 2. Update API base URL in frontend
# Check frontend/.env.production

# 3. Restart services
docker compose restart backend frontend

# 4. Clear browser cache
```

---

## ⚡ Performance Issues

### Issue: High CPU usage

**Symptoms:**
- Server slow
- High load average

**Solutions:**

```bash
# 1. Check CPU usage
top
htop

# 2. Check Docker stats
docker stats

# 3. Check which container uses most CPU
docker stats --no-stream

# 4. Check backend logs for errors
docker compose logs backend | grep -i error

# 5. Optimize database queries
# See Database Issues > Database is slow

# 6. Restart services
docker compose restart

# 7. Consider upgrading VPS
```

---

### Issue: High memory usage

**Symptoms:**
- Out of memory errors
- Swap usage high

**Solutions:**

```bash
# 1. Check memory usage
free -h

# 2. Check Docker memory usage
docker stats

# 3. Add memory limits to docker-compose.yml
nano docker-compose.yml
# Add under each service:
#   deploy:
#     resources:
#       limits:
#         memory: 512M

# 4. Restart services
docker compose down
docker compose up -d

# 5. Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

### Issue: Slow page load

**Symptoms:**
- Pages take long to load
- Timeout errors

**Solutions:**

```bash
# 1. Check network latency
ping VPS_IP

# 2. Enable gzip in nginx (already enabled in nginx.conf)
cat nginx.conf | grep gzip

# 3. Optimize database
# See Database Issues > Database is slow

# 4. Check backend response time
time curl http://localhost:5005/api/health

# 5. Check frontend build
docker compose logs frontend | grep build

# 6. Clear browser cache
```

---

## 🛡️ Security Issues

### Issue: Brute force attacks on SSH

**Symptoms:**
- Many failed login attempts in logs

**Solutions:**

```bash
# 1. Install fail2ban
sudo apt install -y fail2ban

# 2. Configure fail2ban
sudo nano /etc/fail2ban/jail.local
# Add:
# [sshd]
# enabled = true
# port = 22
# maxretry = 3
# bantime = 3600

# 3. Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 4. Check banned IPs
sudo fail2ban-client status sshd

# 5. Change SSH port (optional)
sudo nano /etc/ssh/sshd_config
# Change: Port 22 to Port 2222
sudo systemctl restart sshd
sudo ufw allow 2222/tcp
```

---

### Issue: Unauthorized database access attempts

**Symptoms:**
- Unknown connections to database

**Solutions:**

```bash
# 1. Don't expose database port externally
# Remove from docker-compose.yml:
# ports:
#   - "3005:3306"

# 2. Use strong passwords
# Regenerate passwords in .env

# 3. Restart database
docker compose down db
docker compose up -d db

# 4. Check database logs
docker compose logs db | grep -i "access denied"
```

---

## 💾 Backup & Recovery Issues

### Issue: Backup fails

**Symptoms:**
```
mysqldump: Error: Access denied
```

**Solutions:**

```bash
# 1. Check database is running
docker compose ps db

# 2. Check credentials
cat .env | grep DB_ROOT_PASSWORD

# 3. Test mysqldump
docker exec warehouse_db mysqldump -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) warehouse_label > test_backup.sql

# 4. Check disk space
df -h

# 5. Check backup directory permissions
ls -la ~/backups/
mkdir -p ~/backups
chmod 755 ~/backups
```

---

### Issue: Restore fails

**Symptoms:**
```
ERROR: Unknown database 'warehouse_label'
```

**Solutions:**

```bash
# 1. Create database if not exists
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "CREATE DATABASE IF NOT EXISTS warehouse_label;"

# 2. Decompress backup
gunzip backup.sql.gz

# 3. Restore
docker exec -i warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) warehouse_label < backup.sql

# 4. Verify
docker exec -it warehouse_db mysql -u root -p$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2) -e "USE warehouse_label; SHOW TABLES;"
```

---

## ❌ Common Error Messages

### "Cannot find module"

```bash
# Solution: Rebuild with no cache
docker compose build --no-cache
docker compose up -d
```

### "EADDRINUSE: address already in use"

```bash
# Solution: Change port or kill process
sudo netstat -tulpn | grep :PORT
sudo kill -9 PID
```

### "permission denied"

```bash
# Solution: Fix permissions
sudo chown -R $USER:$USER ~/warehouse-label
chmod +x script.sh
```

### "no space left on device"

```bash
# Solution: Clean up
docker system prune -a
sudo apt autoremove -y
sudo apt clean
```

### "connection refused"

```bash
# Solution: Check service is running
docker compose ps
docker compose restart
```

---

## 🆘 Emergency Recovery

### Complete System Reset

```bash
# WARNING: This will delete all data!

# 1. Stop all containers
cd ~/warehouse-label
docker compose down -v

# 2. Remove all containers
docker rm -f $(docker ps -aq)

# 3. Remove all images
docker rmi -f $(docker images -q)

# 4. Remove all volumes
docker volume rm $(docker volume ls -q)

# 5. Clean system
docker system prune -a --volumes

# 6. Start fresh
docker compose up -d --build

# 7. Import schema
DB_ROOT_PASSWORD=$(grep DB_ROOT_PASSWORD .env | cut -d '=' -f2)
docker exec -i warehouse_db mysql -u root -p${DB_ROOT_PASSWORD} warehouse_label < backend/schema.sql
```

---

## 📞 Getting Help

### Collect Information

Before asking for help, collect this information:

```bash
# System info
uname -a
cat /etc/os-release

# Docker info
docker --version
docker compose version
docker compose ps
docker compose logs --tail=100

# Resource usage
free -h
df -h
docker stats --no-stream

# Network
sudo netstat -tulpn
sudo ufw status

# Save to file
{
  echo "=== System Info ==="
  uname -a
  echo ""
  echo "=== Docker Info ==="
  docker --version
  docker compose ps
  echo ""
  echo "=== Logs ==="
  docker compose logs --tail=50
} > ~/debug-info.txt

# Send debug-info.txt when asking for help
```

---

**Jika masalah masih berlanjut, hubungi tim support dengan menyertakan file debug-info.txt**

*Last Updated: 2026-04-13*
