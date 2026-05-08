import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.setting.findMany();
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        siteName: settingsMap.siteName || 'Sistem Informasi Data Kecamatan Tolandona',
        siteSubtitle: settingsMap.siteSubtitle || 'Dashboard Rekapitulasi & Distribusi Data',
        primaryColor: settingsMap.primaryColor || '#10b981',
        logoUrl: settingsMap.logoUrl || '',
        footerText: settingsMap.footerText || '© 2025 Kecamatan Tolandona - Kabupaten Buton Tengah',
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteName, siteSubtitle, primaryColor, logoUrl, footerText } = body;

    const updates = [];
    
    if (siteName !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'siteName' },
          update: { value: siteName },
          create: { key: 'siteName', value: siteName },
        })
      );
    }

    if (siteSubtitle !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'siteSubtitle' },
          update: { value: siteSubtitle },
          create: { key: 'siteSubtitle', value: siteSubtitle },
        })
      );
    }

    if (primaryColor !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'primaryColor' },
          update: { value: primaryColor },
          create: { key: 'primaryColor', value: primaryColor },
        })
      );
    }

    if (logoUrl !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'logoUrl' },
          update: { value: logoUrl },
          create: { key: 'logoUrl', value: logoUrl },
        })
      );
    }

    if (footerText !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: 'footerText' },
          update: { value: footerText },
          create: { key: 'footerText', value: footerText },
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menyimpan pengaturan' },
      { status: 500 }
    );
  }
}
