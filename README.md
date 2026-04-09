# Warehouse Label App (React + Express + MySQL)

Project ini berisi fondasi aplikasi warehouse label B2B:

- Frontend: React.js + Tailwind CSS + Framer Motion + Recharts
- Backend: Express.js + MySQL (phpMyAdmin) + JWT auth
- Database schema tersedia di `backend/schema.sql`

## Struktur

- `frontend` -> UI homepage, login, dashboard, dan menu utama
- `backend` -> REST API untuk auth, stock material, stock label, dan summary dashboard
- `format` -> tempat file format LPS/SJ dari Anda
- `img` -> tempat gambar company profile dan logo

## Setup Backend

1. Masuk ke folder `backend`
2. Copy `.env.example` menjadi `.env`
3. Buat database melalui phpMyAdmin lalu jalankan `schema.sql`
4. Tambahkan user default:

```sql
INSERT INTO users (username, password_hash, role)
VALUES ('admin', '$2b$10$uFbdLRAu6M3X7lPW1i0w8unewr1m2jrA8JzH3F5nYfQxWJ8mYlA3C', 'admin');
```

Password default hash di atas untuk: `admin123`

5. Jalankan:

```bash
npm install
npm run dev
```

## Setup Frontend

1. Masuk ke folder `frontend`
2. (Disarankan) Salin gambar dari folder `img/` proyek ke `frontend/public/img/` — nama file contoh: `rbm.png`, `1.png` … `8.png` untuk galeri homepage.
3. Jalankan:

```bash
npm install
npm run dev
```

Saat development, permintaan ke `/api` di-proxy ke `http://localhost:5000` (lihat `frontend/vite.config.js`). Pastikan backend sudah jalan di port 5000.

**Halaman / URL utama**

| URL | Keterangan |
|-----|------------|
| `/` | Beranda (homepage) |
| `/login` | Login |
| `/app/dashboard` | Dashboard ringkasan |
| `/app/material` | Stock material |
| `/app/label` | Stock label |
| `/app/kategori` | Kategori material |
| `/app/transaksi` | Label masuk & keluar |
| `/app/dokumen` | LPS & SJ |
| `/app/users` | Manajemen user |
| `/app/backup` | Backup (log) |
| `/app/setting` | Password & setting key/value |

Akun seed database (setelah import `backend/schema.sql`):

- **superadmin** / **superadmin123**

## Catatan Lanjutan

- Form detail LPS/SJ bisa diselaraskan lagi dengan file di folder `format/` bila sudah dilampirkan.
- Backup dari menu aplikasi saat ini mencatat log entri backup. Untuk file dump MySQL (.sql) gunakan skrip: `powershell -ExecutionPolicy Bypass -File backend/scripts/backup-db.ps1` (pastikan `mysqldump` ada di PATH dan `backend/.env` sudah benar).
