import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  doctors,
  specialties,
  hospitalDoctorAssociations,
  doctorHospitalRequests
} from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

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

    const hospitalId = payload.hospitalId;

    // Fetch all doctors with their specialties
    const allDoctors = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        email: doctors.email,
        phone: doctors.phone,
        specialtyId: doctors.specialtyId,
        specialtyName: specialties.name,
        qualification: doctors.qualification,
        experience: doctors.experience,
        bio: doctors.bio,
        licenseNumber: doctors.licenseNumber,
        consultationFee: doctors.consultationFee,
        rating: doctors.rating,
        totalReviews: doctors.totalReviews,
        imageUrl: doctors.imageUrl,
        isAvailable: doctors.isAvailable,
        status: doctors.status,
      })
      .from(doctors)
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id));

    // Fetch associations for this hospital
    const associations = await db
      .select({
        doctorId: hospitalDoctorAssociations.doctorId,
        status: hospitalDoctorAssociations.status,
      })
      .from(hospitalDoctorAssociations)
      .where(eq(hospitalDoctorAssociations.hospitalId, hospitalId));

    // Fetch pending requests for this hospital
    const requests = await db
      .select({
        doctorId: doctorHospitalRequests.doctorId,
        status: doctorHospitalRequests.status,
        requestedBy: doctorHospitalRequests.requestedBy,
      })
      .from(doctorHospitalRequests)
      .where(
        and(
          eq(doctorHospitalRequests.hospitalId, hospitalId),
          eq(doctorHospitalRequests.status, 'pending'),
          eq(doctorHospitalRequests.requestedBy, 'hospital')
        )
      );

    // Create lookup maps
    const associationMap = new Map(
      associations.map(a => [a.doctorId, a.status])
    );

    const requestMap = new Map(
      requests.map(r => [r.doctorId, r.status])
    );

    // Enrich doctors with association and request status
    const enrichedDoctors = allDoctors.map(doctor => ({
      ...doctor,
      associationStatus: associationMap.get(doctor.id) || null,
      requestStatus: requestMap.get(doctor.id) || null,
    }));

    // Sort: Active first, then pending requests, then available
    enrichedDoctors.sort((a, b) => {
      if (a.associationStatus === 'active' && b.associationStatus !== 'active') return -1;
      if (a.associationStatus !== 'active' && b.associationStatus === 'active') return 1;
      if (a.requestStatus === 'pending' && b.requestStatus !== 'pending') return -1;
      if (a.requestStatus !== 'pending' && b.requestStatus === 'pending') return 1;
      return 0;
    });

    return NextResponse.json({
      success: true,
      doctors: enrichedDoctors,
    });
  } catch (error) {
    console.error('Doctor search error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
