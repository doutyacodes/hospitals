import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors, appointments, users, doctorSessions } from '@/lib/db/schema';
import { eq, and, count, sum, sql, desc, gte, lte } from 'drizzle-orm';
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

    const hospitalId = decoded.hospitalId;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    // Get total doctors for this hospital
    const totalDoctorsResult = await db
      .select({ count: count() })
      .from(doctorSessions)
      .where(eq(doctorSessions.hospitalId, hospitalId));

    // Get unique doctors count
    const uniqueDoctorsResult = await db
      .select({ count: sql`COUNT(DISTINCT ${doctorSessions.doctorId})` })
      .from(doctorSessions)
      .where(eq(doctorSessions.hospitalId, hospitalId));

    // Get total appointments for this hospital
    const totalAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.hospitalId, hospitalId));

    // Get today's appointments
    const todayAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.hospitalId, hospitalId),
          eq(appointments.appointmentDate, today)
        )
      );

    // Get this month's revenue
    const revenueResult = await db
      .select({ total: sum(appointments.consultationFee) })
      .from(appointments)
      .where(
        and(
          eq(appointments.hospitalId, hospitalId),
          sql`DATE_FORMAT(${appointments.createdAt}, '%Y-%m') = ${thisMonth}`,
          eq(appointments.status, 'completed')
        )
      );

    // Get recent appointments
    const recentAppointments = await db
      .select({
        id: appointments.id,
        patientName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        doctorName: doctors.name,
        appointmentDate: appointments.appointmentDate,
        tokenNumber: appointments.tokenNumber,
        status: appointments.status,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .innerJoin(users, eq(appointments.userId, users.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.hospitalId, hospitalId))
      .orderBy(desc(appointments.createdAt))
      .limit(10);

    // Get appointment trends for the last 7 days
    const appointmentTrends = await db
      .select({
        date: appointments.appointmentDate,
        count: count(),
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.hospitalId, hospitalId),
          gte(appointments.appointmentDate, sql`DATE_SUB(CURDATE(), INTERVAL 7 DAY)`)
        )
      )
      .groupBy(appointments.appointmentDate)
      .orderBy(appointments.appointmentDate);

    return NextResponse.json({
      success: true,
      stats: {
        totalDoctors: uniqueDoctorsResult[0]?.count || 0,
        totalSessions: totalDoctorsResult[0]?.count || 0,
        totalAppointments: totalAppointmentsResult[0]?.count || 0,
        todayAppointments: todayAppointmentsResult[0]?.count || 0,
        monthlyRevenue: parseFloat(revenueResult[0]?.total || '0'),
      },
      recentAppointments,
      appointmentTrends,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}