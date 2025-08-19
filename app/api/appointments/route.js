import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments, doctors, users, specialties, doctorSessions } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, like, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    const doctorId = searchParams.get('doctorId') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = eq(appointments.hospitalId, decoded.hospitalId);

    if (status) {
      whereConditions = and(whereConditions, eq(appointments.status, status));
    }
    if (date) {
      whereConditions = and(whereConditions, eq(appointments.appointmentDate, date));
    }
    if (doctorId) {
      whereConditions = and(whereConditions, eq(appointments.doctorId, doctorId));
    }

    // Get appointments with patient and doctor details
    const appointmentsList = await db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        tokenNumber: appointments.tokenNumber,
        estimatedTime: appointments.estimatedTime,
        status: appointments.status,
        bookingType: appointments.bookingType,
        consultationFee: appointments.consultationFee,
        patientComplaints: appointments.patientComplaints,
        doctorNotes: appointments.doctorNotes,
        createdAt: appointments.createdAt,
        // Patient info
        patientId: users.id,
        patientName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        patientEmail: users.email,
        patientPhone: users.phone,
        // Doctor info
        doctorId: doctors.id,
        doctorName: doctors.name,
        doctorEmail: doctors.email,
        specialtyName: specialties.name,
        consultationFeeOriginal: doctors.consultationFee,
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.userId, users.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .where(whereConditions)
      .orderBy(desc(appointments.appointmentDate), desc(appointments.tokenNumber))
      .limit(limit)
      .offset(offset);

    // Filter by patient name if search is provided
    let filteredAppointments = appointmentsList;
    if (search) {
      filteredAppointments = appointmentsList.filter(appointment =>
        appointment.patientName.toLowerCase().includes(search.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(appointments)
      .where(whereConditions);

    // Get status summary
    const statusSummary = await db
      .select({
        status: appointments.status,
        count: sql`COUNT(*)`,
      })
      .from(appointments)
      .where(eq(appointments.hospitalId, decoded.hospitalId))
      .groupBy(appointments.status);

    return NextResponse.json({
      success: true,
      appointments: filteredAppointments,
      statusSummary,
      pagination: {
        page,
        limit,
        total: parseInt(totalCountResult[0]?.count || '0'),
        totalPages: Math.ceil(parseInt(totalCountResult[0]?.count || '0') / limit),
      },
    });
  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, status, doctorNotes, prescription, actualStartTime, actualEndTime } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'Appointment ID and status are required' },
        { status: 400 }
      );
    }

    // Update appointment
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (doctorNotes) updateData.doctorNotes = doctorNotes;
    if (prescription) updateData.prescription = prescription;
    if (actualStartTime) updateData.actualStartTime = actualStartTime;
    if (actualEndTime) updateData.actualEndTime = actualEndTime;

    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.hospitalId, decoded.hospitalId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}