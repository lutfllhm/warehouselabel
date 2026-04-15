# Role-Based Access Control

## Ringkasan Perubahan

Sistem sekarang memiliki kontrol akses berbasis role untuk halaman **Manajemen User** dan **Backup Database**. Hanya user dengan role `superadmin` yang dapat mengakses kedua halaman tersebut.

## Perubahan Backend

### File: `backend/src/server.js`

1. **Middleware baru `requireSuperAdmin`**:
   - Middleware ini memeriksa apakah user memiliki role `superadmin`
   - Jika bukan superadmin, akan mengembalikan error 403 (Forbidden)

2. **Endpoint yang dilindungi**:
   - `GET /api/users` - Hanya superadmin
   - `POST /api/users` - Hanya superadmin
   - `PUT /api/users/:id` - Hanya superadmin
   - `DELETE /api/users/:id` - Hanya superadmin
   - `GET /api/backups` - Hanya superadmin
   - `POST /api/backups` - Hanya superadmin

## Perubahan Frontend

### File: `frontend/src/constants/app.js`

1. **Menambahkan flag `requireSuperAdmin`** pada menu Users dan Backup:
   ```javascript
   { key: "users", label: "Manajemen User", icon: Users, requireSuperAdmin: true },
   { key: "backup", label: "Backup Database", icon: Database, requireSuperAdmin: true },
   ```

2. **Fungsi `getFilteredMenus(userRole)`**:
   - Filter menu berdasarkan role user
   - Jika bukan superadmin, menu dengan `requireSuperAdmin: true` akan disembunyikan

### File: `frontend/src/components/admin/AdminSidebar.jsx`

1. **Menambahkan prop `userRole`**:
   - Sidebar sekarang menerima prop `userRole`
   - Menggunakan `getFilteredMenus(userRole)` untuk menampilkan menu yang sesuai

### File: `frontend/src/layouts/AdminLayout.jsx`

1. **Proteksi routing**:
   - Jika non-superadmin mencoba akses `/app/users` atau `/app/backup`, akan di-redirect ke `/app/dashboard`

2. **Conditional API loading**:
   - API `/users` dan `/backups` hanya dipanggil jika user adalah superadmin
   - Menghindari error 403 saat loading data

## Role yang Tersedia

- **superadmin**: Akses penuh ke semua fitur termasuk Manajemen User dan Backup Database
- **admin**: Akses ke semua fitur kecuali Manajemen User dan Backup Database
- **operator**: Akses ke semua fitur kecuali Manajemen User dan Backup Database

## Testing

Untuk menguji fitur ini:

1. Login sebagai user dengan role `admin` atau `operator`
   - Menu "Manajemen User" dan "Backup Database" tidak akan muncul di sidebar
   - Jika mencoba akses langsung via URL, akan di-redirect ke dashboard

2. Login sebagai user dengan role `superadmin`
   - Semua menu termasuk "Manajemen User" dan "Backup Database" akan muncul
   - Dapat mengakses dan mengelola users dan backup

## Keamanan

- **Backend protection**: Endpoint dilindungi dengan middleware, tidak bisa diakses meskipun request dikirim langsung
- **Frontend protection**: Menu disembunyikan dan routing dilindungi untuk UX yang lebih baik
- **Token-based**: Semua request menggunakan JWT token yang berisi informasi role user
