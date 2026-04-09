# Fitur Input Terstruktur untuk Nama Item Label

## Deskripsi
Fitur ini memungkinkan pengguna untuk menginput nama item label dengan cara yang lebih terstruktur dan mudah, terutama untuk transaksi label masuk dan keluar.

## Format Output
Format yang dihasilkan: `Lb. [panjang]mm x [lebar]mm [TIPE] [Deskripsi Manual]`

**Contoh:**
- `Lb. 33mm x 15mm GPIL FO THERMAL LABEL`
- `Lb. 50mm x 25mm CORELESS DIRECT THERMAL`
- `Lb. 40mm x 20mm G2L EYEMARK LABEL`

## Komponen Input

### 1. Prefix
- **Pilihan:** Tanpa prefix atau "Lb."
- **Default:** "Lb."
- **Fungsi:** Menambahkan prefix di awal nama item

### 2. Ukuran (mm)
- **Input:** Dua field numerik (Panjang × Lebar)
- **Format:** Angka desimal (contoh: 33, 15.5)
- **Output:** Otomatis ditambahkan "mm" dan "x" (contoh: 33mm x 15mm)
- **Integrasi:** Otomatis mengisi field ukuran_panjang dan ukuran_lebar

### 3. Tipe
- **Pilihan dropdown:**
  - GPIL
  - GP4L
  - G1L
  - G2L
  - G3L
  - G4L
  - CORELESS
  - EYEMARK
  - HALFCUT
- **Fungsi:** Memilih tipe label standar

### 4. Deskripsi Tambahan (Manual)
- **Input:** Text field bebas
- **Contoh:** "FO THERMAL LABEL", "DIRECT THERMAL", "EYEMARK LABEL"
- **Fungsi:** Menambahkan deskripsi custom di akhir nama item

## Cara Penggunaan

### Di Halaman Transaksi Masuk/Keluar:
1. Buka form tambah/edit transaksi
2. Pada field "nama item", centang checkbox **"Gunakan input terstruktur"**
3. Isi komponen-komponen:
   - Pilih prefix (opsional)
   - Masukkan ukuran panjang dan lebar
   - Pilih tipe dari dropdown
   - Tambahkan deskripsi manual (opsional)
4. Lihat preview hasil di bawah form
5. Simpan data

### Di Halaman Stock Label:
1. Buka form tambah/edit stock label
2. Pada field "nama item", centang checkbox **"Gunakan input terstruktur"**
3. Isi komponen yang sama seperti di atas
4. Ukuran akan otomatis mengisi field "ukuran_value"

## Keuntungan

✅ **Konsistensi:** Format nama item selalu seragam
✅ **Mudah:** Tidak perlu mengetik format manual
✅ **Cepat:** Pilih dari dropdown untuk komponen standar
✅ **Fleksibel:** Tetap bisa menambahkan deskripsi custom
✅ **Preview:** Melihat hasil sebelum menyimpan
✅ **Otomatis:** Ukuran otomatis terisi di field terpisah

## Mode Input

Pengguna dapat memilih antara:
1. **Input Manual** (default): Ketik langsung atau pilih dari saran
2. **Input Terstruktur**: Gunakan komponen terpisah dengan preview

Kedua mode dapat digunakan sesuai kebutuhan dengan toggle checkbox.

## Integrasi dengan Database

- Field `nama_item`: Menyimpan hasil lengkap (contoh: "Lb. 33mm x 15mm GPIL FO THERMAL LABEL")
- Field `ukuran_panjang`: Otomatis terisi dari input panjang (contoh: 33)
- Field `ukuran_lebar`: Otomatis terisi dari input lebar (contoh: 15)
- Field `ukuran`: Digabung sebagai "33mm x 15mm" untuk display

## Catatan Teknis

- Komponen: `frontend/src/components/admin/StructuredItemInput.jsx`
- Terintegrasi di: `frontend/src/components/admin/FormModal.jsx`
- Parsing otomatis untuk edit data existing
- Validasi numerik untuk ukuran
- Support dark mode
