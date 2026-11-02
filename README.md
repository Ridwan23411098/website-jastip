# 🚀 SURUH.ID — Jasa Titip & Jasa Suruh Cepat Antar Kecamatan

> **Tagline:** *"Butuh Diambil? Tinggal Suruh."*  
> Website layanan jastip belanja, ambil barang, antar barang, dan jasa suruh lokal dengan **Kalkulator Ongkos Otomatis Terintegrasi Peta Rute Jalan & Sistem Tarif Antar Kecamatan**.

---

## 🌟 Fitur Utama & Keunggulan

### 1. 🧮 Kalkulator Ongkos Otomatis (Fitur Bintang)
- **Rute Jalan Sebenarnya:** Menggunakan API OpenStreetMap OSRM untuk menghitung jarak kilometer dan waktu tempuh rute jalan asli.
- **Peta Interaktif:** Peta Leaflet dengan custom pin (Hijau = Pickup, Merah = Tujuan) dan polyline rute jalan berwarna biru.
- **Pin / Klik di Peta:** Pengguna bisa klik tombol *"Pin di Peta"* lalu klik langsung di peta untuk menentukan koordinat jemput atau antar.
- **Quick Preset Populer:** Coba rute populer sekali klik (contoh: *Sukajadi ➔ Panam*, *Mall SKA ➔ RSUD*, *Pasar Arengka ➔ Bandara*).
- **Penyesuaian Biaya Tambahan:** Opsi centang untuk Biaya Malam (20:00 - 06:00), Biaya Antre/Tunggu (>15 mnt), dan Muatan Barang Berat (>10 kg).
- **Pembulatan Otomatis:** Opsi pembulatan tarif ke kelipatan Rp 1.000 atau Rp 500 (misal Rp 17.500 ➔ Rp 18.000).

### 2. 📍 Sistem Zona Kecamatan
- Penetapan tarif flat transparan untuk perjalanan:
  - **Dalam Kecamatan:** Rp 10.000
  - **Antar Kecamatan Dekat:** Rp 15.000
  - **Antar Kecamatan Sedang:** Rp 20.000
  - **Antar Kecamatan Jauh:** Rp 25.000
- **Prioritas Perhitungan:**
  1. Jika rute cocok dengan zona khusus, gunakan tarif zona flat.
  2. Jika di luar zona khusus, gunakan formula jarak: `Tarif Minimum + (Jarak KM × Tarif per KM)`.
  3. Tambahkan biaya tambahan (jika ada).
  4. Lakukan pembulatan harga.

### 3. 📲 Pemesanan Langsung ke WhatsApp
- Setelah menekan tombol **"Pesan Sekarang"**, muncul formulir pemesanan ringkas & mobile-friendly.
- Menghasilkan **Kode Pesanan Unik** (contoh: `JST-2026-00126`).
- Otomatis membuka aplikasi WhatsApp dengan pesan rapi dan terformat ke nomor WhatsApp Admin.

### 4. 🔍 Tracking Pesanan Visual Real-Time
- Pelanggan cukup memasukkan Kode Pesanan (contoh: `JST-2026-00125`).
- Timeline 6 tahap visual yang interaktif:
  `Pesanan Diterima ➔ Driver Ditugaskan ➔ Menuju Lokasi Pickup ➔ Barang Diambil ➔ Dalam Perjalanan ➔ Pesanan Selesai`.
- Menampilkan nama driver, nomor telepon, dan status terkini.

### 5. 🛡️ Dashboard Admin Lengkap
- **Statistik KPI:** Total order hari ini, order aktif/sedang jalan, order selesai, total pendapatan (Rp), total KM, rata-rata ongkos.
- **Manajemen Pesanan:** Update status pesanan secara live, penugasan driver, dan rincian lengkap pesanan.
- **Pengaturan Tarif Live:** Ubah tarif minimum, tarif per KM, biaya malam, biaya antre, muatan berat, nomor WhatsApp admin, nama brand & tagline tanpa menyentuh kode!
- **Manajemen Zona Tarif:** Tambah, edit, dan hapus tarif rute zona khusus antar kecamatan.
- **Manajemen Driver:** Daftar driver, nomor kontak, area tugas, dan status.

### 6. 🛵 Aplikasi / Dashboard Driver Mobile
- Tampilan responsif khusus driver runner di jalan.
- Tombol status driver: `TERSEDIA`, `MENGAMBIL`, `MENGANTAR`, `OFFLINE`.
- Tombol navigasi 1-klik yang langsung membuka **Google Maps rute motor** menuju lokasi.
- Tombol 1-klik untuk chat WhatsApp ke pelanggan.
- Kemampuan mengambil tugas baru (claim orders) dan memajukan tahap status tugas.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Plus Jakarta Sans & Outfit Typography
- **Pemetaan & Routing:** Leaflet JS + OpenStreetMap Tiles + OSRM Routing API
- **State & Penyimpanan:** LocalStorage Storage Engine dengan Subscriber Pattern reaktif
- **Animasi & Interaksi:** Canvas Confetti + Lucide Icons + Micro-interactions

---

## 🏃 Cara Menjalankan Project

1. Masuk ke direktori:
   ```bash
   cd "c:\Users\ASUS\Documents\Website jastip"
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser di:
   ```
   http://localhost:3001/
   ```

---

## 👥 Cara Menguji Berbagai Role (Pengguna / Admin / Driver)

Di bagian paling atas website, terdapat **Demo Role Switcher Bar**:
- **[Pelanggan]:** Menampilkan halaman publik, hero, kalkulator ongkos rute map, layanan, cara kerja, tarif zona, tracking pesanan, testimoni, FAQ, dan footer.
- **[Admin]:** Menampilkan Dashboard Admin lengkap dengan KPI statistik, manajemen pesanan, ubah tarif live, dan pengaturan zona.
- **[Driver]:** Menampilkan antarmuka kurir dengan tombol navigasi Maps dan WhatsApp pelanggan.
