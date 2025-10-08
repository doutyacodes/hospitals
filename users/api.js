import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index.js';
import { appointments } from '@/lib/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request, { params }) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details with related data (public access - no authentication required)
    const booking = await db.query.appointments.findFirst({
      where: eq(appointments.id, bookingId),
      with: {
        user: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          with: {
            specialty: true,
          },
        },
        hospital: true,
        session: true,
        payments: {
          orderBy: (payments, { desc }) => [desc(payments.createdAt)],
          limit: 1, // Get latest payment
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get current queue status if appointment is today and confirmed
    let queueStatus = null;
    const appointmentDate = new Date(booking.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    const isToday = appointmentDate.getTime() === today.getTime();

    if (isToday && booking.status === 'confirmed') {
      // Get session with current token info
      const session = await db.query.doctorSessions.findFirst({
        where: eq(appointments.sessionId, booking.sessionId),
      });

      // Get all appointments for this session today to calculate current position
      const todaysAppointments = await db.select({
        tokenNumber: appointments.tokenNumber,
        status: appointments.status,
        actualStartTime: appointments.actualStartTime,
        actualEndTime: appointments.actualEndTime,
        missedAppointment: appointments.missedAppointment,
        isRecalled: appointments.isRecalled,
      }).from(appointments)
        .where(and(
          eq(appointments.sessionId, booking.sessionId),
          eq(appointments.appointmentDate, booking.appointmentDate),
        ))
        .orderBy(appointments.tokenNumber);

      // Filter active appointments (not cancelled)
      const activeAppointments = todaysAppointments.filter(apt => apt.status !== 'cancelled');

      // Calculate current token being served from session (persisted)
      const currentToken = session?.currentToken || 0;

      // Find if current token is a recalled one
      const currentAppointment = todaysAppointments.find(apt => apt.tokenNumber === currentToken);
      const isCurrentTokenRecalled = currentAppointment?.isRecalled || false;

      // Calculate completed appointments
      const completedAppointments = activeAppointments.filter(apt =>
        apt.status === 'completed' || apt.actualEndTime
      );

      // Calculate total tokens called (includes current)
      const totalTokensCalled = currentToken > 0 ? currentToken : 0;

      // Calculate tokens ahead
      const tokensAhead = Math.max(0, booking.tokenNumber - currentToken);

      // Estimate waiting time based on average consultation time
      const avgConsultationTime = booking.session?.avgMinutesPerPatient || 15;
      const estimatedWaitingMinutes = tokensAhead * avgConsultationTime;

      // Calculate updated estimated time
      const now = new Date();
      const updatedEstimatedTime = new Date(now.getTime() + estimatedWaitingMinutes * 60000);

      // Calculate average wait time today
      const completedWithWaitTime = completedAppointments.filter(apt =>
        apt.actualStartTime && apt.actualEndTime
      );
      const averageWaitTimeMinutes = completedWithWaitTime.length > 0
        ? Math.round(completedWithWaitTime.reduce((sum, apt) => {
            const start = new Date(`2000-01-01 ${apt.actualStartTime}`);
            const end = new Date(`2000-01-01 ${apt.actualEndTime}`);
            return sum + (end - start) / 60000;
          }, 0) / completedWithWaitTime.length)
        : avgConsultationTime;

      queueStatus = {
        currentToken,
        isCurrentTokenRecalled, // NEW: Flag if current token is recalled
        tokensAhead,
        estimatedWaitingMinutes,
        updatedEstimatedTime: updatedEstimatedTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        totalTokensToday: activeAppointments.length,
        completedToday: completedAppointments.length,
        totalTokensCalled, // NEW: Total tokens called (including current)
        queuePosition: tokensAhead === 0 ? 'current' : 'waiting',
        lastUpdated: new Date().toISOString(),
        averageWaitTimeMinutes, // NEW: Average wait time today
      };
    }

    // Transform data for public viewing (exclude sensitive information)
    const publicBookingData = {
      id: booking.id,
      appointmentDate: booking.appointmentDate,
      tokenNumber: booking.tokenNumber,
      estimatedTime: booking.estimatedTime,
      actualStartTime: booking.actualStartTime,
      actualEndTime: booking.actualEndTime,
      status: booking.status,
      bookingType: booking.bookingType,
      consultationFee: booking.consultationFee,
      patientComplaints: booking.patientComplaints,
      patientName: booking.user ? `${booking.user.firstName} ${booking.user.lastName}`.trim() : null,
      createdAt: booking.createdAt,
      sessionId: booking.sessionId,
      tokenLockExpiresAt: booking.tokenLockExpiresAt,
      isToday,
      queueStatus,
      // NEW: Recall information
      isRecalled: booking.isRecalled || false,
      recallCount: booking.recallCount || 0,
      lastRecalledAt: booking.lastRecalledAt,
      missedAppointment: booking.missedAppointment || false,
      attendedAfterRecall: booking.attendedAfterRecall || false,
      user: booking.user ? {
        firstName: booking.user.firstName,
        lastName: booking.user.lastName,
      } : null,
      doctor: booking.doctor ? {
        id: booking.doctor.id,
        name: booking.doctor.name,
        specialty: booking.doctor.specialty?.name,
        image: booking.doctor.image,
        rating: booking.doctor.rating,
        qualification: booking.doctor.qualification,
        experience: booking.doctor.experience,
        status: booking.doctor.status || 'offline', // Include doctor status
        breakType: booking.doctor.breakType,
        breakEndTime: booking.doctor.breakEndTime,
        breakStartTime: booking.doctor.breakStartTime,
        breakReason: booking.doctor.breakReason,
        // Hide personal contact information for public access
      } : null,
      hospital: booking.hospital ? {
        id: booking.hospital.id,
        name: booking.hospital.name,
        address: booking.hospital.address,
        phone: booking.hospital.phone,
        image: booking.hospital.image,
        city: booking.hospital.city,
        state: booking.hospital.state,
      } : null,
      session: booking.session ? {
        id: booking.session.id,
        dayOfWeek: booking.session.dayOfWeek,
        startTime: booking.session.startTime,
        endTime: booking.session.endTime,
        maxTokens: booking.session.maxTokens,
        avgMinutesPerPatient: booking.session.avgMinutesPerPatient,
        roomNumber: booking.session.roomNumber,
        floor: booking.session.floor,
        buildingLocation: booking.session.buildingLocation,
      } : null,
      payment: booking.payments?.[0] ? {
        id: booking.payments[0].id,
        amount: booking.payments[0].amount,
        status: booking.payments[0].status,
        transactionId: booking.payments[0].transactionId,
        gateway: booking.payments[0].gateway,
        paidAt: booking.payments[0].paidAt,
        // Hide sensitive payment details
      } : null,
    };

    return NextResponse.json({
      success: true,
      booking: publicBookingData,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Get public booking status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking status' },
      { status: 500 }
    );
  }
}
