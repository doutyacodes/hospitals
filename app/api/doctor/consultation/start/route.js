import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, doctors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

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

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get appointment details first to check if recalled
    const appt = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appt.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appt[0];

    // Get current time
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Update appointment with actual start time
    const updateData = {
      actualStartTime: timeStr,
      consultationStartedAt: now,
      missedAppointment: false, // Clear missed flag since they showed up
      updatedAt: now,
    };

    // If this was a recalled patient, mark that they attended
    if (appointment.isRecalled) {
      updateData.attendedAfterRecall = true;
    }

    await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, appointmentId));

    // Update doctor status to consulting
    await db
      .update(doctors)
      .set({ status: 'consulting' })
      .where(eq(doctors.id, decoded.doctorId));

    // Fetch the updated appointment
    const updatedAppointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Consultation started',
      appointment: updatedAppointment[0],
    });
  } catch (error) {
    console.error('Start consultation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to start consultation' },
      { status: 500 }
    );
  }
}
