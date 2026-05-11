import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

// Reset admin password to admin123
export async function GET() {
  try {
    const hashedPassword = await hash('admin123', 10);
    
    // Find or create admin user
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@tolandona.go.id' },
    });

    if (existingAdmin) {
      await db.user.update({
        where: { email: 'admin@tolandona.go.id' },
        data: { password: hashedPassword },
      });
    } else {
      await db.user.create({
        data: {
          email: 'admin@tolandona.go.id',
          password: hashedPassword,
          name: 'Administrator',
          role: 'admin',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin password reset to admin123',
      credentials: {
        email: 'admin@tolandona.go.id',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Reset admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset admin password' },
      { status: 500 }
    );
  }
}

// Fix all plain text passwords
export async function POST() {
  try {
    const users = await db.user.findMany();
    let fixed = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!user.password.startsWith('$2')) {
        // It's a plain text password, hash it
        const hashedPassword = await hash(user.password, 10);
        await db.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
        fixed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} passwords`,
      total: users.length,
    });
  } catch (error) {
    console.error('Fix passwords error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix passwords' },
      { status: 500 }
    );
  }
}
