import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    // ============== 21 SEKOLAH ==============
    const sekolahList = [
      // TK/PAUD/RA (5 sekolah)
      { nama: 'TK HANDAYANI', tipe: 'TK' },
      { nama: 'TK LAKINALIMBO 1', tipe: 'TK' },
      { nama: 'TK MOLAGINA', tipe: 'TK' },
      { nama: 'RA AL AMIN', tipe: 'TK' },
      { nama: 'RA AL MAWADAH', tipe: 'TK' },
      
      // SD/MI (10 sekolah)
      { nama: 'SDN 1 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 2 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 3 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 4 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 5 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 6 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 7 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 8 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'SDN 9 SANGIA WAMBULU', tipe: 'SD' },
      { nama: 'MI AL AMIN', tipe: 'SD' },
      
      // SMP/MTs (4 sekolah)
      { nama: 'SMPN 1 BUTON TENGAH', tipe: 'SMP' },
      { nama: 'SMPN 2 BUTON TENGAH', tipe: 'SMP' },
      { nama: 'SMPN 3 BUTON TENGAH', tipe: 'SMP' },
      { nama: 'MTs AL AMIN', tipe: 'SMP' },
      
      // SMA/SMK/MA (2 sekolah)
      { nama: 'SMAN 1 SANGIA WAMBULU', tipe: 'SMA' },
      { nama: 'SMAS LAKINA LIMBO', tipe: 'SMA' },
    ];

    // ============== 10 POSYANDU ==============
    const posyanduList = [
      { nama: 'POSYANDU ANGGREK', desa: 'SANGIA WAMBULU' },
      { nama: 'POSYANDU DAHLIA', desa: 'SANGIA WAMBULU' },
      { nama: 'POSYANDU KAMBOJA', desa: 'LAKINALIMBO' },
      { nama: 'POSYANDU KEMUNING', desa: 'LAKINALIMBO' },
      { nama: 'POSYANDU MATAHARI', desa: 'MOLAGINA' },
      { nama: 'POSYANDU MAWAR', desa: 'MOLAGINA' },
      { nama: 'POSYANDU MELAI', desa: 'TOLANDONA' },
      { nama: 'POSYANDU MELATI', desa: 'TOLANDONA' },
      { nama: 'POSYANDU MONGIWA', desa: 'WAMBULU' },
      { nama: 'POSYANDU NUSA INDAH', desa: 'WAMBULU' },
    ];

    const namaDepan = ['Ahmad', 'Muhammad', 'Abdul', 'Hasan', 'Husain', 'Ibrahim', 'Yusuf', 'Ali', 'Umar', 'Bakri', 'Siti', 'Fatimah', 'Aminah', 'Khadijah', 'Zainab', 'Maryam', 'Aisyah', 'Ruqayah', 'Hafshah', 'Asma'];
    const namaBelakang = ['Sangia', 'Wambulu', 'Lakina', 'Molagina', 'Tolandona', 'Buton', 'Muna', 'Kendari', 'Palu', 'Donggala'];
    const kategoriPosyandu = ['BALITA', 'BUSUI', 'BUMIL', 'LANSIA'];

    // Create Posyandu data
    const existingPosyandu = await db.posyandu.count();
    if (existingPosyandu === 0) {
      for (const posyandu of posyanduList) {
        const jumlahWarga = 15 + Math.floor(Math.random() * 11);
        for (let i = 1; i <= jumlahWarga; i++) {
          try {
            const kategori = kategoriPosyandu[Math.floor(Math.random() * kategoriPosyandu.length)];
            let umur = '0 tahun';
            if (kategori === 'BALITA') umur = `${Math.floor(Math.random() * 5)} tahun`;
            else if (kategori === 'BUSUI') umur = `${20 + Math.floor(Math.random() * 20)} tahun`;
            else if (kategori === 'BUMIL') umur = `${18 + Math.floor(Math.random() * 25)} tahun`;
            else if (kategori === 'LANSIA') umur = `${55 + Math.floor(Math.random() * 25)} tahun`;

            await db.posyandu.create({
              data: {
                originalId: `P${3000 + Math.floor(Math.random() * 10000)}`,
                nama: `${namaDepan[Math.floor(Math.random() * namaDepan.length)]} ${namaBelakang[Math.floor(Math.random() * namaBelakang.length)]}`,
                posyandu: posyandu.nama,
                alamat: posyandu.desa,
                kategori: kategori,
                jk: Math.random() > 0.5 ? 'L' : 'P',
                umur: umur,
              }
            });
          } catch (e) {}
        }
      }
    }

    // Create Distribusi data (3 bulan terakhir)
    const existingDistribusi = await db.distribusi.count();
    if (existingDistribusi === 0) {
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      
      for (let d = new Date(threeMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
        // Skip weekend
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        
        // Random 5-12 sekolah per hari
        const jumlahSekolah = 5 + Math.floor(Math.random() * 8);
        const sekolahHariIni = [...sekolahList].sort(() => Math.random() - 0.5).slice(0, jumlahSekolah);
        
        for (const sekolah of sekolahHariIni) {
          try {
            let distribusiData: any = {
              namaSekolah: sekolah.nama,
              tanggal: new Date(d),
              jumlah: 0
            };
            
            if (sekolah.tipe === 'TK') {
              distribusiData.klsAL = Math.floor(Math.random() * 10) + 5;
              distribusiData.klsAP = Math.floor(Math.random() * 10) + 5;
              distribusiData.klsBL = Math.floor(Math.random() * 10) + 5;
              distribusiData.klsBP = Math.floor(Math.random() * 10) + 5;
            } else if (sekolah.tipe === 'SD') {
              for (let k = 1; k <= 6; k++) {
                distribusiData[`kls${k}L`] = Math.floor(Math.random() * 15) + 10;
                distribusiData[`kls${k}P`] = Math.floor(Math.random() * 15) + 10;
              }
            } else if (sekolah.tipe === 'SMP') {
              for (let k = 7; k <= 9; k++) {
                distribusiData[`kls${k}L`] = Math.floor(Math.random() * 20) + 15;
                distribusiData[`kls${k}P`] = Math.floor(Math.random() * 20) + 15;
              }
            } else if (sekolah.tipe === 'SMA') {
              for (let k = 10; k <= 12; k++) {
                distribusiData[`kls${k}L`] = Math.floor(Math.random() * 25) + 20;
                distribusiData[`kls${k}P`] = Math.floor(Math.random() * 25) + 20;
              }
            }
            
            // Guru data
            distribusiData.kepsekL = Math.random() > 0.5 ? 1 : 0;
            distribusiData.kepsekP = distribusiData.kepsekL === 0 ? 1 : 0;
            distribusiData.guruL = Math.floor(Math.random() * 5) + 2;
            distribusiData.guruP = Math.floor(Math.random() * 5) + 3;
            distribusiData.tendikL = Math.floor(Math.random() * 2);
            distribusiData.tendikP = Math.floor(Math.random() * 2);
            distribusiData.nonTendikL = Math.floor(Math.random() * 2);
            distribusiData.nonTendikP = Math.floor(Math.random() * 2);
            
            // Uji Organoleptik
            distribusiData.ujiOrganoleptik = Math.floor(Math.random() * 3) + 1;
            
            // Calculate total
            let total = 0;
            const fields = ['klsAL', 'klsAP', 'klsBL', 'klsBP', 
              'kls1L', 'kls1P', 'kls2L', 'kls2P', 'kls3L', 'kls3P', 'kls4L', 'kls4P', 'kls5L', 'kls5P', 'kls6L', 'kls6P',
              'kls7L', 'kls7P', 'kls8L', 'kls8P', 'kls9L', 'kls9P',
              'kls10L', 'kls10P', 'kls11L', 'kls11P', 'kls12L', 'kls12P',
              'kepsekL', 'kepsekP', 'guruL', 'guruP', 'tendikL', 'tendikP', 'nonTendikL', 'nonTendikP', 'ujiOrganoleptik'];
            for (const f of fields) {
              total += distribusiData[f] || 0;
            }
            distribusiData.jumlah = total;
            
            await db.distribusi.create({ data: distribusiData });
          } catch (e) {}
        }
      }
    }

    const counts = {
      sekolah: sekolahList.length,
      posyandu: posyanduList.length,
      guru: await db.guru.count(),
      siswa: await db.siswa.count(),
      posyanduData: await db.posyandu.count(),
      distribusi: await db.distribusi.count(),
    };

    return NextResponse.json({ 
      success: true, 
      message: `Database: ${counts.sekolah} sekolah, ${counts.posyandu} posyandu, ${counts.guru} guru, ${counts.siswa} siswa, ${counts.posyanduData} data posyandu, ${counts.distribusi} distribusi`, 
      counts 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: 'Seed failed' }, { status: 500 });
  }
}
