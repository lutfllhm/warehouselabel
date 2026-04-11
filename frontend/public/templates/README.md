# Template Excel

Folder ini berisi template Excel yang digunakan untuk export dokumen.

## File Template

- `format LPS.xlsx` - Template untuk export Laporan Produksi Selesai (LPS)

## Cara Kerja

1. Template disimpan di folder `public/templates/` agar bisa diakses oleh browser
2. Saat user klik tombol export, aplikasi akan:
   - Fetch template dari `/templates/format LPS.xlsx`
   - Membaca struktur template menggunakan library xlsx
   - Mengisi data ke cell yang sesuai
   - Download file hasil dengan nama `LPS_{no_lps}_{tanggal}.xlsx`

## Struktur Template LPS

- Row 1: Title "LAPORAN PRODUKSI SELESAI (LPS)"
- Row 3: Header info (No. LPS di F3, Tgl LPS di H3)
- Row 4: Header kolom tabel
- Row 5+: Data items

## Kolom Data (Row 5+)

- Column B: PAPERCORE
- Column C: NAMA ITEM
- Column D: CUSTOMER
- Column E: P.NUMBER
- Column F: NO.SPK
- Column G: PO
- Column H: JUMLAH
- Column I: BAHAN

## Update Template

Jika ingin mengubah format template:
1. Edit file `format LPS.xlsx` di folder `format/` (root project)
2. Copy file yang sudah diedit ke `frontend/public/templates/`
3. Atau jalankan: `Copy-Item "../format/format LPS.xlsx" "public/templates/"`
