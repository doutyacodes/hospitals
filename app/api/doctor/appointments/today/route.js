import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, users, doctorSessions } from '@/lib/db/schema';
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

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Fetch today's appointments for this doctor
    const todayAppointments = await db
      .select({
        id: appointments.id,
        tokenNumber: appointments.tokenNumber,
        estimatedTime: appointments.estimatedTime,
        actualStartTime: appointments.actualStartTime,
        actualEndTime: appointments.actualEndTime,
        status: appointments.status,
        patientComplaints: appointments.patientComplaints,
        doctorNotes: appointments.doctorNotes,
        appointmentDate: appointments.appointmentDate,
        patientName: users.firstName,
        patientLastName: users.lastName,
        patientEmail: users.email,
        patientPhone: users.phone,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .where(
        and(
          eq(appointments.doctorId, decoded.doctorId),
          eq(appointments.appointmentDate, todayStr)
        )
      )
      .orderBy(appointments.tokenNumber);

    // Format the appointments
    const formattedAppointments = todayAppointments.map(apt => ({
      ...apt,
      patientName: `${apt.patientName} ${apt.patientLastName || ''}`.trim(),
    }));

    // Find current token (highest completed or in-progress token)
    const completedAppointments = formattedAppointments.filter(a =>
      a.status === 'completed' || a.actualStartTime
    );
    const currentToken = completedAppointments.length > 0
      ? Math.max(...completedAppointments.map(a => a.tokenNumber))
      : 0;

    // Find active appointment (one that's started but not completed)
    const activeAppointment = formattedAppointments.find(a =>
      a.actualStartTime && !a.actualEndTime && a.status !== 'completed'
    );

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
      currentToken,
      activeAppointment: activeAppointment || null,
      totalToday: formattedAppointments.length,
      completed: formattedAppointments.filter(a => a.status === 'completed').length,
      pending: formattedAppointments.filter(a => a.status === 'confirmed').length,
    });
  } catch (error) {
    console.error('Get today appointments error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
