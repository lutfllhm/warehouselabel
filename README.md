## Catatan Lanjutan

- Form detail LPS/SJ bisa diselaraskan lagi dengan file di folder `format/` bila sudah dilampirkan.
- Backup dari menu aplikasi saat ini mencatat log entri backup. Untuk file dump MySQL (.sql) gunakan skrip: `powershell -ExecutionPolicy Bypass -File backend/scripts/backup-db.ps1` (pastikan `mysqldump` ada di PATH dan `backend/.env` sudah benar).
