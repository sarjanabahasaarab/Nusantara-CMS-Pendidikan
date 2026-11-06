# Engine Penjadwalan & Deteksi Tabrakan 3-Dimensi — Nusantara Education CMS

## 1. Ikhtisar Masalah Penjadwalan Pendidikan

Penyusunan jadwal pelajaran di sekolah dan perguruan tinggi sering kali menghadapi kerumitan bentrok jam tatap muka yang melibatkan 3 entitas sekaligus:
1. Pendidik (Guru / Dosen).
2. Rombongan Belajar (Kelas / Angkatan).
3. Ruang Pembelajaran (Kelas Teori / Laboratorium / Bengkel).

Nusantara Education CMS Phase 4 mengimplementasikan **Engine Validasi Anti-Bentrok Waktu Nyata (Three-Way Conflict Detection Engine)** yang beroperasi pada tingkat server dan store sebelum data jadwal disimpan ke database.

---

## 2. Algoritma Deteksi Overlap Interval

Dua slot waktu $[S_1, E_1)$ dan $[S_2, E_2)$ pada hari yang sama dikatakan saling bertabrakan (*overlapping*) jika dan hanya jika:
$$\max(S_1, S_2) < \min(E_1, E_2)$$

Sistem mengonversi format waktu `HH:mm` menjadi representasi total menit sejak tengah malam:
$$\text{minutes} = \text{hour} \times 60 + \text{minute}$$

---

## 3. Tiga Dimensi Validasi Bentrok

| Jenis Bentrok | Kondisi Pemicu | Pesan Peringatan Sistem |
|---|---|---|
| **Bentrok Pendidik** | Pendidik $A$ dijadwalkan pada kelas $K_1$ dan $K_2$ dengan interval waktu yang beririsan pada hari yang sama. | `"Bentrok Guru: [Nama Guru] telah dijadwalkan mengajar [Mapel] di kelas [Kelas] pada jam [Start]-[End]"` |
| **Bentrok Rombel/Kelas** | Kelas $K$ memiliki dua mata pelajaran berbeda yang dialokasikan pada interval waktu yang beririsan. | `"Bentrok Rombel: Kelas [Kelas] telah memiliki jadwal mata pelajaran [Mapel] pada jam [Start]-[End]"` |
| **Bentrok Ruang Belajar** | Ruang $R$ (misal Laboratorium Komputer) digunakan oleh dua kelas berbeda pada jam yang bertabrakan. | `"Bentrok Ruang Belajar: Ruang [Kode Ruang] sedang digunakan oleh kelas [Kelas] ([Mapel]) pada jam [Start]-[End]"` |

Jika ketiga kondisi di atas terpenuhi tanpa bentrok, jadwal dapat disimpan dengan aman.

---

## 4. Antarmuka Visual Jadwal & Ekspor Cetak

1. **Tampilan Kisi Mingguan (Weekly Timetable Grid):** Menampilkan kolom Hari (Senin–Jumat/Sabtu) dan baris slot jam pelajaran. Setiap kartu jadwal menampilkan nama mapel, guru pengampu, dan badge ruangan.
2. **Tampilan Daftar Harian (Daily List View):** Urutan kronologis per hari untuk memudahkan guru dan siswa melihat agenda harian mereka.
3. **Mode Cetak / PDF Bersih (Print-Ready View):** Tata letak tabel standar dinas pendidikan yang siap dicetak langsung (`window.print()`) lengkap dengan kop surat sekolah dan tanda tangan kepala sekolah.
