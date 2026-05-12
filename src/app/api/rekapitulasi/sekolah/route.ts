import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get all siswa with class info
    const siswaData = await db.siswa.findMany({
      select: { 
        namaSekolah: true, 
        jk: true, 
        jenjang: true, 
        kelas: true 
      },
    });

    // Get all guru with jenis tendik
    const guruData = await db.guru.findMany({
      select: { 
        sekolah: true, 
        jk: true, 
        jenisTendik: true 
      },
    });

    // Separate by education level - TK now has class A and B
    const tkSekolah = new Map<string, { siswaL: number; siswaP: number; kelasData: Map<string, { L: number; P: number }> }>();
    const sdSekolah = new Map<string, { siswaL: number; siswaP: number; kelasData: Map<string, { L: number; P: number }> }>();
    const smpSekolah = new Map<string, { siswaL: number; siswaP: number; kelasData: Map<string, { L: number; P: number }> }>();
    const smaSekolah = new Map<string, { siswaL: number; siswaP: number; kelasData: Map<string, { L: number; P: number }> }>();

    // Helper function to get or create school entry
    function getOrCreateSchool(map: Map<string, any>, schoolName: string) {
      if (!map.has(schoolName)) {
        map.set(schoolName, { 
          siswaL: 0, 
          siswaP: 0, 
          kelasData: new Map<string, { L: number; P: number }>() 
        });
      }
      return map.get(schoolName);
    }

    // Process siswa data
    for (const siswa of siswaData) {
      if (!siswa.namaSekolah) continue;
      const schoolName = siswa.namaSekolah.trim();
      const schoolNameUpper = schoolName.toUpperCase();
      const jenjang = (siswa.jenjang || '').toUpperCase().trim();
      const kelas = siswa.kelas?.trim() || '-';
      const jk = siswa.jk?.toUpperCase() || 'L';

      let targetMap: Map<string, any> | null = null;

      // Determine education level - check school name first (since jenjang is often null)
      if (schoolNameUpper.includes('TK') || schoolNameUpper.includes('RA') || 
          schoolNameUpper.includes('PAUD') || schoolNameUpper.includes('KB')) {
        targetMap = tkSekolah;
      } else if (schoolNameUpper.includes('SD') || schoolNameUpper.includes('MI')) {
        targetMap = sdSekolah;
      } else if (schoolNameUpper.includes('SMP') || schoolNameUpper.includes('MTS')) {
        targetMap = smpSekolah;
      } else if (schoolNameUpper.includes('SMA') || schoolNameUpper.includes('SMK') || 
                 schoolNameUpper.includes('MA') || schoolNameUpper.includes('SMAS')) {
        targetMap = smaSekolah;
      } else if (jenjang.includes('TK') || jenjang.includes('RA') || 
                 jenjang.includes('PAUD') || jenjang.includes('KB')) {
        targetMap = tkSekolah;
      } else if (jenjang.includes('SD') || jenjang.includes('MI')) {
        targetMap = sdSekolah;
      } else if (jenjang.includes('SMP') || jenjang.includes('MTS')) {
        targetMap = smpSekolah;
      } else if (jenjang.includes('SMA') || jenjang.includes('SMK') || jenjang.includes('MA')) {
        targetMap = smaSekolah;
      } else {
        // Try to guess from class number or letter
        const classNum = parseInt(kelas.replace(/\D/g, ''));
        const kelasUpper = kelas.toUpperCase().trim();
        
        // Check for TK classes (A, B, or 0-5 years old patterns)
        if (kelasUpper === 'A' || kelasUpper === 'B' || kelasUpper === 'TK A' || 
            kelasUpper === 'TK B' || kelasUpper === '0' || kelasUpper === 'NOL') {
          targetMap = tkSekolah;
        } else if (!isNaN(classNum)) {
          if (classNum >= 1 && classNum <= 6) {
            targetMap = sdSekolah;
          } else if (classNum >= 7 && classNum <= 9) {
            targetMap = smpSekolah;
          } else if (classNum >= 10 && classNum <= 12) {
            targetMap = smaSekolah;
          }
        }
      }

      if (targetMap) {
        const school = getOrCreateSchool(targetMap, schoolName);
        
        // Update total
        if (jk === 'L') school.siswaL++;
        else if (jk === 'P') school.siswaP++;

        // Update class data
        if (!school.kelasData.has(kelas)) {
          school.kelasData.set(kelas, { L: 0, P: 0 });
        }
        const kelasEntry = school.kelasData.get(kelas)!;
        if (jk === 'L') kelasEntry.L++;
        else if (jk === 'P') kelasEntry.P++;
      }
    }

    // Process guru data
    const guruSekolah = new Map<string, { 
      guruL: number; 
      guruP: number; 
      tendikData: Map<string, { L: number; P: number }> 
    }>();

    for (const guru of guruData) {
      if (!guru.sekolah) continue;
      const schoolName = guru.sekolah.trim();
      const jk = guru.jk?.toUpperCase() || 'L';
      const jenisTendik = (guru.jenisTendik || 'Tidak Diketahui').trim();

      if (!guruSekolah.has(schoolName)) {
        guruSekolah.set(schoolName, { 
          guruL: 0, 
          guruP: 0, 
          tendikData: new Map<string, { L: number; P: number }>() 
        });
      }
      const school = guruSekolah.get(schoolName)!;

      // Update total
      if (jk === 'L') school.guruL++;
      else if (jk === 'P') school.guruP++;

      // Update tendik data
      if (!school.tendikData.has(jenisTendik)) {
        school.tendikData.set(jenisTendik, { L: 0, P: 0 });
      }
      const tendikEntry = school.tendikData.get(jenisTendik)!;
      if (jk === 'L') tendikEntry.L++;
      else if (jk === 'P') tendikEntry.P++;
    }

    // Convert maps to arrays with class breakdown
    const processSchoolData = (
      schoolMap: Map<string, any>, 
      classRange: (number | string)[]
    ): any[] => {
      return Array.from(schoolMap.entries()).map(([namaSekolah, data]) => {
        const kelasBreakdown: Record<string, { L: number; P: number; Total: number }> = {};
        
        // Initialize all classes in range
        for (const k of classRange) {
          const kelasName = typeof k === 'string' ? k : `Kelas ${k}`;
          kelasBreakdown[kelasName] = { L: 0, P: 0, Total: 0 };
        }
        kelasBreakdown['Lainnya'] = { L: 0, P: 0, Total: 0 };

        // Fill in actual data
        data.kelasData.forEach((value: { L: number; P: number }, key: string) => {
          let kelasKey = 'Lainnya';
          
          // For TK - check for class A and B
          const keyUpper = key.toUpperCase().trim();
          if (classRange.some(k => typeof k === 'string' && k.toUpperCase() === keyUpper)) {
            kelasKey = classRange.find(k => typeof k === 'string' && k.toUpperCase() === keyUpper) as string;
          } else {
            // For numeric classes
            const classNum = parseInt(key.replace(/\D/g, ''));
            if (!isNaN(classNum)) {
              if (classRange.includes(classNum)) {
                kelasKey = `Kelas ${classNum}`;
              }
            } else if (key !== '-' && !classRange.some(k => typeof k === 'string')) {
              kelasKey = key;
            }
          }

          if (!kelasBreakdown[kelasKey]) {
            kelasBreakdown[kelasKey] = { L: 0, P: 0, Total: 0 };
          }
          kelasBreakdown[kelasKey].L += value.L;
          kelasBreakdown[kelasKey].P += value.P;
          kelasBreakdown[kelasKey].Total += value.L + value.P;
        });

        // Calculate totals for each class
        Object.keys(kelasBreakdown).forEach(k => {
          if (!kelasBreakdown[k].Total) {
            kelasBreakdown[k].Total = kelasBreakdown[k].L + kelasBreakdown[k].P;
          }
        });

        return {
          namaSekolah,
          siswaL: data.siswaL,
          siswaP: data.siswaP,
          siswaTotal: data.siswaL + data.siswaP,
          kelasBreakdown
        };
      }).sort((a, b) => b.siswaTotal - a.siswaTotal);
    };

    // Process guru data with tendik breakdown
    const guruRekap = Array.from(guruSekolah.entries()).map(([namaSekolah, data]) => {
      const tendikBreakdown: Record<string, { L: number; P: number; Total: number }> = {};
      
      // Categories for tendik
      const categories = ['Kepala Sekolah', 'Guru Tendik', 'Guru', 'Tenaga Kependidikan', 'Non Tendik', 'Tidak Diketahui'];
      
      // Initialize categories
      categories.forEach(cat => {
        tendikBreakdown[cat] = { L: 0, P: 0, Total: 0 };
      });

      // Fill in actual data
      data.tendikData.forEach((value: { L: number; P: number }, key: string) => {
        let category = key;
        
        // Normalize category names
        const keyLower = key.toLowerCase();
        if (keyLower.includes('kepala') || keyLower.includes('kep.sekolah') || keyLower.includes('ks')) {
          category = 'Kepala Sekolah';
        } else if (keyLower.includes('tenaga kependidikan') || keyLower.includes('tendik')) {
          if (keyLower.includes('non') || keyLower.includes('kependidikan')) {
            category = 'Tenaga Kependidikan';
          } else {
            category = 'Guru Tendik';
          }
        } else if (keyLower.includes('guru') && !keyLower.includes('tendik')) {
          category = 'Guru';
        } else if (keyLower.includes('non')) {
          category = 'Non Tendik';
        }

        if (!tendikBreakdown[category]) {
          tendikBreakdown[category] = { L: 0, P: 0, Total: 0 };
        }
        tendikBreakdown[category].L += value.L;
        tendikBreakdown[category].P += value.P;
        tendikBreakdown[category].Total += value.L + value.P;
      });

      return {
        namaSekolah,
        guruL: data.guruL,
        guruP: data.guruP,
        guruTotal: data.guruL + data.guruP,
        tendikBreakdown
      };
    }).sort((a, b) => b.guruTotal - a.guruTotal);

    // Calculate totals
    const calculateTotals = (schools: any[]) => {
      return schools.reduce((acc, s) => ({
        totalL: acc.totalL + s.siswaL,
        totalP: acc.totalP + s.siswaP,
        grandTotal: acc.grandTotal + s.siswaTotal
      }), { totalL: 0, totalP: 0, grandTotal: 0 });
    };

    const guruTotals = guruRekap.reduce((acc, s) => ({
      totalL: acc.totalL + s.guruL,
      totalP: acc.totalP + s.guruP,
      grandTotal: acc.grandTotal + s.guruTotal
    }), { totalL: 0, totalP: 0, grandTotal: 0 });

    return NextResponse.json({
      success: true,
      data: {
        tk: processSchoolData(tkSekolah, ['Kelas A', 'Kelas B']),
        sd: processSchoolData(sdSekolah, [1, 2, 3, 4, 5, 6]),
        smp: processSchoolData(smpSekolah, [7, 8, 9]),
        sma: processSchoolData(smaSekolah, [10, 11, 12]),
        guru: guruRekap,
        totals: {
          tk: calculateTotals(processSchoolData(tkSekolah, ['Kelas A', 'Kelas B'])),
          sd: calculateTotals(processSchoolData(sdSekolah, [1, 2, 3, 4, 5, 6])),
          smp: calculateTotals(processSchoolData(smpSekolah, [7, 8, 9])),
          sma: calculateTotals(processSchoolData(smaSekolah, [10, 11, 12])),
          guru: guruTotals
        }
      },
    });
  } catch (error) {
    console.error('Get rekapitulasi sekolah error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
