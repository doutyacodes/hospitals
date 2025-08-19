import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctorHospitalRequests, doctors, hospitals, specialties } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Get hospital's sent requests
export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    let whereClause = eq(doctorHospitalRequests.hospitalId, payload.hospitalId);
    
    if (status !== 'all') {
      whereClause = and(
        whereClause,
        eq(doctorHospitalRequests.status, status)
      );
    }

    const requests = await db
      .select({
        id: doctorHospitalRequests.id,
        doctorId: doctorHospitalRequests.doctorId,
        status: doctorHospitalRequests.status,
        message: doctorHospitalRequests.message,
        responseMessage: doctorHospitalRequests.responseMessage,
        requestedAt: doctorHospitalRequests.requestedAt,
        respondedAt: doctorHospitalRequests.respondedAt,
        doctorName: doctors.name,
        doctorEmail: doctors.email,
        doctorImage: doctors.image,
        doctorQualification: doctors.qualification,
        doctorExperience: doctors.experience,
        doctorRating: doctors.rating,
        doctorConsultationFee: doctors.consultationFee,
        specialtyName: specialties.name,
        specialtyIcon: specialties.icon,
      })
      .from(doctorHospitalRequests)
      .leftJoin(doctors, eq(doctorHospitalRequests.doctorId, doctors.id))
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .where(whereClause)
      .orderBy(desc(doctorHospitalRequests.requestedAt));

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('Get hospital requests error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching requests' },
      { status: 500 }
    );
  }
}

// Send request to doctor
export async function POST(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.userType !== 'hospital') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { doctorId, message } = await request.json();

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await db
      .select()
      .from(doctorHospitalRequests)
      .where(
        and(
          eq(doctorHospitalRequests.doctorId, doctorId),
          eq(doctorHospitalRequests.hospitalId, payload.hospitalId),
          eq(doctorHospitalRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      return NextResponse.json(
        { error: 'A pending request already exists for this doctor' },
        { status: 409 }
      );
    }

    // Create new request
    const requestId = nanoid();
    await db.insert(doctorHospitalRequests).values({
      id: requestId,
      doctorId,
      hospitalId: payload.hospitalId,
      requestedBy: 'hospital',
      requestorId: payload.id,
      status: 'pending',
      message: message || 'We would like to collaborate with you at our hospital.',
    });

    return NextResponse.json({
      success: true,
      message: 'Request sent successfully',
      requestId,
    });
  } catch (error) {
    console.error('Send hospital request error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the request' },
      { status: 500 }
    );
  }
}