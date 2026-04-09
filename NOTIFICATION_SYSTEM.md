# Sistem Notifikasi Real-time

Sistem notifikasi yang menampilkan aktivitas semua user (tambah/edit/hapus data) di aplikasi warehouse.

## Fitur

### ✅ Yang Sudah Diimplementasikan:

1. **Database Table**
   - Tabel `notifications` untuk menyimpan log aktivitas
   - Fields: user_id, username, action_type, entity_type, entity_name, message, is_read, created_at

2. **Backend API Endpoints**
   - `GET /api/notifications` - Ambil daftar notifikasi (limit 20)
   - `GET /api/notifications/unread-count` - Hitung notifikasi belum dibaca
   - `PUT /api/notifications/:id/read` - Tandai notifikasi sudah dibaca
   - `PUT /api/notifications/mark-all-read` - Tandai semua sudah dibaca
   - `DELETE /api/notifications/:id` - Hapus notifikasi

3. **Logging Aktivitas**
   - ✅ Material Stocks (create, update, delete)
   - ⏳ Label Stocks (perlu ditambahkan)
   - ⏳ Categories (perlu ditambahkan)
   - ⏳ Transactions In/Out (perlu ditambahkan)
   - ⏳ Documents LPS/SJ (perlu ditambahkan)
   - ⏳ Users (perlu ditambahkan)

4. **Frontend Component**
   - `NotificationBell.jsx` - Komponen bell icon dengan dropdown
   - Badge merah untuk unread count
   - Auto-refresh setiap 30 detik
   - Mark as read / Mark all as read
   - Delete notification
   - Color coding berdasarkan action type:
     - 🟢 Create (emerald)
     - 🔵 Update (sky)
     - 🔴 Delete (rose)

5. **Integrasi**
   - NotificationBell ditambahkan di AdminHeader
   - Muncul di semua halaman admin

## Cara Setup

### 1. Database Migration

Jalankan migration untuk membuat tabel notifications:

```bash
cd backend
mysql -u root -p warehouse_label < migration_notifications.sql
```

### 2. Start Backend

```bash
cd backend
npm run dev
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

## Cara Menambahkan Logging ke Endpoint Lain

Untuk menambahkan logging notifikasi ke endpoint yang belum ada, gunakan pattern ini:

```javascript
// Di dalam endpoint handler (POST/PUT/DELETE)
const username = req.user?.username || "Unknown";
await createNotification(
  req.user?.id || 0,
  username,
  "create", // atau "update" atau "delete"
  "Entity Type", // contoh: "Stock Label", "Kategori", dll
  entityName, // nama item yang dimodifikasi
  `${username} menambahkan/mengupdate/menghapus [entity]`
);
```

### Contoh untuk Label Stocks:

```javascript
app.post("/api/label-stocks", async (req, res) => {
  try {
    const { nama_item, ...otherFields } = req.body;
    
    // ... insert query ...
    
    // Log notification
    const username = req.user?.username || "Unknown";
    await createNotification(
      req.user?.id || 0,
      username,
      "create",
      "Stock Label",
      nama_item,
      `${username} menambahkan stock label "${nama_item}"`
    );
    
    res.json({ message: "Data label berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## TODO - Endpoint yang Perlu Ditambahkan Logging:

1. ⏳ Label Stocks (POST, PUT, DELETE)
2. ⏳ Categories (POST, PUT, DELETE)
3. ⏳ Transactions In (POST, PUT, DELETE)
4. ⏳ Transactions Out (POST, PUT, DELETE)
5. ⏳ Documents LPS (POST)
6. ⏳ Documents SJ (POST)
7. ⏳ Users (POST, PUT, DELETE)

## Fitur Notifikasi

- ✅ Real-time badge dengan unread count
- ✅ Dropdown dengan list notifikasi
- ✅ Mark as read individual
- ✅ Mark all as read
- ✅ Delete notification
- ✅ Auto-refresh setiap 30 detik
- ✅ Color coding berdasarkan action type
- ✅ Relative time display (5 menit lalu, 2 jam lalu, dll)
- ✅ Click outside to close dropdown
- ✅ Responsive design

## Screenshot Lokasi

Notifikasi bell icon muncul di header admin, sebelah kiri tombol Refresh dan Logout.

## Testing

1. Login ke aplikasi
2. Tambah/edit/hapus data material
3. Lihat notifikasi muncul di bell icon
4. Badge merah menunjukkan jumlah unread
5. Click bell untuk melihat detail
6. Mark as read atau delete notifikasi

## Notes

- Notifikasi disimpan permanent di database
- Bisa dihapus manual oleh user
- Auto-refresh setiap 30 detik untuk cek notifikasi baru
- Username diambil dari JWT token yang login
