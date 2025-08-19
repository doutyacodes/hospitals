import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  doctorSessions, 
  doctorHospitalRequests, 
  hospitalDoctorAssociations,
  appointments,
  hospitals
} from '@/lib/db/schema';
import { eq, and, gte, count, sum, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date for today's appointments
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Get current month for earnings calculation
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch total active sessions
    const totalSessionsResult = await db
      .select({ count: count() })
      .from(doctorSessions)
      .where(
        and(
          eq(doctorSessions.doctorId, payload.doctorId),
          eq(doctorSessions.isActive, true)
        )
      );

    // Fetch today's appointments
    const todayAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, payload.doctorId),
          gte(appointments.appointmentDate, startOfDay.toISOString()),
          sql`${appointments.appointmentDate} < ${endOfDay.toISOString()}`
        )
      );

    // Fetch pending requests
    const pendingRequestsResult = await db
      .select({ count: count() })
      .from(doctorHospitalRequests)
      .where(
        and(
          eq(doctorHospitalRequests.doctorId, payload.doctorId),
          eq(doctorHospitalRequests.status, 'pending')
        )
      );

    // Fetch associated hospitals
    const associatedHospitalsResult = await db
      .select({ count: count() })
      .from(hospitalDoctorAssociations)
      .where(
        and(
          eq(hospitalDoctorAssociations.doctorId, payload.doctorId),
          eq(hospitalDoctorAssociations.status, 'active')
        )
      );

    // Fetch monthly earnings (completed appointments this month)
    const monthlyEarningsResult = await db
      .select({ 
        total: sum(appointments.consultationFee)
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, payload.doctorId),
          eq(appointments.status, 'completed'),
          gte(appointments.appointmentDate, startOfMonth.toISOString())
        )
      );

    // Fetch total unique patients (from completed appointments)
    const totalPatientsResult = await db
      .select({ 
        count: sql`COUNT(DISTINCT appointments.patient_id)`
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, payload.doctorId),
          eq(appointments.status, 'completed')
        )
      );

    const stats = {
      totalSessions: totalSessionsResult[0]?.count || 0,
      todayAppointments: todayAppointmentsResult[0]?.count || 0,
      pendingRequests: pendingRequestsResult[0]?.count || 0,
      associatedHospitals: associatedHospitalsResult[0]?.count || 0,
      monthlyEarnings: parseFloat(monthlyEarningsResult[0]?.total || 0),
      totalPatients: parseInt(totalPatientsResult[0]?.count || 0)
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Doctor dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctor dashboard stats' },
      { status: 500 }
    );
  }
}