import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, hospitalCallbackQueue, tokenCallHistory } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken, generateId } from '@/lib/auth';

export async function POST(request) {
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

    const { appointmentId, reason } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Get appointment details
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appointment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appt = appointment[0];

    // Update appointment - keep status as 'confirmed' so it can be recalled
    await db
      .update(appointments)
      .set({
        missedAppointment: true,
        noShowReason: reason || 'Patient did not show up for consultation',
        tokenStatus: 'missed',
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    // Add to hospital callback queue for follow-up (optional)
    try {
      await db.insert(hospitalCallbackQueue).values({
        id: generateId(),
        appointmentId: appointmentId,
        userId: appt.userId,
        doctorId: appt.doctorId,
        hospitalId: appt.hospitalId,
        missedDate: appt.appointmentDate,
        missedTokenNumber: appt.tokenNumber,
        callbackStatus: 'pending',
        callbackAttempts: 0,
        callbackNotes: reason || 'Patient did not show up for consultation',
      });
    } catch (queueError) {
      console.warn('Failed to add to callback queue:', queueError.message);
      // Continue anyway - callback queue is optional
    }

    // Update token call history (optional)
    try {
      await db
        .update(tokenCallHistory)
        .set({
          patientAttended: false,
          skippedReason: reason || 'No-show',
        })
        .where(eq(tokenCallHistory.appointmentId, appointmentId));
    } catch (historyError) {
      console.warn('Failed to update token call history:', historyError.message);
      // Continue anyway - history is optional
    }

    return NextResponse.json({
      success: true,
      message: 'Marked as no-show',
    });
  } catch (error) {
    console.error('Mark no-show error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to mark as no-show' },
      { status: 500 }
    );
  }
}
