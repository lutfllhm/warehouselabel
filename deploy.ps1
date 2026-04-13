# PowerShell script untuk deploy aplikasi warehouse
# Usage: .\deploy.ps1 [start|stop|restart|logs|backup|status|update]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('start','stop','restart','logs','status','backup','update')]
    [string]$Action
)

# Colors
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Yellow
}

# Check if .env exists
function Check-Env {
    if (-not (Test-Path ".env")) {
        Write-Error "File .env tidak ditemukan!"
        Write-Info "Copy .env.production ke .env dan isi dengan nilai yang sesuai"
        exit 1
    }
}

# Start application
function Start-App {
    Write-Info "Starting aplikasi..."
    Check-Env
    docker-compose up -d --build
    Write-Success "Aplikasi berhasil dijalankan!"
    Write-Info "Akses aplikasi di: http://localhost"
    Write-Info "Backend API: http://localhost:5000"
}

# Stop application
function Stop-App {
    Write-Info "Stopping aplikasi..."
    docker-compose down
    Write-Success "Aplikasi berhasil dihentikan!"
}

# Restart application
function Restart-App {
    Write-Info "Restarting aplikasi..."
    docker-compose restart
    Write-Success "Aplikasi berhasil direstart!"
}

# Show logs
function Show-Logs {
    Write-Info "Menampilkan logs (Ctrl+C untuk keluar)..."
    docker-compose logs -f
}

# Show status
function Show-Status {
    Write-Info "Status container:"
    docker-compose ps
}

# Backup database
function Backup-Database {
    Write-Info "Membuat backup database..."
    Check-Env
    
    # Load environment variables
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            Set-Variable -Name $matches[1] -Value $matches[2] -Scope Script
        }
    }
    
    # Create backup directory if not exists
    if (-not (Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" | Out-Null
    }
    
    # Backup filename with timestamp
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backups/backup_$timestamp.sql"
    
    # Create backup
    docker-compose exec -T db mysqldump -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" | Out-File -FilePath $backupFile -Encoding UTF8
    
    Write-Success "Backup berhasil disimpan di: $backupFile"
}

# Update application
function Update-App {
    Write-Info "Updating aplikasi..."
    
    # Pull latest changes if using git
    if (Test-Path ".git") {
        Write-Info "Pulling latest changes from git..."
        git pull
    }
    
    # Rebuild and restart
    docker-compose up -d --build
    
    Write-Success "Aplikasi berhasil diupdate!"
}

# Main script
switch ($Action) {
    'start' { Start-App }
    'stop' { Stop-App }
    'restart' { Restart-App }
    'logs' { Show-Logs }
    'status' { Show-Status }
    'backup' { Backup-Database }
    'update' { Update-App }
}
