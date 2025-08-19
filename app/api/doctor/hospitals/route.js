import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hospitalDoctorAssociations, hospitals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
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

    // Fetch hospitals associated with the doctor
    const associatedHospitals = await db
      .select({
        id: hospitals.id,
        name: hospitals.name,
        city: hospitals.city,
        state: hospitals.state,
        address: hospitals.address,
        email: hospitals.email,
        phone: hospitals.phone,
        image: hospitals.image,
        rating: hospitals.rating,
        description: hospitals.description,
        associationStatus: hospitalDoctorAssociations.status,
        approvedAt: hospitalDoctorAssociations.approvedAt,
      })
      .from(hospitalDoctorAssociations)
      .leftJoin(hospitals, eq(hospitalDoctorAssociations.hospitalId, hospitals.id))
      .where(
        and(
          eq(hospitalDoctorAssociations.doctorId, payload.doctorId),
          eq(hospitalDoctorAssociations.status, 'active')
        )
      );

    return NextResponse.json({
      success: true,
      hospitals: associatedHospitals,
    });
  } catch (error) {
    console.error('Get doctor hospitals error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching hospitals' },
      { status: 500 }
    );
  }
}