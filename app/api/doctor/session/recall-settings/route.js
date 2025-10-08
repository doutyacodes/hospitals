import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctorSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.userType !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId, recallCheckInterval, recallEnabled } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate recall interval (must be between 1 and 20)
    if (recallCheckInterval !== undefined && (recallCheckInterval < 1 || recallCheckInterval > 20)) {
      return NextResponse.json(
        { success: false, message: 'Recall interval must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Update session settings
    const updateData = {};
    if (recallCheckInterval !== undefined) {
      updateData.recallCheckInterval = recallCheckInterval;
    }
    if (recallEnabled !== undefined) {
      updateData.recallEnabled = recallEnabled;
    }
    updateData.updatedAt = new Date();

    await db
      .update(doctorSessions)
      .set(updateData)
      .where(
        and(
          eq(doctorSessions.id, sessionId),
          eq(doctorSessions.doctorId, decoded.doctorId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Recall settings updated successfully',
      settings: updateData,
    });
  } catch (error) {
    console.error('Update recall settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update recall settings' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    if (!decoded || decoded.userType !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const sessionSettings = await db
      .select({
        recallCheckInterval: doctorSessions.recallCheckInterval,
        recallEnabled: doctorSessions.recallEnabled,
      })
      .from(doctorSessions)
      .where(
        and(
          eq(doctorSessions.id, sessionId),
          eq(doctorSessions.doctorId, decoded.doctorId)
        )
      )
      .limit(1);

    if (sessionSettings.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: sessionSettings[0],
    });
  } catch (error) {
    console.error('Get recall settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get recall settings' },
      { status: 500 }
    );
  }
}
