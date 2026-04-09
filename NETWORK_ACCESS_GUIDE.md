# Panduan Akses Aplikasi dari PC Lain dalam Jaringan

## Persiapan

### 1. Cek IP Address PC Server (PC yang menjalankan aplikasi)

**Windows:**
```bash
ipconfig
```
Cari bagian "IPv4 Address", contoh: `192.168.1.100`

**Linux/Mac:**
```bash
ifconfig
# atau
ip addr show
```

---

## Konfigurasi Backend

### 1. Update file `.env` di folder `backend`

Buat file `.env` dari `.env.example` jika belum ada:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=warehouse_label
JWT_SECRET=warehouse-secret
CORS_ORIGIN=*
```

**Penting:** `CORS_ORIGIN=*` memungkinkan akses dari semua origin. Untuk keamanan lebih baik, ganti dengan IP spesifik:
```env
CORS_ORIGIN=http://192.168.1.100:5173
```

### 2. Jalankan Backend dengan Host 0.0.0.0

Edit `backend/package.json` atau jalankan langsung:

```bash
cd backend
node src/server.js
```

Backend sudah dikonfigurasi untuk menerima koneksi dari semua network interface.

---

## Konfigurasi Frontend

### 1. Update `vite.config.js`

Edit file `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Tambahkan ini - memungkinkan akses dari network
    port: 5173,      // Port default Vite
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

### 2. Untuk Production Build (Opsional)

Jika ingin menggunakan build production, buat file `.env` di folder `frontend`:

```env
VITE_API_URL=http://192.168.1.100:5000/api
```

Ganti `192.168.1.100` dengan IP address PC server Anda.

---

## Cara Menjalankan

### Di PC Server:

1. **Jalankan Backend:**
```bash
cd backend
npm run dev
# atau
npm start
```

2. **Jalankan Frontend (di terminal terpisah):**
```bash
cd frontend
npm run dev
```

Vite akan menampilkan output seperti:
```
VITE v8.0.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### Di PC Client (PC lain dalam jaringan):

Buka browser dan akses:
```
http://192.168.1.100:5173
```

Ganti `192.168.1.100` dengan IP address PC server Anda.

---

## Troubleshooting

### 1. Tidak bisa akses dari PC lain

**Cek Firewall Windows:**
- Buka "Windows Defender Firewall"
- Klik "Advanced settings"
- Klik "Inbound Rules" → "New Rule"
- Pilih "Port" → Next
- Pilih "TCP" dan masukkan port: `5000,5173`
- Pilih "Allow the connection"
- Beri nama: "Warehouse App"

**Atau jalankan command ini di PowerShell (sebagai Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Warehouse Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Warehouse Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### 2. API Error / CORS Error

Pastikan `CORS_ORIGIN` di backend `.env` sudah diset dengan benar:
```env
CORS_ORIGIN=*
```

### 3. Database Connection Error

Pastikan MySQL berjalan dan bisa diakses dari localhost di PC server.

### 4. Cek koneksi dari PC client

Test koneksi ke backend:
```bash
curl http://192.168.1.100:5000/api/health
```

Atau buka di browser:
```
http://192.168.1.100:5000/api/health
```

Harus mengembalikan: `{"ok":true}`

---

## Keamanan

Untuk production atau penggunaan jangka panjang:

1. **Ganti JWT_SECRET** dengan string random yang kuat
2. **Set CORS_ORIGIN** ke IP/domain spesifik, bukan `*`
3. **Gunakan HTTPS** dengan SSL certificate
4. **Set password MySQL** yang kuat
5. **Batasi akses firewall** hanya ke IP yang diperlukan

---

## Akses dari Internet (Opsional)

Jika ingin akses dari luar jaringan lokal:

1. **Port Forwarding di Router:**
   - Login ke router (biasanya `192.168.1.1`)
   - Cari menu "Port Forwarding" atau "Virtual Server"
   - Forward port `5000` dan `5173` ke IP PC server

2. **Gunakan Dynamic DNS** (jika IP public berubah-ubah):
   - Daftar di layanan seperti No-IP, DuckDNS, dll
   - Install client di PC server

3. **Atau gunakan Ngrok** (untuk testing):
```bash
ngrok http 5173
```

**Catatan:** Akses dari internet memerlukan keamanan ekstra!
