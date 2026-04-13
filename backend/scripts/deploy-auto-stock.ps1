# ============================================
# Deploy Auto Stock Update Migration
# ============================================
# Script untuk deploy migration auto stock update
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Auto Stock Update - Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "warehouse_label"
$DB_USER = "root"
$MIGRATION_FILE = "../migrations/add_auto_stock_update.sql"
$TEST_FILE = "../migrations/test_auto_stock.sql"

# Prompt for password
Write-Host "📝 Database Configuration:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST"
Write-Host "   Port: $DB_PORT"
Write-Host "   Database: $DB_NAME"
Write-Host "   User: $DB_USER"
Write-Host ""

$DB_PASSWORD = Read-Host "Enter MySQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$DB_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: Backup Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$BACKUP_DIR = "../../backups"
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/backup_before_auto_stock_$TIMESTAMP.sql"

Write-Host "📦 Creating backup: $BACKUP_FILE" -ForegroundColor Yellow

try {
    $mysqldumpCmd = "mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME"
    Invoke-Expression $mysqldumpCmd | Out-File -FilePath $BACKUP_FILE -Encoding UTF8
    Write-Host "✅ Backup created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Backup failed: $_" -ForegroundColor Red
    Write-Host "⚠️  Continue anyway? (y/n)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "y") {
        Write-Host "Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: Deploy Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "🚀 Deploying auto stock update triggers..." -ForegroundColor Yellow

try {
    $mysqlCmd = "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME"
    Get-Content $MIGRATION_FILE | & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME
    Write-Host "✅ Migration deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    Write-Host "💡 Check the error message above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 3: Verify Triggers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "🔍 Checking installed triggers..." -ForegroundColor Yellow

$verifyQuery = @"
SELECT 
  TRIGGER_NAME,
  EVENT_MANIPULATION,
  EVENT_OBJECT_TABLE
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = '$DB_NAME'
ORDER BY EVENT_OBJECT_TABLE, EVENT_MANIPULATION;
"@

try {
    $verifyQuery | & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME
    Write-Host "✅ Triggers verified!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify triggers: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 4: Run Tests (Optional)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "🧪 Do you want to run automated tests? (y/n)" -ForegroundColor Yellow
$runTests = Read-Host

if ($runTests -eq "y") {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    try {
        Get-Content $TEST_FILE | & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_PLAIN $DB_NAME
        Write-Host "✅ Tests completed! Check output above." -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Tests failed: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Tests skipped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Auto Stock Update deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's Next:" -ForegroundColor Yellow
Write-Host "   1. Restart backend server: npm restart" -ForegroundColor White
Write-Host "   2. Test via frontend (add label masuk/keluar)" -ForegroundColor White
Write-Host "   3. Check stock updates automatically" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - PANDUAN-AUTO-STOCK.md" -ForegroundColor White
Write-Host "   - backend/migrations/AUTO_STOCK_UPDATE_README.md" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Backup Location:" -ForegroundColor Yellow
Write-Host "   $BACKUP_FILE" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
