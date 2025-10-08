import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors, doctorAdmins, doctorSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token.value);
    if (!decoded || decoded.userType !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get doctor status
    const doctorData = await db
      .select({
        id: doctors.id,
        status: doctors.status,
        name: doctors.name,
        isAvailable: doctors.isAvailable,
      })
      .from(doctors)
      .where(eq(doctors.id, decoded.doctorId))
      .limit(1);

    if (doctorData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctor = doctorData[0];

    // Get today's active session (if any)
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];

    const activeSessions = await db
      .select()
      .from(doctorSessions)
      .where(
        and(
          eq(doctorSessions.doctorId, decoded.doctorId),
          eq(doctorSessions.dayOfWeek, currentDay),
          eq(doctorSessions.isActive, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      success: true,
      status: doctor.status || 'offline',
      isAvailable: doctor.isAvailable,
      currentSession: activeSessions.length > 0 ? activeSessions[0] : null,
    });
  } catch (error) {
    console.error('Get doctor status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get status' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token.value);
    if (!decoded || decoded.userType !== 'doctor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, breakType, breakDuration, breakReason } = await request.json();

    // Validate status
    const validStatuses = ['online', 'consulting', 'on_break', 'emergency', 'offline'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      isAvailable: status === 'online',
      updatedAt: new Date()
    };

    // Handle break-specific data
    if (status === 'on_break') {
      updateData.breakType = breakType || 'indefinite'; // 'timed' or 'indefinite'
      updateData.breakStartTime = new Date();
      updateData.breakReason = breakReason || null;

      if (breakType === 'timed' && breakDuration) {
        // Calculate break end time
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + parseInt(breakDuration));
        updateData.breakEndTime = endTime;
      } else {
        updateData.breakEndTime = null;
      }
    } else {
      // Clear break data when not on break
      updateData.breakType = null;
      updateData.breakStartTime = null;
      updateData.breakEndTime = null;
      updateData.breakReason = null;
    }

    // Update doctor status
    await db
      .update(doctors)
      .set(updateData)
      .where(eq(doctors.id, decoded.doctorId));

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      status,
    });
  } catch (error) {
    console.error('Update doctor status error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update status' },
      { status: 500 }
    );
  }
}
