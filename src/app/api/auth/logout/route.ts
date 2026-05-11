import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get user from session (simplified - in production use proper session)
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (userId) {
      await db.activityLog.create({
        data: {
          action: 'LOGOUT',
          details: 'User logged out',
          userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
