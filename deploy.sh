#!/bin/bash

# Script untuk deploy aplikasi warehouse ke VPS
# Usage: ./deploy.sh [start|stop|restart|logs|backup]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_env() {
    if [ ! -f .env ]; then
        print_error "File .env tidak ditemukan!"
        print_info "Copy .env.production ke .env dan isi dengan nilai yang sesuai"
        exit 1
    fi
}

start_app() {
    print_info "Starting aplikasi..."
    check_env
    docker-compose up -d --build
    print_success "Aplikasi berhasil dijalankan!"
    print_info "Akses aplikasi di: http://localhost"
    print_info "Backend API: http://localhost:5000"
}

stop_app() {
    print_info "Stopping aplikasi..."
    docker-compose down
    print_success "Aplikasi berhasil dihentikan!"
}

restart_app() {
    print_info "Restarting aplikasi..."
    docker-compose restart
    print_success "Aplikasi berhasil direstart!"
}

show_logs() {
    print_info "Menampilkan logs (Ctrl+C untuk keluar)..."
    docker-compose logs -f
}

show_status() {
    print_info "Status container:"
    docker-compose ps
}

backup_db() {
    print_info "Membuat backup database..."
    check_env
    
    # Load environment variables
    source .env
    
    # Create backup directory if not exists
    mkdir -p backups
    
    # Backup filename with timestamp
    BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Create backup
    docker-compose exec -T db mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_NAME} > ${BACKUP_FILE}
    
    print_success "Backup berhasil disimpan di: ${BACKUP_FILE}"
}

update_app() {
    print_info "Updating aplikasi..."
    
    # Pull latest changes if using git
    if [ -d .git ]; then
        print_info "Pulling latest changes from git..."
        git pull
    fi
    
    # Rebuild and restart
    docker-compose up -d --build
    
    print_success "Aplikasi berhasil diupdate!"
}

# Main script
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_db
        ;;
    update)
        update_app
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|status|backup|update}"
        echo ""
        echo "Commands:"
        echo "  start   - Build dan jalankan aplikasi"
        echo "  stop    - Hentikan aplikasi"
        echo "  restart - Restart aplikasi"
        echo "  logs    - Tampilkan logs aplikasi"
        echo "  status  - Tampilkan status container"
        echo "  backup  - Backup database"
        echo "  update  - Update dan rebuild aplikasi"
        exit 1
        ;;
esac

exit 0
