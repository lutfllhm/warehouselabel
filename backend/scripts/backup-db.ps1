# Contoh backup MySQL ke file .sql (sesuaikan PATH mysqldump jika perlu).
# Jalankan dari folder backend:  powershell -ExecutionPolicy Bypass -File scripts/backup-db.ps1

$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
  Write-Host "Buat file backend\.env dari .env.example dulu."
  exit 1
}

Get-Content $envPath | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    Set-Variable -Name ($matches[1].Trim()) -Value $matches[2].Trim() -Scope Script
  }
}

$dbName = if ($DB_NAME) { $DB_NAME } else { "warehouse_label" }
$host = if ($DB_HOST) { $DB_HOST } else { "localhost" }
$user = if ($DB_USER) { $DB_USER } else { "root" }
$pass = if ($DB_PASSWORD) { $DB_PASSWORD } else { "" }

$out = Join-Path $PSScriptRoot ("..\backup_{0:yyyyMMdd_HHmmss}.sql" -f (Get-Date))

$mysqldump = "mysqldump"
$args = @("-h", $host, "-u", $user)
if ($pass) { $args += @("-p$pass") }
$args += @("--single-transaction", "--routines", $dbName)

& $mysqldump @args | Out-File -FilePath $out -Encoding utf8
Write-Host "Backup disimpan: $out"
