# RBM Warehouse Label Management System

Sistem manajemen warehouse untuk tracking label dan material stocks.

## 🚀 Quick Start

### Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env dengan database credentials
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 🏗️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, JWT
- **Database:** MySQL

## ✨ Features

- Material & Label Stock Management
- Transaction Tracking (In/Out)
- Document Management (LPS/SJ)
- Real-time Updates (WebSocket)
- Excel Export
- User Management
- Notifications

## 📦 Project Structure

```
.
├── backend/          # Node.js API server
├── frontend/         # React application
└── format/           # Excel templates
```

## 🔐 Default Credentials

After setup, create admin user:
- Username: `admin`
- Password: `admin123`

⚠️ **Change password after first login!**

## Catatan Lanjutan

- Form detail LPS/SJ bisa diselaraskan lagi dengan file di folder `format/` bila sudah dilampirkan.
- Backup dari menu aplikasi saat ini mencatat log entri backup. Untuk file dump MySQL (.sql) gunakan skrip: `powershell -ExecutionPolicy Bypass -File backend/scripts/backup-db.ps1` (pastikan `mysqldump` ada di PATH dan `backend/.env` sudah benar).
