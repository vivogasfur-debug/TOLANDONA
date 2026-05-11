import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    // Check if data already exists
    const existingGuru = await db.guru.count();
    
    if (existingGuru > 0) {
      return NextResponse.json({ success: true, message: 'Data already seeded', counts: { guru: existingGuru } });
    }

    // Create admin user with hashed password
    try {
      const hashedPassword = await hash('admin123', 10);
      await db.user.create({
        data: { email: 'admin@tolandona.go.id', password: hashedPassword, name: 'Administrator', role: 'admin' }
      });
    } catch (e) {}

    // Create settings
    const settings = [
      { key: 'siteName', value: 'Sistem Informasi Data Kecamatan Tolandona' },
      { key: 'siteSubtitle', value: 'Dashboard Rekapitulasi & Distribusi Data' },
      { key: 'primaryColor', value: '#10b981' },
      { key: 'logoUrl', value: '' },
      { key: 'footerText', value: '© 2025 Kecamatan Tolandona - Kabupaten Buton Tengah' },
    ];
    for (const s of settings) {
      try { await db.setting.create({ data: s }); } catch (e) {}
    }

    // Create sample Guru data
    const sekolahGuru = ['RA AL AMIN', 'RA AL MAWADAH', 'RA SHAFHA MARWAH', 'SDN 1 SANGIA WAMBULU', 'SDN 2 SANGIA WAMBULU', 'SDN 3 SANGIA WAMBULU', 'SDN 4 SANGIA WAMBULU', 'SDN 5 SANGIA WAMBULU', 'SDN 6 SANGIA WAMBULU', 'SDN 7 SANGIA WAMBULU', 'SMP 2 BUTON TENGAH', 'SMP 8 BUTON TENGAH', 'SMAN 1 SANGIA WAMBULU', 'SMAS LAKINA LIMBO', 'TK HANDAYANI', 'TK LAKINALIMBO 1', 'TK LAKINALIMBO 2', 'TK MOLAGINA', 'TK PKK DODA BAHARI', 'MI AL - AMIN'];
    const jenisTendik = ['GURU', 'KEPALA SEKOLAH', 'TENDIK', 'NON TENDIK'];
    
    for (let i = 1; i <= 80; i++) {
      try {
        await db.guru.create({
          data: {
            originalId: `G${2000 + i}`,
            nama: `Guru Sample ${i}`,
            jk: i % 2 === 0 ? 'L' : 'P',
            sekolah: sekolahGuru[Math.floor(Math.random() * sekolahGuru.length)],
            alamat: 'TOLANDONA',
            jenisTendik: jenisTendik[Math.floor(Math.random() * jenisTendik.length)],
            umur: `${25 + Math.floor(Math.random() * 30)} THN`,
          }
        });
      } catch (e) {}
    }

    // Create sample Siswa data
    const jenjang = ['TK/RA', 'SD/MI', 'SMP/MTs', 'SMA/MA'];
    const kelas = ['A', 'B', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const sekolahSiswa = ['RA AL AMIN', 'RA AL MAWADAH', 'SDN 1 SANGIA WAMBULU', 'SDN 2 SANGIA WAMBULU', 'SDN 3 SANGIA WAMBULU', 'SDN 4 SANGIA WAMBULU', 'SDN 5 SANGIA WAMBULU', 'SDN 6 SANGIA WAMBULU', 'SMP 2 BUTON TENGAH', 'SMP 8 BUTON TENGAH', 'SMAN 1 SANGIA WAMBULU', 'SMAS LAKINA LIMBO'];

    for (let i = 1; i <= 150; i++) {
      try {
        await db.siswa.create({
          data: {
            originalId: `S${1000 + i}`,
            nama: `Siswa Sample ${i}`,
            jenjang: jenjang[Math.floor(Math.random() * jenjang.length)],
            namaSekolah: sekolahSiswa[Math.floor(Math.random() * sekolahSiswa.length)],
            jk: i % 2 === 0 ? 'L' : 'P',
            kelas: kelas[Math.floor(Math.random() * kelas.length)],
            umur: `${5 + Math.floor(Math.random() * 15)} THN`,
          }
        });
      } catch (e) {}
    }

    // Create sample Posyandu data
    const posyanduList = ['ANGGREK', 'DAHLIA', 'KAMBOJA', 'KEMUNING', 'MATAHARI', 'MAWAR', 'MELAI', 'MELATI', 'MONGIWA', 'NUSA INDAH'];
    const kategori = ['BALITA', 'BUSUI', 'BUMIL'];

    for (let i = 1; i <= 120; i++) {
      try {
        await db.posyandu.create({
          data: {
            originalId: `P${3000 + i}`,
            nama: `Warga Sample ${i}`,
            posyandu: posyanduList[Math.floor(Math.random() * posyanduList.length)],
            kategori: kategori[Math.floor(Math.random() * kategori.length)],
            jk: i % 2 === 0 ? 'L' : 'P',
            umur: `${Math.floor(Math.random() * 5)} THN`,
          }
        });
      } catch (e) {}
    }

    const counts = {
      guru: await db.guru.count(),
      siswa: await db.siswa.count(),
      posyandu: await db.posyandu.count(),
    };

    return NextResponse.json({ success: true, message: 'Data seeded successfully', counts });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}
