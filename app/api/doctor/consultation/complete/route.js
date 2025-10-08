import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, doctors, medicalRecords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

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

    const { appointmentId, doctorNotes, prescription, diagnosis } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Get current time
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Get the appointment details first
    const appointmentData = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appointmentData.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointmentData[0];

    // Update appointment with completion details
    await db
      .update(appointments)
      .set({
        actualEndTime: timeStr,
        consultationEndedAt: now,
        status: 'completed',
        doctorNotes: doctorNotes || null,
        prescription: prescription || null,
        updatedAt: now,
      })
      .where(eq(appointments.id, appointmentId));

    // Create medical record only if diagnosis is provided
    let medicalRecordId = null;
    if (diagnosis) {
      medicalRecordId = nanoid();
      await db
        .insert(medicalRecords)
        .values({
          id: medicalRecordId,
          appointmentId: appointment.id,
          userId: appointment.userId,
          doctorId: decoded.doctorId,
          diagnosis,
          symptoms: appointment.patientComplaints || null,
          treatment: doctorNotes || null,
          prescription: prescription ? { text: prescription } : null,
          followUpInstructions: doctorNotes,
          isPrivate: false,
          createdAt: now,
          updatedAt: now,
        });
    }

    // Update doctor status back to online
    await db
      .update(doctors)
      .set({ status: 'online' })
      .where(eq(doctors.id, decoded.doctorId));

    return NextResponse.json({
      success: true,
      message: 'Consultation completed successfully',
      medicalRecordId,
    });
  } catch (error) {
    console.error('Complete consultation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete consultation' },
      { status: 500 }
    );
  }
}
