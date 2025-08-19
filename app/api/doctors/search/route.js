import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors, specialties, hospitalDoctorAssociations } from '@/lib/db/schema';
import { eq, like, and, notInArray, or, sql } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const specialty = searchParams.get('specialty') || '';
    const hospitalId = searchParams.get('hospitalId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!hospitalId) {
      return NextResponse.json(
        { error: 'Hospital ID is required' },
        { status: 400 }
      );
    }

    // Get doctors already associated with this hospital
    const existingAssociations = await db
      .select({ doctorId: hospitalDoctorAssociations.doctorId })
      .from(hospitalDoctorAssociations)
      .where(
        and(
          eq(hospitalDoctorAssociations.hospitalId, hospitalId),
          eq(hospitalDoctorAssociations.status, 'active')
        )
      );

    const excludeDoctorIds = existingAssociations.map(a => a.doctorId);

    // Build the query conditions
    let conditions = [];
    
    // Exclude already associated doctors
    if (excludeDoctorIds.length > 0) {
      conditions.push(notInArray(doctors.id, excludeDoctorIds));
    }

    // Search by name, email, or qualification
    if (query) {
      conditions.push(
        or(
          like(doctors.name, `%${query}%`),
          like(doctors.email, `%${query}%`),
          like(doctors.qualification, `%${query}%`)
        )
      );
    }

    // Filter by specialty
    if (specialty) {
      conditions.push(eq(doctors.specialtyId, specialty));
    }

    // Only show available doctors
    conditions.push(eq(doctors.isAvailable, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get doctors with their specialty information
    const doctorResults = await db
      .select({
        id: doctors.id,
        name: doctors.name,
        email: doctors.email,
        phone: doctors.phone,
        qualification: doctors.qualification,
        experience: doctors.experience,
        bio: doctors.bio,
        image: doctors.image,
        rating: doctors.rating,
        totalReviews: doctors.totalReviews,
        consultationFee: doctors.consultationFee,
        licenseNumber: doctors.licenseNumber,
        city: doctors.city,
        state: doctors.state,
        specialtyId: doctors.specialtyId,
        specialtyName: specialties.name,
        specialtyIcon: specialties.icon,
      })
      .from(doctors)
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResults = await db
      .select({ count: sql`count(*)` })
      .from(doctors)
      .leftJoin(specialties, eq(doctors.specialtyId, specialties.id))
      .where(whereClause);

    const total = totalResults[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: doctorResults,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Doctor search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching doctors' },
      { status: 500 }
    );
  }
}