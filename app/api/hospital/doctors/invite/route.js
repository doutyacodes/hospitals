import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  doctorHospitalRequests,
  doctors,
  hospitals,
  hospitalDoctorAssociations
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

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

    const hospitalId = payload.hospitalId;

    // Check if doctor exists
    const doctor = await db
      .select({ id: doctors.id, name: doctors.name })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (doctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if already associated
    const existingAssociation = await db
      .select()
      .from(hospitalDoctorAssociations)
      .where(
        and(
          eq(hospitalDoctorAssociations.hospitalId, hospitalId),
          eq(hospitalDoctorAssociations.doctorId, doctorId),
          eq(hospitalDoctorAssociations.status, 'active')
        )
      )
      .limit(1);

    if (existingAssociation.length > 0) {
      return NextResponse.json(
        { error: 'Doctor is already associated with this hospital' },
        { status: 409 }
      );
    }

    // Check if there's already a pending request from hospital
    const existingRequest = await db
      .select()
      .from(doctorHospitalRequests)
      .where(
        and(
          eq(doctorHospitalRequests.hospitalId, hospitalId),
          eq(doctorHospitalRequests.doctorId, doctorId),
          eq(doctorHospitalRequests.requestedBy, 'hospital'),
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

    // Get hospital name for the request
    const hospital = await db
      .select({ name: hospitals.name })
      .from(hospitals)
      .where(eq(hospitals.id, hospitalId))
      .limit(1);

    // Create the invitation request
    const requestId = nanoid();
    await db.insert(doctorHospitalRequests).values({
      id: requestId,
      hospitalId,
      doctorId,
      requestedBy: 'hospital',
      status: 'pending',
      message: message || `${hospital[0]?.name || 'Our hospital'} would like to invite you to join.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      requestId,
    });
  } catch (error) {
    console.error('Doctor invite error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
