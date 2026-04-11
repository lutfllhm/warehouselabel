# Update: Customer Otomatis dari Label Keluar

## 📝 Perubahan

Field **Customer** di form Dokumen SJ telah **dihapus**. Customer sekarang otomatis diambil dari data Label Keluar yang dipilih.

---

## 🔄 Cara Kerja Baru

### 1. **Buat Label Keluar dengan Customer**
```javascript
{
  tanggal: "2024-01-15",
  no_sj: "", // Kosong
  pn: "123/label-RBM",
  nama_item: "Label A",
  ukuran: "100mm x 50mm",
  jumlah_roll: 100,
  customer: "PT ABC" // ✅ Customer diisi di sini
}
```

### 2. **Buat Dokumen SJ**
Form hanya memiliki field:
- Tanggal
- No SJ (Delivery Order)
- Label Keluar IDs (multi-select)

**Sistem otomatis:**
- Mengambil customer dari label keluar pertama yang dipilih
- Menyimpan customer ke dokumen SJ
- Mengupdate no_sj di semua label keluar yang dipilih

### 3. **Hasil**
```javascript
// Dokumen SJ
{
  id: 1,
  no_sj: "SJ/2024/001",
  tanggal: "2024-01-15",
  customer: "PT ABC", // ✅ Otomatis dari label keluar
  items: [...]
}
```

---

## 💡 Keuntungan

### ✅ Konsistensi Data
- Customer sudah ada di label keluar
- Tidak perlu input ulang
- Data selalu konsisten

### ✅ Lebih Sederhana
- Form lebih ringkas
- Lebih cepat input data
- Mengurangi kemungkinan typo

### ✅ Single Source of Truth
- Customer hanya diinput sekali (di label keluar)
- Dokumen SJ mengambil dari sumber yang sama

---

## 📋 Form Dokumen SJ (Update)

### Sebelum:
```
┌─────────────────────────────────────────┐
│ Tanggal: [📅 2024-01-15]               │
│ No SJ: [SJ/2024/001_____________]      │
│ Customer: [PT ABC_____________]        │ ← Dihapus
│ Label Keluar IDs: [Multi-select]       │
└─────────────────────────────────────────┘
```

### Sesudah:
```
┌─────────────────────────────────────────┐
│ Tanggal: [📅 2024-01-15]               │
│ No SJ: [SJ/2024/001_____________]      │
│ Label Keluar IDs: [Multi-select]       │ ← Customer otomatis
│ ┌─────────────────────────────────┐   │
│ │ ☑ 123/label-RBM - Label A       │   │
│ │   (100 Roll) - PT ABC           │   │ ← Customer tampil di sini
│ └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔧 Perubahan Teknis

### Backend API

**POST /api/documents/sj**
```javascript
// Request (customer dihapus)
{
  no_sj: "SJ/2024/001",
  tanggal: "2024-01-15",
  label_keluar_ids: [1, 2, 3]
}

// Backend otomatis:
// 1. Query customer dari label_keluar pertama
// 2. Simpan customer ke sj_docs
```

**PUT /api/documents/sj/:id**
```javascript
// Request (customer dihapus)
{
  no_sj: "SJ/2024/001",
  tanggal: "2024-01-15",
  label_keluar_ids: [2, 3, 4]
}

// Backend otomatis:
// 1. Query customer dari label_keluar pertama yang baru
// 2. Update customer di sj_docs
```

### Frontend

**Form Fields**
```javascript
// Sebelum
["tanggal", "no_sj", "customer", "label_keluar_ids"]

// Sesudah
["tanggal", "no_sj", "label_keluar_ids"]
```

---

## ⚠️ Catatan Penting

### 1. Customer dari Label Keluar Pertama
Jika memilih beberapa label keluar dengan customer berbeda, sistem akan mengambil customer dari **label keluar pertama** yang dipilih.

**Contoh:**
```javascript
// Pilih 3 label keluar:
// 1. PN 123 - Customer: PT ABC
// 2. PN 456 - Customer: PT XYZ
// 3. PN 789 - Customer: PT ABC

// Dokumen SJ akan memiliki customer: "PT ABC"
// (dari label keluar pertama)
```

**Rekomendasi:** Pilih label keluar dengan customer yang sama dalam satu dokumen SJ.

### 2. Customer Kosong
Jika label keluar tidak memiliki customer, dokumen SJ juga akan memiliki customer kosong (NULL).

### 3. Update Customer
Jika ingin mengubah customer di dokumen SJ:
1. Edit label keluar yang bersangkutan
2. Ubah customer di label keluar
3. Edit dokumen SJ (pilih ulang label keluar)
4. Customer akan otomatis terupdate

---

## 🎯 Use Case

### Skenario Normal
```
1. Buat 3 label keluar untuk PT ABC:
   - PN 123 - Customer: PT ABC
   - PN 456 - Customer: PT ABC
   - PN 789 - Customer: PT ABC

2. Buat dokumen SJ:
   - Pilih ketiga label keluar
   - Customer otomatis: PT ABC ✅

3. Hasil:
   - Dokumen SJ memiliki customer: PT ABC
   - Semua label keluar memiliki no_sj terisi
```

### Skenario Mixed Customer (Tidak Disarankan)
```
1. Buat 2 label keluar dengan customer berbeda:
   - PN 123 - Customer: PT ABC
   - PN 456 - Customer: PT XYZ

2. Buat dokumen SJ:
   - Pilih kedua label keluar
   - Customer otomatis: PT ABC (dari yang pertama)

3. Hasil:
   - Dokumen SJ memiliki customer: PT ABC
   - Tapi PN 456 sebenarnya untuk PT XYZ ⚠️

Rekomendasi: Buat 2 dokumen SJ terpisah untuk customer berbeda
```

---

## ✅ Kesimpulan

- ✅ Field customer dihapus dari form dokumen SJ
- ✅ Customer otomatis diambil dari label keluar
- ✅ Form lebih sederhana dan cepat
- ✅ Data lebih konsisten
- ⚠️ Pastikan label keluar dalam satu dokumen SJ memiliki customer yang sama
