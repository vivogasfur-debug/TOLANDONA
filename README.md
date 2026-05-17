# SIDATA - Sistem Informasi Data TOLANDONA

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

Sistem Informasi Data terpadu untuk pengelolaan data Guru, Siswa, Posyandu, Relawan, Distribusi makanan, dan administrasi kegiatan.

## 🚀 Fitur Utama

### 📊 Dashboard
- Ringkasan statistik data
- Grafik dan visualisasi data
- Akses cepat ke modul utama

### 👨‍🏫 Manajemen Guru
- Input dan pengelolaan data guru (235 data terisi)
- Informasi NUPTK, NIP, NIK
- Klasifikasi jenis tendik
- Import/export data CSV

### 👨‍🎓 Manajemen Siswa
- Data siswa per jenjang pendidikan (1,395 data terisi)
- Informasi NISN, NIK, kelas
- Import/export data CSV

### 👶 Manajemen Posyandu
- Data anak dan ibu balita (469 data terisi)
- Kategori posyandu
- Riwayat kesehatan

### 🤝 Manajemen Relawan
- Data relawan per divisi (3 data terisi)
- Informasi jabatan dan gaji pokok
- Integrasi dengan sistem payroll

### 💰 Sistem Payroll
- Periode gaji 2 mingguan
- Kalkulasi otomatis gaji, bonus, potongan
- Status pembayaran tracking
- Laporan payroll periode

### 📦 Distribusi Makanan
- Distribusi per sekolah (21 sekolah)
- Klasifikasi per kelas (TK, SD, SMP, SMA)
- Data L/P (Laki-laki/Perempuan)
- Berita Acara Distribusi

### 📝 Berita Acara
- Pembuatan berita acara kegiatan
- Template dan format standar
- Export ke PDF

### 🍎 Ahli Gizi (Food Diary)
- Pencatatan asupan makanan
- Kalkulasi nutrisi (kalori, protein, karbo, lemak)
- Kategori anak/dewasa

### ⚙️ Pengaturan
- Kustomisasi logo dan nama instansi
- Manajemen user
- Pengaturan export

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework dengan App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **Framer Motion** - Animations

### Backend
- **Prisma ORM** - Database toolkit
- **SQLite** - Database
- **NextAuth.js** - Authentication

### Utilities
- **jsPDF** - PDF generation
- **xlsx** - Excel file handling
- **date-fns** - Date manipulation
- **zod** - Schema validation

## 📁 Struktur Proyek

```
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   └── uploads/           # Uploaded files
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main page
│   ├── components/
│   │   ├── layout/        # Layout components
│   │   ├── pages/         # Page components
│   │   └── ui/            # UI components (shadcn)
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities
├── scripts/               # Utility scripts
└── upload/                # Upload directory
```

## 🗃️ Database Models

| Model | Deskripsi | Data Terisi |
|-------|-----------|-------------|
| `User` | User authentication | 1 |
| `Guru` | Data guru/tenaga pendidik | 235 |
| `Siswa` | Data siswa | 1,395 |
| `Posyandu` | Data posyandu | 469 |
| `Relawan` | Data relawan | 3 |
| `Payroll` | Penggajian relawan | 36 |
| `Distribusi` | Distribusi makanan | 189 |
| `BeritaAcara` | Berita acara kegiatan | 61 |
| `FoodDiary` | Catatan asupan gizi | 3,152 |

## 🚀 Instalasi

### Prerequisites
- Node.js 18+ atau Bun
- npm/yarn/bun

### Setup

```bash
# Clone repository
git clone https://github.com/vivogasfur-debug/TOLANDONA.git

# Masuk ke direktori
cd TOLANDONA

# Install dependencies
bun install

# Setup database
bun run db:push
bun run db:generate

# Jalankan development server
bun run dev
```

### Environment Variables

Buat file `.env`:

```env
DATABASE_URL="file:./dev.db"
```

## 📜 Scripts

| Command | Deskripsi |
|---------|-----------|
| `bun run dev` | Jalankan development server |
| `bun run build` | Build untuk production |
| `bun run start` | Jalankan production server |
| `bun run lint` | Cek code quality |
| `bun run db:push` | Push schema ke database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migration |

## 🔐 Default Login

| Email | Password | Role |
|-------|----------|------|
| admin@tolandona.go.id | admin123 | admin |

> ⚠️ Harap ganti password default setelah login pertama!

## 📊 Data Terimport

Sistem sudah terisi dengan data real dari file CSV:
- **Guru**: 235 data
- **Siswa**: 1,395 data (21 sekolah)
- **Posyandu**: 469 data
- **Relawan**: 3 data

Simulasi data periode Desember 2025 - Mei 2026:
- **Distribusi**: 189 record
- **Payroll**: 36 record
- **Food Diary**: 3,152 record
- **Berita Acara**: 61 record

## 🏫 Daftar Sekolah

| Sekolah | Jumlah Siswa |
|---------|--------------|
| SMAS LAKINA LIMBO | 169 |
| SMP 2 BUTON TENGAH | 163 |
| SDN 4 SANGIA WAMBULU | 145 |
| SMP 8 BUTON TENGAH | 109 |
| SDN 5 SANGIA WAMBULU | 104 |
| SMAN 1 SANGIA WAMBULU | 104 |
| SDN 6 SANGIA WAMBULU | 86 |
| SDN 3 SANGIA WAMBULU | 76 |
| MI AL-AMIN | 70 |
| SDN 1 SANGIA WAMBULU | 62 |
| SDN 2 SANGIA WAMBULU | 61 |
| SDN 7 SANGIA WAMBULU | 51 |
| RA AL AMIN | 45 |
| TK PKK DODA BAHARI | 27 |
| TK LAKINALIMBO 2 | 21 |
| RA AL MAWADAH | 20 |
| TK LAKINALIMBO 1 | 18 |
| RA SHAFHA MARWAH | 17 |
| TK HANDAYANI | 16 |
| TK MOLAGINA | 16 |
| TK MANDIRI ANALALAKI | 15 |

## 📤 Import Data

1. Siapkan file CSV dengan format yang sesuai
2. Buka halaman Data > Import
3. Pilih tipe data (Guru/Siswa/Posyandu/Relawan)
4. Upload file CSV
5. Klik Import

## 📥 Export Data

1. Buka halaman Data yang diinginkan
2. Klik tombol Export
3. Pilih format (CSV/PDF)
4. Download file

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Proprietary - All rights reserved.

## 👥 Authors

- **SIDATA Team** - *Initial work*

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Prisma](https://www.prisma.io/) - Database ORM
- [Next.js](https://nextjs.org/) - React Framework

---

**SIDATA** © 2024 - Present
