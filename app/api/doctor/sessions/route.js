import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctorSessions, hospitals, hospitalDoctorAssociations } from '@/lib/db/schema';
import { eq, and, desc, ne } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Get doctor's sessions
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

    const sessions = await db
      .select({
        id: doctorSessions.id,
        hospitalId: doctorSessions.hospitalId,
        dayOfWeek: doctorSessions.dayOfWeek,
        startTime: doctorSessions.startTime,
        endTime: doctorSessions.endTime,
        maxTokens: doctorSessions.maxTokens,
        avgMinutesPerPatient: doctorSessions.avgMinutesPerPatient,
        isActive: doctorSessions.isActive,
        approvalStatus: doctorSessions.approvalStatus,
        notes: doctorSessions.notes,
        createdAt: doctorSessions.createdAt,
        hospitalName: hospitals.name,
        hospitalImage: hospitals.image,
        hospitalAddress: hospitals.address,
        hospitalCity: hospitals.city,
      })
      .from(doctorSessions)
      .leftJoin(hospitals, eq(doctorSessions.hospitalId, hospitals.id))
      .where(eq(doctorSessions.doctorId, payload.doctorId))
      .orderBy(desc(doctorSessions.createdAt));

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Get doctor sessions error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching sessions' },
      { status: 500 }
    );
  }
}

// Create new session
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      hospitalId,
      dayOfWeek,
      startTime,
      endTime,
      maxTokens,
      avgMinutesPerPatient,
      notes,
    } = await request.json();

    if (!hospitalId || !dayOfWeek || !startTime || !endTime || !maxTokens) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Verify doctor is associated with the hospital
    const association = await db
      .select()
      .from(hospitalDoctorAssociations)
      .where(
        and(
          eq(hospitalDoctorAssociations.doctorId, payload.doctorId),
          eq(hospitalDoctorAssociations.hospitalId, hospitalId),
          eq(hospitalDoctorAssociations.status, 'active')
        )
      )
      .limit(1);

    if (association.length === 0) {
      return NextResponse.json(
        { error: 'You are not associated with this hospital' },
        { status: 403 }
      );
    }

    // Check for session conflicts (same day)
    const conflictingSessions = await db
      .select()
      .from(doctorSessions)
      .where(
        and(
          eq(doctorSessions.doctorId, payload.doctorId),
          eq(doctorSessions.dayOfWeek, dayOfWeek),
          eq(doctorSessions.isActive, true)
        )
      );

    if (conflictingSessions.length > 0) {
      return NextResponse.json(
        { error: 'You already have a session scheduled for this day. Please choose a different day or update the existing session.' },
        { status: 409 }
      );
    }

    // Create new session
    const sessionId = nanoid();
    await db.insert(doctorSessions).values({
      id: sessionId,
      doctorId: payload.doctorId,
      hospitalId,
      dayOfWeek,
      startTime,
      endTime,
      maxTokens: parseInt(maxTokens),
      avgMinutesPerPatient: parseInt(avgMinutesPerPatient) || 15,
      isActive: true,
      approvalStatus: 'approved', // Auto-approve for simplicity
      notes,
    });

    return NextResponse.json({
      success: true,
      message: 'Session created successfully',
      sessionId,
    });
  } catch (error) {
    console.error('Create doctor session error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the session' },
      { status: 500 }
    );
  }
}

// Update session
export async function PATCH(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      sessionId,
      dayOfWeek,
      startTime,
      endTime,
      maxTokens,
      avgMinutesPerPatient,
      notes,
      isActive,
    } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to the doctor
    const session = await db
      .select()
      .from(doctorSessions)
      .where(
        and(
          eq(doctorSessions.id, sessionId),
          eq(doctorSessions.doctorId, payload.doctorId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // If changing day, check for conflicts
    if (dayOfWeek && dayOfWeek !== session[0].dayOfWeek) {
      const conflictingSessions = await db
        .select()
        .from(doctorSessions)
        .where(
          and(
            eq(doctorSessions.doctorId, payload.doctorId),
            eq(doctorSessions.dayOfWeek, dayOfWeek),
            eq(doctorSessions.isActive, true),
            ne(doctorSessions.id, sessionId) // Exclude current session
          )
        );

      if (conflictingSessions.length > 0) {
        return NextResponse.json(
          { error: 'You already have a session scheduled for this day' },
          { status: 409 }
        );
      }
    }

    // Update session
    const updateData = {};
    if (dayOfWeek) updateData.dayOfWeek = dayOfWeek;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (maxTokens) updateData.maxTokens = parseInt(maxTokens);
    if (avgMinutesPerPatient) updateData.avgMinutesPerPatient = parseInt(avgMinutesPerPatient);
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db
      .update(doctorSessions)
      .set(updateData)
      .where(eq(doctorSessions.id, sessionId));

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Update doctor session error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the session' },
      { status: 500 }
    );
  }
}