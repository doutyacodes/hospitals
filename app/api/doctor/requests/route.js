import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctorHospitalRequests, hospitals, hospitalDoctorAssociations } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Get doctor's received requests
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Only show requests initiated by hospitals (not by this doctor)
    let whereClause = and(
      eq(doctorHospitalRequests.doctorId, payload.doctorId),
      eq(doctorHospitalRequests.requestedBy, 'hospital')
    );

    if (status !== 'all') {
      whereClause = and(
        whereClause,
        eq(doctorHospitalRequests.status, status)
      );
    }

    const requests = await db
      .select({
        id: doctorHospitalRequests.id,
        hospitalId: doctorHospitalRequests.hospitalId,
        status: doctorHospitalRequests.status,
        message: doctorHospitalRequests.message,
        responseMessage: doctorHospitalRequests.responseMessage,
        requestedBy: doctorHospitalRequests.requestedBy,
        requestedAt: doctorHospitalRequests.requestedAt,
        respondedAt: doctorHospitalRequests.respondedAt,
        hospitalName: hospitals.name,
        hospitalEmail: hospitals.email,
        hospitalImage: hospitals.image,
        hospitalAddress: hospitals.address,
        hospitalCity: hospitals.city,
        hospitalState: hospitals.state,
        hospitalRating: hospitals.rating,
        hospitalDescription: hospitals.description,
      })
      .from(doctorHospitalRequests)
      .leftJoin(hospitals, eq(doctorHospitalRequests.hospitalId, hospitals.id))
      .where(whereClause)
      .orderBy(desc(doctorHospitalRequests.requestedAt));

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Get doctor requests error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching requests' },
      { status: 500 }
    );
  }
}

// Respond to hospital request
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

    const { requestId, status, responseMessage } = await request.json();

    if (!requestId || !status || !['approved', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid request ID and status (approved/declined) are required' },
        { status: 400 }
      );
    }

    // Get the request details
    const requestData = await db
      .select()
      .from(doctorHospitalRequests)
      .where(
        and(
          eq(doctorHospitalRequests.id, requestId),
          eq(doctorHospitalRequests.doctorId, payload.doctorId),
          eq(doctorHospitalRequests.status, 'pending')
        )
      )
      .limit(1);

    if (requestData.length === 0) {
      return NextResponse.json(
        { error: 'Request not found or already responded' },
        { status: 404 }
      );
    }

    const requestInfo = requestData[0];

    await db.transaction(async (tx) => {
      // Update the request status
      await tx
        .update(doctorHospitalRequests)
        .set({
          status,
          responseMessage,
          respondedAt: new Date(),
          respondedBy: payload.id,
        })
        .where(eq(doctorHospitalRequests.id, requestId));

      // If approved, create hospital-doctor association
      if (status === 'approved') {
        const associationId = nanoid();
        await tx.insert(hospitalDoctorAssociations).values({
          id: associationId,
          hospitalId: requestInfo.hospitalId,
          doctorId: payload.doctorId,
          status: 'active',
          approvedAt: new Date(),
          approvedBy: payload.id,
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`,
    });
  } catch (error) {
    console.error('Respond to hospital request error:', error);
    return NextResponse.json(
      { error: 'An error occurred while responding to the request' },
      { status: 500 }
    );
  }
}