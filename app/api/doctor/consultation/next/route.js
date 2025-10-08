import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  appointments,
  doctors,
  doctorSessions,
  tokenCallHistory,
  hospitalCallbackQueue
} from '@/lib/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
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

    const today = new Date().toISOString().split('T')[0];

    // Get current session to check recall settings
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];

    const currentSession = await db
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

    if (currentSession.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active session for today' },
        { status: 404 }
      );
    }

    const session = currentSession[0];
    const recallInterval = session.recallCheckInterval || 5;
    const recallEnabled = session.recallEnabled !== false;

    // Get current token from session (persisted across reloads)
    const currentToken = session.currentToken || 0;

    // Count total completed appointments since last recall
    const completedCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, decoded.doctorId),
          eq(appointments.appointmentDate, today),
          eq(appointments.sessionId, session.id),
          eq(appointments.status, 'completed')
        )
      );

    const totalCompleted = completedCount[0]?.count || 0;
    const lastRecallAt = session.lastRecallAt || 0;

    // Check if we should recall missed tokens
    // Trigger when we've completed N more patients since last recall
    let shouldRecall = false;
    let missedTokens = [];

    if (recallEnabled && totalCompleted > 0 && (totalCompleted - lastRecallAt) >= recallInterval) {
      // Get missed appointments (not started yet, token < currentToken, marked as missed)
      missedTokens = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, decoded.doctorId),
            eq(appointments.appointmentDate, today),
            eq(appointments.sessionId, session.id),
            lt(appointments.tokenNumber, currentToken),
            sql`${appointments.actualStartTime} IS NULL`,
            eq(appointments.missedAppointment, true),
            sql`${appointments.status} != 'completed'` // Not completed
          )
        )
        .orderBy(appointments.tokenNumber);

      if (missedTokens.length > 0) {
        shouldRecall = true;
      }
    }

    // If recall needed, return the first missed token
    if (shouldRecall && missedTokens.length > 0) {
      const recallAppointment = missedTokens[0];

      // Update appointment recall info
      await db
        .update(appointments)
        .set({
          isRecalled: true,
          recallCount: sql`${appointments.recallCount} + 1`,
          lastRecalledAt: new Date(),
        })
        .where(eq(appointments.id, recallAppointment.id));

      // Update session - save that we've done a recall
      await db
        .update(doctorSessions)
        .set({
          currentToken: recallAppointment.tokenNumber,
          lastRecallAt: totalCompleted,
        })
        .where(eq(doctorSessions.id, session.id));

      // Record in token call history (optional - skip if table doesn't exist)
      try {
        await db.insert(tokenCallHistory).values({
          id: generateId(),
          sessionId: session.id,
          appointmentId: recallAppointment.id,
          appointmentDate: today,
          tokenNumber: recallAppointment.tokenNumber,
          callType: 'recall',
          isRecall: true,
          recallReason: `Auto-recall after ${totalCompleted} completed patients`,
          calledBy: decoded.id,
        });
      } catch (historyError) {
        console.warn('Failed to record token call history:', historyError.message);
        // Continue anyway - history is optional
      }

      // Update doctor status to consulting
      await db
        .update(doctors)
        .set({ status: 'consulting' })
        .where(eq(doctors.id, decoded.doctorId));

      return NextResponse.json({
        success: true,
        message: `Recalling Token #${recallAppointment.tokenNumber}`,
        tokenNumber: recallAppointment.tokenNumber,
        appointment: recallAppointment,
        isRecall: true,
        missedTokensCount: missedTokens.length,
      });
    }

    // Find next confirmed appointment for today
    const nextAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, decoded.doctorId),
          eq(appointments.appointmentDate, today),
          eq(appointments.sessionId, session.id),
          eq(appointments.status, 'confirmed'),
          sql`${appointments.tokenNumber} > ${currentToken}`
        )
      )
      .orderBy(appointments.tokenNumber)
      .limit(1);

    if (nextAppointments.length === 0) {
      // No more new appointments - check if there are missed tokens to recall
      const allMissedTokens = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, decoded.doctorId),
            eq(appointments.appointmentDate, today),
            eq(appointments.sessionId, session.id),
            sql`${appointments.actualStartTime} IS NULL`,
            eq(appointments.missedAppointment, true),
            sql`${appointments.status} != 'completed'`
          )
        )
        .orderBy(appointments.tokenNumber);

      if (allMissedTokens.length > 0) {
        // Recall the first missed token
        const recallAppointment = allMissedTokens[0];

        // Update appointment recall info
        await db
          .update(appointments)
          .set({
            isRecalled: true,
            recallCount: sql`${appointments.recallCount} + 1`,
            lastRecalledAt: new Date(),
          })
          .where(eq(appointments.id, recallAppointment.id));

        // Update session
        await db
          .update(doctorSessions)
          .set({
            currentToken: recallAppointment.tokenNumber,
          })
          .where(eq(doctorSessions.id, session.id));

        return NextResponse.json({
          success: true,
          message: `No more appointments - Recalling missed Token #${recallAppointment.tokenNumber}`,
          tokenNumber: recallAppointment.tokenNumber,
          appointment: recallAppointment,
          isRecall: true,
          missedTokensCount: allMissedTokens.length,
        });
      }

      // Truly no more appointments
      return NextResponse.json(
        { success: false, message: 'No more appointments for today' },
        { status: 404 }
      );
    }

    const nextAppointment = nextAppointments[0];

    // Update session with current token (for persistence on reload)
    await db
      .update(doctorSessions)
      .set({
        currentToken: nextAppointment.tokenNumber,
      })
      .where(eq(doctorSessions.id, session.id));

    // Record in token call history (optional - skip if table doesn't exist)
    try {
      await db.insert(tokenCallHistory).values({
        id: generateId(),
        sessionId: session.id,
        appointmentId: nextAppointment.id,
        appointmentDate: today,
        tokenNumber: nextAppointment.tokenNumber,
        callType: 'normal',
        isRecall: false,
        calledBy: decoded.id,
      });
    } catch (historyError) {
      console.warn('Failed to record token call history:', historyError.message);
      // Continue anyway - history is optional
    }

    // Update doctor status to consulting
    await db
      .update(doctors)
      .set({ status: 'consulting' })
      .where(eq(doctors.id, decoded.doctorId));

    return NextResponse.json({
      success: true,
      message: `Calling Token #${nextAppointment.tokenNumber}`,
      tokenNumber: nextAppointment.tokenNumber,
      appointment: nextAppointment,
      isRecall: false,
    });
  } catch (error) {
    console.error('Call next token error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to call next token' },
      { status: 500 }
    );
  }
}
